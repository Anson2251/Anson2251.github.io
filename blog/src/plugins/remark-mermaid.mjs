import { visit } from "unist-util-visit";

// Converts ```mermaid fences into raw <pre class="mermaid-src"> blocks
// BEFORE expressive-code / rehype see them, so diagrams are rendered
// client-side by the Mermaid component instead of shown as code.
export function remarkMermaid() {
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (!parent || index == null || node.lang !== "mermaid") return;
			const escaped = node.value
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
			parent.children[index] = {
				type: "html",
				value: `<pre class="mermaid-src not-prose" data-pagefind-ignore>${escaped}</pre>`,
			};
		});
	};
}
