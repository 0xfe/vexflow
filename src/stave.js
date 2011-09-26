// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.Stave = function(x, y, width, options) {
  if (arguments.length > 0) this.init(x, y, width, options);
}

Vex.Flow.Stave.BarType = {
    NO_BAR: 1,
    SINGLE_BAR: 2,
    DOUBLE_BAR: 3,
    END_BAR: 4,
    REPEAT_BEGIN: 5,
    REPEAT_END: 6
};
Vex.Flow.Stave.RepetitionType = {
    NONE: 1,	    // no coda or segno
    CODA_LEFT: 2,	// coda at beginning of stave
    CODA_RIGHT: 3,	// coda at end of stave
    SEGNO_LEFT: 4,	// segno at beginning of stave
    SEGNO_RIGHT: 5,	// segno at end of stave
    DC: 6,	        // D.C. at end of stave
    DC_AL_CODA: 7,	// D.C. al coda at end of stave
    DC_AL_FINE: 8,	// D.C. al Fine end of stave
    DS: 9,	        // D.S. at end of stave
    DS_AL_CODA: 10,	// D.S. or D.S al coda at end of stave
    DS_AL_FINE: 11,  // D.S. al Fine at end of stave
    FINE: 12  		// Fine at end of stave
};
Vex.Flow.Stave.VoltaType = {
  NONE: 1,
  BEGIN: 2,
  MID: 3,
  END: 4,
  BEGIN_END: 5
};

Vex.Flow.Stave.prototype.init = function(x, y, width, options) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.glyph_start_x = x + 5;
  this.start_x = this.glyph_start_x + 5;
  this.context = null;
  this.glyphs = [];
  this.options = {
    vertical_bar_width: 10, // Width around vertical bar end-marker
    glyph_spacing_px: 10,
    num_lines: 5,
    spacing_between_lines_px: 10, // in pixels
    space_above_staff_ln: 4, // in staff lines
    space_below_staff_ln: 4,  // in staff lines
    top_text_position: 1, // in staff lines
    bottom_text_position: 7, // in staff lines
    beg_bar: Vex.Flow.Stave.BarType.SINGLE_BAR,	// Beginning bar type
    end_bar: Vex.Flow.Stave.BarType.SINGLE_BAR,	// Ending bar type
    symbol_left: Vex.Flow.Stave.RepetitionType.NONE,
    symbol_left_y_offset: 0,
    symbol_right: Vex.Flow.Stave.RepetitionType.NONE,
    symbol_right_y_offset: 0,
    volta: Vex.Flow.Stave.VoltaType.NONE,
    volta_number: "",
    volta_y_offset: 0
  };
  Vex.Merge(this.options, options);

  this.height =
    (this.options.num_lines + this.options.space_above_staff_ln) *
    this.options.spacing_between_lines_px;
}

Vex.Flow.Stave.prototype.setNoteStartX = function(x) {
  this.start_x = x; return this; }
Vex.Flow.Stave.prototype.getNoteStartX = function() {
  return this.start_x; }
Vex.Flow.Stave.prototype.getNoteEndX = function() {
  return this.x + this.width; }
Vex.Flow.Stave.prototype.getTieStartX = function() {
  return this.start_x; }
Vex.Flow.Stave.prototype.getTieEndX = function() {
  return this.x + this.width; }
Vex.Flow.Stave.prototype.setContext = function(context) {
  this.context = context; return this; }
Vex.Flow.Stave.prototype.getX = function() {
  return this.x;
}
Vex.Flow.Stave.prototype.getNumLines = function() {
  return this.options.num_lines;
}
Vex.Flow.Stave.prototype.setY = function(y) {
  this.y = y; return this;
}
Vex.Flow.Stave.prototype.setWidth = function(width) {
  this.width = width; return this;
}
Vex.Flow.Stave.prototype.setBegBarType = function(type) {
  this.options.beg_bar = type; return this;
}
Vex.Flow.Stave.prototype.setEndBarType = function(type) {
  this.options.end_bar = type; return this;
}
Vex.Flow.Stave.prototype.setSymbolTypeLeft = function(type, y) {
  this.options.symbol_left = type; 
  this.options.symbol_left_y_offset = y;
  return this;
}
Vex.Flow.Stave.prototype.setSymbolTypeRight = function(type, y) {
  this.options.symbol_right = type; 
  this.options.symbol_right_y_offset = y;
  return this;
}
Vex.Flow.Stave.prototype.setVoltaType = function(type, number, y) {
  this.options.volta = type;
  this.options.volta_number = number;
  this.options.volta_y_offset = y;
  return this;
}
Vex.Flow.Stave.prototype.getHeight = function(width) {
  return this.height;
}
Vex.Flow.Stave.prototype.getBottomY = function() {
  var options = this.options;
  var spacing = options.spacing_between_lines_px;
  var score_bottom = this.getYForLine(options.num_lines) +
    (options.space_below_staff_ln * spacing);

  return score_bottom;
}

