#!/usr/bin/env bash
#
# Bring up WebArena services on a fresh machine.
#
# Upstream WebArena distributes its environment as .tar Docker images hosted on
# CMU's server (with Google Drive / Archive.org mirrors). There is *no*
# docker-compose.yml — each service is downloaded, `docker load`ed, then run
# with per-service port + base-url rewrites. This script wraps all of that.
#
# Usage:
#   ./setup-webarena.sh up            # download (if needed) + load + run all enabled services
#   ./setup-webarena.sh down           # stop + remove containers (images stay cached)
#   ./setup-webarena.sh status         # show what's running
#   ./setup-webarena.sh reset reddit   # destroy + recreate one service (clean state for next trial)
#   ./setup-webarena.sh clean          # nuke containers AND tar cache (frees ~16GB)
#
# Services controlled by env vars (default = ON for the 4 we use; wiki+map OFF
# because Wikipedia ZIM is ~80GB and we're not using map tasks in the MVP):
#   WEBARENA_SHOPPING=1
#   WEBARENA_SHOPPING_ADMIN=1
#   WEBARENA_REDDIT=1
#   WEBARENA_GITLAB=1
#   WEBARENA_WIKIPEDIA=0
#   WEBARENA_MAP=0
#
# Apple Silicon: images are linux/amd64 only — Docker Desktop emulates via
# Rosetta. GitLab will be noticeably slow (~2 min cold boot vs ~30s on AMD64).

set -euo pipefail

# ---------- config ----------

HOST="${WEBARENA_HOST:-localhost}"
TAR_DIR="${WEBARENA_TAR_DIR:-$HOME/.cache/webarena}"
MIRROR="${WEBARENA_MIRROR:-http://metis.lti.cs.cmu.edu/webarena-images}"

PLATFORM_FLAG=""
if [[ "$(uname -m)" == "arm64" ]]; then
  PLATFORM_FLAG="--platform=linux/amd64"
  echo "[setup] detected Apple Silicon — using --platform=linux/amd64 (Rosetta emulation)"
fi

# Per-service config: name|image|tar|port|enabled_var
# "enabled_var" is the name of an env var (default 1 unless overridden above).
SERVICES=(
  "shopping|shopping_final_0712|shopping_final_0712.tar|7770|WEBARENA_SHOPPING"
  "shopping_admin|shopping_admin_final_0719|shopping_admin_final_0719.tar|7780|WEBARENA_SHOPPING_ADMIN"
  "forum|postmill-populated-exposed-withimg|postmill-populated-exposed-withimg.tar|9999|WEBARENA_REDDIT"
  "gitlab|gitlab-populated-final-port8023|gitlab-populated-final-port8023.tar|8023|WEBARENA_GITLAB"
)

is_enabled() {
  local var="$1"
  local val="${!var:-1}"
  [[ "$val" == "1" ]]
}

# ---------- helpers ----------

download_tar() {
  local tar="$1"
  local dest="$TAR_DIR/$tar"
  if [[ -f "$dest" ]]; then
    echo "[setup] cached: $dest"
    return
  fi
  mkdir -p "$TAR_DIR"
  local url="$MIRROR/$tar"
  echo "[setup] downloading $url"
  echo "[setup]   → $dest (this is large — several GB — and may take a while)"
  curl -fL --progress-bar -C - -o "$dest.partial" "$url"
  mv "$dest.partial" "$dest"
}

load_image() {
  local tar="$1" image="$2"
  if docker image inspect "$image" >/dev/null 2>&1; then
    echo "[setup] image already loaded: $image"
    return
  fi
  echo "[setup] docker load $tar"
  docker load --input "$TAR_DIR/$tar"
}

container_exists() { docker ps -a --format '{{.Names}}' | grep -qx "$1"; }
container_running() { docker ps --format '{{.Names}}' | grep -qx "$1"; }

start_shopping_like() {
  # Magento-based services need a base-url rewrite + cache flush after boot.
  local name="$1" image="$2" port="$3"
  if container_exists "$name"; then
    container_running "$name" && { echo "[setup] $name already running"; return; }
    docker start "$name"
    return
  fi
  echo "[setup] docker run $name (port $port)"
  docker run $PLATFORM_FLAG --name "$name" -p "$port:80" -d "$image"
  # Wait for Magento to settle before mucking with the DB.
  echo "[setup] waiting 20s for Magento boot..."
  sleep 20
  docker exec "$name" /var/www/magento2/bin/magento setup:store-config:set --base-url="http://$HOST:$port" || true
  docker exec "$name" mysql -u magentouser -pMyPassword magentodb \
    -e "UPDATE core_config_data SET value='http://$HOST:$port/' WHERE path = 'web/secure/base_url';" || true
  docker exec "$name" /var/www/magento2/bin/magento cache:flush || true
}

