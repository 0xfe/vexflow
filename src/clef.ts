// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
// MIT License

import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { defined, log } from './util';

export interface ClefType {
  point: number;
  code: string;
  line?: number;
}

// eslint-disable-next-line
function L(...args: any[]) {
  if (Clef.DEBUG) log('Vex.Flow.Clef', args);
}

/**
 * Clef implements various types of clefs that can be rendered on a stave.
 *
 * See `tests/clef_tests.ts` for usage examples.
 */
export class Clef extends StaveModifier {
  /** To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`. */
  static DEBUG: boolean;

  static get CATEGORY(): string {
    return 'Clef';
  }

  annotation?: {
    code: string;
    line: number;
    x_shift: number;
    point: number;
  };

  /**
   * The attribute `clef` must be a key from
   * `Clef.types`
   */
  clef: ClefType = Clef.types['treble'];

  protected glyph?: Glyph;
  protected attachment?: Glyph;
  protected size?: string;
  protected type?: string;

  /**
   * Every clef name is associated with a glyph code from the font file
   * and a default stave line number.
   */
  static get types(): Record<string, ClefType> {
    return {
      treble: {
        code: 'gClef',
        line: 3,
        point: 0,
      },
      bass: {
        code: 'fClef',
        line: 1,
        point: 0,
      },
      alto: {
        code: 'cClef',
        line: 2,
        point: 0,
      },
      tenor: {
        code: 'cClef',
        line: 1,
        point: 0,
      },
      percussion: {
        code: 'restMaxima',
        line: 2,
        point: 0,
      },
      soprano: {
        code: 'cClef',
        line: 4,
        point: 0,
      },
      'mezzo-soprano': {
        code: 'cClef',
        line: 3,
        point: 0,
      },
      'baritone-c': {
        code: 'cClef',
        line: 0,
        point: 0,
      },
      'baritone-f': {
        code: 'fClef',
        line: 2,
        point: 0,
      },
      subbass: {
        code: 'fClef',
        line: 0,
        point: 0,
      },
      french: {
        code: 'gClef',
        line: 4,
        point: 0,
      },
      tab: {
        code: '6stringTabClef',
        point: 0,
      },
    };
  }

  /** Create a new clef. */
  constructor(type: string, size?: string, annotation?: string) {
    super();

    this.setPosition(StaveModifierPosition.BEGIN);
    this.setType(type, size, annotation);
    this.setWidth(this.musicFont.lookupMetric(`clef.${this.size}.width`));
    L('Creating clef:', type);
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size?: string, annotation?: string): this {
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

  /** Get clef width. */
  getWidth(): number {
    if (this.type === 'tab') {
      defined(this.stave, 'ClefError', "Can't get width without stave.");
    }
    return this.width;
  }

  /** Set associated stave. */
  setStave(stave: Stave): this {
    this.stave = stave;
    if (this.type === 'tab') {
      const glyph = defined(this.glyph, 'ClefError', "Can't set stave without glyph.");

      const numLines = this.stave.getNumLines();
      const point = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.point`);
      const shiftY = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.shiftY`);
      glyph.setPoint(point);
      glyph.setYShift(shiftY);
    }
    return this;
  }

  /** Render clef. */
  draw(): void {
    const glyph = defined(this.glyph, 'ClefError', "Can't draw clef without glyph.");
    const stave = this.checkStave();
    const ctx = stave.checkContext();
    this.setRendered();

    ctx.openGroup('clef', this.getAttribute('id'));
    glyph.setStave(stave);
    glyph.setContext(ctx);
    if (this.clef.line !== undefined) {
      this.placeGlyphOnLine(glyph, stave, this.clef.line);
    }
    glyph.renderToStave(this.x);

    if (this.annotation !== undefined && this.attachment !== undefined) {
      this.placeGlyphOnLine(this.attachment, stave, this.annotation.line);
      this.attachment.setStave(stave);
      this.attachment.setContext(ctx);
      this.attachment.renderToStave(this.x);
    }
    ctx.closeGroup();
  }
}
