// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2013

/** @constructor */
Vex.Flow.TextNote = function(text_struct) {
  if (arguments.length > 0) this.init(text_struct);
}
Vex.Flow.TextNote.prototype = new Vex.Flow.Note();
Vex.Flow.TextNote.superclass = Vex.Flow.Note.prototype;
Vex.Flow.TextNote.constructor = Vex.Flow.TextNote;

Vex.Flow.TextNote.Justification = {
  LEFT: 1,
  CENTER: 2,
  RIGHT: 3
};

Vex.Flow.TextNote.prototype.init = function(text_struct) {
  var superclass = Vex.Flow.TextNote.superclass;
  superclass.init.call(this, text_struct);

  // Note properties
  this.text = text_struct.text;
  this.font = {
    family: "Arial",
    size: 12,
    weight: ""
  }

  if (text_struct.font) this.font = text_struct.font;
  this.setWidth(Vex.Flow.textWidth(this.text));
  this.line = text_struct.line || 0;
  this.smooth = text_struct.smooth || false;
  this.justification = Vex.Flow.TextNote.Justification.LEFT;
}

Vex.Flow.TextNote.prototype.setJustification = function(just) {
  this.justification = just;
  return this;
}
Vex.Flow.TextNote.prototype.setLine = function(line) {
  this.line = line;
  return this;
}

// Pre-render formatting
Vex.Flow.TextNote.prototype.preFormat = function() {
  if (!this.context) throw new Vex.RERR("NoRenderContext",
      "Can't measure text without rendering context.");
  if (this.preFormatted) return;

  if (this.smooth) {
    this.setWidth(10);
  } else {
    this.setWidth(this.context.measureText(this.text).width);
  }

  if (this.justification == Vex.Flow.TextNote.Justification.CENTER) {
    this.extraLeftPx = this.width / 2;
  } else if (this.justification == Vex.Flow.TextNote.Justification.RIGHT) {
    this.extraLeftPx = this.width;
  }

  this.setPreFormatted(true);
}

Vex.Flow.TextNote.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");
  if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

  var ctx = this.context;
  var x = this.getAbsoluteX();
  if (this.justification == Vex.Flow.TextNote.Justification.CENTER) {
    x -= this.getWidth() / 2;
  } else if (this.justification == Vex.Flow.TextNote.Justification.RIGHT) {
    x -= this.getWidth();
  }
  var y = this.stave.getYForLine(this.line + (-3));

  ctx.save();
  ctx.setFont(this.font.family, this.font.size, this.font.weight);
  ctx.fillText(this.text, x, y);
  ctx.restore();
}
