let patternCount = 0;

let htmlToSvgConfig = {
  downloadSvg: false,
  downloadPng: false,
  filename: "htmlsvg",
  convertDataUrl: false,
};

const toDataURL = (url) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

async function addBackground(defs, svgElement, htmlElement, convertDataUrl) {
  let style = window.getComputedStyle(htmlElement);
  let imageProp = await getBackgroundProp(style);

  var pattern = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "pattern"
  );
  const svgImage = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );
  pattern.id = "pattern" + patternCount;
  patternCount++;
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("height", imageProp.height);
  pattern.setAttribute("width", imageProp.width);

  svgImage.setAttribute("height", imageProp.height);
  svgImage.setAttribute("width", imageProp.width);

  if (convertDataUrl) {
    await toDataURL(imageProp.src).then((dataUrl) => {
      svgImage.setAttribute("href", dataUrl);
    });
  } else {
    svgImage.setAttribute("href", imageProp.src);
  }
  svgImage.setAttribute("x", svgElement.getAttribute("x"));
  svgImage.setAttribute("y", svgElement.getAttribute("y"));
  pattern.appendChild(svgImage);
  svgElement.setAttribute("fill", "url(#" + pattern.id + ")");
  defs.appendChild(pattern);
}

export default async function htmlToSvg(mainDiv, config = htmlToSvgConfig) {
  var mainStyle = window.getComputedStyle(mainDiv);
  var mainDivPosition = mainDiv.getBoundingClientRect();
  let width = mainDiv.offsetWidth;
  let height = mainDiv.offsetHeight;
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
  svg.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
  svg.setAttribute("xmlns:svg", "http://www.w3.org/2000/svg");
  svg.classList = mainDiv.classList;
  svg.style = mainDiv.style;
  svg.id = "svg";
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  // make the SVG responsive
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  if (mainStyle.backgroundImage !== "none") {
    const svgRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    svgRect.setAttribute("x", "0");
    svgRect.setAttribute("y", "0");
    svgRect.setAttribute("width", width);
    svgRect.setAttribute("height", height);

    await addBackground(defs, svgRect, mainDiv, config.convertDataUrl);

    svg.appendChild(svgRect);
  }

  const elements = findAllChilds(mainDiv);
  for (var i = 1; i < elements.length; i++) {
    const htmlElement = elements[i];
    var style = window.getComputedStyle(htmlElement);
    var elementPosition = htmlElement.getBoundingClientRect();
    let svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    let svgText;
    if (svgElement.classList) {
      svgElement.classList = htmlElement.classList;
    }
    copyNodeStyle(htmlElement, svgElement);

    var position = htmlElement.getBoundingClientRect();
    var x = parseInt(position.left) - parseInt(mainDivPosition.left);
    var y = parseInt(position.top) - parseInt(mainDivPosition.top);

    let width = parseInt(elementPosition.width);
    let height = parseInt(elementPosition.height);
    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);
    svgElement.setAttribute("x", x);
    svgElement.setAttribute("y", y);
    // if div has a background image then create a image pattern
    if (style.backgroundImage !== "none") {
      await addBackground(defs, svgElement, htmlElement, config.convertDataUrl);

      svgElement.style.backgroundImage = style.backgroundImage;
    } else if (style.backgroundColor) {
      svgElement.setAttribute("fill", style.backgroundColor);
    } else if (htmlElement.tagName == "DIV") {
      svgElement.setAttribute("fill-opacity", 0);
    }
    switch (htmlElement.tagName.toUpperCase()) {
      case "IMG":
        let svgImage = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
        );
        if (config.convertDataUrl) {
          await toDataURL(htmlElement.src).then((dataUrl) => {
            svgImage.setAttribute("href", dataUrl);
          });
        } else {
          svgImage.setAttribute("href", htmlElement.src);
        }
        svgImage.setAttribute("width", width);
        svgImage.setAttribute("height", height);
        svgImage.setAttribute("x", x);
        svgImage.setAttribute("y", y);
        svgElement = svgImage;
        break;
      case "SVG":
        /**
         * most elegant solution would be to nest the SVG but,
         * nested SVGs do not maintain position when opened in Ai
         *
         * svgElement = htmlElement.cloneNode(true);
         *
         * workaround: transform the SVGs in groups <g> and
         * adjust the position with transform="translate(x y)"
         */
        svgElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );
        svgElement.innerHTML = htmlElement.innerHTML;
        svgElement.setAttribute("transform", `translate(${x} ${y})`);
        /**
         * when using viewBox, use this:
         * the output SVG is bigger and the group gets by default centered,
         * so we need to translate the group
         *
         * const outputSvgHeight = mainDiv.offsetHeight;
         * const thisSVGHeight = htmlElement.getBBox().height;
         * let translateY = -(outputSvgHeight - thisSVGHeight) / 2;
         * svgElement.setAttribute("transform", `translate(0 ${translateY}) scale(1)`);
         */
        break;
      case "P":
      case "H3":
      case "H1":
      case "H2":
      case "H4":
      case "H5":
      case "SPAN":
      case "TD":
      case "TH":
      case "BUTTON":
        svgText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        svgText.innerHTML = htmlElement.innerHTML;
        svgText.setAttribute("fill", style.color);
        svgText.setAttribute("font-family", style.fontFamily);
        svgText.setAttribute("font-size", style.fontSize);
        svgText.setAttribute("font-stretch", style.fontStretch);
        svgText.setAttribute("font-size-adjust", style.fontSizeAdjust);
        svgText.setAttribute("font-variant", style.fontVariant);
        svgText.setAttribute("font-weight", style.fontWeight);
        x += parseInt(style.paddingLeft.slice(0, -2));
        y +=
          parseInt(style.paddingTop.slice(0, -2)) +
          parseInt(style.fontSize.slice(0, -2)) -
          2;

        svgText.setAttribute("x", x);
        svgText.setAttribute("y", y);

        break;
      default:
        break;
    }
    if (svgText) {
      svg.appendChild(svgText);
    } else {
      svg.appendChild(svgElement);
    }
  }
  svg.appendChild(defs);
  if (config.downloadSvg) {
    downloadSvg(svg, config.filename);
  }
  if (config.downloadPng) {
    downloadPng(svg, config.filename);
  }
  return svg;
}
function downloadPng(svg, filename) {
  var svgData = new XMLSerializer().serializeToString(svg);
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  canvas.width = svg.getAttribute("width");
  canvas.height = svg.getAttribute("height");
  var img = document.createElement("img");
  img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));
  var link = document.createElement("a");
  link.download = filename + ".png";
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    // Now is done
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}
function findAllChilds(div) {
  const elements = [];
  function _findAllChilds(_div) {
    elements.push(_div);
    // do not parse SVGs
    if (_div.tagName.toUpperCase() == "SVG") return;
    if (_div.hasChildNodes()) {
      var searchEles = _div.children;
      for (var i = 0; i < searchEles.length; i++) {
        _findAllChilds(searchEles[i]);
      }
    }
  }
  _findAllChilds(div);
  return elements;
}

function getBackgroundProp(style) {
  let prop;
  var src = style.backgroundImage
    .replace(/url\((['"])?(.*?)\1\)/gi, "$2")
    .split(",")[0];

  // I just broke it up on newlines for readability
  return new Promise((resolve) => {
    var image = new Image();
    image.src = src;
    image.onload = function () {
      var width = image.width,
        height = image.height;
      prop = { width, height, src };
      resolve(prop);
    };
  });
}

function downloadSvg(svg, filename) {
  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);

  // for ie
  if (window.navigator.msSaveBlob) {
    var blob = new Blob([source], {
      type: "data:image/svg+xml;charset=utf-8;",
    });
    window.navigator.msSaveOrOpenBlob(blob, filename + ".svg");
  } else {
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename + ".svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

function copyNodeStyle(sourceNode, targetNode) {
  var computedStyle = window.getComputedStyle(sourceNode);
  targetNode.style.opacity = computedStyle.opacity;
  targetNode.style.border = computedStyle.border;
}
