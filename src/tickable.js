// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// The tickable interface. Tickables are things that sit on a score and
// have a duration, i.e., they occupy space in the musical rendering dimension.

import { Vex } from './vex';
import { Flow } from './tables';
import { Fraction } from './fraction';

export class Tickable {
  constructor() {
    this.intrinsicTicks = 0;
    this.tickMultiplier = new Fraction(1, 1);
    this.ticks = new Fraction(0, 1);
    this.width = 0;
    this.x_shift = 0; // Shift from tick context
    this.voice = null;
    this.tickContext = null;
    this.modifierContext = null;
    this.modifiers = [];
    this.preFormatted = false;
    this.postFormatted = false;
    this.tuplet = null;
    this.tupletStack = [];

    // For interactivity
    this.id = null;
    this.elem = null;

    this.align_center = false;
    this.center_x_shift = 0; // Shift from tick context if center aligned

    // This flag tells the formatter to ignore this tickable during
    // formatting and justification. It is set by tickables such as BarNote.
    this.ignore_ticks = false;
    this.context = null;
  }
  setContext(context) { this.context = context; }

  // Set the DOM ID of the element. Must be called before draw(). TODO: Update
  // ID of element if has already been rendered.
  setId(id) { this.id = id; }
  getId() { return this.id; }
  getElem() { return this.elem; }
  getBoundingBox() { return null; }
  getTicks() { return this.ticks; }
  shouldIgnoreTicks() { return this.ignore_ticks; }
  getWidth() { return this.width; }
  setXShift(x) { this.x_shift = x; }
  getCenterXShift() {
    if (this.isCenterAligned()) {
      return this.center_x_shift;
    }

    return 0;
  }
  isCenterAligned() { return this.align_center; }
  setCenterAlignment(align_center) {
    this.align_center = align_center;
    return this;
  }

  // Every tickable must be associated with a voice. This allows formatters
  // and preFormatter to associate them with the right modifierContexts.
  getVoice() {
    if (!this.voice) throw new Vex.RERR('NoVoice', 'Tickable has no voice.');
    return this.voice;
  }
  setVoice(voice) { this.voice = voice; }
  getTuplet() { return this.tuplet; }

  /*
   * resetTuplet
   * @param tuplet -- the specific tuplet to reset
   *   if this is not provided, all tuplets are reset.
   * @returns this
   *
   * Removes any prior tuplets from the tick calculation and
   * resets the intrinsic tick value to
   */
  resetTuplet(tuplet) {
    let noteCount, notesOccupied;
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
      tuplet = this.tupletStack.pop();
      noteCount = tuplet.getNoteCount();
      notesOccupied = tuplet.getNotesOccupied();

      // Revert old multiplier by inverting numerator & denom.:
      this.applyTickMultiplier(noteCount, notesOccupied);
    }
    return this;
  }
  setTuplet(tuplet) {
    // Attach to new tuplet

    if (tuplet) {
      this.tupletStack.push(tuplet);

      const noteCount = tuplet.getNoteCount();
      const notesOccupied = tuplet.getNotesOccupied();

      this.applyTickMultiplier(notesOccupied, noteCount);
    }

    this.tuplet = tuplet;

    return this;
  }

  /** optional, if tickable has modifiers **/
  addToModifierContext(mc) {
    this.modifierContext = mc;
    // Add modifiers to modifier context (if any)
    this.preFormatted = false;
  }

  /** optional, if tickable has modifiers **/
  addModifier(mod) {
    this.modifiers.push(mod);
    this.preFormatted = false;
    return this;
  }
  setTickContext(tc) {
    this.tickContext = tc;
    this.preFormatted = false;
  }
  preFormat() {
    if (this.preFormatted) return;

    this.width = 0;
    if (this.modifierContext) {
      this.modifierContext.preFormat();
      this.width += this.modifierContext.getWidth();
    }
  }
  postFormat() {
    if (this.postFormatted) return;
    this.postFormatted = true;
    return this;
  }
  getIntrinsicTicks() {
    return this.intrinsicTicks;
  }
  setIntrinsicTicks(intrinsicTicks) {
    this.intrinsicTicks = intrinsicTicks;
    this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
  }
  getTickMultiplier() {
    return this.tickMultiplier;
  }
  applyTickMultiplier(numerator, denominator) {
    this.tickMultiplier.multiply(numerator, denominator);
    this.ticks = this.tickMultiplier.clone().multiply(this.intrinsicTicks);
  }
  setDuration(duration) {
    const ticks = duration.numerator * (Flow.RESOLUTION / duration.denominator);
    this.ticks = this.tickMultiplier.clone().multiply(ticks);
    this.intrinsicTicks = this.ticks.value();
  }
}
