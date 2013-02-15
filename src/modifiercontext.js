// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements various types of modifiers to notes (e.g. bends,
// fingering positions etc.) Accidentals should also be implemented as
// modifiers, eventually.

/**
 * @constructor
 */
Vex.Flow.ModifierContext = function() {
  // Current modifiers
  this.modifiers = {};

  // Formatting data.
  this.preFormatted = false;
  this.width = 0;
  this.spacing = 0;
  this.state = {
    left_shift: 0,
    right_shift: 0,
    text_line: 0
  };
}

Vex.Flow.ModifierContext.prototype.addModifier = function(modifier) {
  var type = modifier.getCategory();
  if (!this.modifiers[type]) this.modifiers[type] = [];
  this.modifiers[type].push(modifier);
  modifier.setModifierContext(this);
  this.preFormatted = false;
  return this;
}

Vex.Flow.ModifierContext.prototype.getModifiers = function(type) {
  return this.modifiers[type];
}

Vex.Flow.ModifierContext.prototype.getWidth = function() {
  return this.width;
}

Vex.Flow.ModifierContext.prototype.getExtraLeftPx = function() {
  return this.state.left_shift;
}

Vex.Flow.ModifierContext.prototype.getExtraRightPx = function() {
  return this.state.right_shift;
}

Vex.Flow.ModifierContext.prototype.getMetrics = function(modifier) {
  if (!this.formatted) throw new Vex.RERR("UnformattedModifier",
      "Unformatted modifier has no metrics.");

  return {
    width: this.state.left_shift + this.state.right_shift + this.spacing,
    spacing: this.spacing,
    extra_left_px: this.state.left_shift,
    extra_right_px: this.state.right_shift
  };
}

Vex.Flow.ModifierContext.prototype.formatNotes = function() {
  var notes = this.modifiers['stavenotes'];
  if (!notes || notes.length < 2) return this;

  if (notes[0].getStave() != null)
    return this.formatNotesByY(notes);

  // Assumption: no more than three notes
  Vex.Assert(notes.length < 4,
      "Got more than three notes in Vex.Flow.ModifierContext.formatNotes!");

  var notes_list= [];
  for (var i = 0; i < notes.length; i++) {
    var stem_order = notes[i].getStemDirection() == Vex.Flow.StaveNote.STEM_UP
             ? "2"
             : "1";
    var props = notes[i].getKeyProps();
    notes_list.push({sort_key: stem_order + props[0].octave + props[0].key,
                     line: props[0].line,
                     top_line: props[props.length -1].line,
                     stem_dir: notes[i].getStemDirection(),
                     stem_max: notes[i].getStemLength() / 10,
                     stem_min: notes[i].getStemMinumumLength() / 10,
                     voice_shift: notes[i].getVoiceShiftWidth(),
                     is_displaced: notes[i].isDisplaced(),
                     note: notes[i]});
  }

  // sort notes_list top to bottom
  notes_list.sort(Vex.SortStructArrayBy('sort_key', false, function(a){return a.toUpperCase()}));

  var top_note = notes_list[0];
  var bottom_note = notes_list[1];

  var voice_x_shift = Math.max(top_note.voice_shift, bottom_note.voice_shift);
  var x_shift = 0;
  var displaced = false;

  // If top two voices are middle and lower voice, check for middle voice stem
  // collision with lower voice. If a collision, shift middle voice right or 
  // shorten stem.
  if (top_note.stem_dir == bottom_note.stem_dir) {
    // Determine available lines for stem
    var stem_delta = top_note.line - (bottom_note.top_line + 0.5);
    if (top_note.line - top_note.stem_max <= bottom_note.top_line + 0.5) {
      // Determine optimal stem length
      var stem_length = Math.max(stem_delta, top_note.stem_min);
      // Shift note right when optimal stem length is too large
      if (stem_length > stem_delta) {
        x_shift = voice_x_shift + 3;
        top_note.note.setXShift(x_shift);
        displaced = true;
      }
      top_note.note.setStemLength(stem_length * 10);
    }
  } else if (bottom_note.is_displaced ||
             top_note.line <= (bottom_note.top_line + 0.5)) {
    // Top note is upper voice and voices intersect or bottom note manually
    // set to be shifted
    x_shift = voice_x_shift;
    // If a middle voice, add additional 3 pixel spacing between voices
    if (notes.length > 2 || top_note.stem_dir == bottom_note.stem_dir) {
      x_shift +=3;
    }
    bottom_note.note.setXShift(x_shift);
    displaced = true;
    // Have a lower voice, so set middle voice stem optimal length
    if (notes_list.length > 2) {
      // Get the lower voice and determine the optimal middle voice stem length
      var next_note = notes_list[2];
      var stem_delta = bottom_note.line - (next_note.top_line + 0.5);
      if (bottom_note.line - bottom_note.stem_max <= next_note.top_line + 0.5) {
        var stem_length = Math.max(stem_delta, bottom_note.stem_min);
        bottom_note.note.setStemLength(stem_length * 10);
      }
    }
  }

  // Have three voices with no middle voice shift. Test for note or stem
  // collision with lower voice and either shift middle voice or shorten
  // stem if needed.
  if (!displaced && notes_list.length > 2) {
    top_note = notes_list[1];
    bottom_note = notes_list[2];
    // if notes intersect, shift the top note (middle voice)
    if (top_note.line <= (bottom_note.top_line + 0.5) ||
        bottom_note.top_line + 0.5 > top_note.line - (top_note.stem_min)) {
      x_shift = voice_x_shift + 3;
      top_note.note.setXShift(x_shift);
    }
    var stem_delta = top_note.line - (bottom_note.top_line + 0.5);
    if (top_note.line - top_note.stem_max <= bottom_note.top_line + 0.5) {
      // Determine optimal stem length
      var stem_length = Math.max(stem_delta, top_note.stem_min);
      top_note.note.setStemLength(stem_length * 10);
    }
  }

  return this;
}

