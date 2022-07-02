// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `StaveLine` which are simply lines that connect
// two notes. This object is highly configurable, see the `render_options`.
// A simple line is often used for notating glissando articulations, but you
// can format a `StaveLine` with arrows or colors for more pedagogical
// purposes, such as diagrams.

import { Element } from './element';
import { FontInfo } from './font';
import { RenderContext } from './rendercontext';
import { StaveNote } from './stavenote';
import { Tables } from './tables';
import { TextJustification } from './textnote';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export interface StaveLineNotes {
  first_note: StaveNote;
  first_indices: number[];
  last_note: StaveNote;
  last_indices: number[];
}

// Attribution: Arrow rendering implementations based off of
// Patrick Horgan's article, "Drawing lines and arcs with
// arrow heads on  HTML5 Canvas"
//
// Draw an arrow head that connects between 3 coordinates.
function drawArrowHead(
  ctx: RenderContext,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  // all cases do this.
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x0, y0);
  ctx.closePath();

  ctx.fill();
}

export class StaveLine extends Element {
  static get CATEGORY(): string {
    return Category.StaveLine;
  }

  /** Default text font. */
  static TEXT_FONT: Required<FontInfo> = { ...Element.TEXT_FONT };

  // Text Positioning
  static readonly TextVerticalPosition = {
    TOP: 1,
    BOTTOM: 2,
  };

  static readonly TextJustification = TextJustification;

  public render_options: {
    padding_left: number;
    padding_right: number;
    line_width: number;
    line_dash?: number[];
    rounded_end: boolean;
    color?: string;
    draw_start_arrow: boolean;
    draw_end_arrow: boolean;
    arrowhead_length: number;
    arrowhead_angle: number;
    text_position_vertical: number;
    text_justification: number;
  };

  protected text: string;

  // These five instance variables are all initialized by the constructor via this.setNotes(notes).
  protected notes!: StaveLineNotes;
  protected first_note!: StaveNote;
  protected first_indices!: number[];
  protected last_note!: StaveNote;
  protected last_indices!: number[];

  // Initialize the StaveLine with the given `notes`.
  //
  // `notes` is a struct that has:
  //
  //  ```
  //  {
  //    first_note: Note,
  //    last_note: Note,
  //    first_indices: [n1, n2, n3],
  //    last_indices: [n1, n2, n3]
  //  }
  //  ```
  constructor(notes: StaveLineNotes) {
    super();

    this.setNotes(notes);

    this.text = '';
    this.resetFont();

    this.render_options = {
      // Space to add to the left or the right
      padding_left: 4,
      padding_right: 3,

      // The width of the line in pixels
      line_width: 1,
      // An array of line/space lengths. (TODO/QUESTION: Is this supported in SVG?).
      line_dash: undefined,
      // Can draw rounded line end, instead of a square. (TODO/QUESTION: Is this supported in SVG?).
      rounded_end: true,
      // The color of the line and arrowheads
      color: undefined,

      // Flags to draw arrows on each end of the line
      draw_start_arrow: false,
      draw_end_arrow: false,

      // The length of the arrowhead sides
      arrowhead_length: 10,
      // The angle of the arrowhead
      arrowhead_angle: Math.PI / 8,

      // The position of the text
      text_position_vertical: StaveLine.TextVerticalPosition.TOP,
      text_justification: StaveLine.TextJustification.CENTER,
    };
  }

  // The the annotation for the `StaveLine`
  setText(text: string): this {
    this.text = text;
    return this;
  }

  // Set the notes for the `StaveLine`
  setNotes(notes: StaveLineNotes): this {
    if (!notes.first_note && !notes.last_note) {
      throw new RuntimeError('BadArguments', 'Notes needs to have either first_note or last_note set.');
    }

    if (!notes.first_indices) notes.first_indices = [0];
    if (!notes.last_indices) notes.last_indices = [0];

    if (notes.first_indices.length !== notes.last_indices.length) {
      throw new RuntimeError('BadArguments', 'Connected notes must have same number of indices.');
    }

    this.notes = notes;
    this.first_note = notes.first_note;
    this.first_indices = notes.first_indices;
    this.last_note = notes.last_note;
    this.last_indices = notes.last_indices;
    return this;
  }

  // Apply the style of the `StaveLine` to the context
  applyLineStyle(): void {
    const ctx = this.checkContext();
    const render_options = this.render_options;

    if (render_options.line_dash) {
      ctx.setLineDash(render_options.line_dash);
    }

    if (render_options.line_width) {
      ctx.setLineWidth(render_options.line_width);
    }

    if (render_options.rounded_end) {
      ctx.setLineCap('round');
    } else {
      ctx.setLineCap('square');
    }
  }

  // Apply the text styling to the context
  applyFontStyle(): void {
    const ctx = this.checkContext();
    ctx.setFont(this.textFont);

    const render_options = this.render_options;
    const color = render_options.color;
    if (color) {
      ctx.setStrokeStyle(color);
      ctx.setFillStyle(color);
    }
  }

