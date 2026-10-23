/**
 * Apps shown on the landing page and at /apps.
 *
 * Add one object per app. `tags` drive the filter chips, `featured` entries
 * are sorted first, and `hue` tints the card (leave it out to derive one from
 * the slug). `icon` is a URL to the app's own favicon — leave it out and the
 * card renders without one.
 */
export type AppStatus = "live" | "wip" | "archived";

export interface App {
	slug: string;
	name: string;
	tagline: string;
	description: string;
	tags: string[];
	url: string;
	repo?: string;
	icon?: string;
	featured?: boolean;
	status?: AppStatus;
	year?: number;
	hue?: number;
}

export const apps: App[] = [
	{
		slug: "resume-tailor",
		name: "Resume Tailor",
		tagline: "One master resume, a tailored view per job.",
		description:
			"Keeps a single master resume, then saves each job as its own view — chosen items, ordering, title, summary and cover letter — with a local LLM agent drafting the rewrites. Live A4 preview, PDF export, and the same app as an Electron build.",
		tags: ["Productivity", "LLM", "Web"],
		url: "https://ansonate.ink/resume-tailor/",
		repo: "https://github.com/Anson2251/resume-tailor",
		icon: "https://ansonate.ink/resume-tailor/icons/favicon.svg",
		featured: true,
		status: "live",
		year: 2026,
		hue: 165,
	},
	{
		slug: "mour",
		name: "MOUR (Workspace Demo)",
		tagline: "A runtime for stateful interactive applications.",
		description:
			"Machine-Oriented Runtime for Interactive Applications. Splits an app into a widget tree, a machine graph and a rendering tree so behaviour can form graphs that ignore the visual hierarchy. The hosted workspace is the experiment; the README calls it research-grade.",
		tags: ["Framework", "Web"],
		url: "https://ansonate.ink/mour/",
		repo: "https://github.com/Anson2251/mour",
		featured: true,
		status: "wip",
		year: 2026,
		hue: 265,
	},
	{
		slug: "cpc-online",
		name: "CPC Online",
		tagline: "A web IDE for CAIE pseudocode.",
		description:
			"A browser IDE for the CAIE pseudocode language: CodeMirror editor, an IndexedDB-backed file explorer, output panel and debugger UI, with the interpreter running in a web worker. The interpreter itself lives in vibe-cpc.",
		tags: ["Editor", "Language", "Web"],
		url: "https://ansonate.ink/cpc-online/",
		repo: "https://github.com/Anson2251/cpc-online",
		featured: true,
		status: "live",
		year: 2026,
		hue: 12,
	},
	{
		slug: "trackmaker",
		name: "Trackmaker",
		tagline: "Route planning and tracking for sports activities.",
		description:
			"Draws and edits routes on a MapLibre map, records GPS traces through a Kalman filter, and stores everything in IndexedDB or the Tauri store. The credential-handling post on the blog came out of it.",
		tags: ["Maps", "Web"],
		url: "https://ansonate.ink/trackmaker/",
		repo: "https://github.com/Anson2251/trackmaker",
		icon: "https://ansonate.ink/trackmaker/favicon.svg",
		featured: true,
		status: "archived",
		year: 2024,
		hue: 250,
	},
	{
		slug: "paper-extract",
		name: "Paper Extract Paper Viewer",
		tagline: "Exam paper PDFs in, per-question JSON out. This demo views the paper output.",
		description:
			"Renders each page as an image, pulls questions out with a vision model that carries the previous question forward, then has a second pass solve, judge and fix them. The hosted viewer is a finished bundle from that pipeline.",
		tags: ["LLM", "Tool"],
		url: "https://ansonate.ink/paper-extract/",
		repo: "https://github.com/Anson2251/paper-extract",
		featured: true,
		status: "live",
		year: 2026,
		hue: 195,
	},
	{
		slug: "solve2048",
		name: "Solve2048",
		tagline: "A solver for 2048 boards with two strategies.",
		description: "A small solver for 2048 boards, built as an excuse to play with search.",
		tags: ["Game"],
		url: "https://ansonate.ink/solve2048/",
		repo: "https://github.com/Anson2251/solve2048",
		icon: "https://ansonate.ink/solve2048/favicon.ico",
		featured: true,
		status: "live",
		year: 2023,
		hue: 38,
	},
	{
		slug: "binomial-expansion-calculator",
		name: "Binomial Expansion Calculator",
		tagline: "Expand (a + b)^n, term by term.",
		description: "A calculator for binomial expansions and the coefficients behind them.",
		tags: ["Math", "Tool"],
		url: "https://ansonate.ink/binomial-expansion-calculator/",
		repo: "https://github.com/Anson2251/binomial-expansion-calculator",
		icon: "https://ansonate.ink/binomial-expansion-calculator/favicon.svg",
		status: "live",
		year: 2023,
		hue: 205,
	},
	{
		slug: "sequence",
		name: "Sequence Calculator",
		tagline: "A calculator for sequences.",
		description: "A small tool for working through sequence problems without reaching for a spreadsheet.",
		tags: ["Math", "Tool"],
		url: "https://ansonate.ink/sequence/",
		repo: "https://github.com/Anson2251/sequence",
		status: "live",
		year: 2023,
		hue: 330,
	},
	{
		slug: "rhythmc-texture-pack-maker",
		name: "RhythMC Texture Pack Maker",
		tagline: "Build RhythMC texture packs in the browser.",
		description:
			"Converts audio into the format a RhythMC pack needs with ffmpeg.wasm, then zips the result into something the server can import.",
		tags: ["Audio", "Tool"],
		url: "https://ansonate.ink/RhythMC-TexturePack-Maker-Web/",
		repo: "https://github.com/Anson2251/RhythMC-TexturePack-Maker-Web",
		status: "live",
		year: 2025,
		hue: 318,
	},
	{
		slug: "caie-assembly-interpreter",
		name: "CAIE Assembly Interpreter",
		tagline: "Runs the coursebook's assembly examples.",
		description:
			"A Vue front end for an interpreter that executes the assembly language examples from the Cambridge International AS & A Level Computer Science coursebook.",
		tags: ["Editor", "Language"],
		url: "https://ansonate.ink/caie-assembly-interpreter/",
		repo: "https://github.com/Anson2251/caie-assembly-interpreter",
		status: "live",
		year: 2024,
		hue: 95,
	},
	{
		slug: "credicheck",
		name: "CrediCheck",
		tagline: "Score how much a source earns your trust.",
		description:
			"A questionnaire that marks educational background, track record and factual consistency, totals them into a credibility score, and saves the score next to the article's URL.",
		tags: ["Tool"],
		url: "https://ansonate.ink/CrediCheck/",
		repo: "https://github.com/Anson2251/CrediCheck",
		status: "live",
		year: 2024,
		hue: 130,
	},
	{
		slug: "hangman-game",
		name: "Hangman",
		tagline: "Hangman, in plain JavaScript.",
		description: "A small Hangman game, the JavaScript sibling of a partner's R version.",
		tags: ["Game"],
		url: "https://ansonate.ink/hangman-game/",
		repo: "https://github.com/Anson2251/hangman-game",
		status: "live",
		year: 2024,
		hue: 55,
	},
	{
		slug: "octopinion-writing-system",
		name: "Octopinion Writing System",
		tagline: "A script for a constructed language.",
		description:
			"Types letter sequences into a demo of the Octopinion script, which stacks one to five syllables into a cross and writes words right to left.",
		tags: ["Language"],
		url: "https://ansonate.ink/octopinion-writing-system/",
		repo: "https://github.com/Anson2251/octopinion-writing-system",
		status: "archived",
		year: 2026,
		hue: 288,
	},
];

export function statusLabel(status: AppStatus): string {
	switch (status) {
		case "wip":
			return "In progress";
		case "archived":
			return "Archived";
		default:
			return "Live";
	}
}

export function appHue(slug: string): number {
	let hash = 0;
	for (let i = 0; i < slug.length; i += 1) {
		hash = (hash * 31 + slug.charCodeAt(i)) % 360;
	}
	return hash;
}
