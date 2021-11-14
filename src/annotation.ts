// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Element } from './element';
import { FontInfo } from './font';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { TextFormatter } from './textformatter';
import { log } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (Annotation.DEBUG) log('Vex.Flow.Annotation', args);
}

export enum AnnotationHorizontalJustify {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
  CENTER_STEM = 4,
}

export enum AnnotationVerticalJustify {
  TOP = 1,
  CENTER = 2,
  BOTTOM = 3,
  CENTER_STEM = 4,
}

/**
 * Annotations are modifiers that can be attached to
 * notes.
 *
 * See `tests/annotation_tests.ts` for usage examples.
 */
export class Annotation extends Modifier {
  /** To enable logging for this class. Set `Vex.Flow.Annotation.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  /** Annotations category string. */
  static get CATEGORY(): string {
    return 'Annotation';
  }

  static TEXT_FONT: Required<FontInfo> = { ...Element.TEXT_FONT };

  /** Text annotations can be positioned and justified relative to the note. */
  static HorizontalJustify = AnnotationHorizontalJustify;

  static HorizontalJustifyString: Record<string, number> = {
    left: AnnotationHorizontalJustify.LEFT,
    right: AnnotationHorizontalJustify.RIGHT,
    center: AnnotationHorizontalJustify.CENTER,
    centerStem: AnnotationHorizontalJustify.CENTER_STEM,
  };

  static VerticalJustify = AnnotationVerticalJustify;

  static VerticalJustifyString: Record<string, number> = {
    above: AnnotationVerticalJustify.TOP,
    top: AnnotationVerticalJustify.TOP,
    below: AnnotationVerticalJustify.BOTTOM,
    bottom: AnnotationVerticalJustify.BOTTOM,
    center: AnnotationVerticalJustify.CENTER,
    centerStem: AnnotationVerticalJustify.CENTER_STEM,
  };

  /** Arrange annotations within a `ModifierContext` */
  static format(annotations: Annotation[], state: ModifierContextState): boolean {
    if (!annotations || annotations.length === 0) return false;

    let width = 0;
    for (let i = 0; i < annotations.length; ++i) {
      let textWidth = 0;
      const annotation = annotations[i];
      const textFormatter = TextFormatter.create(annotation.textFont);

      // Calculate if the vertical extent will exceed a single line and adjust accordingly.
      const numLines = Math.floor(textFormatter.maxHeight / Tables.STAVE_LINE_DISTANCE) + 1;
      // Get the text width from the font metrics.
      textWidth = textFormatter.getWidthForTextInPx(annotation.text);
      width = Math.max(width, textWidth);
      if (annotation.getPosition() === Modifier.Position.ABOVE) {
        annotation.setTextLine(state.top_text_line);
        state.top_text_line += numLines;
      } else {
        annotation.setTextLine(state.text_line);
        state.text_line += numLines;
      }
    }
    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }

  protected justification: AnnotationHorizontalJustify;
  protected vert_justification: AnnotationVerticalJustify;
  protected text: string;

  /**
   * Annotations inherit from `Modifier` and is positioned correctly when
   * in a `ModifierContext`.
   * Create a new `Annotation` with the string `text`.
   */
  constructor(text: string) {
    super();

    this.text = text;
    this.justification = AnnotationHorizontalJustify.CENTER;
    this.vert_justification = Annotation.VerticalJustify.TOP;
    this.resetFont();

    // The default width is calculated from the text.
    this.setWidth(Tables.textWidth(text));
  }

  /**
   * Set vertical position of text (above or below stave).
   * @param just value in `Annotation.VerticalJustify`.
   */
  setVerticalJustification(just: string | AnnotationVerticalJustify): this {
    this.vert_justification = typeof just === 'string' ? Annotation.VerticalJustifyString[just] : just;
    return this;
  }

  /**
   * Get horizontal justification.
   */
  getJustification(): AnnotationHorizontalJustify {
    return this.justification;
  }

  /**
   * Set horizontal justification.
   * @param justification value in `Annotation.Justify`.
   */
  setJustification(just: string | AnnotationHorizontalJustify): this {
    this.justification = typeof just === 'string' ? Annotation.HorizontalJustifyString[just] : just;
    return this;
  }

  /** Render text beside the note. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(Modifier.Position.ABOVE, this.index);

    // We're changing context parameters. Save current state.
    ctx.save();
    const classString = Object.keys(this.getAttribute('classes')).join(' ');
    ctx.openGroup(classString, this.getAttribute('id'));
    ctx.setFont(this.textFont);

    const text_width = ctx.measureText(this.text).width;

    // Estimate text height to be the same as the width of an 'm'.
    //
    // This is a hack to work around the inability to measure text height
    // in HTML5 Canvas (and SVG).
    const text_height = ctx.measureText('m').width;
    let x;
    let y;

    if (this.justification === Annotation.HorizontalJustify.LEFT) {
      x = start.x;
    } else if (this.justification === Annotation.HorizontalJustify.RIGHT) {
      x = start.x - text_width;
    } else if (this.justification === Annotation.HorizontalJustify.CENTER) {
      x = start.x - text_width / 2;
    } /* CENTER_STEM */ else {
      x = (note as StemmableNote).getStemX() - text_width / 2;
    }

    let stem_ext: Record<string, number> = {};
    let spacing = 0;
    const has_stem = note.hasStem();
    const stave = note.checkStave();

    // The position of the text varies based on whether or not the note
    // has a stem.
    if (has_stem) {
      stem_ext = (note as StemmableNote).checkStem().getExtents();
      spacing = stave.getSpacingBetweenLines();
    }

    if (this.vert_justification === Annotation.VerticalJustify.BOTTOM) {
      // HACK: We need to compensate for the text's height since its origin
      // is bottom-right.
      y = stave.getYForBottomText(this.text_line + Tables.TEXT_HEIGHT_OFFSET_HACK);
      if (has_stem) {
        const stem_base = note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY;
        y = Math.max(y, stem_base + spacing * (this.text_line + 2));
      }
    } else if (this.vert_justification === Annotation.VerticalJustify.CENTER) {
      const yt = note.getYForTopText(this.text_line) - 1;
      const yb = stave.getYForBottomText(this.text_line);
      y = yt + (yb - yt) / 2 + text_height / 2;
    } else if (this.vert_justification === Annotation.VerticalJustify.TOP) {
      y = Math.min(stave.getYForTopText(this.text_line), note.getYs()[0] - 10);
      if (has_stem) {
        y = Math.min(y, stem_ext.topY - 5 - spacing * this.text_line);
      }
    } /* CENTER_STEM */ else {
      const extents = note.getStemExtents();
      y = extents.topY + (extents.baseY - extents.topY) / 2 + text_height / 2;
    }

    L('Rendering annotation: ', this.text, x, y);
    ctx.fillText(this.text, x, y);
    ctx.closeGroup();
    ctx.restore();
  }
}
