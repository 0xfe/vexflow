// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Rodrigo Vilar
// MIT License

import { Glyph } from './glyph';
import { Modifier, ModifierPosition } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { Tables } from './tables';

/** Parenthesis implements parenthesis modifiers for notes.*/
export class Parenthesis extends Modifier {
  static get CATEGORY(): string {
    return 'Parenthesis';
  }

  protected point: number;

  /** Add parentheses to note. */
  static addParentheses(note: Note): void {
    for (let i = 0; i < note.keys.length; i++) {
      note.addModifier(new Parenthesis(ModifierPosition.LEFT), i);
      note.addModifier(new Parenthesis(ModifierPosition.RIGHT), i);
    }
  }

  /** Arrange parenthesis inside a ModifierContext. */
  static format(parentheses: Parenthesis[], state: ModifierContextState): boolean {
    const { right_shift, left_shift } = state;

    if (!parentheses || parentheses.length === 0) return false;

    let x_widthL = 0;
    let x_widthR = 0;

    for (let i = 0; i < parentheses.length; ++i) {
      const parenthesis = parentheses[i];
      const note = parenthesis.getNote();
      const pos = parenthesis.getPosition();
      const index = parenthesis.checkIndex();
      const props = note.getKeyProps()[index];

      let shift = 0;

      if (pos === ModifierPosition.RIGHT) {
        shift = (props.displaced ? note.getRightDisplacedHeadPx() : 0) + right_shift;
        x_widthR += shift + parenthesis.width;
      }
      if (pos === ModifierPosition.LEFT) {
        shift = (props.displaced ? note.getLeftDisplacedHeadPx() : 0) + left_shift;
        x_widthL += shift + parenthesis.width;
      }
      parenthesis.setXShift(shift);
    }
    state.left_shift += x_widthL;
    state.right_shift += x_widthR;

    return true;
  }

  constructor(position: ModifierPosition) {
    super();

    this.position = position ?? Modifier.Position.LEFT;

    this.point = Tables.currentMusicFont().lookupMetric('parenthesis.default.point');
    this.setWidth(Tables.currentMusicFont().lookupMetric('parenthesis.default.width'));
  }

  setNote(note: Note): this {
    this.note = note;
    this.point = Tables.currentMusicFont().lookupMetric('parenthesis.default.point');
    this.setWidth(Tables.currentMusicFont().lookupMetric('parenthesis.default.width'));
    if (note.getCategory() === 'GraceNote') {
      this.point = Tables.currentMusicFont().lookupMetric('parenthesis.gracenote.point');
      this.setWidth(Tables.currentMusicFont().lookupMetric('parenthesis.gracenote.width'));
    }
    return this;
  }

  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(this.position, this.index, { forceFlagRight: true });
    const x = start.x + this.x_shift;
    const y = start.y + this.y_shift;
    if (this.position == Modifier.Position.RIGHT) {
      Glyph.renderGlyph(ctx, x + 1, y, this.point, 'noteheadParenthesisRight', {
        category: `noteHead.standard.noteheadParenthesisRight`,
      });
    } else if (this.position == Modifier.Position.LEFT) {
      Glyph.renderGlyph(ctx, x - 2, y, this.point, 'noteheadParenthesisLeft', {
        category: `noteHead.standard.noteheadParenthesisLeft`,
      });
    }
  }
}
