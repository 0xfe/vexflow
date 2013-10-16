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
Vex.Flow.TabTie = (function() {
  function TabTie(notes, text) {
    if (arguments.length > 0) this.init(notes, text);
  }

  TabTie.createHammeron = function(notes) {
    return new TabTie(notes, "H");
  };

  TabTie.createPulloff = function(notes) {
    return new TabTie(notes, "P");
  };

  Vex.Inherit(TabTie, Vex.Flow.StaveTie, {
    init: function(notes, text) {
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
      TabTie.superclass.init.call(this, notes, text);
      this.render_options.cp1 = 9;
      this.render_options.cp2 = 11;
      this.render_options.y_shift = 3;

      this.setNotes(notes);
    },

    draw: function() {
      if (!this.context)
        throw new Vex.RERR("NoContext", "No context to render tie.");
      var first_note = this.first_note;
      var last_note = this.last_note;
      var first_x_px, last_x_px, first_ys, last_ys;

      if (first_note) {
        first_x_px = first_note.getTieRightX() + this.render_options.tie_spacing;
        first_ys = first_note.getYs();
      } else {
        first_x_px = last_note.getStave().getTieStartX();
        first_ys = last_note.getYs();
        this.first_indices = this.last_indices;
      }

      if (last_note) {
        last_x_px = last_note.getTieLeftX() + this.render_options.tie_spacing;
        last_ys = last_note.getYs();
      } else {
        last_x_px = first_note.getStave().getTieEndX();
        last_ys = first_note.getYs();
        this.last_indices = this.first_indices;
      }

      this.renderTie({
        first_x_px: first_x_px,
        last_x_px: last_x_px,
        first_ys: first_ys,
        last_ys: last_ys,
        direction: -1           // Tab tie's are always face up.
      });

      this.renderText(first_x_px, last_x_px);
      return true;
    }
  });

  return TabTie;
}());
