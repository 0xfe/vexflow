Vex.Flow.GraceNote = (function() {
  var GraceNote = function(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  };

  Vex.Inherit(GraceNote, Vex.Flow.StaveNote, {
    init: function(note_struct) {
      GraceNote.superclass.init.call(this, note_struct);

      this.render_options.glyph_font_scale = 22;
      this.render_options.stem_height = 20;
      this.render_options.stroke_px = 2;
      this.glyph.head_width = 6;

      this.slash = note_struct.slash;
      this.slur = true;

      this.buildNoteHeads();

      this.width = 3;
    },

    getStemExtension: function(){
      var glyph = this.getGlyph();

      if (this.stem_extension_override != null) {
        return this.stem_extension_override;
      }

      if (glyph) {
        return this.getStemDirection() === 1 ? glyph.gracenote_stem_up_extension :
          glyph.gracenote_stem_down_extension;
      }

      return 0;
    },

    getCategory: function() { return 'gracenotes'; },

    draw: function(){
      GraceNote.superclass.draw.call(this);
      var ctx = this.context;
      var stem_direction = this.getStemDirection();

      if (this.slash) {
        ctx.beginPath();

        var x = this.getAbsoluteX();
        var y = this.getYs()[0] - (this.stem.getHeight() / 2.8);
        if (stem_direction === 1) {
          x += 1;
          ctx.moveTo(x, y);
          ctx.lineTo(x + 13, y - 9);
        } else if (stem_direction === -1) {
          x -= 4;
          y += 1;
          ctx.moveTo(x, y);
          ctx.lineTo(x + 13, y + 9);
        }

        ctx.closePath();
        ctx.stroke();
      }
    }
  });

  return GraceNote;
}());
