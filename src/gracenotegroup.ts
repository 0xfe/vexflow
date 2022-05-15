// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `GraceNoteGroup` which is used to format and
// render grace notes.

import { Beam } from './beam';
import { Formatter } from './formatter';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { RenderContext } from './rendercontext';
import { StaveNote } from './stavenote';
import { StaveTie } from './stavetie';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { TabTie } from './tabtie';
import { Category, isStaveNote } from './typeguard';
import { log } from './util';
import { Voice } from './voice';

// To enable logging for this class. Set `GraceNoteGroup.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any) {
  if (GraceNoteGroup.DEBUG) log('Vex.Flow.GraceNoteGroup', args);
}

/** GraceNoteGroup is used to format and render grace notes. */
export class GraceNoteGroup extends Modifier {
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.GraceNoteGroup;
  }

  protected readonly voice: Voice;
  protected readonly grace_notes: StemmableNote[];
  protected readonly show_slur?: boolean;

  protected preFormatted: boolean = false;
  protected formatter?: Formatter;
  public render_options: { slur_y_shift: number };
  protected slur?: StaveTie | TabTie;
  protected beams: Beam[];

  /** Arranges groups inside a `ModifierContext`. */
  static format(gracenote_groups: GraceNoteGroup[], state: ModifierContextState): boolean {
    const group_spacing_stave = 4;
    const group_spacing_tab = 0;

    if (!gracenote_groups || gracenote_groups.length === 0) return false;

    const group_list = [];
    let prev_note = null;
    let shiftL = 0;

    for (let i = 0; i < gracenote_groups.length; ++i) {
      const gracenote_group = gracenote_groups[i];
      const note = gracenote_group.getNote();
      const is_stavenote = isStaveNote(note);
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
      gracenote_group.setSpacingFromNextModifier(
        group_shift - Math.min(formatWidth, group_shift) + StaveNote.minNoteheadPadding
      );
    }

    state.left_shift += group_shift;
    return true;
  }

  //** `GraceNoteGroup` inherits from `Modifier` and is placed inside a `ModifierContext`. */
  constructor(grace_notes: StemmableNote[], show_slur?: boolean) {
    super();

    this.position = Modifier.Position.LEFT;
    this.grace_notes = grace_notes;
    this.width = 0;

    this.show_slur = show_slur;
    this.slur = undefined;

    this.voice = new Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Tables.RESOLUTION,
    }).setStrict(false);

    this.render_options = {
      slur_y_shift: 0,
    };

    this.beams = [];

    this.voice.addTickables(this.grace_notes);

    return this;
  }

  preFormat(): void {
    if (this.preFormatted) return;

    if (!this.formatter) {
      this.formatter = new Formatter();
    }
    this.formatter.joinVoices([this.voice]).format([this.voice], 0, {});
    this.setWidth(this.formatter.getMinTotalWidth());
    this.preFormatted = true;
  }

  beamNotes(grace_notes?: StemmableNote[]): this {
    grace_notes = grace_notes || this.grace_notes;
    if (grace_notes.length > 1) {
      const beam = new Beam(grace_notes);

      beam.render_options.beam_width = 3;
      beam.render_options.partial_beam_length = 4;

      this.beams.push(beam);
    }

    return this;
  }

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  getWidth(): number {
    return this.width + StaveNote.minNoteheadPadding;
  }

  getGraceNotes(): Note[] {
    return this.grace_notes;
  }

  draw(): void {
    const ctx: RenderContext = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    L('Drawing grace note group for:', note);

    this.alignSubNotesWithNote(this.getGraceNotes(), note); // Modifier function

    // Draw grace notes.
    this.grace_notes.forEach((graceNote) => graceNote.setContext(ctx).draw());
    // Draw beams.
    this.beams.forEach((beam) => beam.setContext(ctx).draw());

    if (this.show_slur) {
      // Create and draw slur.
      const is_stavenote = isStaveNote(note);
      const TieClass = is_stavenote ? StaveTie : TabTie;

      this.slur = new TieClass({
        last_note: this.grace_notes[0],
        first_note: note,
        first_indices: [0],
        last_indices: [0],
      });

      this.slur.render_options.cp2 = 12;
      this.slur.render_options.y_shift = (is_stavenote ? 7 : 5) + this.render_options.slur_y_shift;
      this.slur.setContext(ctx).draw();
    }
  }
}
