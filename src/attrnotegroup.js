// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2016
//
// ## Description
//
// This file implements `AttrNoteGroup` which is used to format and
// render attr notes; ClefNote, TimeSigNote and BarNote.

import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { Formatter } from './formatter';
import { Voice } from './voice';

export class AttrNoteGroup extends Modifier {
  static get CATEGORY() { return 'attrnotegroup'; }

  // Arrange groups inside a `ModifierContext`
  static format(attrnote_groups, state) {
    if (!attrnote_groups || attrnote_groups.length === 0) return false;

    let width = 0;
    for (let i = 0; i < attrnote_groups.length; ++i) {
      const attrnote_group = attrnote_groups[i];
      attrnote_group.preFormat();
      width += attrnote_group.getWidth();
    }

    state.left_shift += width;
    return true;
  }

  constructor(attr_notes) {
    super();

    this.note = null;
    this.index = null;
    this.position = Modifier.Position.LEFT;
    this.attr_notes = attr_notes;
    this.attr_notes.forEach(note => note.ignore_ticks = false);
    this.width = 0;
    this.preFormatted = false;

    this.formatter = new Formatter();
    this.voice = new Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Flow.RESOLUTION,
    }).setStrict(false);

    this.voice.addTickables(this.attr_notes);

    return this;
  }

  getCategory() { return AttrNoteGroup.CATEGORY; }

  preFormat() {
    if (this.preFormatted) return;

    this.formatter.joinVoices([this.voice]).format([this.voice], 0);
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
        "Can't draw attr note without a context.");
    }

    const note = this.getNote();

    if (!(note && (this.index !== null))) {
      throw new Vex.RuntimeError('NoAttachedNote',
        "Can't draw attr note without a parent note and parent note index.");
    }

    const alignAttrNotesWithNote = (attr_notes, note, groupWidth) => {
      // Shift over the tick contexts of each note
      const tickContext = note.getTickContext();
      const extraPx = tickContext.getExtraPx();
      const x = tickContext.getX() - extraPx.left - extraPx.extraLeft + this.getSpacingFromNextModifier();

      attr_notes.forEach(attrNote => {
        const tick_context = attrNote.getTickContext();
        const x_offset = tick_context.getX();
        attrNote.setStave(note.stave);
        tick_context.setX(x + x_offset);
      });
    };

    alignAttrNotesWithNote(this.attr_notes, note, this.width);

    // Draw notes
    this.attr_notes.forEach(attrNote => attrNote.setContext(this.context).draw());
  }
}