Vex.Flow.Stave.prototype.getYForLine = function(line) {
  var options = this.options;
  var spacing = options.spacing_between_lines_px;
  var headroom = options.space_above_staff_ln;
  var y = this.y + ((line * spacing) + (headroom * spacing));

  return y;
}

Vex.Flow.Stave.prototype.getYForTopText = function(line) {
  var l = line || 0;
  return this.getYForLine(-l - this.options.top_text_position);
}

Vex.Flow.Stave.prototype.getYForBottomText = function(line) {
  var l = line || 0;
  return this.getYForLine(this.options.bottom_text_position + l);
}

Vex.Flow.Stave.prototype.getYForNote = function(line) {
  var options = this.options;
  var spacing = options.spacing_between_lines_px;
  var headroom = options.space_above_staff_ln;
  var y = this.y + (headroom * spacing) + (5 * spacing) - (line * spacing);

  return y;
}

Vex.Flow.Stave.prototype.getYForGlyphs = function() {
  return this.getYForLine(3);
}

Vex.Flow.Stave.prototype.addGlyph = function(glyph) {
  glyph.setStave(this);
  this.glyphs.push(glyph);
  this.start_x += glyph.getMetrics().width;
  return this;
}

Vex.Flow.Stave.prototype.addModifier = function(modifier) {
  modifier.addToStave(this, (this.glyphs.length == 0));
  return this;
}

Vex.Flow.Stave.prototype.addKeySignature = function(keySpec) {
  this.addModifier(new Vex.Flow.KeySignature(keySpec));
  return this;
}

Vex.Flow.Stave.prototype.addClef = function(clef) {
  this.addModifier(new Vex.Flow.Clef(clef));
  return this;
}

Vex.Flow.Stave.prototype.addTimeSignature = function(timeSpec) {
  this.addModifier(new Vex.Flow.TimeSignature(timeSpec));
  return this;
}

Vex.Flow.Stave.prototype.addTrebleGlyph = function() {
  this.addGlyph(new Vex.Flow.Glyph("v83", 40));
  return this;
}

/**
 * All drawing functions below need the context to be set.
 */
Vex.Flow.Stave.prototype.draw = function(context) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var num_lines = this.options.num_lines;
  var width = this.width;
  var x = this.x;

  this.drawVerticalBar(0);
  for (var line=0; line < num_lines; line++) {
    var y = this.getYForLine(line);
    this.context.fillRect(x, y, width, 1);
  }

  x = this.glyph_start_x;
  var bar_x = 0;
  for (var i = 0; i < this.glyphs.length; ++i) {
    var glyph = this.glyphs[i];
    if (!glyph.getContext()) glyph.setContext(this.context);
    glyph.renderToStave(x);
    x += glyph.getMetrics().width;
    bar_x += glyph.getMetrics().width;
  }
  	// Add padding after clef, time sig, key sig
  if (bar_x > 0) bar_x += this.options.vertical_bar_width;
  	// Draw the bar only if not a single bar. It has already been drawn
    // at the beginning of the stave.
  if (this.options.beg_bar > Vex.Flow.Stave.BarType.SINGLE_BAR)
    this.drawBar(bar_x, this.options.beg_bar);
  if (this.options.volta != Vex.Flow.Stave.VoltaType.NONE)
	  this.drawVolta(this.x + bar_x, this.options.volta);
  if (this.options.symbol_left != Vex.Flow.Stave.RepetitionType.NONE)
	  this.drawSymbol(this.x + bar_x, this.options.symbol_left);
  if (this.options.symbol_right != Vex.Flow.Stave.RepetitionType.NONE)
	  this.drawSymbol(this.x + bar_x, this.options.symbol_right);
  this.drawBar(this.width, this.options.end_bar);

  return this;
}

