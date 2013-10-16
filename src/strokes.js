// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class implements chord strokes - arpeggiated, brush & rasquedo.

Vex.Flow.Stroke = (function() {
  function Stroke(type, options) {
    if (arguments.length > 0) this.init(type, options);
  }

  Stroke.Type = {
    BRUSH_DOWN: 1,
    BRUSH_UP: 2,
    ROLL_DOWN: 3,        // Arpegiated chord
    ROLL_UP: 4,          // Arpegiated chord
    RASQUEDO_DOWN: 5,
    RASQUEDO_UP: 6
  };

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(Stroke, Modifier, {
    init: function(type, options) {
      Stroke.superclass.init.call(this);

      this.note = null;
      this.options = Vex.Merge({}, options);

      // multi voice - span stroke across all voices if true
      this.all_voices = 'all_voices' in this.options ?
        this.options.all_voices : true;

      // multi voice - end note of stroke, set in draw()
      this.note_end = null;
      this.index = null;
      this.type = type;
      this.position = Modifier.Position.LEFT;

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
    },

    getCategory: function() { return "strokes"; },
    getPosition: function() { return this.position; },
    addEndNote: function(note) { this.note_end = note; return this; },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw stroke without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw stroke without a note and index.");
      var start = this.note.getModifierStartXY(this.position, this.index);
      var ys = this.note.getYs();
      var topY = start.y;
      var botY = start.y;
      var x = start.x - 5;
      var line_space = this.note.stave.options.spacing_between_lines_px;

      var notes = this.getModifierContext().getModifiers(this.note.getCategory());
      var i;
      for (i = 0; i < notes.length; i++) {
        ys = notes[i].getYs();
        for (var n = 0; n < ys.length; n++) {
          if (this.note == notes[i] || this.all_voices) {
            topY = Vex.Min(topY, ys[n]);
            botY = Vex.Max(botY, ys[n]);
          }
        }
      }

      var arrow, arrow_shift_x, arrow_y, text_shift_x, text_y;
      switch (this.type) {
        case Stroke.Type.BRUSH_DOWN:
          arrow = "vc3";
          arrow_shift_x = -3;
          arrow_y = topY - (line_space / 2) + 10;
          botY += (line_space / 2);
          break;
        case Stroke.Type.BRUSH_UP:
          arrow = "v11";
          arrow_shift_x = 0.5;
          arrow_y = botY + (line_space / 2);
          topY -= (line_space / 2);
          break;
        case Stroke.Type.ROLL_DOWN:
        case Stroke.Type.RASQUEDO_DOWN:
          arrow = "vc3";
          arrow_shift_x = -3;
          text_shift_x = this.x_shift + arrow_shift_x - 2;
          if (this.note instanceof Vex.Flow.StaveNote) {
            topY += 1.5 * line_space;
            if ((botY - topY) % 2 !== 0) {
              botY += 0.5 * line_space;
            } else {
              botY += line_space;
            }
            arrow_y = topY - line_space;
            text_y = botY + line_space + 2;
          } else {
            topY += 1.5 * line_space;
            botY += line_space;
            arrow_y = topY - 0.75 * line_space;
            text_y = botY + 0.25 * line_space;
          }
          break;
        case Stroke.Type.ROLL_UP:
        case Stroke.Type.RASQUEDO_UP:
          arrow = "v52";
          arrow_shift_x = -4;
          text_shift_x = this.x_shift + arrow_shift_x - 1;
          if (this.note instanceof Vex.Flow.StaveNote) {
            arrow_y = line_space / 2;
            topY += 0.5 * line_space;
            if ((botY - topY) % 2 === 0) {
              botY += line_space / 2;
            }
            arrow_y = botY + 0.5 * line_space;
            text_y = topY - 1.25 * line_space;
          } else {
            topY += 0.25 * line_space;
            botY += 0.5 * line_space;
            arrow_y = botY + 0.25 * line_space;
            text_y = topY - line_space;
          }
          break;
      }

      // Draw the stroke
      if (this.type == Stroke.Type.BRUSH_DOWN ||
          this.type == Stroke.Type.BRUSH_UP) {
        this.context.fillRect(x + this.x_shift, topY, 1, botY - topY);
      } else {
        if (this.note instanceof Vex.Flow.StaveNote) {
          for (i = topY; i <= botY; i += line_space) {
            Vex.Flow.renderGlyph(this.context, x + this.x_shift - 4,
                                 i,
                                 this.render_options.font_scale, "va3");
          }
        } else {
          for (i = topY; i <= botY; i+= 10) {
            Vex.Flow.renderGlyph(this.context, x + this.x_shift - 4,
                                 i,
                                 this.render_options.font_scale, "va3");
          }
          if (this.type == Vex.Flow.Stroke.Type.RASQUEDO_DOWN)
            text_y = i + 0.25 * line_space;
        }
      }

      // Draw the arrow head
      Vex.Flow.renderGlyph(this.context, x + this.x_shift + arrow_shift_x, arrow_y,
                           this.render_options.font_scale, arrow);

      // Draw the rasquedo "R"
      if (this.type == Stroke.Type.RASQUEDO_DOWN ||
          this.type == Stroke.Type.RASQUEDO_UP) {
        this.context.save();
        this.context.setFont(this.font.family, this.font.size, this.font.weight);
        this.context.fillText("R", x + text_shift_x, text_y);
        this.context.restore();
      }
    }
  });

  return Stroke;
}());