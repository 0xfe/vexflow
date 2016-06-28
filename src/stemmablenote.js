// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `StemmableNote` is an abstract interface for notes with optional stems.
// Examples of stemmable notes are `StaveNote` and `TabNote`

import { Vex } from './vex';
import { Flow } from './tables';
import { Stem } from './stem';
import { Note } from './note';

// To enable logging for this class. Set `Vex.Flow.StemmableNote.DEBUG` to `true`.
function L() { if (StemmableNote.DEBUG) Vex.L('Vex.Flow.StemmableNote', arguments); }

export class StemmableNote extends Note {
  constructor(note_struct) {
    super(note_struct);

    this.stem = null;
    this.stem_extension_override = null;
    this.beam = null;
  }

  // Get and set the note's `Stem`
  getStem() { return this.stem; }
  setStem(stem) { this.stem = stem; return this; }

  // Builds and sets a new stem
  buildStem() {
    const stem = new Stem();
    this.setStem(stem);
    return this;
  }

  // Get the full length of stem
  getStemLength() {
    return Stem.HEIGHT + this.getStemExtension();
  }

  // Get the number of beams for this duration
  getBeamCount() {
    const glyph = this.getGlyph();

    if (glyph) {
      return glyph.beam_count;
    } else {
      return 0;
    }
  }

  // Get the minimum length of stem
  getStemMinumumLength() {
    const frac = Flow.durationToFraction(this.duration);
    let length = (frac.value() <= 1) ? 0 : 20;
    // if note is flagged, cannot shorten beam
    switch (this.duration) {
      case '8':
        if (this.beam == null) length = 35;
        break;
      case '16':
        if (this.beam == null)
          length = 35;
        else
         length = 25;
        break;
      case '32':
        if (this.beam == null)
          length = 45;
        else
         length = 35;
        break;
      case '64':
        if (this.beam == null)
          length = 50;
        else
         length = 40;
        break;
      case '128':
        if (this.beam == null)
          length = 55;
        else
         length = 45;
    }
    return length;
  }

  // Get/set the direction of the stem
  getStemDirection() { return this.stem_direction; }
  setStemDirection(direction) {
    if (!direction) direction = Stem.UP;
    if (direction != Stem.UP &&
        direction != Stem.DOWN) {
      throw new Vex.RERR('BadArgument', 'Invalid stem direction: ' +
          direction);
    }

    this.stem_direction = direction;
    if (this.stem) {
      this.stem.setDirection(direction);
      this.stem.setExtension(this.getStemExtension());
    }

    this.beam = null;
    if (this.preFormatted) {
      this.preFormat();
    }
    return this;
  }

  // Get the `x` coordinate of the stem
  getStemX() {
    const x_begin = this.getAbsoluteX() + this.x_shift;
    const x_end = this.getAbsoluteX() + this.x_shift + this.glyph.head_width;

    let stem_x = this.stem_direction == Stem.DOWN ?
      x_begin : x_end;

    stem_x -= ((Stem.WIDTH / 2) * this.stem_direction);

    return stem_x;
  }

  // Get the `x` coordinate for the center of the glyph.
  // Used for `TabNote` stems and stemlets over rests
  getCenterGlyphX() {
    return this.getAbsoluteX() + this.x_shift + (this.glyph.head_width / 2);
  }

  // Get the stem extension for the current duration
  getStemExtension() {
    const glyph = this.getGlyph();

    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    if (glyph) {
      return this.getStemDirection() === 1 ? glyph.stem_up_extension :
        glyph.stem_down_extension;
    }

    return 0;
  }

  // Set the stem length to a specific. Will override the default length.
  setStemLength(height) {
    this.stem_extension_override = (height - Stem.HEIGHT);
    return this;
  }

  // Get the top and bottom `y` values of the stem.
  getStemExtents() {
    if (!this.ys || this.ys.length === 0) throw new Vex.RERR('NoYValues',
        "Can't get top stem Y when note has no Y values.");

    let top_pixel = this.ys[0];
    let base_pixel = this.ys[0];
    const stem_height = Stem.HEIGHT + this.getStemExtension();

    for (let i = 0; i < this.ys.length; ++i) {
      const stem_top = this.ys[i] + (stem_height * -this.stem_direction);

      if (this.stem_direction == Stem.DOWN) {
        top_pixel = Math.max(top_pixel, stem_top);
        base_pixel = Math.min(base_pixel, this.ys[i]);
      } else {
        top_pixel = Math.min(top_pixel, stem_top);
        base_pixel = Math.max(base_pixel, this.ys[i]);
      }

      if (this.noteType == 's' || this.noteType == 'x') {
        top_pixel -= this.stem_direction * 7;
        base_pixel -= this.stem_direction * 7;
      }
    }

    L('Stem extents: ', top_pixel, base_pixel);
    return { topY: top_pixel, baseY: base_pixel };
  }

  // Sets the current note's beam
  setBeam(beam) { this.beam = beam; return this; }

  // Get the `y` value for the top/bottom modifiers at a specific `text_line`
  getYForTopText(text_line) {
    const extents = this.getStemExtents();
    if (this.hasStem()) {
      return Vex.Min(this.stave.getYForTopText(text_line),
          extents.topY - (this.render_options.annotation_spacing * (text_line + 1)));
    } else {
      return this.stave.getYForTopText(text_line);
    }
  }

  getYForBottomText(text_line) {
    const extents = this.getStemExtents();
    if (this.hasStem()) {
      return Vex.Max(this.stave.getYForTopText(text_line),
        extents.baseY + (this.render_options.annotation_spacing * (text_line)));
    } else {
      return this.stave.getYForBottomText(text_line);
    }
  }

  hasFlag() {
    return Flow.durationToGlyph(this.duration).flag;
  }

  // Post format the note
  postFormat() {
    if (this.beam) {
      this.beam.postFormat();
    }
    this.postFormatted = true;
    return this;
  }

  // Render the stem onto the canvas
  drawStem(stem_struct) {
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");

    this.setStem(new Stem(stem_struct));
    this.stem.setContext(this.context).draw();
  }
}
