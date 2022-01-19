// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// Author: Raffaele Viglianti, 2012 http://itisnotsound.wordpress.com/
//
// This class implements hairpins between notes.
// Hairpins can be either crescendo or decrescendo.

import { Element } from './element';
import { Modifier } from './modifier';
import { Note } from './note';
import { RenderContext } from './rendercontext';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export interface StaveHairpinRenderOptions {
  right_shift_ticks?: number;
  left_shift_ticks?: number;
  left_shift_px: number;
  right_shift_px: number;
  height: number;
  y_shift: number;
}

export class StaveHairpin extends Element {
  static get CATEGORY(): string {
    return Category.StaveHairpin;
  }

  protected hairpin: number;

  protected position: number;
  public render_options: StaveHairpinRenderOptions;

  // notes is initialized by the constructor via this.setNotes(notes).
  protected notes!: Record<string, Note>;

  protected first_note?: Note;
  protected last_note?: Note;

  static readonly type = {
    CRESC: 1,
    DECRESC: 2,
  };

  /* Helper function to convert ticks into pixels.
   * Requires a Formatter with voices joined and formatted (to
   * get pixels per tick)
   *
   * options is struct that has:
   *
   *  {
   *   height: px,
   *   y_shift: px,         // vertical offset
   *   left_shift_ticks: 0, // left horizontal offset expressed in ticks
   *   right_shift_ticks: 0 // right horizontal offset expressed in ticks
   *  }
   *
   **/
  static FormatByTicksAndDraw(
    ctx: RenderContext,
    formatter: { pixelsPerTick: number },
    notes: Record<string, Note>,
    type: number,
    position: number,
    options: StaveHairpinRenderOptions
  ): void {
    const ppt = formatter.pixelsPerTick;

    if (ppt == null) {
      throw new RuntimeError('BadArguments', 'A valid Formatter must be provide to draw offsets by ticks.');
    }

    const l_shift_px = ppt * (options.left_shift_ticks ?? 0);
    const r_shift_px = ppt * (options.right_shift_ticks ?? 0);

    const hairpin_options = {
      height: options.height,
      y_shift: options.y_shift,
      left_shift_px: l_shift_px,
      right_shift_px: r_shift_px,
      right_shift_ticks: 0,
      left_shift_ticks: 0,
    };

    new StaveHairpin(
      {
        first_note: notes.first_note,
        last_note: notes.last_note,
      },
      type
    )
      .setContext(ctx)
      .setRenderOptions(hairpin_options)
      .setPosition(position)
      .draw();
  }

  /**
   * Create a new hairpin from the specified notes.
   *
   * @param {!Object} notes The notes to tie up.
   * Notes is a struct that has:
   *
   *  {
   *    first_note: Note,
   *    last_note: Note,
   *  }
   * @param {!Object} type The type of hairpin
   */
  constructor(notes: Record<string, Note>, type: number) {
    super();
    this.setNotes(notes);
    this.hairpin = type;
    this.position = Modifier.Position.BELOW;

    this.render_options = {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
      right_shift_ticks: 0,
      left_shift_ticks: 0,
    };
  }

  setPosition(position: number): this {
    if (position === Modifier.Position.ABOVE || position === Modifier.Position.BELOW) {
      this.position = position;
    }
    return this;
  }

  setRenderOptions(options: StaveHairpinRenderOptions): this {
    if (
      options.height != null &&
      options.y_shift != null &&
      options.left_shift_px != null &&
      options.right_shift_px != null
    ) {
      this.render_options = options;
    }
    return this;
  }

  /**
   * Set the notes to attach this hairpin to.
   *
   * @param {!Object} notes The start and end notes.
   */
  setNotes(notes: Record<string, Note>): this {
    if (!notes.first_note && !notes.last_note) {
      throw new RuntimeError('BadArguments', 'Hairpin needs to have either first_note or last_note set.');
    }

    this.notes = notes;
    this.first_note = notes.first_note;
    this.last_note = notes.last_note;
    return this;
  }

  renderHairpin(params: {
    first_x: number;
    last_x: number;
    first_y: number;
    last_y: number;
    staff_height: number;
  }): void {
    const ctx = this.checkContext();
    let dis = this.render_options.y_shift + 20;
    let y_shift = params.first_y;

    if (this.position === Modifier.Position.ABOVE) {
      dis = -dis + 30;
      y_shift = params.first_y - params.staff_height;
    }

    const l_shift = this.render_options.left_shift_px;
    const r_shift = this.render_options.right_shift_px;

    ctx.beginPath();

    switch (this.hairpin) {
      case StaveHairpin.type.CRESC:
        ctx.moveTo(params.last_x + r_shift, y_shift + dis);
        ctx.lineTo(params.first_x + l_shift, y_shift + this.render_options.height / 2 + dis);
        ctx.lineTo(params.last_x + r_shift, y_shift + this.render_options.height + dis);
        break;
      case StaveHairpin.type.DECRESC:
        ctx.moveTo(params.first_x + l_shift, y_shift + dis);
        ctx.lineTo(params.last_x + r_shift, y_shift + this.render_options.height / 2 + dis);
        ctx.lineTo(params.first_x + l_shift, y_shift + this.render_options.height + dis);
        break;
      default:
        // Default is NONE, so nothing to draw
        break;
    }

    ctx.stroke();
    ctx.closePath();
  }

  draw(): void {
    this.checkContext();
    this.setRendered();

    const firstNote = this.first_note;
    const lastNote = this.last_note;
    if (!firstNote || !lastNote) throw new RuntimeError('NoNote', 'Notes required to draw');

    const start = firstNote.getModifierStartXY(this.position, 0);
    const end = lastNote.getModifierStartXY(this.position, 0);

    this.renderHairpin({
      first_x: start.x,
      last_x: end.x,
      first_y: firstNote.checkStave().getY() + firstNote.checkStave().getHeight(),
      last_y: lastNote.checkStave().getY() + lastNote.checkStave().getHeight(),
      staff_height: firstNote.checkStave().getHeight(),
    });
  }
}
