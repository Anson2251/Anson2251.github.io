<script lang="ts">
	import { normLang } from "@utils/post-lang";
	import { onDestroy, onMount } from "svelte";

	// A small screen-printing simulator built from stacked SVG filters.
	// Every physical defect maps to one filter stage; the sliders are the
	// press operator's controls.

	type View = "all" | "k" | "m" | "c" | "y";
	type BrowserKind = "chromium" | "safari" | "other" | "unknown";

	// The Chinese and English posts share this widget, so the copy follows the
	// article language: <ScreenPrintLab client:load lang="en" />. Values go
	// through normLang(), so "zh_CN" works and anything unknown or missing
	// falls back to English like the rest of the blog.
	export let lang: string = "";

	const STRINGS = {
		zh: {
			warningTitle: "建议使用 Chrome / Chromium 内核浏览器",
			warningSafari:
				"这组 SVG 滤镜很重。Safari 对 SVG filter 的优化极差，默认先不加载，点「玩一玩」手动开启。",
			warningOther:
				"这组 SVG 滤镜很重。当前浏览器的滤镜性能可能较差，滚动时会更明显。",
			plotLabel:
				"三维视角下的 XY 坐标系与 K、M、C、Y 四条不同频率的正弦波，带有可调的油墨、网眼、渗墨和纸纹参数",
			play: "玩一玩",
			gate: "Safari 对 SVG filter 的优化极差，点击后才会开始渲染。",
			viewGroup: "查看单块印版",
			overprint: "套印",
			zOrder: "印版按亮度从暗到亮排列",
			exposure: "曝光偏差",
			seepSpread: "渗墨晕散范围",
			mesh: "网目密度",
			inkClog: "油墨堵网",
			bleed: "油墨扩散",
			edge: "文字边缘模糊",
			misreg: "套色错位",
			grain: "纸纹强度",
			clogNote: "堵网概率",
			overTerm: "过曝项",
			inkTerm: "油墨项",
			replate: "重新制版",
			reset: "复位",
			under: "欠",
			over: "过",
		},
		en: {
			warningTitle: "Best viewed in a Chromium browser",
			warningSafari:
				"These SVG filters are heavy. Safari is very slow with them, so nothing loads until you press Play.",
			warningOther:
				"These SVG filters are heavy. This browser may handle them poorly, especially while scrolling.",
			plotLabel:
				"A three-dimensional view of the XY axes with four sine waves at different frequencies in K, M, C and Y, plus adjustable ink, mesh, bleed and paper settings",
			play: "Play",
			gate: "Safari is very slow with SVG filters. Rendering starts after you press Play.",
			viewGroup: "Plate view",
			overprint: "All",
			zOrder: "Plates ordered from dark to light",
			exposure: "Exposure",
			seepSpread: "Bleed spread",
			mesh: "Mesh density",
			inkClog: "Ink clogging",
			bleed: "Ink spread",
			edge: "Type edge blur",
			misreg: "Misregistration",
			grain: "Paper grain",
			clogNote: "Clog probability",
			overTerm: "overexposure",
			inkTerm: "ink",
			replate: "Re-plate",
			reset: "Reset",
			under: "under",
			over: "over",
		},
	} as const;

	$: ui = STRINGS[normLang(lang)];

	let exposure = -0.3;
	let seepSpread = 34;
	let mesh = 0.55;
	let clog = 0.24;
	let bleed = 3.4;
	let edge = 0.6;
	let misreg = 5;
	let grain = 0.14;
	let seed = 7;
	let view: View = "all";

	// The SVG has many filter primitives across twelve layers. Only mount the
	// heavy part while it is near the viewport; the stage keeps its size so the
	// page layout does not jump.
	let stageEl: HTMLDivElement;
	let visible = false;
	let browser: BrowserKind = "unknown";
	// Safari gets a click-to-render gate; Chromium and other engines start
	// rendering as soon as the component is hydrated.
	let renderEnabled = false;
	let pressing = false;
	let pressTimer: number | undefined;

	function startRender() {
		if (pressing || renderEnabled) return;
		pressing = true;
		pressTimer = window.setTimeout(() => {
			renderEnabled = true;
			pressing = false;
		}, 300);
	}

	onDestroy(() => {
		if (pressTimer) window.clearTimeout(pressTimer);
	});

	$: active = visible && renderEnabled;

	onMount(() => {
		const ua = navigator.userAgent;
		const uaData = (
			navigator as Navigator & {
				userAgentData?: { brands?: { brand: string }[] };
			}
		).userAgentData;
		const brandIsChromium = uaData?.brands?.some((b) =>
			/Chromium|Google Chrome|Microsoft Edge|Opera|Brave/i.test(b.brand),
		);
		const isIOSWebKit = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
		const isChromium =
			brandIsChromium ??
			(!isIOSWebKit && /Chrome\/|Chromium\/|Edg\/|OPR\//i.test(ua));
		const isSafari =
			!isChromium &&
			(isIOSWebKit || (/Safari\//i.test(ua) && !/Android/i.test(ua)));

		browser = isChromium ? "chromium" : isSafari ? "safari" : "other";
		renderEnabled = browser !== "safari";

		if (!("IntersectionObserver" in window)) {
			visible = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				visible = entries[0]?.isIntersecting ?? true;
			},
			{ rootMargin: "300px 0px", threshold: 0 },
		);
		observer.observe(stageEl);
		return () => observer.disconnect();
	});

	const paper = "#e8dfc9";

	// K → M → C → Y is also darkest → lightest. Each ink is one z-slice
	// through the same field, at its own frequency.
	const plates = [
		{
			id: "k",
			label: "K",
			color: "#141414",
			rgb: [0.08, 0.08, 0.08],
			seed: 31,
			freq: 2,
			stroke: 6.5,
		},
		{
			id: "m",
			label: "M",
			color: "#d81b60",
			rgb: [0.85, 0.11, 0.38],
			seed: 47,
			freq: 2,
			stroke: 5.5,
		},
		{
			id: "c",
			label: "C",
			color: "#0b8fa8",
			rgb: [0.04, 0.56, 0.66],
			seed: 53,
			freq: 2,
			stroke: 4.5,
		},
		{
			id: "y",
			label: "Y",
			color: "#dfa900",
			rgb: [0.87, 0.66, 0.0],
			seed: 61,
			freq: 2,
			stroke: 4,
		},
	] as const;

	// Repeat the CMYK set three times. The first pass is solid; each pass
	// behind it is dashed, thinner, and has larger gaps.
	const passes = 3;
	const layers = Array.from({ length: passes }, (_, pass) =>
		plates.map((ink, i) => {
			const t = pass / (passes - 1);
			const z = pass * plates.length + i;
			return {
				...ink,
				id: `${ink.id}-${pass}`,
				ink: ink.id,
				pass,
				z,
				phase: -(z * Math.PI) / 6 + Math.sin(z) * 0.4 + Math.random() * 0.2,
				stroke: ink.stroke * (1 - 0.42 * t),
				dash:
					pass === 0
						? "none"
						: `${(9 - 4 * t).toFixed(1)} ${(6 + 14 * t).toFixed(1)}`,
				seep: pass === 0,
			};
		}),
	).flat();
	const totalLayers = layers.length;
	const zMax = totalLayers - 1;

	// Exposure is a signed window: -1 is underexposed, +1 is overexposed.
	// Underexposure leaves a soft, over-open stencil edge (seep); overexposure
	// cures the image apertures shut (clog).
	$: underExposure = Math.max(0, -exposure);
	$: overExposure = Math.max(0, exposure);
	$: seepThreshold = 1.02 - 0.5 * underExposure;
	// Mesh clogging has two inputs: overexposure closing the apertures, and the
	// ink itself (dried pigment, dust, bubbles).
	$: clogProbability = Math.min(1, 0.7 * overExposure + 0.9 * clog);
	$: clogThreshold = 0.985 - 0.36 * clogProbability;

	const defaults = {
		exposure: -0.3,
		seepSpread: 34,
		mesh: 0.55,
		clog: 0.24,
		bleed: 3.4,
		edge: 0.6,
		misreg: 5,
		grain: 0.14,
		seed: 7,
	};

	function reseed() {
		seed = Math.floor(Math.random() * 900) + 10;
	}

	function exposureText(v: number) {
		if (v < -0.005) return `${ui.under} ${Math.abs(v).toFixed(2)}`;
		if (v > 0.005) return `${ui.over} ${v.toFixed(2)}`;
		return "0.00";
	}

	function reset() {
		exposure = defaults.exposure;
		seepSpread = defaults.seepSpread;
		mesh = defaults.mesh;
		clog = defaults.clog;
		bleed = defaults.bleed;
		edge = defaults.edge;
		misreg = defaults.misreg;
		grain = defaults.grain;
		seed = defaults.seed;
		view = "all";
	}

	function rand01(n: number) {
		const x = Math.sin(n) * 43758.5453123;
		return x - Math.floor(x);
	}

	// Registration error is seeded, so every plate gets its own direction
	// and magnitude; “重新制版” produces a new set of offsets.
	function buildRegistration(s: number, magnitude: number) {
		const out: Record<string, { x: number; y: number }> = {};
		plates.forEach((plate, i) => {
			const angle = rand01(s * 0.137 + i * 11.731 + 3) * Math.PI * 2;
			const radius =
				magnitude * (0.45 + 0.55 * rand01(s * 0.417 + i * 5.219 + 7));
			out[plate.id] = {
				x: Math.cos(angle) * radius,
				y: Math.sin(angle) * radius,
			};
		});
		return out;
	}

	$: registration = buildRegistration(seed, misreg);

	// Oblique 3D projection: x right, y up, z away and up-right at 30°.
	// Back slices are also a little smaller, which reads as perspective.
	const OX = 58;
	const OY = 440;
	const XS = 598;
	const YS = 60;
	const ZSX = 24.25;
	const ZSY = 14;
	const PERSP = 0.01;

	// The plot area is a fixed screen-space rectangle. Waves are clipped to it;
	// the coordinate axes may continue outside it independently.
	const PLOT = { x0: 48, x1: 648, y0: 180, y1: 540 };

	function depthScale(z: number) {
		return 1 - z * PERSP;
	}

	function sx(x: number, z: number) {
		return OX + x * XS * depthScale(z) + z * ZSX;
	}

	function sy(x: number, y: number, z: number) {
		return OY - y * YS * depthScale(z) - z * ZSY;
	}

	// Each wave is drawn across the whole plot rectangle, then clipped by it.
	// The x-axis can end wherever it likes; the waves ignore it.
	function wavePath(freq: number, phase: number, z: number): string {
		const steps = 320;
		const s = depthScale(z);
		const t0 = (PLOT.x0 - OX - z * ZSX) / (XS * s);
		const t1 = (PLOT.x1 - OX - z * ZSX) / (XS * s);
		const span = t1 - t0;
		let d = "";
		for (let i = 0; i <= steps; i++) {
			const t = t0 + (span * i) / steps;
			const y = Math.sin((i / steps) * Math.PI * 2 * freq + phase);
			d += `${i === 0 ? "M" : "L"}${sx(t, z).toFixed(1)} ${sy(t, y, z).toFixed(1)} `;
		}
		return d;
	}

	// Paint back to front so the near (dark) plate stays crisp.
	const renderLayers = [...layers].reverse();

	// Hatching for the y-z plane: lines y = -0.2 z + c, clipped to y ∈ [-1, 1].
	// A print has only four inks, so the plane is shaded by line density, not
	// by a grey fill.
	const HATCH_SLOPE = 0.4;
	const HATCH_STEP = 0.12;
	const hatchLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
	const hatchMax = 1 + HATCH_SLOPE * zMax;
	for (let c = -1; c <= hatchMax; c += HATCH_STEP) {
		const z0 = Math.max(0, (c - 1) / HATCH_SLOPE);
		const z1 = Math.min(zMax, (c + 1) / HATCH_SLOPE);
		if (z1 <= z0) continue;
		hatchLines.push({
			x1: sx(0, z0),
			y1: sy(0, c - HATCH_SLOPE * z0, z0),
			x2: sx(0, z1),
			y2: sy(0, c - HATCH_SLOPE * z1, z1),
		});
	}
</script>

<div class="sp-lab">
	{#if browser === "safari" || browser === "other"}
		<div class="sp-warning" role="status">
			<strong>{ui.warningTitle}</strong>
			<span>
				{browser === "safari" ? ui.warningSafari : ui.warningOther}
			</span>
		</div>
	{/if}

	<div class="sp-stage" bind:this={stageEl}>
		{#if visible && renderEnabled}
		<svg
			viewBox="0 0 720 600"
			role="img"
			aria-label={ui.plotLabel}
		>
			<defs>
				<marker
					id="sp-arrow"
					viewBox="0 0 10 10"
					refX="8.5"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto"
				>
					<path d="M0 1 L10 5 L0 9 Z" fill="#141414" />
				</marker>
				<clipPath id="sp-plot-clip">
					<rect
						x={PLOT.x0}
						y={PLOT.y0}
						width={PLOT.x1 - PLOT.x0}
						height={PLOT.y1 - PLOT.y0}
					/>
				</clipPath>
				<!--
					INK: ragged edges + screen holes.
					feTurbulence displaces the artwork (ink bleed), the alpha
					threshold re-hardens the soft edge, and a second noise layer
					is thresholded into a mesh mask and subtracted from the ink.
				-->
				{#each plates as p (p.id)}
				<filter
					id={`sp-ink-${p.id}`}
					x="-10%"
					y="-10%"
					width="120%"
					height="120%"
					color-interpolation-filters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.55"
						numOctaves="2"
						seed={seed + p.seed}
						result="warp"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="warp"
						scale={bleed}
						xChannelSelector="R"
						yChannelSelector="G"
						result="d0"
					/>
					<feComponentTransfer in="d0" result="ink">
						<feFuncA type="linear" slope="40" intercept="-19" />
					</feComponentTransfer>

					<!-- high-frequency noise, turned into a white mask -->
					<feTurbulence
						type="fractalNoise"
						baseFrequency={mesh}
						numOctaves="1"
						seed={seed + p.seed + 11}
						result="meshNoise"
					/>
					<feColorMatrix
						in="meshNoise"
						type="matrix"
						values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
						result="meshAlpha"
					/>
					<feComponentTransfer in="meshAlpha" result="holes">
						<feFuncA
							type="linear"
							slope="22"
							intercept={-22 * clogThreshold}
						/>
					</feComponentTransfer>
					<feComposite in="ink" in2="holes" operator="out" result="screened" />

					<!-- a second, finer layer of missing pigment -->
					<feTurbulence
						type="fractalNoise"
						baseFrequency="1.15"
						numOctaves="1"
						seed={seed + p.seed + 17}
						result="fine"
					/>
					<feColorMatrix
						in="fine"
						type="matrix"
						values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
						result="fineAlpha"
					/>
					<feComponentTransfer in="fineAlpha" result="fineHoles">
						<feFuncA
							type="linear"
							slope="30"
							intercept={-30 * (0.965 - 0.2 * clogProbability)}
						/>
					</feComponentTransfer>
					<feComposite in="screened" in2="fineHoles" operator="out" />
				</filter>
				{/each}

				<!--
					EDGE: soften the glyphs, roughen the softened silhouette,
					then threshold the alpha so the blur becomes a torn edge.
				-->
				<filter
					id="sp-edge"
					x="-15%"
					y="-15%"
					width="130%"
					height="130%"
					color-interpolation-filters="sRGB"
				>
					<feGaussianBlur
						in="SourceGraphic"
						stdDeviation={edge}
						result="soft"
					/>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.42"
						numOctaves="2"
						seed={seed + 5}
						result="edgeNoise"
					/>
					<feDisplacementMap
						in="soft"
						in2="edgeNoise"
						scale={edge * 1.8 + 0.3}
						xChannelSelector="R"
						yChannelSelector="G"
						result="warped"
					/>
					<feComponentTransfer in="warped">
						<feFuncA type="linear" slope="30" intercept="-14" />
					</feComponentTransfer>
				</filter>

				<!-- PLANE: a light technical overlay; keep the alpha intact. -->
				<filter
					id="sp-plane"
					x="-5%"
					y="-5%"
					width="110%"
					height="110%"
					color-interpolation-filters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.9"
						numOctaves="1"
						seed={seed + 3}
						result="planeNoise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="planeNoise"
						scale="0.9"
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>

				<!-- PAPER: monochrome fibre noise, multiplied over everything. -->
				<filter
					id="sp-grain"
					x="0"
					y="0"
					width="100%"
					height="100%"
					color-interpolation-filters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.72"
						numOctaves="3"
						seed="2"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>

				<!--
					SEEP: one filter per ink. Four blurred copies of the plate
					alpha are summed into a halo, mixed with noise, thresholded
					into specks, and then the solid plate interior is cut out so
					the pinholes inside a flat area stay white. This models ink
					pushed under the stencil edge and spatter, not light leak.
				-->
				{#each plates as p (p.id)}
					<filter
						id={`sp-seep-${p.id}`}
						filterUnits="userSpaceOnUse"
						x="-90"
						y="-90"
						width="900"
						height="780"
						color-interpolation-filters="sRGB"
					>
						<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b1" />
						<feGaussianBlur
							in="SourceAlpha"
							stdDeviation={Math.max(8, seepSpread * 0.35)}
							result="b2"
						/>
						<feGaussianBlur
							in="SourceAlpha"
							stdDeviation={Math.max(16, seepSpread * 0.7)}
							result="b3"
						/>
						<feGaussianBlur
							in="SourceAlpha"
							stdDeviation={seepSpread}
							result="b4"
						/>
						<feComposite
							in="b1"
							in2="b2"
							operator="arithmetic"
							k1="0"
							k2="0.15"
							k3="0.25"
							k4="0"
							result="c1"
						/>
						<feComposite
							in="b3"
							in2="b4"
							operator="arithmetic"
							k1="0"
							k2="0.3"
							k3="0.25"
							k4="0"
							result="c2"
						/>
						<feComposite
							in="c1"
							in2="c2"
							operator="arithmetic"
							k1="0"
							k2="1"
							k3="1"
							k4="0"
							result="halo"
						/>
						<feColorMatrix
							in="halo"
							type="matrix"
							values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1"
							result="H"
						/>

						<!-- coarse specks -->
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.8"
							numOctaves="2"
							seed={seed + p.seed}
							result="n1"
						/>
						<feColorMatrix
							in="n1"
							type="matrix"
							values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"
							result="N1"
						/>
						<feComposite
							in="N1"
							in2="H"
							operator="arithmetic"
							k1="0"
							k2="1"
							k3="0.5"
							k4="0"
							result="S1"
						/>
						<feColorMatrix
							in="S1"
							type="matrix"
							values={`0 0 0 0 ${p.rgb[0]}  0 0 0 0 ${p.rgb[1]}  0 0 0 0 ${p.rgb[2]}  70 0 0 0 ${-70 * seepThreshold}`}
							result="D1"
						/>

						<!-- finer specks -->
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.32"
							numOctaves="2"
							seed={seed + p.seed + 7}
							result="n2"
						/>
						<feColorMatrix
							in="n2"
							type="matrix"
							values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"
							result="N2"
						/>
						<feComposite
							in="N2"
							in2="H"
							operator="arithmetic"
							k1="0"
							k2="1"
							k3="0.25"
							k4="0"
							result="S2"
						/>
						<feColorMatrix
							in="S2"
							type="matrix"
							values={`0 0 0 0 ${p.rgb[0]}  0 0 0 0 ${p.rgb[1]}  0 0 0 0 ${p.rgb[2]}  80 0 0 0 ${-80 * (seepThreshold + 0.03)}`}
							result="D2"
						/>

						<feComposite in="D1" in2="D2" operator="over" result="D" />
						<feMorphology
							in="SourceAlpha"
							operator="dilate"
							radius="1"
							result="m"
						/>
						<feGaussianBlur in="m" stdDeviation="1.5" result="mb" />
						<feColorMatrix
							in="mb"
							type="matrix"
							values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -9"
							result="cut"
						/>
						<feComposite in="D" in2="cut" operator="out" />
					</filter>
				{/each}

				<!-- four separated plates; rendered through <use> below -->
				{#each layers as p (p.id)}
					<g id={`sp-plate-${p.id}`}>
						{#if p.ink === "k" && p.pass === 0}
							<g filter="url(#sp-edge)">
								<text
									x="46"
									y="46"
									font-family="'Maple Mono', ui-monospace, monospace"
									font-size="12"
									letter-spacing="2.2"
									fill={p.color}>SCREEN PRINT / PLATE STUDY 04</text
								>
								<text
									x="672"
									y="46"
									text-anchor="end"
									font-family="'Maple Mono', ui-monospace, monospace"
									font-size="12"
									letter-spacing="2"
									fill={p.color}>{`Z-SLICES / K → Y × ${passes}`}</text
								>
								<text
									x="46"
									y="128"
									font-family="'Barlow', 'Helvetica Neue', sans-serif"
									font-size="66"
									font-weight="800"
									letter-spacing="-2.5"
									fill={p.color}>SINE</text
								>
								<text
									x="46"
									y="158"
									font-family="'Maple Mono', ui-monospace, monospace"
									font-size="13"
									fill={p.color}>y = sin(kx + φ)</text
								>

								<!-- axes, ticks and labels (projected with the waves) -->
								<g
									font-family="'Maple Mono', ui-monospace, monospace"
									font-size="11"
									fill={p.color}
								>
									<text
										x={sx(0, 0)}
										y={sy(0, -1.2, 0)}
										text-anchor="middle">0</text
									>
									<text
										x={sx(0.25, 0)}
										y={sy(0, -1.2, 0)}
										text-anchor="middle">π/2</text
									>
									<text
										x={sx(0.5, 0)}
										y={sy(0, -1.2, 0)}
										text-anchor="middle">π</text
									>
									<text
										x={sx(0.75, 0)}
										y={sy(0, -1.2, 0)}
										text-anchor="middle">3π/2</text
									>
									<text
										x={sx(1, 0)}
										y={sy(0, -1.2, 0)}
										text-anchor="middle">2π</text
									>
									<text
										x={sx(0, 0) - 12}
										y={sy(0, 1, 0) + 4}
										text-anchor="end">+1</text
									>
									<text
										x={sx(0, 0) - 12}
										y={sy(0, 0, 0) + 4}
										text-anchor="end">0</text
									>
									<text
										x={sx(0, 0) - 12}
										y={sy(0, -1, 0) + 4}
										text-anchor="end">−1</text
									>
									<text x={sx(1.03, 0) - 6} y={sy(0, 0, 0) + 4} text-anchor="end">x</text>
									<text
										x={sx(0, 0) - 12}
										y={sy(0, 1.62, 0) + 4}
										text-anchor="end">y</text
									>
									<text
										x={sx(0, totalLayers - 0.6) + 10}
										y={sy(0, 0, totalLayers - 0.6) + 4}>z</text
									>
								</g>
							</g>

							<!-- depth rails: the four corners of the z-slab -->
								<g stroke={p.color} stroke-width="1" opacity="0.16">
									{#each [[0, -1], [1, -1], [0, 1], [1, 1]] as c}
										<line
											x1={sx(c[0], 0)}
											y1={sy(c[0], c[1], 0)}
											x2={sx(c[0], 3)}
											y2={sy(c[0], c[1], 3)}
										/>
									{/each}
								</g>

								<!-- base grid on the z = 0 plane -->
								<g stroke={p.color} stroke-width="1" opacity="0.26">
									{#each [-1, 0, 1] as gy}
										<line
											x1={sx(0, 0)}
											y1={sy(0, gy, 0)}
											x2={sx(1, 0)}
											y2={sy(1, gy, 0)}
										/>
									{/each}
									{#each [0, 0.25, 0.5, 0.75, 1] as gx}
										<line
											x1={sx(gx, 0)}
											y1={sy(0, -1, 0)}
											x2={sx(gx, 0)}
											y2={sy(0, 1, 0)}
										/>
									{/each}
								</g>

								<!-- axes with arrows -->
								<g stroke={p.color} stroke-width="1.8" fill="none">
									<line
										x1={sx(0, 0)}
										y1={sy(0, -1.18, 0)}
										x2={sx(0, 0)}
										y2={sy(0, 1.62, 0)}
										marker-end="url(#sp-arrow)"
									/>
									<line
										x1={sx(0, 0)}
										y1={sy(0, 0, 0)}
										x2={sx(1.03, 0)}
										y2={sy(0, 0, 0)}
										marker-end="url(#sp-arrow)"
									/>
									<line
										x1={sx(0, 0)}
										y1={sy(0, 0, 0)}
										x2={sx(0, totalLayers - 0.6)}
										y2={sy(0, 0, totalLayers - 0.6)}
										marker-end="url(#sp-arrow)"
									/>
								</g>

							<!-- footer band -->
							<rect x="0" y="548" width="720" height="52" fill={p.color} />
							<g filter="url(#sp-edge)">
								<text
									x="46"
									y="580"
									font-family="'Maple Mono', ui-monospace, monospace"
									font-size="12"
									letter-spacing="0.8"
									fill={paper}
									>EXP {exposure.toFixed(2)} · CLOG {clogProbability.toFixed(2)} · EDGE
									{edge.toFixed(2)} · REG {misreg.toFixed(1)} · SEED
									{seed.toString().padStart(3, "0")}</text
								>
								<text
									x="672"
									y="580"
									text-anchor="end"
									font-family="'Maple Mono', ui-monospace, monospace"
									font-size="12"
									letter-spacing="0.8"
									fill={paper}>EDITION 12 / 40</text
								>
							</g>
						{/if}

						<!-- registration target: one per ink, so misregistration pulls them apart -->
						{#if p.pass === 0}
							<g
								transform="translate(646 106)"
								fill="none"
								stroke={p.color}
								stroke-width="1.2"
							>
								<circle r="6" />
								<line x1="-29" y1="0" x2="-6" y2="0" />
								<line x1="6" y1="0" x2="29" y2="0" />
								<line x1="0" y1="-29" x2="0" y2="-6" />
								<line x1="0" y1="6" x2="0" y2="29" />
								<circle r="1.6" fill={p.color} stroke="none" />
							</g>
						{/if}

						<path
							d={wavePath(p.freq, p.phase, p.z)}
							fill="none"
							stroke={p.color}
							stroke-width={p.stroke}
							stroke-dasharray={p.dash}
							stroke-linecap="round"
							clip-path="url(#sp-plot-clip)"
						/>
					</g>
				{/each}
			</defs>

			<rect width="720" height="600" fill={paper} />

			<!-- y-z plane at x = 0, hatched with y = -z + c lines -->
			{#if view === "all" || view === "k"}
				<g filter="url(#sp-plane)" style="mix-blend-mode:multiply">
					<g stroke="#141414" stroke-width="0.5" stroke-linecap="round">
						{#each hatchLines as l}
							<line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
						{/each}
					</g>
				</g>
			{/if}

			{#each renderLayers as p (p.id)}
				{#if view === "all" || view === p.ink}
					<g
						transform={`translate(${registration[p.ink]?.x ?? 0} ${registration[p.ink]?.y ?? 0})`}
					>
						<!-- the printed plate -->
						<g filter={`url(#sp-ink-${p.ink})`} style="mix-blend-mode:multiply">
							<use href={`#sp-plate-${p.id}`} />
						</g>
						<!-- ink pushed out past this plate's stencil edge -->
						{#if p.seep}
							<g
								filter={`url(#sp-seep-${p.ink})`}
								style="mix-blend-mode:multiply"
								opacity="0.95"
							>
								<use href={`#sp-plate-${p.id}`} />
							</g>
						{/if}
					</g>
				{/if}
			{/each}

			<!-- paper fibre, always on top -->
				<rect
					width="720"
					height="600"
					filter="url(#sp-grain)"
					opacity={grain}
					style="mix-blend-mode:multiply"
				/>
		</svg>
		{:else if browser === "safari"}
			<div class="sp-enable" class:sp-loading={pressing}>
				{#if pressing}
					<span class="sp-spinner" aria-hidden="true"></span>
				{/if}
				<button on:click={startRender}>{ui.play}</button>
				<p>{ui.gate}</p>
			</div>
		{/if}
	</div>

	<fieldset class="sp-panel" disabled={!active}>
		<div class="sp-top">
			<div class="sp-views" role="group" aria-label={ui.viewGroup}>
				<button class:active={view === "all"} on:click={() => (view = "all")}
					>{ui.overprint}</button
				>
				{#each plates as p (p.id)}
					<button class:active={view === p.id} on:click={() => (view = p.id)}
						>{p.label}</button
					>
				{/each}
			</div>

			<div class="sp-zline" aria-label={ui.zOrder}>
				<span class="sp-z">z</span>
				{#each plates as p (p.id)}
					<span class="sp-zkey">
						<i style={`background:${p.color}`}></i>{p.label}
						<em>×{passes}</em>
					</span>
				{/each}
			</div>
		</div>

		<div class="sp-grid">
			<label>
				<span>{ui.exposure}</span>
				<input type="range" min="-1" max="1" step="0.01" bind:value={exposure} />
				<output>{exposureText(exposure)}</output>
			</label>
			<label>
				<span>{ui.seepSpread}</span>
				<input
					type="range"
					min="8"
					max="60"
					step="1"
					bind:value={seepSpread}
				/>
				<output>{seepSpread.toFixed(0)}</output>
			</label>
			<label>
				<span>{ui.mesh}</span>
				<input type="range" min="0.15" max="0.9" step="0.01" bind:value={mesh} />
				<output>{mesh.toFixed(2)}</output>
			</label>
			<label>
				<span>{ui.inkClog}</span>
				<input type="range" min="0" max="1" step="0.01" bind:value={clog} />
				<output>{clog.toFixed(2)}</output>
			</label>
			<label>
				<span>{ui.bleed}</span>
				<input type="range" min="0" max="10" step="0.1" bind:value={bleed} />
				<output>{bleed.toFixed(1)}</output>
			</label>
			<label>
				<span>{ui.edge}</span>
				<input type="range" min="0" max="3" step="0.05" bind:value={edge} />
				<output>{edge.toFixed(2)}</output>
			</label>
			<label>
				<span>{ui.misreg}</span>
				<input type="range" min="0" max="12" step="0.5" bind:value={misreg} />
				<output>{misreg.toFixed(1)}</output>
			</label>
			<label>
				<span>{ui.grain}</span>
				<input type="range" min="0" max="0.35" step="0.01" bind:value={grain} />
				<output>{grain.toFixed(2)}</output>
			</label>
		</div>

		<div class="sp-note">
			{ui.clogNote} {clogProbability.toFixed(2)} · {ui.overTerm}
			{overExposure.toFixed(2)} · {ui.inkTerm} {clog.toFixed(2)}
		</div>

		<div class="sp-actions">
			<button on:click={reseed}>{ui.replate}</button>
			<button class="ghost" on:click={reset}>{ui.reset}</button>
		</div>
	</fieldset>
</div>

<style>
	.sp-lab {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(15rem, 1fr);
		gap: 1rem;
		align-items: stretch;
		margin: 1.75rem 0;
	}

	@media (max-width: 860px) {
		.sp-lab {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.sp-stage {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		width: 100%;
		aspect-ratio: 720 / 600;
		overflow: hidden;
		border-radius: 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		background: #e8dfc9;
		box-shadow: 0 18px 45px -28px rgb(0 0 0 / 0.45);
	}

	.sp-warning {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.7rem;
		padding: 0.65rem 0.8rem;
		border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		border-left: 3px solid #d81b60;
		border-radius: 0.6rem;
		background: color-mix(in srgb, currentColor 4%, transparent);
		font-size: 0.78rem;
		line-height: 1.5;
	}

	.sp-warning strong {
		font-weight: 700;
	}

	.sp-warning span {
		color: color-mix(in srgb, currentColor 68%, transparent);
	}

	.sp-enable {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 1.2rem;
		text-align: center;
		color: #141414;
	}

	.sp-enable.sp-loading > button,
	.sp-enable.sp-loading > p {
		animation: sp-develop 200ms ease-out both;
		opacity: 0;
	}

	.sp-spinner {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 2.2rem;
		height: 2.2rem;
		box-sizing: border-box;
		border: 2.5px solid transparent;
		border-top-color: #141414;
		border-right-color: #141414;
		border-radius: 50%;
		animation: sp-spin 600ms linear infinite;
		pointer-events: none;
	}

	@keyframes sp-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.sp-enable.sp-loading {
		pointer-events: none;
	}

	@keyframes sp-develop {
		0% {
			opacity: 1;
			transform: scale(1);
			filter: blur(0);
		}
		55% {
			opacity: 0.35;
			transform: scale(0.985);
			filter: blur(0.6px);
		}
		100% {
			opacity: 0;
			transform: scale(1.02);
			filter: blur(1.5px);
		}
	}

	.sp-enable button {
		cursor: pointer;
		border: 0;
		border-radius: 0.5rem;
		padding: 0.55rem 1.1rem;
		background: #141414;
		color: #e8dfc9;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.sp-enable p {
		margin: 0;
		max-width: 20rem;
		font-family: "Maple Mono", ui-monospace, monospace;
		font-size: 0.7rem;
		line-height: 1.5;
		color: color-mix(in srgb, #141414 60%, transparent);
	}

	.sp-stage svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.sp-panel {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
		min-inline-size: 0;
		margin: 0;
		gap: 0.9rem;
		height: 100%;
		padding: 0.9rem;
		border-radius: 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		background: color-mix(in srgb, currentColor 4%, transparent);
	}

	.sp-panel:disabled {
		opacity: 0.55;
	}

	.sp-panel:disabled button,
	.sp-panel:disabled input[type="range"] {
		cursor: not-allowed;
	}

	.sp-top {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.sp-views {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, currentColor 7%, transparent);
	}

	.sp-views button,
	.sp-actions button {
		cursor: pointer;
		border: 0;
		border-radius: 0.375rem;
		padding: 0.4rem 0.2rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: inherit;
		background: transparent;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.sp-views button:hover {
		background: color-mix(in srgb, currentColor 8%, transparent);
	}

	.sp-views button.active {
		background: #e8dfc9;
		color: #141414;
	}

	.sp-zline {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0 0.15rem;
		font-family: "Maple Mono", ui-monospace, monospace;
		font-size: 0.7rem;
		color: color-mix(in srgb, currentColor 60%, transparent);
	}

	.sp-z {
		font-weight: 700;
		color: color-mix(in srgb, currentColor 80%, transparent);
	}

	.sp-zkey {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.sp-zkey i {
		display: inline-block;
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 1px;
	}

	.sp-zkey em {
		font-style: normal;
		opacity: 0.65;
	}

	.sp-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		justify-content: space-evenly;
	}

	.sp-grid label {
		display: grid;
		grid-template-columns: 7.2rem minmax(0, 1fr) 3.6rem;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.78rem;
	}

	.sp-grid label > span {
		color: color-mix(in srgb, currentColor 72%, transparent);
		white-space: nowrap;
	}

	.sp-grid output {
		font-family: "Maple Mono", ui-monospace, monospace;
		font-size: 0.72rem;
		text-align: right;
		color: color-mix(in srgb, currentColor 58%, transparent);
		font-variant-numeric: tabular-nums;
	}

	.sp-grid input[type="range"] {
		width: 100%;
		height: 1.1rem;
		appearance: none;
		-webkit-appearance: none;
		background: transparent;
		cursor: pointer;
	}

	.sp-grid input[type="range"]::-webkit-slider-runnable-track {
		height: 0.3rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 16%, transparent);
	}

	.sp-grid input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		margin-top: -0.2rem;
		height: 0.7rem;
		width: 0.7rem;
		border-radius: 999px;
		border: 0;
		background: color-mix(in srgb, currentColor 80%, transparent);
	}

	.sp-grid input[type="range"]::-moz-range-track {
		height: 0.3rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 16%, transparent);
	}

	.sp-grid input[type="range"]::-moz-range-thumb {
		height: 0.7rem;
		width: 0.7rem;
		border-radius: 999px;
		border: 0;
		background: color-mix(in srgb, currentColor 80%, transparent);
	}

	.sp-note {
		font-family: "Maple Mono", ui-monospace, monospace;
		font-size: 0.68rem;
		line-height: 1.4;
		color: color-mix(in srgb, currentColor 55%, transparent);
		padding: 0 0.15rem;
	}

	.sp-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
	}

	.sp-actions button {
		padding: 0.5rem;
		font-size: 0.82rem;
		background: #e8dfc9;
		color: #141414;
	}

	.sp-actions button.ghost {
		background: color-mix(in srgb, currentColor 8%, transparent);
		color: inherit;
	}

	.sp-actions button:hover {
		filter: brightness(1.06);
	}
</style>
