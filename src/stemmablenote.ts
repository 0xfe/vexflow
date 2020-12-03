// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// `StemmableNote` is an abstract interface for notes with optional stems.
// Examples of stemmable notes are `StaveNote` and `TabNote`

import {Vex} from './vex';
import {Flow} from './tables';
import {Stem} from './stem';
import {Glyph} from './glyph';
import {Note} from './note';
import {Beam} from "./beam";
import {IStaveNoteStruct} from "./types/note";
import {IGlyphProps} from "./types/glyph";
import {IStemStruct} from "./types/stem";

export class StemmableNote extends Note {
  stem_direction: number;
  stem: Stem;
  beam: Beam;

  protected flag: Glyph;
  protected stem_extension_override: number;

  constructor(note_struct: IStaveNoteStruct) {
    super(note_struct);
    this.setAttribute('type', 'StemmableNote');

    this.stem = null;
    this.stem_extension_override = null;
    this.beam = null;
  }

  // Get and set the note's `Stem`
  getStem(): Stem {
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
    const {glyph, beam} = this;
    const shouldRenderFlag = beam === null;

    if ((glyph as IGlyphProps) && (glyph as IGlyphProps).flag && shouldRenderFlag) {
      const flagCode = this.getStemDirection() === Stem.DOWN
        ? (glyph as IGlyphProps).code_flag_downstem
        : (glyph as IGlyphProps).code_flag_upstem;

      this.flag = new Glyph(flagCode, this.render_options.glyph_font_scale, {category});
    }
  }

  // Get the custom glyph associated with the outer note head on the base of the stem.
  getBaseCustomNoteHeadGlyph(): IGlyphProps {
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
      return (glyph as IGlyphProps).beam_count;
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
  getStemDirection(): number {
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
      const offsets = this.musicFont.lookupMetric(`stem.noteHead.${(glyph as IGlyphProps).code_head}`,
        {offsetYBaseStemUp: 0, offsetYTopStemUp: 0, offsetYBaseStemDown: 0, offsetYTopStemDown: 0,});

      // Configure the stem to use these offsets.
      this.stem.setOptions({
        stem_up_y_offset: offsets.offsetYTopStemUp, // glyph.stem_up_y_offset,
        stem_down_y_offset: offsets.offsetYTopStemDown, // glyph.stem_down_y_offset,
        stem_up_y_base_offset: offsets.offsetYBaseStemUp, // glyph.stem_up_y_base_offset,
        stem_down_y_base_offset: offsets.offsetYBaseStemDown, // glyph.stem_down_y_base_offset,
      } as IStemStruct);
    }

    // Reset and reformat everything.
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
  getStemX(): number {
    const x_begin = this.getAbsoluteX() + this.x_shift;
    const x_end = this.getAbsoluteX() + this.x_shift + this.getGlyphWidth();

    return this.stem_direction === Stem.DOWN ? x_begin : x_end;
  }

  // Get the `x` coordinate for the center of the glyph.
  // Used for `TabNote` stems and stemlets over rests
  getCenterGlyphX(): number {
    return this.getAbsoluteX() + this.x_shift + (this.getGlyphWidth() / 2);
  }

  // Get the stem extension for the current duration
  getStemExtension(): number {
    const glyph = this.getGlyph() as IGlyphProps;

    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    if (glyph) {
      return this.getStemDirection() === Stem.UP
        ? glyph.stem_up_extension
        : glyph.stem_down_extension;
    }

    return 0;
  }

  // Set the stem length to a specific. Will override the default length.
  setStemLength(height: number): this {
    this.stem_extension_override = (height - Stem.HEIGHT);
    return this;
  }

  // Get the top and bottom `y` values of the stem.
  getStemExtents(): Record<string, number> {
    return this.stem.getExtents();
  }

  // Sets the current note's beam
  setBeam(beam?: Beam): this {
    this.beam = beam;
    return this;
  }

  // Get the `y` value for the top/bottom modifiers at a specific `textLine`
  getYForTopText(textLine: number): number {
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

  getYForBottomText(textLine: number): number {
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

  hasFlag(): boolean {
    return Flow.getGlyphProps(this.duration).flag && !this.beam;
  }

  // Post format the note
  postFormat(): this {
    if (this.beam) {
      this.beam.postFormat();
    }

    this.postFormatted = true;

    return this;
  }

  // Render the stem onto the canvas
  drawStem(stem_struct: IStemStruct): void {
    this.checkContext();
    this.setRendered();

    this.setStem(new Stem(stem_struct));
    this.stem.setContext(this.context).draw();
  }
}
