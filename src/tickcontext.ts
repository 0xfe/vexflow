// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A formatter for abstract tickable objects, such as notes, chords,
// tabs, etc.

import { Fraction } from './fraction';
import { NoteMetrics } from './note';
import { Tickable } from './tickable';
import { RuntimeError } from './util';

export interface TickContextMetrics extends NoteMetrics {
  totalLeftPx: number;
  totalRightPx: number;
}

export interface TickContextOptions {
  tickID: number;
}

/**
 * TickContext formats abstract tickable objects, such as notes, chords, tabs, etc.
 */
export class TickContext {
  protected readonly tickID: number;
  protected readonly tickables: Tickable[];
  protected readonly tickablesByVoice: Record<string, Tickable>;
  protected currentTick: Fraction;
  protected maxTicks: Fraction;
  protected padding: number;
  protected xBase: number;
  protected x: number;
  protected xOffset: number;
  protected notePx: number;
  protected glyphPx: number;
  protected leftDisplacedHeadPx: number;
  protected rightDisplacedHeadPx: number;
  protected modLeftPx: number;
  protected modRightPx: number;
  protected totalLeftPx: number;
  protected totalRightPx: number;
  protected maxTickable?: Tickable;
  protected minTicks?: Fraction;
  protected minTickable?: Tickable;
  tContexts: TickContext[];

  protected preFormatted: boolean = false;
  protected postFormatted: boolean = false;
  protected width: number;
  protected formatterMetrics: { freedom: { left: number; right: number } };

  static getNextContext(tContext: TickContext): TickContext | undefined {
    const contexts = tContext.tContexts;
    const index = contexts.indexOf(tContext);

    if (index + 1 < contexts.length) return contexts[index + 1];
  }

  constructor(options?: TickContextOptions) {
    this.tickID = options && options.tickID ? options.tickID : 0;
    this.currentTick = new Fraction(0, 1);

    this.maxTicks = new Fraction(0, 1);
    this.maxTickable = undefined; // Biggest tickable
    this.minTicks = undefined; // this can remian null if all tickables have ignore_ticks
    this.minTickable = undefined;

    this.padding = 1; // padding on each side (width += padding * 2)
    this.x = 0;
    this.xBase = 0; // base x position without xOffset
    this.xOffset = 0; // xBase and xOffset are an alternative way to describe x (x = xB + xO)
    this.tickables = []; // Notes, tabs, chords, lyrics.
    this.tickablesByVoice = {}; // Tickables indexed by voice number

    // Formatting metrics
    this.notePx = 0; // width of widest note in this context
    this.glyphPx = 0; // width of glyph (note head)
    this.leftDisplacedHeadPx = 0; // Extra left pixels for displaced notes
    this.rightDisplacedHeadPx = 0; // Extra right pixels for displaced notes
    this.modLeftPx = 0; // Left modifier pixels
    this.modRightPx = 0; // Right modifier pixels
    this.totalLeftPx = 0; // Total left pixels
    this.totalRightPx = 0; // Total right pixels
    this.tContexts = []; // Parent array of tick contexts

    this.width = 0;
    this.formatterMetrics = {
      // The freedom of a tickcontext is the distance it can move without colliding
      // with neighboring elements. A formatter can set these values during its
      // formatting pass, which a different formatter can then use to fine tune.
      freedom: { left: 0, right: 0 },
    };
  }

  getTickID(): number {
    return this.tickID;
  }

  getX(): number {
    return this.x;
  }

  setX(x: number): this {
    this.x = x;
    this.xBase = x;
    this.xOffset = 0;
    return this;
  }

  getXBase(): number {
    return this.xBase;
  } // use of xBase and xOffset is optional, avoids offset creep

  setXBase(xBase: number): void {
    this.xBase = xBase;
    this.x = xBase + this.xOffset;
  }

  getXOffset(): number {
    return this.xOffset;
  }

  setXOffset(xOffset: number): void {
    this.xOffset = xOffset;
    this.x = this.xBase + xOffset;
  }

  getWidth(): number {
    return this.width + this.padding * 2;
  }

  setPadding(padding: number): this {
    this.padding = padding;
    return this;
  }

  getMaxTicks(): Fraction {
    return this.maxTicks;
  }

  getMinTicks(): Fraction | undefined {
    return this.minTicks;
  }

  getMaxTickable(): Tickable | undefined {
    return this.maxTickable;
  }

