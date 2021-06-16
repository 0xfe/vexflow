// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements multiple measure rests

import { RuntimeError } from './util';
import { Flow } from './flow';
import { Element } from './element';
import { Glyph } from './glyph';
import { NoteHead } from './notehead';
import { StaveModifier } from './stavemodifier';
import { TimeSignature } from './timesignature';
import { Stave } from './stave';
import { RenderContext } from './types/common';
import { Barline } from './stavebarline';

export interface MultimeasureRestRenderOptions {
  number_of_measures?: number;
  padding_left?: number;
  line: number;
  number_glyph_point: number;
  show_number: boolean;
  line_thickness?: number;
  symbol_spacing?: number;
  serif_thickness: number;
  use_symbols: boolean;
  number_line: number;
  spacing_between_lines_px: number;
  semibrave_rest_glyph_scale: number;
  padding_right?: number;
}

let semibrave_rest: {
  glyph_font_scale: number;
  glyph_code: string;
  width: number;
};

function get_semibrave_rest() {
  if (!semibrave_rest) {
    const notehead = new NoteHead({ duration: 'w', note_type: 'r' });
    semibrave_rest = {
      glyph_font_scale: notehead.render_options.glyph_font_scale,
      glyph_code: notehead.glyph_code,
      width: notehead.getWidth(),
    };
  }
  return semibrave_rest;
}

export class MultiMeasureRest extends Element {
  protected render_options: MultimeasureRestRenderOptions;
  protected xs: { left: number; right: number };
  protected number_of_measures: number;

  protected stave?: Stave;
  // Parameters:
  // * `number_of_measures` - Number of measures.
  // * `options` - The options object.
  //   * `show_number` - Show number of measures string or not.
  //   * `number_line` -  Staff line to render the number of measures string.
  //   * `number_glyph_point` - Size of the number of measures string glyphs.
  //   * `padding_left` - Left padding from stave x.
  //   * `padding_right` - Right padding from stave end x.
  //   * `line` - Staff line to render rest line or rest symbols.
  //   * `spacing_between_lines_px` - Spacing between staff lines to
  // resolve serif height or {2-bar and 4-bar}rest symbol height.
  //   * `line_thickness` - Rest line thickness.
  //   * `serif_thickness` - Rest serif line thickness.
  //   * `use_symbols` - Use rest symbols or not.
  //   * `symbol_spacing` - Spacing between each rest symbol glyphs.
  //   * `semibrave_rest_glyph_scale` - Size of the semibrave(1-bar) rest symbol.
  constructor(number_of_measures: number, options: MultimeasureRestRenderOptions) {
    super();
    this.setAttribute('type', 'MultiMeasureRest');

    const point = this.musicFont.lookupMetric('digits.point');
    const fontLineShift = this.musicFont.lookupMetric('digits.shiftLine', 0);

    this.render_options = {
      show_number: true,
      number_line: -0.5,
      number_glyph_point: point, // same as TimeSignature.

      line: 2,

      spacing_between_lines_px: 10, // same as Stave.

      serif_thickness: 2,

      use_symbols: false,

      /* same as NoteHead. */
      semibrave_rest_glyph_scale: Flow.DEFAULT_NOTATION_FONT_SCALE,
    };
    this.render_options = { ...this.render_options, ...options };

    this.render_options.number_line += fontLineShift;

    this.number_of_measures = number_of_measures;
    this.xs = {
      left: NaN,
      right: NaN,
    };
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
    if (!this.stave) {
      throw new RuntimeError('NoStave', 'No stave attached to instance');
    }
    return this.stave;
  }

