// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { log } from './util';
import { Flow } from './flow';
import { Modifier } from './modifier';
import { TextFont } from './textfont';
import { FontInfo } from './types/common';
import { StemmableNote } from './stemmablenote';
import { ModifierContextState } from './modifiercontext';

// eslint-disable-next-line
function L(...args: any[]) {
  if (Annotation.DEBUG) log('Vex.Flow.Annotation', args);
}

enum Justify {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
  CENTER_STEM = 4,
}

enum VerticalJustify {
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
  static DEBUG: boolean;

  protected justification: Justify;
  protected vert_justification: VerticalJustify;
  protected text: string;
  protected font: FontInfo;

  /** Articulations category string. */
  static get CATEGORY(): string {
    return 'annotations';
  }

  /** Text annotations can be positioned and justified relative to the note. */
  static Justify = Justify;

  static JustifyString: Record<string, number> = {
    left: Annotation.Justify.LEFT,
    right: Annotation.Justify.RIGHT,
    center: Annotation.Justify.CENTER,
    centerStem: Annotation.Justify.CENTER_STEM,
  };

  static VerticalJustify = VerticalJustify;

  static VerticalJustifyString: Record<string, number> = {
    above: Annotation.VerticalJustify.TOP,
    top: Annotation.VerticalJustify.TOP,
    below: Annotation.VerticalJustify.BOTTOM,
    bottom: Annotation.VerticalJustify.BOTTOM,
    center: Annotation.VerticalJustify.CENTER,
    centerStem: Annotation.VerticalJustify.CENTER_STEM,
  };

  /** Arrange annotations within a `ModifierContext` */
  static format(annotations: Annotation[], state: ModifierContextState): boolean {
    if (!annotations || annotations.length === 0) return false;

    let width = 0;
    for (let i = 0; i < annotations.length; ++i) {
      let testWidth = 0;
      const annotation = annotations[i];
      const textFont = TextFont.getTextFontFromVexFontData({
        family: annotation.font.family,
        size: annotation.font.size,
        weight: 'normal',
      });
      // Calculate if the vertical extent will exceed a single line and adjust accordingly.
      const numLines = Math.floor(textFont.maxHeight / Flow.STAVE_LINE_DISTANCE) + 1;
      // Get the string width from the font metrics
      testWidth = textFont.getWidthForString(annotation.text);
      width = Math.max(width, testWidth);
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

  /**
   * Annotations inherit from `Modifier` and is positioned correctly when
   * in a `ModifierContext`.
   * Create a new `Annotation` with the string `text`.
   */
  constructor(text: string) {
    super();
    this.setAttribute('type', 'Annotation');

    this.text = text;
    this.justification = Annotation.Justify.CENTER;
    this.vert_justification = Annotation.VerticalJustify.TOP;
    this.font = {
      family: 'Arial',
      size: 10,
      weight: '',
    };

    // The default width is calculated from the text.
    this.setWidth(Flow.textWidth(text));
  }

  /** Get element category string. */
  getCategory(): string {
    return Annotation.CATEGORY;
  }

  /** Set font family, size, and weight. E.g., `Arial`, `10pt`, `Bold`. */
  setFont(family: string, size: number, weight: string): this {
    this.font = { family, size, weight };
    return this;
  }

  /**
   * Set vertical position of text (above or below stave).
   * @param just value in `Annotation.VerticalJustify`.
   */
  setVerticalJustification(just: string | VerticalJustify): this {
    this.vert_justification = typeof just === 'string' ? Annotation.VerticalJustifyString[just] : just;
    return this;
  }

  /**
   * Get horizontal justification.
   */
  getJustification(): Justify {
    return this.justification;
  }

  /**
   * Set horizontal justification.
   * @param justification value in `Annotation.Justify`.
   */
  setJustification(just: string | Justify): this {
    this.justification = typeof just === 'string' ? Annotation.JustifyString[just] : just;
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
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    const text_width = ctx.measureText(this.text).width;

    // Estimate text height to be the same as the width of an 'm'.
    //
    // This is a hack to work around the inability to measure text height
    // in HTML5 Canvas (and SVG).
    const text_height = ctx.measureText('m').width;
    let x;
    let y;

    if (this.justification === Annotation.Justify.LEFT) {
      x = start.x;
    } else if (this.justification === Annotation.Justify.RIGHT) {
      x = start.x - text_width;
    } else if (this.justification === Annotation.Justify.CENTER) {
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
      y = stave.getYForBottomText(this.text_line + Flow.TEXT_HEIGHT_OFFSET_HACK);
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
