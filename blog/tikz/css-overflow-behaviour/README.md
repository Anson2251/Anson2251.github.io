# CSS overflow diagrams

The three SVGs in `src/assets/posts/css-overflow-behaviour/` are compiled from the `.tex` files in this folder.

From `blog/`:

```sh
mkdir -p /tmp/css-overflow-tikz

xelatex -interaction=nonstopmode -halt-on-error \
  -output-directory=/tmp/css-overflow-tikz \
  tikz/css-overflow-behaviour/overflow-area.tex
pdf2svg /tmp/css-overflow-tikz/overflow-area.pdf \
  src/assets/posts/css-overflow-behaviour/overflow-area.svg

xelatex -interaction=nonstopmode -halt-on-error \
  -output-directory=/tmp/css-overflow-tikz \
  tikz/css-overflow-behaviour/automatic-minimum.tex
pdf2svg /tmp/css-overflow-tikz/automatic-minimum.pdf \
  src/assets/posts/css-overflow-behaviour/automatic-minimum.svg

xelatex -interaction=nonstopmode -halt-on-error \
  -output-directory=/tmp/css-overflow-tikz \
  tikz/css-overflow-behaviour/zero-minimum-chain.tex
pdf2svg /tmp/css-overflow-tikz/zero-minimum-chain.pdf \
  src/assets/posts/css-overflow-behaviour/zero-minimum-chain.svg
```

Keep the `.tex` files out of `src/`. `ImageWrapper.astro` uses `import.meta.glob("../../**")`, which tries to import every file under `src`, and a `.tex` file there breaks the build.
