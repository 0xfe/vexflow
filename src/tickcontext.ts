// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A formatter for abstract tickable objects, such as notes, chords,
// tabs, etc.

import { Vex } from './vex';
import { Tickable } from './tickable';
import { Fraction } from './fraction';
import { Note } from './note';

export interface Metrics {
  totalLeftPx: number;
  totalRightPx: number;
  width: number;
  glyphWidth?: number;
  notePx: number;
  modLeftPx: number;
  modRightPx: number;
  leftDisplacedHeadPx: number;
  glyphPx: number;
  rightDisplacedHeadPx: number;
}

export interface TickContextOptions {
  tickID: number;
}

export class TickContext extends Tickable {
  private readonly tickID: number;
  private readonly tickables: Note[];
  private readonly tickablesByVoice: Record<string, Note>;
  private currentTick: Fraction;
  private maxTicks: Fraction;
  private padding: number;
  private xBase: number;
  private x: number;
  private xOffset: number;
  private notePx: number;
  private glyphPx: number;
  private leftDisplacedHeadPx: number;
  private rightDisplacedHeadPx: number;
  private modLeftPx: number;
  private modRightPx: number;
  private totalLeftPx: number;
  private totalRightPx: number;
  private maxTickable?: Note;
  private minTicks?: Fraction;
  private minTickable?: Note;
  tContexts: TickContext[];

  // eslint-disable-next-line
  draw() {}

  static getNextContext(tContext: TickContext): TickContext {
    const contexts = tContext.tContexts;
    const index = contexts.indexOf(tContext);

    return contexts[index + 1];
  }

  constructor(options?: TickContextOptions) {
    super();
    this.tickID = options && options.tickID ? options.tickID : 0;
    this.setAttribute('type', 'TickContext');
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
    this.tickablesByVoice = {}; // Tickables indeced by voice number

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

  getMaxTickable(): Note | undefined {
    return this.maxTickable;
  }

  getMinTickable(): Note | undefined {
    return this.minTickable;
  }

  getTickables(): Note[] {
    return this.tickables;
  }

  getTickablesForVoice(voiceIndex: number): Note {
    return this.tickablesByVoice[voiceIndex];
  }

  getTickablesByVoice(): Record<string, Note> {
    return this.tickablesByVoice;
  }

  getCenterAlignedTickables(): Note[] {
    return this.tickables.filter((tickable) => tickable.isCenterAligned());
  }

  // Get widths context, note and left/right modifiers for formatting
  getMetrics(): Metrics {
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

  addTickable(tickable: Note, voiceIndex?: number): this {
    if (!tickable) {
      throw new Vex.RERR('BadArgument', 'Invalid tickable added.');
    }

    if (!tickable.shouldIgnoreTicks()) {
      this.ignore_ticks = false;

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
      this.glyphPx = Math.max(this.glyphPx, metrics.glyphWidth);

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
}
