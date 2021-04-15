// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `StemmableNote` is an abstract interface for notes with optional stems.
// Examples of stemmable notes are `StaveNote` and `TabNote`

import { Vex } from './vex';
import { Flow } from './tables';
import { Stem } from './stem';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';
import { GlyphProps } from './glyph';

//** TODO: Move to Stem.ts */
export interface StemStruct {
  stem_down_y_base_offset: number;
  stem_up_y_base_offset: number;
  stem_down_y_offset: number;
  stem_up_y_offset: number;
  stemletHeight: number;
  isStemlet: boolean;
  hide: boolean;
  stem_direction: number;
  stem_extension: number;
  y_bottom: number;
  y_top: number;
  x_end: number;
  x_begin: number;
}

export abstract class StemmableNote extends Note {
  stem_direction?: number;
  stem?: Stem;

  protected flag?: Glyph;
  protected stem_extension_override?: number;

  constructor(note_struct: NoteStruct) {
    super(note_struct);
    this.setAttribute('type', 'StemmableNote');
  }

  // Get and set the note's `Stem`
  getStem(): Stem | undefined {
    return this.stem;
  }

  setStem(stem: Stem): this {
    this.stem = stem;
    return this;
  }

  // Builds and sets a new stem
  buildStem(): this {
    const stem = new Stem();
    this.setStem(stem);
    return this;
  }

  buildFlag(category = 'flag'): void {
    const { glyph } = this;

    if (this.hasFlag()) {
      const flagCode = this.getStemDirection() === Stem.DOWN ? glyph.code_flag_downstem : glyph.code_flag_upstem;

      this.flag = new Glyph(flagCode, this.render_options.glyph_font_scale, { category });
    }
  }

  // Get the custom glyph associated with the outer note head on the base of the stem.
  getBaseCustomNoteHeadGlyph(): GlyphProps {
    if (this.getStemDirection() === Stem.DOWN) {
      return this.customGlyphs[this.customGlyphs.length - 1];
    } else {
      return this.customGlyphs[0];
    }
  }

  // Get the full length of stem
  getStemLength(): number {
    return Stem.HEIGHT + this.getStemExtension();
  }

  // Get the number of beams for this duration
  getBeamCount(): number {
    const glyph = this.getGlyph();

    if (glyph) {
      return glyph.beam_count;
    } else {
      return 0;
    }
  }

  // Get the minimum length of stem
  getStemMinimumLength(): number {
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
  getStemDirection(): number | undefined {
    return this.stem_direction;
  }

  setStemDirection(direction: number): this {
    if (!direction) direction = Stem.UP;
    if (direction !== Stem.UP && direction !== Stem.DOWN) {
      throw new Vex.RERR('BadArgument', `Invalid stem direction: ${direction}`);
    }

    this.stem_direction = direction;

    if (this.stem) {
      this.stem.setDirection(direction);
      this.stem.setExtension(this.getStemExtension());

      // Lookup the base custom notehead (closest to the base of the stem) to extend or shorten
      // the stem appropriately. If there's no custom note head, lookup the standard notehead.
      const glyph = this.getBaseCustomNoteHeadGlyph() || this.getGlyph();

      // Get the font-specific customizations for the note heads.
      const offsets = this.musicFont.lookupMetric(`stem.noteHead.${glyph.code_head}`, {
        offsetYBaseStemUp: 0,
        offsetYTopStemUp: 0,
        offsetYBaseStemDown: 0,
        offsetYTopStemDown: 0,
      });

      // Configure the stem to use these offsets.
      this.stem.setOptions({
        stem_up_y_offset: offsets.offsetYTopStemUp, // glyph.stem_up_y_offset,
        stem_down_y_offset: offsets.offsetYTopStemDown, // glyph.stem_down_y_offset,
        stem_up_y_base_offset: offsets.offsetYBaseStemUp, // glyph.stem_up_y_base_offset,
        stem_down_y_base_offset: offsets.offsetYBaseStemDown, // glyph.stem_down_y_base_offset,
      });
    }

    // Reset and reformat everything.
    this.reset();
    if (this.hasFlag()) {
      this.buildFlag();
    }
    this.beam = undefined;
    if (this.preFormatted) {
      this.preFormat();
    }
    return this;
  }

  // Get the `x` coordinate of the stem
  getStemX(): number {
    const x_begin = this.getAbsoluteX() + this.x_shift;
    const x_end = this.getAbsoluteX() + this.x_shift + this.getGlyphWidth();
    const stem_x = this.stem_direction === Stem.DOWN ? x_begin : x_end;
    return stem_x;
  }

  // Get the `x` coordinate for the center of the glyph.
  // Used for `TabNote` stems and stemlets over rests
  getCenterGlyphX(): number {
    return this.getAbsoluteX() + this.x_shift + this.getGlyphWidth() / 2;
  }

  // Get the stem extension for the current duration
  getStemExtension(): number {
    const glyph = this.getGlyph();

    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    if (glyph) {
      return this.getStemDirection() === Stem.UP ? glyph.stem_up_extension : glyph.stem_down_extension;
    }

    return 0;
  }

  // Set the stem length to a specific. Will override the default length.
  setStemLength(height: number): this {
    this.stem_extension_override = height - Stem.HEIGHT;
    return this;
  }

  // Get the top and bottom `y` values of the stem.
  getStemExtents(): Record<string, number> | undefined {
    return this.stem?.getExtents();
  }

  /** Gets the `y` value for the top modifiers at a specific `textLine`. */
  getYForTopText(textLine: number): number {
    if (!this.stave) throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    const extents = this.getStemExtents();
    if (extents) {
      return Math.min(
        this.stave.getYForTopText(textLine),
        extents.topY - this.render_options.annotation_spacing * (textLine + 1)
      );
    } else {
      return this.stave.getYForTopText(textLine);
    }
  }

  /** Gets the `y` value for the bottom modifiers at a specific `textLine`. */
  getYForBottomText(textLine: number): number {
    if (!this.stave) throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    const extents = this.getStemExtents();
    if (extents) {
      return Math.max(
        this.stave.getYForTopText(textLine),
        extents.baseY + this.render_options.annotation_spacing * textLine
      );
    } else {
      return this.stave.getYForBottomText(textLine);
    }
  }

  hasFlag(): boolean {
    return Flow.getGlyphProps(this.duration).flag && !this.beam;
  }

  /** Post formats the note. */
  postFormat(): this {
    this.beam?.postFormat();
    this.postFormatted = true;

    return this;
  }

  /** Renders the stem onto the canvas. */
  drawStem(stem_struct: StemStruct): void {
    this.checkContext();
    this.setRendered();

    this.setStem(new Stem(stem_struct));
    this.stem?.setContext(this.getContext()).draw();
  }
}
