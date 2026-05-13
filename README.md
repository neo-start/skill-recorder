# Skill Recorder Monorepo

A pnpm + Turborepo monorepo for **Skill Recorder** — a Chrome extension that records browser flows and distils them into `SKILL.md` files for [Claude Code](https://docs.claude.com/claude-code).

This repo contains:

- The **Chrome extension** (`projects/skill-recorder/apps/crx`)
- The **marketing / docs website** (`projects/skill-recorder/apps/web`) — Next.js 14, next-intl, deploys to Cloudflare Pages
- Shared **workspace packages** for the SKILL.md types and renderer so both apps speak the same language

## Layout

```
skill-recorder/
├── package.json                              # pnpm + turbo orchestrator (no app code)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .nvmrc                                    # Node 20.11.1
├── packages/
│   ├── skill-types/                          # @skill-recorder/types — pure type defs
│   └── skill-render/                         # @skill-recorder/render — renderSkillAsMarkdown
└── projects/
    └── skill-recorder/
        └── apps/
            ├── crx/                          # @skill-recorder/crx (Chrome MV3, Vite + CRXJS)
            │   └── src/
            │       ├── manifest.ts
            │       ├── common/{db,messages,selector,skill-export}.ts
            │       ├── stores/               # MobX stores
            │       └── modules/{background,content,sidepanel,player}/
            └── web/                          # @skill-recorder/web (Next.js 14 + next-intl)
                ├── messages/{en,zh}.json
                ├── content/
                │   ├── docs/{en,zh}/*.md
                │   └── changelog/*.md
                └── src/
                    ├── app/[locale]/         # landing, pricing, docs, changelog, legal
                    ├── components/
                    ├── lib/
                    └── styles/
```

## Quick start

Prereqs: Node 20.11.1 (`nvm use`), pnpm ≥ 10.

```bash
pnpm install            # installs every workspace
pnpm dev                # runs turbo dev — web on :3000, crx vite watch
pnpm build              # builds everything respecting the graph
pnpm typecheck          # tsc -b across every workspace
```

Per-app:

```bash
pnpm --filter @skill-recorder/web dev          # web only
pnpm --filter @skill-recorder/crx build        # produces apps/crx/dist/
```

## Loading the extension locally

```bash
pnpm --filter @skill-recorder/crx build
```

Then in Chrome: `chrome://extensions` → toggle **Developer mode** → **Load unpacked** → select `projects/skill-recorder/apps/crx/dist/`. The icon opens the side panel.

For HMR during extension development:

```bash
pnpm --filter @skill-recorder/crx dev
```

…and load `projects/skill-recorder/apps/crx/dist/` once; the CRXJS plugin handles reload on file change.

## Web app

```bash
pnpm --filter @skill-recorder/web dev
# → http://localhost:3000  (EN)
# → http://localhost:3000/zh  (ZH)
```

Production build for Cloudflare Pages:

```bash
pnpm --filter @skill-recorder/web build
pnpm --filter @skill-recorder/web pages:build
pnpm --filter @skill-recorder/web pages:dev      # serve the built output locally via wrangler
```

### Pages routes

| Route | Source |
|---|---|
| `/` and `/zh` | `src/app/[locale]/page.tsx` — landing |
| `/pricing` | `src/app/[locale]/pricing/page.tsx` — placeholder pricing tiers |
| `/docs/<slug>` | `src/app/[locale]/docs/[[...slug]]/page.tsx` — MDX from `content/docs/{locale}/*.md` |
| `/changelog` | `src/app/[locale]/changelog/page.tsx` — entries from `content/changelog/*.md` |
| `/privacy`, `/terms` | inline-translated legal pages |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | generated via Next 14 file conventions |

i18n: routes auto-detect `Accept-Language` and default to `/en`. Switch via the locale pill in the navbar.

## Deployment

### Cloudflare Pages (web)

CI workflow: `.github/workflows/web-deploy.yml`

Required GitHub secrets/vars on the repo:

| Name | Type | Notes |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | secret | Token with Pages:Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | secret | Your account id |
| `NEXT_PUBLIC_SITE_URL` | variable | e.g. `https://skill-recorder.dev` |
| `NEXT_PUBLIC_POSTHOG_KEY` | variable (optional) | PostHog public project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | variable (optional) | Self-hosted PostHog URL if any |

The workflow runs on every push to `main` that touches `packages/**` or `projects/skill-recorder/apps/web/**`, and also on PRs (Cloudflare preview deployments).

### Chrome extension release

`.github/workflows/crx-release.yml` builds and zips on any tag matching `crx-v*`, then attaches the zip to a GitHub Release. Chrome Web Store auto-publish is out of scope today; pull the zip and upload manually.

## Shared packages

| Package | Imported by | Purpose |
|---|---|---|
| `@skill-recorder/types` | crx, web, render | All `Skill`, `SkillStep`, `ActionStep`, `SelectorEntry`, `SkillAuthHint` type definitions |
| `@skill-recorder/render` | crx (Save-as-Skill dialog), web (landing-page live preview) | Pure `renderSkillAsMarkdown(skill: Skill): string` — no DOM, no Chrome APIs |

Imports are wired via `workspace:*`; TypeScript resolves the source directly through `package.json#exports` so there's no separate build step for the packages — they ship as `.ts` and the consuming app's bundler (Vite or Next) compiles them.

## Tooling versions

- **Node** 20.11.1 (`.nvmrc`)
- **pnpm** 10.x
- **Turbo** 2.5.x
- **TypeScript** 5.x strict
- **Next.js** 14.2.x with App Router
- **React** 18.3
- **styled-components** 6 (both apps)
- **next-intl** 3.26
- **@cloudflare/next-on-pages** 1.13
- **Vite** 5 + **@crxjs/vite-plugin** 2 (CRX only)

## License

MIT.
