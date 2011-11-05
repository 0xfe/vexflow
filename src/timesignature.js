// Vex Flow Notation
// Implements time signatures glyphs for staffs
// See tables.js for the internal time signatures
// representation
//

/**
 * @constructor
 */
Vex.Flow.TimeSignature = function(timeSpec) {
  if (arguments.length > 0) this.init(timeSpec);
}


Vex.Flow.TimeSignature.glyphs = {
  "C": {
    code: "v41",
    point: 40,
    line: 2
  },
  "C|": {
    code: "vb6",
    point: 40,
    line: 2
  }
}
Vex.Flow.TimeSignature.prototype = new Vex.Flow.StaveModifier();
Vex.Flow.TimeSignature.prototype.constructor = Vex.Flow.TimeSignature;
Vex.Flow.TimeSignature.superclass = Vex.Flow.StaveModifier.prototype;

Vex.Flow.TimeSignature.prototype.init = function(timeSpec) {
  Vex.Flow.TimeSignature.superclass.init();

  this.setPadding(15);
  this.point = 40;
  this.topLine = 2;
  this.bottomLine = 4;
  this.timeSig = this.parseTimeSpec(timeSpec);
}

Vex.Flow.TimeSignature.prototype.parseTimeSpec = function(timeSpec) {
  if (timeSpec == "C" || timeSpec == "C|") {
    var glyphInfo = Vex.Flow.TimeSignature.glyphs[timeSpec];
    return {num: false, line: glyphInfo.line,
      glyph: new Vex.Flow.Glyph(glyphInfo.code, glyphInfo.point)};
  }

  var topNums = new Array();
  var i = 0;
  for (; i < timeSpec.length; ++i) {
    var c = timeSpec.charAt(i);
    if (c == "/") {
      break;
    }
    else if (/[0-9]/.test(c)) {
      topNums.push(c);
    }
    else {
      throw new Vex.RERR("BadTimeSignature",
          "Invalid time spec: " + timeSpec);
    }
  }

  if (i == 0) {
    throw new Vex.RERR("BadTimeSignature",
          "Invalid time spec: " + timeSpec);
  }

  // skip the "/"
  ++i;

  if (i == timeSpec.length) {
    throw new Vex.RERR("BadTimeSignature",
          "Invalid time spec: " + timeSpec);
  }


  var botNums = new Array();
  for (; i < timeSpec.length; ++i) {
    var c = timeSpec.charAt(i);
    if (/[0-9]/.test(c)) {
      botNums.push(c);
    }
    else {
      throw new Vex.RERR("BadTimeSignature",
          "Invalid time spec: " + timeSpec);
    }
  }


  return {num: true, glyph: this.makeTimeSignatureGlyph(topNums, botNums)};
}

Vex.Flow.TimeSignature.prototype.makeTimeSignatureGlyph = function(topNums, botNums) {
  var glyph = new Vex.Flow.Glyph("v0", this.point);
  glyph["topGlyphs"] = [];
  glyph["botGlyphs"] = [];

  var topWidth = 0;
  for (var i = 0; i < topNums.length; ++i) {
    var num = topNums[i];
    var topGlyph = new Vex.Flow.Glyph("v" + num, this.point);

    glyph.topGlyphs.push(topGlyph);
    topWidth += topGlyph.getMetrics().width;
  }

  var botWidth = 0;
  for (var i = 0; i < botNums.length; ++i) {
    var num = botNums[i];
    var botGlyph = new Vex.Flow.Glyph("v" + num, this.point);

    glyph.botGlyphs.push(botGlyph);
    botWidth += botGlyph.getMetrics().width;
  }

  var width = (topWidth > botWidth ? topWidth : botWidth);
  var xMin = glyph.getMetrics().x_min;

  glyph.getMetrics = function() {
    return {
      x_min: xMin,
      x_max: xMin + width,
      width: width
    };
  }

  var topStartX = (width - topWidth) / 2.0;
  var botStartX = (width - botWidth) / 2.0;

  var that = this;
  glyph.renderToStave = function(x) {
    var start_x = x + topStartX;
    for (var i = 0; i < this.topGlyphs.length; ++i) {
      var g = this.topGlyphs[i];
      Vex.Flow.Glyph.renderOutline(this.context, g.metrics.outline,
          g.scale, start_x + g.x_shift, this.stave.getYForLine(that.topLine));
      start_x += g.getMetrics().width;
    }

    start_x = x + botStartX;
    for (var i = 0; i < this.botGlyphs.length; ++i) {
      var g = this.botGlyphs[i];
      that.placeGlyphOnLine(g, this.stave, g.line);
      Vex.Flow.Glyph.renderOutline(this.context, g.metrics.outline,
          g.scale, start_x + g.x_shift, this.stave.getYForLine(that.bottomLine));
      start_x += g.getMetrics().width;
    }
  }

  return glyph;
}

Vex.Flow.TimeSignature.prototype.addModifier = function(stave) {
  if (!this.timeSig.num) {
    this.placeGlyphOnLine(this.timeSig.glyph, stave, this.timeSig.line);
  }

  stave.addGlyph(this.timeSig.glyph)
}
