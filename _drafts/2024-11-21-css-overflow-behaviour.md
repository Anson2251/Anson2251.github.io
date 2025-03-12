---
layout: post
title: "A brirf note on the CSS's overflow behaviour"
date: 2024-07-27 22:30:00 +0800
categories: css programming
---

{% include override-styles.html %}

# 0x0: Introduction

When I was working on the Trackmaker project, the overflow behaviour of `grid` became a really annoying problem to me. So I wrote this note to record my findings and hopefully help others who are facing the same issue.

<img src="/assets/2024-11-21-css-overflow-behaviour/css-is-awesome.png" style="max-width: 256px" alt="CSS is awesome" />

> CSS is awesome! [link](www.etsy.com/jp/listing/891486110/css-is-awesome-mug)


# 0x1: On the CSS Box Model and Overflow

The Box Model in CSS is a fundamental concept that describes how an element is laid out on a web page. 

An element is made up of four parts: content, padding, border, and margin.

<img src="/assets/2024-11-21-css-overflow-behaviour/box-model.png" alt="The box model" style="max-width: 512px"  />

> From "The box model", mdn web docs. [link](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model)

The behavior of an HTML element when its content exceeds its defined size is primarily determined by its **CSS box model properties** and **overflow behavior**. Here's a breakdown of the key factors:

---

### 1. **CSS Box Model Properties**
   - **`width` and `height`**:
     - If `width` and `height` are explicitly set, the element will try to constrain itself to those dimensions.
     - If they are not set, the element will grow to fit its content by default (block-level elements).

   - **`box-sizing`**:
     - Default: `content-box` (content is sized separately from padding and border).
     - With `box-sizing: border-box`, the `width` and `height` include padding and borders, which may restrict how the content fits.

---

### 2. **Overflow Behavior**
   - **`overflow` Property**:
     - Default: `visible` (content overflows the element and is not clipped).
     - `hidden`: Content is clipped and does not stretch the element.
     - `scroll`: Adds a scrollbar, keeping the element size fixed.
     - `auto`: Behaves like `scroll` if content overflows, otherwise like `visible`.

---

### 3. **Flexbox or Grid Container Rules**
   - In a **flexbox** or **grid** layout, child elements may stretch to fit the available space due to container properties:
     - `align-items: stretch` (default for flexbox and grid) causes items to stretch in the cross axis.
     - To prevent stretching, set `align-self` or `align-items` to `start`, `center`, or `end`.

---

### 4. **White-Space Handling**
   - **Text Content**:
     - If `white-space: nowrap`, text will not wrap and may cause the container to stretch horizontally.
     - If `white-space` is `normal` (default), text will wrap, and the container will grow vertically instead.

---

### 5. **Positioning and Display Context**
   - **Positioning (`position`)**:
     - `absolute` or `fixed` positioned elements are not influenced by sibling elements and will not stretch them.
     - `static` (default) or `relative` positioned elements can stretch the parent if they have overflow content.

   - **`display` Property**:
     - Block-level elements (`display: block`) grow to accommodate content unless constrained.
     - Inline elements (`display: inline`) grow with content width.

---

### Examples

#### Prevent Stretching:
```css
div {
  width: 200px;
  height: 100px;
  overflow: hidden;
}
```

#### Allow Content to Stretch the Container:
```css
div {
  width: auto; /* or no width defined */
  height: auto; /* or no height defined */
  overflow: visible; /* default */
}
```

---

If you have a specific example or scenario, feel free to share, and I can tailor the explanation!

When using **Flexbox** or **CSS Grid**, the behavior of the `overflow` property interacts with the layout rules of these systems. Below is a more detailed explanation of how `overflow` works in these contexts:

---

### **1. Flexbox Overflow Behavior**
In a **flexbox container**, child elements (flex items) may stretch, shrink, or grow based on the flexbox rules. The `overflow` property governs what happens when the content of a child exceeds the size of its container.

#### **1.1. Flexbox and Default Stretching**
- By default, `align-items: stretch` causes flex items to stretch to match the cross-axis size of the flex container (e.g., height in a row-oriented flexbox).
- If the content of a child exceeds the size of the flex container:
  - The `overflow` property of the flex **item** determines how the excess content behaves.
  - Example:
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

#### **1.2. Flexbox Shrinking and Overflow**
- When `flex-shrink` is applied (default `flex-shrink: 1`), the flex item can shrink smaller than its content.
- If the content size is less than the reduced size of the item:
  - The content overflows, and the `overflow` property handles it (e.g., `hidden`, `scroll`, `auto`).
- Example:
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

#### **1.3. Flex Basis and Min/Max Width**
- Flex items respect `min-width`, `max-width`, and `flex-basis`.
- If `flex-basis` creates a size smaller than the content:
  - Content overflows based on `overflow` settings.
  - Example:
    ```css
    .flex-container {
      display: flex;
    }
    .flex-item {
      flex-basis: 100px; /* Basis smaller than content */
      min-width: 150px; /* Overrides basis, prevents overflow */
    }
    ```

---

### **2. Grid Overflow Behavior**
In a **CSS Grid**, each child element (grid item) is assigned a space in the grid. The `overflow` behavior depends on the size of the grid cell, grid tracks, and the content inside.

#### **2.1. Grid Tracks and Overflow**
- Grid tracks (columns and rows) may have sizes set with:
  - **Fixed values**: `px`, `em`
  - **Fractional units**: `fr`
  - **Minmax constraints**: `minmax(min, max)`
  - **Content-based sizing**: `auto`
- If the content exceeds the size of the track:
  - The `overflow` property of the grid item determines how the excess content is handled.
  - Example:
    ```css
    .grid-container {
      display: grid;
      grid-template-columns: 200px 1fr;
    }
    .grid-item {
      overflow: auto; /* Adds scrollbar for overflowing content */
    }
    ```

