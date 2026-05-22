# WebArena Docker setup

WebArena ships five self-contained Docker images. Bringing them up locally is the **only** external dependency for our eval (no SaaS account, no cloud).

## TL;DR

```bash
cd eval/docker
docker compose up -d
# wait ~3 minutes for first boot, ~30s on subsequent runs
docker compose ps   # all five should be "healthy" or "running"
```

After that, the URLs in `eval/.env.example` are valid and you can run `python -m src.runner --smoke`.

## What gets started

| Service | Port | Image (official WebArena tag) | Purpose |
|---|---|---|---|
| `shopping`        | 7770 | `webarena/shopping`         | Magento One Stop Market |
| `shopping_admin`  | 7780 | `webarena/shopping_admin`   | Magento back-office |
| `reddit`          | 9999 | `webarena/postmill-populated` | Reddit-style forum (Postmill) |
| `gitlab`          | 8023 | `webarena/gitlab-populated` | Self-hosted GitLab |
| `wikipedia`       | 8888 | `webarena/wikipedia`        | Wiki snapshot |
| `map`             | 3000 | `webarena/openstreetmap`    | OpenStreetMap tiles |
| `homepage`        | 4399 | `webarena/homepage`         | Index page linking all services |

Image versions and the canonical compose file are tracked at
<https://github.com/web-arena-x/webarena/blob/main/environment_docker/README.md>. Pin to the same SHA the WebArena paper used (commit `1da40d5` as of the original release) for reproducibility.

## Disk + memory

- ~**22 GB** total on disk after pull.
- Each container's RAM ceiling is tiny (~512 MB) except GitLab (**~4 GB working set**).
- Recommend at least **8 GB free RAM** while the stack runs.

## State reset between trials

Several services *mutate* (Postmill posts, GitLab issues, Magento orders). Reward functions are reset-sensitive — if the previous trial created `Issue #42`, the next reward function looking for "the open issue" can now find two.

WebArena's recommended pattern is **container restart**:

```bash
# Heavyweight (drops volumes, re-imports fixtures, ~3 min):
docker compose down -v && docker compose up -d

# Lightweight per-service (most tasks only touch one of the apps):
docker compose restart reddit
```

The runner (`src/runner.py`) will call this per-trial once WebArena env wiring is done — see the TODO in `run_single_trial`. Until then, reset manually before each smoke run.

## Provisioning script (not yet written)

`eval/docker/docker-compose.yml` is **not yet committed** — generating it requires picking concrete image tags and tuning ports. Next-step todo: copy the canonical compose file from upstream into this repo and pin tags.

Until that's in place, the fastest path is:

```bash
git clone https://github.com/web-arena-x/webarena ~/tmp/webarena
cd ~/tmp/webarena/environment_docker
docker compose up -d
```

…then point our `.env` at `localhost:<port>` per the table above. We'll mirror the compose file into `eval/docker/` once we've decided which task subset we're using (some containers are not needed if the 10 chosen tasks all live in 2-3 of the apps).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop not running | Start Docker.app on macOS |
| GitLab returns 502 for ~2 minutes after boot | GitLab is reindexing — startup is slow | Wait; `docker compose logs -f gitlab` for confirmation |
| `port is already allocated` | Some other service is on 3000/7770/etc. | Edit compose to remap or stop the offender |
| Reset feels stuck | A volume isn't being removed; `docker compose down -v` skipped | `docker volume ls` → `docker volume rm <stale>` |
| Reward signal flaky after several trials | State drift accumulating | Do a full `down -v && up -d` instead of restart |
