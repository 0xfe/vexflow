// Vex Flow - Stave Note implementation.
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.StaveNote = function(note_struct) {
  if (arguments.length > 0) this.init(note_struct);
}

// Inherits from Vex.Flow.Note
Vex.Flow.StaveNote.prototype = new Vex.Flow.Note();
Vex.Flow.StaveNote.superclass = Vex.Flow.Note.prototype;
Vex.Flow.StaveNote.constructor = Vex.Flow.StaveNote;

// Stem directions
Vex.Flow.StaveNote.STEM_UP = 1;
Vex.Flow.StaveNote.STEM_DOWN = -1;

Vex.Flow.StaveNote.prototype.getCategory = function() { return "stavenotes"; }
Vex.Flow.StaveNote.prototype.init = function(note_struct) {
  var superclass = Vex.Flow.StaveNote.superclass;
  superclass.init.call(this, note_struct);

  this.keys = note_struct.keys;
  this.clef = note_struct.clef;
  this.beam = null;

  // Pull note rendering properties
  this.glyph = Vex.Flow.durationToGlyph(this.duration, this.noteType);
  if (!this.glyph) {
    throw new Vex.RuntimeError("BadArguments",
        "Invalid note initialization data (No glyph found): " +
        JSON.stringify(note_struct));
  }

  this.notes_displaced = false;   // if true, displace note to right
  this.dot_shiftY = 0;
  this.keyProps = [];             // per-note properties

  // Pull per-note location and other rendering properties.
  this.displaced = false;
  var last_line = null;
  for (var i = 0; i < this.keys.length; ++i) {
    var key = this.keys[i];

    // All rests use the same position on the line.
    // if (this.glyph.rest) key = this.glyph.position;
    if (this.glyph.rest) this.glyph.position = key;
    var props = Vex.Flow.keyProperties(key, this.clef);
    if (!props) {
      throw new Vex.RuntimeError("BadArguments",
          "Invalid key for note properties: " + key);
    }

    // Calculate displacement of this note
    var line = props.line;
    if (last_line == null) {
      last_line = line;
    } else {
      if (Math.abs(last_line - line) == 0.5) {
        this.displaced = true;
        props.displaced = true;

        // Have to mark the previous note as
        // displaced as well, for modifier placement
        if (this.keyProps.length > 0) {
            this.keyProps[i-1].displaced = true;
        }
      }
    }

    last_line = line;
    this.keyProps.push(props);
  }

  // Sort the notes from lowest line to highest line
  this.keyProps.sort(function(a, b) {return a.line - b.line});

  // Drawing
  this.modifiers = [];

  this.render_options = {
    glyph_font_scale: 38, // font size for note heads and rests
    stem_height: 35,      // in pixels
    stroke_px: 3,         // number of stroke px to the left and right of head
    stroke_spacing: 10,    // spacing between strokes (TODO: take from stave)
    annotation_spacing: 5 // spacing above note for annotations
  }

  // whole note has no stem
  if (this.duration == "w") this.render_options.stem_height = 0;
  // Lengthen 32nd & 64th note stems for additional flags/beams
  if (this.duration == "32") this.render_options.stem_height = 45;
  if (this.duration == "64") this.render_options.stem_height = 50;

  var auto_stem_direction;
  if (note_struct.auto_stem) {
    // Figure out optimal stem direction based on given notes
    this.min_line = this.keyProps[0].line;
    if (this.min_line < 3) {
      auto_stem_direction = 1;
    } else {
      auto_stem_direction = -1;
    }
    this.setStemDirection(auto_stem_direction);
  } else {
    this.setStemDirection(note_struct.stem_direction);
  }

  // Calculate left/right padding
  this.calcExtraPx();
}

Vex.Flow.StaveNote.prototype.getBoundingBox = function() {
  if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
      "Can't call getBoundingBox on an unformatted note.");

  var metrics = this.getMetrics();

  var w = metrics.width;
  var x = this.getAbsoluteX() - metrics.modLeftPx - metrics.extraLeftPx;

  var min_y = 0;
  var max_y = 0;
  var half_line_spacing = this.getStave().getSpacingBetweenLines() / 2;
  var line_spacing = half_line_spacing * 2;

  if (this.isRest()) {
    var y = this.ys[0];
    if (this.duration == "w" || this.duration == "h") {
      min_y = y - half_line_spacing;
      max_y = y + half_line_spacing;
    } else {
      min_y = y - (this.glyph.line_above * line_spacing);
      max_y = y + (this.glyph.line_below * line_spacing);
    }
  } else if (this.glyph.stem) {
    var ys = this.getStemExtents();
    ys.baseY += half_line_spacing * this.stem_direction;
    min_y = Vex.Min(ys.topY, ys.baseY);
    max_y = Vex.Max(ys.topY, ys.baseY);
  } else {
    min_y = null;
    max_y = null;

    for (var i=0; i < this.ys.length; ++i) {
      var yy = this.ys[i];
      if (i == 0) {
        min_y = yy;
        max_y = yy;
      } else {
        min_y = Vex.Min(yy, min_y);
        max_y = Vex.Max(yy, max_y);
      }
      min_y -= half_line_spacing;
      max_y += half_line_spacing;
    }
  }

  return new Vex.Flow.BoundingBox(x, min_y, w, max_y - min_y);
}

