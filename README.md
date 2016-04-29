# PostCSS Sort Style Rules [![Build Status][ci-img]][ci]

[PostCSS] plugin to sort style rules according to selector specificity.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/Justineo/postcss-sort-style-rules.svg
[ci]:      https://travis-ci.org/Justineo/postcss-sort-style-rules

The position of CSS rule

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
