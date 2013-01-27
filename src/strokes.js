// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class implements chord strokes - arpeggiated, brush & rasquedo.

/**
 * @constructor
 */
Vex.Flow.Stroke = function(type, options) {
  if (arguments.length > 0) this.init(type, options);
}
Vex.Flow.Stroke.prototype = new Vex.Flow.Modifier();
Vex.Flow.Stroke.prototype.constructor = Vex.Flow.Stroke;
Vex.Flow.Stroke.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Stroke.Type = {
  BRUSH_DOWN: 1,
  BRUSH_UP: 2,
  ROLL_DOWN: 3,        // Arpegiated chord
  ROLL_UP: 4,          // Arpegiated chord
  RASQUEDO_DOWN: 5,
  RASQUEDO_UP: 6
}

Vex.Flow.Stroke.prototype.init = function(type, options) {
  var superclass = Vex.Flow.Stroke.superclass;
  superclass.init.call(this);

  this.note = null;
  this.options = Vex.Merge({}, options);

  // multi voice - span stroke across all voices if true
  this.all_voices = 'all_voices' in this.options
                  ? this.options.all_voices : true;

  // multi voice - end note of stroke, set in draw()
  this.note_end = null;

  this.index = null;
  this.type = type;
  this.position = Vex.Flow.Modifier.Position.LEFT;

  this.render_options = {
    font_scale: 38,
    stroke_px: 3,
    stroke_spacing: 10
  };

  this.font = {
   family: "serif",
   size: 10,
   weight: "bold italic"
 };

  this.setXShift(0);
  this.setWidth(10);
}

Vex.Flow.Stroke.prototype.getCategory = function() { return "strokes"; }
Vex.Flow.Stroke.prototype.getPosition = function() { return this.position; }
Vex.Flow.Stroke.prototype.addEndNote = function(note)  // Deprecated
  { this.note_end = note; return this; }

Vex.Flow.Stroke.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw stroke without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw stroke without a note and index.");
  var start = this.note.getModifierStartXY(this.position, this.index);
  var ys = this.note.getYs();
  var topY = start.y;
  var botY = start.y;
  var x = start.x - 5
  var line_space = this.note.stave.options.spacing_between_lines_px;

  var notes = this.getModifierContext().getModifiers(this.note.getCategory());

  for (var i = 0; i < notes.length; i++) {
    ys = notes[i].getYs();
    for (var n = 0; n < ys.length; n++) {
      if (this.note == notes[i] || this.all_voices) {
        topY = Vex.Min(topY, ys[n]);
        botY = Vex.Max(botY, ys[n]);
      }
    }
  }

  switch (this.type) {
    case Vex.Flow.Stroke.Type.BRUSH_DOWN:
      var arrow = "vc3";
      var arrow_shift_x = -3;
      var arrow_y = topY - (line_space / 2) + 10;
      botY += (line_space / 2);
      break;
    case Vex.Flow.Stroke.Type.BRUSH_UP:
      var arrow = "v11";
      var arrow_shift_x = .5;
      var arrow_y = botY + (line_space / 2);
      topY -= (line_space / 2);
      break;
    case Vex.Flow.Stroke.Type.ROLL_DOWN:
    case Vex.Flow.Stroke.Type.RASQUEDO_DOWN:
      var arrow = "vc3";
      var arrow_shift_x = -3;
      var text_shift_x = this.x_shift + arrow_shift_x - 2;
      if (this.note instanceof Vex.Flow.StaveNote) {
        topY += 1.5 * line_space;
        if ((botY - topY) % 2 != 0) {
          botY += .5 * line_space;
        } else {
          botY += line_space;
        }
        var arrow_y = topY - line_space;
        var text_y = botY + line_space + 2;
      } else {
        topY += 1.5 * line_space;
        botY += line_space;
        var arrow_y = topY - .75 * line_space;
        var text_y = botY + .25 * line_space;
      }
      break;
    case Vex.Flow.Stroke.Type.ROLL_UP:
    case Vex.Flow.Stroke.Type.RASQUEDO_UP:
      var arrow = "v52";
      var arrow_shift_x = -4;
      var text_shift_x = this.x_shift + arrow_shift_x - 1;
      if (this.note instanceof Vex.Flow.StaveNote) {
        arrow_y = line_space / 2;
        topY += .5 * line_space;
        if ((botY - topY) % 2 == 0) {
          botY += line_space / 2;
        }
        var arrow_y = botY + .5 * line_space;
        var text_y = topY - 1.25 * line_space;
      } else {
        topY += .25 * line_space;
        botY += .5 * line_space;
        var arrow_y = botY + .25 * line_space;
        var text_y = topY - line_space;
      }
      break;
  }

  // Draw the stroke
  if (this.type == Vex.Flow.Stroke.Type.BRUSH_DOWN ||
      this.type == Vex.Flow.Stroke.Type.BRUSH_UP) {
    this.context.fillRect(x + this.x_shift, topY, 1, botY - topY);
  } else {
    if (this.note instanceof Vex.Flow.StaveNote) {
  	  for (var i = topY; i <= botY; i+= line_space) {
        Vex.Flow.renderGlyph(this.context, x + this.x_shift - 4,
                             i,
                             this.render_options.font_scale, "va3");
      }
    } else {
      for (var i = topY; i <= botY; i+= 10) {
        Vex.Flow.renderGlyph(this.context, x + this.x_shift - 4,
                             i,
                             this.render_options.font_scale, "va3");
      }
      if (this.type == Vex.Flow.Stroke.Type.RASQUEDO_DOWN)
        text_y = i + .25 * line_space;
    }
  }

  // Draw the arrow head
  Vex.Flow.renderGlyph(this.context, x + this.x_shift + arrow_shift_x, arrow_y,
                       this.render_options.font_scale, arrow);

  // Draw the rasquedo "R"
  if (this.type == Vex.Flow.Stroke.Type.RASQUEDO_DOWN ||
      this.type == Vex.Flow.Stroke.Type.RASQUEDO_UP) {
    this.context.save();
    this.context.setFont(this.font.family, this.font.size, this.font.weight);
    this.context.fillText("R", x + text_shift_x, text_y);
    this.context.restore();
  }

}