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

# Per-service config: name|image|tar|port|enabled_var|default_enabled|tar_size_gb
# Only shopping_admin is enabled by default — the other tars are huge (see
# table below) and downloading them all needs ~390 GB free (tar + docker
# overlay). Flip the env vars (WEBARENA_SHOPPING=1 etc.) to opt back in.
#
# Real per-service sizes (measured from CMU server Content-Length, 2026-05):
#   shopping        : 62.9 GB tar
#   shopping_admin  :  9.0 GB tar   ← MVP default
#   forum (reddit)  : 49.8 GB tar
#   gitlab          : 72.4 GB tar
# An old README claim of "~16GB total" was wrong; verify via Content-Length
# before adding a service to the default-on list.
SERVICES=(
  "shopping|shopping_final_0712|shopping_final_0712.tar|7770|WEBARENA_SHOPPING|0|62.9"
  "shopping_admin|shopping_admin_final_0719|shopping_admin_final_0719.tar|7780|WEBARENA_SHOPPING_ADMIN|1|9.0"
  "forum|postmill-populated-exposed-withimg|postmill-populated-exposed-withimg.tar|9999|WEBARENA_REDDIT|0|49.8"
  "gitlab|gitlab-populated-final-port8023|gitlab-populated-final-port8023.tar|8023|WEBARENA_GITLAB|0|72.4"
)

is_enabled() {
  local var="$1" default="$2"
  local val="${!var:-$default}"
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

preflight_disk_check() {
  # Sum tar sizes for enabled services; warn if free disk < 2.2x sum
  # (1x for the tar, ~1x for the loaded docker image, 0.2x slack).
  local need_gb=0
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r _ _ _ _ enabled_var default tar_gb <<<"$row"
    is_enabled "$enabled_var" "$default" || continue
    need_gb=$(awk "BEGIN {print $need_gb + $tar_gb}")
  done
  local free_gb
  free_gb=$(df -g "$TAR_DIR" 2>/dev/null | awk 'NR==2 {print $4}')
  [[ -z "$free_gb" ]] && return
  local headroom_gb
  headroom_gb=$(awk "BEGIN {print $need_gb * 2.2}")
  echo "[setup] enabled services need ~${need_gb} GB tar + ~${need_gb} GB Docker overlay"
  echo "[setup] free space at $TAR_DIR: ${free_gb} GB"
  if (( $(awk "BEGIN {print ($free_gb < $headroom_gb) ? 1 : 0}") )); then
    echo "[setup] WARNING: free < 2.2x estimated need (${headroom_gb} GB). Press Ctrl-C to abort, or wait 5s to continue."
    sleep 5
  fi
}

cmd_up() {
  preflight_disk_check
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name image tar port enabled_var default tar_gb <<<"$row"
    if ! is_enabled "$enabled_var" "$default"; then
      echo "[setup] skipping $name (${tar_gb} GB tar; set $enabled_var=1 to enable)"
      continue
    fi

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
    IFS='|' read -r name _ _ port enabled_var default _ <<<"$row"
    is_enabled "$enabled_var" "$default" && echo "  curl -sI http://$HOST:$port | head -1"
  done
}

cmd_down() {
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name _ _ _ _ _ _ <<<"$row"
    if container_exists "$name"; then
      docker rm -f "$name" >/dev/null && echo "[setup] removed $name"
    fi
  done
}

cmd_status() {
  printf '%-18s %-10s %-9s %s\n' SERVICE STATUS TAR_GB URL
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name _ _ port _ _ tar_gb <<<"$row"
    if container_running "$name"; then
      printf '%-18s %-10s %-9s http://%s:%s\n' "$name" "running" "$tar_gb" "$HOST" "$port"
    elif container_exists "$name"; then
      printf '%-18s %-10s %-9s http://%s:%s\n' "$name" "stopped" "$tar_gb" "$HOST" "$port"
    else
      printf '%-18s %-10s %-9s -\n' "$name" "absent" "$tar_gb"
    fi
  done
}

cmd_reset() {
  local target="${1:-}"
  [[ -n "$target" ]] || { echo "usage: $0 reset <service>" >&2; exit 64; }
  for row in "${SERVICES[@]}"; do
    IFS='|' read -r name image _ port _ _ _ <<<"$row"
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
