// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// The tickable interface. Tickables are things that sit on a score and
// have a duration, i.e., they occupy space in the musical rendering dimension.

import { RuntimeError } from './util';
import { Element } from './element';
import { Flow } from './tables';
import { Fraction } from './fraction';
import { TickContext } from './tickcontext';
import { ModifierContext } from './modifiercontext';
import { Tuplet } from './tuplet';
import { Voice } from './voice';
import { Modifier } from './modifier';

//** Spacing */
export interface Space {
  used: number;
  mean: number;
  deviation: number;
}

/** Formatter metrics interface */
export interface FormatterMetrics {
  duration: string;
  freedom: {
    left: number;
    right: number;
  };
  iterations: number;
  space: Space;
}

/**
 * Tickable represents a element that sit on a score and
 * has a duration, i.e., Tickables occupy space in the musical rendering dimension.
 */
export abstract class Tickable extends Element {
  protected ignore_ticks: boolean;
  tupletStack: Tuplet[];
  protected tuplet?: Tuplet;
  protected ticks: Fraction;
  protected center_x_shift: number;
  protected voice?: Voice;
  protected width: number;
  protected x_shift: number;
  protected preFormatted: boolean;
  protected postFormatted: boolean;
  protected modifierContext?: ModifierContext;
  protected tickContext?: TickContext;
  protected modifiers: Modifier[];
  protected tickMultiplier: Fraction;
  protected formatterMetrics: FormatterMetrics;
  protected intrinsicTicks: number;
  protected align_center: boolean;

  /** Constructor */
  constructor() {
    super();
    this.setAttribute('type', 'Tickable');

    // These properties represent the duration of
    // this tickable element.
    this.ticks = new Fraction(0, 1); // Fractional value of ticks
    this.intrinsicTicks = 0; // Floating point value of ticks
    this.tickMultiplier = new Fraction(1, 1);

    // Formatter metrics
    this.width = 0;
    this.x_shift = 0; // Shift from tick context

    this.modifiers = [];
    this.preFormatted = false;
    this.postFormatted = false;
    this.tupletStack = [];

    this.align_center = false;
    this.center_x_shift = 0; // Shift from tick context if center aligned

    // This flag tells the formatter to ignore this tickable during
    // formatting and justification. It is set by tickables such as BarNote.
    this.ignore_ticks = false;

    // This is a space for an external formatting class or function to maintain
    // metrics.
    this.formatterMetrics = {
      // The freedom of a tickable is the distance it can move without colliding
      // with neighboring elements. A formatter can set these values during its
      // formatting pass, which a different formatter can then use to fine tune.
      freedom: { left: 0, right: 0 },

      // The simplified rational duration of this tick as a string. It can be
      // used as an index to a map or hashtable.
      duration: '',

      // The number of formatting iterations undergone.
      iterations: 0,

      // The space in pixels allocated by this formatter, along with the mean space
      // for tickables of this duration, and the deviation from the mean.
      space: {
        used: 0,
        mean: 0,
        deviation: 0,
      },
    };
  }

  /** Resets the Tickable, this function will be overloaded. */
  reset(): this {
    return this;
  }

  /** Returns the ticks. */
  getTicks(): Fraction {
    return this.ticks;
  }

  /** Checks if it ignores the ticks. */
  shouldIgnoreTicks(): boolean {
    return this.ignore_ticks;
  }

  setIgnoreTicks(flag: boolean): void {
    this.ignore_ticks = flag;
  }

  /** Sets width of note. Used by the formatter for positioning. */
  setWidth(width: number): void {
    this.width = width;
  }

  /** Gets width of note. Used by the formatter for positioning. */
  getWidth(): number {
    if (!this.preFormatted) {
      throw new RuntimeError('UnformattedNote', "Can't call GetWidth on an unformatted note.");
    }

    return this.width + (this.modifierContext ? this.modifierContext.getWidth() : 0);
  }

  /** Displaces note by `x` pixels. Used by the formatter. */
  setXShift(x: number): this {
    this.x_shift = x;
    return this;
  }

  /** Gets the `x`pixels of the note. */
  getXShift(): number {
    return this.x_shift;
  }

  /** Gets `X` position of this tick context. */
  getX(): number {
    if (!this.tickContext) {
      throw new RuntimeError('NoTickContext', 'Note needs a TickContext assigned for an X-Value');
    }

    return this.tickContext.getX() + this.x_shift;
  }

  /** Returns the formatterMetrics */
  getFormatterMetrics(): FormatterMetrics {
    return this.formatterMetrics;
  }

