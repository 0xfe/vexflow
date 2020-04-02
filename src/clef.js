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
function L(...args) { if (Clef.DEBUG) Vex.L('Vex.Flow.Clef', args); }

export class Clef extends StaveModifier {
  static get CATEGORY() { return 'clefs'; }

  // Every clef name is associated with a glyph code from the font file
  // and a default stave line number.
  static get types() {
    return {
      'treble': {
        code: 'v83',
        line: 3,
      },
      'bass': {
        code: 'v79',
        line: 1,
      },
      'alto': {
        code: 'vad',
        line: 2,
      },
      'tenor': {
        code: 'vad',
        line: 1,
      },
      'percussion': {
        code: 'v59',
        line: 2,
      },
      'soprano': {
        code: 'vad',
        line: 4,
      },
      'mezzo-soprano': {
        code: 'vad',
        line: 3,
      },
      'baritone-c': {
        code: 'vad',
        line: 0,
      },
      'baritone-f': {
        code: 'v79',
        line: 2,
      },
      'subbass': {
        code: 'v79',
        line: 0,
      },
      'french': {
        code: 'v83',
        line: 4,
      },
      'tab': {
        code: 'v2f',
      },
    };
  }

  // Sizes affect the point-size of the clef.
  static get sizes() {
    return {
      'default': {
        point: 40,
        width: 26
      },
      'small': {
        point: 32,
        width: 20,
      },
    };
  }

  // Annotations attach to clefs -- such as "8" for octave up or down.
  static get annotations() {
    return {
      '8va': {
        code: 'v8',
        sizes: {
          'default': {
            point: 20,
            attachments: {
              'treble': {
                line: -1.2,
                x_shift: 11,
              },
            },
          },
          'small': {
            point: 18,
            attachments: {
              'treble': {
                line: -0.4,
                x_shift: 8,
              },
            },
          },
        },
      },
      '8vb': {
        code: 'v8',
        sizes: {
          'default': {
            point: 20,
            attachments: {
              'treble': {
                line: 6.3,
                x_shift: 10,
              },
              'bass': {
                line: 4,
                x_shift: 1,
              },
            },
          },
          'small': {
            point: 18,
            attachments: {
              'treble': {
                line: 5.8,
                x_shift: 6,
              },
              'bass': {
                line: 3.5,
                x_shift: 0.5,
              },
            },
          },
        },
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
    this.setWidth(Clef.sizes[this.size].width);
    L('Creating clef:', type);
  }

  getCategory() { return Clef.CATEGORY; }

  setType(type, size, annotation) {
    this.type = type;
    this.clef = Clef.types[type];
    if (size === undefined) {
      this.size = 'default';
    } else {
      this.size = size;
    }
    this.clef.point = Clef.sizes[this.size].point;
    this.glyph = new Glyph(this.clef.code, this.clef.point);

    // If an annotation, such as 8va, is specified, add it to the Clef object.
    if (annotation !== undefined) {
      const anno_dict = Clef.annotations[annotation];
      this.annotation = {
        code: anno_dict.code,
        point: anno_dict.sizes[this.size].point,
        line: anno_dict.sizes[this.size].attachments[this.type].line,
        x_shift: anno_dict.sizes[this.size].attachments[this.type].x_shift,
      };

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

    let glyphScale;
    let glyphOffset;
    const numLines = this.stave.getOptions().num_lines;
    switch (numLines) {
      case 8:
        glyphScale = 55;
        glyphOffset = 14;
        break;
      case 7:
        glyphScale = 47;
        glyphOffset = 8;
        break;
      case 6:
        glyphScale = 40;
        glyphOffset = 1;
        break;
      case 5:
        glyphScale = 30;
        glyphOffset = -6;
        break;
      case 4:
        glyphScale = 23;
        glyphOffset = -12;
        break;
      default:
        throw new Vex.RERR('ClefError', `Invalid number of lines: ${numLines}`);
    }

    this.glyph.setPoint(glyphScale);
    this.glyph.setYShift(glyphOffset);

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
