// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements the `Crescendo` object which draws crescendos and
// decrescendo dynamics markings. A `Crescendo` is initialized with a
// duration and formatted as part of a `Voice` like any other `Note`
// type in VexFlow. This object would most likely be formatted in a Voice
// with `TextNotes` - which are used to represent other dynamics markings.

import { Vex } from './vex';
import { Note, NoteStruct } from './note';
import { TickContext } from './tickcontext';
import { RenderContext } from './types/common';

export interface CrescendoParams {
  reverse: boolean;
  height: number;
  y: number;
  end_x: number;
  begin_x: number;
}

// To enable logging for this class. Set `Vex.Flow.Crescendo.DEBUG` to `true`.
function L(
  // eslint-disable-next-line
  ...args: any []) {
  if (Crescendo.DEBUG) Vex.L('Vex.Flow.Crescendo', args);
}

// Private helper to draw the hairpin
function renderHairpin(ctx: RenderContext, params: CrescendoParams) {
  const begin_x = params.begin_x;
  const end_x = params.end_x;
  const y = params.y;
  const half_height = params.height / 2;

  ctx.beginPath();

  if (params.reverse) {
    ctx.moveTo(begin_x, y - half_height);
    ctx.lineTo(end_x, y);
    ctx.lineTo(begin_x, y + half_height);
  } else {
    ctx.moveTo(end_x, y - half_height);
    ctx.lineTo(begin_x, y);
    ctx.lineTo(end_x, y + half_height);
  }

  ctx.stroke();
  ctx.closePath();
}

export class Crescendo extends Note {
  static DEBUG: boolean;

  protected decrescendo: boolean;
  protected height: number;
  protected line: number;
  protected options = {
    // Extensions to the length of the crescendo on either side
    extend_left: 0,
    extend_right: 0,
    // Vertical shift
    y_shift: 0,
  };

  // Initialize the crescendo's properties
  constructor(note_struct: NoteStruct) {
    super(note_struct);
    this.setAttribute('type', 'Crescendo');

    // Whether the object is a decrescendo
    this.decrescendo = false;

    // The staff line to be placed on
    this.line = note_struct.line || 0;

    // The height at the open end of the cresc/decresc
    this.height = 15;
  }

  // Set the line to center the element on
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  // Set the full height at the open end
  setHeight(height: number): this {
    this.height = height;
    return this;
  }

  // Set whether the sign should be a descresendo by passing a bool
  // to `decresc`
  setDecrescendo(decresc: boolean): this {
    this.decrescendo = decresc;
    return this;
  }

  // Preformat the note
  preFormat(): this {
    this.preFormatted = true;
    return this;
  }

  // Render the Crescendo object onto the canvas
  draw(): void {
    const ctx = this.checkContext();
    const stave = this.checkStave();
    this.setRendered();

    const tick_context = this.getTickContext();
    const next_context = TickContext.getNextContext(tick_context);

    const begin_x = this.getAbsoluteX();
    const end_x = next_context ? next_context.getX() : stave.getX() + stave.getWidth();
    const y = stave.getYForLine(this.line + -3) + 1;

    L('Drawing ', this.decrescendo ? 'decrescendo ' : 'crescendo ', this.height, 'x', begin_x - end_x);

    renderHairpin(ctx, {
      begin_x: begin_x - this.options.extend_left,
      end_x: end_x + this.options.extend_right,
      y: y + this.options.y_shift,
      height: this.height,
      reverse: this.decrescendo,
    });
  }
}
