let patternCount = 0;
let htmlToSvgConfig = {
  downloadSvg: true,
  filename: "htmlsvg",
};
async function addBackground(defs, svgElement, htmlElement) {
  let style = window.getComputedStyle(htmlElement);
  const imageProp = await getBackgroundProp(style);

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
  svgImage.setAttribute("href", imageProp.src);
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
  svg.classList = mainDiv.classList;
  svg.style = mainDiv.style;
  svg.id = "svg";
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  if (mainStyle.backgroundImage !== "none") {
    const svgRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    svgRect.setAttribute("x", "0");
    svgRect.setAttribute("y", "0");
    svgRect.setAttribute("width", width);
    svgRect.setAttribute("height", height);

    await addBackground(defs, svgRect, mainDiv);

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

    let width =
      parseInt(elementPosition.width) +
      parseInt(style.paddingLeft.slice(0, -2)) +
      parseInt(style.paddingRight.slice(0, -2));
    let height =
      parseInt(elementPosition.height) +
      parseInt(style.paddingTop.slice(0, -2)) +
      parseInt(style.paddingBottom.slice(0, -2));
    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);
    svgElement.setAttribute("x", x);
    svgElement.setAttribute("y", y);

    // if div has a background image then create a image pattern
    if (style.backgroundImage != "none") {
      await addBackground(defs, svgElement, htmlElement);

      svgElement.style.backgroundImage = style.backgroundImage;
    } else if (style.backgroundColor) {
      svgElement.setAttribute("fill", style.backgroundColor);
    } else if (htmlElement.tagName == "DIV") {
      svgElement.setAttribute("fill-opacity", 0);
    }
    switch (htmlElement.tagName) {
      case "IMG":
        svgImage = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
        );
        svgImage.setAttribute("href", htmlElement.src);
        svgImage.setAttribute("width", width);
        svgImage.setAttribute("height", height);
        svgImage.setAttribute("x", x);
        svgImage.setAttribute("y", y);
        svgElement = svgImage;
        break;
      case "P":
      case "H3":
      case "H1":
      case "H2":
      case "H4":
      case "H5":
      case "SPAN":
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
    }
    svg.appendChild(svgElement);

    if (svgText) {
      svg.appendChild(svgText);
    }
  }
  svg.appendChild(defs);
  if (config.downloadSvg) {
    downloadSvg(svg, config.filename);
  }
  return svg;
}

function findAllChilds(div) {
  const elements = [];
  function _findAllChilds(_div) {
    elements.push(_div);
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
