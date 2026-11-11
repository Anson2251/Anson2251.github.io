import { h } from "hastscript";
import { visit } from "unist-util-visit";

export function parseDirectiveNode() {
	return (tree, { _data }) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				// biome-ignore lint/suspicious/noAssignInExpressions: <check later>
				const data = node.data || (node.data = {});
				node.attributes = node.attributes || {};
				if (
					node.children.length > 0 &&
					node.children[0].data &&
					node.children[0].data.directiveLabel
				) {
					// Add a flag to the node to indicate that it has a directive label
					node.attributes["has-directive-label"] = true;
					// remark-directive v4 keeps trailing whitespace in labels;
					// trim it so the title renders without a stray space.
					let target = node.children[0];
					while (target && target.type !== "text") {
						const kids = target.children;
						if (!kids || kids.length === 0) break;
						target = kids[kids.length - 1];
					}
					if (target && target.type === "text") {
						target.value = target.value.trimEnd();
					}
				}
				const hast = h(node.name, node.attributes);

				data.hName = hast.tagName;
				data.hProperties = hast.properties;
			}
		});
	};
}
