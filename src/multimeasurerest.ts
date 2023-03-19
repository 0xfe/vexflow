// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements multiple measure rests.

import { Element } from './element';
import { Glyph } from './glyph';
import { NoteHead } from './notehead';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { TimeSignature } from './timesignature';
import { Category, isBarline } from './typeguard';
import { defined } from './util';

export interface MultimeasureRestRenderOptions {
  /** Extracted by Factory.MultiMeasureRest() and passed to the MultiMeasureRest constructor. */
  number_of_measures: number;

  /** Use rest symbols. Defaults to `false`, which renders a thick horizontal line with serifs at both ends. */
  use_symbols?: boolean;

  /** Horizontal spacing between rest symbol glyphs (if `use_symbols` is `true`).*/
  symbol_spacing?: number;

  /** Show the number of measures at the top. Defaults to `true`. */
  show_number?: boolean;

  /** Vertical position of the "number of measures" text (measured in stave lines). Defaults to -0.5, which is above the stave. 6.5 is below the stave. */
  number_line?: number;

  /** Font size of the "number of measures" text. */
  number_glyph_point?: number;

  /** Left padding from `stave.getX()`. */
  padding_left?: number;

  /** Right padding from `stave.getX() + stave.getWidth()` */
  padding_right?: number;

  /** Vertical position of the rest line or symbols, expressed as stave lines. Default: 2. The top stave line is 1, and the bottom stave line is 5. */
  line?: number;

  /** Defaults to the number of vertical pixels between stave lines. Used for serif height or 2-bar / 4-bar symbol height. */
  spacing_between_lines_px?: number;

  /** Size of the semibreve (1-bar) rest symbol. Other symbols are scaled accordingly. */
  semibreve_rest_glyph_scale?: number;

  /** Thickness of the rest line. Used when `use_symbols` is false. Defaults to half the space between stave lines. */
  line_thickness?: number;

  /** Thickness of the rest line's serif. Used when `use_symbols` is false. */
  serif_thickness?: number;
}

let semibreve_rest: { glyph_font_scale: number; glyph_code: string; width: number } | undefined;

function get_semibreve_rest() {
  if (!semibreve_rest) {
    const noteHead = new NoteHead({ duration: 'w', note_type: 'r' });
    semibreve_rest = {
      glyph_font_scale: noteHead.render_options.glyph_font_scale,
      glyph_code: noteHead.glyph_code,
      width: noteHead.getWidth(),
    };
  }
  return semibreve_rest;
}

export class MultiMeasureRest extends Element {
  static get CATEGORY(): string {
    return Category.MultiMeasureRest;
  }

  public render_options: Required<MultimeasureRestRenderOptions>;
  protected xs = { left: NaN, right: NaN };
  protected number_of_measures: number;

  protected stave?: Stave;

  private hasPaddingLeft = false;
  private hasPaddingRight = false;
  private hasLineThickness = false;
  private hasSymbolSpacing = false;

  /**
   *
   * @param number_of_measures Number of measures.
   * @param options The options object.
   */
  constructor(number_of_measures: number, options: MultimeasureRestRenderOptions) {
    super();

    this.number_of_measures = number_of_measures;

    // Keep track of whether these four options were provided.
    this.hasPaddingLeft = typeof options.padding_left === 'number';
    this.hasPaddingRight = typeof options.padding_right === 'number';
    this.hasLineThickness = typeof options.line_thickness === 'number';
    this.hasSymbolSpacing = typeof options.symbol_spacing === 'number';

    const musicFont = Tables.currentMusicFont();
    this.render_options = {
      use_symbols: false,
      show_number: true,
      number_line: -0.5,
      number_glyph_point: musicFont.lookupMetric('digits.point') ?? Tables.NOTATION_FONT_SCALE, // same as TimeSignature.
      line: 2,
      spacing_between_lines_px: Tables.STAVE_LINE_DISTANCE, // same as Stave.
      serif_thickness: 2,
      semibreve_rest_glyph_scale: Tables.NOTATION_FONT_SCALE, // same as NoteHead.
      padding_left: 0,
      padding_right: 0,
      line_thickness: 5,
      symbol_spacing: 0,
      ...options,
    };

    const fontLineShift = musicFont.lookupMetric('digits.shiftLine', 0);
    this.render_options.number_line += fontLineShift;
  }

  getXs(): { left: number; right: number } {
    return this.xs;
  }

  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  getStave(): Stave | undefined {
    return this.stave;
  }

  checkStave(): Stave {
    return defined(this.stave, 'NoStave', 'No stave attached to instance.');
  }