Vex.Flow.Stave.prototype.drawVerticalBar = function(x) {
  this.drawVerticalBarFixed(this.x + x, false);
}

Vex.Flow.Stave.prototype.drawDoubleVerticalBar = function(x) {
  this.drawVerticalBarFixed(this.x + x, true);
}

Vex.Flow.Stave.prototype.drawVerticalEndBar = function(x) {
  this.drawVerticalEndBarFixed(this.x + x);
}

Vex.Flow.Stave.prototype.drawRepeatBar = function(x, begin) {
  this.drawRepeatBarFixed(this.x + x, begin);
}

Vex.Flow.Stave.prototype.drawVerticalBarFixed = function(x, double) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var top_line = this.getYForLine(0);
  var bottom_line = this.getYForLine(this.options.num_lines - 1);
  if (double)
	  this.context.fillRect(x - 3, top_line, 1, bottom_line - top_line + 1);
  this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
}

Vex.Flow.Stave.prototype.drawVerticalEndBarFixed = function(x) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var top_line = this.getYForLine(0);
  var bottom_line = this.getYForLine(this.options.num_lines - 1);
  this.context.fillRect(x - 5, top_line, 1, bottom_line - top_line + 1);
  this.context.fillRect(x - 2, top_line, 3, bottom_line - top_line + 1);
}

Vex.Flow.Stave.prototype.drawRepeatBarFixed = function(x, begin) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var top_line = this.getYForLine(0);
  var bottom_line = this.getYForLine(this.options.num_lines - 1);
  var x_shift = 3; 
  if (!begin) {
	 x_shift = -5; 
  }
  this.context.fillRect(x + x_shift, top_line, 1, bottom_line - top_line + 1);
  this.context.fillRect(x - 2, top_line, 3, bottom_line - top_line + 1);
  
  var dot_radius = 2;
  	// Shift dots left ot right
  if (begin) {
     x_shift += 4; 
  } else {
	 x_shift -= 4;
  }
  
  var dot_x = (x + x_shift) + (dot_radius / 2);
  	// calculate the y offset based on number of stave lines
  var y_offset = (this.options.num_lines -1) * this.options.spacing_between_lines_px;
  y_offset = (y_offset / 2) - 
             (this.options.spacing_between_lines_px / 2);
  var dot_y = top_line + y_offset + (dot_radius / 2);
  	// draw the top repeat dot
  this.context.beginPath();
  this.context.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
  this.context.fill();
    //draw the bottom repeat dot
  dot_y += this.options.spacing_between_lines_px;
  this.context.beginPath();
  this.context.arc(dot_x, dot_y, dot_radius, 0, Math.PI * 2, false);
  this.context.fill();

}

Vex.Flow.Stave.prototype.drawBar = function(x, type) {
  switch (type) {
    case Vex.Flow.Stave.BarType.SINGLE_BAR:
      this.drawVerticalBar(x)
      break;
    case Vex.Flow.Stave.BarType.DOUBLE_BAR:
      this.drawDoubleVerticalBar(x);
      break;
    case Vex.Flow.Stave.BarType.END_BAR:
      this.drawVerticalEndBar(x);
      break;
    case Vex.Flow.Stave.BarType.REPEAT_BEGIN:
      this.drawRepeatBar(x, true);
      break;
    case Vex.Flow.Stave.BarType.REPEAT_END:
      this.drawRepeatBar(x, false);
      break;
    default:
      break;
  }
}

