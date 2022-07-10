// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// The file implements notes for Tablature notation. This consists of one or
// more fret positions, and can either be drawn with or without stems.
//
// See `tests/tabnote_tests.ts` for usage examples.

import { Font } from './font';
import { Glyph, GlyphProps } from './glyph';
import { Modifier } from './modifier';
import { Stave } from './stave';
import { StaveNoteStruct } from './stavenote';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Category, isDot } from './typeguard';
import { defined, RuntimeError } from './util';

export interface TabNotePosition {
  // For example, on a six stringed instrument, `str` ranges from 1 to 6.
  str: number;

  // fret: 'X' indicates an unused/muted string.
  // fret: 3 indicates the third fret.
  fret: number | string;
}

export interface TabNoteStruct extends StaveNoteStruct {
  positions: TabNotePosition[];
}

// Gets the unused strings grouped together if consecutive.
//
// Parameters:
// * num_lines - The number of lines
// * strings_used - An array of numbers representing which strings have fret positions
function getUnusedStringGroups(num_lines: number, strings_used: number[]) {
  const stem_through = [];
  let group = [];
  for (let string = 1; string <= num_lines; string++) {
    const is_used = strings_used.indexOf(string) > -1;

    if (!is_used) {
      group.push(string);
    } else {
      stem_through.push(group);
      group = [];
    }
  }
  if (group.length > 0) stem_through.push(group);

  return stem_through;
}

// Gets groups of points that outline the partial stem lines
// between fret positions
//
// Parameters:
// * stem_Y - The `y` coordinate the stem is located on
// * unused_strings - An array of groups of unused strings
// * stave - The stave to use for reference
// * stem_direction - The direction of the stem
function getPartialStemLines(stem_y: number, unused_strings: number[][], stave: Stave, stem_direction: number) {
  const up_stem = stem_direction !== 1;
  const down_stem = stem_direction !== -1;

  const line_spacing = stave.getSpacingBetweenLines();
  const total_lines = stave.getNumLines();

  const stem_lines: number[][] = [];

  unused_strings.forEach((strings) => {
    const containsLastString = strings.indexOf(total_lines) > -1;
    const containsFirstString = strings.indexOf(1) > -1;

    if ((up_stem && containsFirstString) || (down_stem && containsLastString)) {
      return;
    }

    // If there's only one string in the group, push a duplicate value.
    // We do this because we need 2 strings to convert into upper/lower y
    // values.
    if (strings.length === 1) {
      strings.push(strings[0]);
    }

    const line_ys: number[] = [];
    // Iterate through each group string and store it's y position
    strings.forEach((string, index, strings) => {
      const isTopBound = string === 1;
      const isBottomBound = string === total_lines;

      // Get the y value for the appropriate staff line,
      // we adjust for a 0 index array, since string numbers are index 1
      let y = stave.getYForLine(string - 1);

      // Unless the string is the first or last, add padding to each side
      // of the line
      if (index === 0 && !isTopBound) {
        y -= line_spacing / 2 - 1;
      } else if (index === strings.length - 1 && !isBottomBound) {
        y += line_spacing / 2 - 1;
      }

      // Store the y value
      line_ys.push(y);

      // Store a subsequent y value connecting this group to the main
      // stem above/below the stave if it's the top/bottom string
      if (stem_direction === 1 && isTopBound) {
        line_ys.push(stem_y - 2);
      } else if (stem_direction === -1 && isBottomBound) {
        line_ys.push(stem_y + 2);
      }
    });

    // Add the sorted y values to the
    stem_lines.push(line_ys.sort((a, b) => a - b));
  });

  return stem_lines;
}

export class TabNote extends StemmableNote {
  static get CATEGORY(): string {
    return Category.TabNote;
  }

  protected ghost: boolean;
  protected glyphPropsArr: GlyphProps[] = [];
  protected positions: TabNotePosition[];

  // Initialize the TabNote with a `noteStruct` full of properties
  // and whether to `draw_stem` when rendering the note
  constructor(noteStruct: TabNoteStruct, draw_stem: boolean = false) {
    super(noteStruct);

    this.ghost = false; // Renders parenthesis around notes

    // Note properties
    // The fret positions in the note. An array of `{ str: X, fret: X }`
    this.positions = noteStruct.positions || [];

    // Render Options
    this.render_options = {
      ...this.render_options,
      // font size for note heads and rests
      glyph_font_scale: Tables.TABLATURE_FONT_SCALE,
      // Flag to draw a stem
      draw_stem,
      // Flag to draw dot modifiers
      draw_dots: draw_stem,
      // Flag to extend the main stem through the stave and fret positions
      draw_stem_through_stave: false,
      // vertical shift from stave line
      y_shift: 0,
      // normal glyph scale
      scale: 1.0,
      // default tablature font
      font: `${Font.SIZE}pt ${Font.SANS_SERIF}`,
    };

    this.glyphProps = Tables.getGlyphProps(this.duration, this.noteType);
    defined(
      this.glyphProps,
      'BadArguments',
      `No glyph found for duration '${this.duration}' and type '${this.noteType}'`
    );

    this.buildStem();

    if (noteStruct.stem_direction) {
      this.setStemDirection(noteStruct.stem_direction);
    } else {
      this.setStemDirection(Stem.UP);
    }

    // Renders parenthesis around notes
    this.ghost = false;
    this.updateWidth();
  }
  // Return the number of the greatest string, which is the string lowest on the display
  greatestString = (): number => {
    return this.positions.map((x) => x.str).reduce((a, b) => (a > b ? a : b));
  };
  // Return the number of the least string, which is the string highest on the display
  leastString = (): number => {
    return this.positions.map((x) => x.str).reduce((a, b) => (a < b ? a : b));
  };