Vex.Flow.StaveNote.prototype.isRest = function() {
  return this.glyph.rest;
}

Vex.Flow.StaveNote.prototype.hasStem = function() {
  return this.glyph.stem;
}

Vex.Flow.StaveNote.prototype.getYForTopText = function(text_line) {
  var extents = this.getStemExtents();
  return Vex.Min(this.stave.getYForTopText(text_line),
      extents.topY - (this.render_options.annotation_spacing * (text_line + 1)));
}

Vex.Flow.StaveNote.prototype.getYForBottomText = function(text_line) {
  var extents = this.getStemExtents();
  return Vex.Max(this.stave.getYForTopText(text_line),
      extents.baseY + (this.render_options.annotation_spacing * (text_line)));
}

Vex.Flow.StaveNote.prototype.setStave = function(stave) {
  var superclass = Vex.Flow.StaveNote.superclass;
  superclass.setStave.call(this, stave);
  var ys = [];

  // Setup y coordinates for score.
  for (var i = 0; i < this.keyProps.length; ++i) {
    var line = this.keyProps[i].line;
    ys.push(this.stave.getYForNote(line));
  }

  return this.setYs(ys);
}

// Get individual note/octave pairs for all notes in this
// chord.
Vex.Flow.StaveNote.prototype.getKeys = function() {
  return this.keys;
}

// Get the Key Properties for each note in chord
Vex.Flow.StaveNote.prototype.getKeyProps = function() {
  return this.keyProps;
}

Vex.Flow.StaveNote.prototype.getStemLength = function() {
  return this.render_options.stem_height;
}

// Determine minimum length of stem
Vex.Flow.StaveNote.prototype.getStemMinumumLength = function() {
  var length = this.duration == "w" ? 0 : 20;
  // if note is flagged, cannot shorten beam
  switch (this.duration) {
   case "8":
     if (this.beam == null) length = 35;
     break;
   case "16":
     if (this.beam == null)
       length = 35;
     else
       length = 25;
     break;
   case "32":
     if (this.beam == null)
       length = 45;
     else
       length = 35;
     break;
   case "64":
     if (this.beam == null)
       length = 50;
     else
       length = 40;
     break;
  }
  return length;
}

Vex.Flow.StaveNote.prototype.getStemDirection = function() {
  return this.stem_direction;
}

Vex.Flow.StaveNote.prototype.getStemX = function() {
  var x_begin = this.getAbsoluteX() + this.x_shift;
  var x_end = this.getAbsoluteX() + this.x_shift + this.glyph.head_width;
  var stem_x = this.stem_direction == Vex.Flow.StaveNote.STEM_DOWN ?
    x_begin : x_end;

  return stem_x;
}

// Check if note is manually shifted to the right
Vex.Flow.StaveNote.prototype.isDisplaced = function() {
  return this.notes_displaced;
}
// Manual setting of note shift to the right
Vex.Flow.StaveNote.prototype.setNoteDisplaced = function(displaced) {
  this.notes_displaced = displaced;
  return this;
}

// Manuallly set note stem length
Vex.Flow.StaveNote.prototype.setStemLength = function(height) {
  this.render_options.stem_height = height;
  return this;
}

