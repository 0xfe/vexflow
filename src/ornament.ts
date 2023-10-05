// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
// MIT License

import { Glyph } from './glyph';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Category, isTabNote } from './typeguard';
import { defined, log, RuntimeError } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (Ornament.DEBUG) log('Vex.Flow.Ornament', args);
}

export interface OrnamentMetrics {
  xOffset: number;
  yOffset: number;
  stemUpYOffset: number;
  reportedWidth: number;
}

/**
 * Ornament implements ornaments as modifiers that can be
 * attached to notes. The complete list of ornaments is available in
 * `tables.ts` under `Vex.Flow.ornamentCodes`.
 *
 * See `tests/ornament_tests.ts` for usage examples.
 */
export class Ornament extends Modifier {
  /** To enable logging for this class. Set `Vex.Flow.Ornament.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  /** Ornaments category string. */
  static get CATEGORY(): string {
    return Category.Ornament;
  }
  static get minPadding(): number {
    const musicFont = Tables.currentMusicFont();
    return musicFont.lookupMetric('noteHead.minPadding');
  }

  protected ornament: {
    code: string;
  };
  protected stemUpYOffset: number;
  protected ornamentAlignWithNoteHead: string[] | boolean;
  protected type: string;

  protected delayed: boolean;
  protected reportedWidth: number;
  protected adjustForStemDirection: boolean;
  public render_options: {
    accidentalUpperPadding: number;
    accidentalLowerPadding: number;
    font_scale: number;
  };
  protected glyph: Glyph;
  protected accidentalUpper?: Glyph;
  protected accidentalLower?: Glyph;
  protected delayXShift?: number;

  /** Arrange ornaments inside `ModifierContext` */
  static format(ornaments: Ornament[], state: ModifierContextState): boolean {
    if (!ornaments || ornaments.length === 0) return false;

    let width = 0; // width is used by ornaments, which are always centered on the note head
    let right_shift = state.right_shift; // jazz ornaments calculate r/l shift separately
    let left_shift = state.left_shift;
    let yOffset = 0;

    for (let i = 0; i < ornaments.length; ++i) {
      const ornament = ornaments[i];
      const increment = 2;

      if (Ornament.ornamentRelease.indexOf(ornament.type) >= 0) {
        ornament.x_shift += right_shift + 2;
      }
      if (Ornament.ornamentAttack.indexOf(ornament.type) >= 0) {
        ornament.x_shift -= left_shift + 2;
      }
      if (ornament.reportedWidth && ornament.x_shift < 0) {
        left_shift += ornament.reportedWidth;
      } else if (ornament.reportedWidth && ornament.x_shift >= 0) {
        right_shift += ornament.reportedWidth + Ornament.minPadding;
      } else {
        width = Math.max(ornament.getWidth(), width);
      }
      // articulations above/below the line can be stacked.
      if (Ornament.ornamentArticulation.indexOf(ornament.type) >= 0) {
        // Unfortunately we don't know the stem direction.  So we base it
        // on the line number, but also allow it to be overridden.
        const ornamentNote = defined(ornament.note, 'NoAttachedNote');
        if (ornamentNote.getLineNumber() >= 3 || ornament.getPosition() === Modifier.Position.ABOVE) {
          state.top_text_line += increment;
          ornament.y_shift += yOffset;
          yOffset -= ornament.glyph.bbox.getH();
        } else {
          state.text_line += increment;
          ornament.y_shift += yOffset;
          yOffset += ornament.glyph.bbox.getH();
        }
      } else {
        if (ornament.getPosition() === Modifier.Position.ABOVE) {
          ornament.setTextLine(state.top_text_line);
          state.top_text_line += increment;
        } else {
          ornament.setTextLine(state.text_line);
          state.text_line += increment;
        }
      }
    }

    // Note: 'legit' ornaments don't consider other modifiers when calculating their
    // X position, but jazz ornaments sometimes need to.
    state.left_shift = left_shift + width / 2;
    state.right_shift = right_shift + width / 2;
    return true;
  }

