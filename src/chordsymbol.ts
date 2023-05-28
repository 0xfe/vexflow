// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Author: Aaron (@AaronDavidNewman)
//
// This implements chord symbols above/below a chord.
// Chord symbols are modifiers that can be attached to notes.
// They can contain multiple 'blocks' which represent text or
// glyphs with various positioning options.
//
// See `tests/chordsymbol_tests.ts` for usage examples.

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Glyph } from './glyph';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { Note } from './note';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { TextFormatter } from './textformatter';
import { Category, isStemmableNote } from './typeguard';
import { log, RuntimeError } from './util';

// To enable logging for this class. Set `Vex.Flow.ChordSymbol.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any[]): void {
  if (ChordSymbol.DEBUG) log('Vex.Flow.ChordSymbol', args);
}

export interface ChordSymbolBlock {
  text: string;
  symbolType: SymbolTypes;
  symbolModifier: SymbolModifiers;
  xShift: number;
  yShift: number;
  vAlign: boolean;
  width: number;
  glyph?: Glyph;
}

export interface ChordSymbolGlyphMetrics {
  leftSideBearing: number;
  advanceWidth: number;
  yOffset: number;
}

export interface ChordSymbolMetrics {
  global: {
    superscriptOffset: number;
    subscriptOffset: number;
    kerningOffset: number;
    lowerKerningText: string[];
    upperKerningText: string[];
    spacing: number;
    superSubRatio: number;
  };
  glyphs: Record<string, ChordSymbolGlyphMetrics>;
}

export enum ChordSymbolHorizontalJustify {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
  CENTER_STEM = 4,
}

export enum ChordSymbolVerticalJustify {
  TOP = 1,
  BOTTOM = 2,
}

export enum SymbolTypes {
  GLYPH = 1,
  TEXT = 2,
  LINE = 3,
}

export enum SymbolModifiers {
  NONE = 1,
  SUBSCRIPT = 2,
  SUPERSCRIPT = 3,
}

/**
 * ChordSymbol is a modifier that creates a chord symbol above/below a chord.
 * As a modifier, it is attached to an existing note.
 */
