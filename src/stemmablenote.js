Vex.Flow.StemmableNote = (function(){
  var StemmableNote = function(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  };

  // Stem directions
  var Stem = Vex.Flow.Stem;

  Vex.Inherit(StemmableNote, Vex.Flow.Note, {
    init: function(note_struct){
      StemmableNote.superclass.init.call(this, note_struct);

      this.beam = null;
      this.stem_extension = 0;
      this.setStemDirection(note_struct.stem_direction);
    },

    getStemLength: function() {
      return Stem.HEIGHT + this.stem_extension;
    },

    // Determine minimum length of stem
    getStemMinumumLength: function() {
      var length = this.duration == "w" ? 0 : 20;
      // if note is flagged, cannot shorten beam
      switch (this.duration) {
       case "8":
         if (this.beam == null) length = 35;
         break;
       case "16":
         if (this.beam == null)
           length = 35;
         else
           length = 25;
         break;
       case "32":
         if (this.beam == null)
           length = 45;
         else
           length = 35;
         break;
       case "64":
         if (this.beam == null)
           length = 50;
         else
           length = 40;
         break;
       case "128":
         if (this.beam == null)
           length = 55;
         else
           length = 45;
      }
      return length;
    },

    getStemDirection: function() {
      return this.stem_direction;
    },

    setStemDirection: function(direction) {
      if (!direction) direction = Stem.UP;
      if (direction != Stem.UP &&
          direction != Stem.DOWN) {
        throw new Vex.RERR("BadArgument", "Invalid stem direction: " + direction);
      }

      this.stem_direction = direction;
      this.beam = null;
      if (this.preFormatted) {
        this.preFormat();
      }
      return this;
    },

    getStemX: function() {
      var x_begin = this.getAbsoluteX() + this.x_shift;
      var x_end = this.getAbsoluteX() + this.x_shift + this.glyph.head_width;

      var stem_x = this.stem_direction == Stem.DOWN ?
        x_begin : x_end;

      stem_x -= ((Stem.WIDTH / 2) * this.stem_direction);

      return stem_x;
    },

    // Manuallly set note stem length
    setStemLength: function(height) {
      this.stem_extension = (height - Stem.HEIGHT);
      return this;
    },

    getStemExtents: function() {
      if (!this.ys || this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "Can't get top stem Y when note has no Y values.");

      var top_pixel = this.ys[0];
      var base_pixel = this.ys[0];
      var stem_height = Stem.HEIGHT + this.stem_extension;

      for (var i = 0; i < this.ys.length; ++i) {
        var stem_top = this.ys[i] + (stem_height * -this.stem_direction);

        if (this.stem_direction == Stem.DOWN) {
          top_pixel = (top_pixel > stem_top) ? top_pixel : stem_top;
          base_pixel = (base_pixel < this.ys[i]) ? base_pixel : this.ys[i];
        } else {
          top_pixel = (top_pixel < stem_top) ? top_pixel : stem_top;
          base_pixel = (base_pixel > this.ys[i]) ? base_pixel : this.ys[i];
        }

        if(this.noteType == "s" || this.noteType == 'x') {
          top_pixel -= this.stem_direction * 7;
          base_pixel -= this.stem_direction * 7;
        }
      }

      return { topY: top_pixel, baseY: base_pixel };
    },

    setBeam: function(beam) {
      this.beam = beam;
      return this;
    },

    drawStem: function(stem_struct){
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

      this.stem = new Stem(stem_struct);
      this.stem.setContext(this.context).draw();
    }

  });

  return StemmableNote;
}());