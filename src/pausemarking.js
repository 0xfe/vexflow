// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// `PauseMarking` implements music notation pause markings. These are marks that
//  are placed within a voice of notes to indicate the performer to breath or pause.
Vex.Flow.PauseMarking = (function() {
  function PauseMarking(type) {
    if (arguments.length > 0) this.init(type);
  }

  // Glyph data for each pause marking
  PauseMarking.GLYPHS = {
    "tracks_straight": {
      code: "v34",
      point:40,
      x_shift:0,
      y_shift:2,
      width: 15
    },
    "tracks_curved": {
      code: "v4b",
      point:40,
      x_shift:0,
      y_shift:2,
      width: 15
    },
    "comma": {
      code: "v6c",
      point:40,
      x_shift:0,
      y_shift:0,
      width: 10
    },
    "tick": {
      code: "v6f",
      point:50,
      x_shift:0,
      y_shift:0,
      width: 10
    }
  };

  // ## Prototype Methods
  Vex.Inherit(PauseMarking, Vex.Flow.Note, {
    // Initialize the marking with a specific type of mark
    init: function(type) {
      PauseMarking.superclass.init.call(this, {duration: "b"});

      this.type = type;
      this.line = 0;
      this.glyph_data = PauseMarking.GLYPHS[type];
      this.has_fixed_ys = true;
      
      if (!this.glyph_data) throw new Vex.RERR("InvalidArguments",
        "PauseMarking type" + type + "does not exist");

      this.glyph = new Vex.Flow.Glyph(this.glyph_data.code, this.glyph_data.point);

      this.setWidth(this.glyph_data.width);

      this.ignore_ticks = true;
    },

    // Get/Set the Stave line on which the note should be placed
    getLine: function() { return this.line; },
    setLine: function(line) { this.line = line; return this; },

    // Get the relative y boundaries on either side of the stave
    getFixedYs: function(){
      return {top: 25, bottom: 30};
    },

    // Get the `ModifierContext` category
    getCategory: function() { return "pausemarkings"; },

    // Pre-render formatting
    preFormat: function() { this.setPreFormatted(true); },

    // Get the `x` and `y` coordinates for a modifier at a `position`
    getModifierStartXY: function(position) {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetModifierStartXY on an unformatted note");

      var x = 0;
      if (position == Vex.Flow.Modifier.Position.LEFT) {
        x = -1 * 2;
      } else if (position == Vex.Flow.Modifier.Position.RIGHT) {
        x = this.glyph_data.width + this.x_shift + 2;
      } else if (position == Vex.Flow.Modifier.Position.BELOW ||
                 position == Vex.Flow.Modifier.Position.ABOVE) {
        x = this.glyph_data.width / 2;
      }

      return { x: this.getAbsoluteX() + x, y: this.stave.getYForLine(this.line) };
    },

    // Renders the marking on the rendering context
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

      var ctx = this.context;
      var x = this.getAbsoluteX() + this.glyph_data.x_shift;
      var y = this.stave.getYForLine(this.line) + this.glyph_data.y_shift;

      this.glyph.render(this.context, x, y);

      for (var i = 0; i < this.modifiers.length; i++) {
        var mod = this.modifiers[i];
        mod.setContext(ctx);
        mod.draw();
      }
    }
  });

  return PauseMarking;
}());