Vex.Flow.StaveNote.prototype.getStemExtents = function() {
  if (!this.ys || this.ys.length == 0) throw new Vex.RERR("NoYValues",
      "Can't get top stem Y when note has no Y values.");

  var top_pixel = this.ys[0];
  var base_pixel = this.ys[0];

  for (var i = 0; i < this.ys.length; ++i) {
    var stem_top = this.ys[i] +
      (this.render_options.stem_height * -this.stem_direction);

    if (this.stem_direction == Vex.Flow.StaveNote.STEM_DOWN) {
      top_pixel = (top_pixel > stem_top) ? top_pixel : stem_top;
      base_pixel = (base_pixel < this.ys[i]) ? base_pixel : this.ys[i];
    } else {
      top_pixel = (top_pixel < stem_top) ? top_pixel : stem_top;
      base_pixel = (base_pixel > this.ys[i]) ? base_pixel : this.ys[i];
    }

    if(this.noteType == "s" || this.noteType == 'x') {
      top_pixel -= this.stem_direction * 7;
      base_pixel -= this.stem_direction * 7;
    }
  }

  return { topY: top_pixel, baseY: base_pixel };
}

Vex.Flow.StaveNote.prototype.getTieRightX = function() {
  var tieStartX = this.getAbsoluteX();
  tieStartX += this.glyph.head_width + this.x_shift + this.extraRightPx;
  if (this.modifierContext) tieStartX += this.modifierContext.getExtraRightPx();
  return tieStartX;
}

Vex.Flow.StaveNote.prototype.getTieLeftX = function() {
  var tieEndX = this.getAbsoluteX();
  tieEndX += this.x_shift - this.extraLeftPx;
  return tieEndX;
}

Vex.Flow.StaveNote.prototype.getLineForRest = function() {
  var rest_line = this.keyProps[0].line;
  if (this.keyProps.length > 1) {
    var last_line  = this.keyProps[this.keyProps.length - 1].line;
    var top = Vex.Max(rest_line, last_line);
    var bot = Vex.Min(rest_line, last_line);
    rest_line = Vex.MidLine(top, bot)
  }

  return rest_line;
}

Vex.Flow.StaveNote.prototype.getModifierStartXY = function(position, index) {
  if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
      "Can't call GetModifierStartXY on an unformatted note");

  if (this.ys.length == 0) throw new Vex.RERR("NoYValues",
      "No Y-Values calculated for this note.");

  var x = 0;
  if (position == Vex.Flow.Modifier.Position.LEFT) {
    x = -1 * 2;  // extra_left_px
  } else if (position == Vex.Flow.Modifier.Position.RIGHT) {
    x = this.glyph.head_width + this.x_shift + 2; // extra_right_px
  } else if (position == Vex.Flow.Modifier.Position.BELOW ||
             position == Vex.Flow.Modifier.Position.ABOVE) {
    x = this.glyph.head_width / 2;
  }

  return { x: this.getAbsoluteX() + x, y: this.ys[index] };
}


Vex.Flow.StaveNote.prototype.setStemDirection = function(direction) {
  if (!direction) direction = Vex.Flow.StaveNote.STEM_UP;
  if (direction != Vex.Flow.StaveNote.STEM_UP &&
      direction != Vex.Flow.StaveNote.STEM_DOWN) {
    throw new Vex.RERR("BadArgument", "Invalid stem direction: " + direction);
  }

  this.stem_direction = direction;
  this.beam = null;
  if (this.preFormatted) {
    this.preFormat();
  }
  return this;
}

Vex.Flow.StaveNote.prototype.setBeam = function(beam) {
  this.beam = beam;
  return this;
}

Vex.Flow.StaveNote.prototype.getGlyph = function() {
  return this.glyph;
}

Vex.Flow.StaveNote.prototype.addToModifierContext = function(mc) {
  this.setModifierContext(mc);
  for (var i = 0; i < this.modifiers.length; ++i) {
    this.modifierContext.addModifier(this.modifiers[i]);
  }
  this.modifierContext.addModifier(this);
  this.setPreFormatted(false);
}

// Generic function to add modifiers to a note
Vex.Flow.StaveNote.prototype.addModifier = function(index, modifier) {
  modifier.setNote(this);
  modifier.setIndex(index);
  this.modifiers.push(modifier);
  this.setPreFormatted(false);
  return this;
}

Vex.Flow.StaveNote.prototype.addAccidental = function(index, accidental) {
  accidental.setNote(this);
  accidental.setIndex(index);
  this.modifiers.push(accidental);
  this.setPreFormatted(false);
  return this;
}

Vex.Flow.StaveNote.prototype.addArticulation = function(index, articulation) {
  articulation.setNote(this);
  articulation.setIndex(index);
  this.modifiers.push(articulation);
  this.setPreFormatted(false);
  return this;
}

/* This tends to not work too well on StaveNotes.
 * TODO(0xfe): position annotations below */
Vex.Flow.StaveNote.prototype.addAnnotation = function(index, annotation) {
  annotation.setNote(this);
  annotation.setIndex(index);
  this.modifiers.push(annotation);
  this.setPreFormatted(false);
  return this;
}

