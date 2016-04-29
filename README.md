# PostCSS Sort Style Rules [![Build Status][ci-img]][ci]

[PostCSS] plugin to sort style rules according to selector specificity.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/Justineo/postcss-sort-style-rules.svg
[ci]:      https://travis-ci.org/Justineo/postcss-sort-style-rules

The order of CSS style rules only matters if two selector share same specificity. If two style rules have different specificity, changing their order will be safe and this will increase the chance that two style rules with same specificity become adjacent style rules. This is where [postcss-merge-rules](https://github.com/ben-eb/postcss-merge-rules) become useful.

If a style rule have a group of selectors, we can only rearrange the order if all selectors in one group have lower specificity than those in the other group.

```css
.post {
  font-size: 1.5rem;
}
#title, div a {
  color: #69c;
}
.post {
  color: #ccc;
}
div {
  box-sizing: border-box;
}
```

```css
div {
  box-sizing: border-box;
}
.post {
  font-size: 1.5rem;
}
#title, div a {
  color: #69c;
}
.post {
  color: #ccc;
}
```

## Usage

```js
postcss([ require('postcss-sort-style-rules') ])
```

See [PostCSS] docs for examples for your environment.
