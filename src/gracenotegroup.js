// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `GraceNoteGroup` which is used to format and
// render grace notes.

import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { Formatter } from './formatter';
import { Voice } from './voice';
import { Beam } from './beam';
import { StaveTie } from './stavetie';

export class GraceNoteGroup extends Modifier {
  static get CATEGORY() { return 'gracenotegroups'; }

  // Arrange groups inside a `ModifierContext`
  static format(gracenote_groups, state) {
    const gracenote_spacing = 4;

    if (!gracenote_groups || gracenote_groups.length === 0) return false;

    const group_list = [];
    let hasStave = false;
    let prev_note = null;
    let shiftL = 0;

    let i, gracenote_group, props_tmp;
    for (i = 0; i < gracenote_groups.length; ++i) {
      gracenote_group = gracenote_groups[i];
      const note = gracenote_group.getNote();
      const stave = note.getStave();
      if (note != prev_note) {
         // Iterate through all notes to get the displaced pixels
        for (let n = 0; n < note.keys.length; ++n) {
          props_tmp = note.getKeyProps()[n];
          shiftL = (props_tmp.displaced ? note.getExtraLeftPx() : shiftL);
        }
        prev_note = note;
      }
      if (stave != null) {
        hasStave = true;
        group_list.push({ shift: shiftL, gracenote_group });
      } else {
        group_list.push({ shift: shiftL, gracenote_group });
      }
    }

    // If first note left shift in case it is displaced
    let group_shift = group_list[0].shift;
    let formatWidth;
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
  }

  // ## Prototype Methods
  //
  // `GraceNoteGroup` inherits from `Modifier` and is placed inside a
  // `ModifierContext`.
  constructor(grace_notes, show_slur) {
    super();

    this.note = null;
    this.index = null;
    this.position = Modifier.Position.LEFT;
    this.grace_notes = grace_notes;
    this.width = 0;

    this.preFormatted = false;

    this.show_slur = show_slur;
    this.slur = null;

    this.formatter = new Formatter();
    this.voice = new Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Flow.RESOLUTION,
    }).setStrict(false);

    this.voice.addTickables(this.grace_notes);

    return this;
  }

  getCategory() { return GraceNoteGroup.CATEGORY; }

  preFormat() {
    if (this.preFormatted) return;

    this.formatter.joinVoices([this.voice]).format([this.voice], 0);
    this.setWidth(this.formatter.getMinTotalWidth());
    this.preFormatted = true;
  }

  beamNotes() {
    if (this.grace_notes.length > 1) {
      const beam = new Beam(this.grace_notes);

      beam.render_options.beam_width = 3;
      beam.render_options.partial_beam_length = 4;

      this.beam = beam;
    }

    return this;
  }

  setNote(note) {
    this.note = note;
  }
  setWidth(width) {
    this.width = width;
  }
  getWidth() {
    return this.width;
  }
  draw() {
    if (!this.context)  {
      throw new Vex.RuntimeError('NoContext',
        "Can't draw Grace note without a context.");
    }

    const note = this.getNote();

    L('Drawing grace note group for:', note);

    if (!(note && (this.index !== null))) {
      throw new Vex.RuntimeError('NoAttachedNote',
        "Can't draw grace note without a parent note and parent note index.");
    }

    const that = this;
    function alignGraceNotesWithNote(grace_notes, note, groupWidth) {
      // Shift over the tick contexts of each note
      // So that th aligned with the note
      const tickContext = note.getTickContext();
      const extraPx = tickContext.getExtraPx();
      const x = tickContext.getX() - extraPx.left - extraPx.extraLeft + that.getSpacingFromNextModifier();
      grace_notes.forEach(graceNote => {
        const tick_context = graceNote.getTickContext();
        const x_offset = tick_context.getX();
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
      this.slur = new StaveTie({
        last_note: this.grace_notes[0],
        first_note: note,
        first_indices: [0],
        last_indices: [0],
      });

      this.slur.render_options.cp2 = 12;
      this.slur.setContext(this.context).draw();
    }
  }
}

// To enable logging for this class. Set `Vex.Flow.GraceNoteGroup.DEBUG` to `true`.
function L() { if (GraceNoteGroup.DEBUG) Vex.L('Vex.Flow.GraceNoteGroup', arguments); }
