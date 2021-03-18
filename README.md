# htmlToSvg

converts html div to svg images

## Install

```
$ npm install htmlsvg
```

## Usage

```js
import htmlToSvg from "htmlsvg";

const svg = await htmlToSvg("divId");
console.log(svg);
```

You can directly download svg with passing config object

```js
const htmlToSvg = require("htmlsvg");

const svgConfig = {
  download: true,
};
const svg = await htmlToSvg("divId", svgConfig);
console.log(svg);
```
