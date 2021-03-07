// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
//
// ## Description
//
// This file implements various types of clefs that can be rendered on a stave.
//
// See `tests/clef_tests.js` for usage examples.

import { Vex } from './vex';
import { StaveModifier } from './stavemodifier';
import { Glyph } from './glyph';

// To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`.
function L(...args) {
  if (Clef.DEBUG) Vex.L('Vex.Flow.Clef', args);
}

export class Clef extends StaveModifier {
  static get CATEGORY() {
    return 'clefs';
  }

  // Every clef name is associated with a glyph code from the font file
  // and a default stave line number.
  static get types() {
    return {
      treble: {
        code: 'gClef',
        line: 3,
      },
      bass: {
        code: 'fClef',
        line: 1,
      },
      alto: {
        code: 'cClef',
        line: 2,
      },
      tenor: {
        code: 'cClef',
        line: 1,
      },
      percussion: {
        code: 'restMaxima',
        line: 2,
      },
      soprano: {
        code: 'cClef',
        line: 4,
      },
      'mezzo-soprano': {
        code: 'cClef',
        line: 3,
      },
      'baritone-c': {
        code: 'cClef',
        line: 0,
      },
      'baritone-f': {
        code: 'fClef',
        line: 2,
      },
      subbass: {
        code: 'fClef',
        line: 0,
      },
      french: {
        code: 'gClef',
        line: 4,
      },
      tab: {
        code: '6stringTabClef',
      },
    };
  }

  // Create a new clef. The parameter `clef` must be a key from
  // `Clef.types`.
  constructor(type, size, annotation) {
    super();
    this.setAttribute('type', 'Clef');

    this.setPosition(StaveModifier.Position.BEGIN);
    this.setType(type, size, annotation);
    this.setWidth(this.musicFont.lookupMetric(`clef.${this.size}.width`));
    L('Creating clef:', type);
  }

  getCategory() {
    return Clef.CATEGORY;
  }

  setType(type, size, annotation) {
    this.type = type;
    this.clef = Clef.types[type];
    if (size === undefined) {
      this.size = 'default';
    } else {
      this.size = size;
    }
    this.clef.point = this.musicFont.lookupMetric(`clef.${this.size}.point`, 0);
    this.glyph = new Glyph(this.clef.code, this.clef.point, {
      category: `clef.${this.clef.code}.${this.size}`,
    });

    // If an annotation, such as 8va, is specified, add it to the Clef object.
    if (annotation !== undefined) {
      const code = this.musicFont.lookupMetric(`clef.annotations.${annotation}.smuflCode`);
      const point = this.musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.point`);
      const line = this.musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.${this.type}.line`);
      const x_shift = this.musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.${this.type}.shiftX`);

      this.annotation = { code, point, line, x_shift };

      this.attachment = new Glyph(this.annotation.code, this.annotation.point);
      this.attachment.metrics.x_max = 0;
      this.attachment.setXShift(this.annotation.x_shift);
    } else {
      this.annotation = undefined;
    }

    return this;
  }

  getWidth() {
    if (this.type === 'tab' && !this.stave) {
      throw new Vex.RERR('ClefError', "Can't get width without stave.");
    }

    return this.width;
  }

  setStave(stave) {
    this.stave = stave;
    if (this.type !== 'tab') return this;

    const numLines = this.stave.getOptions().num_lines;
    const point = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.point`);
    const shiftY = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.shiftY`);
    this.glyph.setPoint(point);
    this.glyph.setYShift(shiftY);

    return this;
  }

  draw() {
    if (!this.x) throw new Vex.RERR('ClefError', "Can't draw clef without x.");
    if (!this.stave) throw new Vex.RERR('ClefError', "Can't draw clef without stave.");
    this.setRendered();

    this.glyph.setStave(this.stave);
    this.glyph.setContext(this.stave.context);
    if (this.clef.line !== undefined) {
      this.placeGlyphOnLine(this.glyph, this.stave, this.clef.line);
    }

    this.glyph.renderToStave(this.x);

    if (this.annotation !== undefined) {
      this.placeGlyphOnLine(this.attachment, this.stave, this.annotation.line);
      this.attachment.setStave(this.stave);
      this.attachment.setContext(this.stave.context);
      this.attachment.renderToStave(this.x);
    }
  }
}
