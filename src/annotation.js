// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements text annotations.

/**
 * @constructor
 */
Vex.Flow.Annotation = function(text) {
  if (arguments.length > 0) this.init(text);
}
Vex.Flow.Annotation.prototype = new Vex.Flow.Modifier();
Vex.Flow.Annotation.prototype.constructor = Vex.Flow.Annotation;
Vex.Flow.Annotation.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Annotation.Justify = {
  LEFT: 1,
  CENTER: 2,
  RIGHT: 3
};

Vex.Flow.Annotation.prototype.init = function(text) {
  var superclass = Vex.Flow.Annotation.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.text_line = 0;
  this.text = text;
  this.justification = Vex.Flow.Annotation.Justify.CENTER;
  this.font = {
    family: "Arial",
    size: 10,
    weight: ""
  };

  this.setWidth(Vex.Flow.textWidth(text));
}

Vex.Flow.Annotation.prototype.getCategory = function() { return "annotations"; }
Vex.Flow.Annotation.prototype.setTextLine = function(line)
  { this.text_line = line; return this; }
Vex.Flow.Annotation.prototype.setFont = function(family, size, weight) {
  this.font = { family: family, size: size, weight: weight };
  return this;
}
Vex.Flow.Annotation.prototype.setBottom = function(bottom) {
  this.bottom = bottom;
  return this;
}
Vex.Flow.Modifier.prototype.getJustification = function() {
  return this.justification; }
Vex.Flow.Modifier.prototype.setJustification = function(justification) {
  this.justification = justification; return this; }

Vex.Flow.Annotation.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw text annotation without a context.");
  if (!this.note) throw new Vex.RERR("NoNoteForAnnotation",
    "Can't draw text annotation without an attached note.");

  var start = this.note.getModifierStartXY(Vex.Flow.Modifier.Position.ABOVE,
      this.index);
  this.context.save();
  this.context.setFont(this.font.family, this.font.size, this.font.weight);

  var text_width = this.context.measureText(this.text).width;
  if (this.justification == Vex.Flow.Annotation.Justify.LEFT) {
    var x = start.x;
  } else {
    var x = start.x - text_width / 2;
  }

  if (this.bottom) {
    // TODO(0xfe): Fix this demeter violation
    var y = this.note.stave.getYForBottomText(this.text_line);
  } else {
    var y = this.note.getYForTopText(this.text_line) - 1;
  }

  this.context.fillText(this.text, x, y);
  this.context.restore();
}
