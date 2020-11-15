// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// `Modifier` is an abstract interface for notational elements that modify
// a `Note`. Examples of modifiers are `Accidental`, `Annotation`, `Stroke`, etc.
//
// For a `Modifier` instance to be positioned correctly, it must be part of
// a `ModifierContext`. All modifiers in the same context are rendered relative to
// one another.
//
// Typically, all modifiers to a note are part of the same `ModifierContext` instance. Also,
// in multi-voice staves, all modifiers to notes on the same `tick` are part of the same
// `ModifierContext`. This ensures that multiple voices don't trample all over each other.

import {Vex} from './vex';
import {Element} from './element';
import {ModifierContext} from "./modifiercontext";
import {Note} from "./note";
import {IStringTable} from "./types/common";

// To enable logging for this class. Set `Vex.Flow.Modifier.DEBUG` to `true`.
// function L(...args) { if (Modifier.DEBUG) Vex.L('Vex.Flow.Modifier', args); }

export class Modifier extends Element {
  public note: Note;

  protected width: number;
  protected text_line: number;
  protected position: number;
  protected y_shift: number;
  protected index: number;
  protected x_shift: number;

  private spacingFromNextModifier: number;
  private modifier_context: ModifierContext;

  static get CATEGORY() {
    return 'none';
  }

  // Modifiers can be positioned almost anywhere, relative to a note.
  static get Position() {
    return {
      CENTER: 0,
      LEFT: 1,
      RIGHT: 2,
      ABOVE: 3,
      BELOW: 4,
    };
  }

  static get PositionString() {
    return {
      above: Modifier.Position.ABOVE,
      below: Modifier.Position.BELOW,
      left: Modifier.Position.LEFT,
      right: Modifier.Position.RIGHT,
    } as IStringTable<number>;
  }

  constructor() {
    super();
    this.setAttribute('type', 'Modifier');

    this.width = 0;

    // Modifiers are attached to a note and an index. An index is a
    // specific head in a chord.
    this.note = null;
    this.index = null;

    // The `text_line` is reserved space above or below a stave.
    this.text_line = 0;
    this.position = Modifier.Position.LEFT;
    this.modifier_context = null;
    this.x_shift = 0;
    this.y_shift = 0;
    this.spacingFromNextModifier = 0;
  }

  // Called when position changes
  reset() {
    // do nothing
  }

  // Every modifier has a category. The `ModifierContext` uses this to determine
  // the type and order of the modifiers.
  getCategory() {
    return Modifier.CATEGORY;
  }

  // Get and set modifier widths.
  getWidth() {
    return this.width;
  }

  setWidth(width: number) {
    this.width = width;
    return this;
  }

  // Get and set attached note (`StaveNote`, `TabNote`, etc.)
  getNote() {
    return this.note;
  }

  setNote(note: Note) {
    this.note = note;
    return this;
  }

  // Get and set note index, which is a specific note in a chord.
  getIndex() {
    return this.index;
  }

  setIndex(index: number) {
    this.index = index;
    return this;
  }

  // Every modifier must be part of a `ModifierContext`.
  getModifierContext() {
    return this.modifier_context;
  }

  setModifierContext(c: ModifierContext) {
    this.modifier_context = c;
    return this;
  }

  // Get and set articulation position.
  getPosition() {
    return this.position;
  }

  setPosition(position: string | number) {
    this.position = typeof (position) === 'string'
      ? Modifier.PositionString[position]
      : position;
    this.reset();
    return this;
  }

  // Set the `text_line` for the modifier.
  setTextLine(line: number) {
    this.text_line = line;
    return this;
  }

  // Shift modifier down `y` pixels. Negative values shift up.
  setYShift(y: number) {
    this.y_shift = y;
    return this;
  }

  setSpacingFromNextModifier(x: number) {
    this.spacingFromNextModifier = x;
  }

  getSpacingFromNextModifier() {
    return this.spacingFromNextModifier;
  }

  // Shift modifier `x` pixels in the direction of the modifier. Negative values
  // shift reverse.
  setXShift(x: number) {
    this.x_shift = 0;
    if (this.position === Modifier.Position.LEFT) {
      this.x_shift -= x;
    } else {
      this.x_shift += x;
    }
  }

  getXShift() {
    return this.x_shift;
  }

  // Render the modifier onto the canvas.
  draw() {
    this.checkContext();
    throw new Vex.RERR('MethodNotImplemented', 'draw() not implemented for this modifier.');
  }

  // aligns sub notes of NoteSubGroup (or GraceNoteGroup) to the main note with correct x-offset
  alignSubNotesWithNote(subNotes: Note[], note: Note) {
    // Shift over the tick contexts of each note
    const tickContext = note.getTickContext();
    const metrics = tickContext.getMetrics();
    const subNoteXOffset = tickContext.getX() - metrics.modLeftPx - metrics.modRightPx
      + this.getSpacingFromNextModifier();

    subNotes.forEach((subNote) => {
      const subTickContext = subNote.getTickContext();
      subNote.setStave(note.stave);
      subTickContext.setXOffset(subNoteXOffset); // don't touch baseX to avoid shift each render
    });
  }
}
