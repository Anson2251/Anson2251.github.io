# Anson2251.github.io

Source for [ansonate.ink](https://ansonate.ink) and [blogs.ansonate.ink](https://blogs.ansonate.ink).

| Directory | Content | Domain |
|:----------|:--------|:-------|
| `landing/` | Landing page, plain Astro | `ansonate.ink` |
| `blog/` | Blog, Astro with the Fuwari theme | `blogs.ansonate.ink` |

Each directory is its own Cloudflare Pages project with its own build (`pnpm build` to `dist/`). See `blog/README.md` for the blog's frontmatter, translations and differences from stock Fuwari, and `landing/README.md` for the landing page data files.

| Pages project | Root directory | Build command | Output |
|:--------------|:---------------|:--------------|:-------|
| Landing | `landing` | `pnpm build` | `dist` |
| Blog | `blog` | `pnpm build` | `dist` |

Set `NODE_VERSION` to `22` or newer in both Pages projects. GitHub Actions in `.github/workflows/` run build (and, for the blog, Astro/Biome) checks; Pages handles deployment.

The landing page has two routes: `/` (recent writing plus an apps preview) and `/apps` (the full apps index). `apps.ansonate.ink` is a Cloudflare Redirect Rule (301) to `https://ansonate.ink/apps`; domain-level redirects are not supported in Pages `_redirects`.

The blog moved off Jekyll; `public/_redirects` in each app maps the old Jekyll post URLs to current slugs. The old Jekyll sources are gone from the repo; keep `CNAME` only if you still want GitHub Pages to redirect `anson2251.github.io` to `ansonate.ink`.

Blog posts are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Site code is MIT. The blog theme is [Fuwari](https://github.com/saicaca/fuwari) by saicaca (MIT, see `blog/LICENSE`).