#### **2.2. Stretching in Grid**
- Default: `align-items: stretch` and `justify-items: stretch` cause grid items to stretch to fill their assigned grid cell.
- If a grid item stretches and its content exceeds the container:
  - `overflow` governs whether the excess content is visible, hidden, or scrollable.
- Example:
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

#### **2.3. Content-Sized Tracks**
- Tracks sized with `auto` or `min-content` grow to fit the content.
- Tracks sized with `max-content` grow to fit the largest content but stop at their natural size unless constrained.
- Example:
    ```css
    .grid-container {
      display: grid;
      grid-template-columns: max-content;
    }
    .grid-item {
      overflow: visible; /* Content will overflow the grid area */
    }
    ```

---

### **3. Overflow Inside Nested Flex or Grid**
When a **nested flexbox or grid container** exists, the `overflow` property of the inner container determines how its content interacts with the parent container:
- Example: A flex item containing a grid layout.
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

---

### Summary of Key Interactions
1. **Flexbox**:
   - Flex items can shrink or stretch, potentially causing overflow based on their `flex-basis`, `min-width`, and `max-width`.
   - `overflow` of flex items determines how extra content is handled.

2. **Grid**:
   - Grid tracks determine the area available for content.
   - Content may overflow its grid area based on track sizing and `overflow` settings.

3. **General Notes**:
   - Use `overflow: hidden` to clip content, `scroll` to allow scrolling, and `auto` for conditional scrolling.
   - For better control, combine `min-*`/`max-*` constraints with `overflow`.

If you have a specific scenario (e.g., nested grids or specific flex rules), feel free to share more details!

Setting `min-width: 0` and `min-height: 0` in **CSS Grid** and **Flexbox** is helpful for overflow behavior because of how **default minimum sizing constraints** work in these layout systems. By default, grid items and flex items have a minimum size that is larger than `0` under certain circumstances, which can cause the content to stretch its container. Let’s break it down in detail.

---

### **1. Default Minimum Size in Flexbox and Grid**

#### **1.1. Default Behavior**
- For **flex items** and **grid items**, the `min-width` and `min-height` are not `0` by default. Instead, they are typically set to:
  - `auto` for `min-width` and `min-height`:
    - This allows the item to expand to fit its content's intrinsic size (e.g., the width of text or an image's natural dimensions).
    - Even if the item is instructed to shrink or fit within a smaller container, the intrinsic size prevents it from getting smaller than the content size.
  - **This behavior ensures that content is readable and does not collapse entirely.**

#### **1.2. How This Affects Overflow**
- If a flex or grid container tries to shrink an item smaller than its content size:
  - The item's **minimum size** (`min-width: auto`) stops it from shrinking further.
  - This may cause the container or the layout to overflow unintentionally, as the content stretches beyond its boundaries.

---

### **2. Why `min-width: 0` and `min-height: 0` Help**

When you explicitly set `min-width: 0` and `min-height: 0`, you override the default behavior and **allow the item to shrink below its intrinsic size**. This makes handling overflow more predictable and ensures the container doesn't stretch unnecessarily.

#### **2.1. In Flexbox**
- Flex items have a default `min-width: auto`, which means:
  - If content inside a flex item is larger than the allocated space, the item resists shrinking smaller than the content.
  - Setting `min-width: 0` allows the flex item to shrink beyond the intrinsic size of the content and fit within the container.

  **Example:**
  ```css
  .flex-container {
    display: flex;
    width: 200px;
  }
  .flex-item {
    flex: 1; /* Share space equally */
    min-width: 0; /* Allow the item to shrink */
    overflow: hidden; /* Clip content if it overflows */
  }
  ```

#### **2.2. In CSS Grid**
- Grid items also default to `min-width: auto`, especially when the grid tracks are sized with `fr` units or `auto`.
- This means:
  - A grid item with content larger than the allocated grid cell can cause the grid track to expand, breaking the layout.
  - Setting `min-width: 0` ensures the grid item stays within its assigned cell and doesn't stretch the track.

  **Example:**
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

---

### **3. Scenarios Where This Is Crucial**

#### **3.1. Long Text in Flex/Grid Items**
- Without `min-width: 0`, long text (or unbreakable content like URLs) will force a flex or grid item to expand to accommodate it, breaking the layout.
- Adding `min-width: 0` allows the text to be clipped or wrapped based on `overflow` and `white-space` settings.

#### **3.2. Nested Layouts**
- Nested flex or grid containers may inherit the default `min-width: auto`, leading to unexpected layout behavior.
- Overriding with `min-width: 0` ensures predictable shrinking within nested layouts.

#### **3.3. Scrollable Content**
- Scrollable containers (with `overflow: auto` or `scroll`) often need `min-width: 0` to prevent content from stretching beyond the container's bounds.

---

### **4. Practical Example**

**Without `min-width: 0`:**
```css
.container {
  display: flex;
  width: 200px;
}

.item {
  flex: 1;
  overflow: hidden;
  /* No min-width, so the item stretches to fit content */
}
```

- Result: If the content inside `.item` is wider than 200px, it forces the container to stretch or overflow.

**With `min-width: 0`:**
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

- Result: The `.item` shrinks to fit the container, and overflow is clipped.

---

### **5. Summary**
- **Default `min-width: auto` and `min-height: auto`** make items resist shrinking below their intrinsic content size.
- Setting `min-width: 0` and `min-height: 0` ensures:
  - Items can shrink fully within their containers.
  - Predictable handling of overflow in both flex and grid layouts.
  - Prevents content from unintentionally stretching the container.

This simple rule is especially helpful in complex layouts with dynamic content or nested containers.

