// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This class by Raffaele Viglianti, 2012 http://itisnotsound.wordpress.com/
//
// This class implements hairpins between notes.
// Hairpins can be either Crescendo or Descrescendo.

import { Vex } from './vex';
import { Element } from './element';
import { Modifier } from './modifier';

export class StaveHairpin extends Element {
  static get type() {
    return {
      CRESC: 1,
      DECRESC: 2,
    };
  }

  /* Helper function to convert ticks into pixels.
   * Requires a Formatter with voices joined and formatted (to
   * get pixels per tick)
   *
   * options is struct that has:
   *
   *  {
   *   height: px,
   *   y_shift: px, //vertical offset
   *   left_shift_ticks: 0, //left horizontal offset expressed in ticks
   *   right_shift_ticks: 0 // right horizontal offset expressed in ticks
   *  }
   *
   **/
  static FormatByTicksAndDraw(ctx, formatter, notes, type, position, options) {
    const ppt = formatter.pixelsPerTick;

    if (ppt == null) {
      throw new Vex.RuntimeError('BadArguments', 'A valid Formatter must be provide to draw offsets by ticks.');
    }

    const l_shift_px = ppt * options.left_shift_ticks;
    const r_shift_px = ppt * options.right_shift_ticks;

    const hairpin_options = {
      height: options.height,
      y_shift: options.y_shift,
      left_shift_px: l_shift_px,
      right_shift_px: r_shift_px,
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
   * @constructor
   * @param {!Object} notes The notes to tie up.
   * @param {!Object} type The type of hairpin
   */
  constructor(notes, type) {
    /**
     * Notes is a struct that has:
     *
     *  {
     *    first_note: Note,
     *    last_note: Note,
     *  }
     *
     **/
    super();
    this.setAttribute('type', 'StaveHairpin');
    this.notes = notes;
    this.hairpin = type;
    this.position = Modifier.Position.BELOW;

    this.render_options = {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    };

    this.setNotes(notes);
  }

  setPosition(position) {
    if (position === Modifier.Position.ABOVE || position === Modifier.Position.BELOW) {
      this.position = position;
    }
    return this;
  }

  setRenderOptions(options) {
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
  setNotes(notes) {
    if (!notes.first_note && !notes.last_note) {
      throw new Vex.RuntimeError('BadArguments', 'Hairpin needs to have either first_note or last_note set.');
    }

    // Success. Lets grab 'em notes.
    this.first_note = notes.first_note;
    this.last_note = notes.last_note;
    return this;
  }

  renderHairpin(params) {
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

  draw() {
    this.checkContext();
    this.setRendered();

    const firstNote = this.first_note;
    const lastNote = this.last_note;

    const start = firstNote.getModifierStartXY(this.position, 0);
    const end = lastNote.getModifierStartXY(this.position, 0);

    this.renderHairpin({
      first_x: start.x,
      last_x: end.x,
      first_y: firstNote.getStave().y + firstNote.getStave().height,
      last_y: lastNote.getStave().y + lastNote.getStave().height,
      staff_height: firstNote.getStave().height,
    });
    return true;
  }
}
