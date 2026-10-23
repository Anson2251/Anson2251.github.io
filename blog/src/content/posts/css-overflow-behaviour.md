---
title: "A brief note on the CSS's overflow behaviour"
published: 2024-07-27
description: "A brief note on CSS overflow behaviour in grid layouts (draft)."
tags: ["CSS"]
category: "Web Development"
lang: en
draft: true
---

# 0x0: Introduction

When I was working on the Trackmaker project, the overflow behaviour of `grid` kept biting me. I had a side panel that was supposed to scroll, and instead it kept stretching the whole page. I added `overflow-y: auto` in a few places, nothing happened, and I started guessing.

This note is what I wish I had at the time. It covers how the browser decides something has overflowed, and why `min-width: 0` and `min-height: 0` so often fix scrolling inside grid.

![CSS is awesome](../../assets/posts/css-overflow-behaviour/css-is-awesome.png)

> CSS is awesome! [link](https://www.etsy.com/jp/listing/891486110/css-is-awesome-mug)

# 0x1: The box model and what overflow means

An element is made up of content, padding, border, and margin.

![The box model](../../assets/posts/css-overflow-behaviour/box-model.png)

> From "The box model", mdn web docs. [link](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model)

`width` and `height` set the size of the content box by default. With `box-sizing: border-box` they set the size up to the border instead, so padding eats into the room left for content. Either way, once that size is fixed, content can still be larger.

`overflow` does not change whether content is too big. It only changes what the browser does with the extra part. `visible` paints it outside the box. `hidden` clips it. `scroll` clips it and always shows a scrollbar. `auto` clips it and shows a scrollbar only when needed.

# 0x2: How the browser decides something has overflowed

It helps to think of layout as two passes.

First the browser works out how big each box is. For a plain block this comes from `width`, `height`, and the parent. For flex and grid it comes from flex sizing or track sizing, plus `min-width`, `max-width`, `min-height`, `max-height`.

Then it lays out the children and builds what the spec calls the scrollable overflow area. Roughly, that is the union of the box's own content and anything sticking out of it: long words, wide images, absolutely positioned descendants, text with `white-space: nowrap`, and so on. Each child contributes its border box plus some extra cases like text shadows and floats.

If that overflow area is larger than the padding box, the box overflows. That is true even with `overflow: visible`. The property kicks in after the fact. It picks between painting the extra part, clipping it, or turning the box into a scroll container.

This is why `overflow: auto` sometimes looks broken. You added the scrollbar rule, but the box grew to fit the content, so from the browser's point of view nothing overflowed. No overflow, no scrollbar.

A few things that tend to make the content side larger than people expect:

- `white-space: nowrap` stops text from wrapping, so the min content size becomes one very long line.
- Replaced elements like `img` or `video` keep an intrinsic width unless you constrain them with `max-width: 100%`.
- Block children with `width: auto` normally shrink to fit, but a long unbreakable string or a wide nested grid can push their min content size up.

```css
div {
  width: 200px;
  height: 100px;
  overflow: hidden;
}
```

```css
div {
  width: auto; /* or no width defined */
  height: auto; /* or no height defined */
  overflow: visible; /* default */
}
```

In the first block the box stays 200 by 100 and extra content gets clipped. In the second the box grows with content, so nothing counts as overflow.

# 0x3: Why grid and flex items refuse to shrink

Flex items and grid items default to `min-width: auto` and `min-height: auto`. In practice `auto` here means "no smaller than my content." The browser takes the min-content size of what is inside (the longest word, the image width, the nested track) and uses it as a floor.

Grid adds one more twist. `1fr` is shorthand for `minmax(auto, 1fr)`. That leading `auto` is the same automatic minimum. So a track written as `1fr` will not go narrower than the content of the items placed in it, unless you tell it otherwise.

Say you have this:

```css
.grid-container {
  display: grid;
  grid-template-columns: 200px 1fr;
}
.grid-item {
  overflow: auto; /* Adds scrollbar for overflowing content */
}
```

If the second column holds a long URL or a wide table, the item reports a large min-content size. The `1fr` track stretches to honor it. The page gets a horizontal scrollbar instead of the column getting one. Same story vertically:

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  height: 200px;
}
.grid-item {
  overflow: hidden; /* Content is clipped */
}
```

If the row is `auto` sized, or the item sits in a `1fr` row with its automatic minimum intact, the item grows the track instead of clipping. `overflow: hidden` never gets a chance to act because the box itself got bigger.

Flex behaves the same way. A flex item with `flex: 1` still starts with `min-width: auto`, so it resists shrinking past its content:

```css
.flex-container {
  display: flex;
  height: 100px;
}
.flex-item {
  flex: 1; /* Items equally share space */
  overflow: hidden; /* Content gets clipped */
}
```

```css
.flex-container {
  display: flex;
  width: 300px;
}
.flex-item {
  flex: 1; /* Equal widths */
  overflow: scroll; /* Adds a scrollbar if content exceeds */
}
```

Those `overflow` rules only work if the item is allowed to be smaller than its content.

Other sizing knobs still apply. `flex-basis` sets the starting size before growing and shrinking. `min-width` and `max-width` win over it. Content-based tracks like `auto`, `min-content`, and `max-content` grow with content by design, so expect overflow there to paint outward unless you clip it:

```css
.grid-container {
  display: grid;
  grid-template-columns: max-content;
}
.grid-item {
  overflow: visible; /* Content will overflow the grid area */
}
```

Nested layouts stack the problem. A grid inside a flex item, or a flex column inside a grid row, carries its own automatic minimum at each level:

```css
.flex-container {
  display: flex;
  height: 300px;
  overflow: hidden; /* Parent clips overflowing grid */
}
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: auto; /* Grid inside flex can scroll */
}
```

If any ancestor in that chain refuses to shrink, the inner scroller never sees a bounded box.

# 0x4: Why min-width 0 and min-height 0 make scrolling work

Setting `min-width: 0` (or `min-height: 0`) removes that content-based floor. The item may now be narrower or shorter than what is inside it. Only then does the content truly overflow the item's box, and only then can `overflow: auto` create a scrollbar on that box.

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 200px;
}
.grid-item {
  min-width: 0; /* Allow the item to fit inside the grid cell */
  overflow: hidden; /* Clip overflowing content */
}
```

