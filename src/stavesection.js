// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// Author Larry Kuhns 2011
// Implements stave section names.

/**
 * @constructor
 */
Vex.Flow.StaveSection = (function() {
  function StaveSection(section, x, shift_y) {
    if (arguments.length > 0) this.init(section, x, shift_y);
  }

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(StaveSection, Modifier, {
    init: function(section, x, shift_y) {
      StaveSection.superclass.init.call(this);

      this.setWidth(16);
      this.section = section;
      this.position = Modifier.Position.ABOVE;
      this.x = x;
      this.shift_x = 0;
      this.shift_y = shift_y;
      this.font = {
        family: "sans-serif",
        size: 12,
        weight: "bold"
      };
    },

    getCategory: function() { return "stavesection"; },
    setStaveSection: function(section) { this.section = section; return this; },
    setShiftX: function(x) { this.shift_x = x; return this; },
    setShiftY: function(y) { this.shift_y = y; return this; },

    draw: function(stave, shift_x) {
      if (!stave.context) throw new Vex.RERR("NoContext",
        "Can't draw stave section without a context.");

      var ctx = stave.context;

      ctx.save();
      ctx.lineWidth = 2;
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      var text_width = ctx.measureText("" + this.section).width;
      var width = text_width + 6;  // add left & right padding
      if (width < 18) width = 18;
      var height = 20;
        //  Seems to be a good default y
      var y = stave.getYForTopText(3) + this.shift_y;
      var x = this.x + shift_x;
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.rect(x, y, width, height);
      ctx.stroke();
      x += (width - text_width) / 2;
      ctx.fillText("" + this.section, x, y + 16);
      ctx.restore();
      return this;
    }
  });

  return StaveSection;
}());