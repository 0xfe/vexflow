// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `StemmableNote` is an abstract interface for notes with optional stems.
// Examples of stemmable notes are `StaveNote` and `TabNote`

import { Vex } from './vex';
import { Flow } from './tables';
import { Stem } from './stem';
import { Glyph } from './glyph';
import { Note } from './note';

export class StemmableNote extends Note {
  constructor(note_struct) {
    super(note_struct);
    this.setAttribute('type', 'StemmableNote');

    this.stem = null;
    this.stemExtensionOverride = null;
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

  buildFlag() {
    const { glyph, beam } = this;
    const shouldRenderFlag = beam === null;

    if (glyph && glyph.flag && shouldRenderFlag) {
      const flagCode = this.getStemDirection() === Stem.DOWN
        ? glyph.code_flag_downstem
        : glyph.code_flag_upstem;

      this.flag = new Glyph(flagCode, this.render_options.glyph_font_scale);
    }
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
    let length = frac.value() <= 1 ? 0 : 20;
    // if note is flagged, cannot shorten beam
    switch (this.duration) {
      case '8':
        if (this.beam == null) length = 35;
        break;
      case '16':
        length = this.beam == null ? 35 : 25;
        break;
      case '32':
        length = this.beam == null ? 45 : 35;
        break;
      case '64':
        length = this.beam == null ? 50 : 40;
        break;
      case '128':
        length = this.beam == null ? 55 : 45;
        break;
      default:
        break;
    }
    return length;
  }

  // Get/set the direction of the stem
  getStemDirection() { return this.stem_direction; }
  setStemDirection(direction) {
    if (!direction) direction = Stem.UP;
    if (direction !== Stem.UP && direction !== Stem.DOWN) {
      throw new Vex.RERR('BadArgument', `Invalid stem direction: ${direction}`);
    }

    this.stem_direction = direction;
    if (this.stem) {
      this.stem.setDirection(direction);
      this.stem.setExtension(this.getStemExtension());
    }

    this.reset();
    if (this.flag) {
      this.buildFlag();
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
    const x_end = this.getAbsoluteX() + this.x_shift + this.getGlyphWidth();
    const stem_x = this.stem_direction === Stem.DOWN ? x_begin : x_end;
    return stem_x;
  }

  // Get the `x` coordinate for the center of the glyph.
  // Used for `TabNote` stems and stemlets over rests
  getCenterGlyphX() {
    return this.getAbsoluteX() + this.x_shift + (this.getGlyphWidth() / 2);
  }

  // Get the stem extension for the current duration
  getStemExtension() {
    const glyph = this.getGlyph();

    if (this.stemExtensionOverride != null) {
      return this.stemExtensionOverride;
    }

    if (glyph) {
      return this.getStemDirection() === 1
        ? glyph.stem_up_extension
        : glyph.stem_down_extension;
    }

    return 0;
  }

  // Set the stem length to a specific. Will override the default length.
  setStemLength(height) {
    this.stemExtensionOverride = (height - Stem.HEIGHT);
    return this;
  }

  // Get the top and bottom `y` values of the stem.
  getStemExtents() {
    return this.stem.getExtents();
  }

  // Sets the current note's beam
  setBeam(beam) { this.beam = beam; return this; }

  // Get the `y` value for the top/bottom modifiers at a specific `textLine`
  getYForTopText(textLine) {
    const extents = this.getStemExtents();
    if (this.hasStem()) {
      return Math.min(
        this.stave.getYForTopText(textLine),
        extents.topY - (this.render_options.annotation_spacing * (textLine + 1))
      );
    } else {
      return this.stave.getYForTopText(textLine);
    }
  }

  getYForBottomText(textLine) {
    const extents = this.getStemExtents();
    if (this.hasStem()) {
      return Math.max(
        this.stave.getYForTopText(textLine),
        extents.baseY + (this.render_options.annotation_spacing * (textLine))
      );
    } else {
      return this.stave.getYForBottomText(textLine);
    }
  }

  hasFlag() {
    return Flow.durationToGlyph(this.duration).flag && !this.beam;
  }

  // Post format the note
  postFormat() {
    if (this.beam) this.beam.postFormat();

    this.postFormatted = true;

    return this;
  }

  // Render the stem onto the canvas
  drawStem(stem_struct) {
    this.checkContext();
    this.setRendered();

    this.setStem(new Stem(stem_struct));
    this.stem.setContext(this.context).draw();
  }
}
