// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2013
// Class to draws string numbers into the notation.

Vex.Flow.StringNumber = (function() {
  function StringNumber(number) {
    if (arguments.length > 0) this.init(number);
  }

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(StringNumber, Modifier, {
    init: function(number) {
      StringNumber.superclass.init.call(this);

      this.note = null;
      this.last_note = null;
      this.index = null;
      this.string_number = number;
      this.setWidth(20);                                 // ???
      this.position = Modifier.Position.ABOVE;  // Default position above stem or note head
      this.x_shift = 0;
      this.y_shift = 0;
      this.x_offset = 0;                               // Horizontal offset from default
      this.y_offset = 0;                               // Vertical offset from default
      this.dashed = true;                              // true - draw dashed extension  false - no extension
      this.leg = Vex.Flow.Renderer.LineEndType.NONE;   // draw upward/downward leg at the of extension line
      this.radius = 8;
      this.font = {
        family: "sans-serif",
        size: 10,
        weight: "bold"
      };
    },

    getCategory: function() { return "stringnumber"; },
    getNote: function() { return this.note; },
    setNote: function(note) { this.note = note; return this; },
    getIndex: function() { return this.index; },
    setIndex: function(index) { this.index = index; return this; },

    setLineEndType: function(leg) {
      if (leg >= Vex.Flow.Renderer.LineEndType.NONE &&
          leg <= Vex.Flow.Renderer.LineEndType.DOWN)
        this.leg = leg;
      return this;
    },

    getPosition: function() { return this.position; },
    setPosition: function(position) {
      if (position >= Modifier.Position.LEFT &&
          position <= Modifier.Position.BELOW)
        this.position = position;
      return this;
    },

    setStringNumber: function(number) { this.string_number = number; return this; },
    setOffsetX: function(x) { this.x_offset = x; return this; },
    setOffsetY: function(y) { this.y_offset = y; return this; },
    setLastNote: function(note) { this.last_note = note; return this; },
    setDashed: function(dashed) { this.dashed = dashed; return this; },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw string number without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw string number without a note and index.");

      var ctx = this.context;
      var line_space = this.note.stave.options.spacing_between_lines_px;

      var start = this.note.getModifierStartXY(this.position, this.index);
      var dot_x = (start.x + this.x_shift + this.x_offset);
      var dot_y = start.y + this.y_shift + this.y_offset;

      switch (this.position) {
        case Modifier.Position.ABOVE:
        case Modifier.Position.BELOW:
          var stem_ext = this.note.getStemExtents();
          var top = stem_ext.topY;
          var bottom = stem_ext.baseY + 2;

          if (this.note.stem_direction == Vex.Flow.StaveNote.STEM_DOWN) {
            top = stem_ext.baseY;
            bottom = stem_ext.topY - 2;
          }

          if (this.position == Modifier.Position.ABOVE) {
            dot_y = this.note.hasStem() ? top - (line_space * 1.75)
                                        : start.y - (line_space * 1.75);
        } else {
            dot_y = this.note.hasStem() ? bottom + (line_space * 1.5)
                                        : start.y + (line_space * 1.75);
          }

          dot_y += this.y_shift + this.y_offset;

          break;
        case Modifier.Position.LEFT:
          dot_x -= (this.radius / 2) + 5;
          break;
        case Modifier.Position.RIGHT:
          dot_x += (this.radius / 2) + 6;
          break;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(dot_x, dot_y, this.radius, 0, Math.PI * 2, false);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      var x = dot_x - ctx.measureText(this.string_number).width / 2;
      ctx.fillText("" + this.string_number, x, dot_y + 4.5);

      if (this.last_note != null) {
        var end = this.last_note.getStemX() - this.note.getX() + 5;
        ctx.strokeStyle="#000000";
        ctx.lineCap = "round";
        ctx.lineWidth = 0.6;
        if (this.dashed)
          Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + 10, dot_y, dot_x + end, dot_y, [3,3]);
        else
          Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + 10, dot_y, dot_x + end, dot_y, [3,0]);

        var len, pattern;
        switch (this.leg) {
          case Vex.Flow.Renderer.LineEndType.UP:
            len = -10;
            pattern = this.dashed ? [3,3] : [3,0];
            Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + end, dot_y, dot_x + end, dot_y + len, pattern);
            break;
          case Vex.Flow.Renderer.LineEndType.DOWN:
            len = 10;
            pattern = this.dashed ? [3,3] : [3,0];
            Vex.Flow.Renderer.drawDashedLine(ctx, dot_x + end, dot_y, dot_x + end, dot_y + len, pattern);
            break;
        }
      }

      ctx.restore();
    }
  });

  return StringNumber;
}());
