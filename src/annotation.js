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
  RIGHT: 3,
  CENTER_STEM: 4
};

Vex.Flow.Annotation.VerticalJustify = {
  TOP: 1,
  CENTER: 2,
  BOTTOM: 3,
  CENTER_STEM: 4
};

Vex.Flow.Annotation.prototype.init = function(text) {
  var superclass = Vex.Flow.Annotation.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.text_line = 0;
  this.text = text;
  this.justification = Vex.Flow.Annotation.Justify.CENTER;
  this.vert_justification = Vex.Flow.Annotation.VerticalJustify.TOP;
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
  if (bottom) {
    this.vert_justification = Vex.Flow.Annotation.VerticalJustify.BOTTOM;
  } else {
    this.vert_justification = Vex.Flow.Annotation.VerticalJustify.TOP;
  }
  return this;
}
Vex.Flow.Annotation.prototype.setVerticalJustification = function(
    vert_justification) {
  this.vert_justification = vert_justification;
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

  // Estimate text height to be the same as the width of an 'm'.
  //
  // This is a hack to work around the inability to measure text height
  // in HTML5 Canvas.
  var text_height = this.context.measureText("m").width;

  if (this.justification == Vex.Flow.Annotation.Justify.LEFT) {
    var x = start.x;
  } else if (this.justification == Vex.Flow.Annotation.Justify.RIGHT) {
    var x = start.x - text_width;
  } else if (this.justification == Vex.Flow.Annotation.Justify.CENTER) {
    var x = start.x - text_width / 2;
  } else /* CENTER_STEM */ {
    var x = this.note.getStemX() - text_width / 2;
  }

  if (this.note.getStemExtents) {
    var stem_ext = this.note.getStemExtents();
    var spacing = this.note.stave.options.spacing_between_lines_px;
  }

  if (this.vert_justification == Vex.Flow.Annotation.VerticalJustify.BOTTOM) {
    var y = this.note.stave.getYForBottomText(this.text_line);
    if (stem_ext) {
      y = Vex.Max(y, (stem_ext.baseY) + (spacing * (this.text_line + 2)));
    }
  } else if (this.vert_justification ==
             Vex.Flow.Annotation.VerticalJustify.CENTER) {
    var yt = this.note.getYForTopText(this.text_line) - 1;
    var yb = this.note.stave.getYForBottomText(this.text_line);
    var y = yt + ( yb - yt ) / 2 + text_height / 2;
  } else if (this.vert_justification ==
             Vex.Flow.Annotation.VerticalJustify.TOP) {
    var y = this.note.stave.getYForTopText(this.text_line);
    if (stem_ext)
      y = Vex.Min(y, (stem_ext.topY - 5) - (spacing * this.text_line));
  } else /* CENTER_STEM */{
    var extents = this.note.getStemExtents();
    var y = extents.topY + ( extents.baseY - extents.topY ) / 2 +
      text_height / 2;
  }

  this.context.fillText(this.text, x, y);
  this.context.restore();
}