  /**
   * ornamentNoteTransition means the jazz ornament represents an effect from one note to another,
   * these are generally on the top of the staff.
   */
  static get ornamentNoteTransition(): string[] {
    return ['flip', 'jazzTurn', 'smear'];
  }

  /**
   * ornamentAttack indicates something that happens in the attach, placed before the note and
   * any accidentals
   */
  static get ornamentAttack(): string[] {
    return ['scoop'];
  }

  /**
   * The ornament is aligned based on the note head, but without regard to whether the
   * stem goes up or down.
   */
  static get ornamentAlignWithNoteHead(): string[] {
    return ['doit', 'fall', 'fallLong', 'doitLong', 'bend', 'plungerClosed', 'plungerOpen', 'scoop'];
  }

  /**
   * An ornament that happens on the release of the note, generally placed after the
   * note and overlapping the next beat/measure..
   */
  static get ornamentRelease(): string[] {
    return ['doit', 'fall', 'fallLong', 'doitLong', 'jazzTurn', 'smear', 'flip'];
  }

  /** ornamentArticulation goes above/below the note based on space availablity */
  static get ornamentArticulation(): string[] {
    return ['bend', 'plungerClosed', 'plungerOpen'];
  }

  /**
   * Legacy ornaments have hard-coded metrics.  If additional ornament types are
   * added, get their metrics here.
   */
  getMetrics(): OrnamentMetrics {
    const ornamentMetrics = Tables.currentMusicFont().getMetrics().ornament;

    if (!ornamentMetrics) throw new RuntimeError('BadMetrics', `ornament missing`);
    return ornamentMetrics[this.ornament.code];
  }

  /**
   * Create a new ornament of type `type`, which is an entry in
   * `Vex.Flow.ornamentCodes` in `tables.ts`.
   */
  constructor(type: string) {
    super();

    this.type = type;
    this.delayed = false;

    this.render_options = {
      font_scale: Tables.NOTATION_FONT_SCALE,
      accidentalLowerPadding: 3,
      accidentalUpperPadding: 3,
    };

    this.ornament = Tables.ornamentCodes(this.type);

    // new ornaments have their origin at the origin, and have more specific
    // metrics.  Legacy ornaments do some
    // x scaling, and have hard-coded metrics
    const metrics = this.getMetrics();

    // some jazz ornaments are above or below depending on stem direction.
    this.adjustForStemDirection = false;

    // some jazz ornaments like falls are supposed to overlap with future bars
    // and so we report a different width than they actually take up.
    this.reportedWidth = metrics && metrics.reportedWidth ? metrics.reportedWidth : 0;

    this.stemUpYOffset = metrics && metrics.stemUpYOffset ? metrics.stemUpYOffset : 0;

    this.ornamentAlignWithNoteHead = Ornament.ornamentAlignWithNoteHead.indexOf(this.type) >= 0;

    if (!this.ornament) {
      throw new RuntimeError('ArgumentError', `Ornament not found: '${this.type}'`);
    }

    this.x_shift = metrics ? metrics.xOffset : 0;
    this.y_shift = metrics ? metrics.yOffset : 0;

    this.glyph = new Glyph(this.ornament.code, this.render_options.font_scale, {
      category: `ornament.${this.ornament.code}`,
    });

    // Is this a jazz ornament that goes between this note and the next note.
    if (Ornament.ornamentNoteTransition.indexOf(this.type) >= 0) {
      this.delayed = true;
    }

    // Legacy ornaments need this.  I don't know why, but horizontal spacing issues
    // happen if I don't set it.
    if (!metrics) {
      this.glyph.setOrigin(0.5, 1.0); // FIXME: SMuFL won't require a vertical origin shift
    }
  }

  /** Set whether the ornament is to be delayed. */
  setDelayed(delayed: boolean): this {
    this.delayed = delayed;
    return this;
  }

  /** Set the upper accidental for the ornament. */
  setUpperAccidental(accid: string): this {
    const scale = this.render_options.font_scale / 1.3;
    this.accidentalUpper = new Glyph(Tables.accidentalCodes(accid).code, scale);
    this.accidentalUpper.setOrigin(0.5, 1.0);
    return this;
  }

