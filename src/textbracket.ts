// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
//
// ## Description
//
// This file implement `TextBrackets` which extend between two notes.
// The octave transposition markings (8va, 8vb, 15va, 15vb) can be created
// using this class.

import { Vex } from './vex';
import { Flow } from './tables';
import { Element } from './element';
import { Renderer } from './renderer';

// To enable logging for this class. Set `Vex.Flow.TextBracket.DEBUG` to `true`.
function L(...args) {
  if (TextBracket.DEBUG) Vex.L('Vex.Flow.TextBracket', args);
}

export class TextBracket extends Element {
  // FIXME: Modifier.Position is singular while this is plural, make consistent
  static get Positions() {
    return {
      TOP: 1,
      BOTTOM: -1,
    };
  }

  static get PositionString() {
    return {
      top: TextBracket.Positions.TOP,
      bottom: TextBracket.Positions.BOTTOM,
    };
  }

  constructor({ start, stop, text = '', superscript = '', position = TextBracket.Positions.TOP }) {
    super();
    this.setAttribute('type', 'TextBracket');

    this.start = start;
    this.stop = stop;

    this.text = text;
    this.superscript = superscript;

    this.position = typeof position === 'string' ? TextBracket.PositionString[position] : position;

    this.line = 1;

    this.font = {
      family: 'Serif',
      size: 15,
      weight: 'italic',
    };

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

  // Apply the text backet styling to the provided `context`
  applyStyle(context) {
    // Apply style for the octave bracket
    context.setFont(this.font.family, this.font.size, this.font.weight);
    context.setStrokeStyle(this.render_options.color);
    context.setFillStyle(this.render_options.color);
    context.setLineWidth(this.render_options.line_width);

    return this;
  }

  // Set whether the bracket line should be `dashed`. You can also
  // optionally set the `dash` pattern by passing in an array of numbers
  setDashed(dashed, dash) {
    this.render_options.dashed = dashed;
    if (dash) this.render_options.dash = dash;
    return this;
  }

  // Set the font for the text
  setFont(font) {
    // We use Object.assign to support partial updates to the font object
    this.font = { ...this.font, ...font };
    return this;
  }
  // Set the rendering `context` for the octave bracket
  setLine(line) {
    this.line = line;
    return this;
  }

  // Draw the octave bracket on the rendering context
  draw() {
    const ctx = this.context;
    this.setRendered();

    let y = 0;
    switch (this.position) {
      case TextBracket.Positions.TOP:
        y = this.start.getStave().getYForTopText(this.line);
        break;
      case TextBracket.Positions.BOTTOM:
        y = this.start.getStave().getYForBottomText(this.line + Flow.TEXT_HEIGHT_OFFSET_HACK);
        break;
      default:
        throw new Vex.RERR('InvalidPosition', `The position ${this.position} is invalid`);
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
    const main_width = ctx.measureText(this.text).width;
    const main_height = ctx.measureText('M').width;

    // Calculate the y position for the super script
    const super_y = start.y - main_height / 2.5;

    // Draw the superscript
    ctx.setFont(this.font.family, this.font.size / 1.4, this.font.weight);
    ctx.fillText(this.superscript, start.x + main_width + 1, super_y);

    // Determine width and height of the superscript
    const superscript_width = ctx.measureText(this.superscript).width;
    const super_height = ctx.measureText('M').width;

    // Setup initial coordinates for the bracket line
    let start_x = start.x;
    let line_y = super_y;
    const end_x = stop.x + this.stop.getGlyph().getWidth();

    // Adjust x and y coordinates based on position
    if (this.position === TextBracket.Positions.TOP) {
      start_x += main_width + superscript_width + 5;
      line_y -= super_height / 2.7;
    } else if (this.position === TextBracket.Positions.BOTTOM) {
      line_y += super_height / 2.7;
      start_x += main_width + 2;

      if (!this.render_options.underline_superscript) {
        start_x += superscript_width;
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
