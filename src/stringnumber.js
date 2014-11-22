// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns
//
// ## Description
//
// This file implements the `StringNumber` class which renders string
// number annotations beside notes.

Vex.Flow.StringNumber = (function() {
  function StringNumber(number) {
    if (arguments.length > 0) this.init(number);
  }
  StringNumber.CATEGORY = "stringnumber";

  var Modifier = Vex.Flow.Modifier;

  // ## Static Methods
  // Arrange string numbers inside a `ModifierContext`
  StringNumber.format = function(nums, state) {
    var left_shift = state.left_shift;
    var right_shift = state.right_shift;
    var num_spacing = 1;

    if (!nums || nums.length === 0) return this;

    var nums_list = [];
    var prev_note = null;
    var shift_left = 0;
    var shift_right = 0;

    var i, num, note, pos, props_tmp;
    for (i = 0; i < nums.length; ++i) {
      num = nums[i];
      note = num.getNote();

      for (i = 0; i < nums.length; ++i) {
        num = nums[i];
        note = num.getNote();
        pos = num.getPosition();
        var props = note.getKeyProps()[num.getIndex()];

        if (note != prev_note) {
          for (var n = 0; n < note.keys.length; ++n) {
            props_tmp = note.getKeyProps()[n];
            if (left_shift === 0)
              shift_left = (props_tmp.displaced ? note.getExtraLeftPx() : shift_left);
            if (right_shift === 0)
              shift_right = (props_tmp.displaced ? note.getExtraRightPx() : shift_right);
          }
          prev_note = note;
        }

        nums_list.push({ line: props.line, pos: pos, shiftL: shift_left, shiftR: shift_right, note: note, num: num });
      }
    }

    // Sort string numbers by line number.
    nums_list.sort(function(a, b) { return (b.line - a.line); });

    var num_shiftL = 0;
    var num_shiftR = 0;
    var x_widthL = 0;
    var x_widthR = 0;
    var last_line = null;
    var last_note = null;
    for (i = 0; i < nums_list.length; ++i) {
      var num_shift = 0;
      note = nums_list[i].note;
      pos = nums_list[i].pos;
      num = nums_list[i].num;
      var line = nums_list[i].line;
      var shiftL = nums_list[i].shiftL;
      var shiftR = nums_list[i].shiftR;

      // Reset the position of the string number every line.
      if (line != last_line || note != last_note) {
        num_shiftL = left_shift + shiftL;
        num_shiftR = right_shift + shiftR;
      }

      var num_width = num.getWidth() + num_spacing;
      if (pos == Vex.Flow.Modifier.Position.LEFT) {
        num.setXShift(left_shift);
        num_shift = shift_left + num_width; // spacing
        x_widthL = (num_shift > x_widthL) ? num_shift : x_widthL;
      } else if (pos == Vex.Flow.Modifier.Position.RIGHT) {
        num.setXShift(num_shiftR);
        num_shift += num_width; // spacing
        x_widthR = (num_shift > x_widthR) ? num_shift : x_widthR;
      }
      last_line = line;
      last_note = note;
    }

    state.left_shift += x_widthL;
    state.right_shift += x_widthR;
    return true;
  };

  // ## Prototype Methods
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
