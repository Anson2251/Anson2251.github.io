// Shared post-language logic: which translation to show when a post
// exists in multiple languages. Used by the PostLang switcher (client),
// ArchivePanel (Svelte) and the post page (server).

export type PostLangPref = "all" | "zh" | "en";

export const POST_LANG_KEY = "post-lang";
export const POST_LANG_EVENT = "post-lang-change";

// zh_CN / zh_TW / zh -> zh, en / en_US -> en.
// Empty (missing frontmatter lang) falls back to English, the site language.
export function normLang(lang: string | null | undefined): "zh" | "en" {
	if (!lang) return "en";
	const l = lang.toLowerCase();
	if (l.startsWith("zh")) return "zh";
	if (l.startsWith("en")) return "en";
	return "en";
}

export function getPostLangPref(): PostLangPref {
	try {
		const v = localStorage.getItem(POST_LANG_KEY);
		if (v === "zh" || v === "en") return v;
		// "all" was a legacy option with no matching button; fall through to default.
	} catch {
		// storage unavailable (SSR/prerender) - fall through to default
	}
	return "en";
}

export function setPostLangPref(pref: PostLangPref): void {
	try {
		localStorage.setItem(POST_LANG_KEY, pref);
	} catch {
		// ignore
	}
	// Dispatch on document (not window): events targeted at window never reach
	// document-level listeners. bubbles:true lets the event bubble back up to
	// window listeners too, so both styles stay in sync.
	document.dispatchEvent(
		new CustomEvent<PostLangPref>(POST_LANG_EVENT, { detail: pref, bubbles: true }),
	);
}

type PostLike = {
	data: { lang?: string | null; translationKey?: string | null };
};

// Collapse translation twins to the preferred language, preserving order.
// Posts without a translationKey always show. When a group has no version
// in the preferred language, its first listed version shows as fallback.
export function filterPostsByLang<T extends PostLike>(posts: T[], pref: PostLangPref): T[] {
	if (pref === "all") return posts;
	const best = new Map<string, number>();
	posts.forEach((p, i) => {
		const k = p.data.translationKey || "";
		if (!k) return;
		if (normLang(p.data.lang) === pref) best.set(k, i);
		else if (!best.has(k)) best.set(k, i);
	});
	return posts.filter((p, i) => {
		const k = p.data.translationKey || "";
		return !k || best.get(k) === i;
	});
}