export class ChordSymbol extends Modifier {
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.ChordSymbol;
  }

  // Chord symbols can be positioned and justified relative to the note.
  static readonly HorizontalJustify = ChordSymbolHorizontalJustify;

  static readonly HorizontalJustifyString: Record<string, ChordSymbolHorizontalJustify> = {
    left: ChordSymbolHorizontalJustify.LEFT,
    right: ChordSymbolHorizontalJustify.RIGHT,
    center: ChordSymbolHorizontalJustify.CENTER,
    centerStem: ChordSymbolHorizontalJustify.CENTER_STEM,
  };

  static readonly VerticalJustify = ChordSymbolVerticalJustify;

  static readonly VerticalJustifyString: Record<string, ChordSymbolVerticalJustify> = {
    top: ChordSymbolVerticalJustify.TOP,
    above: ChordSymbolVerticalJustify.TOP,
    below: ChordSymbolVerticalJustify.BOTTOM,
    bottom: ChordSymbolVerticalJustify.BOTTOM,
  };

  static get superSubRatio(): number {
    return ChordSymbol.metrics.global.superSubRatio;
  }

  /** Currently unused: Globally turn off text formatting, if the built-in formatting does not work for your font. */
  static set NO_TEXT_FORMAT(val: boolean) {
    ChordSymbol.noFormat = val;
  }

  static get NO_TEXT_FORMAT(): boolean {
    return ChordSymbol.noFormat;
  }

  static getMetricForGlyph(glyphCode: string): ChordSymbolGlyphMetrics | undefined {
    if (ChordSymbol.metrics.glyphs[glyphCode]) {
      return ChordSymbol.metrics.glyphs[glyphCode];
    }
    return undefined;
  }

  static get engravingFontResolution(): number {
    return Tables.currentMusicFont().getResolution();
  }

  static get spacingBetweenBlocks(): number {
    return ChordSymbol.metrics.global.spacing / ChordSymbol.engravingFontResolution;
  }

  static getWidthForGlyph(glyph: Glyph): number {
    const metric = ChordSymbol.getMetricForGlyph(glyph.code);
    if (!metric) {
      return 0.65; // probably should do something here.
    }
    return metric.advanceWidth / ChordSymbol.engravingFontResolution;
  }

  static getYShiftForGlyph(glyph: Glyph): number {
    const metric = ChordSymbol.getMetricForGlyph(glyph.code);
    if (!metric) {
      return 0;
    }
    return metric.yOffset / ChordSymbol.engravingFontResolution;
  }

  static getXShiftForGlyph(glyph: Glyph): number {
    const metric = ChordSymbol.getMetricForGlyph(glyph.code);
    if (!metric) {
      return 0;
    }
    return (-1 * metric.leftSideBearing) / ChordSymbol.engravingFontResolution;
  }

  static get superscriptOffset(): number {
    return ChordSymbol.metrics.global.superscriptOffset / ChordSymbol.engravingFontResolution;
  }

  static get subscriptOffset(): number {
    return ChordSymbol.metrics.global.subscriptOffset / ChordSymbol.engravingFontResolution;
  }

  static get kerningOffset(): number {
    return ChordSymbol.metrics.global.kerningOffset / ChordSymbol.engravingFontResolution;
  }

  // Glyph data
  static readonly glyphs: Record<string, { code: string }> = {
    diminished: {
      code: 'csymDiminished',
    },
    dim: {
      code: 'csymDiminished',
    },
    halfDiminished: {
      code: 'csymHalfDiminished',
    },
    '+': {
      code: 'csymAugmented',
    },
    augmented: {
      code: 'csymAugmented',
    },
    majorSeventh: {
      code: 'csymMajorSeventh',
    },
    minor: {
      code: 'csymMinor',
    },
    '-': {
      code: 'csymMinor',
    },
    '(': {
      code: 'csymParensLeftTall',
    },
    leftParen: {
      code: 'csymParensLeftTall',
    },
    ')': {
      code: 'csymParensRightTall',
    },
    rightParen: {
      code: 'csymParensRightTall',
    },
    leftBracket: {
      code: 'csymBracketLeftTall',
    },
    rightBracket: {
      code: 'csymBracketRightTall',
    },
    leftParenTall: {
      code: 'csymParensLeftVeryTall',
    },
    rightParenTall: {
      code: 'csymParensRightVeryTall',
    },
    '/': {
      code: 'csymDiagonalArrangementSlash',
    },
    over: {
      code: 'csymDiagonalArrangementSlash',
    },
    '#': {
      code: 'accidentalSharp',
    },
    b: {
      code: 'accidentalFlat',
    },
  };

  static readonly symbolTypes = SymbolTypes;

  static readonly symbolModifiers = SymbolModifiers;

  static get metrics(): ChordSymbolMetrics {
    const chordSymbol = Tables.currentMusicFont().getMetrics().chordSymbol;

    if (!chordSymbol) throw new RuntimeError('BadMetrics', `chordSymbol missing`);
    return chordSymbol;
  }

  static get lowerKerningText(): string[] {
    // For example, see: `bravura_metrics.ts`
    // BravuraMetrics.glyphs.chordSymbol.global.lowerKerningText, which returns an array of letters.
    // ['D', 'F', 'P', 'T', 'V', 'Y']
    return ChordSymbol.metrics.global.lowerKerningText;
  }

  static get upperKerningText(): string[] {
    return ChordSymbol.metrics.global.upperKerningText;
  }

  static isSuperscript(block: ChordSymbolBlock): boolean {
    return block.symbolModifier !== undefined && block.symbolModifier === SymbolModifiers.SUPERSCRIPT;
  }

  static isSubscript(block: ChordSymbolBlock): boolean {
    return block.symbolModifier !== undefined && block.symbolModifier === SymbolModifiers.SUBSCRIPT;
  }

  static get minPadding(): number {
    const musicFont = Tables.currentMusicFont();
    return musicFont.lookupMetric('noteHead.minPadding');
  }
  /**
   * Estimate the width of the whole chord symbol, based on the sum of the widths of the individual blocks.
   * Estimate how many lines above/below the staff we need.
   */
  static format(symbols: ChordSymbol[], state: ModifierContextState): boolean {
    if (!symbols || symbols.length === 0) return false;

    let width = 0;
    let nonSuperWidth = 0;
    let leftWidth = 0;
    let rightWidth = 0;
    let maxLeftGlyphWidth = 0;
    let maxRightGlyphWidth = 0;

    for (const symbol of symbols) {
      const fontSize = Font.convertSizeToPointValue(symbol.textFont?.size);
      const fontAdj = Font.scaleSize(fontSize, 0.05);
      const glyphAdj = fontAdj * 2;
      const note: Note = symbol.checkAttachedNote();
      let symbolWidth = 0;
      let lineSpaces = 1;
      let vAlign = false;

      for (let j = 0; j < symbol.symbolBlocks.length; ++j) {
        const block = symbol.symbolBlocks[j];
        const sup = ChordSymbol.isSuperscript(block);
        const sub = ChordSymbol.isSubscript(block);
        const superSubScale = sup || sub ? ChordSymbol.superSubRatio : 1;
        const adj = block.symbolType === SymbolTypes.GLYPH ? glyphAdj * superSubScale : fontAdj * superSubScale;

        // If there are super/subscripts, they extend beyond the line so
        // assume they take up 2 lines
        if (sup || sub) {
          lineSpaces = 2;
        }

        // If there is a symbol-specific offset, add it but consider font
        // size since font and glyphs will be interspersed.
        const fontSize = symbol.textFormatter.fontSizeInPixels;
        const superSubFontSize = fontSize * superSubScale;
        if (block.symbolType === SymbolTypes.GLYPH && block.glyph !== undefined) {
          block.width = ChordSymbol.getWidthForGlyph(block.glyph) * superSubFontSize;
          block.yShift += ChordSymbol.getYShiftForGlyph(block.glyph) * superSubFontSize;
          block.xShift += ChordSymbol.getXShiftForGlyph(block.glyph) * superSubFontSize;
          block.glyph.scale = block.glyph.scale * adj;
        } else if (block.symbolType === SymbolTypes.TEXT) {
          block.width = block.width * superSubFontSize;
          block.yShift += symbol.getYOffsetForText(block.text) * adj;
        }

        if (
          block.symbolType === SymbolTypes.GLYPH &&
          block.glyph !== undefined &&
          block.glyph.code === ChordSymbol.glyphs.over.code
        ) {
          lineSpaces = 2;
        }
        block.width += ChordSymbol.spacingBetweenBlocks * fontSize * superSubScale;

        // If a subscript immediately  follows a superscript block, try to
        // overlay them.
        if (sup && j > 0) {
          const prev = symbol.symbolBlocks[j - 1];
          if (!ChordSymbol.isSuperscript(prev)) {
            nonSuperWidth = width;
          }
        }
        if (sub && nonSuperWidth > 0) {
          vAlign = true;
          // slide the symbol over so it lines up with superscript
          block.xShift = block.xShift + (nonSuperWidth - width);
          width = nonSuperWidth;
          nonSuperWidth = 0;
          // If we have vertically lined up, turn kerning off.
          symbol.setEnableKerning(false);
        }
        if (!sup && !sub) {
          nonSuperWidth = 0;
        }
        block.vAlign = vAlign;
        width += block.width;
        symbolWidth = width;
      }

      // make kerning adjustments after computing super/subscripts
      symbol.updateKerningAdjustments();
      symbol.updateOverBarAdjustments();

      if (symbol.getVertical() === ChordSymbolVerticalJustify.TOP) {
        symbol.setTextLine(state.top_text_line);
        state.top_text_line += lineSpaces;
      } else {
        symbol.setTextLine(state.text_line + 1);
        state.text_line += lineSpaces + 1;
      }
      if (symbol.getReportWidth() && isStemmableNote(note)) {
        const glyphWidth = note.getGlyphProps().getWidth();
        if (symbol.getHorizontal() === ChordSymbolHorizontalJustify.LEFT) {
          maxLeftGlyphWidth = Math.max(glyphWidth, maxLeftGlyphWidth);
          leftWidth = Math.max(leftWidth, symbolWidth) + ChordSymbol.minPadding;
        } else if (symbol.getHorizontal() === ChordSymbolHorizontalJustify.RIGHT) {
          maxRightGlyphWidth = Math.max(glyphWidth, maxRightGlyphWidth);
          rightWidth = Math.max(rightWidth, symbolWidth);
        } else {
          leftWidth = Math.max(leftWidth, symbolWidth / 2) + ChordSymbol.minPadding;
          rightWidth = Math.max(rightWidth, symbolWidth / 2);
          maxLeftGlyphWidth = Math.max(glyphWidth / 2, maxLeftGlyphWidth);
          maxRightGlyphWidth = Math.max(glyphWidth / 2, maxRightGlyphWidth);
        }
      }
      width = 0; // reset symbol width
    }
    const rightOverlap = Math.min(
      Math.max(rightWidth - maxRightGlyphWidth, 0),
      Math.max(rightWidth - state.right_shift, 0)
    );
    const leftOverlap = Math.min(Math.max(leftWidth - maxLeftGlyphWidth, 0), Math.max(leftWidth - state.left_shift, 0));

    state.left_shift += leftOverlap;
    state.right_shift += rightOverlap;
    return true;
  }

  /** Currently unused. */
  protected static noFormat: boolean = false;

  protected symbolBlocks: ChordSymbolBlock[] = [];
  protected horizontal: number = ChordSymbolHorizontalJustify.LEFT;
  protected vertical: number = ChordSymbolVerticalJustify.TOP;
  protected useKerning: boolean = true;
  protected reportWidth: boolean = true;

  // Initialized by the constructor via this.setFont().
  protected textFormatter!: TextFormatter;

  constructor() {
    super();
    this.resetFont();
  }

  /**
   * Default text font.
   * Choose a font family that works well with the current music engraving font.
   * @override `Element.TEXT_FONT`.
   */
  static get TEXT_FONT(): Required<FontInfo> {
    let family = 'Roboto Slab, Times, serif';
    if (Tables.currentMusicFont().getName() === 'Petaluma') {
      // Fixes Issue #1180
      family = 'PetalumaScript, Arial, sans-serif';
    }
    return {
      family,
      size: 12,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    };
  }

  /**
   * The offset is specified in `em`. Scale this value by the font size in pixels.
   */
  get superscriptOffset(): number {
    return ChordSymbol.superscriptOffset * this.textFormatter.fontSizeInPixels;
  }

  get subscriptOffset(): number {
    return ChordSymbol.subscriptOffset * this.textFormatter.fontSizeInPixels;
  }

  setReportWidth(value: boolean): this {
    this.reportWidth = value;
    return this;
  }

  getReportWidth(): boolean {
    return this.reportWidth;
  }

  updateOverBarAdjustments(): void {
    const barIndex = this.symbolBlocks.findIndex(
      ({ symbolType, glyph }: ChordSymbolBlock) =>
        symbolType === SymbolTypes.GLYPH && glyph !== undefined && glyph.code === 'csymDiagonalArrangementSlash'
    );

    if (barIndex < 0) {
      return;
    }
    const bar = this.symbolBlocks[barIndex];
    const xoff = bar.width / 4;
    const yoff = 0.25 * this.textFormatter.fontSizeInPixels;
    let symIndex = 0;
    for (symIndex === 0; symIndex < barIndex; ++symIndex) {
      const symbol = this.symbolBlocks[symIndex];
      symbol.xShift = symbol.xShift + xoff;
      symbol.yShift = symbol.yShift - yoff;
    }

    for (symIndex = barIndex + 1; symIndex < this.symbolBlocks.length; ++symIndex) {
      const symbol = this.symbolBlocks[symIndex];
      symbol.xShift = symbol.xShift - xoff;
      symbol.yShift = symbol.yShift + yoff;
    }
  }

  updateKerningAdjustments(): void {
    let accum = 0;
    for (let j = 0; j < this.symbolBlocks.length; ++j) {
      const symbol = this.symbolBlocks[j];
      accum += this.getKerningAdjustment(j);
      symbol.xShift += accum;
    }
  }

  /** Do some basic kerning so that letter chords like 'A' don't have the extensions hanging off to the right. */
  getKerningAdjustment(j: number): number {
    if (!this.useKerning) {
      return 0;
    }
    const currSymbol = this.symbolBlocks[j];
    const prevSymbol = j > 0 ? this.symbolBlocks[j - 1] : undefined;
    let adjustment = 0;

    // Move things into the '/' over bar
    if (
      currSymbol.symbolType === SymbolTypes.GLYPH &&
      currSymbol.glyph !== undefined &&
      currSymbol.glyph.code === ChordSymbol.glyphs.over.code
    ) {
      adjustment += currSymbol.glyph.metrics.x_shift;
    }

    if (
      prevSymbol !== undefined &&
      prevSymbol.symbolType === SymbolTypes.GLYPH &&
      prevSymbol.glyph !== undefined &&
      prevSymbol.glyph.code === ChordSymbol.glyphs.over.code
    ) {
      adjustment += prevSymbol.glyph.metrics.x_shift;
    }

    // For superscripts that follow a letter without much top part, move it to the left slightly
    let preKernUpper = false;
    let preKernLower = false;
    if (prevSymbol !== undefined && prevSymbol.symbolType === SymbolTypes.TEXT) {
      preKernUpper = ChordSymbol.upperKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
      preKernLower = ChordSymbol.lowerKerningText.some((xx) => xx === prevSymbol.text[prevSymbol.text.length - 1]);
    }

    const kerningOffsetPixels = ChordSymbol.kerningOffset * this.textFormatter.fontSizeInPixels;
    // TODO: adjust kern for font size.
    // Where should this constant live?
    if (preKernUpper && currSymbol.symbolModifier === SymbolModifiers.SUPERSCRIPT) {
      adjustment += kerningOffsetPixels;
    }

    if (preKernLower && currSymbol.symbolType === SymbolTypes.TEXT) {
      if (currSymbol.text[0] >= 'a' && currSymbol.text[0] <= 'z') {
        adjustment += kerningOffsetPixels / 2;
      }
      if (ChordSymbol.upperKerningText.some((xx) => xx === prevSymbol?.text[prevSymbol.text.length - 1])) {
        adjustment += kerningOffsetPixels / 2;
      }
    }
    return adjustment;
  }

  /**
   * ChordSymbol allows multiple blocks so we can mix glyphs and font text.
   * Each block can have its own vertical orientation.
   */
  // eslint-disable-next-line
  getSymbolBlock(params: any = {}): ChordSymbolBlock {
    const symbolType = params.symbolType ?? SymbolTypes.TEXT;
    const symbolBlock: ChordSymbolBlock = {
      text: params.text ?? '',
      symbolType,
      symbolModifier: params.symbolModifier ?? SymbolModifiers.NONE,
      xShift: 0,
      yShift: 0,
      vAlign: false,
      width: 0,
    };

    // Note: symbol widths are resolution and font-independent.
    // We convert to pixel values when we know what the font is.
    if (symbolType === SymbolTypes.GLYPH && typeof params.glyph === 'string') {
      const glyphArgs = ChordSymbol.glyphs[params.glyph];
      const glyphPoints = 20;
      symbolBlock.glyph = new Glyph(glyphArgs.code, glyphPoints, { category: 'chordSymbol' });
    } else if (symbolType === SymbolTypes.TEXT) {
      symbolBlock.width = this.textFormatter.getWidthForTextInEm(symbolBlock.text);
    } else if (symbolType === SymbolTypes.LINE) {
      symbolBlock.width = params.width;
    }

    return symbolBlock;
  }

  /** Add a symbol to this chord, could be text, glyph or line. */
  // eslint-disable-next-line
  addSymbolBlock(parameters: any): this {
    this.symbolBlocks.push(this.getSymbolBlock(parameters));
    return this;
  }

  // ### Convenience functions for creating different types of chord symbol parts.

  /** Add a text block. */
  // eslint-disable-next-line
  addText(text: string, parameters: any = {}): this {
    const symbolType = SymbolTypes.TEXT;
    return this.addSymbolBlock({ ...parameters, text, symbolType });
  }

  /** Add a text block with superscript modifier. */
  addTextSuperscript(text: string): this {
    const symbolType = SymbolTypes.TEXT;
    const symbolModifier = SymbolModifiers.SUPERSCRIPT;
    return this.addSymbolBlock({ text, symbolType, symbolModifier });
  }

  /** Add a text block with subscript modifier. */
  addTextSubscript(text: string): this {
    const symbolType = SymbolTypes.TEXT;
    const symbolModifier = SymbolModifiers.SUBSCRIPT;
    return this.addSymbolBlock({ text, symbolType, symbolModifier });
  }

  /** Add a glyph block with superscript modifier. */
  addGlyphSuperscript(glyph: string): this {
    const symbolType = SymbolTypes.GLYPH;
    const symbolModifier = SymbolModifiers.SUPERSCRIPT;
    return this.addSymbolBlock({ glyph, symbolType, symbolModifier });
  }

  /** Add a glyph block. */
  // eslint-disable-next-line
  addGlyph(glyph: string, params: any = {}): this {
    const symbolType = SymbolTypes.GLYPH;
    return this.addSymbolBlock({ ...params, glyph, symbolType });
  }

  /**
   * Add a glyph for each character in 'text'. If the glyph is not available, use text from the font.
   * e.g. `addGlyphOrText('(+5#11)')` will use text for the '5' and '11', and glyphs for everything else.
   */
  // eslint-disable-next-line
  addGlyphOrText(text: string, params: any = {}): this {
    let str = '';
    for (let i = 0; i < text.length; ++i) {
      const char = text[i];
      if (ChordSymbol.glyphs[char]) {
        if (str.length > 0) {
          this.addText(str, params);
          str = '';
        }
        this.addGlyph(char, params);
      } else {
        // Collect consecutive characters with no glyphs.
        str += char;
      }
    }
    if (str.length > 0) {
      this.addText(str, params);
    }
    return this;
  }

  /** Add a line of the given width, used as a continuation of the previous symbol in analysis, or lyrics, etc. */
  // eslint-disable-next-line
  addLine(width: number, params: any = {}): this {
    const symbolType = SymbolTypes.LINE;
    return this.addSymbolBlock({ ...params, symbolType, width });
  }

  /**
   * Set the chord symbol's font family, size, weight, style (e.g., `Arial`, `10pt`, `bold`, `italic`).
   *
   * @param f is 1) a `FontInfo` object or
   *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
   *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
   * @param style is a string (e.g., 'italic', 'normal').
   *
   * @override See: Element.
   */
  setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    super.setFont(f, size, weight, style);
    this.textFormatter = TextFormatter.create(this.textFont);
    return this;
  }

  setEnableKerning(val: boolean): this {
    this.useKerning = val;
    return this;
  }

  /** Set vertical position of text (above or below stave). */
  setVertical(vj: ChordSymbolVerticalJustify | string | number): this {
    this.vertical = typeof vj === 'string' ? ChordSymbol.VerticalJustifyString[vj] : vj;
    return this;
  }

  getVertical(): number {
    return this.vertical;
  }

  /** Set horizontal justification. */
  setHorizontal(hj: ChordSymbolHorizontalJustify | string | number): this {
    this.horizontal = typeof hj === 'string' ? ChordSymbol.HorizontalJustifyString[hj] : hj;
    return this;
  }

  getHorizontal(): number {
    return this.horizontal;
  }

  getWidth(): number {
    let width = 0;
    this.symbolBlocks.forEach((symbol) => {
      width += symbol.vAlign ? 0 : symbol.width;
    });
    return width;
  }

  getYOffsetForText(text: string): number {
    let acc = 0;
    let i = 0;
    for (i = 0; i < text.length; ++i) {
      const metrics = this.textFormatter.getGlyphMetrics(text[i]);
      if (metrics) {
        const yMax = metrics.y_max ?? 0;
        acc = yMax < acc ? yMax : acc;
      }
    }

    const resolution = this.textFormatter.getResolution();
    return i > 0 ? -1 * (acc / resolution) : 0;
  }

  /** Render text and glyphs above/below the note. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote() as StemmableNote;
    this.setRendered();

    // We're changing context parameters. Save current state.
    ctx.save();
    this.applyStyle();
    ctx.openGroup('chordsymbol', this.getAttribute('id'));

    const start = note.getModifierStartXY(Modifier.Position.ABOVE, this.index);
    ctx.setFont(this.textFont);

    let y: number;

    // The position of the text varies based on whether or not the note
    // has a stem.
    const hasStem = note.hasStem();
    const stave = note.checkStave();

    if (this.vertical === ChordSymbolVerticalJustify.BOTTOM) {
      // HACK: We need to compensate for the text's height since its origin is bottom-right.
      y = stave.getYForBottomText(this.text_line + Tables.TEXT_HEIGHT_OFFSET_HACK);
      if (hasStem) {
        const stem_ext = note.checkStem().getExtents();
        const spacing = stave.getSpacingBetweenLines();
        const stem_base = note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY;
        y = Math.max(y, stem_base + spacing * (this.text_line + 2));
      }
    } else {
      // (this.vertical === VerticalJustify.TOP)
      const topY = Math.min(...note.getYs());
      y = Math.min(stave.getYForTopText(this.text_line), topY - 10);
      if (hasStem) {
        const stem_ext = note.checkStem().getExtents();
        const spacing = stave.getSpacingBetweenLines();
        y = Math.min(y, stem_ext.topY - 5 - spacing * this.text_line);
      }
    }

    let x = start.x;
    if (this.horizontal === ChordSymbolHorizontalJustify.LEFT) {
      x = start.x;
    } else if (this.horizontal === ChordSymbolHorizontalJustify.RIGHT) {
      x = start.x + this.getWidth();
    } else if (this.horizontal === ChordSymbolHorizontalJustify.CENTER) {
      x = start.x - this.getWidth() / 2;
    } else {
      // HorizontalJustify.CENTER_STEM
      x = note.getStemX() - this.getWidth() / 2;
    }
    L('Rendering ChordSymbol: ', this.textFormatter, x, y);

    this.symbolBlocks.forEach((symbol) => {
      const isSuper = ChordSymbol.isSuperscript(symbol);
      const isSub = ChordSymbol.isSubscript(symbol);
      let curY = y;
      L('shift was ', symbol.xShift, symbol.yShift);
      L('curY pre sub ', curY);
      if (isSuper) {
        curY += this.superscriptOffset;
      }
      if (isSub) {
        curY += this.subscriptOffset;
      }
      L('curY sup/sub ', curY);

      if (symbol.symbolType === SymbolTypes.TEXT) {
        if (isSuper || isSub) {
          ctx.save();
          if (this.textFont) {
            const { family, size, weight, style } = this.textFont;
            const smallerFontSize = Font.scaleSize(size, ChordSymbol.superSubRatio);
            ctx.setFont(family, smallerFontSize, weight, style);
          }
        }
        // TODO???
        // We estimate the text width, fill it in with the empirical value so the formatting is even.
        // const textDim = ctx.measureText(symbol.text);
        // symbol.width = textDim.width;

        L('Rendering Text: ', symbol.text, x + symbol.xShift, curY + symbol.yShift);

        ctx.fillText(symbol.text, x + symbol.xShift, curY + symbol.yShift);
        if (isSuper || isSub) {
          ctx.restore();
        }
      } else if (symbol.symbolType === SymbolTypes.GLYPH && symbol.glyph) {
        curY += symbol.yShift;
        L('Rendering Glyph: ', symbol.glyph.code, x + symbol.xShift, curY);
        symbol.glyph.render(ctx, x + symbol.xShift, curY);
      } else if (symbol.symbolType === SymbolTypes.LINE) {
        L('Rendering Line : ', symbol.width, x, curY);
        ctx.beginPath();
        ctx.setLineWidth(1); // ?
        ctx.moveTo(x, y);
        ctx.lineTo(x + symbol.width, curY);
        ctx.stroke();
      }

      x += symbol.width;
      if (symbol.vAlign) {
        x += symbol.xShift;
      }
    });
    ctx.closeGroup();
    this.restoreStyle();
    ctx.restore();
  }
}
