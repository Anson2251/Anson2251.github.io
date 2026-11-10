import { createHash } from "node:crypto";
import { visit } from "unist-util-visit";

// Renders ```mermaid fences to static SVG at build time with Merman
// (@mermanjs/node), a Rust implementation of Mermaid. Doing this at build
// time keeps Mermaid's browser bundle and its CDN request off the page.
//
// Both appearances are emitted; CSS picks one from `html.dark`. If a diagram
// fails to render, the fence is left as `pre.mermaid-src`, which the
// client-side renderer in Layout.astro still picks up, so one bad diagram
// degrades instead of failing the build.

const MERMAID_LANG = "mermaid";
const LIGHT_THEME = "neutral";
const DARK_THEME = "dark";

// Merman is ESM-only and loads a platform binary, so import it lazily: the
// engine is only created once a post actually contains a diagram.
//
// The import is built at runtime on purpose. Vite rewrites every `import()`
// in this file into a call on its SSR module runner (markdown plugins are
// loaded through it), and that runner cannot load the `.node` binary. Going
// through `new Function` keeps the call out of Vite's transform and hands it
// to Node's own loader.
const nativeImport = new Function("specifier", "return import(specifier)");

let enginePromise;

function getEngine() {
	enginePromise ??= nativeImport("@mermanjs/node").then((merman) =>
		merman.createNodeEngine(),
	);
	return enginePromise;
}

function renderDiagram(engine, source, theme) {
	return engine.renderSvg(source, {
		optionsJson: JSON.stringify({
			version: 3,
			theme: { spec: { mermaid: { theme } } },
			// Text labels instead of <foreignObject> HTML: page CSS cannot
			// reach them, and non-browser consumers can still draw them.
			svg: { pipeline: "resvg-safe" },
		}),
	});
}

function diagramLabel(source) {
	const first = (source.trim().split("\n")[0] ?? "").trim().toLowerCase();
	if (first.startsWith("sequencediagram")) return "Sequence diagram";
	if (first.startsWith("classdiagram")) return "Class diagram";
	if (first.startsWith("statediagram")) return "State diagram";
	if (first.startsWith("erdiagram")) return "Entity relationship diagram";
	if (first.startsWith("journey")) return "User journey diagram";
	if (first.startsWith("gantt")) return "Gantt chart";
	if (first.startsWith("pie")) return "Pie chart";
	if (first.startsWith("gitgraph")) return "Git graph";
	if (first.startsWith("mindmap")) return "Mind map";
	if (first.startsWith("timeline")) return "Timeline";
	return "Diagram";
}

// Every SVG ships the same fixed ids (`merman`, `merman-foreignobject-label-0`,
// marker ids...). Two diagrams on one page would then share ids, and
// `url(#...)` references resolve to whichever appears first in the document.
// Prefix every id and reference so each diagram stays self-contained.
function scopeIds(svg, prefix) {
	let scoped = svg;
	const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
	// Longest first, otherwise `#merman` would also match `#merman-…`.
	for (const id of ids.sort((a, b) => b.length - a.length)) {
		scoped = scoped.replaceAll(`id="${id}"`, `id="${prefix}${id}"`);
		scoped = scoped.replaceAll(`#${id}`, `#${prefix}${id}`);
	}
	return scoped;
}

function normalizeSvg(svg, prefix, source) {
	const label = diagramLabel(source);
	return scopeIds(svg, prefix)
		.replace(/\srole="[^"]*"/, ' role="img"')
		.replace(/\saria-roledescription="[^"]*"/, "")
		.replace(/^<svg/, `<svg aria-label="${label}"`);
}

function figureHtml(light, dark) {
	return [
		'<div class="mermaid-ssg not-prose" data-pagefind-ignore>',
		`<div class="mermaid-ssg-light">${light}</div>`,
		`<div class="mermaid-ssg-dark">${dark}</div>`,
		"</div>",
	].join("");
}

function fallbackFence(source) {
	const escaped = source
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	return `<pre class="mermaid-src not-prose" data-pagefind-ignore>${escaped}</pre>`;
}

export function remarkMermaid() {
	return async (tree, file) => {
		const fences = [];
		visit(tree, "code", (node, index, parent) => {
			if (!parent || index == null || node.lang !== MERMAID_LANG) return;
			fences.push({ node, index, parent });
		});
		if (fences.length === 0) return;

		const engine = await getEngine();
		const key = (source) =>
			createHash("sha256").update(source).digest("hex").slice(0, 8);

		for (const { node, index, parent } of fences) {
			const source = node.value;
			try {
				const [light, dark] = await Promise.all([
					renderDiagram(engine, source, LIGHT_THEME),
					renderDiagram(engine, source, DARK_THEME),
				]);
				const digest = key(source);
				parent.children[index] = {
					type: "html",
					value: figureHtml(
						normalizeSvg(light, `mm-${digest}-l-`, source),
						normalizeSvg(dark, `mm-${digest}-d-`, source),
					),
				};
			} catch (error) {
				const where = file?.path ? ` in ${file.path}` : "";
				console.warn(
					`[mermaid] build-time render failed${where}: ${error.message}`,
				);
				parent.children[index] = { type: "html", value: fallbackFence(source) };
			}
		}
	};
}
