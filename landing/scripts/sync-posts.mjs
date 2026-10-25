import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/**
 * Build the landing page's recent-writing list from the blog's posts.
 *
 * Edit the two constants below to control what appears on the landing page.
 * Tag matching is case-insensitive and exact.
 */
const RECENT_COUNT = 5;
const EXCLUDE_TAGS = [];

const BLOG_ORIGIN = "https://blog.ansonate.ink";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.resolve(root, "../blog/src/content/posts");
const outFile = path.resolve(root, "src/data/posts.json");

const excluded = new Set(EXCLUDE_TAGS.map((tag) => String(tag).trim().toLowerCase()));

function readFrontmatter(file) {
	const raw = fs.readFileSync(file, "utf8");
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
	if (!match) return null;
	return parse(match[1]) ?? {};
}

function toDate(value) {
	if (value instanceof Date) return value;
	const date = new Date(String(value));
	return Number.isNaN(date.getTime()) ? null : date;
}

if (!fs.existsSync(postsDir)) {
	console.error(`[sync-posts] Blog posts directory not found: ${postsDir}`);
	process.exit(1);
}

const posts = [];

for (const file of fs.readdirSync(postsDir)) {
	if (!file.endsWith(".md")) continue;

	const data = readFrontmatter(path.join(postsDir, file));
	if (!data || data.draft === true) continue;

	const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
	if (tags.some((tag) => excluded.has(tag.trim().toLowerCase()))) continue;

	const published = toDate(data.published);
	if (!published) continue;

	posts.push({
		slug: file.replace(/\.md$/, ""),
		title: String(data.title ?? file),
		description: String(data.description ?? ""),
		published: published.toISOString().slice(0, 10),
		category: String(data.category ?? ""),
		tags,
		lang: String(data.lang ?? ""),
		translationKey: String(data.translationKey ?? ""),
	});
}

const byTranslation = new Map();

for (const post of posts) {
	const key = post.translationKey || `slug:${post.slug}`;
	const current = byTranslation.get(key);

	if (!current) {
		byTranslation.set(key, post);
		continue;
	}

	const currentIsEnglish = current.lang.toLowerCase().startsWith("en");
	const postIsEnglish = post.lang.toLowerCase().startsWith("en");

	if (postIsEnglish && !currentIsEnglish) {
		byTranslation.set(key, post);
	} else if (postIsEnglish === currentIsEnglish && post.published > current.published) {
		byTranslation.set(key, post);
	}
}

const recent = [...byTranslation.values()]
	.sort((a, b) => b.published.localeCompare(a.published))
	.slice(0, RECENT_COUNT)
	.map(({ translationKey: _translationKey, ...post }) => ({
		...post,
		url: `${BLOG_ORIGIN}/posts/${post.slug}/`,
	}));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(recent, null, 2)}\n`);
console.log(`[sync-posts] Wrote ${recent.length} posts to ${path.relative(root, outFile)}`);
