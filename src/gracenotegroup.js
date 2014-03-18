Vex.Flow.GraceNoteGroup = (function(){
  var GraceNoteGroup = function(grace_notes, config) {
    if (arguments.length > 0) this.init(grace_notes, config);
  };

  Vex.Inherit(GraceNoteGroup, Vex.Flow.Modifier, {
    init: function(grace_notes, show_slur) {
      var superclass = GraceNoteGroup.superclass;
      superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.position = Vex.Flow.Modifier.Position.LEFT;
      this.grace_notes = grace_notes;
      this.width = 0;

      this.preFormatted = false;

      this.show_slur = show_slur;
      this.slur = null;

      this.formatter = new Vex.Flow.Formatter();
      this.voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
      }).setStrict(false);

      this.voice.addTickables(this.grace_notes);

      return this;
    },

    preFormat: function(){
      if (this.preFormatted) return;

      this.formatter.joinVoices([this.voice]).format([this.voice], 0);
      this.setWidth(this.formatter.getMinTotalWidth());

      this.preFormatted = true;
    },

    beamNotes: function(){
      if (this.grace_notes.length > 1) {
        var beam = new Vex.Flow.Beam(this.grace_notes);

        beam.render_options.beam_width = 3;
        beam.render_options.partial_beam_length = 4;

        this.beam = beam;
      }

      return this;
    },

    setNote: function(note) {
      this.note = note;
    },
    getCategory: function() { return "gracenotegroups"; },
    setWidth: function(width){
      this.width = width;
    },
    getWidth: function(){
      return this.width;
    },
    setXShift: function(x_shift) {
        this.x_shift = x_shift;
    },
    draw: function() {
      if (!this.context)  {
        throw new Vex.RuntimeError("NoContext",
          "Can't draw Grace note without a context.");
      }

      var note = this.getNote();

      if (!(note && (this.index !== null))) {
        throw new Vex.RuntimeError("NoAttachedNote",
          "Can't draw grace note without a parent note and parent note index.");
      }

      function alignGraceNotesWithNote(grace_notes, note) {
        // Shift over the tick contexts of each note
        // So that th aligned with the note
        var tickContext = note.getTickContext();
        var extraPx = tickContext.getExtraPx();
        var x = tickContext.getX() - extraPx.left - extraPx.extraLeft;
        grace_notes.forEach(function(graceNote) {
            var tick_context = graceNote.getTickContext();
            var x_offset = tick_context.getX();
            graceNote.setStave(note.stave);
            tick_context.setX(x + x_offset);
        });
      }

      alignGraceNotesWithNote(this.grace_notes, note);

      // Draw notes
      this.grace_notes.forEach(function(graceNote) {
        graceNote.setContext(this.context).draw();
      }, this);

      // Draw beam
      if (this.beam) {
        this.beam.setContext(this.context).draw();
      }

      if (this.show_slur) {
        // Create and draw slur
        this.slur = new Vex.Flow.StaveTie({
          last_note: this.grace_notes[0],
          first_note: note,
          first_indices: [0],
          last_indices: [0]
        });

        this.slur.render_options.cp2 = 12;
        this.slur.setContext(this.context).draw();
      }
    }
  });

return GraceNoteGroup;
}());