  drawLine(ctx: RenderContext, left: number, right: number, sbl: number): void {
    const y = this.checkStave().getYForLine(this.render_options.line);
    const padding = (right - left) * 0.1;

    left += padding;
    right -= padding;

    const serif = {
      thickness: this.render_options.serif_thickness,
      height: sbl,
    };
    let lineThicknessHalf = sbl * 0.25;
    if (this.render_options.line_thickness != undefined) {
      lineThicknessHalf = this.render_options.line_thickness * 0.5;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, y - sbl);
    ctx.lineTo(left + serif.thickness, y - sbl);
    ctx.lineTo(left + serif.thickness, y - lineThicknessHalf);
    ctx.lineTo(right - serif.thickness, y - lineThicknessHalf);
    ctx.lineTo(right - serif.thickness, y - sbl);
    ctx.lineTo(right, y - sbl);
    ctx.lineTo(right, y + sbl);
    ctx.lineTo(right - serif.thickness, y + sbl);
    ctx.lineTo(right - serif.thickness, y + lineThicknessHalf);
    ctx.lineTo(left + serif.thickness, y + lineThicknessHalf);
    ctx.lineTo(left + serif.thickness, y + sbl);
    ctx.lineTo(left, y + sbl);
    ctx.closePath();
    ctx.fill();
  }

  drawSymbols(ctx: RenderContext, left: number, right: number, sbl: number): void {
    const stave = this.checkStave();
    const n4 = Math.floor(this.number_of_measures / 4);
    const n = this.number_of_measures % 4;
    const n2 = Math.floor(n / 2);
    const n1 = n % 2;

    const semibrave_rest = get_semibrave_rest();
    const semibrave_rest_width =
      semibrave_rest.width * (this.render_options.semibrave_rest_glyph_scale / semibrave_rest.glyph_font_scale);
    const glyphs = {
      2: {
        width: semibrave_rest_width * 0.5,
        height: sbl,
      },
      1: {
        width: semibrave_rest_width,
      },
    };

    let spacing = semibrave_rest_width * 1.35;
    if (this.render_options.symbol_spacing != undefined) {
      spacing = this.render_options.symbol_spacing;
    }

    const width = n4 * glyphs[2].width + n2 * glyphs[2].width + n1 * glyphs[1].width + (n4 + n2 + n1 - 1) * spacing;
    let x = left + (right - left) * 0.5 - width * 0.5;
    const yTop = stave.getYForLine(this.render_options.line - 1);
    const yMiddle = stave.getYForLine(this.render_options.line);
    const yBottom = stave.getYForLine(this.render_options.line + 1);

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
      Glyph.renderGlyph(ctx, x, yTop, this.render_options.semibrave_rest_glyph_scale, semibrave_rest.glyph_code);
      x += glyphs[1].width + spacing;
    }

    ctx.restore();
  }

  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    const stave = this.checkStave();
    const sbl = this.render_options.spacing_between_lines_px;

    let left = stave.getNoteStartX();
    let right = stave.getNoteEndX();

    // FIXME: getNoteStartX() returns x+5(barline width) and
    // getNoteEndX() returns x + width(no barline width) by default. how to fix?
    const begModifiers = stave.getModifiers(StaveModifier.Position.BEGIN);
    if (begModifiers.length === 1 && begModifiers[0].getCategory() === Barline.CATEGORY) {
      left -= begModifiers[0].getWidth();
    }

    if (this.render_options.padding_left != undefined) {
      left = stave.getX() + this.render_options.padding_left;
    }

    if (this.render_options.padding_right != undefined) {
      right = stave.getX() + stave.getWidth() - this.render_options.padding_right;
    }

    this.xs.left = left;
    this.xs.right = right;

    if (this.render_options.use_symbols) {
      this.drawSymbols(ctx, left, right, sbl);
    } else {
      this.drawLine(ctx, left, right, sbl);
    }

    if (this.render_options.show_number) {
      const timeSpec = '/' + this.number_of_measures;
      const timeSig = new TimeSignature(timeSpec, 0, false);
      timeSig.point = this.render_options.number_glyph_point;
      timeSig.setTimeSig(timeSpec);
      timeSig.setStave(stave);
      timeSig.setX(left + (right - left) * 0.5 - timeSig.getInfo().glyph.getMetrics().width * 0.5);
      timeSig.bottomLine = this.render_options.number_line;
      timeSig.setContext(ctx).draw();
    }
  }
}
