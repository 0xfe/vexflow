// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.TabNote = function(tab_struct) {
  if (arguments.length > 0) this.init(tab_struct);
}
Vex.Flow.TabNote.prototype = new Vex.Flow.Note();
Vex.Flow.TabNote.superclass = Vex.Flow.Note.prototype;
Vex.Flow.TabNote.constructor = Vex.Flow.TabNote;

Vex.Flow.TabNote.prototype.init = function(tab_struct) {
  var superclass = Vex.Flow.TabNote.superclass;
  superclass.init.call(this, tab_struct.duration);
  // Note properties
  this.positions = tab_struct.positions; // [{ str: X, fret: X }]
  this.modifiers = [];
  this.render_options = {
    glyph_font_scale: 30 // font size for note heads and rests
  }

  this.glyphs = [];
  this.width = 0;
  for (var i = 0; i < this.positions.length; ++i) {
    var fret = this.positions[i].fret;
    var glyph = Vex.Flow.tabToGlyph(fret);
    this.glyphs.push(glyph);
    this.width = (glyph.width > this.width) ? glyph.width : this.width;
  }
}

Vex.Flow.TabNote.prototype.setStave = function(stave) {
  var superclass = Vex.Flow.TabNote.superclass;
  superclass.setStave.call(this, stave);
  this.context = stave.context;
  this.width = 0;
  
  // Calculate the fret number width based on font used
  if (this.context) {
    for (var i = 0; i < this.glyphs.length; ++i) {
      var text = "" + this.glyphs[i].text;
      if (text.toUpperCase() != "X")
        this.glyphs[i].width = this.context.measureText(text).width;
      this.width = (this.glyphs[i].width > this.width) ?
        this.glyphs[i].width : this.width;
    }
  }

  var ys = [];

  // Setup y coordinates for score.
  for (var i = 0; i < this.positions.length; ++i) {
    var line = this.positions[i].str;
    ys.push(this.stave.getYForLine(line - 1));
  }

  return this.setYs(ys);
}

// Get the Tab Positions for each note in chord
Vex.Flow.TabNote.prototype.getPositions = function() {
  return this.positions;
}

Vex.Flow.TabNote.prototype.addToModifierContext = function(mc) {
  this.setModifierContext(mc);
  for (var i = 0; i < this.modifiers.length; ++i) {
    this.modifierContext.addModifier(this.modifiers[i]);
  }
  this.preFormatted = false;
  return this;
}

Vex.Flow.TabNote.prototype.addModifier = function(modifier, index) {
  modifier.setNote(this);
  modifier.setIndex(index || 0);
  this.modifiers.push(modifier);
  this.setPreFormatted(false);
  return this;
}

Vex.Flow.TabNote.prototype.getTieRightX = function() {
  var tieStartX = this.getAbsoluteX();
  var note_glyph_width = Vex.Flow.durationToGlyph(this.duration).head_width;
  tieStartX += (note_glyph_width / 2);
  tieStartX += ((-this.width / 2) + this.width + 2);

  return tieStartX;
}

Vex.Flow.TabNote.prototype.getTieLeftX = function() {
  var tieEndX = this.getAbsoluteX();
  var note_glyph_width = Vex.Flow.durationToGlyph(this.duration).head_width;
  tieEndX += (note_glyph_width / 2);
  tieEndX -= ((this.width / 2) + 2);

  return tieEndX;
}

Vex.Flow.TabNote.prototype.getModifierStartXY = function(position, index) {
  if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
      "Can't call GetModifierStartXY on an unformatted note");

  if (this.ys.length == 0) throw new Vex.RERR("NoYValues",
      "No Y-Values calculated for this note.");

  var x = 0;
  if (position == Vex.Flow.Modifier.Position.LEFT) {
    x = -1 * 2;  // extra_left_px
  } else if (position == Vex.Flow.Modifier.Position.RIGHT) {
    x = this.width + 2; // extra_right_px
  } else if (position == Vex.Flow.Modifier.Position.BELOW ||
             position == Vex.Flow.Modifier.Position.ABOVE) {
      var note_glyph_width = Vex.Flow.durationToGlyph(this.duration).head_width;
      x = note_glyph_width / 2;
  }

  return {x: this.getAbsoluteX() + x, y: this.ys[index]};
}

// Pre-render formatting
Vex.Flow.TabNote.prototype.preFormat = function() {
  if (this.preFormatted) return;
  if (this.modifierContext) this.modifierContext.preFormat();
  // width is already set during init()
  this.setPreFormatted(true);
}

Vex.Flow.TabNote.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");
  if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");
  if (this.ys.length == 0) throw new Vex.RERR("NoYValues",
      "Can't draw note without Y values.");

  var ctx = this.context;
  var x = this.getAbsoluteX();
  var ys = this.ys;

  for (var i = 0; i < this.positions.length; ++i) {
    var y = ys[i];

    var glyph = this.glyphs[i];

    // Center the fret text beneath the notation note head
    var note_glyph_width = Vex.Flow.durationToGlyph(this.duration).head_width;
    var tab_x = x + (note_glyph_width / 2) - (glyph.width / 2);

    ctx.clearRect(tab_x - 2, y - 3, glyph.width + 4, 6);

    if (glyph.code) {
      Vex.Flow.renderGlyph(ctx, tab_x, y + 5 + glyph.shift_y,
          this.render_options.glyph_font_scale, glyph.code);
    } else {
      var text = glyph.text.toString();
      ctx.fillText(text, tab_x, y + 5);
    }
  }

  // Draw the modifiers
  for (var i = 0; i < this.modifiers.length; ++i) {
    var modifier = this.modifiers[i];
    modifier.setContext(this.context);
    modifier.draw();
  }
}