Vex.Flow.Stave.prototype.drawSymbol = function(x, type) {
  switch (type) {
    case Vex.Flow.Stave.RepetitionType.CODA_RIGHT:
      this.drawCodaFixed(this.x + this.width - 11, this.options.symbol_left_y_offset);
      break;
    case Vex.Flow.Stave.RepetitionType.CODA_LEFT:
      this.drawSymbolText(this.options.symbol_left, "Coda", 
      this.options.symbol_left_y_offset, true);
      break;
    case Vex.Flow.Stave.RepetitionType.SEGNO_LEFT:
      this.drawSignoFixed(x - 11, this.options.symbol_left_y_offset);
      break;
    case Vex.Flow.Stave.RepetitionType.SEGNO_RIGHT:
      this.drawSignoFixed(this.x + this.width - 11, this.options.symbol_right_y_offset);
      break;
    case Vex.Flow.Stave.RepetitionType.DC:
      this.drawSymbolText(this.options.symbol_right, "D.C.", 
    	                  this.options.symbol_right_y_offset, false);
      break;
    case Vex.Flow.Stave.RepetitionType.DC_AL_CODA:
      this.drawSymbolText(this.options.symbol_right, "D.C. al", 
    	                  this.options.symbol_right_y_offset, true);
      break;
    case Vex.Flow.Stave.RepetitionType.DC_AL_FINE:
      this.drawSymbolText(this.options.symbol_right, "D.C. al Fine", 
    	                  this.options.symbol_right_y_offset, false);
      break;
    case Vex.Flow.Stave.RepetitionType.DS:
      this.drawSymbolText(this.options.symbol_right, "D.S.", 
    	                  this.options.symbol_right_y_offset, false);
      break;
    case Vex.Flow.Stave.RepetitionType.DS_AL_CODA:
      this.drawSymbolText(this.options.symbol_right, "D.S. al", 
    	                  this.options.symbol_right_y_offset, true);
      break;
    case Vex.Flow.Stave.RepetitionType.DS_AL_FINE:
      this.drawSymbolText(this.options.symbol_right, "D.S. al Fine", 
    	                  this.options.symbol_right_y_offset, false);
      break;
    case Vex.Flow.Stave.RepetitionType.FINE:
      this.drawSymbolText(this.options.symbol_right, "Fine", 
    	                  this.options.symbol_right_y_offset, false);
      break;
    default:
      break;
  }
}

Vex.Flow.Stave.prototype.drawCodaFixed = function(x, offset) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");
  var y = this.getYForTopText(this.options.num_lines) + offset;
  Vex.Flow.renderGlyph(this.context, x + 11, y + 25, 40, "v4d", true);
  return this;
}

Vex.Flow.Stave.prototype.drawSignoFixed = function(x, offset) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");
  var y = this.getYForTopText(this.options.num_lines) + offset;
  Vex.Flow.renderGlyph(this.context, x + 11, y + 25, 30, "v8c", true);
  return this;
}

Vex.Flow.Stave.prototype.drawSymbolText = function(type, text, offset, draw_coda) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");
  this.context.save();
  this.context.setFont("Times", 12, "bold italic");
  	// Default to right symbol
  var x = this.x + this.width - 20;
  var text_x = x - Vex.Flow.textWidth(text) - 5;
  if (type == Vex.Flow.Stave.RepetitionType.CODA_LEFT) {
	text_x = this.x + this.options.vertical_bar_width;
	x = text_x + Vex.Flow.textWidth(text) + 10;
  }
  var y = this.getYForTopText(this.options.num_lines) + offset;
  if (draw_coda) {
     Vex.Flow.renderGlyph(this.context, x + 11, y, 40, "v4d", true);
  }
  
//  x -= Vex.Flow.textWidth(text)+ 5;
  this.context.fillText(text, text_x, y + 5);
  this.context.restore();   
  return this;
}

Vex.Flow.Stave.prototype.drawVolta = function(x, type) {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
    "Can't draw stave without canvas context.");
  var width = this.width;
  var top_y = this.getYForTopText(this.options.num_lines) 
            + this.options.volta_y_offset;
  var vert_height = 1.5 * this.options.spacing_between_lines_px;
  switch(type) {
    case Vex.Flow.Stave.VoltaType.BEGIN:
      this.context.fillRect(x, top_y, 1, vert_height);
        // Draw measure number
      this.context.save();
      this.context.setFont("sans_serif", 10, "bold");
      this.context.fillText(this.options.volta_number, x + 5, top_y + 15);
      this.context.restore();
      break;
    case Vex.Flow.Stave.VoltaType.END:
      width -= 5;
      this.context.fillRect(x + width, top_y, 1, vert_height);
      break;
    case Vex.Flow.Stave.VoltaType.BEGIN_END:
      width -= 3;
      this.context.fillRect(x, top_y, 1, vert_height);
      // Draw measure number
      this.context.save();
      this.context.setFont("sans_serif", 10, "bold");
      this.context.fillText(this.options.volta_number, x + 5, top_y + 15);
      this.context.restore();
      this.context.fillRect(x + width, top_y, 1,  vert_height);
      break;
  }

  this.context.fillRect(x, top_y, width, 1);
  return this;    
}
