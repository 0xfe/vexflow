// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { RuntimeError } from './util';
import { Element } from './element';
import { ModifierContext } from './modifiercontext';
import { Note } from './note';

export enum ModifierPosition {
  CENTER = 0,
  LEFT = 1,
  RIGHT = 2,
  ABOVE = 3,
  BELOW = 4,
}

// To enable logging for this class. Set `Vex.Flow.Modifier.DEBUG` to `true`.
// function L(...args) { if (Modifier.DEBUG) log('Vex.Flow.Modifier', args); }

/**
 * `Modifier` is an abstract interface for notational elements that modify
 * a `Note`. Examples of modifiers are `Accidental`, `Annotation`, `Stroke`, etc.
 *
 * For a `Modifier` instance to be positioned correctly, it must be part of
 * a `ModifierContext`. All modifiers in the same context are rendered relative to
 * one another.
 *
 * Typically, all modifiers to a note are part of the same `ModifierContext` instance. Also,
 * in multi-voice staves, all modifiers to notes on the same `tick` are part of the same
 * `ModifierContext`. This ensures that multiple voices don't trample all over each other.
 */
export class Modifier extends Element {
  // Modifiers are attached to a note and an index. An index is a specific head in a chord.
  protected note?: Note;
  protected index?: number;

  protected width: number;
  protected text_line: number;
  protected position: ModifierPosition;
  protected y_shift: number;
  protected x_shift: number;

  private spacingFromNextModifier: number;
  private modifier_context?: ModifierContext;

  /** Modifiers category string. */
  static get CATEGORY(): string {
    return 'none';
  }

  /** Modifiers can be positioned almost anywhere, relative to a note. */
  static get Position(): typeof ModifierPosition {
    return ModifierPosition;
  }

  static get PositionString(): Record<string, number> {
    return {
      center: Modifier.Position.CENTER,
      above: Modifier.Position.ABOVE,
      below: Modifier.Position.BELOW,
      left: Modifier.Position.LEFT,
      right: Modifier.Position.RIGHT,
    };
  }

  constructor() {
    super();
    this.setAttribute('type', 'Modifier');

    this.width = 0;

    // The `text_line` is reserved space above or below a stave.
    this.text_line = 0;
    this.position = Modifier.Position.LEFT;
    this.x_shift = 0;
    this.y_shift = 0;
    this.spacingFromNextModifier = 0;
  }

  /** Called when position changes. */
  protected reset(): void {
    // do nothing
  }

  /**
   * Every modifier has a category. The `ModifierContext` uses this to determine
   * the type and order of the modifiers.
   */
  getCategory(): string {
    return Modifier.CATEGORY;
  }

  /** Get modifier widths. */
  getWidth(): number {
    return this.width;
  }

  /** Set modifier widths. */
  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  /** Get attached note (`StaveNote`, `TabNote`, etc.) */
  getNote(): Note {
    if (!this.note) throw new RuntimeError('NoNote', 'Modifier has no note.');
    return this.note;
  }

  /** Check and get attached note (`StaveNote`, `TabNote`, etc.) */
  checkAttachedNote(): Note {
    if (!this.note || this.index === undefined) {
      throw new RuntimeError('NoAttachedNote', `Can't draw ${this.getCategory()} without a note and index.`);
    }
    return this.note;
  }

  /**
   * Set attached note.
   * @param note (`StaveNote`, `TabNote`, etc.)
   */
  setNote(note: Note): this {
    this.note = note;
    return this;
  }

  /** Get note index, which is a specific note in a chord. */
  getIndex(): number | undefined {
    return this.index;
  }

  /** Check and get note index, which is a specific note in a chord. */
  checkIndex(): number {
    if (this.index === undefined) {
      throw new RuntimeError('NoIndex', 'Modifier has an invalid index.');
    }
    return this.index;
  }

  /** Set note index, which is a specific note in a chord. */
  setIndex(index: number): this {
    this.index = index;
    return this;
  }

  /** Get `ModifierContext`. */
  getModifierContext(): ModifierContext | undefined {
    return this.modifier_context;
  }

  /** Check and get `ModifierContext`. */
  checkModifierContext(): ModifierContext {
    if (!this.modifier_context) throw new RuntimeError('NoModifierContext', 'Modifier Context Required');
    return this.modifier_context;
  }

  /** Every modifier must be part of a `ModifierContext`. */
  setModifierContext(c: ModifierContext): this {
    this.modifier_context = c;
    return this;
  }

  /** Get position. */
  getPosition(): number {
    return this.position;
  }

  /**
   * Set position.
   * @param position CENTER | LEFT | RIGHT | ABOVE | BELOW
   */
  setPosition(position: string | number): this {
    this.position = typeof position === 'string' ? Modifier.PositionString[position] : position;
    this.reset();
    return this;
  }

  /** Set the `text_line` for the modifier. */
  setTextLine(line: number): this {
    this.text_line = line;
    return this;
  }

  /** Shift modifier down `y` pixels. Negative values shift up. */
  setYShift(y: number): this {
    this.y_shift = y;
    return this;
  }

  /** Set spacing from next modifier. */
  setSpacingFromNextModifier(x: number): void {
    this.spacingFromNextModifier = x;
  }

  /** Get spacing from next modifier. */
  getSpacingFromNextModifier(): number {
    return this.spacingFromNextModifier;
  }

  /**
   * Shift modifier `x` pixels in the direction of the modifier. Negative values
   * shift reverse.
   */
  setXShift(x: number): this {
    this.x_shift = 0;
    if (this.position === Modifier.Position.LEFT) {
      this.x_shift -= x;
    } else {
      this.x_shift += x;
    }
    return this;
  }

  /** Get shitf modifier `x` */
  getXShift(): number {
    return this.x_shift;
  }

  /** Render the modifier onto the canvas. */
  draw(): void {
    this.checkContext();
    throw new RuntimeError('MethodNotImplemented', 'draw() not implemented for this modifier.');
  }

  // aligns sub notes of NoteSubGroup (or GraceNoteGroup) to the main note with correct x-offset
  alignSubNotesWithNote(subNotes: Note[], note: Note): void {
    // Shift over the tick contexts of each note
    const tickContext = note.getTickContext();
    const metrics = tickContext.getMetrics();
    const stave = note.getStave();
    const subNoteXOffset =
      tickContext.getX() - metrics.modLeftPx - metrics.modRightPx + this.getSpacingFromNextModifier();

    subNotes.forEach((subNote) => {
      const subTickContext = subNote.getTickContext();
      if (stave) subNote.setStave(stave);
      subTickContext.setXOffset(subNoteXOffset); // don't touch baseX to avoid shift each render
    });
  }
}
