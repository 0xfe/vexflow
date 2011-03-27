// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.StaveConnector = function(top_stave, bottom_stave) {
  this.init(top_stave, bottom_stave); }

Vex.Flow.StaveConnector.prototype.init = function(top_stave, bottom_stave) {
  this.width = 3;
  this.top_stave = top_stave;
  this.bottom_stave = bottom_stave;
}

Vex.Flow.StaveConnector.prototype.setContext = function(ctx) {
  this.ctx = ctx;
  return this;
}

Vex.Flow.StaveConnector.prototype.draw = function() {
  if (!this.ctx) throw new Vex.RERR(
      "NoContext", "Can't draw without a context.");
  var attachment_height =
    (this.bottom_stave.getYForLine(this.bottom_stave.getNumLines() - 1) -
    this.top_stave.getYForLine(0)) + 1;
  this.ctx.fillRect(
    this.top_stave.getX() - (this.width + 2), this.top_stave.getYForLine(0),
    this.width, attachment_height);
}
