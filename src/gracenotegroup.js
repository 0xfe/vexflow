Vex.Flow.GraceNoteGroup = (function(){
  var GraceNoteGroup = function(grace_notes, config) {
    if (arguments.length > 0) this.init(grace_notes, config);
  };

  Vex.Inherit(GraceNoteGroup, Vex.Flow.Modifier, {
    init: function(grace_notes, config) {
      if (!config) {
        config = {};
      }

      var superclass = GraceNoteGroup.superclass;
      superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.position = Vex.Flow.Modifier.Position.LEFT;
      this.grace_notes = grace_notes;
      this.width = 0;

      this.slur = config.slur;

      this.voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
      });
      this.formatter = new Vex.Flow.Formatter();

      this.voice.addTickables(this.grace_notes);
      this.voice.setStrict(false);

      if (config.beam && this.grace_notes.length > 1) {
        this.beamNotes();
      }

      this.formatter.joinVoices([this.voice]).format([this.voice], 0);
      this.setWidth(this.formatter.getMinTotalWidth());
    },

    beamNotes: function(){
      var beam = new Vex.Flow.Beam(this.grace_notes);
      beam.render_options.beam_width = 3;
      beam.render_options.partial_beam_length = 4;

      this.beam = beam;
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

      if (!(this.note && (this.index !== null))) {
        throw new Vex.RuntimeError("NoAttachedNote",
          "Can't draw grace note without a parent note and parent note index.");
      }
      var note = this.getNote();
      var tickContext = note.getTickContext();
      var extraPx = tickContext.getExtraPx();
      var x = tickContext.getX() - extraPx.left - extraPx.extraLeft;

      var offset = 0;
      this.grace_notes.forEach(function(graceNote) {
          var tickContext = graceNote.getTickContext();
          graceNote.setStave(note.stave);
          var tempX = tickContext.getX();
          tickContext.setX(x + tempX);
          offset += tempX;
      }, this);

      if (this.beam) {
        this.beam.setContext(this.context).draw();
      }
      
      this.grace_notes.forEach(function(graceNote) {
        graceNote.setContext(this.context).draw();
      }, this);

      if (this.slur) {
        var tie = new Vex.Flow.StaveTie({
          last_note: this.grace_notes[0],
          first_note: this.getNote(),
          first_indices: [0],
          last_indices: [0]
        });

        tie.render_options.cp2 = 12
        tie.setContext(this.context).draw();
      }
    }
  });

return GraceNoteGroup;
}());