  reset(): this {
    super.reset();
    if (this.stave) this.setStave(this.stave);
    return this;
  }

  // Set as ghost `TabNote`, surrounds the fret positions with parenthesis.
  // Often used for indicating frets that are being bent to
  setGhost(ghost: boolean): this {
    this.ghost = ghost;
    this.updateWidth();
    return this;
  }

  // Determine if the note has a stem
  hasStem(): boolean {
    if (this.render_options.draw_stem) return true;
    return false;
  }

  // Get the default stem extension for the note
  getStemExtension(): number {
    const glyphProps = this.getGlyphProps();

    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    if (glyphProps) {
      return this.getStemDirection() === Stem.UP
        ? glyphProps.tabnote_stem_up_extension
        : glyphProps.tabnote_stem_down_extension;
    }

    return 0;
  }

  // Calculate and store the width of the note
  updateWidth(): void {
    this.glyphPropsArr = [];
    this.width = 0;
    for (let i = 0; i < this.positions.length; ++i) {
      let fret = this.positions[i].fret;
      if (this.ghost) fret = '(' + fret + ')';
      const glyphProps = Tables.tabToGlyphProps(fret.toString(), this.render_options.scale);
      this.glyphPropsArr.push(glyphProps);
      this.width = Math.max(glyphProps.getWidth(), this.width);
    }
    // For some reason we associate a notehead glyph with a TabNote, and this
    // glyph is used for certain width calculations. Of course, this is totally
    // incorrect since a notehead is a poor approximation for the dimensions of
    // a fret number which can have multiple digits. As a result, we must
    // overwrite getWidth() to return the correct width
    this.glyphProps.getWidth = () => this.width;
  }

  // Set the `stave` to the note
  setStave(stave: Stave): this {
    super.setStave(stave);
    const ctx = stave.getContext();
    this.setContext(ctx);

    // Calculate the fret number width based on font used
    if (ctx) {
      this.width = 0;
      for (let i = 0; i < this.glyphPropsArr.length; ++i) {
        const glyphProps = this.glyphPropsArr[i];
        const text = '' + glyphProps.text;
        if (text.toUpperCase() !== 'X') {
          ctx.save();
          ctx.setFont(this.render_options.font);
          glyphProps.width = ctx.measureText(text).width;
          ctx.restore();
          glyphProps.getWidth = () => glyphProps.width as number;
        }
        this.width = Math.max(glyphProps.getWidth(), this.width);
      }
      this.glyphProps.getWidth = () => this.width;
    }

    // we subtract 1 from `line` because getYForLine expects a 0-based index,
    // while the position.str is a 1-based index
    const ys = this.positions.map(({ str: line }) => stave.getYForLine(Number(line) - 1));

    this.setYs(ys);

    if (this.stem) {
      this.stem.setYBounds(this.getStemY(), this.getStemY());
    }

    return this;
  }

  // Get the fret positions for the note
  getPositions(): TabNotePosition[] {
    return this.positions;
  }

