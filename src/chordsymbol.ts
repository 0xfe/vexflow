// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Author: @AaronDavidNewman
//
// This implements chord symbols as modifiers that can be attached to notes.
// Chord symbols can contain multiple 'blocks' which can contain
// text or glyphs with various positioning options.
//
// See `tests/chordsymbol_tests.ts` for usage examples.

import { log } from './util';
import { Flow } from './flow';
import { Glyph } from './glyph';
import { TextFont } from './textfont';
import { Modifier } from './modifier';
import { FontInfo } from './types/common';
import { StemmableNote } from './stemmablenote';
import { ModifierContextState } from 'modifiercontext';

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

export enum HorizontalJustify {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
  CENTER_STEM = 4,
}

export enum VerticalJustify {
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
    return 'ChordSymbol';
  }

  protected symbolBlocks: ChordSymbolBlock[];
  protected horizontal: number;
  protected vertical: number;
  protected useKerning: boolean;
  protected reportWidth: boolean;
  protected font: FontInfo;
  protected textFont: TextFont;
  /** Currently unused. */
  protected static noFormat: boolean = false;

  // Chord symbols can be positioned and justified relative to the note.
  static readonly horizontalJustify = HorizontalJustify;

  static readonly horizontalJustifyString: Record<string, HorizontalJustify> = {
    left: HorizontalJustify.LEFT,
    right: HorizontalJustify.RIGHT,
    center: HorizontalJustify.CENTER,
    centerStem: HorizontalJustify.CENTER_STEM,
  };

  static readonly verticalJustify = VerticalJustify;

  static readonly verticalJustifyString: Record<string, VerticalJustify> = {
    top: VerticalJustify.TOP,
    above: VerticalJustify.TOP,
    below: VerticalJustify.BOTTOM,
    bottom: VerticalJustify.BOTTOM,
  };

  static get superSubRatio(): number {
    return ChordSymbol.chordSymbolMetrics.global.superSubRatio;
  }

  /** Currently unused: Globally turn off text formatting, if the built-in formatting does not work for your font. */
  static set NO_TEXT_FORMAT(val: boolean) {
    ChordSymbol.noFormat = val;
  }

  static get NO_TEXT_FORMAT(): boolean {
    return ChordSymbol.noFormat;
  }

  // eslint-disable-next-line
  static getMetricForGlyph(glyphCode: string): any {
    if (ChordSymbol.chordSymbolMetrics[glyphCode]) {
      return ChordSymbol.chordSymbolMetrics[glyphCode];
    }
    return undefined;
  }

  getYOffsetForText(text: string): number {
    let acc = 0;
    let ix = 0;
    const resolution = this.textFont.resolution;
    for (ix = 0; ix < text.length; ++ix) {
      const metric = this.textFont.getMetricForCharacter(text[ix]);

      if (metric) {
        acc = metric.y_max < acc ? metric.y_max : acc;
      }
    }

    return ix > 0 ? -1 * (acc / resolution) : 0;
  }

  static get engravingFontResolution(): number {
    return Flow.DEFAULT_FONT_STACK[0].getResolution();
  }

  static get spacingBetweenBlocks(): number {
    return ChordSymbol.chordSymbolMetrics.global.spacing / ChordSymbol.engravingFontResolution;
  }

  getWidthForCharacter(c: string): number {
    return this.textFont.getMetricForCharacter(c).advanceWidth / this.textFont.resolution;
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
    return ChordSymbol.chordSymbolMetrics.global.superscriptOffset / ChordSymbol.engravingFontResolution;
  }

  static get subscriptOffset(): number {
    return ChordSymbol.chordSymbolMetrics.global.subscriptOffset / ChordSymbol.engravingFontResolution;
  }

  static get kerningOffset(): number {
    return ChordSymbol.chordSymbolMetrics.global.kerningOffset / ChordSymbol.engravingFontResolution;
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

  // eslint-disable-next-line
  static get chordSymbolMetrics(): any {
    return Flow.DEFAULT_FONT_STACK[0].getMetrics().glyphs.chordSymbol;
  }

  static get lowerKerningText(): string[] {
    return Flow.DEFAULT_FONT_STACK[0].getMetrics().glyphs.chordSymbol.global.lowerKerningText;
  }

  static get upperKerningText(): string[] {
    return Flow.DEFAULT_FONT_STACK[0].getMetrics().glyphs.chordSymbol.global.upperKerningText;
  }

  /**
   * Estimate the width of the whole chord symbol, based on the sum of the widths of the individual blocks.
   * Estimate how many lines above/below the staff we need.
   */
  static format(instances: ChordSymbol[], state: ModifierContextState): boolean {
    if (!instances || instances.length === 0) return false;

    let width = 0;
    let nonSuperWidth = 0;
    const reportedWidths = [];

    for (let i = 0; i < instances.length; ++i) {
      const instance = instances[i];
      const fontAdj = instance.font.size / 20;
      const glyphAdj = fontAdj * 2;
      let lineSpaces = 1;
      let vAlign = false;

      for (let j = 0; j < instance.symbolBlocks.length; ++j) {
        const symbol = instance.symbolBlocks[j];
        const sup = instance.isSuperscript(symbol);
        const sub = instance.isSubscript(symbol);
        const subAdj = sup || sub ? ChordSymbol.superSubRatio : 1;
        const adj = symbol.symbolType === SymbolTypes.GLYPH ? glyphAdj * subAdj : fontAdj * subAdj;

        // If there are super/subscripts, they extend beyond the line so
        // assume they take up 2 lines
        if (sup || sub) {
          lineSpaces = 2;
        }

        // If there is a symbol-specific offset, add it but consider font
        // size since font and glyphs will be interspersed
        if (symbol.symbolType === SymbolTypes.GLYPH && symbol.glyph !== undefined) {
          symbol.yShift += ChordSymbol.getYShiftForGlyph(symbol.glyph) * instance.pointsToPixels * subAdj;
          symbol.xShift += ChordSymbol.getXShiftForGlyph(symbol.glyph) * instance.pointsToPixels * subAdj;
          symbol.glyph.scale = symbol.glyph.scale * adj;
          symbol.width = ChordSymbol.getWidthForGlyph(symbol.glyph) * instance.pointsToPixels * subAdj;
        } else if (symbol.symbolType === SymbolTypes.TEXT) {
          symbol.width = symbol.width * instance.textFont.pointsToPixels * subAdj;
          symbol.yShift += instance.getYOffsetForText(symbol.text) * adj;
        }

        if (
          symbol.symbolType === SymbolTypes.GLYPH &&
          symbol.glyph !== undefined &&
          symbol.glyph.code === ChordSymbol.glyphs.over.code
        ) {
          lineSpaces = 2;
        }
        symbol.width += ChordSymbol.spacingBetweenBlocks * instance.pointsToPixels * subAdj;

        // If a subscript immediately  follows a superscript block, try to
        // overlay them.
        if (sup && j > 0) {
          const prev = instance.symbolBlocks[j - 1];
          if (!instance.isSuperscript(prev)) {
            nonSuperWidth = width;
          }
        }
        if (sub && nonSuperWidth > 0) {
          vAlign = true;
          // slide the symbol over so it lines up with superscript
          symbol.xShift = symbol.xShift + (nonSuperWidth - width);
          width = nonSuperWidth;
          nonSuperWidth = 0;
          // If we have vertically lined up, turn kerning off.
          instance.setEnableKerning(false);
        }
        if (!sup && !sub) {
          nonSuperWidth = 0;
        }
        symbol.vAlign = vAlign;
        width += symbol.width;
      }

      // make kerning adjustments after computing super/subscripts
      instance.updateKerningAdjustments();
      instance.updateOverBarAdjustments();

      if (instance.getVertical() === VerticalJustify.TOP) {
        instance.setTextLine(state.top_text_line);
        state.top_text_line += lineSpaces;
      } else {
        instance.setTextLine(state.text_line + 1);
        state.text_line += lineSpaces + 1;
      }
      if (instance.getReportWidth()) {
        reportedWidths.push(width);
      } else {
        reportedWidths.push(0);
      }
    }

    width = reportedWidths.reduce((a, b) => a + b, 0);

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }

  constructor() {
    super();
    this.symbolBlocks = [];
    this.horizontal = HorizontalJustify.LEFT;
    this.vertical = VerticalJustify.TOP;
    this.useKerning = true;
    this.reportWidth = true;

    let fontFamily = 'Arial';
    if (this.musicFont.getName() === 'Petaluma') {
      fontFamily = 'petalumaScript,Arial';
    } else {
      fontFamily = 'Roboto Slab,Times';
    }
    this.font = {
      family: fontFamily,
      size: 12,
      weight: '',
    };
    this.textFont = TextFont.getTextFontFromVexFontData(this.font);
  }

  // ### pointsToPixels
  // The font size is specified in points, convert to 'pixels' in the svg space
  get pointsToPixels(): number {
    return this.textFont.pointsToPixels;
  }

  get superscriptOffset(): number {
    return ChordSymbol.superscriptOffset * this.pointsToPixels;
  }

  get subscriptOffset(): number {
    return ChordSymbol.subscriptOffset * this.pointsToPixels;
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
    const yoff = 0.25 * this.pointsToPixels;
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

    const kerningOffsetPixels = ChordSymbol.kerningOffset * this.pointsToPixels;
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

    // Note: all symbol widths are resolution and font-independent.
    // We convert to pixel values when we know what the font is.
    if (symbolType === SymbolTypes.GLYPH && typeof params.glyph === 'string') {
      const glyphArgs = ChordSymbol.glyphs[params.glyph];
      const glyphPoints = 20;
      symbolBlock.glyph = new Glyph(glyphArgs.code, glyphPoints, { category: 'chordSymbol' });
      // Beware: glyph.metrics is not the same as glyph.getMetrics() !
      // rv.glyph.point = rv.glyph.point * rv.glyph.metrics.scale;
      // rv.width = rv.glyph.getMetrics().width;
      // don't set yShift here, b/c we need to do it at formatting time after the font is set.
    } else if (symbolType === SymbolTypes.TEXT) {
      let textWidth = 0;
      for (let i = 0; i < symbolBlock.text.length; ++i) {
        textWidth += this.getWidthForCharacter(symbolBlock.text[i]);
      }
      symbolBlock.width = textWidth;
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

  // Set font family, size, and weight. E.g., `Arial`, `10pt`, `Bold`.
  setFont(family: string, size: number, weight: string): this {
    this.font = { family, size, weight };
    this.textFont = TextFont.getTextFontFromVexFontData(this.font);
    return this;
  }

  setFontSize(size: number): this {
    this.font.size = size;
    this.textFont.setFontSize(size);
    return this;
  }

  setEnableKerning(val: boolean): this {
    this.useKerning = val;
    return this;
  }

  /** Set vertical position of text (above or below stave). */
  setVertical(vj: VerticalJustify | string | number): this {
    this.vertical = typeof vj === 'string' ? ChordSymbol.verticalJustifyString[vj] : vj;
    return this;
  }

  getVertical(): number {
    return this.vertical;
  }

  /** Set horizontal justification. */
  setHorizontal(hj: HorizontalJustify | string | number): this {
    this.horizontal = typeof hj === 'string' ? ChordSymbol.horizontalJustifyString[hj] : hj;
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

  isSuperscript(symbol: ChordSymbolBlock): boolean {
    return symbol.symbolModifier !== undefined && symbol.symbolModifier === SymbolModifiers.SUPERSCRIPT;
  }

  isSubscript(symbol: ChordSymbolBlock): boolean {
    return symbol.symbolModifier !== undefined && symbol.symbolModifier === SymbolModifiers.SUBSCRIPT;
  }

  /** Render text and glyphs above/below the note. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote() as StemmableNote;
    this.setRendered();

    // We're changing context parameters. Save current state.
    ctx.save();
    const classString = Object.keys(this.getAttribute('classes')).join(' ');
    ctx.openGroup(classString, this.getAttribute('id'));

    const start = note.getModifierStartXY(Modifier.Position.ABOVE, this.index);
    ctx.setFont(this.font.family, this.font.size, this.font.weight);

    let y: number;

    // The position of the text varies based on whether or not the note
    // has a stem.
    const hasStem = note.hasStem();
    const stave = note.checkStave();

    if (this.vertical === VerticalJustify.BOTTOM) {
      // HACK: We need to compensate for the text's height since its origin is bottom-right.
      y = stave.getYForBottomText(this.text_line + Flow.TEXT_HEIGHT_OFFSET_HACK);
      if (hasStem) {
        const stem_ext = note.checkStem().getExtents();
        const spacing = stave.getSpacingBetweenLines();
        const stem_base = note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY;
        y = Math.max(y, stem_base + spacing * (this.text_line + 2));
      }
    } else {
      // (this.vertical === VerticalJustify.TOP)
      y = Math.min(stave.getYForTopText(this.text_line), note.getYs()[0] - 10);
      if (hasStem) {
        const stem_ext = note.checkStem().getExtents();
        const spacing = stave.getSpacingBetweenLines();
        y = Math.min(y, stem_ext.topY - 5 - spacing * this.text_line);
      }
    }

    let x = start.x;
    if (this.horizontal === HorizontalJustify.LEFT) {
      x = start.x;
    } else if (this.horizontal === HorizontalJustify.RIGHT) {
      x = start.x + this.getWidth();
    } else if (this.horizontal === HorizontalJustify.CENTER) {
      x = start.x - this.getWidth() / 2;
    } else {
      // HorizontalJustify.CENTER_STEM
      x = note.getStemX() - this.getWidth() / 2;
    }
    L('Rendering ChordSymbol: ', this.textFont, x, y);

    this.symbolBlocks.forEach((symbol) => {
      const sp = this.isSuperscript(symbol);
      const sub = this.isSubscript(symbol);
      let curY = y;
      L('shift was ', symbol.xShift, symbol.yShift);
      L('curY pre sub ', curY);
      if (sp) {
        curY += this.superscriptOffset;
      }
      if (sub) {
        curY += this.subscriptOffset;
      }
      L('curY sup/sub ', curY);

      if (symbol.symbolType === SymbolTypes.TEXT) {
        if (sp || sub) {
          ctx.save();
          ctx.setFont(this.font.family, this.font.size * ChordSymbol.superSubRatio, this.font.weight);
        }
        // TODO???
        // We estimate the text width, fill it in with the empirical value so the formatting is even.
        // const textDim = ctx.measureText(symbol.text);
        // symbol.width = textDim.width;

        L('Rendering Text: ', symbol.text, x + symbol.xShift, curY + symbol.yShift);

        ctx.fillText(symbol.text, x + symbol.xShift, curY + symbol.yShift);
        if (sp || sub) {
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
    ctx.restore();
  }
}
