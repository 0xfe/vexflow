// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements multiple measure rests

import { Vex } from './vex';
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

  // options:
  //    line: staff line to render rest line or rest symbols.
  //    number_of_measures: number of measures.
  //    number_line: staff line to render number of measures string.
  //    auto_scale: scale rest size by spaces between staff lines or not.
  //    show_number: show number of measures string or not.
  //    padding_left: left padding from stave x.
  //    padding_right: right padding from stave end x.
  //    serif_thickness: rest serif line thickness.
  //    line_thickness: rest line thickness.
  //    symbol_spacing: spacing between each rest symbol glyphs.
  //    number_glyph_scale: size of number of measures string glyphs.
  //    semibrave_rest_glyph_scale: size of semibrave rest symbol.
  constructor(options) {
    super();
    this.setAttribute('type', 'MultiMeasureRest');

    this.render_options = {
      line: 2,
      number_line: -0.5,
      auto_scale: false,
      use_symbols: false,
      number_of_measures: 1,
      show_number: true,
      padding_left: undefined,
      padding_right: undefined,
      serif_thickness: 1,
      line_thickness: undefined,
      symbol_spacing: undefined,
      number_glyph_scale: undefined, // TODO
      semibrave_rest_glyph_scale: undefined, // TODO
    };
    Vex.Merge(this.render_options, options);
  }

  setStave(stave) {
    this.stave = stave;
    return this;
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
    const n4 = Math.floor(this.render_options.number_of_measures / 4);
    const n = this.render_options.number_of_measures % 4;
    const n2 = Math.floor(n / 2);
    const n1 = n % 2;

    const semibrave_rest = get_semibrave_rest();
    const semibrave_rest_width = semibrave_rest.width;
    const glyphs = {
      2: {
        width: semibrave_rest_width * 0.5,
        height: sbl,
      },
      1: {
        width: semibrave_rest_width,
      },
    };

    let spacing = sbl * 1.7;
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
      Glyph.renderGlyph(ctx, x, yTop, semibrave_rest.glyph_font_scale, semibrave_rest.glyph_code);
      x += glyphs[1].width + spacing;
    }

    ctx.restore();
  }

  draw() {
    this.checkContext();
    this.setRendered();

    const ctx = this.context;
    const stave = this.stave;
    const sbl = this.render_options.auto_scale ? stave.getSpacingBetweenLines() : 10;

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

    if (this.render_options.use_symbols) {
      this.drawSymbols(ctx, left, right, sbl);
    } else {
      this.drawLine(ctx, left, right, sbl);
    }

    if (this.render_options.show_number) {
      const timeSig = new TimeSignature('/' + this.render_options.number_of_measures,
        undefined, false);
      timeSig.setStave(stave);
      timeSig.x = left + ((right - left) * 0.5) - (timeSig.timeSig.glyph.getMetrics().width * 0.5);
      timeSig.bottomLine = this.render_options.number_line;
      timeSig.setContext(ctx).draw();
    }
  }
}
