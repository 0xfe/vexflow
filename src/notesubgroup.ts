// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2016
//
// ## Description
//
// This file implements `NoteSubGroup` which is used to format and
// render notes as a `Modifier`
// ex) ClefNote, TimeSigNote and BarNote.

import { Flow } from './flow';
import { Modifier } from './modifier';
import { Formatter } from './formatter';
import { Voice } from './voice';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { RenderContext } from './types/common';

export class NoteSubGroup extends Modifier {
  static get CATEGORY(): string {
    return 'notesubgroup';
  }

  // Arrange groups inside a `ModifierContext`
  static format(groups: NoteSubGroup[], state: ModifierContextState): boolean {
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

  protected subNotes: Note[];
  protected preFormatted: boolean = false;
  protected formatter: Formatter;
  protected voice: Voice;

  constructor(subNotes: Note[]) {
    super();
    this.setAttribute('type', 'NoteSubGroup');

    this.position = Modifier.Position.LEFT;
    this.subNotes = subNotes;
    this.subNotes.forEach((subNote) => {
      subNote.setIgnoreTicks(false);
    });
    this.width = 0;

    this.formatter = new Formatter();
    this.voice = new Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Flow.RESOLUTION,
    }).setStrict(false);

    this.voice.addTickables(this.subNotes);
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

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  getWidth(): number {
    return this.width;
  }

  draw(): void {
    const ctx: RenderContext = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();
    this.alignSubNotesWithNote(this.subNotes, note); // Modifier function
    this.subNotes.forEach((subNote) => subNote.setContext(ctx).drawWithStyle());
  }
}
