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
  }
}

Vex.Flow.ModifierContext.prototype.formatNotes = function() {
  var notes = this.modifiers['stavenotes'];
  if (!notes || notes.length < 2) return this;

  if (notes[0].getStave() != null)
    return this.formatNotesByY(notes);

  // Assumption: only two notes
  Vex.Assert(notes.length == 2,
      "Got more than two notes in Vex.Flow.ModifierContext.formatNotes!");

  var top_note = notes[0];
  var bottom_note = notes[1];

  // If notes intersect, then shift the bottom stemmed note right
  if (notes[0].getStemDirection() == Vex.Flow.StaveNote.STEM_DOWN) {
    bottom_note = notes[0];
    top_note = notes[1];
  }

  var top_keys = top_note.getKeyProps();
  var bottom_keys = bottom_note.getKeyProps();

  // XXX: Do this right (by key, not whole note).
  var x_shift = 0;
  if (top_keys[0].line <= (bottom_keys[bottom_keys.length - 1].line + 0.5)) {
     x_shift = top_note.getVoiceShiftWidth();
     bottom_note.setXShift(x_shift);
  }

  this.state.right_shift += x_shift;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatNotesByY = function(notes) {
  // Called from formatNotes when more than two voices
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
  for (var i = 0; i < dot_list.length; ++i) {
    var dot = dot_list[i].dot;
    var line = dot_list[i].line;
    var note = dot_list[i].note;
    var shift = dot_list[i].shift;

    // Reset the position of the dot every line.
    if (line != last_line || note != last_note) {
      dot_shift = right_shift + shift;
    }

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

  for (var i = 0; i < accidentals.length; ++i) {
    var acc = accidentals[i];
    var note = acc.getNote();
    var stave = note.getStave();
    var props = note.getKeyProps()[acc.getIndex()];
    var shift = (props.displaced ? note.getExtraLeftPx() : 0);
    if (stave != null) {
      hasStave = true;
      var line_space = stave.options.spacing_between_lines_px;
      var y = stave.getYForLine(props.line);
      acc_list.push({ y: y, shift: shift, acc: acc, lineSpace: line_space });
    } else {
      acc_list.push({ line: props.line, shift: shift, acc: acc });
    }
  }

  // If stave assigned, format based on note y-position
  if (hasStave)
    return this.formatAccidentalsByY(acc_list);

  // Sort accidentals by line number.
  acc_list.sort(function(a, b) { return (b.line - a.line); });

  // If first note left shift in case it is displaced
  var acc_shift = left_shift + acc_list[0].shift;
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
      acc_shift = left_shift + shift;
    }

    acc.setXShift(acc_shift);
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
  var acc_shift = left_shift + acc_list[0].shift;
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
      acc_shift = left_shift + shift;
    }

    acc.setXShift(acc_shift);
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
    var props = note.getKeyProps()[str.getIndex()];
    var shift = (props.displaced ? note.getExtraLeftPx() : 0);
    str_list.push({ line: props.line, shift: shift, str: str });
  }

  var str_shift = left_shift;
  var x_shift = 0;

  // There can only be one stroke .. if more than one, they overlay each other
  for (var i = 0; i < str_list.length; ++i) {
    var str = str_list[i].str;
    var line = str_list[i].line;
    var shift = str_list[i].shift;
    str.setXShift(str_shift);
    x_shift = Math.max(str.getWidth() + stroke_spacing, x_shift);
  }

  this.state.left_shift += x_shift;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatBends = function() {
  var right_shift = this.state.right_shift;
  var bends = this.modifiers['bends'];
  if (!bends || bends.length == 0) return this;

  var width = 0;
  var text_line = this.state.text_line;

  // Format Bends
  for (var i = 0; i < bends.length; ++i) {
    var bend = bends[i];
    var text_width = Vex.Flow.textWidth(bend.getText());
    width += bend.render_options.bend_width + text_width / 2;
    bend.setBendWidth(width);
    width += bend.release_width + text_width / 2;
    bend.setTextLine(text_line);
  }

  this.state.right_shift += width;
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

Vex.Flow.ModifierContext.prototype.preFormat = function() {
  if (this.preFormatted) return;

  // Format modifiers in the following order:
  this.formatNotes().
       formatAccidentals().
       formatDots().
       formatStrokes().
       formatAnnotations().
       formatBends().
       formatVibratos();

  // Update width of this modifier context
  this.width = this.state.left_shift + this.state.right_shift;
  this.preFormatted = true;
}
