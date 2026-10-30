import type { APIRoute } from "astro";

// Landing sitemap. Keep in sync with src/pages/*.astro (excluding 404).
// Canonical URLs match BaseLayout (`/` and `/apps`, no trailing slash on /apps).
const pages = [
	{ path: "/", changefreq: "weekly", priority: 1.0 },
	{ path: "/apps", changefreq: "weekly", priority: 0.8 },
];

export const GET: APIRoute = ({ site }) => {
	const base = (site ?? new URL("https://ansonate.ink")).toString();
	const urls = pages
		.map(({ path, changefreq, priority }) => {
			const loc = new URL(path, base).toString();
			return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`;
		})
		.join("\n");
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
};
