# Anson2251.github.io

Source for [ansonate.ink](https://ansonate.ink) and [blog.ansonate.ink](https://blog.ansonate.ink).

| Directory | Content | Domain |
|:----------|:--------|:-------|
| `landing/` | Landing page, plain Astro | `ansonate.ink` |
| `blog/` | Blog, Astro with the Fuwari theme | `blog.ansonate.ink` |

Each directory is its own Cloudflare Pages project with its own build (`pnpm build` to `dist/`). See `blog/README.md` for the blog's frontmatter, translations and differences from stock Fuwari, and `landing/README.md` for the landing page data files.

| Pages project | Root directory | Build command | Output |
|:--------------|:---------------|:--------------|:-------|
| Landing | `landing` | `pnpm build` | `dist` |
| Blog | `blog` | `pnpm build` | `dist` |

Set `NODE_VERSION` to `22` or newer in both Pages projects. GitHub Actions in `.github/workflows/` run build (and, for the blog, Astro/Biome) checks; Pages handles deployment.

The landing page has two routes: `/` (recent writing plus an apps preview) and `/apps` (the full apps index). `apps.ansonate.ink` is a Cloudflare Redirect Rule (301) to `https://ansonate.ink/apps`; domain-level redirects are not supported in Pages `_redirects`.

The small apps stay on GitHub Pages at `dev.ansonate.ink/<repo>/`. The landing page links there directly, and `landing/public/_redirects` 301s the old `ansonate.ink/<app>/*` paths to the new host.

The GitHub Pages user site is published from `docs/` (Pages source: `main` / `/docs`). It redirects `dev.ansonate.ink/` to `https://ansonate.ink/apps`; the project sites stay under `dev.ansonate.ink/<repo>/`. No workflow is needed - Pages publishes the folder directly.

The blog moved off Jekyll; `public/_redirects` in each app maps the old Jekyll post URLs to current slugs. The old Jekyll sources are gone from the repo.

Blog posts are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Site code is MIT. The blog theme is [Fuwari](https://github.com/saicaca/fuwari) by saicaca (MIT, see `blog/LICENSE`).