  // Helper function to draw a line with arrow heads
  protected drawArrowLine(ctx: RenderContext, pt1: { x: number; y: number }, pt2: { x: number; y: number }): void {
    const both_arrows = this.render_options.draw_start_arrow && this.render_options.draw_end_arrow;

    const x1 = pt1.x;
    const y1 = pt1.y;
    const x2 = pt2.x;
    const y2 = pt2.y;

    // For ends with arrow we actually want to stop before we get to the arrow
    // so that wide lines won't put a flat end on the arrow.
    const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const ratio = (distance - this.render_options.arrowhead_length / 3) / distance;
    let end_x;
    let end_y;
    let start_x;
    let start_y;
    if (this.render_options.draw_end_arrow || both_arrows) {
      end_x = Math.round(x1 + (x2 - x1) * ratio);
      end_y = Math.round(y1 + (y2 - y1) * ratio);
    } else {
      end_x = x2;
      end_y = y2;
    }

    if (this.render_options.draw_start_arrow || both_arrows) {
      start_x = x1 + (x2 - x1) * (1 - ratio);
      start_y = y1 + (y2 - y1) * (1 - ratio);
    } else {
      start_x = x1;
      start_y = y1;
    }

    if (this.render_options.color) {
      ctx.setStrokeStyle(this.render_options.color);
      ctx.setFillStyle(this.render_options.color);
    }

    // Draw the shaft of the arrow
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
    ctx.closePath();

    // calculate the angle of the line
    const line_angle = Math.atan2(y2 - y1, x2 - x1);
    // h is the line length of a side of the arrow head
    const h = Math.abs(this.render_options.arrowhead_length / Math.cos(this.render_options.arrowhead_angle));

    let angle1;
    let angle2;
    let top_x;
    let top_y;
    let bottom_x;
    let bottom_y;

    if (this.render_options.draw_end_arrow || both_arrows) {
      angle1 = line_angle + Math.PI + this.render_options.arrowhead_angle;
      top_x = x2 + Math.cos(angle1) * h;
      top_y = y2 + Math.sin(angle1) * h;

      angle2 = line_angle + Math.PI - this.render_options.arrowhead_angle;
      bottom_x = x2 + Math.cos(angle2) * h;
      bottom_y = y2 + Math.sin(angle2) * h;

      drawArrowHead(ctx, top_x, top_y, x2, y2, bottom_x, bottom_y);
    }

    if (this.render_options.draw_start_arrow || both_arrows) {
      angle1 = line_angle + this.render_options.arrowhead_angle;
      top_x = x1 + Math.cos(angle1) * h;
      top_y = y1 + Math.sin(angle1) * h;

      angle2 = line_angle - this.render_options.arrowhead_angle;
      bottom_x = x1 + Math.cos(angle2) * h;
      bottom_y = y1 + Math.sin(angle2) * h;

      drawArrowHead(ctx, top_x, top_y, x1, y1, bottom_x, bottom_y);
    }
  }

  // Renders the `StaveLine` on the context
  draw(): this {
    const ctx = this.checkContext();
    this.setRendered();

    const first_note = this.first_note;
    const last_note = this.last_note;
    const render_options = this.render_options;

    ctx.save();
    this.applyLineStyle();

    // Cycle through each set of indices and draw lines
    let start_position = { x: 0, y: 0 };
    let end_position = { x: 0, y: 0 };
    this.first_indices.forEach((first_index, i) => {
      const last_index = this.last_indices[i];

      // Get initial coordinates for the start/end of the line
      start_position = first_note.getModifierStartXY(2, first_index);
      end_position = last_note.getModifierStartXY(1, last_index);
      const upwards_slope = start_position.y > end_position.y;

      // Adjust `x` coordinates for modifiers
      start_position.x += first_note.getMetrics().modRightPx + render_options.padding_left;
      end_position.x -= last_note.getMetrics().modLeftPx + render_options.padding_right;

      // Adjust first `x` coordinates for displacements
      const notehead_width = first_note.getGlyphProps().getWidth();
      const first_displaced = first_note.getKeyProps()[first_index].displaced;
      if (first_displaced && first_note.getStemDirection() === 1) {
        start_position.x += notehead_width + render_options.padding_left;
      }

      // Adjust last `x` coordinates for displacements
      const last_displaced = last_note.getKeyProps()[last_index].displaced;
      if (last_displaced && last_note.getStemDirection() === -1) {
        end_position.x -= notehead_width + render_options.padding_right;
      }

      // Adjust y position better if it's not coming from the center of the note
      start_position.y += upwards_slope ? -3 : 1;
      end_position.y += upwards_slope ? 2 : 0;

      this.drawArrowLine(ctx, start_position, end_position);
    });

    ctx.restore();

    // Determine the x coordinate where to start the text
    const text_width = ctx.measureText(this.text).width;
    const justification = render_options.text_justification;
    let x = 0;
    if (justification === StaveLine.TextJustification.LEFT) {
      x = start_position.x;
    } else if (justification === StaveLine.TextJustification.CENTER) {
      const delta_x = end_position.x - start_position.x;
      const center_x = delta_x / 2 + start_position.x;
      x = center_x - text_width / 2;
    } else if (justification === StaveLine.TextJustification.RIGHT) {
      x = end_position.x - text_width;
    }

    // Determine the y value to start the text
    let y = 0;
    const vertical_position = render_options.text_position_vertical;
    if (vertical_position === StaveLine.TextVerticalPosition.TOP) {
      y = first_note.checkStave().getYForTopText();
    } else if (vertical_position === StaveLine.TextVerticalPosition.BOTTOM) {
      y = first_note.checkStave().getYForBottomText(Tables.TEXT_HEIGHT_OFFSET_HACK);
    }

    // Draw the text
    ctx.save();
    this.applyFontStyle();
    ctx.fillText(this.text, x, y);
    ctx.restore();

    return this;
  }
}
