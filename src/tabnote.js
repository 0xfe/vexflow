// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// The file implements notes for Tablature notation. This consists of one or
// more fret positions, and can either be drawn with or without stems.
//
// See `tests/tabnote_tests.js` for usage examples

import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Dot } from './dot';
import { Glyph } from './glyph';

// Gets the unused strings grouped together if consecutive.
//
// Parameters:
// * num_lines - The number of lines
// * strings_used - An array of numbers representing which strings have fret positions
function getUnusedStringGroups(num_lines, strings_used) {
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
function getPartialStemLines(stem_y, unused_strings, stave, stem_direction) {
  const up_stem = stem_direction !== 1;
  const down_stem = stem_direction !== -1;

  const line_spacing = stave.getSpacingBetweenLines();
  const total_lines = stave.getNumLines();

  const stem_lines = [];

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

    const line_ys = [];
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
  static get CATEGORY() {
    return 'tabnotes';
  }

  // Initialize the TabNote with a `tab_struct` full of properties
  // and whether to `draw_stem` when rendering the note
  constructor(tab_struct, draw_stem) {
    super(tab_struct);
    this.setAttribute('type', 'TabNote');

    this.ghost = false; // Renders parenthesis around notes
    // Note properties
    //
    // The fret positions in the note. An array of `{ str: X, fret: X }`
    this.positions = tab_struct.positions;

    // Render Options
    Vex.Merge(this.render_options, {
      // font size for note heads and rests
      glyph_font_scale: Flow.DEFAULT_TABLATURE_FONT_SCALE,
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
      font: '10pt Arial',
    });

    this.glyph = Flow.getGlyphProps(this.duration, this.noteType);

    if (!this.glyph) {
      throw new Vex.RuntimeError(
        'BadArguments',
        `Invalid note initialization data (No glyph found): ${JSON.stringify(tab_struct)}`
      );
    }

    this.buildStem();

    if (tab_struct.stem_direction) {
      this.setStemDirection(tab_struct.stem_direction);
    } else {
      this.setStemDirection(Stem.UP);
    }

    // Renders parenthesis around notes
    this.ghost = false;
    this.updateWidth();
  }

  reset() {
    if (this.stave) this.setStave(this.stave);
  }

  // The ModifierContext category
  getCategory() {
    return TabNote.CATEGORY;
  }

  // Set as ghost `TabNote`, surrounds the fret positions with parenthesis.
  // Often used for indicating frets that are being bent to
  setGhost(ghost) {
    this.ghost = ghost;
    this.updateWidth();
    return this;
  }

  // Determine if the note has a stem
  hasStem() {
    return this.render_options.draw_stem;
  }

  // Get the default stem extension for the note
  getStemExtension() {
    const glyph = this.getGlyph();

    if (this.stem_extension_override != null) {
      return this.stem_extension_override;
    }

    if (glyph) {
      return this.getStemDirection() === 1 ? glyph.tabnote_stem_up_extension : glyph.tabnote_stem_down_extension;
    }

    return 0;
  }

  // Add a dot to the note
  addDot() {
    const dot = new Dot();
    this.dots += 1;
    return this.addModifier(dot, 0);
  }

  // Calculate and store the width of the note
  updateWidth() {
    this.glyphs = [];
    this.width = 0;
    for (let i = 0; i < this.positions.length; ++i) {
      let fret = this.positions[i].fret;
      if (this.ghost) fret = '(' + fret + ')';
      const glyph = Flow.tabToGlyph(fret, this.render_options.scale);
      this.glyphs.push(glyph);
      this.width = Math.max(glyph.getWidth(), this.width);
    }
    // For some reason we associate a notehead glyph with a TabNote, and this
    // glyph is used for certain width calculations. Of course, this is totally
    // incorrect since a notehead is a poor approximation for the dimensions of
    // a fret number which can have multiple digits. As a result, we must
    // overwrite getWidth() to return the correct width
    this.glyph.getWidth = () => this.width;
  }

  // Set the `stave` to the note
  setStave(stave) {
    super.setStave(stave);
    this.context = stave.context;

    // Calculate the fret number width based on font used
    let i;
    if (this.context) {
      const ctx = this.context;
      this.width = 0;
      for (i = 0; i < this.glyphs.length; ++i) {
        const glyph = this.glyphs[i];
        const text = '' + glyph.text;
        if (text.toUpperCase() !== 'X') {
          ctx.save();
          ctx.setRawFont(this.render_options.font);
          glyph.width = ctx.measureText(text).width;
          ctx.restore();
          glyph.getWidth = () => glyph.width;
        }
        this.width = Math.max(glyph.getWidth(), this.width);
      }
      this.glyph.getWidth = () => this.width;
    }

    // we subtract 1 from `line` because getYForLine expects a 0-based index,
    // while the position.str is a 1-based index
    const ys = this.positions.map(({ str: line }) => stave.getYForLine(line - 1));

    this.setYs(ys);

    if (this.stem) {
      this.stem.setYBounds(this.getStemY(), this.getStemY());
    }

    return this;
  }

  // Get the fret positions for the note
  getPositions() {
    return this.positions;
  }

  // Add self to the provided modifier context `mc`
  addToModifierContext(mc) {
    this.setModifierContext(mc);
    for (let i = 0; i < this.modifiers.length; ++i) {
      this.modifierContext.addModifier(this.modifiers[i]);
    }
    this.modifierContext.addModifier(this);
    this.preFormatted = false;
    return this;
  }

  // Get the `x` coordinate to the right of the note
  getTieRightX() {
    let tieStartX = this.getAbsoluteX();
    const note_glyph_width = this.glyph.getWidth();
    tieStartX += note_glyph_width / 2;
    tieStartX += -this.width / 2 + this.width + 2;

    return tieStartX;
  }

  // Get the `x` coordinate to the left of the note
  getTieLeftX() {
    let tieEndX = this.getAbsoluteX();
    const note_glyph_width = this.glyph.getWidth();
    tieEndX += note_glyph_width / 2;
    tieEndX -= this.width / 2 + 2;

    return tieEndX;
  }

  // Get the default `x` and `y` coordinates for a modifier at a specific
  // `position` at a fret position `index`
  getModifierStartXY(position, index) {
    if (!this.preFormatted) {
      throw new Vex.RERR('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
    }

    if (this.ys.length === 0) {
      throw new Vex.RERR('NoYValues', 'No Y-Values calculated for this note.');
    }

    let x = 0;
    if (position === Modifier.Position.LEFT) {
      x = -1 * 2; // FIXME: modifier padding, move to font file
    } else if (position === Modifier.Position.RIGHT) {
      x = this.width + 2; // FIXME: modifier padding, move to font file
    } else if (position === Modifier.Position.BELOW || position === Modifier.Position.ABOVE) {
      const note_glyph_width = this.glyph.getWidth();
      x = note_glyph_width / 2;
    }

    return {
      x: this.getAbsoluteX() + x,
      y: this.ys[index],
    };
  }

  // Get the default line for rest
  getLineForRest() {
    return this.positions[0].str;
  }

  // Pre-render formatting
  preFormat() {
    if (this.preFormatted) return;
    if (this.modifierContext) this.modifierContext.preFormat();
    // width is already set during init()
    this.setPreFormatted(true);
  }

  // Get the x position for the stem
  getStemX() {
    return this.getCenterGlyphX();
  }

  // Get the y position for the stem
  getStemY() {
    const num_lines = this.stave.getNumLines();

    // The decimal staff line amounts provide optimal spacing between the
    // fret number and the stem
    const stemUpLine = -0.5;
    const stemDownLine = num_lines - 0.5;
    const stemStartLine = Stem.UP === this.stem_direction ? stemUpLine : stemDownLine;

    return this.stave.getYForLine(stemStartLine);
  }

  // Get the stem extents for the tabnote
  getStemExtents() {
    return this.stem.getExtents();
  }

  // Draw the fal onto the context
  drawFlag() {
    const {
      beam,
      glyph,
      context,
      stem,
      stem_direction,
      render_options: { draw_stem, glyph_font_scale },
    } = this;

    const shouldDrawFlag = beam == null && draw_stem;

    // Now it's the flag's turn.
    if (glyph.flag && shouldDrawFlag) {
      const flag_x = this.getStemX() + 1;
      const flag_y = this.getStemY() - stem.getHeight();

      const flag_code =
        stem_direction === Stem.DOWN
          ? glyph.code_flag_downstem // Down stems have flags on the left.
          : glyph.code_flag_upstem;

      // Draw the Flag
      Glyph.renderGlyph(context, flag_x, flag_y, glyph_font_scale, flag_code, { category: 'flag.tabStem' });
    }
  }

  // Render the modifiers onto the context
  drawModifiers() {
    // Draw the modifiers
    this.modifiers.forEach((modifier) => {
      // Only draw the dots if enabled
      if (modifier.getCategory() === 'dots' && !this.render_options.draw_dots) return;

      modifier.setContext(this.context);
      modifier.drawWithStyle();
    });
  }

  // Render the stem extension through the fret positions
  drawStemThrough() {
    const stem_x = this.getStemX();
    const stem_y = this.getStemY();
    const ctx = this.context;

    const stem_through = this.render_options.draw_stem_through_stave;
    const draw_stem = this.render_options.draw_stem;
    if (draw_stem && stem_through) {
      const total_lines = this.stave.getNumLines();
      const strings_used = this.positions.map((position) => position.str);

      const unused_strings = getUnusedStringGroups(total_lines, strings_used);
      const stem_lines = getPartialStemLines(stem_y, unused_strings, this.getStave(), this.getStemDirection());

      ctx.save();
      ctx.setLineWidth(Stem.WIDTH);
      stem_lines.forEach((bounds) => {
        if (bounds.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(stem_x, bounds[0]);
        ctx.lineTo(stem_x, bounds[bounds.length - 1]);
        ctx.stroke();
        ctx.closePath();
      });
      ctx.restore();
    }
  }

  // Render the fret positions onto the context
  drawPositions() {
    const ctx = this.context;
    const x = this.getAbsoluteX();
    const ys = this.ys;
    for (let i = 0; i < this.positions.length; ++i) {
      const y = ys[i] + this.render_options.y_shift;
      const glyph = this.glyphs[i];

      // Center the fret text beneath the notation note head
      const note_glyph_width = this.glyph.getWidth();
      const tab_x = x + note_glyph_width / 2 - glyph.getWidth() / 2;

      // FIXME: Magic numbers.
      ctx.clearRect(tab_x - 2, y - 3, glyph.getWidth() + 4, 6);

      if (glyph.code) {
        Glyph.renderGlyph(ctx, tab_x, y, this.render_options.glyph_font_scale * this.render_options.scale, glyph.code);
      } else {
        ctx.save();
        ctx.setRawFont(this.render_options.font);
        const text = glyph.text.toString();
        ctx.fillText(text, tab_x, y + 5 * this.render_options.scale);
        ctx.restore();
      }
    }
  }

  // The main rendering function for the entire note
  draw() {
    this.checkContext();

    if (!this.stave) {
      throw new Vex.RERR('NoStave', "Can't draw without a stave.");
    }

    if (this.ys.length === 0) {
      throw new Vex.RERR('NoYValues', "Can't draw note without Y values.");
    }

    this.setRendered();
    const render_stem = this.beam == null && this.render_options.draw_stem;

    this.context.openGroup('tabnote', null, { pointerBBox: true });
    this.drawPositions();
    this.drawStemThrough();

    const stem_x = this.getStemX();

    this.stem.setNoteHeadXBounds(stem_x, stem_x);

    if (render_stem) {
      this.context.openGroup('stem', null, { pointerBBox: true });
      this.stem.setContext(this.context).draw();
      this.context.closeGroup();
    }

    this.drawFlag();
    this.drawModifiers();
    this.context.closeGroup();
  }
}
