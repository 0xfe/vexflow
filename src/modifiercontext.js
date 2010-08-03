// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements varies types of modifiers to notes (e.g. bends, 
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

  var top_note = notes[0];
  var bottom_note = notes[1];

  // If notes intersect, then shift the bottom stemmed note right
  if (notes[0].getStemDirection() == Vex.Flow.StaveNote.STEM_DOWN) {
    bottom_note = notes[0];
    top_note = notes[1];
  }

  var top_keys = top_note.getKeyProps();
  var bottom_keys = bottom_note.getKeyProps();

  var x_shift = 0;
  if (top_keys[0].line <= (bottom_keys[bottom_keys.length - 1].line + 0.5)) {
     x_shift = top_note.getVoiceShiftWidth();
     bottom_note.setXShift(x_shift);
  }

  this.state.right_shift += x_shift;
  return this;
}

Vex.Flow.ModifierContext.prototype.formatAccidentals = function() {
  var left_shift = this.state.left_shift;
  var accidentals = this.modifiers['accidentals'];
  var accidental_spacing = 2;

  if (!accidentals || accidentals.length == 0) return this;

  var acc_list = [];
  for (var i = 0; i < accidentals.length; ++i) {
    var acc = accidentals[i];
    var line = acc.getNote().getKeyProps()[acc.getIndex()].line;
    acc_list.push({ line: line, acc: acc });
  }

  // Sort accidentals by line number.
  acc_list.sort(function(a, b) { return (b.line - a.line); });

  var acc_shift = left_shift;
  var x_width = 0;
  var top_line = acc_list[0].line;
  for (var i = 0; i < acc_list.length; ++i) {
    var acc = acc_list[i].acc;
    var line = acc_list[i].line;

    // Once you hit three stave lines, you can reset the position of the
    // accidental.
    if (line < top_line - 3.0) {
      top_line = line;
      acc_shift = left_shift;
    }

    acc.setXShift(acc_shift);
    acc_shift += acc.getWidth() + accidental_spacing; // spacing
    x_width = (acc_shift > x_width) ? acc_shift : x_width;
  }

  this.state.left_shift += x_width;
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
  this.formatNotes().formatAccidentals().formatAnnotations().
    formatBends().formatVibratos();

  // Update width of this modifier context
  this.width = this.state.left_shift + this.state.right_shift;
  this.preFormatted = true;
}
