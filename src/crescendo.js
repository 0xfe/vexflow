// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the `Crescendo` object which draws crescendos and
// decrescendo dynamics markings. A `Crescendo` is initialized with a
// duration and formatted as part of a `Voice` like any other `Note`
// type in VexFlow. This object would most likely be formatted in a Voice
// with `TextNotes` - which are used to represent other dynamics markings.
Vex.Flow.Crescendo = (function() {
  function Crescendo(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  }

  // To enable logging for this class. Set `Vex.Flow.Crescendo.DEBUG` to `true`.
  function L() { if (Crescendo.DEBUG) Vex.L("Vex.Flow.Crescendo", arguments); }

  // Private helper to draw the hairpin
  function renderHairpin(ctx, params) {
    var begin_x = params.begin_x;
    var end_x = params.end_x;
    var y = params.y;
    var half_height =  params.height / 2;

    ctx.beginPath();

    if (params.reverse) {
        ctx.moveTo(begin_x, y - half_height);
        ctx.lineTo(end_x,  y);
        ctx.lineTo(begin_x, y + half_height);
    } else {
        ctx.moveTo(end_x,  y - half_height);
        ctx.lineTo(begin_x, y);
        ctx.lineTo(end_x,  y + half_height);
    }

    ctx.stroke();
    ctx.closePath();
  }

  // ## Prototype Methods
  Vex.Inherit(Crescendo, Vex.Flow.Note, {
    // Initialize the crescendo's properties
    init: function(note_struct) {
      Crescendo.superclass.init.call(this, note_struct);

      // Whether the object is a decrescendo
      this.decrescendo = false;

      // The staff line to be placed on
      this.line = note_struct.line || 0;

      // The height at the open end of the cresc/decresc
      this.height = 15;

      Vex.Merge(this.render_options, {
        // Extensions to the length of the crescendo on either side
        extend_left: 0,
        extend_right: 0,
        // Vertical shift
        y_shift: 0
      });
    },

    // Set the line to center the element on
    setLine: function(line) { this.line = line; return this; },

    // Set the full height at the open end
    setHeight: function(height) { this.height = height; return this; },

    // Set whether the sign should be a descresendo by passing a bool
    // to `decresc`
    setDecrescendo: function(decresc) {
      this.decrescendo = decresc;
      return this;
    },

    // Preformat the note
    preFormat: function() { this.preFormatted = true; return this; },

    // Render the Crescendo object onto the canvas
    draw: function() {
      if (!this.context) throw new Vex.RERR("NoContext",
        "Can't draw Hairpin without a context.");

      var tick_context = this.getTickContext();
      var next_context = Vex.Flow.TickContext.getNextContext(tick_context);

      var begin_x = this.getAbsoluteX();
      var end_x;
      if (next_context) {
        end_x = next_context.getX();
      } else {
        end_x = this.stave.x + this.stave.width;
      }

      var y = this.stave.getYForLine(this.line + (-3)) + 1;

      L("Drawing ",  this.decrescendo ? "decrescendo " : "crescendo ",
        this.height, "x", begin_x - end_x);

      renderHairpin(this.context, {
        begin_x: begin_x - this.render_options.extend_left,
        end_x: end_x + this.render_options.extend_right,
        y: y + this.render_options.y_shift,
        height: this.height,
        reverse: this.decrescendo
      });
    }
  });

  return Crescendo;
})();