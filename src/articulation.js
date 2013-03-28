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
  if (!(this.note && (this.index !== null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw Articulation without a note and index.");

  var is_on_head = (this.position === Vex.Flow.Modifier.Position.ABOVE &&
                    this.note.stem_direction === Vex.Flow.StaveNote.STEM_DOWN) ||
                   (this.position === Vex.Flow.Modifier.Position.BELOW &&
                    this.note.stem_direction === Vex.Flow.StaveNote.STEM_UP);
  
  var needsLineAdjustment = function(articulation, note_line, line_spacing){
    var offset_direction = (articulation.position === Vex.Flow.Modifier.Position.ABOVE) ? 1 : -1;
    
    if(!is_on_head && articulation.note.duration !== "w"){
      // Add stem length, inless it's on a whole note
      note_line += offset_direction * 3.5;
    }
    var articulation_line = note_line + (offset_direction * line_spacing);
    
    if(articulation_line >= 1 &&
       articulation_line <= 5 &&
       articulation_line % 1 === 0){
      return true;
    }

    return false;
  }

  // Articulations are centered over/under the note head
  var stave = this.note.stave;
  var start = this.note.getModifierStartXY(this.position, this.index);
  var glyph_y = start.y;
  var shiftY = 0;
  var line_spacing = 1;
  var spacing = stave.options.spacing_between_lines_px;
  var top, bottom;

  if (this.note.getStemExtents) {
    var stem_ext = this.note.getStemExtents();
    top = stem_ext.topY;
    bottom = stem_ext.baseY;
    if (this.note.stem_direction === Vex.Flow.StaveNote.STEM_DOWN) {
      top = stem_ext.baseY;
      bottom = stem_ext.topY;
    }
  }

  var is_above = (this.position === Vex.Flow.Modifier.Position.ABOVE) ? true : false;
  var note_line = this.note.getLineNumber(is_above);

  // Beamed stems are longer than quarter note stems
  if(!is_on_head && this.note.beam)
    line_spacing += 0.5;

  // If articulation will overlap a line, reposition it
  if(needsLineAdjustment(this, note_line, line_spacing))
    line_spacing += 0.5;

  if (this.position === Vex.Flow.Modifier.Position.ABOVE) {
    shiftY = this.articulation.shift_up;

    var glyph_y_between_lines = (top - 7) - (spacing * (this.text_line + line_spacing));
    if(this.articulation.between_lines)
      glyph_y = glyph_y_between_lines;
    else
      glyph_y = Vex.Min(stave.getYForTopText(this.text_line) - 3, glyph_y_between_lines);
  } else {
    shiftY = this.articulation.shift_down - 10;

    var glyph_y_between_lines = bottom + 10 + spacing * (this.text_line + line_spacing);
    if(this.articulation.between_lines)
     glyph_y = glyph_y_between_lines;
    else
      glyph_y = Vex.Max(stave.getYForBottomText(this.text_line), glyph_y_between_lines);
  }

  var glyph_x = start.x + this.articulation.shift_right;
  glyph_y += shiftY + this.y_shift;

 Vex.Flow.renderGlyph(this.context, glyph_x, glyph_y,
                       this.render_options.font_scale, this.articulation.code);
}
