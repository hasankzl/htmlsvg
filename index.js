let patternCount = 0;
let htmlToSvgConfig = {
  downloadSvg: true,
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
  pattern.appendChild(svgImage);
  svgElement.setAttribute("fill", "url(#" + pattern.id + ")");
  defs.appendChild(pattern);
}

module.export = async function htmlToSvg(idDiv, config = htmlToSvgConfig) {
  const mainDiv = document.getElementById(idDiv);
  var mainStyle = window.getComputedStyle(mainDiv);
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

  if (mainStyle.backgroundImage) {
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
    let svgElement;
    switch (htmlElement.tagName) {
      case "P":
      case "H3":
      case "H1":
      case "H2":
      case "H4":
      case "H5":
        svgElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        svgElement.innerHTML = htmlElement.innerHTML;
        svgElement.setAttribute("fill", style.color);
        svgElement.setAttribute("font-family", style.fontFamily);
        svgElement.setAttribute("font-size", style.fontSize);
        svgElement.setAttribute("font-stretch", style.fontStretch);
        svgElement.setAttribute("font-size-adjust", style.fontSizeAdjust);
        svgElement.setAttribute("font-variant", style.fontVariant);
        svgElement.setAttribute("font-weight", style.fontWeight);
        break;
      case "DIV":
        svgElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );

        break;
    }

    svgElement.classList = htmlElement.classList;
    var position = htmlElement.getBoundingClientRect();
    var x = parseInt(position.left) + parseInt(style.marginLeft.slice(0, -2));
    var y = parseInt(position.top) + parseInt(style.marginBottom.slice(0, -2));
    let width = style.width;
    let height = style.height;

    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);
    svgElement.setAttribute("x", x);
    svgElement.setAttribute("y", y);

    // if div has a background image then create a image pattern
    if (style.backgroundImage != "none") {
      await addBackground(defs, svgElement, htmlElement);

      svgElement.style.backgroundImage = style.backgroundImage;
    } else if (htmlElement.style.backgroundColor) {
      svgElement.setAttribute("fill", htmlElement.style.backgroundColor);
    } else if (htmlElement.tagName == "DIV") {
      svgElement.setAttribute("fill-opacity", 0);
    }
    svg.appendChild(svgElement);
  }
  svg.appendChild(defs);
  if (config.downloadSvg) {
    downloadSvg(svg);
  }
  return svg;
};

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

function downloadSvg(svg) {
  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);

  //add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
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
  downloadLink.download = "htmlToSvg.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
