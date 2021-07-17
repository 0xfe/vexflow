// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
// MIT License

import { RuntimeError, log } from './util';
import { StaveModifier } from './stavemodifier';
import { Glyph } from './glyph';
import { Stave } from './stave';

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

  /** Clefs category string. */
  static get CATEGORY(): string {
    return 'clefs';
  }

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
    this.setAttribute('type', 'Clef');

    this.setPosition(StaveModifier.Position.BEGIN);
    this.setType(type, size, annotation);
    this.setWidth(this.musicFont.lookupMetric(`clef.${this.size}.width`));
    L('Creating clef:', type);
  }

  /** Get element category string. */
  getCategory(): string {
    return Clef.CATEGORY;
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
    if (this.type === 'tab' && !this.stave) {
      throw new RuntimeError('ClefError', "Can't get width without stave.");
    }

    return this.width;
  }

  /** Set associated stave. */
  setStave(stave: Stave): this {
    this.stave = stave;
    if (this.type !== 'tab') return this;
    if (!this.glyph) throw new RuntimeError('ClefError', "Can't set stave without glyph.");

    const numLines = this.stave.getOptions().num_lines;
    const point = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.point`);
    const shiftY = this.musicFont.lookupMetric(`clef.lineCount.${numLines}.shiftY`);
    this.glyph.setPoint(point);
    this.glyph.setYShift(shiftY);

    return this;
  }

  /** Render clef. */
  draw(): void {
    if (!this.x) throw new RuntimeError('ClefError', "Can't draw clef without x.");
    if (!this.stave) throw new RuntimeError('ClefError', "Can't draw clef without stave.");
    if (!this.glyph) throw new RuntimeError('ClefError', "Can't draw clef without glyph.");
    this.setRendered();

    this.glyph.setStave(this.stave);
    this.glyph.setContext(this.stave.getContext());
    if (this.clef.line !== undefined) {
      this.placeGlyphOnLine(this.glyph, this.stave, this.clef.line);
    }

    this.glyph.renderToStave(this.x);

    if (this.annotation !== undefined && this.attachment !== undefined) {
      this.placeGlyphOnLine(this.attachment, this.stave, this.annotation.line);
      this.attachment.setStave(this.stave);
      this.attachment.setContext(this.stave.getContext());
      this.attachment.renderToStave(this.x);
    }
  }
}
