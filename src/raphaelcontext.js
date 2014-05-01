// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// A rendering context for the Raphael backend.
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.RaphaelContext = (function() {
  function RaphaelContext(element) {
    if (arguments.length > 0) this.init(element);
  }

  RaphaelContext.prototype = {
    init: function(element) {
      this.element = element;
      this.paper = Raphael(element);
      this.path = "";
      this.pen = {x: 0, y: 0};
      this.lineWidth = 1.0;
      this.state = {
        scale: { x: 1, y: 1 },
        font_family: "Arial",
        font_size: 8,
        font_weight: 800
      };

      this.attributes = {
        "stroke-width": 0.3,
        "fill": "black",
        "stroke": "black",
        "font": "10pt Arial"
      };

      this.background_attributes = {
        "stroke-width": 0,
        "fill": "white",
        "stroke": "white",
        "font": "10pt Arial"
      };

      this.shadow_attributes = {
        width: 0,
        color: "black"
      };

      this.state_stack= [];
    },

    setFont: function(family, size, weight) {
      this.state.font_family = family;
      this.state.font_size = size;
      this.state.font_weight = weight;
      this.attributes.font = (this.state.font_weight || "") + " " +
        (this.state.font_size * this.state.scale.x) + "pt " +
        this.state.font_family;
      return this;
    },

    setRawFont: function(font) {
      this.attributes.font = font;
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

    // Empty because there is no equivalent in SVG
    setLineDash: function() { return this; },
    setLineCap: function() { return this; },

    scale: function(x, y) {
      this.state.scale = { x: x, y: y };
      this.attributes.scale = x + "," + y + ",0,0";
      this.attributes.font = this.state.font_size * this.state.scale.x + "pt " +
        this.state.font_family;
      this.background_attributes.scale = x + "," + y + ",0,0";
      this.background_attributes.font = this.state.font_size *
        this.state.scale.x + "pt " +
        this.state.font_family;
      return this;
    },

    clear: function() { this.paper.clear(); },

    resize: function(width, height) {
      this.element.style.width = width;
      this.paper.setSize(width, height);
      return this;
    },

    rect: function(x, y, width, height) {
      if (height < 0) {
        y += height;
        height = -height;
      }

      this.paper.rect(x, y, width - 0.5, height - 0.5).
        attr(this.attributes).
        attr("fill", "none").
        attr("stroke-width", this.lineWidth); return this;
    },

    fillRect: function(x, y, width, height) {
      if (height < 0) {
        y += height;
        height = -height;
      }

      this.paper.rect(x, y, width - 0.5, height - 0.5).
        attr(this.attributes);
      return this;
    },

    clearRect: function(x, y, width, height) {
      if (height < 0) {
        y += height;
        height = -height;
      }

      this.paper.rect(x, y, width - 0.5, height - 0.5).
        attr(this.background_attributes);
      return this;
    },

    beginPath: function() {
      this.path = "";
      this.pen.x = 0;
      this.pen.y = 0;
      return this;
    },

    moveTo: function(x, y) {
      this.path += "M" + x + "," + y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    lineTo: function(x, y) {
      this.path += "L" + x + "," + y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    bezierCurveTo: function(x1, y1, x2, y2, x, y) {
      this.path += "C" +
        x1 + "," +
        y1 + "," +
        x2 + "," +
        y2 + "," +
        x + "," +
        y;
      this.pen.x = x;
      this.pen.y = y;
      return this;
    },

    quadraticCurveTo: function(x1, y1, x, y) {
      this.path += "Q" +
        x1 + "," +
        y1 + "," +
        x + "," +
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

      this.path += "M" + x1 + "," + y1 + "," + "A" +
        radius + "," + radius + "," + "0," + largeArcFlag + "," + sweepFlag + "," +
        x2 + "," + y2 + "M" + this.pen.x + "," + this.pen.y;
    },

    // Adapted from the source for Raphael's Element.glow
    glow: function() {
      var out = this.paper.set();
      if (this.shadow_attributes.width > 0) {
        var sa = this.shadow_attributes;
        var num_paths = sa.width / 2;
        for (var i = 1; i <= num_paths; i++) {
          out.push(this.paper.path(this.path).attr({
            stroke: sa.color,
            "stroke-linejoin": "round",
            "stroke-linecap": "round",
            "stroke-width": +(sa.width / num_paths * i).toFixed(3),
            opacity: +((sa.opacity || 0.3) / num_paths).toFixed(3)
          }));
        }
      }
      return out;
    },

    fill: function() {
      var elem = this.paper.path(this.path).
        attr(this.attributes).
        attr("stroke-width", 0);
      this.glow(elem);
      return this;
    },

    stroke: function() {
      var elem = this.paper.path(this.path).
        attr(this.attributes).
        attr("fill", "none").
        attr("stroke-width", this.lineWidth);
      this.glow(elem);
      return this;
    },

    closePath: function() {
      this.path += "Z";
      return this;
    },

    measureText: function(text) {
      var txt = this.paper.text(0, 0, text).
        attr(this.attributes).
        attr("fill", "none").
        attr("stroke", "none");

      return {
        width: txt.getBBox().width,
        height: txt.getBBox().height
      };
    },

    fillText: function(text, x, y) {
      this.paper.text(x + (this.measureText(text).width / 2),
          (y - (this.state.font_size / (2.25 * this.state.scale.y))), text).
        attr(this.attributes);
      return this;
    },

    save: function() {
      // TODO(mmuthanna): State needs to be deep-copied.
      this.state_stack.push({
        state: {
          font_family: this.state.font_family
        },
        attributes: {
          font: this.attributes.font,
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
      this.state.font_family = state.state.font_family;
      this.attributes.font = state.attributes.font;
      this.attributes.fill = state.attributes.fill;
      this.attributes.stroke = state.attributes.stroke;
      this.attributes["stroke-width"] = state.attributes["stroke-width"];
      this.shadow_attributes.width = state.shadow_attributes.width;
      this.shadow_attributes.color = state.shadow_attributes.color;
      return this;
    }
  };

  return RaphaelContext;
}());
