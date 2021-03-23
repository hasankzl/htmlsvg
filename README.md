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
  download: true,
  filename: "htmltosvg",
};
const htmlElement = document.getElementById("DivId");
const svg = await htmlToSvg(htmlElement, svgConfig);
console.log(svg);
```
