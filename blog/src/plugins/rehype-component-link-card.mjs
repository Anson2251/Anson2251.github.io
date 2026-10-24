/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a server-rendered link card for an arbitrary URL.
 *
 * Unlike the GitHub card this needs no client-side fetch, so it works for
 * private repositories and non-GitHub hosts.
 *
 * @param {Object} properties - Properties of the directive.
 * @param {string} properties.url - Target URL, http(s) only.
 * @param {string} [properties.title] - Card title, defaults to the hostname.
 * @param {string} [properties.desc] - One-line description.
 * @param {string} [properties.site] - Label above the title, defaults to the hostname.
 * @param {import('mdast').RootContent[]} children
 * @returns {import('mdast').Parent} The created link card.
 */
export function LinkCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("card" directive must be leaf type "::card{url="https://example.com"}")',
		]);

	const url = properties.url;
	if (typeof url !== "string" || !/^https?:\/\//i.test(url))
		return h("div", { class: "hidden" }, [
			'Invalid url. ("url" attribute must start with http:// or https://)',
		]);

	let host = url;
	try {
		host = new URL(url).hostname.replace(/^www\./, "");
	} catch {
		// keep the raw url as the label
	}

	const site =
		typeof properties.site === "string" && properties.site !== ""
			? properties.site
			: host;
	const title =
		typeof properties.title === "string" && properties.title !== ""
			? properties.title
			: host;
	const description =
		typeof properties.desc === "string" ? properties.desc : "";

	const nodes = [
		h("div", { class: "lc-titlebar" }, [
			h("span", { class: "lc-site" }, site),
			h("span", { class: "lc-icon" }),
		]),
		h("div", { class: "lc-title" }, title),
	];
	if (description !== "")
		nodes.push(h("div", { class: "lc-description" }, description));

	return h(
		"a",
		{
			class: "card-link no-styling",
			href: url,
			target: "_blank",
			rel: "noopener noreferrer",
		},
		nodes,
	);
}