  drawLine(stave: Stave, ctx: RenderContext, left: number, right: number, spacingBetweenLines: number): void {
    const options = this.render_options;

    const y = stave.getYForLine(options.line);
    const padding = (right - left) * 0.1;
    left += padding;
    right -= padding;

    let lineThicknessHalf;
    if (this.hasLineThickness) {
      lineThicknessHalf = options.line_thickness * 0.5;
    } else {
      lineThicknessHalf = spacingBetweenLines * 0.25;
    }
    const serifThickness = options.serif_thickness;
    const top = y - spacingBetweenLines;
    const bot = y + spacingBetweenLines;
    const leftIndented = left + serifThickness;
    const rightIndented = right - serifThickness;
    const lineTop = y - lineThicknessHalf;
    const lineBottom = y + lineThicknessHalf;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(leftIndented, top);
    ctx.lineTo(leftIndented, lineTop);
    ctx.lineTo(rightIndented, lineTop);
    ctx.lineTo(rightIndented, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bot);
    ctx.lineTo(rightIndented, bot);
    ctx.lineTo(rightIndented, lineBottom);
    ctx.lineTo(leftIndented, lineBottom);
    ctx.lineTo(leftIndented, bot);
    ctx.lineTo(left, bot);
    ctx.closePath();
    ctx.fill();
  }

  drawSymbols(stave: Stave, ctx: RenderContext, left: number, right: number, spacingBetweenLines: number): void {
    const n4 = Math.floor(this.number_of_measures / 4);
    const n = this.number_of_measures % 4;
    const n2 = Math.floor(n / 2);
    const n1 = n % 2;

    const options = this.render_options;

    // FIXME: TODO: invalidate semibreve_rest at the appropriate time
    // (e.g., if the system font settings are changed).
    semibreve_rest = undefined;

    const rest = get_semibreve_rest();
    const rest_scale = options.semibreve_rest_glyph_scale;
    const rest_width = rest.width * (rest_scale / rest.glyph_font_scale);
    const glyphs = {
      2: {
        width: rest_width * 0.5,
        height: spacingBetweenLines,
      },
      1: {
        width: rest_width,
      },
    };

    /* 10: normal spacingBetweenLines */
    const spacing = this.hasSymbolSpacing ? options.symbol_spacing : 10;

    const width = n4 * glyphs[2].width + n2 * glyphs[2].width + n1 * glyphs[1].width + (n4 + n2 + n1 - 1) * spacing;
    let x = left + (right - left) * 0.5 - width * 0.5;
    const line = options.line;
    const yTop = stave.getYForLine(line - 1);
    const yMiddle = stave.getYForLine(line);
    const yBottom = stave.getYForLine(line + 1);

    ctx.save();
    ctx.setStrokeStyle('none');
    ctx.setLineWidth(0);

    for (let i = 0; i < n4; ++i) {
      ctx.fillRect(x, yMiddle - glyphs[2].height, glyphs[2].width, glyphs[2].height);
      ctx.fillRect(x, yBottom - glyphs[2].height, glyphs[2].width, glyphs[2].height);
      x += glyphs[2].width + spacing;
    }
    for (let i = 0; i < n2; ++i) {
      ctx.fillRect(x, yMiddle - glyphs[2].height, glyphs[2].width, glyphs[2].height);
      x += glyphs[2].width + spacing;
    }
    for (let i = 0; i < n1; ++i) {
      Glyph.renderGlyph(ctx, x, yTop, rest_scale, rest.glyph_code);
      x += glyphs[1].width + spacing;
    }

    ctx.restore();
  }

  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    const stave = this.checkStave();

    let left = stave.getNoteStartX();
    let right = stave.getNoteEndX();

    // FIXME: getNoteStartX() returns x + 5(barline width)
    //        getNoteEndX() returns x + width(no barline width)
    // See Stave constructor. How do we fix this?
    // Here, we subtract the barline width.
    const begModifiers = stave.getModifiers(StaveModifierPosition.BEGIN);
    if (begModifiers.length === 1 && isBarline(begModifiers[0])) {
      left -= begModifiers[0].getWidth();
    }

    const options = this.render_options;
    if (this.hasPaddingLeft) {
      left = stave.getX() + options.padding_left;
    }
    if (this.hasPaddingRight) {
      right = stave.getX() + stave.getWidth() - options.padding_right;
    }

    this.xs.left = left;
    this.xs.right = right;

    const spacingBetweenLines = options.spacing_between_lines_px;
    if (options.use_symbols) {
      this.drawSymbols(stave, ctx, left, right, spacingBetweenLines);
    } else {
      this.drawLine(stave, ctx, left, right, spacingBetweenLines);
    }

    if (options.show_number) {
      const timeSpec = '/' + this.number_of_measures;
      const timeSig = new TimeSignature(timeSpec, 0, false);
      timeSig.point = options.number_glyph_point;
      timeSig.setTimeSig(timeSpec);
      timeSig.setStave(stave);
      timeSig.setX(left + (right - left) * 0.5 - timeSig.getInfo().glyph.getMetrics().width * 0.5);
      timeSig.bottomLine = options.number_line;
      timeSig.setContext(ctx).draw();
    }
  }
}