start_forum() {
  local name="$1" image="$2" port="$3"
  if container_exists "$name"; then
    container_running "$name" && { echo "[setup] $name already running"; return; }
    docker start "$name"; return
  fi
  echo "[setup] docker run $name (port $port)"
  docker run $PLATFORM_FLAG --name "$name" -p "$port:80" -d "$image"
}

start_gitlab() {
  local name="$1" image="$2" port="$3"
  if container_exists "$name"; then
    container_running "$name" && { echo "[setup] $name already running"; return; }
    docker start "$name"; return
  fi
  echo "[setup] docker run $name (port $port)"
  docker run $PLATFORM_FLAG --name "$name" -d -p "$port:$port" "$image" \
    /opt/gitlab/embedded/bin/runsvdir-start
  echo "[setup] GitLab boot (~2 min on Apple Silicon)..."
  sleep 60
  docker exec "$name" sed -i "s|^external_url.*|external_url 'http://$HOST:$port'|" /etc/gitlab/gitlab.rb || true
  docker exec "$name" gitlab-ctl reconfigure || true
}

# ---------- subcommands ----------

cmd_up() {
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name image tar port enabled_var <<<"$row"
    is_enabled "$enabled_var" || { echo "[setup] skipping $name ($enabled_var=0)"; continue; }

    download_tar "$tar"
    load_image "$tar" "$image"

    case "$name" in
      shopping|shopping_admin) start_shopping_like "$name" "$image" "$port" ;;
      forum) start_forum "$name" "$image" "$port" ;;
      gitlab) start_gitlab "$name" "$image" "$port" ;;
      *) echo "[setup] unknown service: $name" >&2; exit 1 ;;
    esac
  done
  echo "[setup] all enabled services up. Smoke:"
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name _ _ port enabled_var <<<"$row"
    is_enabled "$enabled_var" && echo "  curl -sI http://$HOST:$port | head -1"
  done
}

cmd_down() {
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name _ _ _ _ <<<"$row"
    if container_exists "$name"; then
      docker rm -f "$name" >/dev/null && echo "[setup] removed $name"
    fi
  done
}

cmd_status() {
  printf '%-20s %-10s %s\n' SERVICE STATUS URL
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name _ _ port _ <<<"$row"
    if container_running "$name"; then
      printf '%-20s %-10s http://%s:%s\n' "$name" "running" "$HOST" "$port"
    elif container_exists "$name"; then
      printf '%-20s %-10s http://%s:%s\n' "$name" "stopped" "$HOST" "$port"
    else
      printf '%-20s %-10s -\n' "$name" "absent"
    fi
  done
}

cmd_reset() {
  local target="${1:-}"
  [[ -n "$target" ]] || { echo "usage: $0 reset <service>" >&2; exit 64; }
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name image _ port _ <<<"$row"
    if [[ "$name" == "$target" ]]; then
      docker rm -f "$name" >/dev/null 2>&1 || true
      case "$name" in
        shopping|shopping_admin) start_shopping_like "$name" "$image" "$port" ;;
        forum) start_forum "$name" "$image" "$port" ;;
        gitlab) start_gitlab "$name" "$image" "$port" ;;
      esac
      echo "[setup] reset complete: $name"
      return
    fi
  done
  echo "[setup] unknown service: $target" >&2
  exit 64
}

cmd_clean() {
  cmd_down
  echo "[setup] removing tar cache at $TAR_DIR"
  rm -rf "$TAR_DIR"
}

# ---------- entry ----------

cmd="${1:-up}"; shift || true
case "$cmd" in
  up) cmd_up "$@" ;;
  down) cmd_down "$@" ;;
  status) cmd_status "$@" ;;
  reset) cmd_reset "$@" ;;
  clean) cmd_clean "$@" ;;
  -h|--help|help) sed -n '1,40p' "$0" ;;
  *) echo "unknown command: $cmd" >&2; exit 64 ;;
esac
