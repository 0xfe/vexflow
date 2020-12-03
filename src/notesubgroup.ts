// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2016
//
// ## Description
//
// This file implements `NoteSubGroup` which is used to format and
// render notes as a `Modifier`
// ex) ClefNote, TimeSigNote and BarNote.

import {Vex} from './vex';
import {Flow} from './tables';
import {Modifier} from './modifier';
import {Formatter} from './formatter';
import {Voice} from './voice';
import {Note} from "./note";

export class NoteSubGroup extends Modifier {
  private readonly voice: Voice;
  private readonly subNotes: Note[];

  private preFormatted: boolean;
  private formatter: Formatter;

  static get CATEGORY(): string {
    return 'notesubgroup';
  }

  // Arrange groups inside a `ModifierContext`
  static format(groups: Note[], state: any): boolean {
    if (!groups || groups.length === 0) return false;

    let width = 0;
    for (let i = 0; i < groups.length; ++i) {
      const group = groups[i];
      group.preFormat();
      width += group.getWidth();
    }

    state.left_shift += width;
    return true;
  }

  constructor(subNotes: Note[]) {
    super();
    this.setAttribute('type', 'NoteSubGroup');

    this.note = null;
    this.index = null;
    this.position = Modifier.Position.LEFT;
    this.subNotes = subNotes;
    this.subNotes.forEach(subNote => {
      subNote.ignore_ticks = false;
    });
    this.width = 0;
    this.preFormatted = false;

    this.formatter = new Formatter();
    this.voice = new Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Flow.RESOLUTION,
    }).setStrict(false);

    this.voice.addTickables(this.subNotes);

    return this;
  }

  getCategory(): string {
    return NoteSubGroup.CATEGORY;
  }

  preFormat(): void {
    if (this.preFormatted) return;

    this.formatter.joinVoices([this.voice]).format([this.voice], 0);
    this.setWidth(this.formatter.getMinTotalWidth());
    this.preFormatted = true;
  }

  setNote(note: Note): this {
    this.note = note;
    return this;
  }

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  getWidth(): number {
    return this.width;
  }

  draw(): void {
    this.checkContext();

    const note = this.getNote();

    if (!(note && (this.index !== null))) {
      throw new Vex.RuntimeError('NoAttachedNote',
        "Can't draw notes without a parent note and parent note index.");
    }

    this.setRendered();
    this.alignSubNotesWithNote(this.subNotes, note); // Modifier function

    // Draw notes
    this.subNotes.forEach(subNote => subNote.setContext(this.context).drawWithStyle());
  }
}
