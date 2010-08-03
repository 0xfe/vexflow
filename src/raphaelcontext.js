// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// A rendering context for the Raphael backend.
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.RaphaelContext = function(element) {
  if (arguments.length > 0) this.init(element)
}

Vex.Flow.RaphaelContext.prototype.init = function(element) {
  this.element = element;
  this.paper = Raphael(element);
  this.path = "";

  this.state = {
    scale: { x: 1, y: 1 },
    font_family: "Arial",
    font_size: 8,
    font_weight: 800
  };

  this.attributes = {
    "stroke-width": 0.3,
    "fill": "black",
    "font": "8pt Arial"
  };

  this.state_stack= [];
}

Vex.Flow.RaphaelContext.prototype.setFont = function(family, size, weight) {
  this.state.font_family = family;
  this.state.font_size = size;
  this.state.font_weight = weight;
  this.attributes.font = (this.state.font_weight || "") + " " +
    (this.state.font_size * this.state.scale.x) + "pt " +
    this.state.font_family;
  return this;
}

Vex.Flow.RaphaelContext.prototype.setFillStyle = function(style) {
  this.attributes.fill = style;
  return this;
}

Vex.Flow.RaphaelContext.prototype.setStrokeStyle = function(style) {
  this.attributes.stroke = style;
  return this;
}

Vex.Flow.RaphaelContext.prototype.scale = function(x, y) {
  this.state.scale = { x: x, y: y };
  this.attributes.scale = x + "," + y + ",0,0";
  this.attributes.font = this.state.font_size * this.state.scale.x + "pt " +
    this.state.font_family;
  return this;
}

Vex.Flow.RaphaelContext.prototype.clear = function() {
  this.paper.clear();
}

Vex.Flow.RaphaelContext.prototype.resize = function(width, height) {
  this.element.style.width = width;
  this.paper.setSize(width, height);
  return this;
}

Vex.Flow.RaphaelContext.prototype.fillRect = function(x, y, width, height) {
  if (height < 0) {
    y += height;
    height = -height
  }

  var r = this.paper.rect(x, y, width - 0.5, height - 0.5).
    attr(this.attributes);
  return this;
}

Vex.Flow.RaphaelContext.prototype.beginPath = function() {
  this.path = "";
  return this;
}

Vex.Flow.RaphaelContext.prototype.moveTo = function(x, y) {
  this.path += "M" + x + "," + y;
  return this;
}

Vex.Flow.RaphaelContext.prototype.lineTo = function(x, y) {
  this.path += "L" + x + "," + y;
  return this;
}

Vex.Flow.RaphaelContext.prototype.bezierCurveTo =
  function(x1, y1, x2, y2, x, y) {
  this.path += "C" +
    x1 + "," +
    y1 + "," +
    x2 + "," +
    y2 + "," +
    x + "," +
    y;
  return this;
}

Vex.Flow.RaphaelContext.prototype.quadraticCurveTo =
  function(x1, y1, x, y) {
  this.path += "Q" +
    x1 + "," +
    y1 + "," +
    x + "," +
    y;
  return this;
}

Vex.Flow.RaphaelContext.prototype.fill = function() {
  this.paper.path(this.path).
    attr(this.attributes).
    attr("stroke-width", 0);
  return this;
}

Vex.Flow.RaphaelContext.prototype.stroke = function() {
  this.paper.path(this.path).
    attr(this.attributes).
    attr("fill", "none").
    attr("stroke-width", 1.0);
  return this;
}

Vex.Flow.RaphaelContext.prototype.closePath = function() {
  this.path += "Z";
  return this;
}

Vex.Flow.RaphaelContext.prototype.fillText = function(text, x, y) {
  var shift = 0;
  if (this.state.font_size == 9) shift = 1;

  this.paper.text(x + (Vex.Flow.textWidth(text) / 2) + 2,
      (y - (this.state.font_size / (3.5 * this.state.scale.y))) + shift, text).
    attr(this.attributes);
  return this;
}

Vex.Flow.RaphaelContext.prototype.save = function() {
  // TODO(mmuthanna): State needs to be deep-copied.
  this.state_stack.push({
    state: {
      font_family: this.state.font_family
    },
    attributes: {
      font: this.attributes.font
    }
  });
  return this;
}

Vex.Flow.RaphaelContext.prototype.restore = function() {
  // TODO(mmuthanna): State needs to be deep-restored.
  var state = this.state_stack.pop();
  this.state.font_family = state.state.font_family;
  this.attributes.font = state.attributes.font;

  return this;
}
