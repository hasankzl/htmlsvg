# htmlToSvg
[![npm (scoped)]](https://www.npmjs.com/package/htmltosvg)
[![npm bundle size (minified)]](https://www.npmjs.com/package/htmltosvg)

converts html div to svg images

## Install

```
$ npm install htmltosvg
```

## Usage

```js
const htmlToSvg = require("htmltosvg");

const svg = htmlToSvg("divId");
console.log(svg)

```

You can directly download svg with passing config object


```js
const htmlToSvg = require("htmltosvg");

const svgConfig = {
    download:true
}
const svg = htmlToSvg("divId",svgConfig);
console.log(svg)

```