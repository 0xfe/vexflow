// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Cyril Silverman
//
// ## Description
//
// This file implements ornaments as modifiers that can be
// attached to notes. The complete list of ornaments is available in
// `tables.js` under `Vex.Flow.ornamentCodes`.
//
// See `tests/ornament_tests.js` for usage examples.

import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { TickContext } from './tickcontext';
import { StaveNote } from './stavenote';
import { Glyph } from './glyph';

// To enable logging for this class. Set `Vex.Flow.Ornament.DEBUG` to `true`.
function L() { if (Ornament.DEBUG) Vex.L('Vex.Flow.Ornament', arguments); }

// Accidental position modifications for each glyph
const acc_mods = {
  'n': {
    shift_x: 1,
    shift_y_upper: 0,
    shift_y_lower: 0,
    height: 17,
  },
  '#': {
    shift_x: 0,
    shift_y_upper: -2,
    shift_y_lower: -2,
    height: 20,
  },
  'b': {
    shift_x: 1,
    shift_y_upper: 0,
    shift_y_lower: 3,
    height: 18,
  },
  '##': {
    shift_x: 0,
    shift_y_upper: 0,
    shift_y_lower: 0,
    height: 12,
  },
  'bb': {
    shift_x: 0,
    shift_y_upper: 0,
    shift_y_lower: 4,
    height: 17,
  },
  'db': {
    shift_x: -3,
    shift_y_upper: 0,
    shift_y_lower: 4,
    height: 17,
  },
  'bbs': {
    shift_x: 0,
    shift_y_upper: 0,
    shift_y_lower: 4,
    height: 17,
  },
  'd': {
    shift_x: 0,
    shift_y_upper: 0,
    shift_y_lower: 0,
    height: 17,
  },
  '++': {
    shift_x: -2,
    shift_y_upper: -6,
    shift_y_lower: -3,
    height: 22,
  },
  '+': {
    shift_x: 1,
    shift_y_upper: -4,
    shift_y_lower: -2,
    height: 20,
  },
  'bs': {
    shift_x: 0,
    shift_y_upper: 0,
    shift_y_lower: 4,
    height: 17,
  },
  'bss': {
    shift_x: 0,
    shift_y_upper: 0,
    shift_y_lower: 4,
    height: 17,
  },
  '++-': {
    shift_x: -2,
    shift_y_upper: -6,
    shift_y_lower: -3,
    height: 22,
  },
  '+-': {
    shift_x: 1,
    shift_y_upper: -4,
    shift_y_lower: -2,
    height: 20,
  },
};

export class Ornament extends Modifier {
  static get CATEGORY() { return 'ornaments'; }

