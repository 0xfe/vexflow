// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `StemmableNote` is an abstract interface for notes with optional stems.
// Examples of stemmable notes are `StaveNote` and `TabNote`

import { Glyph, GlyphProps } from './glyph';
import { Note, NoteStruct } from './note';
import { Stem, StemOptions } from './stem';
import { Tables } from './tables';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export abstract class StemmableNote extends Note {
  static get CATEGORY(): string {
    return Category.StemmableNote;
  }

  stem_direction?: number;
  stem?: Stem;

  protected flag?: Glyph;
  protected stem_extension_override?: number;

  constructor(noteStruct: NoteStruct) {
    super(noteStruct);
  }

  // Get and set the note's `Stem`
  getStem(): Stem | undefined {
    return this.stem;
  }

  checkStem(): Stem {
    if (!this.stem) {
      throw new RuntimeError('NoStem', 'No stem attached to instance');
    }
    return this.stem;
  }

  setStem(stem: Stem): this {
    this.stem = stem;
    this.addChildElement(stem);
    return this;
  }

  // Builds and sets a new stem
  buildStem(): this {
    const stem = new Stem();
    this.setStem(stem);
    return this;
  }

  buildFlag(category = 'flag'): void {
    const { glyphProps } = this;

    if (this.hasFlag()) {
      const flagCode =
        this.getStemDirection() === Stem.DOWN ? glyphProps.code_flag_downstem : glyphProps.code_flag_upstem;

      if (flagCode) this.flag = new Glyph(flagCode, this.render_options.glyph_font_scale, { category });
    }
  }

  // Get the custom glyph associated with the outer note head on the base of the stem.
  getBaseCustomNoteHeadGlyphProps(): GlyphProps {
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
    const glyphProps = this.getGlyphProps();

    if (glyphProps) {
      return glyphProps.beam_count;
    } else {
      return 0;
    }
  }

  // Get the minimum length of stem
  getStemMinimumLength(): number {
    const frac = Tables.durationToFraction(this.duration);
    let length = frac.value() <= 1 ? 0 : 20;
    // if note is flagged, cannot shorten beam
    switch (this.duration) {
      case '8':
        if (this.beam == undefined) length = 35;
        break;
      case '16':
        length = this.beam == undefined ? 35 : 25;
        break;
      case '32':
        length = this.beam == undefined ? 45 : 35;
        break;
      case '64':
        length = this.beam == undefined ? 50 : 40;
        break;
      case '128':
        length = this.beam == undefined ? 55 : 45;
        break;
      default:
        break;
    }
    return length;
  }

  // Get/set the direction of the stem
  getStemDirection(): number {
    if (!this.stem_direction) throw new RuntimeError('NoStem', 'No stem attached to this note.');
    return this.stem_direction;
  }

  setStemDirection(direction?: number): this {
    if (!direction) direction = Stem.UP;
    if (direction !== Stem.UP && direction !== Stem.DOWN) {
      throw new RuntimeError('BadArgument', `Invalid stem direction: ${direction}`);
    }

    this.stem_direction = direction;

    // Reset and reformat everything. Flag has to be built before calling getStemExtension.
    this.reset();
    if (this.hasFlag()) {
      this.buildFlag();
    }
    this.beam = undefined;

    if (this.stem) {
      this.stem.setDirection(direction);
      this.stem.setExtension(this.getStemExtension());

      // Lookup the base custom notehead (closest to the base of the stem) to extend or shorten
      // the stem appropriately. If there's no custom note head, lookup the standard notehead.
      const glyphProps = this.getBaseCustomNoteHeadGlyphProps() || this.getGlyphProps();

      // Get the font-specific customizations for the note heads.
      const offsets = Tables.currentMusicFont().lookupMetric(`stem.noteHead.${glyphProps.code_head}`, {
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
    const glyphProps = this.getGlyphProps();

    if (this.stem_extension_override != undefined) {
      return this.stem_extension_override;
    }

    // Use stem_beam_extension with beams
    if (this.beam) {
      return glyphProps.stem_beam_extension;
    }

    if (glyphProps) {
      return this.getStemDirection() === Stem.UP ? glyphProps.stem_up_extension : glyphProps.stem_down_extension;
    }

    return 0;
  }

  // Set the stem length to a specific. Will override the default length.
  setStemLength(height: number): this {
    this.stem_extension_override = height - Stem.HEIGHT;
    return this;
  }

  // Get the top and bottom `y` values of the stem.
  getStemExtents(): { topY: number; baseY: number } {
    if (!this.stem) throw new RuntimeError('NoStem', 'No stem attached to this note.');
    return this.stem.getExtents();
  }

  /** Gets the `y` value for the top modifiers at a specific `textLine`. */
  getYForTopText(textLine: number): number {
    const stave = this.checkStave();
    if (this.hasStem()) {
      const extents = this.getStemExtents();
      if (!extents) throw new RuntimeError('InvalidState', 'Stem does not have extents.');

      return Math.min(
        stave.getYForTopText(textLine),
        extents.topY - this.render_options.annotation_spacing * (textLine + 1)
      );
    } else {
      return stave.getYForTopText(textLine);
    }
  }

  /** Gets the `y` value for the bottom modifiers at a specific `textLine`. */
  getYForBottomText(textLine: number): number {
    const stave = this.checkStave();
    if (this.hasStem()) {
      const extents = this.getStemExtents();
      if (!extents) throw new RuntimeError('InvalidState', 'Stem does not have extents.');

      return Math.max(
        stave.getYForTopText(textLine),
        extents.baseY + this.render_options.annotation_spacing * textLine
      );
    } else {
      return stave.getYForBottomText(textLine);
    }
  }

  hasFlag(): boolean {
    return Tables.getGlyphProps(this.duration).flag == true && !this.beam;
  }

  /** Post formats the note. */
  postFormat(): this {
    this.beam?.postFormat();
    this.postFormatted = true;
    return this;
  }

  /** Renders the stem onto the canvas. */
  drawStem(stemOptions: StemOptions): void {
    this.checkContext();
    this.setRendered();

    this.setStem(new Stem(stemOptions));
    this.stem?.setContext(this.getContext()).draw();
  }
}
