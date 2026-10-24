// Site chrome language: which language the page UI renders in.
//
// Unlike the build-time `i18n()` (which bakes `siteConfig.lang` into the HTML),
// this switches the visible UI at runtime. Server-rendered strings carry
// `data-i18n*` markers; client-rendered Svelte components subscribe to
// SITE_LANG_EVENT instead. Post bodies, bios and other author content are
// never touched.

import type I18nKey from "@i18n/i18nKey";
import { en } from "@i18n/languages/en";
import { zh_CN } from "@i18n/languages/zh_CN";

export type SiteLang = "en" | "zh";

export const SITE_LANG_KEY = "site-lang";
export const SITE_LANG_EVENT = "site-lang-change";

const dicts: Record<SiteLang, Record<string, string>> = {
	en: en as unknown as Record<string, string>,
	zh: zh_CN as unknown as Record<string, string>,
};

export function getSiteLangPref(): SiteLang {
	try {
		const v = localStorage.getItem(SITE_LANG_KEY);
		if (v === "en" || v === "zh") return v;
	} catch {
		// storage unavailable (SSR/prerender) - fall through to default
	}
	return "en";
}

export function setSiteLangPref(lang: SiteLang): void {
	try {
		localStorage.setItem(SITE_LANG_KEY, lang);
	} catch {
		// ignore
	}
	// Dispatch on document (not window): events targeted at window never reach
	// document-level listeners. bubbles:true lets the event bubble back up to
	// window listeners too, so both styles stay in sync.
	document.dispatchEvent(
		new CustomEvent<SiteLang>(SITE_LANG_EVENT, { detail: lang, bubbles: true }),
	);
}

export function t(key: I18nKey | string, lang: SiteLang): string {
	return (
		dicts[lang][key as string] ?? dicts.en[key as string] ?? (key as string)
	);
}

// Twin-post label depends on both the chrome language and the twin's language.
export function twinLabel(twinLang: "zh" | "en", chrome: SiteLang): string {
	if (chrome === "zh") return twinLang === "zh" ? "中文版" : "英文版";
	return twinLang === "zh" ? "Chinese version" : "English version";
}

// Rewrite every marked string in the document. Runs on load, on
// SITE_LANG_EVENT, and after each swup page transition.
export function applySiteLang(lang: SiteLang): void {
	document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
		const key = el.dataset.i18n;
		if (key) el.textContent = t(key, lang);
	});
	document.querySelectorAll<HTMLElement>("[data-i18n-ph]").forEach((el) => {
		const key = el.dataset.i18nPh;
		if (key) el.setAttribute("placeholder", t(key, lang));
	});
	document.querySelectorAll<HTMLElement>("[data-i18n-count]").forEach((el) => {
		const n = Number(el.dataset.i18nN ?? "0");
		const one = el.dataset.i18nOne;
		const many = el.dataset.i18nMany;
		if (one && many) el.textContent = `${n} ${t(n === 1 ? one : many, lang)}`;
	});
	document.querySelectorAll<HTMLElement>("[data-twin-label]").forEach((el) => {
		const kind = el.dataset.twinKind === "zh" ? "zh" : "en";
		el.textContent = `${twinLabel(kind, lang)}:`;
	});
	// On post pages the <html> lang tracks the post content language
	// (set server-side), so leave it alone there.
	if (!document.querySelector("[data-post-root]")) {
		document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
	}
}
