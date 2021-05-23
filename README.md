# htmlsvg

converts html element to svg element (rect,text,img).

### online demo:

https://htmlsvg.netlify.app/

## Install

```
$ npm install htmlsvg
```

## Usage

```js
import htmlToSvg from "htmlsvg";
const htmlElement = document.getElementById("DivId");
const svg = await htmlToSvg(htmlElement);
console.log(svg);
```

You can directly download svg with passing config object

```js
import htmlToSvg from "htmlsvg";

const svgConfig = {
  downloadSvg: true,
  filename: "htmltosvg",
};
const htmlElement = document.getElementById("DivId");
const svg = await htmlToSvg(htmlElement, svgConfig);
console.log(svg);
```

You can directly download png with passing config object

```js
import htmlToSvg from "htmlsvg";

const svgConfig = {
  downloadSvg: true,
  downloadPng: true,
  convertDataUrl: true, // you need to convert images to dataurl if you wanna download png image
  filename: "htmltosvg",
};
const htmlElement = document.getElementById("DivId");
const svg = await htmlToSvg(htmlElement, svgConfig);
console.log(svg);
```
