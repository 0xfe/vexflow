// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

/**
 * Create a new tie from the specified notes. The notes must
 * be part of the same line, and have the same duration (in ticks).
 *
 * @constructor
 * @param {!Object} context The canvas context.
 * @param {!Object} notes The notes to tie up.
 * @param {!Object} Options
 */
Vex.Flow.TabSlide = (function() {
  function TabSlide(notes, direction) {
    if (arguments.length > 0) this.init(notes, direction);
  }

  TabSlide.SLIDE_UP = 1;
  TabSlide.SLIDE_DOWN = -1;

  TabSlide.createSlideUp = function(notes) {
    return new TabSlide(notes, TabSlide.SLIDE_UP);
  };

  TabSlide.createSlideDown = function(notes) {
    return new TabSlide(notes, TabSlide.SLIDE_DOWN);
  };

  Vex.Inherit(TabSlide, Vex.Flow.TabTie, {
    init: function(notes, direction) {
      /**
       * Notes is a struct that has:
       *
       *  {
       *    first_note: Note,
       *    last_note: Note,
       *    first_indices: [n1, n2, n3],
       *    last_indices: [n1, n2, n3]
       *  }
       *
       **/
      TabSlide.superclass.init.call(this, notes, "sl.");
      if (!direction) {
        var first_fret = notes.first_note.getPositions()[0].fret;
        var last_fret = notes.last_note.getPositions()[0].fret;

        direction = ((parseInt(first_fret, 10) > parseInt(last_fret, 10)) ?
          TabSlide.SLIDE_DOWN : TabSlide.SLIDE_UP);
      }

      this.slide_direction = direction;
      this.render_options.cp1 = 11;
      this.render_options.cp2 = 14;
      this.render_options.y_shift = 0.5;

      this.setFont({font: "Times", size: 10, style: "bold italic"});
      this.setNotes(notes);
    },

    renderTie: function(params) {
      if (params.first_ys.length === 0 || params.last_ys.length === 0)
        throw new Vex.RERR("BadArguments", "No Y-values to render");

      var ctx = this.context;
      var first_x_px = params.first_x_px;
      var first_ys = params.first_ys;
      var last_x_px = params.last_x_px;

      var direction = this.slide_direction;
      if (direction != TabSlide.SLIDE_UP &&
          direction != TabSlide.SLIDE_DOWN) {
        throw new Vex.RERR("BadSlide", "Invalid slide direction");
      }

      for (var i = 0; i < this.first_indices.length; ++i) {
        var slide_y = first_ys[this.first_indices[i]] +
          this.render_options.y_shift;

        if (isNaN(slide_y))
          throw new Vex.RERR("BadArguments", "Bad indices for slide rendering.");

        ctx.beginPath();
        ctx.moveTo(first_x_px, slide_y + (3 * direction));
        ctx.lineTo(last_x_px, slide_y - (3 * direction));
        ctx.closePath();
        ctx.stroke();
      }
    }
  });

  return TabSlide;
}());