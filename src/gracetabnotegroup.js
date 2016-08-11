// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Balazs Forian-Szabo
//
// ## Description
//
// This file implements a container for grace
// notes to be rendered on a tab stave.
//
// See `tests/gracetabnote_tests.js` for usage examples.


import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { Formatter } from './formatter';
import { Voice } from './voice';
import { TabTie } from './tabtie';

// To enable logging for this class. Set `Vex.Flow.GraceNoteGroup.DEBUG` to `true`.
function L(...args) { if (GraceTabNoteGroup.DEBUG) Vex.L('Vex.Flow.GraceTabNoteGroup', args); }

export class GraceTabNoteGroup extends Modifier {
  static get CATEGORY() { return 'gracetabnotegroups'; }

  // Arrange groups inside a `ModifierContext`
  static format(gracenote_groups, state) {
    const gracenote_spacing = 0;

    if (!gracenote_groups || gracenote_groups.length === 0) return false;


    let group_shift = 0;
    for (let i = 0; i < gracenote_groups.length; ++i) {
      const gracenote_group = gracenote_groups[i];
      gracenote_group.preFormat();
      const formatWidth = gracenote_group.getWidth() + gracenote_spacing;
      group_shift = Math.max(formatWidth, group_shift);
    }

    state.left_shift += group_shift;
    return true;
  }

  // ## Prototype Methods
  //
  // `GraceTabNoteGroup` inherits from `Modifier`
  // and is placed inside a `ModifierContext`.
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

  getCategory() { return GraceTabNoteGroup.CATEGORY; }

  preFormat() {
    this.formatter.joinVoices([this.voice])
      .format([this.voice], 0);
    this.setWidth(this.formatter.getMinTotalWidth());
    this.preFormatted = true;
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
    function alignGraceNotesWithNote(grace_notes, note) {
      // Shift over the tick contexts of each note
      // So that th aligned with the note
      const tickContext = note.getTickContext();
      const extraPx = tickContext.getExtraPx();
      const x = tickContext.getX()
        - extraPx.left
        - extraPx.extraLeft
        + that.getSpacingFromNextModifier();

      grace_notes.forEach(graceNote => {
        const tick_context = graceNote.getTickContext();
        const x_offset = tick_context.getX();
        graceNote.setXShift(x);
        graceNote.setStave(note.stave);
        tick_context.setX(x + x_offset);
      });
    }

    alignGraceNotesWithNote(this.grace_notes, note, this.width);

    // Draw notes
    this.grace_notes.forEach(graceNote => {
      graceNote.setContext(this.context).draw();
    });

    if (this.show_slur) {
      // Create and draw slur
      this.slur = new TabTie({
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