  /** Set the lower accidental for the ornament. */
  setLowerAccidental(accid: string): this {
    const scale = this.render_options.font_scale / 1.3;
    this.accidentalLower = new Glyph(Tables.accidentalCodes(accid).code, scale);
    this.accidentalLower.setOrigin(0.5, 1.0);
    return this;
  }

  /** Render ornament in position next to note. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote() as StemmableNote;
    this.setRendered();

    const stemDir = note.getStemDirection();
    const stave = note.checkStave();

    this.applyStyle();
    ctx.openGroup('ornament', this.getAttribute('id'));

    // Get stem extents
    const stemExtents = note.checkStem().getExtents();
    let y = stemDir === Stem.DOWN ? stemExtents.baseY : stemExtents.topY;

    // TabNotes don't have stems attached to them. Tab stems are rendered outside the stave.
    if (isTabNote(note)) {
      if (note.hasStem()) {
        if (stemDir === Stem.DOWN) {
          y = stave.getYForTopText(this.text_line);
        }
      } else {
        // Without a stem
        y = stave.getYForTopText(this.text_line);
      }
    }

    const isPlacedOnNoteheadSide = stemDir === Stem.DOWN;
    const spacing = stave.getSpacingBetweenLines();
    let lineSpacing = 1;

    // Beamed stems are longer than quarter note stems, adjust accordingly
    if (!isPlacedOnNoteheadSide && note.hasBeam()) {
      lineSpacing += 0.5;
    }

    const totalSpacing = spacing * (this.text_line + lineSpacing);
    const glyphYBetweenLines = y - totalSpacing;

    // Get initial coordinates for the modifier position
    const start = note.getModifierStartXY(this.position, this.index);
    let glyphX = start.x;

    // If the ornament is aligned with the note head, don't consider the stave y
    // but use the 'natural' modifier y
    let glyphY = this.ornamentAlignWithNoteHead
      ? start.y
      : Math.min(stave.getYForTopText(this.text_line), glyphYBetweenLines);
    glyphY += this.y_shift;

    // Ajdust x position if ornament is delayed
    if (this.delayed) {
      let delayXShift = 0;
      const startX = glyphX - stave.getNoteStartX();
      if (this.delayXShift !== undefined) {
        delayXShift = this.delayXShift;
      } else {
        delayXShift += this.glyph.getMetrics().width / 2;
        const tickables = note.getVoice().getTickables();
        const index = tickables.indexOf(note);
        const nextContext = index + 1 < tickables.length ? tickables[index + 1].checkTickContext() : undefined;
        if (nextContext) {
          delayXShift += (nextContext.getX() - startX) * 0.5;
        } else {
          delayXShift += (stave.getX() + stave.getWidth() - glyphX) * 0.5;
        }
        this.delayXShift = delayXShift;
      }
      glyphX += delayXShift;
    }

    L('Rendering ornament: ', this.ornament, glyphX, glyphY);

    if (this.accidentalLower) {
      this.accidentalLower.render(ctx, glyphX, glyphY);
      glyphY -= this.accidentalLower.getMetrics().height;
      glyphY -= this.render_options.accidentalLowerPadding;
    }

    if (this.stemUpYOffset && note.hasStem() && note.getStemDirection() === 1) {
      glyphY += this.stemUpYOffset;
    }
    if (note.getLineNumber() < 5 && Ornament.ornamentNoteTransition.indexOf(this.type) >= 0) {
      glyphY = note.checkStave().getBoundingBox().getY() + 40;
    }

    this.glyph.render(ctx, glyphX + this.x_shift, glyphY);

    if (this.accidentalUpper) {
      glyphY -= this.glyph.getMetrics().height + this.render_options.accidentalUpperPadding;
      this.accidentalUpper.render(ctx, glyphX, glyphY);
    }
    ctx.closeGroup();
    this.restoreStyle();
  }
}
