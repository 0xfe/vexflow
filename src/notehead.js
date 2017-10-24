// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements `NoteHeads`. `NoteHeads` are typically not manipulated
// directly, but used internally in `StaveNote`.
//
// See `tests/notehead_tests.js` for usage examples.

import { Vex } from './vex';
import { Flow } from './tables';
import { Note } from './note';
import { Stem } from './stem';
import { StaveNote } from './stavenote';
import { Glyph } from './glyph';

// To enable logging for this class. Set `Vex.Flow.NoteHead.DEBUG` to `true`.
function L(...args) { if (NoteHead.DEBUG) Vex.L('Vex.Flow.NoteHead', args); }

// Draw slashnote head manually. No glyph exists for this.
//
// Parameters:
// * `ctx`: the Canvas context
// * `duration`: the duration of the note. ex: "4"
// * `x`: the x coordinate to draw at
// * `y`: the y coordinate to draw at
// * `stem_direction`: the direction of the stem
function drawSlashNoteHead(ctx, duration, x, y, stem_direction, staveSpace) {
  const width = Flow.SLASH_NOTEHEAD_WIDTH;
  ctx.save();
  ctx.setLineWidth(Flow.STEM_WIDTH);

  let fill = false;

  if (Flow.durationToNumber(duration) > 2) {
    fill = true;
  }

  if (!fill) x -= (Flow.STEM_WIDTH / 2) * stem_direction;

  ctx.beginPath();
  ctx.moveTo(x, y + staveSpace);
  ctx.lineTo(x, y + 1);
  ctx.lineTo(x + width, y - staveSpace);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x, y + staveSpace);
  ctx.closePath();

  if (fill) {
    ctx.fill();
  } else {
    ctx.stroke();
  }

  if (Flow.durationToFraction(duration).equals(0.5)) {
    const breve_lines = [-3, -1, width + 1, width + 3];
    for (let i = 0; i < breve_lines.length; i++) {
      ctx.beginPath();
      ctx.moveTo(x + breve_lines[i], y - 10);
      ctx.lineTo(x + breve_lines[i], y + 11);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export class NoteHead extends Note {
  static get CATEGORY() { return 'notehead'; }

  constructor(head_options) {
    super(head_options);
    this.setAttribute('type', 'NoteHead');

    this.index = head_options.index;
    this.x = head_options.x || 0;
    this.y = head_options.y || 0;
    this.note_type = head_options.note_type;
    this.duration = head_options.duration;
    this.displaced = head_options.displaced || false;
    this.stem_direction = head_options.stem_direction || StaveNote.STEM_UP;
    this.line = head_options.line;

    // Get glyph code based on duration and note type. This could be
    // regular notes, rests, or other custom codes.
    this.glyph = Flow.durationToGlyph(this.duration, this.note_type);
    if (!this.glyph) {
      throw new Vex.RuntimeError(
        'BadArguments',
        `No glyph found for duration '${this.duration}' and type '${this.note_type}'`);
    }

    this.glyph_code = this.glyph.code_head;
    this.x_shift = head_options.x_shift;
    if (head_options.custom_glyph_code) {
      this.custom_glyph = true;
      this.glyph_code = head_options.custom_glyph_code;
    }

    this.style = head_options.style;
    this.slashed = head_options.slashed;

    Vex.Merge(this.render_options, {
      // font size for note heads
      glyph_font_scale: head_options.glyph_font_scale || Flow.DEFAULT_NOTATION_FONT_SCALE,
      // number of stroke px to the left and right of head
      stroke_px: 3,
    });

    this.setWidth(this.glyph.getWidth(this.render_options.glyph_font_scale));
  }

  getCategory() { return NoteHead.CATEGORY; }

  // Get the width of the notehead
  getWidth() { return this.width; }

  // Determine if the notehead is displaced
  isDisplaced() { return this.displaced === true; }

  // Get the glyph data
  getGlyph() { return this.glyph; }

  // Set the X coordinate
  setX(x) { this.x = x; return this; }

  // get/set the Y coordinate
  getY() { return this.y; }
  setY(y) { this.y = y;  return this; }

  // Get/set the stave line the notehead is placed on
  getLine() { return this.line; }
  setLine(line) { this.line = line; return this; }

  // Get the canvas `x` coordinate position of the notehead.
  getAbsoluteX() {
    // If the note has not been preformatted, then get the static x value
    // Otherwise, it's been formatted and we should use it's x value relative
    // to its tick context
    const x = !this.preFormatted ? this.x : super.getAbsoluteX();

    // For a more natural displaced notehead, we adjust the displacement amount
    // by half the stem width in order to maintain a slight overlap with the stem
    const displacementStemAdjustment = (Stem.WIDTH / 2);

    return x + (this.displaced
      ? (this.width - displacementStemAdjustment) * this.stem_direction
      : 0
    );
  }

  // Get the `BoundingBox` for the `NoteHead`
  getBoundingBox() {
    if (!this.preFormatted) {
      throw new Vex.RERR('UnformattedNote', "Can't call getBoundingBox on an unformatted note.");
    }

    const spacing = this.stave.getSpacingBetweenLines();
    const half_spacing = spacing / 2;
    const min_y = this.y - half_spacing;

    return new Flow.BoundingBox(this.getAbsoluteX(), min_y, this.width, spacing);
  }

  // Set notehead to a provided `stave`
  setStave(stave) {
    const line = this.getLine();

    this.stave = stave;
    this.setY(stave.getYForNote(line));
    this.context = this.stave.context;
    return this;
  }

  // Pre-render formatting
  preFormat() {
    if (this.preFormatted) return this;

    const width = this.getWidth() + this.extraLeftPx + this.extraRightPx;

    this.setWidth(width);
    this.setPreFormatted(true);
    return this;
  }

  // Draw the notehead
  draw() {
    this.checkContext();
    this.setRendered();

    const ctx = this.context;
    const head_x = this.getAbsoluteX();
    const y = this.y;

    L("Drawing note head '", this.note_type, this.duration, "' at", head_x, y);

    // Begin and end positions for head.
    const stem_direction = this.stem_direction;
    const glyph_font_scale = this.render_options.glyph_font_scale;

    if (this.style) {
      this.applyStyle(ctx);
    }

    if (this.note_type === 's') {
      const staveSpace = this.stave.getSpacingBetweenLines();
      drawSlashNoteHead(ctx, this.duration, head_x, y, stem_direction, staveSpace);
    } else {
      Glyph.renderGlyph(ctx, head_x, y, glyph_font_scale, this.glyph_code);
    }

    if (this.style) {
      this.restoreStyle(ctx);
    }
  }
}