Vex.Flow.StaveNote.prototype.addDot = function(index) {
  var dot = new Vex.Flow.Dot();
  dot.setNote(this);
  dot.setIndex(index);
  dot.setDotShiftY(this.glyph.dot_shiftY);
  this.modifiers.push(dot);
  this.setPreFormatted(false);
  this.dots++;
  return this;
}

// Convenience method to add dot to all notes in chord
Vex.Flow.StaveNote.prototype.addDotToAll = function() {
  for (var i = 0; i < this.keys.length; ++i)
    this.addDot(i);
  return this;
}

Vex.Flow.StaveNote.prototype.getAccidentals = function() {
  return this.modifierContext.getModifiers("accidentals");
}

Vex.Flow.StaveNote.prototype.getDots = function() {
  return this.modifierContext.getModifiers("dots");
}


Vex.Flow.StaveNote.prototype.getVoiceShiftWidth = function() {
  // TODO: may need to accomodate for dot here.
  return this.glyph.head_width * (this.displaced ? 2 : 1);
}

// I moved this into init() to avoid having to ensure that notes
// are preformatted before their modifiers.
Vex.Flow.StaveNote.prototype.calcExtraPx = function() {
  this.setExtraLeftPx((this.displaced && this.stem_direction == -1) ?
      this.glyph.head_width : 0);
  this.setExtraRightPx((this.displaced && this.stem_direction == 1) ?
      this.glyph.head_width : 0);
}

// Pre-render formatting
Vex.Flow.StaveNote.prototype.preFormat = function() {
  if (this.preFormatted) return;
  if (this.modifierContext) this.modifierContext.preFormat();

  var width = this.glyph.head_width + this.extraLeftPx + this.extraRightPx;

  // For upward flagged notes, the width of the flag needs to be added
  if (this.glyph.flag && this.beam == null && this.stem_direction == 1) {
    width += this.glyph.head_width;
  }

  this.setWidth(width);

  this.setPreFormatted(true);
}

