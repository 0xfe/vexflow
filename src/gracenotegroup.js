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
import { TabTie } from './tabtie';
import { StaveNote } from './stavenote';

// To enable logging for this class. Set `Vex.Flow.GraceNoteGroup.DEBUG` to `true`.
function L(...args) {
  if (GraceNoteGroup.DEBUG) Vex.L('Vex.Flow.GraceNoteGroup', args);
}

export class GraceNoteGroup extends Modifier {
  static get CATEGORY() {
    return 'gracenotegroups';
  }

  // Arrange groups inside a `ModifierContext`
  static format(gracenote_groups, state) {
    const group_spacing_stave = 4;
    const group_spacing_tab = 0;

    if (!gracenote_groups || gracenote_groups.length === 0) return false;

    const group_list = [];
    let prev_note = null;
    let shiftL = 0;

    for (let i = 0; i < gracenote_groups.length; ++i) {
      const gracenote_group = gracenote_groups[i];
      const note = gracenote_group.getNote();
      const is_stavenote = note.getCategory() === StaveNote.CATEGORY;
      const spacing = is_stavenote ? group_spacing_stave : group_spacing_tab;

      if (is_stavenote && note !== prev_note) {
        // Iterate through all notes to get the displaced pixels
        for (let n = 0; n < note.keys.length; ++n) {
          shiftL = Math.max(note.getLeftDisplacedHeadPx(), shiftL);
        }
        prev_note = note;
      }

      group_list.push({ shift: shiftL, gracenote_group, spacing });
    }

    // If first note left shift in case it is displaced
    let group_shift = group_list[0].shift;
    let formatWidth;
    for (let i = 0; i < group_list.length; ++i) {
      const gracenote_group = group_list[i].gracenote_group;
      gracenote_group.preFormat();
      formatWidth = gracenote_group.getWidth() + group_list[i].spacing;
      group_shift = Math.max(formatWidth, group_shift);
    }

    for (let i = 0; i < group_list.length; ++i) {
      const gracenote_group = group_list[i].gracenote_group;
      formatWidth = gracenote_group.getWidth() + group_list[i].spacing;
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
    this.setAttribute('type', 'GraceNoteGroup');

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

    this.render_options = {
      slur_y_shift: 0,
    };

    this.beams = [];

    this.voice.addTickables(this.grace_notes);

    return this;
  }

  getCategory() {
    return GraceNoteGroup.CATEGORY;
  }

  preFormat() {
    if (this.preFormatted) return;

    this.formatter.joinVoices([this.voice]).format([this.voice], 0);
    this.setWidth(this.formatter.getMinTotalWidth());
    this.preFormatted = true;
  }

  beamNotes(grace_notes) {
    grace_notes = grace_notes || this.grace_notes;
    if (grace_notes.length > 1) {
      const beam = new Beam(grace_notes);

      beam.render_options.beam_width = 3;
      beam.render_options.partial_beam_length = 4;

      this.beams.push(beam);
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
  getGraceNotes() {
    return this.grace_notes;
  }
  draw() {
    this.checkContext();

    const note = this.getNote();

    L('Drawing grace note group for:', note);

    if (!(note && this.index !== null)) {
      throw new Vex.RuntimeError(
        'NoAttachedNote',
        "Can't draw grace note without a parent note and parent note index."
      );
    }

    this.setRendered();
    this.alignSubNotesWithNote(this.getGraceNotes(), note); // Modifier function

    // Draw notes
    this.grace_notes.forEach((graceNote) => {
      graceNote.setContext(this.context).draw();
    });

    // Draw beam
    this.beams.forEach((beam) => {
      beam.setContext(this.context).draw();
    });

    if (this.show_slur) {
      // Create and draw slur
      const is_stavenote = this.getNote().getCategory() === StaveNote.CATEGORY;
      const TieClass = is_stavenote ? StaveTie : TabTie;

      this.slur = new TieClass({
        last_note: this.grace_notes[0],
        first_note: note,
        first_indices: [0],
        last_indices: [0],
      });

      this.slur.render_options.cp2 = 12;
      this.slur.render_options.y_shift = (is_stavenote ? 7 : 5) + this.render_options.slur_y_shift;
      this.slur.setContext(this.context).draw();
    }
  }
}
