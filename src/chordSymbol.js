// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements chord symbols as modifiers that can be attached to
// notes.  Chord symbols can contain multiple 'blocks' which can contain
// text or glyphs with various positioning options.
//
// See `tests/chordsymbol_tests.js` for usage examples.

import { Vex } from './vex';
import { Flow } from './tables';
import { Glyph } from './glyph';
import { Modifier } from './modifier';

// To enable logging for this class. Set `Vex.Flow.Annotation.DEBUG` to `true`.
function L(...args) { if (ChordSymbol.DEBUG) Vex.L('Vex.Flow.ChordSymbol', args); }

export class ChordSymbol extends Modifier {
  static get CATEGORY() { return 'chordSymbol'; }

  // Text annotations can be positioned and justified relative to the note.
  static get HorizontalJustify() {
    return {
      LEFT: 1,
      CENTER: 2,
      RIGHT: 3,
      CENTER_STEM: 4,
    };
  }

  static get HorizontalJustifyString() {
    return {
      left: ChordSymbol.HorizontalJustify.LEFT,
      right: ChordSymbol.HorizontalJustify.RIGHT,
      center: ChordSymbol.HorizontalJustify.CENTER,
      centerStem: ChordSymbol.HorizontalJustify.CENTER_STEM,
    };
  }


  static get VerticalJustify() {
    return {
      TOP: 1,
      BOTTOM: 2,
    };
  }

  static get VerticalJustifyString() {
    return {
      top: ChordSymbol.VerticalJustify.TOP,
      above: ChordSymbol.VerticalJustify.TOP,
      below: ChordSymbol.VerticalJustify.BOTTOM,
      bottom: ChordSymbol.VerticalJustify.BOTTOM
    };
  }

  // Glyph data
  static get GLYPHS() {
    return {
      'diminished': {
        code: 'csymDiminished',
        scale: 1,
        y_offset: 0
      },
      'dim': {
        code: 'csymDiminished',
        scale: 1,
        y_offset: 0
      },
      'halfDiminished': {
        code: 'csymHalfDiminished',
        scale: 1,
        y_offset: 0
      },
      '+': {
        code: 'csymAugmented',
        scale: 1,
        y_offset: 0
      },
      'augmented': {
        code: 'csymAugmented',
        scale: 1,
        y_offset: 0
      },
      'majorSeventh': {
        code: 'csymMajorSeventh',
        scale: 1,
        y_offset: 0
      },
      'minor': {
        code: 'csymMinor',
        scale: 1,
        y_offset: 0
      },
      '-': {
        code: 'csymMinor',
        scale: 1,
        y_offset: 0
      },
      '(': {
        code: 'csymParensLeftTall',
        scale: 0.8,
        y_offset: 1
      },
      'leftParen': {
        code: 'csymParensLeftTall',
        scale: 0.8,
        y_offset: 1
      },
      ')': {
        code: 'csymParensRightTall',
        scale: 0.8,
        y_offset: 1
      },
      'rightParen': {
        code: 'csymParensRightTall',
        scale: 0.8,
        y_offset: 1
      },
      'leftBracket': {
        code: 'csymBracketLeftTall',
        scale: 0.8,
        y_offset: 1
      },
      'rightBracket': {
        code: 'csymBracketRightTall',
        scale: 0.8,
        y_offset: 1
      },
      'leftParenTall': {
        code: 'csymParensLeftVeryTall',
        scale: 0.8,
        y_offset: 0
      },
      'rightParenTall': {
        code: 'csymParensRightVeryTall',
        scale: 0.8,
        y_offset: 0
      },
      '/': {
        code: 'csymDiagonalArrangementSlash',
        scale: 0.6,
        y_offset: 0
      },
      'over': {
        code: 'csymDiagonalArrangementSlash',
        scale: 0.6,
        y_offset: 0
      },
      '#': {
        code: 'accidentalSharp',
        scale: 1,
        y_offset: -4
      },
      'b': {
        code: 'accidentalFlat',
        scale: 1,
        y_offset: -2
      }
    };
  }

  static get SymbolTypes() {
    return {
      GLYPH: 1,
      TEXT: 2,
      LINE: 3
    };
  }

  static get SymbolModifiers() {
    return {
      NONE: 1,
      SUBSCRIPT: 2,
      SUPERSCRIPT: 3
    };
  }

  static get LowerKerningText() {
    return ['D', 'F', 'I', 'P', 'T', 'V', 'Y'];
  }

  static get UpperKerningText() {
    return ['A', 'I', 'L'];
  }