Vex.Flow.StaveNote.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");
  if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
  if (this.ys.length == 0) throw new Vex.RERR("NoYValues",
      "Can't draw note without Y values.");

  var ctx = this.context;
  var x = this.getAbsoluteX() + this.x_shift;

  var ys = this.ys;
  var keys = this.keys;
  var glyph = this.glyph;
  var stem_direction = this.stem_direction;
  var default_head_x = null;

  // What elements do we render?
  var render_head = true;
  var render_stem = (this.beam == null);
  var render_flag = (this.beam == null);

  // Begin and end positions for head.
  var x_begin = x;
  var x_end = x + glyph.head_width;

  // Top and bottom Y values for stem.
  var y_top = null;
  var y_bottom = null;

  // Displacement variables.
  var last_line = null;
  var displaced = false;

  // Draw notes from bottom to top.
  var start_i = 0;
  var end_i = keys.length;
  var step_i = 1;


  // For down-stem notes, we draw from top to bottom.
  if (stem_direction == Vex.Flow.StaveNote.STEM_DOWN) {
    start_i = keys.length - 1;
    end_i = -1;
    step_i = -1;
  }

  // Keep track of highest and lowest lines for drawing strokes.
  var highest_line = 5;
  var lowest_line = 1;

  // Private function to draw slash note heads, glyphs were not slanted enough
  // and too small.
  function drawSlashNoteHead(stavenote, ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y + 11);
    ctx.lineTo(x, y + 1);
    ctx.lineTo(x + 15, y - 10);
    ctx.lineTo(x + 15, y);
    ctx.lineTo(x, y + 11);
    ctx.closePath();

    // only fill if quarter note or smaller
    if (stavenote.duration != 1 &&
        stavenote.duration != 2 &&
        stavenote.duration != "h" &&
        stavenote.duration != "w") {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  for (var i = start_i; i != end_i; i += step_i) {
    var note_props = this.keyProps[i];
    var line = note_props.line;
    highest_line = line > highest_line ? line : highest_line;
    lowest_line = line < lowest_line ? line : lowest_line;

    // Keep track of last line with a note head, so that consecutive heads
    // are correctly displaced.
    if (last_line == null) {
      last_line = line;
    } else {
      if (Math.abs(last_line - line) == 0.5) {
        displaced = !displaced;
      } else {
        displaced = false;
        default_head_x = x;
      }
    }
    last_line = line;

    // Get Y value for this head.
    var y = ys[i];

    // Keep track of top and bottom note for stem
    if (y_top == null || y < y_top) y_top = y;
    if (y_bottom == null || y > y_bottom) y_bottom = y;

    // Get glyph code and initial X position for the head. Displaced heads
    // are shifted exactly one head-width right.
    var code_head = glyph.code_head;
    var head_x = x_begin +
      (displaced ? glyph.head_width * stem_direction : 0);

    // For special notes (such as "X"), use the glyph code from the
    // key properties.
    if (note_props.code) {
      code_head = note_props.code;
      head_x = x_begin + note_props.shift_right;
    }

    // Draw the head.
    if (render_head) {
     head_x = Math.round(head_x);

      // if a slash note, draw 'manually' as font glyphs do not slant enough
      // and are too small.
      if (this.noteType == "s") {
        drawSlashNoteHead(this, ctx, head_x + (this.stem_direction == 1 ? 1:0), y);
      } else {
        Vex.Flow.renderGlyph(ctx, head_x,
            y, this.render_options.glyph_font_scale, code_head);
      }

      // If note above/below the staff, draw the small staff
      if (line <= 0 || line >= 6) {
        var line_y = y;
        var floor = Math.floor(line);
        if (line < 0 && floor - line == -0.5)
          line_y -= 5;
        else if (line > 6 &&  floor - line == -0.5)
          line_y += 5;
        ctx.fillRect(
          head_x - this.render_options.stroke_px, line_y,
          ((head_x + glyph.head_width) - head_x) +
          (this.render_options.stroke_px * 2), 1);
      }
    }
  }

  // Vex.drawDot(ctx, head_x, this.stave.getYForNote(1), "#f55");
  // Vex.drawDot(ctx, head_x, this.stave.getYForNote(5), "#55f");

  // For heads that are off the staff, draw the tiny stroke line. Only
  // applicable to non-rests.
//  if (!glyph.rest) {
    var that = this;

    function stroke(y) {
      if (default_head_x != null) head_x = default_head_x;
      ctx.fillRect(
        head_x - that.render_options.stroke_px, y,
        ((head_x + glyph.head_width) - head_x) +
        (that.render_options.stroke_px * 2), 1);
    }

    for (var line = 6; line <= highest_line; ++line) {
      stroke(this.stave.getYForNote(line));
    }

    for (var line = 0; line >= lowest_line; --line) {
      stroke(this.stave.getYForNote(line));
    }
//  }

  // Calculate stem height based on number of notes in this chord.
  var note_stem_height = ((y_bottom - y_top) * stem_direction) +
    (this.render_options.stem_height * stem_direction);

  if (glyph.stem && render_stem) {
    var stem_x, stem_y;

    if (stem_direction == Vex.Flow.StaveNote.STEM_DOWN) {
      // Down stems are rendered to the left of the head.
      stem_x = x_begin;
      stem_y = y_top;

      // Shorten stem length for 1/2 & 1/4 dead note heads (X)
      if (glyph.code_head == "v95" ||
          glyph.code_head == "v3e") {
       stem_y += 4;
      }

    } else {
      // Up stems are rendered to the right of the head.
      stem_x = x_end;
      stem_y = y_bottom;


      // Shorten stem length for 1/2 & 1/4 dead note heads (X)
      if (glyph.code_head == "v95" ||
          glyph.code_head == "v3e")
       stem_y -= 4;
    }

    // Draw the stem

    ctx.fillRect(stem_x,
        stem_y - (note_stem_height < 0 ? 0 : note_stem_height),
        1,
        Math.abs(note_stem_height));
  }

  // Now it's the flag's turn.
  if (glyph.flag && render_flag) {
    var flag_x, flag_y, flag_code;

    if (stem_direction == Vex.Flow.StaveNote.STEM_DOWN) {
      // Down stems have flags on the left.
      flag_x = x_begin + 1;
      flag_y = y_top - note_stem_height;
      flag_code = glyph.code_flag_downstem;

    } else {
      // Up stems have flags on the left.
      flag_x = x_end + 1;
      flag_y = y_bottom - note_stem_height;
      flag_code = glyph.code_flag_upstem;
    }

    // Draw the Flag
    Vex.Flow.renderGlyph(ctx, flag_x, flag_y,
        this.render_options.glyph_font_scale, flag_code);
  }

  // Draw the modifiers
  for (var i = 0; i < this.modifiers.length; ++i) {
    var mod = this.modifiers[i];
    mod.setContext(this.context);
    mod.draw();
  }
}
