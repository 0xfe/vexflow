// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010
//
// Requires vex.js.

/** @constructor */
Vex.Flow.Note = (function() {
  function Note(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  }

  Vex.Inherit(Note, Vex.Flow.Tickable, {
    init: function(note_struct) {
      Note.superclass.init.call(this);

      // Sanity check
      if (!note_struct) {
        throw new Vex.RuntimeError("BadArguments",
            "Note must have valid initialization data to identify " +
            "duration and type.");
      }

      var initData = Vex.Flow.parseNoteData(note_struct);
      if (!initData) {
        throw new Vex.RuntimeError("BadArguments",
            "Invalid note initialization object: " + JSON.stringify(note_struct));
      }

      // Note properties
      this.duration = initData.duration;
      this.dots = initData.dots;
      this.noteType = initData.type;
      this.setIntrinsicTicks(initData.ticks);
      this.modifiers = [];

      if (this.positions &&
          (typeof(this.positions) != "object" || !this.positions.length)) {
        throw new Vex.RuntimeError(
          "BadArguments", "Note keys must be array type.");
      }

      // Note to play for audio players
      this.playNote = null;

      // Positioning contexts
      this.tickContext = null;    // The current tick context
      this.modifierContext = null;
      this.ignore_ticks = false;

      // Positioning variables
      this.width = 0;             // Width in pixels calculated after preFormat
      this.extraLeftPx = 0;       // Extra room on left for offset note head
      this.extraRightPx = 0;      // Extra room on right for offset note head
      this.x_shift = 0;           // X shift from tick context X
      this.left_modPx = 0;        // Max width of left modifiers
      this.right_modPx = 0;       // Max width of right modifiers
      this.voice = null;          // The voice that this note is in
      this.preFormatted = false;  // Is this note preFormatted?
      this.ys = [];               // list of y coordinates for each note
                                  // we need to hold on to these for ties and beams.
      // Drawing
      this.context = null;
      this.stave = null;
      this.render_options = {
        annotation_spacing: 5
      };
    },

    setPlayNote: function(note) { this.playNote = note; return this; },

    getPlayNote: function() { return this.playNote; },

    // Don't play notes by default, call them rests.
    isRest: function() { return false; },

    addStroke: function(index, stroke) {
      stroke.setNote(this);
      stroke.setIndex(index);
      this.modifiers.push(stroke);
      this.setPreFormatted(false);
      return this;
    },


    getStave: function() { return this.stave; },
    setStave: function(stave) {
      this.stave = stave;
      this.setYs([stave.getYForLine(0)]);
      this.context = this.stave.context;
      return this;
    },

    setContext: function(context) { this.context = context; return this; },
    getExtraLeftPx: function() { return this.extraLeftPx; },
    getExtraRightPx: function() { return this.extraRightPx; },
    setExtraLeftPx: function(x) { this.extraLeftPx = x; return this; },
    setExtraRightPx: function(x) { this.extraRightPx = x; return this; },
    shouldIgnoreTicks: function() { return this.ignore_ticks; },
    getLineNumber: function() { return 0; },

    setYs: function(ys) { this.ys = ys; return this; },
    getYs: function() {
      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "No Y-values calculated for this note.");
      return this.ys;
    },
    getYForTopText: function(text_line) {
      if (!this.stave) throw new Vex.RERR("NoStave",
          "No stave attached to this note.");
      return this.stave.getYForTopText(text_line);
    },

    getBoundingBox: function() { return null; },

    getVoice: function() {
      if (!this.voice) throw new Vex.RERR("NoVoice", "Note has no voice.");
      return this.voice;
    },

    setVoice: function(voice) {
      this.voice = voice;
      this.preFormatted = false;
      return this;
    },

    getTickContext: function() { return this.tickContext; },
    setTickContext: function(tc) {
      this.tickContext = tc;
      this.preFormatted = false;
      return this;
    },

    getDuration: function() { return this.duration; },
    isDotted: function() { return (this.dots > 0); },
    hasStem: function() { return false; },
    getDots: function() { return this.dots; },
    getNoteType: function() { return this.noteType; },
    setModifierContext: function(mc) { this.modifierContext = mc; return this; },

    addModifier: function(modifier, index) {
      modifier.setNote(this);
      modifier.setIndex(index || 0);
      this.modifiers.push(modifier);
      this.setPreFormatted(false);
      return this;
    },

    getModifierStartXY: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetModifierStartXY on an unformatted note");

      var x = 0;
      return {x: this.getAbsoluteX() + x, y: this.ys[0]};
    },

    getMetrics: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call getMetrics on an unformatted note.");
      var modLeftPx = 0;
      var modRightPx = 0;
      if (this.modifierContext != null) {
        modLeftPx = this.modifierContext.state.left_shift;
        modRightPx = this.modifierContext.state.right_shift;
      }

      var width = this.getWidth();
      return { width: width,
               noteWidth: width -
                          modLeftPx - modRightPx -  // used by accidentals and modifiers
                          this.extraLeftPx - this.extraRightPx,
               left_shift: this.x_shift,
               modLeftPx: modLeftPx,
               modRightPx: modRightPx,
               extraLeftPx: this.extraLeftPx,
               extraRightPx: this.extraRightPx };
    },

    setWidth: function(width) { this.width = width; },
    getWidth: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetWidth on an unformatted note.");
      return this.width +
        (this.modifierContext ?  this.modifierContext.getWidth() : 0);
    },

    setXShift: function(x) {
      this.x_shift = x;
      return this;
    },

    setX: function(x) {
      if (isNaN(x)) {
        throw new Vex.RERR('Invalid x coordinate attempted: ' + x.toString());
      }
      this.x = x; return this;
    },

    getX: function() {
      if (this.x) return this.x;

      if (!this.tickContext) throw new Vex.RERR("NoTickContext",
          "Note needs a TickContext assigned for an X-Value");
      return this.tickContext.getX() + this.x_shift;
    },

    getAbsoluteX: function() {
      if (this.x) return this.x;

      if (!this.tickContext) throw new Vex.RERR("NoTickContext",
          "Note needs a TickContext assigned for an X-Value");

      // position note to left edge of tick context.
      var x = this.tickContext.getX();
      // add padding at beginning of stave
      if (this.stave) x += this.stave.getNoteStartX() + 12;

      return x;
    },

    setPreFormatted: function(value) {
      this.preFormatted = value;

      // Maintain the width of left and right modifiers in pizels
      if (this.preFormatted) {
        var extra = this.tickContext.getExtraPx();
        this.left_modPx = Math.max(this.left_modPx, extra.left);
        this.right_modPx = Math.max(this.right_modPx, extra.right);
      }
    }
  });

  return Note;
}());