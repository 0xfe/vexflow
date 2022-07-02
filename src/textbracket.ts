// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
//
// This file implements `TextBrackets` which extend between two notes.
// The octave transposition markings (8va, 8vb, 15va, 15vb) can be created
// using this class.

import { Element } from './element';
import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Note } from './note';
import { RenderContext } from './rendercontext';
import { Renderer } from './renderer';
import { Tables } from './tables';
import { Category } from './typeguard';
import { log, RuntimeError } from './util';

export interface TextBracketParams {
  start: Note;
  stop: Note;
  text?: string;
  superscript?: string;
  position?: number | string;
}

// To enable logging for this class. Set `Vex.Flow.TextBracket.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any[]) {
  if (TextBracket.DEBUG) log('Vex.Flow.TextBracket', args);
}

export enum TextBracketPosition {
  TOP = 1,
  BOTTOM = -1,
}

export class TextBracket extends Element {
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.TextBracket;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: 15,
    weight: FontWeight.NORMAL,
    style: FontStyle.ITALIC,
  };

  public render_options: {
    dashed: boolean;
    color: string;
    line_width: number;
    underline_superscript: boolean;
    show_bracket: boolean;
    dash: number[];
    bracket_height: number;
  };

  protected readonly text: string;
  protected readonly superscript: string;

  protected line: number;

  readonly position: TextBracketPosition;
  readonly start: Note;
  readonly stop: Note;

  static get Position(): typeof TextBracketPosition {
    return TextBracketPosition;
  }

  static get PositionString(): Record<string, number> {
    return {
      top: TextBracketPosition.TOP,
      bottom: TextBracketPosition.BOTTOM,
    };
  }

  /**
   * @deprecated Use `TextBracket.Position` instead.
   */
  static get Positions(): typeof TextBracketPosition {
    L('Positions is deprecated, use TextBracketPosition instead.');
    return TextBracketPosition;
  }

  /**
   * @deprecated Use `TextBracket.PositionString` instead.
   */
  static get PositionsString(): Record<string, number> {
    L('PositionsString is deprecated, use PositionString instead.');
    return TextBracket.PositionString;
  }

  constructor({ start, stop, text = '', superscript = '', position = TextBracketPosition.TOP }: TextBracketParams) {
    super();

    this.start = start;
    this.stop = stop;

    this.text = text;
    this.superscript = superscript;

    this.position = typeof position === 'string' ? TextBracket.PositionString[position] : position;

    this.line = 1;

    this.resetFont();

    this.render_options = {
      dashed: true,
      dash: [5],
      color: 'black',
      line_width: 1,
      show_bracket: true,
      bracket_height: 8,

      // In the BOTTOM position, the bracket line can extend
      // under the superscript.
      underline_superscript: true,
    };
  }

  /**
   * Apply the text backet styling to the provided context.
   * @param ctx
   * @returns this
   */
  applyStyle(ctx: RenderContext): this {
    ctx.setFont(this.font);
    const options = this.render_options;
    ctx.setStrokeStyle(options.color);
    ctx.setFillStyle(options.color);
    ctx.setLineWidth(options.line_width);

    return this;
  }

  // Set whether the bracket line should be `dashed`. You can also
  // optionally set the `dash` pattern by passing in an array of numbers
  setDashed(dashed: boolean, dash?: number[]): this {
    this.render_options.dashed = dashed;
    if (dash) this.render_options.dash = dash;
    return this;
  }

  // Set the rendering `context` for the octave bracket
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  // Draw the octave bracket on the rendering context
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    let y = 0;
    switch (this.position) {
      case TextBracketPosition.TOP:
        y = this.start.checkStave().getYForTopText(this.line);
        break;
      case TextBracketPosition.BOTTOM:
        y = this.start.checkStave().getYForBottomText(this.line + Tables.TEXT_HEIGHT_OFFSET_HACK);
        break;
      default:
        throw new RuntimeError('InvalidPosition', `The position ${this.position} is invalid.`);
    }

    // Get the preliminary start and stop coordintates for the bracket
    const start = { x: this.start.getAbsoluteX(), y };
    const stop = { x: this.stop.getAbsoluteX(), y };

    L('Rendering TextBracket: start:', start, 'stop:', stop, 'y:', y);

    const bracket_height = this.render_options.bracket_height * this.position;

    ctx.save();
    this.applyStyle(ctx);

    // Draw text
    ctx.fillText(this.text, start.x, start.y);

    // Get the width and height for the octave number
    const main_measure = ctx.measureText(this.text);
    const main_width = main_measure.width;
    const main_height = main_measure.height;

    // Calculate the y position for the super script
    const super_y = start.y - main_height / 2.5;

    // We called this.resetFont() in the constructor, so we know this.textFont is available.
    // eslint-disable-next-line
    const { family, size, weight, style } = this.textFont!;
    // To draw the superscript, we scale the font size by 1/1.4.
    const smallerFontSize = Font.scaleSize(size, 0.714286);
    ctx.setFont(family, smallerFontSize, weight, style);
    ctx.fillText(this.superscript, start.x + main_width + 1, super_y);

    // Determine width and height of the superscript
    const super_measure = ctx.measureText(this.superscript);
    const super_width = super_measure.width;
    const super_height = super_measure.height;

    // Setup initial coordinates for the bracket line
    let start_x = start.x;
    let line_y = super_y;
    const end_x = stop.x + this.stop.getGlyphProps().getWidth();

    // Adjust x and y coordinates based on position
    if (this.position === TextBracketPosition.TOP) {
      start_x += main_width + super_width + 5;
      line_y -= super_height / 2.7;
    } else if (this.position === TextBracketPosition.BOTTOM) {
      line_y += super_height / 2.7;
      start_x += main_width + 2;

      if (!this.render_options.underline_superscript) {
        start_x += super_width;
      }
    }

    if (this.render_options.dashed) {
      // Main line
      Renderer.drawDashedLine(ctx, start_x, line_y, end_x, line_y, this.render_options.dash);
      // Ending Bracket
      if (this.render_options.show_bracket) {
        Renderer.drawDashedLine(
          ctx,
          end_x,
          line_y + 1 * this.position,
          end_x,
          line_y + bracket_height,
          this.render_options.dash
        );
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(start_x, line_y);
      // Main line
      ctx.lineTo(end_x, line_y);
      if (this.render_options.show_bracket) {
        // Ending bracket
        ctx.lineTo(end_x, line_y + bracket_height);
      }
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  }
}
