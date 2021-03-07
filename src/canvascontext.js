// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Mohit Muthanna <mohit@muthanna.com>
//
// A rendering context for the Raphael backend.
//
// Copyright Mohit Cheppudira 2010

import { Vex } from './vex';

/** @constructor */
export class CanvasContext {
  static get WIDTH() {
    return 600;
  }
  static get HEIGHT() {
    return 400;
  }
  static get CANVAS_BROWSER_SIZE_LIMIT() {
    return 32767; // Chrome/Firefox. Could be determined more precisely by npm module canvas-size
  }

  static SanitizeCanvasDims(width, height) {
    if (Math.max(width, height) > this.CANVAS_BROWSER_SIZE_LIMIT) {
      Vex.W('Canvas dimensions exceed browser limit. Cropping to ' + this.CANVAS_BROWSER_SIZE_LIMIT);
      if (width > this.CANVAS_BROWSER_SIZE_LIMIT) {
        width = this.CANVAS_BROWSER_SIZE_LIMIT;
        // note: Math.min return 0 for undefined, NaN for null. Would change inputs.
      }
      if (height > this.CANVAS_BROWSER_SIZE_LIMIT) {
        height = this.CANVAS_BROWSER_SIZE_LIMIT;
      }
    }
    return [width, height];
  }

  constructor(context) {
    // Use a name that is unlikely to clash with a canvas context
    // property
    this.vexFlowCanvasContext = context;
    if (!context.canvas) {
      this.canvas = {
        width: CanvasContext.WIDTH,
        height: CanvasContext.HEIGHT,
      };
    } else {
      this.canvas = context.canvas;
    }
  }

  clear() {
    this.vexFlowCanvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Containers not implemented
  openGroup() {}
  closeGroup() {}
  add() {}

  setFont(family, size, weight) {
    this.vexFlowCanvasContext.font = (weight || '') + ' ' + size + 'pt ' + family;
    return this;
  }

  setRawFont(font) {
    this.vexFlowCanvasContext.font = font;
    return this;
  }

  setFillStyle(style) {
    this.vexFlowCanvasContext.fillStyle = style;
    return this;
  }

  setBackgroundFillStyle(style) {
    this.background_fillStyle = style;
    return this;
  }

  setStrokeStyle(style) {
    this.vexFlowCanvasContext.strokeStyle = style;
    return this;
  }

  setShadowColor(style) {
    this.vexFlowCanvasContext.shadowColor = style;
    return this;
  }

  setShadowBlur(blur) {
    this.vexFlowCanvasContext.shadowBlur = blur;
    return this;
  }

  setLineWidth(width) {
    this.vexFlowCanvasContext.lineWidth = width;
    return this;
  }

  setLineCap(cap_type) {
    this.vexFlowCanvasContext.lineCap = cap_type;
    return this;
  }

  // setLineDash: is the one native method in a canvas context
  // that begins with set, therefore we don't bolster the method
  // if it already exists (see renderer.bolsterCanvasContext).
  // If it doesn't exist, we bolster it and assume it's looking for
  // a ctx.lineDash method, as previous versions of VexFlow
  // expected.
  setLineDash(dash) {
    this.vexFlowCanvasContext.lineDash = dash;
    return this;
  }

  scale(x, y) {
    return this.vexFlowCanvasContext.scale(parseFloat(x), parseFloat(y));
  }

  resize(width, height) {
    [width, height] = this.SanitizeCanvasDims(parseInt(width, 10), parseInt(height, 10));
    return this.vexFlowCanvasContext.resize(width, height);
  }

  rect(x, y, width, height) {
    return this.vexFlowCanvasContext.rect(x, y, width, height);
  }

  fillRect(x, y, width, height) {
    return this.vexFlowCanvasContext.fillRect(x, y, width, height);
  }

  clearRect(x, y, width, height) {
    return this.vexFlowCanvasContext.clearRect(x, y, width, height);
  }

  beginPath() {
    return this.vexFlowCanvasContext.beginPath();
  }

  moveTo(x, y) {
    return this.vexFlowCanvasContext.moveTo(x, y);
  }

  lineTo(x, y) {
    return this.vexFlowCanvasContext.lineTo(x, y);
  }

  bezierCurveTo(x1, y1, x2, y2, x, y) {
    return this.vexFlowCanvasContext.bezierCurveTo(x1, y1, x2, y2, x, y);
  }

  quadraticCurveTo(x1, y1, x, y) {
    return this.vexFlowCanvasContext.quadraticCurveTo(x1, y1, x, y);
  }

  // This is an attempt (hack) to simulate the HTML5 canvas
  // arc method.
  arc(x, y, radius, startAngle, endAngle, antiClockwise) {
    return this.vexFlowCanvasContext.arc(x, y, radius, startAngle, endAngle, antiClockwise);
  }

  // Adapted from the source for Raphael's Element.glow
  glow() {
    return this.vexFlowCanvasContext.glow();
  }

  fill() {
    return this.vexFlowCanvasContext.fill();
  }

  stroke() {
    return this.vexFlowCanvasContext.stroke();
  }

  closePath() {
    return this.vexFlowCanvasContext.closePath();
  }

  measureText(text) {
    return this.vexFlowCanvasContext.measureText(text);
  }

  fillText(text, x, y) {
    return this.vexFlowCanvasContext.fillText(text, x, y);
  }

  save() {
    return this.vexFlowCanvasContext.save();
  }

  restore() {
    return this.vexFlowCanvasContext.restore();
  }
}
