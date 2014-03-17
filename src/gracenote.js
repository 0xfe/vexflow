Vex.Flow.GraceNote = (function() {
  var GraceNote = function(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  };

  // Stem directions
  var Stem = Vex.Flow.Stem;
  var NoteHead = Vex.Flow.NoteHead;
  Vex.Inherit(GraceNote, Vex.Flow.StaveNote, {
    init: function(note_struct) {
      GraceNote.superclass.init.call(this, note_struct);

      this.render_options.glyph_font_scale = 22;
      this.render_options.stem_height = 20;
      this.render_options.stroke_px = 2;
      this.glyph.head_width = 6;

      this.slash = note_struct.slash;
      this.slur = true;

      this.stem_extension = 0;

      switch (this.duration) {
        case "w":                 // Whole note alias
        case "1": this.stem_extension = -1 * Stem.HEIGHT; break;
        case "32": this.stem_extension = -12; break;
        case "64": this.stem_extension = -10; break;
        case "128": this.stem_extension = -8; break;
        default: this.stem_extension = -14;
      }

      this.width = 3;
    },

    getCategory: function() { return 'gracenotes'; },

    drawStem: function(stem_struct){
      if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");
      stem_struct.y_bottom -= 1

      this.stem = new Stem(stem_struct);
      this.stem.setContext(this.context).draw();
    },

    draw: function(){
      GraceNote.superclass.draw.call(this);
      var ctx = this.context;

      if (this.slash) {
        ctx.beginPath();
        var x = this.getAbsoluteX() + 1
        var y = this.getYs()[0] - (this.stem.getHeight() / 2.8);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 13, y - 9);
        ctx.closePath();
        ctx.stroke();
      }
    }
  });

  return GraceNote;
}());
