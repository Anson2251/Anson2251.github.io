import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

type CountablePost = {
	data: {
		tags?: string[];
		category?: string | null;
		translationKey?: string | null;
	};
};

// Translation twins are the same post, so they must only be counted once.
// Group by `translationKey` and merge their tags and categories; posts without
// a key are their own group.
function groupTranslationTwins(posts: CountablePost[]) {
	const groups = new Map<
		string,
		{ tags: Set<string>; categories: Set<string> }
	>();
	posts.forEach((post, index) => {
		const key = post.data.translationKey || `#${index}`;
		let group = groups.get(key);
		if (!group) {
			group = { tags: new Set(), categories: new Set() };
			groups.set(key, group);
		}
		for (const tag of post.data.tags ?? []) {
			const name = tag.trim();
			if (name) group.tags.add(name);
		}
		if (post.data.category) {
			group.categories.add(post.data.category.trim());
		}
	});
	return groups.values();
}

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	for (const group of groupTranslationTwins(allBlogPosts)) {
		for (const tag of group.tags) {
			countMap[tag] = countMap[tag] ? countMap[tag] + 1 : 1;
		}
	}

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	for (const group of groupTranslationTwins(allBlogPosts)) {
		if (group.categories.size === 0) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			continue;
		}

		for (const categoryName of group.categories) {
			count[categoryName] = count[categoryName]
				? count[categoryName] + 1
				: 1;
		}
	}

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
