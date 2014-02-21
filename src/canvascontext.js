// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// A rendering context for the Raphael backend.
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.CanvasContext = (function() {
  function CanvasContext(context) {
    if (arguments.length > 0) this.init(context);
  }

  CanvasContext.prototype = {
    init: function(context) {
      this.context = context;
    },

    clear: function() {
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    },

    setFont: function(family, size, weight) {
      this.context.font = (weight || "") + " " + size + "pt " + family;
      return this;
    },

    setFillStyle: function(style) {
      this.context.fillStyle = style;
      return this;
    },

    setBackgroundFillStyle: function(style) {
      this.context.background_fillStyle = style;
      return this;
    },

    setStrokeStyle: function(style) {
      this.context.strokeStyle = style;
      return this;
    },

    setShadowColor: function(style) {
      this.context.shadowColor = style;
      return this;
    },

    setShadowBlur: function(blur) {
      this.context.shadowBlur = blur;
      return this;
    },

    setLineWidth: function(width) {
      this.context.lineWidth = width;
      return this;
    },

    scale: function(x, y) {
      return this.context.scale(x, y);
    },

    clear: function() { return this.context.clear(); },

    resize: function(width, height) { return this.context.resize(width, height); },

    rect: function(x, y, width, height) {
      return this.context.rect(x, y, width, height);
    },

    fillRect: function(x, y, width, height) {
      return this.context.fillRect(x, y, width, height);
    },

    clearRect: function(x, y, width, height) {
      return this.context.clearRect(x, y, width, height);
    },

    beginPath: function() {
      return this.context.beginPath();
    },

    moveTo: function(x, y) {
      return this.context.moveTo(x, y);
    },

    lineTo: function(x, y) {
      return this.context.lineTo(x, y);
    },

    bezierCurveTo: function(x1, y1, x2, y2, x, y) {
      return this.context.bezierCurveTo(x1, y1, x2, y2, x, y);
    },

    quadraticCurveTo: function(x1, y1, x, y) {
      return this.context.quadraticCurveTo(x1, y1, x, y);
    },

    // This is an attempt (hack) to simulate the HTML5 canvas
    // arc method.
    arc: function(x, y, radius, startAngle, endAngle, antiClockwise) {
      return this.context.arc(x, y, radius, startAngle, endAngle, antiClockwise);
    },

    // Adapted from the source for Raphael's Element.glow
    glow: function() {
      return this.context.glow();
    },

    fill: function() {
      return this.context.fill();
    },

    stroke: function() {
      return this.context.stroke();
    },

    closePath: function() {
      return this.context.closePath();
    },

    measureText: function(text) {
      return this.context.measureText(text);
    },

    fillText: function(text, x, y) {
      return this.context.fillText(text, x, y);
    },

    save: function() {
      return this.context.save();
    },

    restore: function() {
      return this.context.restore();
    }
  };

  return CanvasContext;
}());
