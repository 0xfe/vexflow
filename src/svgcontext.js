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

  SVGContext.prototype = {
    init: function(element) {
      this.debug = false;
      // element is the parent DOM object
      this.element = element;
      // Create the SVG in the SVG namespace:
      this.svgNS = "http://www.w3.org/2000/svg";
      this.svg = this.create("svg");
      // Add it to the canvas:
      this.element.appendChild(this.svg);

      this.path = "";
      this.pen = {x: 0, y: 0};
      this.lineWidth = 1.0;
      this.state = {
        scale: { x: 1, y: 1 },
        "font-family": "Arial",
        "font-size": 8,
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

      // see note at measureTextFix
      this.iePolyfill();
    },

    log: function(args) {
      if(this.debug === true) {
        var logString = "";
        var spacer = "";
        for(var i=0; i<arguments.length; i++) {
          logString += spacer + arguments[i];
          spacer = " ";
        }
        console.log(logString);
      }
    },

    // see note at measureTextFix
    iePolyfill: function() {
        this.ie = (  /MSIE 9/i.test(navigator.userAgent) ||
                            /MSIE 10/i.test(navigator.userAgent) ||
                            /rv:11\.0/i.test(navigator.userAgent) ||
                            /Trident/i.test(navigator.userAgent) );
    },

    // ### Styling & State Methods:

    setFont: function(family, size, weight) {
      // Unlike canvas, in SVG italic is handled by font-style, but bold is
      // handled by font-weight.  So: we search strings to apply these as needed.
      var bold = false;
      var italic = false;
      var style = "normal";
      if( typeof weight == "string" ) {
          if(weight.search("italic") !== -1) {
            weight = weight.replace(/italic/g, "");
            italic = true;
          }
          if(weight.search("bold") !== -1) {
            weight = weight.replace(/bold/g, "");
            bold = true;
          }
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

      // For ie polyfill text.getBBox(); otherwise, not used.
      // Uses fontsize to calculate ie's overpadding of italics
      this.fontSize = Number(size);

      Vex.Merge(this.attributes, fontAttributes);
      Vex.Merge(this.state, fontAttributes);

      return this;
    },

    setRawFont: function(font) {
      // Assume size first, split on space.
      // GCR TODO: What if someone sends it in another order?  Or tries sending styling with it.
      this.attributes["font-family"] = font.split(" ")[1];
      var size = font.split(" ")[0];
      this.attributes["font-size"] = size + "pt";
      this.fontSize = Number(size);
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

    // GCR TODO: Only staveline seems to implement this -- test, test, test.
    setLineDash: function(lineDash) { 
      this.attributes["stroke-linedash"] = lineDash;
      return this; 
    },

    setLineCap: function(lineCap) { 
      this.attributes["stroke-linecap"] = lineCap;
      return this;
    },

    // ### Sizing & Scaling Methods:

    // GCR TODO: See note at scale() -- we should seperate our internal
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
      // GCR TODO: we may at some point want to distinguish the 
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

    // 
    // ### Drawing helper methods:
    //

    applyAttributes: function(element, attributes) {
      for(var propertyName in attributes) {
        element.setAttributeNS(null, propertyName, attributes[propertyName]);
      }
      return element;  
    },

    create: function(svgElementType) {
      return document.createElementNS(this.svgNS, svgElementType);
    },

    flipRectangle: function(args) {
      // Avoid invalid negative height attribs by
      // flipping a rectangle on its head:
      // Note, args is the actual arguments value from
      // one of the rectangle functions, so changing the
      // internal values of it will persist without need
      // to return anything.

      // Add negative height to Y
      args[1] += args[3];
      // Make the negative height positive.
      args[3] = -args[3];
    },

    // ### Shape & Path Methods:

    clear: function() { 
      // remove the old svg from the element canvas:
      this.element.removeChild(this.svg);
      // and wipe the old svg from memory for garbage collection.
      this.svg = this.create("svg"); 
      this.element.appendChild(this.svg);
      // Give the new SVG width, height & viewBox settings:
      this.resize(this.width, this.height);
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

      this.svg.appendChild(rect);
      return this;
    },

    fillRect: function(x, y, width, height) {
      if(height < 0) this.flipRectangle(arguments);

      this.rect(x, y, width - 0.5, height - 0.5, this.attributes);
      return this;
    },

    clearRect: function(x, y, width, height) {
      // GCR TODO: Improve implementation of this...
      // Currently it draws a box of the background color, rather
      // than creating alpha through lower z-levels.
      //
      // We could implement this with inverted clipping paths,
      // dynamically created & added to defs, and applied to all
      // previous children of the SVG.
      //
      // Likely real performance hit by doing that -- and since
      // tabNote seems to be the only module that makes use of this
      // it may be worth creating a seperate tabStave that would
      // draw lines around locations of tablature fingering.
      // We could implement this by creating an inverted clipping path
      // on all previously drawn elements and adding each path to the defs.
      //
      // So: For now we preserve RaphaelContext's approach -- which doesn't
      // clearRect but fills it with whatever background color is specified
      // in background_attributes.
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
          this.svg.appendChild(path);
        }
      }
      return this;
    },

    fill: function(attributes) {
      // GCR to-do implement glow:
      this.glow();

      var path = this.create("path");
      if(typeof attributes === "undefined") {
        attributes = {};
        Vex.Merge(attributes, this.attributes);
      // GCR: or stroke-width 0 as in raphael?  eh...
        attributes.stroke = "none";
      }

      attributes.d = this.path;

      this.applyAttributes(path, attributes);
      this.svg.appendChild(path);
      return this;
    },

    stroke: function() {
      this.glow();

      var path = this.create("path");
      var attributes = {};
      Vex.Merge(attributes, this.attributes);
      attributes.fill = "none";
      attributes["stroke-width"] = this.lineWidth;
      attributes.d = this.path;

      this.applyAttributes(path, attributes);
      this.svg.appendChild(path);
      return this;
    },

    // ## Text Methods:

    measureText: function(text) {
      var txt = this.create("text");
      txt.textContent = text;
      this.applyAttributes(txt, this.attributes);
      this.svg.appendChild(txt);
      var bbox = txt.getBBox();
      if( this.ie && 
          text !== "" &&
          this.attributes["font-style"] == "italic") bbox = this.ieMeasureTextFix(bbox, text);
      this.svg.removeChild(txt);
      return bbox;
    },

    ieMeasureTextFix: function(bbox, text) {
    // Internet Explorer way over-pads text in italics,
    // resulting in giant width estimates for measureText.
    // To fix this, we use this formula, tested against
    // ie 11:
    // overestimate (in pixels) = FontSize(in pt) * 1.196 + 1.96
    // And then subtract the overestimate from calculated width.

      this.log("width: ", bbox.width, " on text ", text);
      var indep = Number(this.fontSize);
      var m = 1.196;
      var b = 1.9598;
      var widthCorrection = (m * indep) + b;
      this.log("Correction formula: " + widthCorrection + " = " + m + " * " + indep + " + " + b );

      var width = bbox.width - widthCorrection;
      var height = bbox.height - 1.5;

      // Get non-protected copy:
      var box = {
        x : bbox.x,
        y : bbox.y,
        width : width,
        height : height
      };

      this.log("adjusted width: ", box.width);
      return box;
    },

    fillText: function(text, x, y) {
      this.log("Draw text: text, x, y:", text, x, y);
      var attributes = {};
      Vex.Merge(attributes, this.attributes);
      attributes.stroke = "none";
      attributes.x = x;
      attributes.y = y;

      var txt = this.create("text");
      txt.textContent = text;
      this.applyAttributes(txt, attributes);
      this.svg.appendChild(txt);
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
