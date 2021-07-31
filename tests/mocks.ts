// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TickContext Mocks

/* eslint-disable */
// @ts-nocheck

import { Fraction } from 'fraction';
import { TickContext } from 'tickcontext';
import { Voice } from 'voice';

class MockTickable {
  tickContext: TickContext;
  ticks: Fraction;
  voice: Voice;
  width: number = 0;
  ignore_ticks: boolean = false;

  // TODO: this constructor takes 0 arguments, but other tests pass in a Flow.TIME4_4.
  constructor() {
    // DO NOTHING
  }

  init(): void {
    // DO NOTHING
  }

  getX(): number {
    return this.tickContext.getX();
  }

  getIntrinsicTicks(): Fraction {
    return this.ticks;
  }

  getTicks(): Fraction {
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

  setWidth(w: number): this {
    this.width = w;
    return this;
  }

  setVoice(v: Voice): this {
    this.voice = v;
    return this;
  }

  setStave(stave: any): this {
    this.stave = stave;
    return this;
  }

  setTickContext(tc: TickContext): this {
    this.tickContext = tc;
    return this;
  }

  setIgnoreTicks(flag: boolean): this {
    this.ignore_ticks = flag;
    return this;
  }

  shouldIgnoreTicks(): boolean {
    return this.ignore_ticks;
  }

  preFormat(): void {
    // DO NOTHING
  }
}

export { MockTickable };