  // ## Static Methods
  // Arrange ornaments inside `ModifierContext`
  static format(ornaments, state) {
    if (!ornaments || ornaments.length === 0) return false;

    let width = 0;
    for (let i = 0; i < ornaments.length; ++i) {
      const ornament = ornaments[i];
      let increment = 1;
      width = Math.max(ornament.getWidth(), width);

      const type = Flow.ornamentCodes(ornament.type);

      if (!type.between_lines) increment += 1.5;

      if (ornament.getPosition() === Modifier.Position.ABOVE) {
        ornament.setTextLine(state.top_text_line);
        state.top_text_line += increment;
      } else {
        ornament.setTextLine(state.text_line);
        state.text_line += increment;
      }
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }

  // Create a new ornament of type `type`, which is an entry in
  // `Vex.Flow.ornamentCodes` in `tables.js`.
  constructor(type) {
    super();

    this.note = null;
    this.index = null;
    this.type = type;
    this.position = Modifier.Position.ABOVE;
    this.delayed = false;

    this.accidental_upper = '';
    this.accidental_lower = '';

    this.render_options = {
      font_scale: 38,
    };

    this.ornament = Flow.ornamentCodes(this.type);
    if (!this.ornament) throw new Vex.RERR('ArgumentError',
       "Ornament not found: '" + this.type + "'");

    // Default width comes from ornament table.
    this.setWidth(this.ornament.width);
  }

  getCategory() { return Ornament.CATEGORY; }

  // Set whether the ornament is to be delayed
  setDelayed(delayed) { this.delayed = delayed; return this; }

  // Set the upper accidental for the ornament
  setUpperAccidental(acc) {
    this.accidental_upper = acc;
    return this;
  }

  // Set the lower accidental for the ornament
  setLowerAccidental(acc) {
    this.accidental_lower = acc;
    return this;
  }

  // Render ornament in position next to note.
  draw() {
    if (!this.context) throw new Vex.RERR('NoContext',
      "Can't draw Ornament without a context.");
    if (!(this.note && (this.index !== null))) throw new Vex.RERR('NoAttachedNote',
      "Can't draw Ornament without a note and index.");

    const ctx = this.context;
    const stem_direction = this.note.getStemDirection();
    const stave = this.note.getStave();

    // Get stem extents
    const stem_ext = this.note.getStem().getExtents();
    let top, bottom;
    if (stem_direction === StaveNote.STEM_DOWN) {
      top = stem_ext.baseY;
      bottom = stem_ext.topY;
    } else {
      top = stem_ext.topY;
      bottom = stem_ext.baseY;
    }

    // TabNotes don't have stems attached to them. Tab stems are rendered
    // outside the stave.
    const is_tabnote = this.note.getCategory() === 'tabnotes';
    if (is_tabnote) {
      if (this.note.hasStem()) {
        if (stem_direction === StaveNote.STEM_UP) {
          bottom = stave.getYForBottomText(this.text_line - 2);
        } else if (stem_direction === StaveNote.STEM_DOWN) {
          top = stave.getYForTopText(this.text_line - 1.5);
        }
      } else { // Without a stem
        top = stave.getYForTopText(this.text_line - 1);
        bottom = stave.getYForBottomText(this.text_line - 2);
      }
    }

    const is_on_head = stem_direction === StaveNote.STEM_DOWN;
    const spacing = stave.getSpacingBetweenLines();
    let line_spacing = 1;

    // Beamed stems are longer than quarter note stems, adjust accordingly
    if (!is_on_head && this.note.beam) {
      line_spacing += 0.5;
    }

    const total_spacing = spacing * (this.text_line + line_spacing);
    const glyph_y_between_lines = (top - 7) - total_spacing;

    // Get initial coordinates for the modifier position
    const start = this.note.getModifierStartXY(this.position, this.index);
    let glyph_x = start.x + this.ornament.shift_right;
    let glyph_y = Math.min(stave.getYForTopText(this.text_line) - 3, glyph_y_between_lines);
    glyph_y += this.ornament.shift_up + this.y_shift;

    // Ajdust x position if ornament is delayed
    if (this.delayed) {
      glyph_x += this.ornament.width;
      const next_context = TickContext.getNextContext(this.note.getTickContext());
      if (next_context) {
        glyph_x += (next_context.getX() - glyph_x) * 0.5;
      } else {
        glyph_x += (stave.x + stave.width - glyph_x) * 0.5;
      }
    }

    const ornament = this;
    function drawAccidental(ctx, code, upper) {
      const accidental = Flow.accidentalCodes(code);

      let acc_x = glyph_x - 3;
      let acc_y = glyph_y + 2;

      // Special adjustments for trill glyph
      if (upper) {
        acc_y -= mods ? mods.height : 18;
        acc_y +=  ornament.type === 'tr' ? -8 : 0;
      } else {
        acc_y +=  ornament.type === 'tr' ? -6 : 0;
      }

      // Fine tune position of accidental glyph
      var mods = acc_mods[code];
      if (mods) {
        acc_x += mods.shift_x;
        acc_y += upper ? mods.shift_y_upper : mods.shift_y_lower;
      }

      // Render the glyph
      const scale = ornament.render_options.font_scale / 1.3;
      Glyph.renderGlyph(ctx, acc_x, acc_y, scale, accidental.code);

      // If rendered a bottom accidental, increase the y value by the
      // accidental height so that the ornament's glyph is shifted up
      if (!upper) {
        glyph_y -= mods ? mods.height : 18;
      }
    }

    // Draw lower accidental for ornament
    if (this.accidental_lower) {
      drawAccidental(ctx, this.accidental_lower, false, glyph_x, glyph_y);
    }

    L('Rendering ornament: ', this.ornament, glyph_x, glyph_y);
    Glyph.renderGlyph(ctx, glyph_x, glyph_y,
                         this.render_options.font_scale, this.ornament.code);

    // Draw upper accidental for ornament
    if (this.accidental_upper) {
      drawAccidental(ctx, this.accidental_upper, true, glyph_x, glyph_y);
    }
  }
}
