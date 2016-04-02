// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `GraceNoteGroup` which is used to format and
// render grace notes.

Vex.Flow.GraceNoteGroup = (function(){
  function GraceNoteGroup(grace_notes, config) {
    if (arguments.length > 0) this.init(grace_notes, config);
  }

  GraceNoteGroup.CATEGORY = "gracenotegroups";

  // To enable logging for this class. Set `Vex.Flow.GraceNoteGroup.DEBUG` to `true`.
  function L() { if (GraceNoteGroup.DEBUG) Vex.L("Vex.Flow.GraceNoteGroup", arguments); }

  // Arrange groups inside a `ModifierContext`
  GraceNoteGroup.format = function(gracenote_groups, state) {
    var gracenote_spacing = 4;

    if (!gracenote_groups || gracenote_groups.length === 0) return false;

    var group_list = [];
    var hasStave = false;
    var prev_note = null;
    var shiftL = 0;

    var i, gracenote_group, props_tmp;
    for (i = 0; i < gracenote_groups.length; ++i) {
      gracenote_group = gracenote_groups[i];
      var note = gracenote_group.getNote();
      var stave = note.getStave();
      if (note != prev_note) {
         // Iterate through all notes to get the displaced pixels
         for (var n = 0; n < note.keys.length; ++n) {
            props_tmp = note.getKeyProps()[n];
            shiftL = (props_tmp.displaced ? note.getExtraLeftPx() : shiftL);
          }
          prev_note = note;
      }
      if (stave != null) {
        hasStave = true;
        group_list.push({shift: shiftL, gracenote_group: gracenote_group});
      } else {
        group_list.push({shift: shiftL, gracenote_group: gracenote_group });
      }
    }

    // If first note left shift in case it is displaced
    var group_shift = group_list[0].shift;
    var formatWidth;
    for (i = 0; i < group_list.length; ++i) {
      gracenote_group = group_list[i].gracenote_group;
      gracenote_group.preFormat();
      formatWidth = gracenote_group.getWidth() + gracenote_spacing;
      group_shift = Math.max(formatWidth, group_shift);
    }

    for (i = 0; i < group_list.length; ++i) {
      gracenote_group = group_list[i].gracenote_group;
      formatWidth = gracenote_group.getWidth() + gracenote_spacing;
      gracenote_group.setSpacingFromNextModifier(group_shift - Math.min(formatWidth, group_shift));
    }

    state.left_shift += group_shift;
    return true;
  };

  // ## Prototype Methods
  //
  // `GraceNoteGroup` inherits from `Modifier` and is placed inside a
  // `ModifierContext`.
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
    setWidth: function(width){
      this.width = width;
    },
    getWidth: function(){
      return this.width;
    },
    draw: function() {
      if (!this.context)  {
        throw new Vex.RuntimeError("NoContext",
          "Can't draw Grace note without a context.");
      }

      var note = this.getNote();

      L("Drawing grace note group for:", note);

      if (!(note && (this.index !== null))) {
        throw new Vex.RuntimeError("NoAttachedNote",
          "Can't draw grace note without a parent note and parent note index.");
      }

      var that = this;
      function alignGraceNotesWithNote(grace_notes, note, groupWidth) {
        // Shift over the tick contexts of each note
        // So that th aligned with the note
        var tickContext = note.getTickContext();
        var extraPx = tickContext.getExtraPx();
        var x = tickContext.getX() - extraPx.left - extraPx.extraLeft + that.getSpacingFromNextModifier();
        grace_notes.forEach(function(graceNote) {
            var tick_context = graceNote.getTickContext();
            var x_offset = tick_context.getX();
            graceNote.setStave(note.stave);
            tick_context.setX(x + x_offset);
        });
      }

      alignGraceNotesWithNote(this.grace_notes, note, this.width);

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