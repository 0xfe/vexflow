// Vex Flow Notation
// Author Larry Kuhns 2011
// Implements barlines (single, double, repeat, end)
//
// Requires vex.js.

/**
 * @constructor
 */
Vex.Flow.Barline = (function() {
  function Barline(type) {
    if (arguments.length > 0) this.init(type);
  }

  Barline.type = {
    SINGLE: 1,
    DOUBLE: 2,
    END: 3,
    REPEAT_BEGIN: 4,
    REPEAT_END: 5,
    REPEAT_BOTH: 6,
    NONE: 7
  };

  Vex.Inherit(Barline, Vex.Flow.StaveModifier, {
    init: function(type) {
      Barline.superclass.init.call(this);
      this.thickness = Vex.Flow.STAVE_LINE_THICKNESS;

      var TYPE = Vex.Flow.Barline.type;
      this.widths = {};
      this.widths[TYPE.SINGLE] = 5;
      this.widths[TYPE.DOUBLE] = 5;
      this.widths[TYPE.END] = 5;
      this.widths[TYPE.REPEAT_BEGIN] = 5;
      this.widths[TYPE.REPEAT_END] = 5;
      this.widths[TYPE.REPEAT_BOTH] = 5;
      this.widths[TYPE.NONE] = 5;

      this.paddings = {};
      this.paddings[TYPE.SINGLE] = 0;
      this.paddings[TYPE.DOUBLE] = 0;
      this.paddings[TYPE.END] = 0;
      this.paddings[TYPE.REPEAT_BEGIN] = 15;
      this.paddings[TYPE.REPEAT_END] = 15;
      this.paddings[TYPE.REPEAT_BOTH] = 15;
      this.paddings[TYPE.NONE] = 0;

      this.setPosition(Vex.Flow.StaveModifier.Position.BEGIN);
      this.setType(type);
    },

    getCategory: function() { return "barlines"; },
    getType: function() { return this.type; },
    setType: function(type) {
      this.type = type;
      this.setWidth(this.widths[this.type]);
      this.setPadding(this.paddings[this.type]);
      return this;
    },

    // Draw barlines
    draw: function(stave) {
      switch (this.type) {
        case Barline.type.SINGLE:
          this.drawVerticalBar(stave, this.x, false);
          break;
        case Barline.type.DOUBLE:
          this.drawVerticalBar(stave, this.x, true);
          break;
        case Barline.type.END:
          this.drawVerticalEndBar(stave, this.x);
          break;
        case Barline.type.REPEAT_BEGIN:
          // If the barline is shifted over (in front of clef/time/key)
          // Draw vertical bar at the beginning.
          this.drawRepeatBar(stave, this.x, true);
          if (stave.getX() !== this.x) {
            this.drawVerticalBar(stave, stave.getX());
          }

          break;
        case Barline.type.REPEAT_END:
          this.drawRepeatBar(stave, this.x, false);
          break;
        case Barline.type.REPEAT_BOTH:
          this.drawRepeatBar(stave, this.x, false);
          this.drawRepeatBar(stave, this.x, true);
          break;
        default:
          // Default is NONE, so nothing to draw
          break;
      }
    },

    drawVerticalBar: function(stave, x, double_bar) {
      if (!stave.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");
      var topY = stave.getYForLine(0);
      var botY = stave.getYForLine(stave.getNumLines() - 1) + this.thickness;
      if (double_bar)
        stave.context.fillRect(x - 3, topY, 1, botY - topY);
      stave.context.fillRect(x, topY, 1, botY - topY);
    },

    drawVerticalEndBar: function(stave, x) {
      if (!stave.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");

      var topY = stave.getYForLine(0);
      var botY = stave.getYForLine(stave.getNumLines() - 1) + this.thickness;
      stave.context.fillRect(x - 5, topY, 1, botY - topY);
      stave.context.fillRect(x - 2, topY, 3, botY - topY);
    },

    drawRepeatBar: function(stave, x, begin) {
      if (!stave.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw stave without canvas context.");

      var topY = stave.getYForLine(0);
      var botY = stave.getYForLine(stave.getNumLines() - 1) + this.thickness;
      var x_shift = 3;

      if (!begin) {
        x_shift = -5;
      }

      stave.context.fillRect(x + x_shift, topY, 1, botY - topY);
      stave.context.fillRect(x - 2, topY, 3, botY - topY);

      var dot_radius = 2;

      // Shift dots left or right
      if (begin) {
        x_shift += 4;
      } else {
        x_shift -= 4;
      }

      var dot_x = (x + x_shift) + (dot_radius / 2);

      // calculate the y offset based on number of stave lines
      var y_offset = (stave.getNumLines() - 1) *
        stave.getSpacingBetweenLines();
      y_offset = (y_offset / 2) -
                 (stave.getSpacingBetweenLines() / 2);
      var dot_y = topY + y_offset + (dot_radius / 2);

      // draw the top repeat dot
      stave.context.beginPath();
      stave.context.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
      stave.context.fill();

      //draw the bottom repeat dot
      dot_y += stave.getSpacingBetweenLines();
      stave.context.beginPath();
      stave.context.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
      stave.context.fill();
    }
  });

  return Barline;
}());
