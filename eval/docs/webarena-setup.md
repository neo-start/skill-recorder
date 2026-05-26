# WebArena Docker setup

WebArena ships pre-built `.tar` Docker images on CMU's server. There is **no**
`docker-compose.yml` upstream — each service is downloaded, `docker load`ed,
then run with per-service port + base-url rewrites. `eval/docker/setup-webarena.sh`
wraps all of that.

## TL;DR (MVP scope)

```bash
cd eval
./docker/setup-webarena.sh up        # downloads + loads + runs shopping_admin only
./docker/setup-webarena.sh status    # confirm it's healthy
```

Default is **shopping_admin only**. Other services are opt-in via env vars
because their tars are **huge** (see size table below) and the four-service
sum needs ~390 GB free disk (tar + Docker overlay + slack).

## Real tar sizes (measured from CMU Content-Length, 2026-05)

| Service | Tar | Loaded image (~equal) | Default | Why |
|---|---|---|---|---|
| `shopping`        | 62.9 GB | ~63 GB | OFF | huge; OneStopShop catalog + history |
| **`shopping_admin`** | **9.0 GB** | **~9 GB** | **ON** | Magento back-office; smallest |
| `forum` (reddit)  | 49.8 GB | ~50 GB | OFF | populated Postmill |
| `gitlab`          | 72.4 GB | ~72 GB | OFF | populated GitLab |
| `wikipedia` (ZIM) | ~80 GB  | n/a    | OFF | full English Wikipedia snapshot |
| `map`             | varies  | varies | OFF | needs separate compose, complex |

Note: A previous version of this doc claimed "~22GB total." That number was
wrong. Always verify with `curl -sI <url> | grep -i content-length` before
trusting a setup-cost estimate.

## Opting more services in

```bash
WEBARENA_SHOPPING=1 WEBARENA_REDDIT=1 ./docker/setup-webarena.sh up
```

The script's `preflight_disk_check` will warn if free disk < 2.2× the
enabled-services tar sum.

## State reset between trials

Several services *mutate* (Postmill posts, GitLab issues, Magento orders).
Reward functions are reset-sensitive — if a previous trial created `Order #42`,
the next reward function looking for "the most recent order" can now find two.

```bash
# Heavyweight (drops volumes, re-imports fixtures):
./docker/setup-webarena.sh down && ./docker/setup-webarena.sh up

# Lightweight per-service:
./docker/setup-webarena.sh reset shopping_admin
```

The runner (`src/runner.py`) does NOT yet reset automatically between trials —
add a `subprocess.run(["./docker/setup-webarena.sh", "reset", domain])` in the
inner loop once the eval is actually running, otherwise trial N+1 inherits
trial N's mutations.

## Apple Silicon caveat

WebArena images are AMD64 only. The script auto-detects `arm64` and adds
`--platform=linux/amd64`, falling back to Docker Desktop's Rosetta
emulation. Magento (`shopping_admin`) is acceptable under Rosetta — ~2× slower
than native; GitLab is painful (~2 min cold boot vs ~30 s native).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop not running | Start Docker.app on macOS |
| `port is already allocated` | Some other service on 7780/9999/etc. | Stop the offender, or edit the SERVICES table |
| Reset feels stuck | Volume not removed | `docker volume ls` → `docker volume rm <stale>` |
| Reward signal flaky after several trials | State drift accumulating | Full `down && up`, not just `reset` |
| Slow first request after boot | Magento cache cold | Hit any URL once to warm cache before the first trial |
