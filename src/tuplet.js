/**
 * Create a new tuplet from the specified notes. The notes must
 * be part of the same line, and have the same duration (in ticks).
 *
 * @constructor
 * @param {Array.<Vex.Flow.StaveNote>} A set of notes.
 */
Vex.Flow.Tuplet = function(notes, options) {
  if (arguments.length > 0) this.init(notes, options);
}

Vex.Flow.Tuplet.LOCATION_TOP = 1;
Vex.Flow.Tuplet.LOCATION_BOTTOM = -1;

/**
 * Set the notes to attach this tuplet to.
 *
 * @param {Array.<Vex.Flow.StaveNote>} The notes.
 */
Vex.Flow.Tuplet.prototype.init = function(notes, options) {
  if (!notes || notes == []) {
    throw new Vex.RuntimeError("BadArguments", "No notes provided for tuplet.");
  }

  if (notes.length == 1) {
    throw new Vex.RuntimeError("BadArguments", "Too few notes for tuplet.");
  }

  this.options = Vex.Merge({}, options);
  this.notes = notes;
  this.num_notes = 'num_notes' in this.options
                 ? this.options.num_notes : notes.length;
  this.beats_occupied = 'beats_occupied' in this.options
                      ? this.options.beats_occupied : 2;
  this.bracketed = (notes[0].beam == null);
  this.ratioed = false;
  this.point = 28;
  this.y_pos = 16;
  this.x_pos = 100;
  this.width = 200;
  this.location = Vex.Flow.Tuplet.LOCATION_TOP;

  Vex.Flow.Formatter.AlignRestsToNotes(notes, true, true);
  this.resolveGlyphs();
  this.attach();
}

Vex.Flow.Tuplet.prototype.attach = function () {
  for (var i = 0; i < this.notes.length; i++) {
    var note = this.notes[i];
    note.setTuplet(this);
  }
}

Vex.Flow.Tuplet.prototype.detach = function () {
  for (var i = 0; i < this.notes.length; i++) {
    var note = this.notes[i];
    note.setTuplet(null);
  }
}

Vex.Flow.Tuplet.prototype.setContext = function(context) {
  this.context = context;
  return this;
}

/**
 * Set whether or not the bracket is drawn.
 */
Vex.Flow.Tuplet.prototype.setBracketed = function(bracketed) {
  this.bracketed = bracketed ? true : false;
  return this;
}

/**
 * Set whether or not the ratio is shown.
 */
Vex.Flow.Tuplet.prototype.setRatioed = function(ratioed) {
  this.ratioed = ratioed ? true : false;
  return this;
}

/**
 * Set the tuplet to be displayed either on the top or bottom of the stave
 */
Vex.Flow.Tuplet.prototype.setTupletLocation = function(location) {
  if (!location) location = Vex.Flow.Tuplet.LOCATION_TOP;
  else if (location != Vex.Flow.Tuplet.LOCATION_TOP &&
      location != Vex.Flow.Tuplet.LOCATION_BOTTOM) {
    throw new Vex.RERR("BadArgument", "Invalid tuplet location: " + location);
  }

  this.location = location;
  return this;
}

Vex.Flow.Tuplet.prototype.getNotes = function() {
  return this.notes;
}

Vex.Flow.Tuplet.prototype.getNoteCount = function() {
  return this.num_notes;
}

Vex.Flow.Tuplet.prototype.getBeatsOccupied = function() {
  return this.beats_occupied;
}

Vex.Flow.Tuplet.prototype.setBeatsOccupied = function(beats) {
  this.detach();

  this.beats_occupied = beats;

  this.resolveGlyphs();

  this.attach();
}

Vex.Flow.Tuplet.prototype.resolveGlyphs = function() {
  this.num_glyphs = [];
  var n = this.num_notes;
  while (n >= 1) {
    this.num_glyphs.push(new Vex.Flow.Glyph("v" + (n % 10), this.point));
    n = parseInt(n / 10);
  }

  this.denom_glyphs = [];
  n = this.beats_occupied;
  while (n >= 1) {
    this.denom_glyphs.push(new Vex.Flow.Glyph("v" + (n % 10), this.point));
    n = parseInt(n / 10);
  }
}