  /** Returns the center x shift. */
  getCenterXShift(): number {
    if (this.isCenterAligned()) {
      return this.center_x_shift;
    }

    return 0;
  }

  /** Sets the center x shift. */
  setCenterXShift(centerXShift: number): this {
    this.center_x_shift = centerXShift;
    return this;
  }

  // Checks if tickable is center aligned. */
  isCenterAligned(): boolean {
    return this.align_center;
  }

  // Sets/unsets center alignment. */
  setCenterAlignment(align_center: boolean): this {
    this.align_center = align_center;
    return this;
  }

  /**
   * Returns the associated voice. Every tickable must be associated with a voice.
   * This allows formatters and preFormatter to associate them with the right modifierContexts.
   */
  getVoice(): Voice {
    if (!this.voice) throw new RuntimeError('NoVoice', 'Tickable has no voice.');
    return this.voice;
  }

  /** Sets the associated voice. */
  setVoice(voice: Voice): void {
    this.voice = voice;
  }

  /** Gets the tuplet */
  getTuplet(): Tuplet | undefined {
    return this.tuplet;
  }

  /*
   * Resets the specific Tuplet if this is not provided, all tuplets are reset.
   * Removes any prior tuplets from the tick calculation and
   * resets the intrinsic tick value to
   */
  resetTuplet(tuplet?: Tuplet): this {
    let noteCount;
    let notesOccupied;
    if (tuplet) {
      const i = this.tupletStack.indexOf(tuplet);
      if (i !== -1) {
        this.tupletStack.splice(i, 1);
        noteCount = tuplet.getNoteCount();
        notesOccupied = tuplet.getNotesOccupied();

        // Revert old multiplier by inverting numerator & denom.:
        this.applyTickMultiplier(noteCount, notesOccupied);
      }
      return this;
    }

    while (this.tupletStack.length) {
      tuplet = this.tupletStack.pop() as Tuplet;
      noteCount = tuplet.getNoteCount();
      notesOccupied = tuplet.getNotesOccupied();

      // Revert old multiplier by inverting numerator & denom.:
      this.applyTickMultiplier(noteCount, notesOccupied);
    }
    return this;
  }

  /** Attaches to new tuplet. */
  setTuplet(tuplet: Tuplet): this {
    if (tuplet) {
      this.tupletStack.push(tuplet);

      const noteCount = tuplet.getNoteCount();
      const notesOccupied = tuplet.getNotesOccupied();

      this.applyTickMultiplier(notesOccupied, noteCount);
    }

    this.tuplet = tuplet;

    return this;
  }

  /** Optional, if tickable has modifiers, sets modifierContext. */
  addToModifierContext(mc: ModifierContext): void {
    this.modifierContext = mc;
    // Add modifiers to modifier context (if any)
    this.preFormatted = false;
  }

  /** Optional, if tickable has modifiers, associates a Modifier. */
  addModifier(mod: Modifier): this {
    this.modifiers.push(mod);
    this.preFormatted = false;
    return this;
  }

  /** Gets the list of associated modifiers. */
  getModifiers(): Modifier[] {
    return this.modifiers;
  }

  /** Sets the Tick Contxt. */
  setTickContext(tc: TickContext): void {
    this.tickContext = tc;
    this.preFormatted = false;
  }

  /** Preformats the Tickable. */
  preFormat(): void {
    if (this.preFormatted) return;

    this.width = 0;
    if (this.modifierContext) {
      this.modifierContext.preFormat();
      this.width += this.modifierContext.getWidth();
    }
  }

  /** Postformats the Tickable. */
  postFormat(): this {
    if (this.postFormatted) return this;
    this.postFormatted = true;
    return this;
  }

  /** Returns the intrinsic ticks */
  getIntrinsicTicks(): number {
    return this.intrinsicTicks;
  }

  /** Sets the intrinsic ticks. */
  setIntrinsicTicks(intrinsicTicks: number): void {
    this.intrinsicTicks = intrinsicTicks;
    this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
  }

  /** Gets the tick multiplier. */
  getTickMultiplier(): Fraction {
    return this.tickMultiplier;
  }

  /** Applies a tick multiplier. */
  applyTickMultiplier(numerator: number, denominator: number): void {
    this.tickMultiplier.multiply(numerator, denominator);
    this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
  }

  /** Sets the duration. */
  setDuration(duration: Fraction): void {
    const ticks = duration.numerator * (Flow.RESOLUTION / duration.denominator);
    this.ticks = this.tickMultiplier.clone().multiply(ticks);
    this.intrinsicTicks = this.ticks.value();
  }
}