  getMinTickable(): Tickable | undefined {
    return this.minTickable;
  }

  getTickables(): Tickable[] {
    return this.tickables;
  }

  /**
   * Introduced on 2020-04-17 as getTickablesForVoice(voiceIndex).
   *   https://github.com/0xfe/vexflow/blame/dc97b0cc5bb93171c0038638c34362dc958222ca/src/tickcontext.js#L63
   * Renamed on 2021-08-05 to getTickableForVoice(voiceIndex). Method renamed to singular, since it returns one Tickable.
   */
  getTickableForVoice(voiceIndex: number): Tickable {
    return this.tickablesByVoice[voiceIndex];
  }

  getTickablesByVoice(): Record<string, Tickable> {
    return this.tickablesByVoice;
  }

  getCenterAlignedTickables(): Tickable[] {
    return this.tickables.filter((tickable) => tickable.isCenterAligned());
  }

  /** Gets widths context, note and left/right modifiers for formatting. */
  getMetrics(): TickContextMetrics {
    const {
      width,
      glyphPx,
      notePx,
      leftDisplacedHeadPx,
      rightDisplacedHeadPx,
      modLeftPx,
      modRightPx,
      totalLeftPx,
      totalRightPx,
    } = this;
    return {
      width, // Width of largest tickable in context
      glyphPx, // Width of largest glyph (note head)
      notePx, // Width of notehead + stem
      leftDisplacedHeadPx, // Left modifiers
      rightDisplacedHeadPx, // Right modifiers
      modLeftPx,
      modRightPx,
      totalLeftPx,
      totalRightPx,
    };
  }

  getCurrentTick(): Fraction {
    return this.currentTick;
  }

  setCurrentTick(tick: Fraction): void {
    this.currentTick = tick;
    this.preFormatted = false;
  }

  addTickable(tickable: Tickable, voiceIndex?: number): this {
    if (!tickable) {
      throw new RuntimeError('BadArgument', 'Invalid tickable added.');
    }

    if (!tickable.shouldIgnoreTicks()) {
      const ticks = tickable.getTicks();

      if (ticks.greaterThan(this.maxTicks)) {
        this.maxTicks = ticks.clone();
        this.maxTickable = tickable;
      }

      if (this.minTicks == null) {
        this.minTicks = ticks.clone();
        this.minTickable = tickable;
      } else if (ticks.lessThan(this.minTicks)) {
        this.minTicks = ticks.clone();
        this.minTickable = tickable;
      }
    }

    tickable.setTickContext(this);
    this.tickables.push(tickable);
    this.tickablesByVoice[voiceIndex || 0] = tickable;
    this.preFormatted = false;
    return this;
  }

  preFormat(): this {
    if (this.preFormatted) return this;

    for (let i = 0; i < this.tickables.length; ++i) {
      const tickable = this.tickables[i];
      tickable.preFormat();
      const metrics = tickable.getMetrics();

      // Maintain max displaced head pixels from all tickables in the context
      this.leftDisplacedHeadPx = Math.max(this.leftDisplacedHeadPx, metrics.leftDisplacedHeadPx);
      this.rightDisplacedHeadPx = Math.max(this.rightDisplacedHeadPx, metrics.rightDisplacedHeadPx);

      // Maintain the widest note for all tickables in the context
      this.notePx = Math.max(this.notePx, metrics.notePx);

      // Maintain the widest note head
      this.glyphPx = Math.max(this.glyphPx, metrics.glyphWidth || 0);

      // Total modifier shift
      this.modLeftPx = Math.max(this.modLeftPx, metrics.modLeftPx);
      this.modRightPx = Math.max(this.modRightPx, metrics.modRightPx);

      // Total shift
      this.totalLeftPx = Math.max(this.totalLeftPx, metrics.modLeftPx + metrics.leftDisplacedHeadPx);
      this.totalRightPx = Math.max(this.totalRightPx, metrics.modRightPx + metrics.rightDisplacedHeadPx);

      // Recalculate the tick context total width
      this.width = this.notePx + this.totalLeftPx + this.totalRightPx;
    }

    return this;
  }

  postFormat(): this {
    if (this.postFormatted) return this;
    this.postFormatted = true;
    return this;
  }

  getFormatterMetrics(): { freedom: { left: number; right: number } } {
    return this.formatterMetrics;
  }
}
