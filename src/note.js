// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements an abstract interface for notes and chords that
// are rendered on a stave. Notes have some common properties: All of them
// have a value (e.g., pitch, fret, etc.) and a duration (quarter, half, etc.)
//
// Some notes have stems, heads, dots, etc. Most notational elements that
// surround a note are called *modifiers*, and every note has an associated
// array of them. All notes also have a rendering context and belong to a stave.

Vex.Flow.Note = (function() {
  // To create a new note you need to provide a `note_struct`, which consists
  // of the following fields:
  //
  // `type`: The note type (e.g., `r` for rest, `s` for slash notes, etc.)
  // `dots`: The number of dots, which affects the duration.
  // `duration`: The time length (e.g., `q` for quarter, `h` for half, `8` for eighth etc.)
  //
  // The range of values for these parameters are available in `src/tables.js`.
  function Note(note_struct) {
    if (arguments.length > 0) this.init(note_struct);
  }
  Note.CATEGORY = "note";

  // Debug helper. Displays various note metrics for the given
  // note.
  Note.plotMetrics = function(ctx, note, yPos) {
    var metrics = note.getMetrics();
    var w = metrics.width;
    var xStart = note.getAbsoluteX() - metrics.modLeftPx - metrics.extraLeftPx;
    var xPre1 = note.getAbsoluteX() - metrics.extraLeftPx;
    var xAbs = note.getAbsoluteX();
    var xPost1 = note.getAbsoluteX() + metrics.noteWidth;
    var xPost2 = note.getAbsoluteX() + metrics.noteWidth + metrics.extraRightPx;
    var xEnd = note.getAbsoluteX() + metrics.noteWidth + metrics.extraRightPx + metrics.modRightPx;

    var xWidth = xEnd - xStart;
    ctx.save();
    ctx.setFont("Arial", 8, "");
    ctx.fillText(Math.round(xWidth) + "px", xStart + note.getXShift(), yPos);

    var y = (yPos + 7);
    function stroke(x1, x2, color) {
      ctx.beginPath();
      ctx.setStrokeStyle(color);
      ctx.setFillStyle(color);
      ctx.setLineWidth(3);
      ctx.moveTo(x1 + note.getXShift(), y);
      ctx.lineTo(x2 + note.getXShift(), y);
      ctx.stroke();
    }

    stroke(xStart, xPre1, "red");
    stroke(xPre1, xAbs, "#999");
    stroke(xAbs, xPost1, "green");
    stroke(xPost1, xPost2, "#999");
    stroke(xPost2, xEnd, "red");
    stroke(xStart - note.getXShift(), xStart, "#DDD"); // Shift
    Vex.drawDot(ctx, xAbs + note.getXShift(), y, "blue");
    ctx.restore();
  };

  // ## Prototype Methods
  //
  // Every note is a tickable, i.e., it can be mutated by the `Formatter` class for
  // positioning and layout.
  Vex.Inherit(Note, Vex.Flow.Tickable, {
    // See constructor above for how to create a note.
    init: function(note_struct) {
      Note.superclass.init.call(this);

      if (!note_struct) {
        throw new Vex.RuntimeError("BadArguments",
            "Note must have valid initialization data to identify " +
            "duration and type.");
      }

      // Parse `note_struct` and get note properties.
      var initData = Vex.Flow.parseNoteData(note_struct);
      if (!initData) {
        throw new Vex.RuntimeError("BadArguments",
            "Invalid note initialization object: " + JSON.stringify(note_struct));
      }

      // Set note properties from parameters.
      this.duration = initData.duration;
      this.dots = initData.dots;
      this.noteType = initData.type;

      if (note_struct.duration_override) {
        // Custom duration
        this.setDuration(note_struct.duration_override);
      } else {
        // Default duration
        this.setIntrinsicTicks(initData.ticks);
      }

      this.modifiers = [];

      // Get the glyph code for this note from the font.
      this.glyph = Vex.Flow.durationToGlyph(this.duration, this.noteType);

      if (this.positions &&
          (typeof(this.positions) != "object" || !this.positions.length)) {
        throw new Vex.RuntimeError(
          "BadArguments", "Note keys must be array type.");
      }

      // Note to play for audio players.
      this.playNote = null;

      // Positioning contexts used by the Formatter.
      this.tickContext = null;    // The current tick context.
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

      if (note_struct.align_center) {
        this.setCenterAlignment(note_struct.align_center);
      }

      // The render surface.
      this.context = null;
      this.stave = null;
      this.render_options = {
        annotation_spacing: 5,
        stave_padding: 12
      };
    },

    // Get and set the play note, which is arbitrary data that can be used by an
    // audio player.
    getPlayNote: function() { return this.playNote; },
    setPlayNote: function(note) { this.playNote = note; return this; },

    // Don't play notes by default, call them rests. This is also used by things like
    // beams and dots for positioning.
    isRest: function() { return false; },

    // TODO(0xfe): Why is this method here?
    addStroke: function(index, stroke) {
      stroke.setNote(this);
      stroke.setIndex(index);
      this.modifiers.push(stroke);
      this.setPreFormatted(false);
      return this;
    },

    // Get and set the target stave.
    getStave: function() { return this.stave; },
    setStave: function(stave) {
      this.stave = stave;
      this.setYs([stave.getYForLine(0)]); // Update Y values if the stave is changed.
      this.context = this.stave.context;
      return this;
    },


    // `Note` is not really a modifier, but is used in
    // a `ModifierContext`.
    getCategory: function() { return this.constructor.CATEGORY; },

    // Set the rendering context for the note.
    setContext: function(context) { this.context = context; return this; },

    // Get and set spacing to the left and right of the notes.
    getExtraLeftPx: function() { return this.extraLeftPx; },
    getExtraRightPx: function() { return this.extraRightPx; },
    setExtraLeftPx: function(x) { this.extraLeftPx = x; return this; },
    setExtraRightPx: function(x) { this.extraRightPx = x; return this; },

    // Returns true if this note has no duration (e.g., bar notes, spacers, etc.)
    shouldIgnoreTicks: function() { return this.ignore_ticks; },

    // Get the stave line number for the note.
    getLineNumber: function() { return 0; },

    // Get the stave line number for rest.
    getLineForRest: function() { return 0; },

    // Get the glyph associated with this note.
    getGlyph: function() { return this.glyph; },

    // Set and get Y positions for this note. Each Y value is associated with
    // an individual pitch/key within the note/chord.
    setYs: function(ys) { this.ys = ys; return this; },
    getYs: function() {
      if (this.ys.length === 0) throw new Vex.RERR("NoYValues",
          "No Y-values calculated for this note.");
      return this.ys;
    },

    // Get the Y position of the space above the stave onto which text can
    // be rendered.
    getYForTopText: function(text_line) {
      if (!this.stave) throw new Vex.RERR("NoStave",
          "No stave attached to this note.");
      return this.stave.getYForTopText(text_line);
    },

    // Get a `BoundingBox` for this note.
    getBoundingBox: function() { return null; },

    // Returns the voice that this note belongs in.
    getVoice: function() {
      if (!this.voice) throw new Vex.RERR("NoVoice", "Note has no voice.");
      return this.voice;
    },

    // Attach this note to `voice`.
    setVoice: function(voice) {
      this.voice = voice;
      this.preFormatted = false;
      return this;
    },

    // Get and set the `TickContext` for this note.
    getTickContext: function() { return this.tickContext; },
    setTickContext: function(tc) {
      this.tickContext = tc;
      this.preFormatted = false;
      return this;
    },

    // Accessors for the note type.
    getDuration: function() { return this.duration; },
    isDotted: function() { return (this.dots > 0); },
    hasStem: function() { return false; },
    getDots: function() { return this.dots; },
    getNoteType: function() { return this.noteType; },
    setBeam: function() { return this; }, // ignore parameters

    // Attach this note to a modifier context.
    setModifierContext: function(mc) { this.modifierContext = mc; return this; },

    // Attach a modifier to this note.
    addModifier: function(modifier, index) {
      modifier.setNote(this);
      modifier.setIndex(index || 0);
      this.modifiers.push(modifier);
      this.setPreFormatted(false);
      return this;
    },

    // Get the coordinates for where modifiers begin.
    getModifierStartXY: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetModifierStartXY on an unformatted note");
      return {x: this.getAbsoluteX(), y: this.ys[0]};
    },

    // Get bounds and metrics for this note.
    //
    // Returns a struct with fields:
    // `width`: The total width of the note (including modifiers.)
    // `noteWidth`: The width of the note head only.
    // `left_shift`: The horizontal displacement of the note.
    // `modLeftPx`: Start `X` for left modifiers.
    // `modRightPx`: Start `X` for right modifiers.
    // `extraLeftPx`: Extra space on left of note.
    // `extraRightPx`: Extra space on right of note.
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
                          modLeftPx - modRightPx -
                          this.extraLeftPx - this.extraRightPx,
               left_shift: this.x_shift, // TODO(0xfe): Make style consistent


               // Modifiers, accidentals etc.
               modLeftPx: modLeftPx,
               modRightPx: modRightPx,

               // Displaced note head on left or right.
               extraLeftPx: this.extraLeftPx,
               extraRightPx: this.extraRightPx };
    },

    // Get and set width of note. Used by the formatter for positioning.
    setWidth: function(width) { this.width = width; },
    getWidth: function() {
      if (!this.preFormatted) throw new Vex.RERR("UnformattedNote",
          "Can't call GetWidth on an unformatted note.");
      return this.width +
        (this.modifierContext ?  this.modifierContext.getWidth() : 0);
    },

    // Displace note by `x` pixels. Used by the formatter.
    setXShift: function(x) { this.x_shift = x; return this; },
    getXShift: function() { return this.x_shift; },

    // Get `X` position of this tick context.
    getX: function() {
      if (!this.tickContext) throw new Vex.RERR("NoTickContext",
          "Note needs a TickContext assigned for an X-Value");
      return this.tickContext.getX() + this.x_shift;
    },

    // Get the absolute `X` position of this note's tick context. This
    // excludes x_shift, so you'll need to factor it in if you're
    // looking for the post-formatted x-position.
    getAbsoluteX: function() {
      if (!this.tickContext) throw new Vex.RERR("NoTickContext",
          "Note needs a TickContext assigned for an X-Value");

      // Position note to left edge of tick context.
      var x = this.tickContext.getX();
      if (this.stave) {
        x += this.stave.getNoteStartX() + this.render_options.stave_padding;
      }

      if (this.isCenterAligned()){
        x += this.getCenterXShift();
      }

      return x;
    },

    setPreFormatted: function(value) {
      this.preFormatted = value;

      // Maintain the width of left and right modifiers in pixels.
      if (this.preFormatted) {
        var extra = this.tickContext.getExtraPx();
        this.left_modPx = Math.max(this.left_modPx, extra.left);
        this.right_modPx = Math.max(this.right_modPx, extra.right);
      }
    }
  });

  return Note;
}());