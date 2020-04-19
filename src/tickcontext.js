// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A formatter for abstract tickable objects, such as notes, chords,
// tabs, etc.

import { Vex } from './vex';
import { Tickable } from './tickable';
import { Fraction } from './fraction';

export class TickContext extends Tickable {
  static getNextContext(tContext) {
    const contexts = tContext.tContexts;
    const index = contexts.indexOf(tContext);

    return contexts[index + 1];
  }

  constructor(options) {
    super();
    this.tickID = options && options.tickID;
    this.setAttribute('type', 'TickContext');
    this.currentTick = new Fraction(0, 1);

    this.maxTicks = new Fraction(0, 1);
    this.maxTickable = null; // Biggest tickable
    this.minTicks = null; // this can remian null if all tickables have ignore_ticks
    this.minTickable = null;

    this.padding = 1;     // padding on each side (width += padding * 2)
    this.x = 0;
    this.xBase = 0;        // base x position without xOffset
    this.xOffset = 0;      // xBase and xOffset are an alternative way to describe x (x = xB + xO)
    this.tickables = [];   // Notes, tabs, chords, lyrics.
    this.tickablesByVoice = {};   // Tickables indeced by voice number

    // Formatting metrics
    this.notePx = 0;       // width of widest note in this context
    this.glyphPx = 0;       // width of glyph (note head)
    this.leftDisplacedHeadPx = 0;  // Extra left pixels for displaced notes
    this.rightDisplacedHeadPx = 0; // Extra right pixels for displaced notes
    this.modLeftPx = 0; // Left modifier pixels
    this.modRightPx = 0; // Right modifier pixels
    this.totalLeftPx = 0;  // Total left pixels
    this.totalRightPx = 0; // Total right pixels
    this.tContexts = [];   // Parent array of tick contexts
  }

  getTickID() { return this.tickID; }
  getX() { return this.x; }
  setX(x) { this.x = x; this.xBase = x; this.xOffset = 0; return this; }
  getXBase() { return this.xBase; } // use of xBase and xOffset is optional, avoids offset creep
  setXBase(xBase) { this.xBase = xBase; this.x = xBase + this.xOffset; }
  getXOffset() { return this.xOffset; }
  setXOffset(xOffset) { this.xOffset = xOffset; this.x = this.xBase + xOffset; }
  getWidth() { return this.width + (this.padding * 2); }
  setPadding(padding) { this.padding = padding; return this; }
  getMaxTicks() { return this.maxTicks; }
  getMinTicks() { return this.minTicks; }
  getMaxTickable() { return this.maxTickable; }
  getMinTickable() { return this.minTickable; }
  getTickables() { return this.tickables; }
  getTickablesForVoice(voiceIndex) { return this.tickablesByVoice[voiceIndex]; }
  getTickablesByVoice() { return this.tickablesByVoice; }

  getCenterAlignedTickables() {
    return this.tickables.filter(tickable => tickable.isCenterAligned());
  }

  // Get widths context, note and left/right modifiers for formatting
  getMetrics() {
    const { width, glyphPx, notePx, leftDisplacedHeadPx, rightDisplacedHeadPx, modLeftPx, modRightPx, totalLeftPx, totalRightPx } = this;
    return {
      width, // Width of largest tickable in context
      glyphPx, // Width of largest glyph (note head)
      notePx, // Width of notehead + stem
      leftDisplacedHeadPx, // Left modifiers
      rightDisplacedHeadPx, // Right modifiers
      modLeftPx,
      modRightPx,
      totalLeftPx,
      totalRightPx
    };
  }

  getCurrentTick() { return this.currentTick; }
  setCurrentTick(tick) {
    this.currentTick = tick;
    this.preFormatted = false;
  }

  addTickable(tickable, voiceIndex) {
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
    this.tickablesByVoice[voiceIndex] = tickable;
    this.preFormatted = false;
    return this;
  }

  preFormat() {
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

  postFormat() {
    if (this.postFormatted) return this;
    this.postFormatted = true;
    return this;
  }
}
