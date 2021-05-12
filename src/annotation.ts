// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements text annotations as modifiers that can be attached to
// notes.
//
// See `tests/annotation_tests.js` for usage examples.

import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { TextFont } from './textfont';

// To enable logging for this class. Set `Vex.Flow.Annotation.DEBUG` to `true`.
function L(...args) {
  if (Annotation.DEBUG) Vex.L('Vex.Flow.Annotation', args);
}

export class Annotation extends Modifier {
  static get CATEGORY() {
    return 'annotations';
  }

  // Text annotations can be positioned and justified relative to the note.
  static get Justify() {
    return {
      LEFT: 1,
      CENTER: 2,
      RIGHT: 3,
      CENTER_STEM: 4,
    };
  }

  static get JustifyString() {
    return {
      left: Annotation.Justify.LEFT,
      right: Annotation.Justify.RIGHT,
      center: Annotation.Justify.CENTER,
      centerStem: Annotation.Justify.CENTER_STEM,
    };
  }

  static get VerticalJustify() {
    return {
      TOP: 1,
      CENTER: 2,
      BOTTOM: 3,
      CENTER_STEM: 4,
    };
  }

  static get VerticalJustifyString() {
    return {
      above: Annotation.VerticalJustify.TOP,
      top: Annotation.VerticalJustify.TOP,
      below: Annotation.VerticalJustify.BOTTOM,
      bottom: Annotation.VerticalJustify.BOTTOM,
      center: Annotation.VerticalJustify.CENTER,
      centerStem: Annotation.VerticalJustify.CENTER_STEM,
    };
  }

  // Arrange annotations within a `ModifierContext`
  static format(annotations, state) {
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

  // ## Prototype Methods
  //
  // Annotations inherit from `Modifier` and is positioned correctly when
  // in a `ModifierContext`.
  // Create a new `Annotation` with the string `text`.
  constructor(text) {
    super();
    this.setAttribute('type', 'Annotation');

    this.note = null;
    this.index = null;
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

  getCategory() {
    return Annotation.CATEGORY;
  }

  // Set font family, size, and weight. E.g., `Arial`, `10pt`, `Bold`.
  setFont(family, size, weight) {
    this.font = { family, size, weight };
    return this;
  }

  // Set vertical position of text (above or below stave). `just` must be
  // a value in `Annotation.VerticalJustify`.
  setVerticalJustification(just) {
    this.vert_justification = typeof just === 'string' ? Annotation.VerticalJustifyString[just] : just;
    return this;
  }

  // Get and set horizontal justification. `justification` is a value in
  // `Annotation.Justify`.
  getJustification() {
    return this.justification;
  }
  setJustification(just) {
    this.justification = typeof just === 'string' ? Annotation.JustifyString[just] : just;
    return this;
  }

  // Render text beside the note.
  draw() {
    this.checkContext();

    if (!this.note) {
      throw new Vex.RERR('NoNoteForAnnotation', "Can't draw text annotation without an attached note.");
    }

    this.setRendered();
    const start = this.note.getModifierStartXY(Modifier.Position.ABOVE, this.index);

    // We're changing context parameters. Save current state.
    this.context.save();
    const classString = Object.keys(this.getAttribute('classes')).join(' ');
    this.context.openGroup(classString, this.getAttribute('id'));
    this.context.setFont(this.font.family, this.font.size, this.font.weight);
    const text_width = this.context.measureText(this.text).width;

    // Estimate text height to be the same as the width of an 'm'.
    //
    // This is a hack to work around the inability to measure text height
    // in HTML5 Canvas (and SVG).
    const text_height = this.context.measureText('m').width;
    let x;
    let y;

    if (this.justification === Annotation.Justify.LEFT) {
      x = start.x;
    } else if (this.justification === Annotation.Justify.RIGHT) {
      x = start.x - text_width;
    } else if (this.justification === Annotation.Justify.CENTER) {
      x = start.x - text_width / 2;
    } /* CENTER_STEM */ else {
      x = this.note.getStemX() - text_width / 2;
    }

    let stem_ext;
    let spacing;
    const has_stem = this.note.hasStem();
    const stave = this.note.getStave();

    // The position of the text varies based on whether or not the note
    // has a stem.
    if (has_stem) {
      stem_ext = this.note.getStem().getExtents();
      spacing = stave.getSpacingBetweenLines();
    }

    if (this.vert_justification === Annotation.VerticalJustify.BOTTOM) {
      // HACK: We need to compensate for the text's height since its origin
      // is bottom-right.
      y = stave.getYForBottomText(this.text_line + Flow.TEXT_HEIGHT_OFFSET_HACK);
      if (has_stem) {
        const stem_base = this.note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY;
        y = Math.max(y, stem_base + spacing * (this.text_line + 2));
      }
    } else if (this.vert_justification === Annotation.VerticalJustify.CENTER) {
      const yt = this.note.getYForTopText(this.text_line) - 1;
      const yb = stave.getYForBottomText(this.text_line);
      y = yt + (yb - yt) / 2 + text_height / 2;
    } else if (this.vert_justification === Annotation.VerticalJustify.TOP) {
      y = Math.min(stave.getYForTopText(this.text_line), this.note.getYs()[0] - 10);
      if (has_stem) {
        y = Math.min(y, stem_ext.topY - 5 - spacing * this.text_line);
      }
    } /* CENTER_STEM */ else {
      const extents = this.note.getStemExtents();
      y = extents.topY + (extents.baseY - extents.topY) / 2 + text_height / 2;
    }

    L('Rendering annotation: ', this.text, x, y);
    this.context.fillText(this.text, x, y);
    this.context.closeGroup();
    this.context.restore();
  }
}
