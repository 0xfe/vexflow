// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
//
// ## Description
//
// This file implements various types of clefs that can be rendered on a stave.
//
// See `tests/clef_tests.js` for usage examples.

import {Vex} from './vex';
import {StaveModifier} from './stavemodifier';
import {Glyph} from './glyph';
import {Stave} from "./stave";
import {IClefType} from "./types/clef";
import {IAnnotation} from "./types/annotation";

// To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (Clef.DEBUG) Vex.L('Vex.Flow.Clef', args);
}

export class Clef extends StaveModifier {
  static DEBUG: boolean;

  annotation: IAnnotation;
  clef: IClefType;

  private glyph: Glyph;
  private attachment: Glyph;
  private size: string;
  private type: string;

  static get CATEGORY(): string {
    return 'clefs';
  }

  // Every clef name is associated with a glyph code from the font file
  // and a default stave line number.
  static get types(): Record<string, IClefType> {
    return {
      'treble': {
        code: 'gClef',
        line: 3,
      } as IClefType,
      'bass': {
        code: 'fClef',
        line: 1,
      } as IClefType,
      'alto': {
        code: 'cClef',
        line: 2,
      } as IClefType,
      'tenor': {
        code: 'cClef',
        line: 1,
      } as IClefType,
      'percussion': {
        code: 'restMaxima',
        line: 2,
      } as IClefType,
      'soprano': {
        code: 'cClef',
        line: 4,
      } as IClefType,
      'mezzo-soprano': {
        code: 'cClef',
        line: 3,
      } as IClefType,
      'baritone-c': {
        code: 'cClef',
        line: 0,
      } as IClefType,
      'baritone-f': {
        code: 'fClef',
        line: 2,
      } as IClefType,
      'subbass': {
        code: 'fClef',
        line: 0,
      } as IClefType,
      'french': {
        code: 'gClef',
        line: 4,
      } as IClefType,
      'tab': {
        code: '6stringTabClef',
      } as IClefType,
    };
  }

  // Create a new clef. The parameter `clef` must be a key from
  // `Clef.types`.
  constructor(type: string, size: string, annotation: string) {
    super();
    this.setAttribute('type', 'Clef');

    this.setPosition(StaveModifier.Position.BEGIN);
    this.setType(type, size, annotation);
    this.setWidth(this.musicFont.lookupMetric(`clef.${this.size}.width`));
    L('Creating clef:', type);
  }

  getCategory(): string {
    return Clef.CATEGORY;
  }

  setType(type: string, size: string, annotation: string): this {
    this.type = type;
    this.clef = Clef.types[type];
    if (size === undefined) {
      this.size = 'default';
    } else {
      this.size = size;
    }
    this.clef.point = this.musicFont.lookupMetric(`clef.${this.size}.point`, 0);
    this.glyph = new Glyph(this.clef.code, this.clef.point, {
      category: `clef.${this.clef.code}.${this.size}`
    });

    // If an annotation, such as 8va, is specified, add it to the Clef object.
    if (annotation !== undefined) {
      const code = this.musicFont.lookupMetric(`clef.annotations.${annotation}.smuflCode`);
      const point = this.musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.point`);
      const line = this.musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.${this.type}.line`);
      const x_shift = this.musicFont.lookupMetric(`clef.annotations.${annotation}.${this.size}.${this.type}.shiftX`);

      this.annotation = {code, point, line, x_shift};

      this.attachment = new Glyph(this.annotation.code, this.annotation.point);
      this.attachment.metrics.x_max = 0;
      this.attachment.setXShift(this.annotation.x_shift);
    } else {
      this.annotation = undefined;
    }

    return this;
  }

  getWidth(): number {
    if (this.type === 'tab' && !this.stave) {
      throw new Vex.RERR('ClefError', "Can't get width without stave.");
    }

    return this.width;
  }

  setStave(stave: Stave): this {
    this.stave = stave;
    if (this.type !== 'tab') return this;

    const numLines = this.stave.getOptions().num_lines;
    const point = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.point`);
    const shiftY = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.shiftY`);
    this.glyph.setPoint(point);
    this.glyph.setYShift(shiftY);

    return this;
  }

  draw(): void {
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
