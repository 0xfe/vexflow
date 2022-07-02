// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements dot modifiers for notes.

import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Category, isGraceNote, isStaveNote, isTabNote } from './typeguard';
import { RuntimeError } from './util';

export class Dot extends Modifier {
  static get CATEGORY(): string {
    return Category.Dot;
  }

  protected radius: number;
  protected dot_shiftY: number;

  /** Returns the dots associated to a Note. */
  static getDots(note: Note): Dot[] {
    return note.getModifiersByType(Dot.CATEGORY) as Dot[];
  }

  /** Add a dot on the specified keys to the notes. */
  static buildAndAttach(notes: Note[], options?: { index?: number; all?: boolean }): void {
    for (const note of notes) {
      if (options?.all) {
        for (let i = 0; i < note.keys.length; i++) {
          const dot = new Dot();
          dot.setDotShiftY(note.glyphProps.dot_shiftY);
          note.addModifier(dot, i);
        }
      } else if (options?.index != undefined) {
        const dot = new Dot();
        dot.setDotShiftY(note.glyphProps.dot_shiftY);
        note.addModifier(dot, options?.index);
      } else {
        const dot = new Dot();
        dot.setDotShiftY(note.glyphProps.dot_shiftY);
        note.addModifier(dot, 0);
      }
    }
  }

  // Arrange dots inside a ModifierContext.
  static format(dots: Dot[], state: ModifierContextState): boolean {
    const right_shift = state.right_shift;
    const dot_spacing = 1;

    if (!dots || dots.length === 0) return false;

    const dot_list = [];
    const max_shift_map: Record<string, number> = {};
    for (let i = 0; i < dots.length; ++i) {
      const dot = dots[i];
      const note = dot.getNote();

      let props;
      let shift;

      if (isStaveNote(note)) {
        const index = dot.checkIndex();
        props = note.getKeyProps()[index];
        // consider right displaced head with no previous modifier
        shift = note.getFirstDotPx();
      } else if (isTabNote(note)) {
        props = { line: 0.5 }; // Shim key props for dot placement
        shift = right_shift;
      } else {
        // note object is not StaveNote or TabNote.
        throw new RuntimeError('Internal', 'Unexpected instance.');
      }

      const note_id = note.getAttribute('id');
      dot_list.push({ line: props.line, note, note_id, dot });
      max_shift_map[note_id] = Math.max(max_shift_map[note_id] || shift, shift);
    }

    // Sort dots by line number.
    dot_list.sort((a, b) => b.line - a.line);

    let dot_shift = right_shift;
    let x_width = 0;
    let last_line = null;
    let last_note = null;
    let prev_dotted_space = null;
    let half_shiftY = 0;

    for (let i = 0; i < dot_list.length; ++i) {
      const { dot, note, note_id, line } = dot_list[i];

      // Reset the position of the dot every line.
      if (line !== last_line || note !== last_note) {
        dot_shift = max_shift_map[note_id];
      }

      if (!note.isRest() && line !== last_line) {
        if (Math.abs(line % 1) === 0.5) {
          // note is on a space, so no dot shift
          half_shiftY = 0;
        } else {
          // note is on a line, so shift dot to space above the line
          half_shiftY = 0.5;
          if (last_note != null && !last_note.isRest() && last_line != null && last_line - line === 0.5) {
            // previous note on a space, so shift dot to space below the line
            half_shiftY = -0.5;
          } else if (line + half_shiftY === prev_dotted_space) {
            // previous space is dotted, so shift dot to space below the line
            half_shiftY = -0.5;
          }
        }
      }

      // convert half_shiftY to a multiplier for dots.draw()
      if (note.isRest()) {
        dot.dot_shiftY += -half_shiftY;
      } else {
        dot.dot_shiftY = -half_shiftY;
      }
      prev_dotted_space = line + half_shiftY;

      dot.setXShift(dot_shift);
      dot_shift += dot.getWidth() + dot_spacing; // spacing
      x_width = dot_shift > x_width ? dot_shift : x_width;
      last_line = line;
      last_note = note;
    }

    // Update state.
    state.right_shift += x_width;
    return true;
  }

  constructor() {
    super();

    this.position = Modifier.Position.RIGHT;

    this.radius = 2;
    this.setWidth(5);
    this.dot_shiftY = 0;
  }

  setNote(note: Note): this {
    this.note = note;
    if (isGraceNote(note)) {
      this.radius *= 0.5;
      this.setWidth(3);
    }
    return this;
  }

  setDotShiftY(y: number): this {
    this.dot_shiftY = y;
    return this;
  }

  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const stave = note.checkStave();
    const lineSpace = stave.getSpacingBetweenLines();

    const start = note.getModifierStartXY(this.position, this.index, { forceFlagRight: true });

    // Set the starting y coordinate to the base of the stem for TabNotes.

    if (isTabNote(note)) {
      start.y = note.getStemExtents().baseY;
    }

    const x = start.x + this.x_shift + this.width - this.radius;
    const y = start.y + this.y_shift + this.dot_shiftY * lineSpace;

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
}
