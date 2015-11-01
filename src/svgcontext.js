// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// A rendering context for SVG.
//
// Copyright Mohit Muthanna 2015
// @author Gregory Ristow (2015)

/** @constructor */
Vex.Flow.SVGContext = (function() {
  function SVGContext(element) {
    if (arguments.length > 0) this.init(element);
  }

  // The measureTextCache is used in Javascript runtimes where
  // there is no proper DOM support for SVG bounding boxes. This
  // is currently only useful in the NodeJS visual regression tests.
  SVGContext.measureTextCache = {};

  // If enabled, will start collecting and indexing getBBox data by
  // font name, size, weight, and style. This should be disabled by
  // default (or you will find yourself slowly leaking RAM.)
  SVGContext.collectMeasurements = false;

  // If enabled, will warn if there are new getBBox requests that are
  // not in the cache. This is enabled in the VexFlow tests, and if you
  // see a warning on the console, you will need to enable collectMeasurements
  // above, then update measureTextCache with the new values. See
  // tests/measure_text_cache.js for instructions on how to do this.
  SVGContext.validateMeasurement = false;

  SVGContext.addPrefix = Vex.Prefix;

  SVGContext.prototype = {
    init: function(element) {
      // element is the parent DOM object
      this.element = element;
      // Create the SVG in the SVG namespace:
      this.svgNS = "http://www.w3.org/2000/svg";
      var svg = this.create("svg");
      // Add it to the canvas:
      this.element.appendChild(svg);

      // Point to it:
      this.svg = svg;
      this.groups = [this.svg]; // Create the group stack
      this.parent = this.svg;

      this.path = "";
      this.pen = {x: 0, y: 0};
      this.lineWidth = 1.0;
      this.state = {
        scale: { x: 1, y: 1 },
        "font-family": "Arial",
        "font-size": "8pt",
        "font-weight": "normal"
      };

      this.attributes = {
        "stroke-width": 0.3,
        "fill": "black",
        "stroke": "black",
        "font-family": "Arial",
        "font-size" : "10pt",
        "font-weight" : "normal",
        "font-style" : "normal"
      };

      this.background_attributes = {
        "stroke-width": 0,
        "fill": "white",
        "stroke": "white",
        "font-family": "Arial",
        "font-size" : "10pt",
        "font-weight": "normal",
        "font-style": "normal"
      };

      this.shadow_attributes = {
        width: 0,
        color: "black"
      };

      this.state_stack= [];

      // Test for Internet Explorer
      this.iePolyfill();
    },

    create: function(svgElementType) {
      return document.createElementNS(this.svgNS, svgElementType);
    },

    // Allow grouping elements in containers for interactivity.
    openGroup: function(cls, id, attrs) {
      var group = this.create("g");
      this.groups.push(group);
      this.parent.appendChild(group);
      this.parent = group;
      if (cls) group.setAttribute("class", SVGContext.addPrefix(cls));
      if (id) group.setAttribute("id", SVGContext.addPrefix(id));

      if (attrs && attrs.pointerBBox) {
        group.setAttribute("pointer-events", "bounding-box");
      }
      return group;
    },

    closeGroup: function() {
      var group = this.groups.pop();
      this.parent = this.groups[this.groups.length - 1];
    },

    add: function(elem) {
      this.parent.appendChild(elem);
    },

    // Tests if the browser is Internet Explorer; if it is,
    // we do some tricks to improve text layout.  See the
    // note at ieMeasureTextFix() for details.
    iePolyfill: function() {
      if (typeof(navigator) !== "undefined") {
        this.ie = (  /MSIE 9/i.test(navigator.userAgent) ||
                            /MSIE 10/i.test(navigator.userAgent) ||
                            /rv:11\.0/i.test(navigator.userAgent) ||
                            /Trident/i.test(navigator.userAgent) );
      }
    },

    // ### Styling & State Methods:

    setFont: function(family, size, weight) {
      // Unlike canvas, in SVG italic is handled by font-style,
      // not weight. So: we search the weight argument and
      // apply bold and italic to weight and style respectively.
      var bold = false;
      var italic = false;
      var style = "normal";
      // Weight might also be a number (200, 400, etc...) so we
      // test its type to be sure we have access to String methods.
      if( typeof weight == "string" ) {
          // look for "italic" in the weight:
          if(weight.indexOf("italic") !== -1) {
            weight = weight.replace(/italic/g, "");
            italic = true;
          }
          // look for "bold" in weight
          if(weight.indexOf("bold") !== -1) {
            weight = weight.replace(/bold/g, "");
            bold = true;
          }
          // remove any remaining spaces
          weight = weight.replace(/ /g, "");
      }
      weight = bold ? "bold" : weight;
      weight = (typeof weight === "undefined" || weight === "") ? "normal" : weight;

      style = italic ? "italic" : style;

      var fontAttributes = {
        "font-family": family,
        "font-size": size + "pt",
        "font-weight": weight,
        "font-style" : style
      };

      // Store the font size so that if the browser is Internet
      // Explorer we can fix its calculations of text width.
      this.fontSize = Number(size);

      Vex.Merge(this.attributes, fontAttributes);
      Vex.Merge(this.state, fontAttributes);

      return this;
    },

    setRawFont: function(font) {
      font=font.trim();
      // Assumes size first, splits on space -- which is presently
      // how all existing modules are calling this.
      var fontArray = font.split(" ");

      this.attributes["font-family"] = fontArray[1];
      this.state["font-family"] = fontArray[1];

      this.attributes["font-size"] = fontArray[0];
      this.state["font-size"] = fontArray[0];

      // Saves fontSize for IE polyfill
      this.fontSize = Number(fontArray[0].match(/\d+/));
      return this;
    },

    setFillStyle: function(style) {
      this.attributes.fill = style;
      return this;
    },

    setBackgroundFillStyle: function(style) {
      this.background_attributes.fill = style;
      this.background_attributes.stroke = style;
      return this;
    },

    setStrokeStyle: function(style) {
      this.attributes.stroke = style;
      return this;
    },

    setShadowColor: function(style) {
      this.shadow_attributes.color = style;
      return this;
    },

    setShadowBlur: function(blur) {
      this.shadow_attributes.width = blur;
      return this;
    },

    setLineWidth: function(width) {
      this.attributes["stroke-width"] = width;
      this.lineWidth = width;
    },

    setLineDash: function(lineDash) {
      this.attributes["stroke-linedash"] = lineDash;
      return this;
    },

    setLineCap: function(lineCap) {
      this.attributes["stroke-linecap"] = lineCap;
      return this;
    },

    // ### Sizing & Scaling Methods:

    // TODO (GCR): See note at scale() -- seperate our internal
    // conception of pixel-based width/height from the style.width
    // and style.height properties eventually to allow users to
    // apply responsive sizing attributes to the SVG.
    resize: function(width, height) {
      this.width = width;
      this.height = height;
      this.element.style.width = width;
      var attributes = {
        width : width,
        height : height
      };
      this.applyAttributes(this.svg, attributes);
      return this;
    },

    scale: function(x, y) {
      // uses viewBox to scale
      // TODO (GCR): we may at some point want to distinguish the
      // style.width / style.height properties that are applied to
      // the SVG object from our internal conception of the SVG
      // width/height.  This would allow us to create automatically
      // scaling SVG's that filled their containers, for instance.
      //
      // As this isn't implemented in Canvas or Raphael contexts,
      // I've left as is for now, but in using the viewBox to
      // handle internal scaling, am trying to make it possible
      // for us to eventually move in that direction.

      this.state.scale = { x: x, y: y };
      var visibleWidth = this.width / x;
      var visibleHeight = this.height / y;
      this.setViewBox(0,0, visibleWidth, visibleHeight);

      return this;
    },

    setViewBox: function(xMin, yMin, width, height) {
      // Override for "x y w h" style:
      if(arguments.length == 1) this.svg.setAttribute("viewBox", viewBox);
      else {
        var viewBoxString = xMin + " " + yMin + " " + width + " " + height;
        this.svg.setAttribute("viewBox", viewBoxString);
      }
    },

    // ### Drawing helper methods:

    applyAttributes: function(element, attributes) {
      for(var propertyName in attributes) {
        element.setAttributeNS(null, propertyName, attributes[propertyName]);
      }
      return element;
    },

    flipRectangle: function(args) {
      // Avoid invalid negative height attributes by
      // flipping a rectangle w/ negative height on its head.
      // Since args is the actual arguments object from
      // one of the rectangle functions, we don't need to
      // return it.

      // Add negative height to Y
      args[1] += args[3];
      // Make the negative height positive.
      args[3] = -args[3];
    },

    // ### Shape & Path Methods:

    clear: function() {
      // Clear the SVG by removing all inner children.

      // (This approach is usually slightly more efficient
      // than removing the old SVG & adding a new one to
      // the container element, since it does not cause the
      // container to resize twice.  Also, the resize
      // triggered by removing the entire SVG can trigger
      // a touchcancel event when the element resizes away
      // from a touch point.)

      while (this.svg.lastChild) {
        this.svg.removeChild(this.svg.lastChild);
      }

      // Replace the viewbox attribute we just removed:
      this.scale(this.state.scale.x, this.state.scale.y);
    },

    // ## Rectangles:

    rect: function(x, y, width, height, attributes) {
      // Avoid invalid negative height attribs by
      // flipping the rectangle on its head:
      if (height < 0) this.flipRectangle(arguments);

      // Create the rect & style it:
      var rect = this.create("rect");
      if(typeof attributes === "undefined") attributes = {
        fill: "none",
        "stroke-width": this.lineWidth,
        stroke: "black"
      };
      Vex.Merge(attributes, {
        x: x,
        y: y,
        width: width,
        height: height
      });

      this.applyAttributes(rect, attributes);

      this.add(rect);
      return this;
    },

    fillRect: function(x, y, width, height) {
      if(height < 0) this.flipRectangle(arguments);

      this.rect(x, y, width - 0.5, height - 0.5, this.attributes);
      return this;
    },

    clearRect: function(x, y, width, height) {
      // TODO(GCR): Improve implementation of this...
      // Currently it draws a box of the background color, rather
      // than creating alpha through lower z-levels.
      //
      // See the implementation of this in SVGKit:
      // http://sourceforge.net/projects/svgkit/
      // as a starting point.
      //
      // Adding a large number of transform paths (as we would
      // have to do) could be a real performance hit.  Since
      // tabNote seems to be the only module that makes use of this
      // it may be worth creating a seperate tabStave that would
      // draw lines around locations of tablature fingering.
      //

      if (height < 0) this.flipRectangle(arguments);

      this.rect(x, y, width - 0.5, height - 0.5, this.background_attributes);
      return this;
    },

    // ## Paths:

    beginPath: function() {
      this.path = "";
      this.pen.x = 0;
      this.pen.y = 0;
      return this;
    },

    moveTo: function(x, y) {
      this.path += "M" + x + " " + y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    lineTo: function(x, y) {
      this.path += "L" + x + " " + y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    bezierCurveTo: function(x1, y1, x2, y2, x, y) {
      this.path += "C" +
        x1 + " " +
        y1 + "," +
        x2 + " " +
        y2 + "," +
        x + " " +
        y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    quadraticCurveTo: function(x1, y1, x, y) {
      this.path += "Q" +
        x1 + " " +
        y1 + "," +
        x + " " +
        y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    // This is an attempt (hack) to simulate the HTML5 canvas
    // arc method.
    arc: function(x, y, radius, startAngle, endAngle, antiClockwise) {
      function normalizeAngle(angle) {
        while (angle < 0) {
          angle += Math.PI * 2;
        }

        while (angle > Math.PI * 2) {
          angle -= Math.PI * 2;
        }
        return angle;
      }

      startAngle = normalizeAngle(startAngle);
      endAngle = normalizeAngle(endAngle);

      if (startAngle > endAngle) {
          var tmp = startAngle;
          startAngle = endAngle;
          endAngle = tmp;
          antiClockwise = !antiClockwise;
      }

      var delta = endAngle - startAngle;

      if (delta > Math.PI) {
          this.arcHelper(x, y, radius, startAngle, startAngle + delta / 2,
                         antiClockwise);
          this.arcHelper(x, y, radius, startAngle + delta / 2, endAngle,
                         antiClockwise);
      }
      else {
          this.arcHelper(x, y, radius, startAngle, endAngle, antiClockwise);
      }
      return this;
    },

    arcHelper: function(x, y, radius, startAngle, endAngle, antiClockwise) {
      var x1 = x + radius * Math.cos(startAngle);
      var y1 = y + radius * Math.sin(startAngle);

      var x2 = x + radius * Math.cos(endAngle);
      var y2 = y + radius * Math.sin(endAngle);

      var largeArcFlag = 0;
      var sweepFlag = 0;
      if (antiClockwise) {
        sweepFlag = 1;
        if (endAngle - startAngle < Math.PI)
          largeArcFlag = 1;
      }
      else if (endAngle - startAngle > Math.PI) {
          largeArcFlag = 1;
      }

      this.path += "M" + x1 + " " + y1 + " " + "A" +
        radius + " " + radius + " " + "0 " + largeArcFlag + " " + sweepFlag + " " +
        x2 + " " + y2 + "M" + this.pen.x + " " + this.pen.y;

    },

    closePath: function() {
      this.path += "Z";

      return this;
    },

    // Adapted from the source for Raphael's Element.glow
    glow: function() {
      // Calculate the width & paths of the glow:
      if (this.shadow_attributes.width > 0) {
        var sa = this.shadow_attributes;
        var num_paths = sa.width / 2;
        // Stroke at varying widths to create effect of gaussian blur:
        for (var i = 1; i <= num_paths; i++) {
          var attributes = {
            stroke: sa.color,
            "stroke-linejoin": "round",
            "stroke-linecap": "round",
            "stroke-width": +((sa.width *0.4) / num_paths * i).toFixed(3),
            opacity: +((sa.opacity || 0.3) / num_paths).toFixed(3),
          };

          var path = this.create("path");
          attributes.d = this.path;
          this.applyAttributes(path, attributes);
          this.add(path);
        }
      }
      return this;
    },

    fill: function(attributes) {
      // If our current path is set to glow, make it glow
      this.glow();

      var path = this.create("path");
      if(typeof attributes === "undefined") {
        attributes = {};
        Vex.Merge(attributes, this.attributes);
        attributes.stroke = "none";
      }

      attributes.d = this.path;

      this.applyAttributes(path, attributes);
      this.add(path);
      return this;
    },

    stroke: function() {
      // If our current path is set to glow, make it glow.
      this.glow();

      var path = this.create("path");
      var attributes = {};
      Vex.Merge(attributes, this.attributes);
      attributes.fill = "none";
      attributes["stroke-width"] = this.lineWidth;
      attributes.d = this.path;

      this.applyAttributes(path, attributes);
      this.add(path);
      return this;
    },

    // ## Text Methods:
    measureText: function(text) {
      var index = text + this.attributes["font-style"] + this.attributes["font-family"] +
                  this.attributes["font-weight"] + this.attributes["font-size"];

      var txt = this.create("text");
      if (typeof(txt.getBBox) === "function") {
        txt.textContent = text;
        this.applyAttributes(txt, this.attributes);

        // Temporarily add it to the document for measurement.
        this.svg.appendChild(txt);

        var bbox = txt.getBBox();
        if( this.ie &&
            text !== "" &&
            this.attributes["font-style"] == "italic") bbox = this.ieMeasureTextFix(bbox, text);
        this.svg.removeChild(txt);

        // For runtimes that do not have full support of bounding boxes, collect
        // some data which can be used later to extrapolate them.
        if (SVGContext.collectMeasurements) {
          SVGContext.measureTextCache[index] = {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height
          };
        }
        if (SVGContext.validateMeasurements) {
          if (!(index in SVGContext.measureTextCache)) {
            Vex.W("measureTextCache is stale. Please update tests/measure_text_cache.js: ", index);
          }
        }
        return bbox;
      } else {
        // Inside NodeJS or other runtimes that don't support getBBox. This
        // is currently only useful for the NodeJS visual regression tests.
        return SVGContext.measureTextCache[index];
      }
    },

    ieMeasureTextFix: function(bbox, text) {
    // Internet Explorer over-pads text in italics,
    // resulting in giant width estimates for measureText.
    // To fix this, we use this formula, tested against
    // ie 11:
    // overestimate (in pixels) = FontSize(in pt) * 1.196 + 1.96
    // And then subtract the overestimate from calculated width.

      var fontSize = Number(this.fontSize);
      var m = 1.196;
      var b = 1.9598;
      var widthCorrection = (m * fontSize) + b;
      var width = bbox.width - widthCorrection;
      var height = bbox.height - 1.5;

      // Get non-protected copy:
      var box = {
        x : bbox.x,
        y : bbox.y,
        width : width,
        height : height
      };

      return box;
    },

    fillText: function(text, x, y) {
      var attributes = {};
      Vex.Merge(attributes, this.attributes);
      attributes.stroke = "none";
      attributes.x = x;
      attributes.y = y;

      var txt = this.create("text");
      txt.textContent = text;
      this.applyAttributes(txt, attributes);
      this.add(txt);
    },

    save: function() {
      // TODO(mmuthanna): State needs to be deep-copied.
      this.state_stack.push({
        state: {
          "font-family": this.state["font-family"],
          "font-weight": this.state["font-weight"],
          "font-style": this.state["font-style"],
          "font-size": this.state["font-size"]
        },
        attributes: {
          "font-family": this.attributes["font-family"],
          "font-weight": this.attributes["font-weight"],
          "font-style": this.attributes["font-style"],
          "font-size": this.attributes["font-size"],
          fill: this.attributes.fill,
          stroke: this.attributes.stroke,
          "stroke-width": this.attributes["stroke-width"]
        },
        shadow_attributes: {
          width: this.shadow_attributes.width,
          color: this.shadow_attributes.color
        }
      });
      return this;
    },

    restore: function() {
      // TODO(0xfe): State needs to be deep-restored.
      var state = this.state_stack.pop();
      this.state["font-family"] = state.state["font-family"];
      this.state["font-weight"] = state.state["font-weight"];
      this.state["font-style"] = state.state["font-style"];
      this.state["font-size"] = state.state["font-size"];

      this.attributes["font-family"] = state.attributes["font-family"];
      this.attributes["font-weight"] = state.attributes["font-weight"];
      this.attributes["font-style"] = state.attributes["font-style"];
      this.attributes["font-size"] = state.attributes["font-size"];

      this.attributes.fill = state.attributes.fill;
      this.attributes.stroke = state.attributes.stroke;
      this.attributes["stroke-width"] = state.attributes["stroke-width"];
      this.shadow_attributes.width = state.shadow_attributes.width;
      this.shadow_attributes.color = state.shadow_attributes.color;
      return this;
    }
  };

  return SVGContext;
}());
