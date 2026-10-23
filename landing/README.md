# Landing page

Astro site for [ansonate.ink](https://ansonate.ink): recent writing, the apps preview, and the full apps index at `/apps`.

## Development

Requires Node.js >= 22 and pnpm >= 9.

| Command | Action |
|:--------|:-------|
| `pnpm install` | Installs dependencies |
| `pnpm dev` | Syncs posts, then starts the dev server at `localhost:4321` |
| `pnpm build` | Syncs posts, then builds to `./dist` |
| `pnpm preview` | Previews the build locally |
| `pnpm sync-posts` | Regenerates `src/data/posts.json` without starting a server |

## Content

- **Recent writing** — `scripts/sync-posts.mjs` reads `../blog/src/content/posts`, drops drafts and anything carrying a tag in `EXCLUDE_TAGS`, collapses EN/ZH twins (preferring English), sorts by `published`, and writes `src/data/posts.json` (gitignored). Edit `RECENT_COUNT` and `EXCLUDE_TAGS` at the top of that script.
- **Apps** — `src/data/apps.ts`. Add one object per app. `tags` drive the filter chips, `featured` entries sort first and get a larger card on `/apps`, and `hue` controls the generated cover. `status` is `live`, `wip`, or `archived`.
- **Copy and links** — `src/data/site.ts`.

The apps host is a shortcut. `apps.ansonate.ink` should be a Cloudflare Redirect Rule (301) to `https://ansonate.ink/apps`. Cloudflare Pages `_redirects` does not support domain-level redirects, so this is configured in the Cloudflare dashboard, not in this repo.
