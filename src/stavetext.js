// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// Author Taehoon Moon 2014

/**
 * @constructor
 */
Vex.Flow.StaveText = (function() {
  function StaveText(text, position, options) {
    if (arguments.length > 0) this.init(text, position, options);
  }

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(StaveText, Modifier, {
    init: function(text, position, options) {
      StaveText.superclass.init.call(this);

      this.setWidth(16);
      this.text = text;
      this.position = position;
      this.options = {
        shift_x: 0,
        shift_y: 0,
        justification: Vex.Flow.TextNote.Justification.CENTER
      };
      Vex.Merge(this.options, options);

      this.font = {
        family: "times",
        size: 16,
        weight: "normal"
      };
    },

    getCategory: function() { return "stavetext"; },
    setStaveText: function(text) { this.text = text; return this; },
    setShiftX: function(x) { this.shift_x = x; return this; },
    setShiftY: function(y) { this.shift_y = y; return this; },

    setFont: function(font) {
      Vex.Merge(this.font, font);
    },

    setText: function(text) {
      this.text = text;
    },

    draw: function(stave) {
      if (!stave.context) throw new Vex.RERR("NoContext",
        "Can't draw stave text without a context.");

      var ctx = stave.context;

      ctx.save();
      ctx.lineWidth = 2;
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      var text_width = ctx.measureText("" + this.text).width;

      var x, y;
      var Modifier = Vex.Flow.Modifier;
      switch(this.position) {
        case Modifier.Position.LEFT:
        case Modifier.Position.RIGHT:
          y = (stave.getYForLine(0) + stave.getBottomLineY()) / 2 + this.options.shift_y;
          if(this.position == Modifier.Position.LEFT) {
            x = stave.getX() - text_width - 24 + this.options.shift_x;
          }
          else {
            x = stave.getX() + stave.getWidth() + 24 + this.options.shift_x;
          }
          break;
        case Modifier.Position.ABOVE:
        case Modifier.Position.BELOW:
          var Justification = Vex.Flow.TextNote.Justification;
          x = stave.getX() + this.options.shift_x;
          if(this.options.justification == Justification.CENTER) {
            x += stave.getWidth() / 2 - text_width / 2;
          }
          else if(this.options.justification == Justification.RIGHT) {
            x += stave.getWidth() - text_width;
          }
          
          if(this.position == Modifier.Position.ABOVE) {
            y = stave.getYForTopText(2) + this.options.shift_y;
          }
          else {
            y = stave.getYForBottomText(2) + this.options.shift_y;
          }
          break;
        default:
          throw new Vex.RERR("InvalidPosition",
            "Value Must be in Modifier.Position.");
      }

      ctx.fillText("" + this.text, x, y + 4);
      ctx.restore();
      return this;
    }
  });

  return StaveText;
}());
