// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TickContext Mocks

import { Fraction } from '../src/fraction';
import { NoteMetrics } from '../src/note';
import { Stave } from '../src/stave';
import { Tickable } from '../src/tickable';
import { TickContext } from '../src/tickcontext';
import { Voice } from '../src/voice';

class MockTickable extends Tickable {
  tickContext?: TickContext;
  ticks: Fraction = new Fraction(1, 1);
  voice?: Voice;
  stave?: Stave;
  width: number = 0;
  ignore_ticks: boolean = false;

  init(): void {
    // DO NOTHING.
  }

  getX(): number {
    // eslint-disable-next-line
    return this.tickContext!.getX();
  }

  getIntrinsicTicks(): number {
    return this.ticks.value();
  }

  getTicks(): Fraction {
    return this.ticks;
  }

  setTicks(t: number): this {
    this.ticks = new Fraction(t, 1);
    return this;
  }

  // Called by TickContext.preFormat().
  getMetrics(): NoteMetrics {
    return {
      width: 0,
      glyphWidth: 0,
      notePx: this.width,
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

  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  getStave(): Stave | undefined {
    return this.stave;
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
    // DO NOTHING.
  }

  // eslint-disable-next-line
  draw(...args: any[]): void {
    // DO NOTHING.
  }
}

export { MockTickable };
