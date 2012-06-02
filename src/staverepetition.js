// Vex Flow Notation
// Author Larry Kuhns 2011
// Implements Repetitions (Coda, signo, D.C., etc.)
//
// Requires vex.js.

/** 
 * @constructor 
 */
Vex.Flow.Repetition = function(type, x, y_shift) { 
  if (arguments.length > 0) this.init(type, x, y_shift); 
}

Vex.Flow.Repetition.type = {

  NONE: 1,         // no coda or segno
  CODA_LEFT: 2,    // coda at beginning of stave
  CODA_RIGHT: 3,   // coda at end of stave
  SEGNO_LEFT: 4,   // segno at beginning of stave
  SEGNO_RIGHT: 5,  // segno at end of stave
  DC: 6,           // D.C. at end of stave
  DC_AL_CODA: 7,   // D.C. al coda at end of stave
  DC_AL_FINE: 8,   // D.C. al Fine end of stave
  DS: 9,           // D.S. at end of stave
  DS_AL_CODA: 10,  // D.S. al coda at end of stave
  DS_AL_FINE: 11,  // D.S. al Fine at end of stave
  FINE: 12         // Fine at end of stave
};

Vex.Flow.Repetition.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.Repetition.prototype.constructor = Vex.Flow.Repetition;
Vex.Flow.Repetition.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.Repetition.prototype.init = function(type, x, y_shift) {
  var superclass = Vex.Flow.Repetition.superclass;
  superclass.init.call(this);


  this.symbol_type = type;
  this.x = x;
  this.x_shift = 0;
  this.y_shift = y_shift;
  this.font = {
    family: "times",
    size: 12,
    weight: "bold italic"
  }
}

Vex.Flow.Repetition.prototype.getCategory = function() {return "repetitions";}

Vex.Flow.Repetition.prototype.setShiftX = function(x) {
  this.x_shift = x; return this;
}
Vex.Flow.Repetition.prototype.setShiftY = function(y) {
  this.y_shift = y; return this;
}

Vex.Flow.Repetition.prototype.draw = function(stave, x) {

  switch (this.symbol_type) {
    case Vex.Flow.Repetition.type.CODA_RIGHT:
      this.drawCodaFixed(stave, x + stave.width);
      break;
    case Vex.Flow.Repetition.type.CODA_LEFT:
      this.drawSymbolText(stave, x, "Coda", true);
      break;
    case Vex.Flow.Repetition.type.SEGNO_LEFT:
      this.drawSignoFixed(stave, x);
      break;
    case Vex.Flow.Repetition.type.SEGNO_RIGHT:
      this.drawSignoFixed(stave, x + stave.width);
      break;
    case Vex.Flow.Repetition.type.DC:
      this.drawSymbolText(stave, x, "D.C.", false);
      break;
    case Vex.Flow.Repetition.type.DC_AL_CODA:
      this.drawSymbolText(stave, x, "D.C. al", true);
      break;
    case Vex.Flow.Repetition.type.DC_AL_FINE:
      this.drawSymbolText(stave, x, "D.C. al Fine", false);
      break;
    case Vex.Flow.Repetition.type.DS:
      this.drawSymbolText(stave, x, "D.S.", false);
      break;
    case Vex.Flow.Repetition.type.DS_AL_CODA:
      this.drawSymbolText(stave, x, "D.S. al", true);
      break;
    case Vex.Flow.Repetition.type.DS_AL_FINE:
      this.drawSymbolText(stave, x, "D.S. al Fine", false);
      break;
    case Vex.Flow.Repetition.type.FINE:
      this.drawSymbolText(stave, x, "Fine", false);
      break;
    default:
      break;
  }

  return this;
}

Vex.Flow.Repetition.prototype.drawCodaFixed = function(stave, x) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
  Vex.Flow.renderGlyph(stave.context, this.x + x + this.x_shift, 
                       y + 25, 40, "v4d", true);
  return this;
}

Vex.Flow.Repetition.prototype.drawSignoFixed = function(stave, x) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");
  var y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
  Vex.Flow.renderGlyph(stave.context, this.x + x + this.x_shift, 
                       y + 25, 30, "v8c", true);
  return this;
}

Vex.Flow.Repetition.prototype.drawSymbolText = function(stave, x, text, draw_coda) {
  if (!stave.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw stave without canvas context.");

  var ctx = stave.context;
  ctx.save();
  ctx.setFont(this.font.family, this.font.size, this.font.weight);
    // Default to right symbol
  var text_x = 0 + this.x_shift;
  var symbol_x = x + this.x_shift;
  if (this.symbol_type == Vex.Flow.Repetition.type.CODA_LEFT) {
      // Offset Coda text to right of stave beginning
    text_x = this.x + stave.options.vertical_bar_width;
    symbol_x = text_x + ctx.measureText(text).width + 12;
  } else {
      // Offset Signo text to left stave end
    symbol_x = this.x + x + stave.width - 5 + this.x_shift;
    text_x = symbol_x - + ctx.measureText(text).width - 12;
  }
  var y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
  if (draw_coda) {
    Vex.Flow.renderGlyph(ctx, symbol_x, y, 40, "v4d", true);
  }
  
  ctx.fillText(text, text_x, y + 5);
  ctx.restore();

  return this;
}