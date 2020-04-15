// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `TextNote` is a notation element that is positioned in time. Generally
// meant for objects that sit above/below the staff and inline with each other.
// Examples of this would be such as dynamics, lyrics, chord changes, etc.

import { Vex } from './vex';
import { Note } from './note';
import { Glyph } from './glyph';

export class TextNote extends Note {
  static get Justification() {
    return {
      LEFT: 1,
      CENTER: 2,
      RIGHT: 3,
    };
  }

  // Glyph data
  static get GLYPHS() {
    return {
      'segno': {
        code: 'segno',
      },
      'tr': {
        code: 'ornamentTrill',
      },
      'mordent': {
        code: 'ornamentMordent',
      },
      'mordent_upper': {
        code: 'ornamentShortTrill',
      },
      'mordent_lower': {
        code: 'ornamentMordent',
      },
      'f': {
        code: 'dynamicForte',
      },
      'p': {
        code: 'dynamicPiano',
      },
      'm': {
        code: 'dynamicMezzo',
      },
      's': {
        code: 'dynamicSforzando',
      },
      'z': {
        code: 'dynamicZ',
      },
      'coda': {
        code: 'coda',
      },
      'pedal_open': {
        code: 'keyboardPedalPed',
      },
      'pedal_close': {
        code: 'keyboardPedalUp',
      },
      'caesura_straight': {
        code: 'caesura',
      },
      'caesura_curved': {
        code: 'caesuraCurved',
      },
      'breath': {
        code: 'breathMarkComma',
      },
      'tick': {
        code: 'breathMarkTick',
      },
      'turn': {
        code: 'ornamentTurn',
      },
      'turn_inverted': {
        code: 'ornamentTurnSlash',
      },
    };
  }

  constructor(options) {
    super(options);
    this.setAttribute('type', 'TextNote');

    // Note properties
    this.text = options.text;
    this.superscript = options.superscript;
    this.subscript = options.subscript;
    this.glyph = null;
    this.font = {
      family: 'Arial',
      size: 12,
      weight: '',
      ...options.font
    };

    // Determine and set initial note width. Note that the text width is
    // an approximation and isn't very accurate. The only way to accurately
    // measure the length of text is with `canvasmeasureText()`
    if (options.glyph) {
      const struct = TextNote.GLYPHS[options.glyph];
      if (!struct) throw new Vex.RERR('Invalid glyph type: ' + options.glyph);

      this.glyph = new Glyph(struct.code, 40, { category: 'textNote' });
      this.setWidth(this.glyph.getMetrics().width);
    }

    this.line = options.line || 0;
    this.smooth = options.smooth || false;
    this.ignore_ticks = options.ignore_ticks || false;
    this.justification = TextNote.Justification.LEFT;
  }

  // Set the horizontal justification of the TextNote
  setJustification(just) {
    this.justification = just;
    return this;
  }

  // Set the Stave line on which the note should be placed
  setLine(line) {
    this.line = line;
    return this;
  }

  // Pre-render formatting
  preFormat() {
    this.checkContext();

    if (this.preFormatted) return;

    if (this.smooth) {
      this.setWidth(0);
    } else {
      if (this.glyph) {
        // Width already set.
      } else {
        this.context.setFont(this.font.family, this.font.size, this.font.weight);
        this.setWidth(this.context.measureText(this.text).width);
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

  // Renders the TextNote
  draw() {
    this.checkContext();

    if (!this.stave) {
      throw new Vex.RERR('NoStave', "Can't draw without a stave.");
    }

    this.setRendered();
    const ctx = this.context;

    // Reposition to center of note head
    let x = this.getAbsoluteX() + (this.tickContext.getMetrics().glyphPx / 2);

    // Align based on tick-context width.
    const width = this.getWidth();

    if (this.justification === TextNote.Justification.CENTER) {
      x -= width / 2;
    } else if (this.justification === TextNote.Justification.RIGHT) {
      x -= width;
    }

    let y;
    if (this.glyph) {
      y = this.stave.getYForLine(this.line + -3);
      this.glyph.render(this.context, x, y);
    } else {
      y = this.stave.getYForLine(this.line + -3);
      this.applyStyle(ctx);
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      ctx.fillText(this.text, x, y);

      const height = ctx.measureText(this.text).height;

      // Write superscript
      if (this.superscript) {
        ctx.setFont(this.font.family, this.font.size / 1.3, this.font.weight);
        ctx.fillText(this.superscript, x + width + 2, y - (height / 2.2));
      }

      // Write subscript
      if (this.subscript) {
        ctx.setFont(this.font.family, this.font.size / 1.3, this.font.weight);
        ctx.fillText(this.subscript, x + width + 2, y + (height / 2.2) - 1);
      }

      this.restoreStyle(ctx);
    }
  }
}
