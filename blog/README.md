# Anson2251's Blog

Personal blog built with [Astro](https://astro.build) using the [Fuwari](https://github.com/saicaca/fuwari) theme. Deployed on Cloudflare Pages at [blog.ansonate.ink](https://blog.ansonate.ink). The landing page at [ansonate.ink](https://ansonate.ink) lives in `landing/` in the same repository.

## Local development

Requires Node.js >= 20 and pnpm >= 9.

| Command | Action |
|:--------|:-------|
| `pnpm install` | Installs dependencies |
| `pnpm dev` | Starts local dev server at `localhost:4321` |
| `pnpm build` | Builds the production site to `./dist/` (runs Pagefind indexing after) |
| `pnpm preview` | Previews the build locally before deploying |
| `pnpm check` | Runs checks for errors in the code |
| `pnpm format` | Formats the code using Biome |
| `pnpm new-post <filename>` | Creates a new post |

Edit `src/config.ts` to change site title, profile, navigation and theme color. Edit `astro.config.mjs` to change the site URL.

## Frontmatter

```yaml
---
title: My Post
published: 2026-10-07
description: What the post is about.
tags: [Tag One, Tag Two]
category: Category
lang: en
translationKey: my-post   # same value on both language versions to link them
draft: false
---
```

Posts live in `src/content/posts/`. Post images live in `src/assets/posts/<post-slug>/` and are referenced with relative paths (`![](../../assets/posts/<post-slug>/figure.png)`) so Astro optimizes them at build time. The only files served from `public/assets/` are downloads linked directly, such as dataset archives.

Set `draft: true` to hide a post from production builds.

## Translations

The site default language is English (`en` in `src/config.ts`, baked into the HTML at build time). The ZH / EN selector in the navbar (and mobile menu) switches the page language at runtime: it swaps the UI chrome to Chinese / English (persisted in `localStorage` as `site-lang`), filters listings to that language, and — when reading a post with a translation — jumps straight to the translated post.

A post with a second language version is a second file sharing the same `translationKey` (e.g. `my-post.md` and `my-post-en.md` share `translationKey: my-post`). The post page renders a language switcher and `hreflang` alternate links from that key. Posts without a key render no switcher.

Listings (home, archive) collapse twins: with the default English preference only one version per key shows, preferring English and falling back to whatever exists. The All / ZH / EN selector in the navbar (and mobile menu) switches the preference; it persists in `localStorage`. Prev/next navigation stays within one language. Search covers both languages.

## Differences from stock Fuwari

- `src/plugins/remark-mermaid.mjs`: converts ```` ```mermaid ```` fences into plain `<pre>` blocks before syntax highlighting sees them, and the layout renders them with Mermaid loaded from CDN. The diagram theme follows Fuwari's light/dark mode and re-renders when it flips. Nothing is fetched on pages without diagrams.
- `public/_redirects`: maps the old Jekyll URLs (category and date segments, `.html` suffix) to current slugs, plus `/feed.xml` to `/rss.xml`.
- `src/plugins/rehype-component-link-card.mjs`: `::card{url="https://example.com" site="GitHub" title="repo-name" desc="One line."}` renders a server-side link card for any URL. Unlike `::github{repo="owner/repo"}`, it makes no request to `api.github.com`, so it works for private repos and non-GitHub hosts.
- Post images get a white rounded card in `src/styles/markdown.css` so transparent-background diagrams stay readable in dark mode.

## License

Blog posts are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Site code is MIT. The underlying theme is [Fuwari](https://github.com/saicaca/fuwari) by saicaca, also MIT (see `LICENSE`).
