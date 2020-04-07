// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements multiple measure rests

import { Vex } from './vex';
import { Flow } from './tables';
import { Element } from './element';
import { Glyph } from './glyph';
import { NoteHead } from './notehead';
import { StaveModifier } from './stavemodifier';
import { TimeSignature } from './timesignature';

let semibrave_rest;
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
  constructor(number_of_measures, options) {
    super();
    this.setAttribute('type', 'MultiMeasureRest');

    const point = this.musicFont.lookupMetric('digits.point');
    const fontLineShift = this.musicFont.lookupMetric('digits.shiftLine', 0);

    this.render_options = {
      show_number: true,
      number_line: -0.5,
      number_glyph_point: point, // same as TimeSignature.

      padding_left: undefined,
      padding_right: undefined,

      line: 2,

      spacing_between_lines_px: 10, // same as Stave.

      line_thickness: undefined,
      serif_thickness: 2,

      use_symbols: false,
      symbol_spacing: undefined,

      /* same as NoteHead. */
      semibrave_rest_glyph_scale: Flow.DEFAULT_NOTATION_FONT_SCALE,
    };
    Vex.Merge(this.render_options, options);

    this.render_options.number_line += fontLineShift;

    this.number_of_measures = number_of_measures;
    this.xs = {
      left: NaN,
      right: NaN,
    };
  }

  getXs() {
    return this.xs;
  }

  setStave(stave) {
    this.stave = stave;
    return this;
  }

  getStave() {
    return this.stave;
  }

  drawLine(ctx, left, right, sbl) {
    const y = this.stave.getYForLine(this.render_options.line);
    const padding = (right - left) * 0.1;

    left += padding;
    right -= padding;

    const serif = {
      thickness: this.render_options.serif_thickness,
      height: sbl,
    };
    let lineThicknessHalf = sbl * 0.25;
    if (!isNaN(this.render_options.line_thickness)) {
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

  drawSymbols(ctx, left, right, sbl) {
    const n4 = Math.floor(this.number_of_measures / 4);
    const n = this.number_of_measures % 4;
    const n2 = Math.floor(n / 2);
    const n1 = n % 2;

    const semibrave_rest = get_semibrave_rest();
    const semibrave_rest_width = semibrave_rest.width *
      (this.render_options.semibrave_rest_glyph_scale / semibrave_rest.glyph_font_scale);
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
    if (!isNaN(this.render_options.symbol_spacing)) {
      spacing = this.render_options.symbol_spacing;
    }

    const width = (n4 * glyphs[2].width) + (n2 * glyphs[2].width)
      + (n1 * glyphs[1].width) + ((n4 + n2 + n1 - 1) * spacing);
    let x = left + ((right - left) * 0.5) - (width * 0.5);
    const yTop = this.stave.getYForLine(this.render_options.line - 1);
    const yMiddle = this.stave.getYForLine(this.render_options.line);
    const yBottom = this.stave.getYForLine(this.render_options.line + 1);

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
      Glyph.renderGlyph(ctx, x, yTop, this.render_options.semibrave_rest_glyph_scale,
        semibrave_rest.glyph_code);
      x += glyphs[1].width + spacing;
    }

    ctx.restore();
  }

  draw() {
    this.checkContext();
    this.setRendered();

    const ctx = this.context;
    const stave = this.stave;
    const sbl = this.render_options.spacing_between_lines_px;

    let left = stave.getNoteStartX();
    let right = stave.getNoteEndX();

    // FIXME: getNoteStartX() returns x+5(barline width) and
    // getNoteEndX() returns x + width(no barline width) by default. how to fix?
    const begModifiers = stave.getModifiers(StaveModifier.Position.BEGIN);
    if (begModifiers.length === 1 && begModifiers[0].getCategory() === 'barlines') {
      left -= begModifiers[0].getWidth();
    }

    if (!isNaN(this.render_options.padding_left)) {
      left = stave.getX() + this.render_options.padding_left;
    }

    if (!isNaN(this.render_options.padding_right)) {
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
      const timeSig = new TimeSignature(null, undefined, false);
      timeSig.point = this.render_options.number_glyph_point;
      timeSig.setTimeSig(timeSpec);
      timeSig.setStave(stave);
      timeSig.x = left + ((right - left) * 0.5) - (timeSig.timeSig.glyph.getMetrics().width * 0.5);
      timeSig.bottomLine = this.render_options.number_line;
      timeSig.setContext(ctx).draw();
    }
  }
}
