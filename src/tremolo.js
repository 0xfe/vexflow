// VexFlow - Music Engraving for HTML5
// Author: Mike Corrigan <corrigan@gmail.com>
//
// This class implements tremolo notation.

/**
 * @constructor
 */
Vex.Flow.Tremolo = (function() {
  function Tremolo(num) {
    if (arguments.length > 0) this.init(num);
  }

  var Modifier = Vex.Flow.Modifier;
  Vex.Inherit(Tremolo, Modifier, {
    init: function(num) {
      Tremolo.superclass.init.call(this);

      this.num = num;
      this.note = null;
      this.index = null;
      this.position = Modifier.Position.CENTER;
      this.code = "v74";
      this.shift_right = -2;
      this.y_spacing = 4;

      this.render_options = {
        font_scale: 35,
        stroke_px: 3,
        stroke_spacing: 10
      };

      this.font = {
        family: "Arial",
        size: 16,
        weight: ""
      };
    },

    getCategory: function() { return "tremolo"; },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw Tremolo without a context.");
      if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
        "Can't draw Tremolo without a note and index.");

      var start = this.note.getModifierStartXY(this.position, this.index);
      var x = start.x;
      var y = start.y;

      x += this.shift_right;
      for (var i = 0; i < this.num; ++i) {
        Vex.Flow.renderGlyph(this.context, x, y,
                             this.render_options.font_scale, this.code);
        y += this.y_spacing;
      }
    }
  });

  return Tremolo;
}());