  // ### format
  // try to estimate the width of the whole chord symbol, based on the
  // sum of the widths of the individual blocks.  Also estimate how many
  // lines above/below the staff we need`
  static format(instances, state) {
    if (!instances || instances.length === 0) return false;

    let width = 0;
    let nonSuperWidth = 0;

    for (let i = 0; i < instances.length; ++i) {
      const instance = instances[i];
      let lineSpaces = 1;

      for (let j = 0; j < instance.symbolBlocks.length; ++j) {
        const symbol = instance.symbolBlocks[j];
        const sup = instance.isSuperscript(symbol);
        const sub = instance.isSubscript(symbol);

        // If there are super/subscripts, they extend beyond the line so
        // assume they take up 2 lines
        if (sup || sub) {
          lineSpaces = 2;
        }

        if (symbol.symbolType === ChordSymbol.SymbolTypes.GLYPH &&
          symbol.glyph.code === ChordSymbol.GLYPHS.over.code) {
          lineSpaces = 2;
          symbol.x_offset += -2;
        }

        if (j > 0 && instance.symbolBlocks[j - 1].symbolType === ChordSymbol.SymbolTypes.GLYPH &&
          instance.symbolBlocks[j - 1].glyph.code === ChordSymbol.GLYPHS.over.code) {
          symbol.x_offset += -2;
        }

        // If a subscript immediately  follows a superscript block, try to
        // overlay them.
        if (sup && j > 0) {
          const prev = instance.symbolBlocks[j - 1];
          if (!instance.isSuperscript(prev)) {
            nonSuperWidth = width;
            // If we have vertically lined up, turn kerning off.
            instance.setUseKerning(false);
          }
        }
        if (sub && nonSuperWidth > 0) {
          // slide the symbol over so it lines up with superscript
          symbol.x_offset = nonSuperWidth - width;
          width = nonSuperWidth - symbol.width;
          nonSuperWidth = 0;
        }
        if (!sup && !sub) {
          nonSuperWidth = 0;
        }
        width += symbol.width;
      }

      // make kerning adjustments after computing super/subscripts
      instance.updateKerningAjustments();

      if (instance.getVertical() === ChordSymbol.VerticalJustify.TOP) {
        instance.setTextLine(state.top_text_line);
        state.top_text_line += lineSpaces;
      } else {
        instance.setTextLine(state.text_line + 1);
        state.text_line += lineSpaces + 1;
      }
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }

  // ## Prototype Methods
  //
  // chordSymbol is a modifier that creates a chord symbol above/below a chord
  // This is the modifier version, meaning it is attached to an existing note.
  constructor() {
    super();
    this.setAttribute('type', 'ChordSymbol');
    this.note = null;
    this.index = null;
    this.symbolBlocks = [];
    this.horizontal = ChordSymbol.HorizontalJustify.CENTER_STEM;
    this.vertical = ChordSymbol.VerticalJustify.TOP;
    this.useKerning = true;

    let fontFamily = 'Arial';
    if (this.musicFont.name === 'Petaluma') {
      fontFamily = 'Cursive';
    }
    this.font = {
      family: fontFamily,
      size: 10,
      weight: '',
    };
  }

  updateKerningAjustments() {
    for (let j = 0; j < this.symbolBlocks.length; ++j) {
      const symbol = this.symbolBlocks[j];
      symbol.x_offset += this.getKerningAdjustment(j);
    }
  }

  // ### getKerningAdjustment
  // Do some very basic kerning so that letter chords like 'A' don't have
  // the extensions hanging off to the right.
  getKerningAdjustment(j) {
    if (!this.useKerning) {
      return 0;
    }
    const symbol = this.symbolBlocks[j];
    const prevSymbol = j > 0 ? this.symbolBlocks[j - 1] : null;
    let rv = 0;

    // Move things into the '/' over bar
    if (symbol.symbolType === ChordSymbol.SymbolTypes.GLYPH &&
      symbol.glyph.code === ChordSymbol.GLYPHS.over.code) {
      rv += -2;
    }

    if (prevSymbol !== null &&
      prevSymbol.symbolType === ChordSymbol.SymbolTypes.GLYPH &&
      prevSymbol.glyph.code === ChordSymbol.GLYPHS.over.code) {
      rv += -2;
    }

    // For superscripts that follow a letter without much top part, move it to the
    // left slightly
    let preKernUpper = false;
    let preKernLower = false;
    if (prevSymbol != null && prevSymbol.symbolType === ChordSymbol.SymbolTypes.TEXT) {
      preKernUpper = ChordSymbol.UpperKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
      preKernLower = ChordSymbol.LowerKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
    }

    if (preKernUpper && symbol.symbolModifier === ChordSymbol.SymbolModifiers.SUPERSCRIPT) {
      rv += -2;
    }

    if (preKernLower && symbol.symbolType === ChordSymbol.SymbolTypes.TEXT) {
      if (symbol.text[0] >= 'a' && symbol.text[0] <= 'z') {
        rv += -1;
      }
      if (ChordSymbol.UpperKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1])) {
        rv += -1;
      }
    }
    return rv;
  }

  // ### getSymbolBlock
  // ChordSymbol allows multiple blocks so we can mix glyphs and font text.
  // Each block can have its own vertical orientation
  getSymbolBlock(parameters) {
    parameters = parameters == null ? {} : parameters;
    const symbolType = (parameters.symbolType ? parameters.symbolType : ChordSymbol.SymbolTypes.TEXT);
    const text = parameters.text ? parameters.text : '';
    const symbolModifier = parameters.symbolModifier ? parameters.symbolModifier : ChordSymbol.SymbolModifiers.NONE;
    const x_offset = 0;
    const y_offset = 0;

    const rv = {
      text, symbolType, symbolModifier, x_offset, y_offset
    };

    rv.width = 0;
    if (symbolType === ChordSymbol.SymbolTypes.GLYPH && typeof(parameters.glyph) === 'string') {
      const glyphArgs = ChordSymbol.GLYPHS[parameters.glyph];
      let glyphPoints = 20 * glyphArgs.scale;
      // super and subscript are smaller
      if (symbolModifier !== ChordSymbol.SymbolModifiers.NONE) {
        glyphPoints = glyphPoints / 1.3;
      }
      rv.glyph = new Glyph(glyphArgs.code, glyphPoints, { category: 'chordSymbol' });
      rv.width = (rv.glyph.getMetrics().width * 3) / 2;
      rv.y_offset = glyphArgs.y_offset;
    } else if (symbolType === ChordSymbol.SymbolTypes.TEXT) {
      rv.width = Flow.textWidth(text);
    } else if (symbolType === ChordSymbol.SymbolTypes.LINE) {
      rv.width = parameters.width;
    }

    return rv;
  }

  addSymbolBlock(parameters) {
    this.symbolBlocks.push(this.getSymbolBlock(parameters));
    return this;
  }

  // ### Convenience functions follow that let you create different types of
  // chord symbol parts easily
  addText(text, parameters) {
    parameters = parameters == null ? {} : parameters;
    parameters.text = text;
    parameters.symbolType = ChordSymbol.SymbolTypes.TEXT;
    return this.addSymbolBlock(parameters);
  }

  addSuperText(text) {
    const symbolType = ChordSymbol.SymbolTypes.TEXT;
    const symbolModifier = ChordSymbol.SymbolModifiers.SUPERSCRIPT;
    return this.addSymbolBlock({ text, symbolType, symbolModifier });
  }

  addSubText(text) {
    const symbolType = ChordSymbol.SymbolTypes.TEXT;
    const symbolModifier = ChordSymbol.SymbolModifiers.SUBSCRIPT;
    return this.addSymbolBlock({ text, symbolType, symbolModifier });
  }

  addSuperGlyph(glyph) {
    const symbolType = ChordSymbol.SymbolTypes.GLYPH;
    const symbolModifier = ChordSymbol.SymbolModifiers.SUPERSCRIPT;
    return this.addSymbolBlock({ glyph, symbolType, symbolModifier });
  }

  addGlyph(glyph, parameters) {
    parameters = parameters == null ? {} : parameters;
    parameters.glyph = glyph;
    parameters.symbolType = ChordSymbol.SymbolTypes.GLYPH;
    return this.addSymbolBlock(parameters);
  }

  addGlyphOrText(text, parameters) {
    parameters = parameters == null ? {} : parameters;
    let str = '';
    for (let i = 0; i < text.length; ++i) {
      if (ChordSymbol.GLYPHS[text[i]]) {
        if (str.length > 0) {
          this.addText(str, parameters);
          str = '';
        }
        this.addGlyph(text[i], parameters);
      } else {
        str += text[i];
      }
    }
    if (str.length > 0) {
      this.addText(str, parameters);
    }
    return this;
  }

  addLine(width, parameters) {
    parameters = parameters == null ? {} : parameters;
    parameters.symbolType = ChordSymbol.SymbolTypes.LINE;
    parameters.width = width;
    return this.addSymbolBlock(parameters);
  }

  getCategory() { return ChordSymbol.CATEGORY; }

  // Set font family, size, and weight. E.g., `Arial`, `10pt`, `Bold`.
  setFont(family, size, weight) {
    this.font = { family, size, weight };
    return this;
  }

  setUseKerning(val) {
    this.useKerning = val;
    return this;
  }

  // Set vertical position of text (above or below stave). `just` must be
  // a value in `Annotation.VerticalJustify`.
  setVertical(just) {
    this.vertical = typeof (just) === 'string'
      ? ChordSymbol.VerticalJustifyString[just]
      : just;
    return this;
  }
  getVertical() {
    return this.vertical;
  }

  // Get and set horizontal justification. `justification` is a value in
  // `Annotation.Justify`.
  setHorizontal(just) {
    this.horizontal = typeof (just) === 'string'
      ? ChordSymbol.HorizontalJustifyString[just]
      : just;
    return this;
  }

  getWidth() {
    let rv = 0;
    this.symbolBlocks.forEach((symbol) => {
      rv += symbol.width;
    });
    return rv;
  }

  isSuperscript(symbol) {
    return symbol.symbolModifier !== null && symbol.symbolModifier === ChordSymbol.SymbolModifiers.SUPERSCRIPT;
  }

  isSubscript(symbol) {
    return symbol.symbolModifier !== null && symbol.symbolModifier === ChordSymbol.SymbolModifiers.SUBSCRIPT;
  }

  // Render text and glyphs above/below the note
  draw() {
    this.checkContext();

    if (!this.note) {
      throw new Vex.RERR(
        'NoNoteForAnnotation', "Can't draw text annotation without an attached note."
      );
    }

    this.setRendered();
    const start = this.note.getModifierStartXY(Modifier.Position.ABOVE,
      this.index);

    // We're changing context parameters. Save current state.
    this.context.save();
    this.context.setFont(this.font.family, this.font.size, this.font.weight);

    let y;

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

    if (this.vertical === ChordSymbol.VerticalJustify.BOTTOM) {
      // HACK: We need to compensate for the text's height since its origin
      // is bottom-right.
      y = stave.getYForBottomText(this.text_line + Flow.TEXT_HEIGHT_OFFSET_HACK);
      if (has_stem) {
        const stem_base = (this.note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY);
        y = Math.max(y, stem_base + (spacing * (this.text_line + 2)));
      }
    } else  { // (this.vertical === ChordSymbol.VerticalJustify.TOP)
      y = Math.min(stave.getYForTopText(this.text_line), this.note.getYs()[0] - 10);
      if (has_stem) {
        y = Math.min(y, (stem_ext.topY - 5) - (spacing * this.text_line));
      }
    }

    let x = start.x;
    if (this.horizontal === ChordSymbol.HorizontalJustify.LEFT) {
      x = start.x;
    } else if (this.horizontal === ChordSymbol.HorizontalJustify.RIGHT) {
      x = start.x - this.getWidth();
    } else if (this.horizontal === ChordSymbol.HorizontalJustify.CENTER) {
      x = start.x - this.getWidth() / 2;
    } else /* CENTER_STEM */ {
      x = this.note.getStemX() -  this.getWidth() / 2;
    }
    this.symbolBlocks.forEach((symbol) => {
      const sp = this.isSuperscript(symbol);
      const sub = this.isSubscript(symbol);
      let curY = y;

      if (sp) {
        curY -= 8;
      }
      if (sub) {
        curY += 4;
      }

      if (symbol.symbolType === ChordSymbol.SymbolTypes.TEXT) {
        if (sp || sub) {
          this.context.save();
          this.context.setFont(this.font.family, this.font.size / 1.3, this.font.weight);
        }
        // We estimate the text width, fill it in with the empirical value so the
        // formatting is even.
        symbol.width = this.context.measureText(symbol.text).width;
        symbol.width = (symbol.width * 4) / 3;
        this.context.fillText(symbol.text, x + symbol.x_offset, curY);
        if (sp || sub) {
          this.context.restore();
        }
      } else if (symbol.symbolType === ChordSymbol.SymbolTypes.GLYPH) {
        curY += symbol.y_offset;
        curY += (symbol.glyph.bbox.h > 12 ? symbol.glyph.bbox.h - 12 : 0);
        symbol.glyph.render(this.context, x + symbol.x_offset, curY);
      } else if (symbol.symbolType === ChordSymbol.SymbolTypes.LINE) {
        this.context.beginPath();
        this.context.setLineWidth(1); // ?
        this.context.moveTo(x, y);
        this.context.lineTo(x + symbol.width, curY);
        this.context.stroke();
      }

      x += symbol.width + symbol.x_offset;
    });

    L('Rendering annotation: ', this.text, x, y);
    this.context.restore();
  }
}