Vex.Flow.ModifierContext.prototype.formatNotesByY = function(notes) {
  // NOTE: this function does not support more than two voices
  //       use with care.
  var hasStave = true;

  for (var i = 0; i < notes.length; i++) {
    hasStave = hasStave && notes[i].getStave() != null;
  }

  if (!hasStave) throw new Vex.RERR("Stave Missing",
    "All notes must have a stave - Vex.Flow.ModifierContext.formatMultiVoice!");

  var x_shift = 0;

  for (var i = 0; i < notes.length - 1; i++) {
    var top_note = notes[i];
    var bottom_note = notes[i + 1];

    if (top_note.getStemDirection() == Vex.Flow.StaveNote.STEM_DOWN) {
      top_note = notes[i + 1];
      bottom_note = notes[i];
    }

    var top_keys = top_note.getKeyProps();
    var bottom_keys = bottom_note.getKeyProps();

    var topY = top_note.getStave().getYForLine(top_keys[0].line);
    var bottomY = bottom_note.getStave().getYForLine(bottom_keys[bottom_keys.length - 1].line);

    var line_space = top_note.getStave().options.spacing_between_lines_px;
    if (Math.abs(topY - bottomY) == line_space / 2) {
      x_shift = top_note.getVoiceShiftWidth();
      // If a middle voice, add additional spacing between notes
      if (notes.length > 2)
        x_shift +=3;
      bottom_note.setXShift(x_shift);
    }
  }

  this.state.right_shift += x_shift;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatDots = function() {
  var right_shift = this.state.right_shift;
  var dots = this.modifiers['dots'];
  var dot_spacing = 1;

  if (!dots || dots.length == 0) return this;

  var dot_list = [];
  for (var i = 0; i < dots.length; ++i) {
    var dot = dots[i];
    var note = dot.getNote();
    var props = note.getKeyProps()[dot.getIndex()];
    var shift = (props.displaced ? note.getExtraRightPx() : 0);
    dot_list.push({ line: props.line, shift: shift, note: note, dot: dot });
  }

  // Sort dots by line number.
  dot_list.sort(function(a, b) { return (b.line - a.line); });

  var dot_shift = right_shift;
  var x_width = 0;
  var top_line = dot_list[0].line;
  var last_line = null;
  var last_note = null;
  var prev_dotted_space = null;
  var half_shiftY = 0;

  for (var i = 0; i < dot_list.length; ++i) {
    var dot = dot_list[i].dot;
    var line = dot_list[i].line;
    var note = dot_list[i].note;
    var shift = dot_list[i].shift;

    // Reset the position of the dot every line.
    if (line != last_line || note != last_note) {
      dot_shift = shift;
    }

    if (!note.isRest() && line != last_line) {
      if (line % 1 == 0.5) {
        // note is on a space, so no dot shift
        half_shiftY = 0;
      } else if (!note.isRest()) {
        // note is on a line, so shift dot to space above the line
        half_shiftY = 0.5;
        if (last_note != null &&
            !last_note.isRest() && last_line - line == 0.5) {
          // previous note on a space, so shift dot to space below the line
          half_shiftY = -0.5;
        } else if (line + half_shiftY == prev_dotted_space) {
          // previous space is dotted, so shift dot to space below the line
           half_shiftY = -0.5;
        }
      }
    }

    // convert half_shiftY to a multiplier for dots.draw()
    dot.dot_shiftY += (-half_shiftY);
    prev_dotted_space = line + half_shiftY;

    dot.setXShift(dot_shift);
    dot_shift += dot.getWidth() + dot_spacing; // spacing
    x_width = (dot_shift > x_width) ? dot_shift : x_width;
    last_line = line;
    last_note = note;
  }

  this.state.right_shift += x_width;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatAccidentals = function() {
  var left_shift = this.state.left_shift;
  var accidentals = this.modifiers['accidentals'];
  var accidental_spacing = 2;

  if (!accidentals || accidentals.length == 0) return this;

  var acc_list = [];
  var hasStave = false;
  var prev_note = null;
  var shiftL = 0;

  for (var i = 0; i < accidentals.length; ++i) {
    var acc = accidentals[i];
    var note = acc.getNote();
    var stave = note.getStave();
    var props = note.getKeyProps()[acc.getIndex()];
    if (note != prev_note) {
       // Iterate through all notes to get the displaced pixels
       for (var n = 0; n < note.keys.length; ++n) {
          props_tmp = note.getKeyProps()[n];
          shiftL = (props_tmp.displaced ? note.getExtraLeftPx() : shiftL);
        }
        prev_note = note;
    }
    if (stave != null) {
      hasStave = true;
      var line_space = stave.options.spacing_between_lines_px;
      var y = stave.getYForLine(props.line);
      acc_list.push({ y: y, shift: shiftL, acc: acc, lineSpace: line_space });
    } else {
      acc_list.push({ line: props.line, shift: shiftL, acc: acc });
    }
  }

  // If stave assigned, format based on note y-position
  if (hasStave)
    return this.formatAccidentalsByY(acc_list);

  // Sort accidentals by line number.
  acc_list.sort(function(a, b) { return (b.line - a.line); });

  // If first note left shift in case it is displaced
  var acc_shift = acc_list[0].shift;
  var x_width = 0;
  var top_line = acc_list[0].line;
  for (var i = 0; i < acc_list.length; ++i) {
    var acc = acc_list[i].acc;
    var line = acc_list[i].line;
    var shift = acc_list[i].shift;

    // Once you hit three stave lines, you can reset the position of the
    // accidental.
    if (line < top_line - 3.0) {
      top_line = line;
      acc_shift = shift;
    }

    acc.setXShift(left_shift + acc_shift);
    acc_shift += acc.getWidth() + accidental_spacing; // spacing
    x_width = (acc_shift > x_width) ? acc_shift : x_width;
  }

  this.state.left_shift += x_width;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatAccidentalsByY = function(acc_list) {
  var left_shift = this.state.left_shift;
  var accidental_spacing = 2;

  // Sort accidentals by Y-position.
  acc_list.sort(function(a, b) { return (b.y - a.y); });

  // If first note is displaced, get the correct left shift
  var acc_shift = acc_list[0].shift;
  var x_width = 0;
  var top_y = acc_list[0].y;

  for (var i = 0; i < acc_list.length; ++i) {
    var acc = acc_list[i].acc;
    var y = acc_list[i].y;
    var shift = acc_list[i].shift;

    // Once you hit three stave lines, you can reset the position of the
    // accidental.
    if (top_y - y > 3 * acc_list[i].lineSpace) {
      top_y = y;
      acc_shift = shift;
    }

    acc.setXShift(acc_shift + left_shift);
    acc_shift += acc.getWidth() + accidental_spacing; // spacing
    x_width = (acc_shift > x_width) ? acc_shift : x_width;
  }

  this.state.left_shift += x_width;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatStrokes = function() {
  var left_shift = this.state.left_shift;
  var strokes = this.modifiers['strokes'];
  var stroke_spacing = 0;

  if (!strokes || strokes.length == 0) return this;

  var str_list = [];
  for (var i = 0; i < strokes.length; ++i) {
    var str = strokes[i];
    var note = str.getNote();
    if (note instanceof Vex.Flow.StaveNote) {
      var props = note.getKeyProps()[str.getIndex()];
      var shift = (props.displaced ? note.getExtraLeftPx() : 0);
      str_list.push({ line: props.line, shift: shift, str: str });
    } else {
      var props = note.getPositions()[str.getIndex()];
      str_list.push({ line: props.str, shift: 0, str: str });
    }
  }

  var str_shift = left_shift;
  var x_shift = 0;

  // There can only be one stroke .. if more than one, they overlay each other
  for (var i = 0; i < str_list.length; ++i) {
    var str = str_list[i].str;
    var line = str_list[i].line;
    var shift = str_list[i].shift;
    str.setXShift(str_shift + shift);
    x_shift = Math.max(str.getWidth() + stroke_spacing, x_shift);
  }

  this.state.left_shift += x_shift;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatStringNumbers = function() {
  var left_shift = this.state.left_shift;
  var right_shift = this.state.right_shift;
  var nums = this.modifiers['stringnumber'];
  var num_spacing = 1;

  if (!nums || nums.length == 0) return this;

  var nums_list = [];
  var prev_note = null;
  var shift_left = 0;
  var shift_right = 0;

  for (var i = 0; i < nums.length; ++i) {
    var num = nums[i];
    var note = num.getNote();

    for (var i = 0; i < nums.length; ++i) {
      var num = nums[i];
      var note = num.getNote();
      var props = note.getKeyProps()[num.getIndex()];
      var pos = num.getPosition();
      if (note != prev_note) {
        for (n = 0; n < note.keys.length; ++n) {
          props_tmp = note.getKeyProps()[n];
          if (left_shift == 0)
            shift_left = (props_tmp.displaced ? note.getExtraLeftPx() : shift_left);
          if (right_shift == 0)
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
  for (var i = 0; i < nums_list.length; ++i) {
    var num_shift = 0;
    var num = nums_list[i].num;
    var line = nums_list[i].line;
    var note = nums_list[i].note;
    var shiftL = nums_list[i].shiftL;
    var shiftR = nums_list[i].shiftR;
    var pos = nums_list[i].pos;

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
}

Vex.Flow.ModifierContext.prototype.formatFretHandFingers = function() {
  var left_shift = this.state.left_shift;
  var right_shift = this.state.right_shift;
  var nums = this.modifiers['frethandfinger'];
  var num_spacing = 1;

  if (!nums || nums.length == 0) return this;

  var nums_list = [];
  var prev_note = null;
  var shift_left = 0;
  var shift_right = 0;

  for (var i = 0; i < nums.length; ++i) {
    var num = nums[i];
    var note = num.getNote();
    var props = note.getKeyProps()[num.getIndex()];
    var pos = num.getPosition();
    if (note != prev_note) {
      for (n = 0; n < note.keys.length; ++n) {
        props_tmp = note.getKeyProps()[n];
        if (left_shift == 0)
          shift_left = (props_tmp.displaced ? note.getExtraLeftPx() : shift_left);
        if (right_shift == 0)
          shift_right = (props_tmp.displaced ? note.getExtraRightPx() : shift_right);
      }
      prev_note = note;
    }

    nums_list.push({ line: props.line, pos: pos, shiftL: shift_left, shiftR: shift_right, note: note, num: num });
  }

  // Sort fingernumbers by line number.
  nums_list.sort(function(a, b) { return (b.line - a.line); });

  var num_shiftL = 0;
  var num_shiftR = 0;
  var x_widthL = 0;
  var x_widthR = 0;
  var last_line = null;
  var last_note = null;

  for (var i = 0; i < nums_list.length; ++i) {
    var num_shift = 0;
    var num = nums_list[i].num;
    var line = nums_list[i].line;
    var note = nums_list[i].note;
    var shiftL = nums_list[i].shiftL;
    var shiftR = nums_list[i].shiftR;
    var pos = nums_list[i].pos;

    // Reset the position of the string number every line.
    if (line != last_line || note != last_note) {
      num_shiftL = left_shift + shiftL;
      num_shiftR = right_shift + shiftR;
    }

    var num_width = num.getWidth() + num_spacing;
    if (pos == Vex.Flow.Modifier.Position.LEFT) {
      num.setXShift(left_shift + num_shiftL);
      num_shift = left_shift + num_width; // spacing
      x_widthL = (num_shift > x_widthL) ? num_shift : x_widthL;
    } else if (pos == Vex.Flow.Modifier.Position.RIGHT) {
      num.setXShift(num_shiftR);
      num_shift = shift_right + num_width; // spacing
      x_widthR = (num_shift > x_widthR) ? num_shift : x_widthR;
    }
    last_line = line;
    last_note = note;
  }

  this.state.left_shift += x_widthL;
  this.state.right_shift += x_widthR;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatBends = function() {
  var right_shift = this.state.right_shift;
  var bends = this.modifiers['bends'];
  if (!bends || bends.length == 0) return this;

  var width = 0;
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
}

Vex.Flow.ModifierContext.prototype.formatVibratos = function() {
  var vibratos = this.modifiers['vibratos'];
  if (!vibratos || vibratos.length == 0) return this;

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
}

Vex.Flow.ModifierContext.prototype.formatAnnotations = function() {
  var annotations = this.modifiers['annotations'];
  if (!annotations || annotations.length == 0) return this;

  var text_line = this.state.text_line;
  var max_width = 0;

  // Format Annotations
  for (var i = 0; i < annotations.length; ++i) {
    var annotation = annotations[i];
    annotation.setTextLine(text_line);
    var width = annotation.getWidth() > max_width ?
      annotation.getWidth() : max_width;
    text_line++;
  }

  this.state.left_shift += width / 2;
  this.state.right_shift += width / 2;
  // No need to update text_line because we leave lots of room on the same
  // line.
  return this;
}

Vex.Flow.ModifierContext.prototype.formatArticulations = function() {
  var articulations = this.modifiers['articulations'];
  if (!articulations || articulations.length == 0) return this;

  var text_line = this.state.text_line;
  var max_width = 0;

  // Format Articulations
  for (var i = 0; i < articulations.length; ++i) {
    var articulation = articulations[i];
    articulation.setTextLine(text_line);
    var width = articulation.getWidth() > max_width ?
      articulation.getWidth() : max_width;
    text_line += 1.5;
  }

  this.state.left_shift += width / 2;
  this.state.right_shift += width / 2;
  this.state.text_line = text_line;
  return this;
}

Vex.Flow.ModifierContext.prototype.preFormat = function() {
  if (this.preFormatted) return;

  // Format modifiers in the following order:
  this.formatNotes().
       formatDots().
       formatFretHandFingers().
       formatAccidentals().
       formatStrokes().
       formatStringNumbers().
       formatArticulations().
       formatAnnotations().
       formatBends().
       formatVibratos();

  // Update width of this modifier context
  this.width = this.state.left_shift + this.state.right_shift;
  this.preFormatted = true;
}
