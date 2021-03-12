function calculateSvg(text) {
  const mainDiv = document.getElementById(text);
  var mainStyle = window.getComputedStyle(mainDiv);
  let width = mainDiv.offsetWidth;
  let height = mainDiv.offsetHeight;
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  // svg.classList = mainDiv.classList;
  // svg.style = mainDiv.style;
  svg.id = "svg";
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  if (mainStyle.backgroundImage) {
    const svgImage = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    const imgSrc = mainStyle.backgroundImage.slice(4, -1).replace(/["']/g, "");

    // Select the image
    getDataUrl(imgSrc, svgImage);
    svgImage.setAttribute("x", "0");
    svgImage.setAttribute("y", "0");
    svg.appendChild(svgImage);
  }
  svg.style.backgroundColor = mainDiv.style.backgroundColor;

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

        if (htmlElement.style.backgroundColor) {
          svgElement.setAttribute("fill", htmlElement.style.backgroundColor);
        } else {
          svgElement.setAttribute("fill-opacity", 0);
        }
        break;
    }

    svgElement.classList = htmlElement.classList;
    var position = htmlElement.getBoundingClientRect();
    var x = position.left;
    var y = position.top;
    let width = style.width;
    let height = style.height;

    svgElement.setAttribute("width", width);
    svgElement.setAttribute("height", height);
    svgElement.setAttribute(
      "x",
      parseInt(x) + parseInt(style.marginLeft.slice(0, -2))
    );
    svgElement.setAttribute(
      "y",
      parseInt(y) + parseInt(style.marginBottom.slice(0, -2))
    );

    svg.appendChild(svgElement);
  }

  document.body.appendChild(svg);
  // downloadSvg();
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

function downloadSvg() {
  var svg = document.getElementById("svg");

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
  debugBase64(url);
  //set url value to a element's href attribute.
  document.getElementById("link").href = url;
}
function debugBase64(base64URL) {
  var win = window.open();
  win.document.write(
    '<iframe src="' +
      base64URL +
      '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
  );
}

function getDataUrl(url, svgImg) {
  var img = new Image();
  img.src = url;
  img.crossOrigin = "anonymous";
  img.onload = function () {
    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);
    svgImg.setAttribute("href", canvas.toDataURL("image/png"));
  };
}
