// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `TextNote` is a notation element that is positioned in time. Generally
// meant for objects that sit above/below the staff and inline with each other.
// Examples of this would be such as dynamics, lyrics, chord changes, etc.

import { Vex } from './vex';
import { Flow } from './tables';
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
        x_shift: 0,
        y_shift: -10,
        // width: 10 // optional
      },
      'tr': {
        code: 'ornamentTrill',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'mordent_upper': {
        code: 'ornamentShortTrill',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'mordent_lower': {
        code: 'ornamentMordent',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'f': {
        code: 'dynamicForte',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'p': {
        code: 'dynamicPiano',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'm': {
        code: 'dynamicMezzo',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      's': {
        code: 'dynamicSforzando',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'z': {
        code: 'dynamicZ',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
      'coda': {
        code: 'coda',
        x_shift: 0,
        y_shift: -8,
        // width: 10 // optional
      },
      'pedal_open': {
        code: 'keyboardPedalPed',
        x_shift: 0,
        y_shift: 0,
      },
      'pedal_close': {
        code: 'keyboardPedalUp',
        x_shift: 0,
        y_shift: 3,
      },
      'caesura_straight': {
        code: 'caesura',
        x_shift: 0,
        y_shift: 2,
      },
      'caesura_curved': {
        code: 'caesuraCurved',
        x_shift: 0,
        y_shift: 2,
      },
      'breath': {
        code: 'breathMarkComma',
        x_shift: 0,
        y_shift: 0,
      },
      'tick': {
        code: 'breathMarkTick',
        x_shift: 0,
        y_shift: 0,
      },
      'turn': {
        code: 'ornamentTurn',
        x_shift: 0,
        y_shift: 0,
      },
      'turn_inverted': {
        code: 'ornamentTurnSlash',
        x_shift: 0,
        y_shift: 0,
      },

      // DEPRECATED - please use "mordent_upper" or "mordent_lower"
      'mordent': {
        code: 'ornamentMordent',
        x_shift: 0,
        y_shift: 0,
        // width: 10 // optional
      },
    };
  }

  constructor(text_struct) {
    super(text_struct);
    this.setAttribute('type', 'TextNote');

    // Note properties
    this.text = text_struct.text;
    this.superscript = text_struct.superscript;
    this.subscript = text_struct.subscript;
    this.glyph_type = text_struct.glyph;
    this.glyph = null;
    this.font = {
      family: 'Arial',
      size: 12,
      weight: '',
    };

    // Set font
    if (text_struct.font) this.font = text_struct.font;

    // Determine and set initial note width. Note that the text width is
    // an approximation and isn't very accurate. The only way to accurately
    // measure the length of text is with `canvasmeasureText()`
    if (this.glyph_type) {
      const defaultPoint = 40;
      const struct = TextNote.GLYPHS[this.glyph_type];
      if (!struct) throw new Vex.RERR('Invalid glyph type: ' + this.glyph_type);

      this.glyph = new Glyph(struct.code, defaultPoint, { category: 'textNote' });

      if (struct.width) {
        this.setWidth(struct.width);
      } else {
        this.setWidth(this.glyph.getMetrics().width);
      }

      this.glyph_struct = struct;
    } else {
      this.setWidth(Flow.textWidth(this.text));
    }
    this.line = text_struct.line || 0;
    this.smooth = text_struct.smooth || false;
    this.ignore_ticks = text_struct.ignore_ticks || false;
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
        this.setWidth(this.context.measureText(this.text).width);
      }
    }

    if (this.justification === TextNote.Justification.CENTER) {
      this.extraLeftPx = this.width / 2;
    } else if (this.justification === TextNote.Justification.RIGHT) {
      this.extraLeftPx = this.width;
    }

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
    let x = this.getAbsoluteX();
    if (this.justification === TextNote.Justification.CENTER) {
      x -= this.getWidth() / 2;
    } else if (this.justification === TextNote.Justification.RIGHT) {
      x -= this.getWidth();
    }

    let y;
    if (this.glyph) {
      y = this.stave.getYForLine(this.line + -3);
      this.glyph.render(
        this.context,
        x + this.glyph_struct.x_shift,
        y + this.glyph_struct.y_shift
      );
    } else {
      y = this.stave.getYForLine(this.line + -3);
      this.applyStyle(ctx);
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      ctx.fillText(this.text, x, y);

      // Width of the letter M gives us the approximate height of the text
      const height = ctx.measureText('M').width;
      // Get accurate width of text
      const width = ctx.measureText(this.text).width;

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