  // Get the default `x` and `y` coordinates for a modifier at a specific
  // `position` at a fret position `index`
  getModifierStartXY(position: number, index: number): { x: number; y: number } {
    if (!this.preFormatted) {
      throw new RuntimeError('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
    }

    if (this.ys.length === 0) {
      throw new RuntimeError('NoYValues', 'No Y-Values calculated for this note.');
    }

    let x = 0;
    if (position === Modifier.Position.LEFT) {
      x = -1 * 2; // FIXME: modifier padding, move to font file
    } else if (position === Modifier.Position.RIGHT) {
      x = this.width + 2; // FIXME: modifier padding, move to font file
    } else if (position === Modifier.Position.BELOW || position === Modifier.Position.ABOVE) {
      const note_glyph_width = this.glyphProps.getWidth();
      x = note_glyph_width / 2;
    }

    return {
      x: this.getAbsoluteX() + x,
      y: this.ys[index],
    };
  }

  // Get the default line for rest
  getLineForRest(): number {
    return Number(this.positions[0].str);
  }

  // Pre-render formatting
  preFormat(): void {
    if (this.preFormatted) return;
    if (this.modifierContext) this.modifierContext.preFormat();
    // width is already set during init()
    this.preFormatted = true;
  }

  // Get the x position for the stem
  getStemX(): number {
    return this.getCenterGlyphX();
  }

  // Get the y position for the stem
  getStemY(): number {
    const num_lines = this.checkStave().getNumLines();

    // The decimal staff line amounts provide optimal spacing between the
    // fret number and the stem
    const stemUpLine = -0.5;
    const stemDownLine = num_lines - 0.5;
    const stemStartLine = Stem.UP === this.stem_direction ? stemUpLine : stemDownLine;

    return this.checkStave().getYForLine(stemStartLine);
  }

  // Get the stem extents for the tabnote
  getStemExtents(): { topY: number; baseY: number } {
    return this.checkStem().getExtents();
  }

  // Draw the fal onto the context
  drawFlag(): void {
    const {
      beam,
      glyphProps,
      render_options: { draw_stem },
    } = this;
    const context = this.checkContext();

    const shouldDrawFlag = beam == undefined && draw_stem;

    // Now it's the flag's turn.
    if (glyphProps.flag && shouldDrawFlag) {
      const flag_x = this.getStemX();
      const flag_y =
        this.getStemDirection() === Stem.DOWN
          ? // Down stems are below the note head and have flags on the right.
            this.getStemY() - this.checkStem().getHeight() - (this.glyphProps ? this.glyphProps.stem_down_extension : 0)
          : // Up stems are above the note head and have flags on the right.
            this.getStemY() - this.checkStem().getHeight() + (this.glyphProps ? this.glyphProps.stem_up_extension : 0);

      // Draw the Flag
      //this.flag?.setOptions({ category: 'flag.tabStem' });
      this.flag?.render(context, flag_x, flag_y);
      //Glyph.renderGlyph(context, flag_x, flag_y, glyph_font_scale, flag_code, { category: 'flag.tabStem' });
    }
  }

  // Render the modifiers onto the context.
  drawModifiers(): void {
    this.modifiers.forEach((modifier) => {
      // Only draw the dots if enabled.
      if (isDot(modifier) && !this.render_options.draw_dots) {
        return;
      }

      modifier.setContext(this.getContext());
      modifier.drawWithStyle();
    });
  }

  // Render the stem extension through the fret positions
  drawStemThrough(): void {
    const stemX = this.getStemX();
    const stemY = this.getStemY();
    const ctx = this.checkContext();

    const drawStem = this.render_options.draw_stem;
    const stemThrough = this.render_options.draw_stem_through_stave;
    if (drawStem && stemThrough) {
      const numLines = this.checkStave().getNumLines();
      const stringsUsed = this.positions.map((position) => Number(position.str));

      const unusedStrings = getUnusedStringGroups(numLines, stringsUsed);
      const stemLines = getPartialStemLines(stemY, unusedStrings, this.checkStave(), this.getStemDirection());

      ctx.save();
      ctx.setLineWidth(Stem.WIDTH);
      stemLines.forEach((bounds) => {
        if (bounds.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(stemX, bounds[0]);
        ctx.lineTo(stemX, bounds[bounds.length - 1]);
        ctx.stroke();
        ctx.closePath();
      });
      ctx.restore();
    }
  }

  // Render the fret positions onto the context
  drawPositions(): void {
    const ctx = this.checkContext();
    const x = this.getAbsoluteX();
    const ys = this.ys;
    for (let i = 0; i < this.positions.length; ++i) {
      const y = ys[i] + this.render_options.y_shift;
      const glyphProps = this.glyphPropsArr[i];

      // Center the fret text beneath the notation note head
      const note_glyph_width = this.glyphProps.getWidth();
      const tab_x = x + note_glyph_width / 2 - glyphProps.getWidth() / 2;

      // FIXME: Magic numbers.
      ctx.clearRect(tab_x - 2, y - 3, glyphProps.getWidth() + 4, 6);

      if (glyphProps.code) {
        Glyph.renderGlyph(
          ctx,
          tab_x,
          y,
          this.render_options.glyph_font_scale * this.render_options.scale,
          glyphProps.code
        );
      } else {
        ctx.save();
        ctx.setFont(this.render_options.font);
        const text = glyphProps.text ?? '';
        ctx.fillText(text, tab_x, y + 5 * this.render_options.scale);
        ctx.restore();
      }
    }
  }

  // The main rendering function for the entire note.
  draw(): void {
    const ctx = this.checkContext();

    if (this.ys.length === 0) {
      throw new RuntimeError('NoYValues', "Can't draw note without Y values.");
    }

    this.setRendered();
    const render_stem = this.beam == undefined && this.render_options.draw_stem;

    this.applyStyle();
    ctx.openGroup('tabnote', this.getAttribute('id'), { pointerBBox: true });
    this.drawPositions();
    this.drawStemThrough();

    if (this.stem && render_stem) {
      const stem_x = this.getStemX();
      this.stem.setNoteHeadXBounds(stem_x, stem_x);
      this.stem.setContext(ctx).draw();
    }

    this.drawFlag();
    this.drawModifiers();
    ctx.closeGroup();
    this.restoreStyle();
  }
}
