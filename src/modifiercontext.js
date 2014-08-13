// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of modifiers to notes (e.g. bends,
// fingering positions etc.)

Vex.Flow.ModifierContext = (function() {
  function ModifierContext() {
    // Current modifiers
    this.modifiers = {};

    // Formatting data.
    this.preFormatted = false;
    this.postFormatted = false;
    this.width = 0;
    this.spacing = 0;
    this.state = {
      left_shift: 0,
      right_shift: 0,
      text_line: 0
    };
  }

  // To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
  function L() { if (ModifierContext.DEBUG) Vex.L("Vex.Flow.ModifierContext", arguments); }

  ModifierContext.prototype = {
    addModifier: function(modifier) {
      var type = modifier.getCategory();
      if (!this.modifiers[type]) this.modifiers[type] = [];
      this.modifiers[type].push(modifier);
      modifier.setModifierContext(this);
      this.preFormatted = false;
      return this;
    },

    getModifiers: function(type) { return this.modifiers[type]; },
    getWidth: function() { return this.width; },
    getExtraLeftPx: function() { return this.state.left_shift; },
    getExtraRightPx: function() { return this.state.right_shift; },
    getState: function() { return this.state; },

    getMetrics: function() {
      if (!this.formatted) throw new Vex.RERR("UnformattedModifier",
          "Unformatted modifier has no metrics.");

      return {
        width: this.state.left_shift + this.state.right_shift + this.spacing,
        spacing: this.spacing,
        extra_left_px: this.state.left_shift,
        extra_right_px: this.state.right_shift
      };
    },

    formatStrokes: function() {
      var left_shift = this.state.left_shift;
      var strokes = this.modifiers['strokes'];
      var stroke_spacing = 0;

      if (!strokes || strokes.length === 0) return this;

      var str_list = [];
      var i, str, shift;
      for (i = 0; i < strokes.length; ++i) {
        str = strokes[i];
        var note = str.getNote();
        var props;
        if (note instanceof Vex.Flow.StaveNote) {
          props = note.getKeyProps()[str.getIndex()];
          shift = (props.displaced ? note.getExtraLeftPx() : 0);
          str_list.push({ line: props.line, shift: shift, str: str });
        } else {
          props = note.getPositions()[str.getIndex()];
          str_list.push({ line: props.str, shift: 0, str: str });
        }
      }

      var str_shift = left_shift;
      var x_shift = 0;

      // There can only be one stroke .. if more than one, they overlay each other
      for (i = 0; i < str_list.length; ++i) {
        str = str_list[i].str;
        shift = str_list[i].shift;

        str.setXShift(str_shift + shift);
        x_shift = Math.max(str.getWidth() + stroke_spacing, x_shift);
      }

      this.state.left_shift += x_shift;
      return this;
    },

    formatStringNumbers: function() {
      var left_shift = this.state.left_shift;
      var right_shift = this.state.right_shift;
      var nums = this.modifiers['stringnumber'];
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

      this.state.left_shift += x_widthL;
      this.state.right_shift += x_widthR;
      return this;
    },

    formatBends: function() {
      var bends = this.modifiers['bends'];
      if (!bends || bends.length === 0) return this;

      var last_width = 0;
      var text_line = this.state.text_line;

      // Format Bends
      for (var i = 0; i < bends.length; ++i) {
        var bend = bends[i];
        bend.setXShift(last_width);
        last_width = bend.getWidth();
        bend.setTextLine(text_line);
      }

      this.state.right_shift += last_width;
      this.state.text_line += 1;
      return this;
    },

    formatVibratos: function() {
      var vibratos = this.modifiers['vibratos'];
      if (!vibratos || vibratos.length === 0) return this;

      var text_line = this.state.text_line;
      var width = 0;
      var shift = this.state.right_shift - 7;

      // If there's a bend, drop the text line
      var bends = this.modifiers['bends'];
      if (bends && bends.length > 0) {
        text_line--;
      }

      // Format Vibratos
      for (var i = 0; i < vibratos.length; ++i) {
        var vibrato = vibratos[i];
        vibrato.setXShift(shift);
        vibrato.setTextLine(text_line);
        width += vibrato.getWidth();
        shift += width;
      }

      this.state.right_shift += width;
      this.state.text_line += 1;
      return this;
    },

    formatAnnotations: function() {
      var annotations = this.modifiers['annotations'];
      if (!annotations || annotations.length === 0) return this;

      var text_line = this.state.text_line;
      var max_width = 0;

      // Format Annotations
      var width;
      for (var i = 0; i < annotations.length; ++i) {
        var annotation = annotations[i];
        annotation.setTextLine(text_line);
        width = annotation.getWidth() > max_width ?
          annotation.getWidth() : max_width;
        text_line++;
      }

      this.state.left_shift += width / 2;
      this.state.right_shift += width / 2;
      // No need to update text_line because we leave lots of room on the same
      // line.
      return this;
    },

    formatArticulations: function() {
      var articulations = this.modifiers['articulations'];
      if (!articulations || articulations.length === 0) return this;

      var text_line = this.state.text_line;
      var max_width = 0;

      // Format Articulations
      var width;
      for (var i = 0; i < articulations.length; ++i) {
        var articulation = articulations[i];
        articulation.setTextLine(text_line);
        width = articulation.getWidth() > max_width ?
          articulation.getWidth() : max_width;

        var type = Vex.Flow.articulationCodes(articulation.type);
        if(type.between_lines)
          text_line += 1;
        else
          text_line += 1.5;
      }

      this.state.left_shift += width / 2;
      this.state.right_shift += width / 2;
      this.state.text_line = text_line;
      return this;
    },

    formatOrnaments: function() {
      var ornaments = this.modifiers['ornaments'];
      if (!ornaments || ornaments.length === 0) return this;

      var text_line = this.state.text_line;
      var max_width = 0;

      // Format Articulations
      var width;
      for (var i = 0; i < ornaments.length; ++i) {
        var ornament = ornaments[i];
        ornament.setTextLine(text_line);
        width = ornament.getWidth() > max_width ?
          ornament.getWidth() : max_width;

        var type = Vex.Flow.ornamentCodes(ornament.type);
        if(type.between_lines)
          text_line += 1;
        else
          text_line += 1.5;
      }

      this.state.left_shift += width / 2;
      this.state.right_shift += width / 2;
      this.state.text_line = text_line;
      return this;
    },

    postFormatNotes: function() {
      var notes = this.modifiers['stavenotes'];

      if (!notes) return;

      notes.forEach(function(note) {
        note.postFormat();
      });

      return this;
    },

    preFormat: function() {
      if (this.preFormatted) return;
      L("Preformatting ModifierContext");

      // Format modifiers in the following order:
      Vex.Flow.StaveNote.format(this.modifiers["stavenotes"], this.state);
      Vex.Flow.Dot.format(this.modifiers["dots"], this.state);
      Vex.Flow.FretHandFinger.format(this.modifiers["frethandfinger"], this.state);
      Vex.Flow.Accidental.format(this.modifiers["accidentals"], this.state);
      Vex.Flow.GraceNoteGroup.format(this.modifiers["gracenotegroups"], this.state);

           this.formatStrokes().
           formatStringNumbers().
           formatArticulations().
           formatOrnaments().
           formatAnnotations().
           formatBends().
           formatVibratos();

      // Update width of this modifier context
      this.width = this.state.left_shift + this.state.right_shift;
      this.preFormatted = true;
    },

    postFormat: function() {
      if (this.postFormatted) return;

      this.postFormatNotes();
      return this;
    }
  };

  return ModifierContext;
}());
