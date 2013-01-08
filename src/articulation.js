// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2011
// This class implements Accents.

/**
 * @constructor
 */
Vex.Flow.Articulation = function(type) {
  if (arguments.length > 0) this.init(type);
}
Vex.Flow.Articulation.prototype = new Vex.Flow.Modifier();
Vex.Flow.Articulation.prototype.constructor = Vex.Flow.Articulation;
Vex.Flow.Articulation.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Articulation.prototype.init = function(type) {
  var superclass = Vex.Flow.Articulation.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.type = type;
  this.position = Vex.Flow.Modifier.Position.BELOW;

  this.render_options = {
    font_scale: 38,
    stroke_px: 3,
    stroke_spacing: 10
  };

  this.articulation = Vex.Flow.articulationCodes(this.type);
  if (!this.articulation) throw new Vex.RERR("InvalidArticulation",
     "Articulation not found: '" + this.type + "'");

  this.setWidth(this.articulation.width);
}

Vex.Flow.Articulation.prototype.getCategory = function() {
  return "articulations";
}
Vex.Flow.Articulation.prototype.getPosition = function() {
  return this.position;
}
Vex.Flow.Articulation.prototype.setPosition = function(position) {
  if (position == Vex.Flow.Modifier.Position.ABOVE ||
      position == Vex.Flow.Modifier.Position.BELOW)
    this.position = position;
  return this;
}

Vex.Flow.Articulation.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw Articulation without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw Articulation without a note and index.");
  // Articulations are centered over/under the note head

  var stave = this.note.stave;
  var start = this.note.getModifierStartXY(this.position, this.index);
  var glyph_y = start.y;
  var shiftY = 0;

  if (this.note.getStemExtents) {
    var stem_ext = this.note.getStemExtents();
    var spacing = this.note.stave.options.spacing_between_lines_px;
    var top = stem_ext.topY;
    var bottom = stem_ext.baseY + 2;
    if (this.note.stem_direction == Vex.Flow.StaveNote.STEM_DOWN) {
      top = stem_ext.baseY;
      bottom = stem_ext.topY;
    }
  }

  if (this.position == Vex.Flow.Modifier.Position.ABOVE) {
    shiftY = this.articulation.shift_up;
    glyph_y = this.note.stave.getYForTopText(this.text_line);
    if (stem_ext) glyph_y = Vex.Min(glyph_y, (top - 10) - (spacing * this.text_line));
  } else {
    shiftY = this.articulation.shift_down - 10;
    glyph_y = this.note.stave.getYForBottomText(this.text_line);
    if (stem_ext) glyph_y = Vex.Max(glyph_y, bottom + (spacing * (this.text_line + 2)));
  }

  var glyph_x = (start.x) + this.articulation.shift_right;
  glyph_y += shiftY + this.y_shift;

 Vex.Flow.renderGlyph(this.context, glyph_x, glyph_y,
                       this.render_options.font_scale, this.articulation.code);
}
