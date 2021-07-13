// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { RuntimeError } from './util';
import { Note, NoteStruct } from './note';
import { Glyph } from './glyph';
import { FontInfo } from './types/common';

export enum Justification {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
}

export interface TextNoteStruct extends NoteStruct {
  ignore_ticks?: boolean;
  smooth?: boolean;
  glyph?: string;
  font?: FontInfo;
  subscript?: string;
  superscript?: string;
  text: string;
}

/**
 * `TextNote` is a notation element that is positioned in time. Generally
 * meant for objects that sit above/below the staff and inline with each other.
 * Examples of this would be such as dynamics, lyrics, chord changes, etc.
 */
export class TextNote extends Note {
  protected text: string;
  protected superscript?: string;
  protected subscript?: string;
  protected smooth: boolean;

  protected font: FontInfo;
  protected justification: Justification;
  protected line: number;

  static get Justification(): typeof Justification {
    return Justification;
  }

  /** Glyph data. */
  static get GLYPHS(): Record<string, { code: string }> {
    return {
      segno: {
        code: 'segno',
      },
      tr: {
        code: 'ornamentTrill',
      },
      mordent: {
        code: 'ornamentMordent',
      },
      mordent_upper: {
        code: 'ornamentShortTrill',
      },
      mordent_lower: {
        code: 'ornamentMordent',
      },
      f: {
        code: 'dynamicForte',
      },
      p: {
        code: 'dynamicPiano',
      },
      m: {
        code: 'dynamicMezzo',
      },
      s: {
        code: 'dynamicSforzando',
      },
      z: {
        code: 'dynamicZ',
      },
      coda: {
        code: 'coda',
      },
      pedal_open: {
        code: 'keyboardPedalPed',
      },
      pedal_close: {
        code: 'keyboardPedalUp',
      },
      caesura_straight: {
        code: 'caesura',
      },
      caesura_curved: {
        code: 'caesuraCurved',
      },
      breath: {
        code: 'breathMarkComma',
      },
      tick: {
        code: 'breathMarkTick',
      },
      turn: {
        code: 'ornamentTurn',
      },
      turn_inverted: {
        code: 'ornamentTurnSlash',
      },
    };
  }

  constructor(options: TextNoteStruct) {
    super(options);
    this.setAttribute('type', 'TextNote');

    // Note properties
    this.text = options.text;
    this.superscript = options.superscript;
    this.subscript = options.subscript;
    this.glyph = undefined;
    this.font = {
      family: 'Arial',
      size: 12,
      weight: '',
      ...options.font,
    };

    // Determine and set initial note width. Note that the text width is
    // an approximation and isn't very accurate. The only way to accurately
    // measure the length of text is with `canvasmeasureText()`
    if (options.glyph) {
      const struct = TextNote.GLYPHS[options.glyph];
      if (!struct) throw new RuntimeError('Invalid glyph type: ' + options.glyph);

      this.glyph = new Glyph(struct.code, 40, { category: 'textNote' });
      this.setWidth(this.glyph.getMetrics().width);
    }

    this.line = options.line || 0;
    this.smooth = options.smooth || false;
    this.ignore_ticks = options.ignore_ticks || false;
    this.justification = TextNote.Justification.LEFT;
  }

  /** Set the horizontal justification of the TextNote. */
  setJustification(just: Justification): this {
    this.justification = just;
    return this;
  }

  /** Set the Stave line on which the note should be placed. */
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  /** Pre-render formatting. */
  preFormat(): void {
    const ctx = this.checkContext();
    if (!this.tickContext) throw new RuntimeError('NoTickContext', "Can't preformat without a TickContext.");

    if (this.preFormatted) return;

    if (this.smooth) {
      this.setWidth(0);
    } else {
      if (this.glyph) {
        // Width already set.
      } else {
        ctx.setFont(this.font.family, this.font.size, this.font.weight);
        this.setWidth(ctx.measureText(this.text).width);
      }
    }

    if (this.justification === TextNote.Justification.CENTER) {
      this.leftDisplacedHeadPx = this.width / 2;
    } else if (this.justification === TextNote.Justification.RIGHT) {
      this.leftDisplacedHeadPx = this.width;
    }

    // We reposition to the center of the note head
    this.rightDisplacedHeadPx = this.tickContext.getMetrics().glyphPx / 2;
    this.setPreFormatted(true);
  }

  /** Renders the TextNote. */
  draw(): void {
    const ctx = this.checkContext();
    const stave = this.checkStave();
    if (!this.tickContext) throw new RuntimeError('NoTickContext', "Can't draw without a TickContext.");

    this.setRendered();

    // Reposition to center of note head
    let x = this.getAbsoluteX() + this.tickContext.getMetrics().glyphPx / 2;

    // Align based on tick-context width.
    const width = this.getWidth();

    if (this.justification === TextNote.Justification.CENTER) {
      x -= width / 2;
    } else if (this.justification === TextNote.Justification.RIGHT) {
      x -= width;
    }

    let y;
    if (this.glyph) {
      y = stave.getYForLine(this.line + -3);
      this.glyph.render(ctx, x, y);
    } else {
      y = stave.getYForLine(this.line + -3);
      this.applyStyle(ctx);
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      ctx.fillText(this.text, x, y);

      let height = ctx.measureText(this.text).height;
      // CanvasRenderingContext2D.measureText() does not have a height field.
      if (typeof height === 'undefined') {
        // TODO: Consolidate calls to ctx.measureText('M').
        height = ctx.measureText('M').width;
      }

      // Write superscript
      if (this.superscript) {
        ctx.setFont(this.font.family, this.font.size / 1.3, this.font.weight);
        ctx.fillText(this.superscript, x + width + 2, y - height / 2.2);
      }

      // Write subscript
      if (this.subscript) {
        ctx.setFont(this.font.family, this.font.size / 1.3, this.font.weight);
        ctx.fillText(this.subscript, x + width + 2, y + height / 2.2 - 1);
      }

      this.restoreStyle(ctx);
    }
  }
}
