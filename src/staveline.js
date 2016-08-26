// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `StaveLine` which are simply lines that connect
// two notes. This object is highly configurable, see the `render_options`.
// A simple line is often used for notating glissando articulations, but you
// can format a `StaveLine` with arrows or colors for more pedagogical
// purposes, such as diagrams.
import { Vex } from './vex';
import { Element } from './element';
import { Flow } from './tables';

// Attribution: Arrow rendering implementations based off of
// Patrick Horgan's article, "Drawing lines and arcs with
// arrow heads on  HTML5 Canvas"
//
// Draw an arrow head that connects between 3 coordinates
function drawArrowHead(ctx, x0, y0, x1, y1, x2, y2) {
  // all cases do this.
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x0, y0);
  ctx.closePath();

  ctx.fill();
}

// Helper function to draw a line with arrow heads
function drawArrowLine(ctx, point1, point2, config) {
  const both_arrows = config.draw_start_arrow && config.draw_end_arrow;

  const x1 = point1.x;
  const y1 = point1.y;
  const x2 = point2.x;
  const y2 = point2.y;

  // For ends with arrow we actually want to stop before we get to the arrow
  // so that wide lines won't put a flat end on the arrow.
  const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  const ratio = (distance - config.arrowhead_length / 3) / distance;
  let end_x;
  let end_y;
  let start_x;
  let start_y;
  if (config.draw_end_arrow || both_arrows) {
    end_x = Math.round(x1 + (x2 - x1) * ratio);
    end_y = Math.round(y1 + (y2 - y1) * ratio);
  } else {
    end_x = x2;
    end_y = y2;
  }

  if (config.draw_start_arrow || both_arrows) {
    start_x = x1 + (x2 - x1) * (1 - ratio);
    start_y = y1 + (y2 - y1) * (1 - ratio);
  } else {
    start_x = x1;
    start_y = y1;
  }

  if (config.color) {
    ctx.setStrokeStyle(config.color);
    ctx.setFillStyle(config.color);
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
  const h = Math.abs(config.arrowhead_length / Math.cos(config.arrowhead_angle));

  let angle1;
  let angle2;
  let top_x;
  let top_y;
  let bottom_x;
  let bottom_y;

  if (config.draw_end_arrow || both_arrows) {
    angle1 = line_angle + Math.PI + config.arrowhead_angle;
    top_x = x2 + Math.cos(angle1) * h;
    top_y = y2 + Math.sin(angle1) * h;

    angle2 = line_angle + Math.PI - config.arrowhead_angle;
    bottom_x = x2 + Math.cos(angle2) * h;
    bottom_y = y2 + Math.sin(angle2) * h;

    drawArrowHead(ctx, top_x, top_y, x2, y2, bottom_x, bottom_y);
  }

  if (config.draw_start_arrow || both_arrows) {
    angle1 = line_angle + config.arrowhead_angle;
    top_x = x1 + Math.cos(angle1) * h;
    top_y = y1 + Math.sin(angle1) * h;

    angle2 = line_angle - config.arrowhead_angle;
    bottom_x = x1 + Math.cos(angle2) * h;
    bottom_y = y1 + Math.sin(angle2) * h;

    drawArrowHead(ctx, top_x, top_y, x1, y1, bottom_x, bottom_y);
  }
}

export class StaveLine extends Element {
  // Text Positioning
  static get TextVerticalPosition() {
    return {
      TOP: 1,
      BOTTOM: 2,
    };
  }

  static get TextJustification() {
    return {
      LEFT: 1,
      CENTER: 2,
      RIGHT: 3,
    };
  }

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
  constructor(notes) {
    super();
    this.setAttribute('type', 'StaveLine');

    this.notes = notes;

    this.text = '';

    this.font = {
      family: 'Arial',
      size: 10,
      weight: '',
    };

    this.render_options = {
      // Space to add to the left or the right
      padding_left: 4,
      padding_right: 3,

      // The width of the line in pixels
      line_width: 1,
      // An array of line/space lengths. Unsupported with Raphael (SVG)
      line_dash: null,
      // Can draw rounded line end, instead of a square. Unsupported with Raphael (SVG)
      rounded_end: true,
      // The color of the line and arrowheads
      color: null,

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

    this.setNotes(notes);
  }

  // Set the font for the `StaveLine` text
  setFont(font) { this.font = font; return this; }
  // The the annotation for the `StaveLine`
  setText(text) { this.text = text; return this; }

  // Set the notes for the `StaveLine`
  setNotes(notes) {
    if (!notes.first_note && !notes.last_note) {
      throw new Vex.RuntimeError(
        'BadArguments', 'Notes needs to have either first_note or last_note set.'
      );
    }

    if (!notes.first_indices) notes.first_indices = [0];
    if (!notes.last_indices) notes.last_indices = [0];

    if (notes.first_indices.length !== notes.last_indices.length) {
      throw new Vex.RuntimeError(
        'BadArguments', 'Connected notes must have similar index sizes'
      );
    }

    // Success. Lets grab 'em notes.
    this.first_note = notes.first_note;
    this.first_indices = notes.first_indices;
    this.last_note = notes.last_note;
    this.last_indices = notes.last_indices;
    return this;
  }

  // Apply the style of the `StaveLine` to the context
  applyLineStyle() {
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
  applyFontStyle() {
    const ctx = this.checkContext();

    if (this.font) {
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
    }

    if (this.render_options.color) {
      ctx.setStrokeStyle(this.render_options.color);
      ctx.setFillStyle(this.render_options.color);
    }
  }

  // Renders the `StaveLine` on the context
  draw() {
    const ctx = this.checkContext();
    this.setRendered();

    const first_note = this.first_note;
    const last_note = this.last_note;
    const render_options = this.render_options;

    ctx.save();
    this.applyLineStyle();

    // Cycle through each set of indices and draw lines
    let start_position;
    let end_position;
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
      const notehead_width = first_note.getGlyph().getWidth();
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

      drawArrowLine(ctx, start_position, end_position, this.render_options);
    });

    ctx.restore();

    // Determine the x coordinate where to start the text
    const text_width = ctx.measureText(this.text).width;
    const justification = render_options.text_justification;
    let x = 0;
    if (justification === StaveLine.TextJustification.LEFT) {
      x = start_position.x;
    } else if (justification === StaveLine.TextJustification.CENTER) {
      const delta_x = (end_position.x - start_position.x);
      const center_x = (delta_x / 2) + start_position.x;
      x = center_x - (text_width / 2);
    } else if (justification === StaveLine.TextJustification.RIGHT) {
      x = end_position.x  -  text_width;
    }

    // Determine the y value to start the text
    let y;
    const vertical_position = render_options.text_position_vertical;
    if (vertical_position === StaveLine.TextVerticalPosition.TOP) {
      y = first_note.getStave().getYForTopText();
    } else if (vertical_position === StaveLine.TextVerticalPosition.BOTTOM) {
      y = first_note.getStave().getYForBottomText(Flow.TEXT_HEIGHT_OFFSET_HACK);
    }

    // Draw the text
    ctx.save();
    this.applyFontStyle();
    ctx.fillText(this.text, x, y);
    ctx.restore();

    return this;
  }
}