Without the `min-width: 0` line, a long word forces the track wider than 200px. With it, the item stays in its cell and the extra text gets clipped. Swap `hidden` for `auto` and you get a scrollbar on the item instead of the page.

The vertical case is where I got stuck in Trackmaker. I had something like a full height app shell, a header plus a `1fr` row, and a list inside that row that should scroll:

```css
.app {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}
.panel {
  min-height: 0;
  overflow-y: auto;
}
```

`height: 100vh` bounds the grid. `1fr` gives the second row the leftover space. But without `min-height: 0`, `.panel` reports its full content height as its minimum, the row grows past the viewport, and the page scrolls. With `min-height: 0`, `.panel` accepts the row height, its content overflows it, and `overflow-y: auto` scrolls inside.

Two details I keep forgetting:

First, every grid item between the bounded height and the scroller needs the override. If `.panel` contains another grid and the list is one more level down, that middle wrapper also needs `min-height: 0`. One stubborn ancestor is enough to stretch the whole chain.

Second, `minmax(0, 1fr)` on the track does the same job from the other side. `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)` replaces the implicit `auto` minimum with `0`, so items in those tracks may shrink even if they still say `min-width: auto`. I tend to put the fix on the item (`min-w-0` in Tailwind) because it is local to the scroller, and use `minmax(0, 1fr)` when the whole track should be allowed to shrink.

In flex the fix reads the same:

```css
.container {
  display: flex;
  width: 200px;
}

.item {
  flex: 1;
  min-width: 0; /* Allows the item to shrink */
  overflow: hidden; /* Clips the content */
}
```

Leave out `min-width: 0` and the item pushes past 200px to fit its content. Put it back and the item holds at 200px and clips.

So the rule I use: `overflow` needs a box with a bounded size to work against. In grid and flex, `min-width: 0` or `min-height: 0` is what keeps that bound intact.

# 0x5: The pattern I use now

For a scrollable pane inside a grid cell, I write all three parts: a bounded ancestor, a zero minimum on the item, and overflow on the same item. In Tailwind that is usually `min-h-0 overflow-y-auto` (or `min-w-0 overflow-x-auto` sideways) on the direct child of the grid, plus a fixed height or `h-screen`/`h-full` higher up to bound it.

If it still does not scroll, I walk up the tree and look for the ancestor that grew. It is almost always a missing `min-h-0` one level up.
