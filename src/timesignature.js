// Vex Flow Notation
// Implements time signatures glyphs for staffs
// See tables.js for the internal time signatures
// representation
//

/**
 * @param {string} timeSpec time signature, i.e. "4/4"
 * @param {number} [customPadding] custom padding when using multi-stave/multi-instrument setting
 * to align key/time signature (in pixels), optional
 * @constructor
 */
Vex.Flow.TimeSignature = (function() {
  function TimeSignature(timeSpec, customPadding) {
    if (arguments.length > 0) this.init(timeSpec, customPadding);
  }

  TimeSignature.category = 'timesignatures';

  TimeSignature.glyphs = {
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
  };

  Vex.Inherit(TimeSignature, Vex.Flow.StaveModifier, {
    init: function(timeSpec, customPadding) {
      TimeSignature.superclass.init();
      var padding = customPadding || 15;

      this.point = 40;
      this.topLine = 2;
      this.bottomLine = 4;
      this.setPosition(Vex.Flow.StaveModifier.Position.BEGIN);
      this.setTimeSig(timeSpec);
      this.setWidth(this.timeSig.glyph.getMetrics().width);
      this.setPadding(padding);
    },

    getCategory: function() { return TimeSignature.category; },

    parseTimeSpec: function(timeSpec) {
      if (timeSpec == "C" || timeSpec == "C|") {
        var glyphInfo = TimeSignature.glyphs[timeSpec];
        return {num: false, line: glyphInfo.line,
          glyph: new Vex.Flow.Glyph(glyphInfo.code, glyphInfo.point)};
      }

      var topNums = [];
      var i, c;
      for (i = 0; i < timeSpec.length; ++i) {
        c = timeSpec.charAt(i);
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

      if (i === 0) {
        throw new Vex.RERR("BadTimeSignature",
              "Invalid time spec: " + timeSpec);
      }

      // skip the "/"
      ++i;

      if (i == timeSpec.length) {
        throw new Vex.RERR("BadTimeSignature",
              "Invalid time spec: " + timeSpec);
      }


      var botNums = [];
      for (; i < timeSpec.length; ++i) {
        c = timeSpec.charAt(i);
        if (/[0-9]/.test(c)) {
          botNums.push(c);
        }
        else {
          throw new Vex.RERR("BadTimeSignature",
              "Invalid time spec: " + timeSpec);
        }
      }


      return {num: true, glyph: this.makeTimeSignatureGlyph(topNums, botNums)};
    },

    makeTimeSignatureGlyph: function(topNums, botNums) {
      var glyph = new Vex.Flow.Glyph("v0", this.point);
      glyph["topGlyphs"] = [];
      glyph["botGlyphs"] = [];

      var topWidth = 0;
      var i, num;
      for (i = 0; i < topNums.length; ++i) {
        num = topNums[i];
        var topGlyph = new Vex.Flow.Glyph("v" + num, this.point);

        glyph.topGlyphs.push(topGlyph);
        topWidth += topGlyph.getMetrics().width;
      }

      var botWidth = 0;
      for (i = 0; i < botNums.length; ++i) {
        num = botNums[i];
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
      };

      var topStartX = (width - topWidth) / 2.0;
      var botStartX = (width - botWidth) / 2.0;

      var that = this;
      glyph.renderToStave = function(x) {
        var start_x = x + topStartX;
        var i, g;
        for (i = 0; i < this.topGlyphs.length; ++i) {
          g = this.topGlyphs[i];
          Vex.Flow.Glyph.renderOutline(this.context, g.metrics.outline,
              g.scale, start_x + g.x_shift, this.stave.getYForLine(that.topLine) + 1);
          start_x += g.getMetrics().width;
        }

        start_x = x + botStartX;
        for (i = 0; i < this.botGlyphs.length; ++i) {
          g = this.botGlyphs[i];
          that.placeGlyphOnLine(g, this.stave, g.line);
          Vex.Flow.Glyph.renderOutline(this.context, g.metrics.outline,
              g.scale, start_x + g.x_shift, this.stave.getYForLine(that.bottomLine) + 1);
          start_x += g.getMetrics().width;
        }
      };

      return glyph;
    },

    getTimeSig: function() {
      return this.timeSig;
    },

    setTimeSig: function(timeSpec) {
      this.timeSig = this.parseTimeSpec(timeSpec);
      return this;
    },

    draw: function() {
      if (!this.x) throw new Vex.RERR("TimeSignatureError", "Can't draw time signature without x.");
      if (!this.stave) throw new Vex.RERR("TimeSignatureError", "Can't draw time signature without stave.");

      this.timeSig.glyph.setStave(this.stave);
      this.timeSig.glyph.setContext(this.stave.context);
      this.placeGlyphOnLine(this.timeSig.glyph, this.stave, this.timeSig.line);
      this.timeSig.glyph.renderToStave(this.x);
    }
  });

  return TimeSignature;
}());
