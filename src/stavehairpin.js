// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
// This class by Raffaele Viglianti, 2012 http://itisnotsound.wordpress.com/
//
// This class implements hairpins between notes.
// Hairpins can be either Crescendo or Descrescendo.

/**
 * Create a new hairpin from the specified notes.
 *
 * @constructor
 * @param {!Object} notes The notes to tie up.
 * @param {!Object} type The type of hairpin
 */
Vex.Flow.StaveHairpin = (function() {
  function StaveHairpin(notes, type) {
    if (arguments.length > 0) this.init(notes, type);
  }

  StaveHairpin.type = {
    CRESC: 1,
    DECRESC: 2
  };

  /* Helper function to convert ticks into pixels.
   * Requires a Formatter with voices joined and formatted (to
   * get pixels per tick)
   *
   * options is struct that has:
   *
   *  {
   *   height: px,
   *   y_shift: px, //vertical offset
   *   left_shift_ticks: 0, //left horizontal offset expressed in ticks
   *   right_shift_ticks: 0 // right horizontal offset expressed in ticks
   *  }
   *
   **/
  StaveHairpin.FormatByTicksAndDraw = function(ctx, formatter, notes, type, position, options) {
    var ppt = formatter.pixelsPerTick;

    if (ppt == null){
      throw new Vex.RuntimeError("BadArguments",
          "A valid Formatter must be provide to draw offsets by ticks.");}

    var l_shift_px = ppt * options.left_shift_ticks;
    var r_shift_px = ppt * options.right_shift_ticks;

    var hairpin_options = {
      height: options.height,
      y_shift:options.y_shift,
      left_shift_px:l_shift_px,
      right_shift_px:r_shift_px};

    new StaveHairpin({
      first_note: notes.first_note,
      last_note: notes.last_note
    }, type)
      .setContext(ctx)
      .setRenderOptions(hairpin_options)
      .setPosition(position)
      .draw();
  };

  StaveHairpin.prototype = {
    init: function(notes, type) {
      /**
       * Notes is a struct that has:
       *
       *  {
       *    first_note: Note,
       *    last_note: Note,
       *  }
       *
       **/

      this.notes = notes;
      this.hairpin = type;
      this.position = Vex.Flow.Modifier.Position.BELOW;

      this.context = null;

      this.render_options = {
          height: 10,
          y_shift: 0, //vertical offset
          left_shift_px: 0, //left horizontal offset
          right_shift_px: 0 // right horizontal offset
        };

      this.setNotes(notes);
    },

    setContext: function(context) { this.context = context; return this; },

    setPosition: function(position) {
      if (position == Vex.Flow.Modifier.Position.ABOVE ||
          position == Vex.Flow.Modifier.Position.BELOW)
        this.position = position;
      return this;
    },

    setRenderOptions: function(options) {
      if (options.height != null &&
          options.y_shift != null &&
          options.left_shift_px != null &&
          options.right_shift_px != null){
        this.render_options = options;
      }
      return this;
    },

    /**
     * Set the notes to attach this hairpin to.
     *
     * @param {!Object} notes The start and end notes.
     */
    setNotes: function(notes) {
      if (!notes.first_note && !notes.last_note)
        throw new Vex.RuntimeError("BadArguments",
            "Hairpin needs to have either first_note or last_note set.");

      // Success. Lets grab 'em notes.
      this.first_note = notes.first_note;
      this.last_note = notes.last_note;
      return this;
    },

    renderHairpin: function(params) {
      var ctx = this.context;
      var dis = this.render_options.y_shift + 20;
      var y_shift = params.first_y;

      if (this.position == Vex.Flow.Modifier.Position.ABOVE) {
        dis = -dis +30;
        y_shift = params.first_y - params.staff_height;
      }

      var l_shift = this.render_options.left_shift_px;
      var r_shift = this.render_options.right_shift_px;

      switch (this.hairpin) {
        case StaveHairpin.type.CRESC:
          ctx.moveTo(params.last_x + r_shift, y_shift + dis);
          ctx.lineTo(params.first_x + l_shift, y_shift +(this.render_options.height/2) + dis);
          ctx.lineTo(params.last_x + r_shift, y_shift + this.render_options.height + dis);
          break;
        case StaveHairpin.type.DECRESC:
          ctx.moveTo(params.first_x + l_shift, y_shift + dis);
          ctx.lineTo(params.last_x + r_shift, y_shift +(this.render_options.height/2) + dis);
          ctx.lineTo(params.first_x + l_shift, y_shift + this.render_options.height + dis);
          break;
        default:
          // Default is NONE, so nothing to draw
          break;
      }

      ctx.stroke();
    },

    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw Hairpin without a context.");

      var first_note = this.first_note;
      var last_note = this.last_note;

      var start = first_note.getModifierStartXY(this.position, 0);
      var end = last_note.getModifierStartXY(this.position, 0);

      this.renderHairpin({
        first_x: start.x,
        last_x: end.x,
        first_y: first_note.getStave().y + first_note.getStave().height,
        last_y: last_note.getStave().y + last_note.getStave().height,
        staff_height: first_note.getStave().height
      });
     return true;
    }
  };
  return StaveHairpin;
}());

