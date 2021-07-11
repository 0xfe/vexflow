// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { log } from './util';
import { Note } from './note';
import { Barline, BarlineType } from './stavebarline';

function L(
  // eslint-disable-next-line
  ...args: any[]) {
  if (BarNote.DEBUG) log('Vex.Flow.BarNote', args);
}

/**
 * A `BarNote` is used to render bar lines (from `barline.ts`). `BarNote`s can
 * be added to a voice and rendered in the middle of a stave. Since it has no
 * duration, it consumes no `tick`s, and is dealt with appropriately by the formatter.
 *
 * See `tests/barnote_tests.js` for usage examples.
 */
export class BarNote extends Note {
  protected metrics: { widths: Record<string, number> };
  /** To enable logging for this class. Set `Vex.Flow.BarNote.DEBUG` to `true`. */
  static DEBUG: boolean;
  protected type!: BarlineType;

  constructor(type = BarlineType.SINGLE) {
    super({ duration: 'b' });
    this.setAttribute('type', 'BarNote');

    this.metrics = {
      widths: {},
    };

    const TYPE = BarlineType;
    this.metrics.widths = {
      [TYPE.SINGLE]: 8,
      [TYPE.DOUBLE]: 12,
      [TYPE.END]: 15,
      [TYPE.REPEAT_BEGIN]: 14,
      [TYPE.REPEAT_END]: 14,
      [TYPE.REPEAT_BOTH]: 18,
      [TYPE.NONE]: 0,
    };

    // Tell the formatter that bar notes have no duration.
    this.ignore_ticks = true;
    this.setType(type);
  }

  /** Get the type of bar note.*/
  getType(): BarlineType {
    return this.type;
  }

  /** Set the type of bar note. */
  setType(type: string | BarlineType): this {
    this.type = typeof type === 'string' ? Barline.typeString[type] : type;

    // Set width to width of relevant `Barline`.
    this.setWidth(this.metrics.widths[this.type]);
    return this;
  }

  /** overridden to ignore. */
  addToModifierContext(): this {
    return this;
  }

  /** overridden to ignore. */
  preFormat(): this {
    this.setPreFormatted(true);
    return this;
  }

  /** Render note to stave. */
  draw(): void {
    const ctx = this.checkContext();
    L('Rendering bar line at: ', this.getAbsoluteX());
    if (this.style) this.applyStyle(ctx);
    const barline = new Barline(this.type);
    barline.setX(this.getAbsoluteX());
    barline.draw(this.checkStave());
    if (this.style) this.restoreStyle(ctx);
    this.setRendered();
  }
}
