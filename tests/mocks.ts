// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TickContext Mocks

/* eslint-disable */
// @ts-nocheck

import { Fraction } from 'fraction';

class MockTickable {
  ignore_ticks: boolean;
  tickContext: any;
  ticks: any;
  width: number;

  // TODO: this constructor takes 0 arguments, but other tests pass in a Flow.TIME4_4.
  constructor() {
    this.ignore_ticks = false;
  }

  init(): void {
    // DO NOTHING
  }

  getX() {
    return this.tickContext.getX();
  }

  getIntrinsicTicks() {
    return this.ticks;
  }

  getTicks() {
    return this.ticks;
  }

  setTicks(t: number): this {
    this.ticks = new Fraction(t, 1);
    return this;
  }

  getMetrics(): any {
    return {
      width: 0,
      glyphWidth: 0,
      notePx: this.width,
      left_shift: 0,
      modLeftPx: 0,
      modRightPx: 0,
      leftDisplacedHeadPx: 0,
      rightDisplacedHeadPx: 0,
      glyphPx: 0,
    };
  }

  getWidth(): number {
    return this.width;
  }

  setWidth(w: number): void {
    this.width = w;
    return this;
  }

  setVoice(v) {
    this.voice = v;
    return this;
  }

  setStave(stave) {
    this.stave = stave;
    return this;
  }

  setTickContext(tc) {
    this.tickContext = tc;
    return this;
  }

  setIgnoreTicks(ignore_ticks) {
    this.ignore_ticks = ignore_ticks;
    return this;
  }

  shouldIgnoreTicks() {
    return this.ignore_ticks;
  }

  preFormat(): void {
    // DO NOTHING
  }
}

export { MockTickable };