Vex.Flow.Tuplet.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");

  // determine x value of left bound of tuplet
  var first_note = this.notes[0];
  var last_note = this.notes[this.notes.length - 1];

  if (!this.bracketed) {
    this.x_pos = first_note.getStemX();
    this.width = last_note.getStemX() - this.x_pos;
  }
  else {
    this.x_pos = first_note.getTieLeftX() - 5;
    this.width = last_note.getTieRightX() - this.x_pos + 5;
  }

  // determine y value for tuplet
  if (this.location == Vex.Flow.Tuplet.LOCATION_TOP) {
    this.y_pos = first_note.getStave().getYForLine(0) - 15;
    //this.y_pos = first_note.getStemExtents().topY - 10;

    for (var i=0; i<this.notes.length; ++i) {
      var top_y = this.notes[i].getStemExtents().topY - 10;
      if (top_y < this.y_pos)
        this.y_pos = top_y;
    }
  }
  else {
    this.y_pos = first_note.getStave().getYForLine(4) + 20;

    for (var i=0; i<this.notes.length; ++i) {
      var bottom_y = this.notes[i].getStemExtents().topY + 10;
      if (bottom_y > this.y_pos)
        this.y_pos = bottom_y;
    }
  }

  // calculate total width of tuplet notation
  var width = 0;
  for (var glyph in this.num_glyphs) {
    width += this.num_glyphs[glyph].getMetrics().width;
  }
  if (this.ratioed) {
    for (var glyph in this.denom_glyphs) {
      width += this.denom_glyphs[glyph].getMetrics().width;
    }
    width += this.point * 0.32;
  }
  var notation_center_x = this.x_pos + (this.width/2);
  var notation_start_x = notation_center_x - (width/2);

  // draw bracket if the tuplet is not beamed
  if (this.bracketed) {
    var line_width = this.width/2 - width/2 - 5;

    // only draw the bracket if it has positive length
    if (line_width > 0) {
      this.context.fillRect(this.x_pos, this.y_pos,line_width, 1);
      this.context.fillRect(this.x_pos + this.width / 2 + width / 2 + 5,
                            this.y_pos,line_width, 1);
      this.context.fillRect(this.x_pos,
          this.y_pos + (this.location == Vex.Flow.Tuplet.LOCATION_BOTTOM),
          1, this.location * 10);
      this.context.fillRect(this.x_pos + this.width,
          this.y_pos + (this.location == Vex.Flow.Tuplet.LOCATION_BOTTOM),
          1, this.location * 10);
    }
  }

  // draw numerator glyphs
  var x_offset = 0;
  var size = this.num_glyphs.length;
  for (var glyph in this.num_glyphs) {
    this.num_glyphs[size-glyph-1].render(
        this.context, notation_start_x + x_offset,
        this.y_pos + (this.point/3) - 2);
    x_offset += this.num_glyphs[size-glyph-1].getMetrics().width;
  }

  // display colon and denominator if the ratio is to be shown
  if (this.ratioed) {
    var colon_x = notation_start_x + x_offset + this.point*0.16;
    var colon_radius = this.point * 0.06;
    this.context.beginPath();
    this.context.arc(colon_x, this.y_pos - this.point*0.08,
                     colon_radius, 0, Math.PI*2, true);
    this.context.closePath();
    this.context.fill();
    this.context.beginPath();
    this.context.arc(colon_x, this.y_pos + this.point*0.12,
                     colon_radius, 0, Math.PI*2, true);
    this.context.closePath();
    this.context.fill();
    x_offset += this.point*0.32;
    var size = this.denom_glyphs.length;
    for (var glyph in this.denom_glyphs) {
      this.denom_glyphs[size-glyph-1].render(
          this.context, notation_start_x + x_offset,
          this.y_pos + (this.point/3) - 2);
      x_offset += this.denom_glyphs[size-glyph-1].getMetrics().width;
    }
  }
}
