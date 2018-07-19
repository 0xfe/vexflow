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
function L(...args) { if (Ornament.DEBUG) Vex.L('Vex.Flow.Ornament', args); }

export class Ornament extends Modifier {
  static get CATEGORY() { return 'ornaments'; }

  // ## Static Methods
  // Arrange ornaments inside `ModifierContext`
  static format(ornaments, state) {
    if (!ornaments || ornaments.length === 0) return false;

    let width = 0;
    for (let i = 0; i < ornaments.length; ++i) {
      const ornament = ornaments[i];
      const increment = 2;

      width = Math.max(ornament.getWidth(), width);

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
    this.setAttribute('type', 'Ornament');

    this.note = null;
    this.index = null;
    this.type = type;
    this.position = Modifier.Position.ABOVE;
    this.delayed = false;

    this.accidentalUpper = null;
    this.accidentalLower = null;

    this.render_options = {
      font_scale: 38,
      accidentalLowerPadding: 3,
      accidentalUpperPadding: 3,
    };

    this.ornament = Flow.ornamentCodes(this.type);
    if (!this.ornament) {
      throw new Vex.RERR('ArgumentError', `Ornament not found: '${this.type}'`);
    }

    this.glyph = new Glyph(this.ornament.code, this.render_options.font_scale);
    this.glyph.setOrigin(0.5, 1.0); // FIXME: SMuFL won't require a vertical origin shift
  }

  getCategory() { return Ornament.CATEGORY; }

  // Set whether the ornament is to be delayed
  setDelayed(delayed) { this.delayed = delayed; return this; }

  // Set the upper accidental for the ornament
  setUpperAccidental(accid) {
    const scale = this.render_options.font_scale / 1.3;
    this.accidentalUpper = new Glyph(Flow.accidentalCodes(accid).code, scale);
    this.accidentalUpper.setOrigin(0.5, 1.0);
    return this;
  }

  // Set the lower accidental for the ornament
  setLowerAccidental(accid) {
    const scale = this.render_options.font_scale / 1.3;
    this.accidentalLower = new Glyph(Flow.accidentalCodes(accid).code, scale);
    this.accidentalLower.setOrigin(0.5, 1.0);
    return this;
  }

  // Render ornament in position next to note.
  draw() {
    this.checkContext();

    if (!this.note || this.index == null) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw Ornament without a note and index.");
    }

    this.setRendered();

    const ctx = this.context;
    const stemDir = this.note.getStemDirection();
    const stave = this.note.getStave();

    // Get stem extents
    const stemExtents = this.note.getStem().getExtents();
    let y = stemDir === StaveNote.STEM_DOWN ? stemExtents.baseY : stemExtents.topY;

    // TabNotes don't have stems attached to them. Tab stems are rendered
    // outside the stave.
    if (this.note.getCategory() === 'tabnotes') {
      if (this.note.hasStem()) {
        if (stemDir === StaveNote.STEM_DOWN) {
          y = stave.getYForTopText(this.text_line);
        }
      } else { // Without a stem
        y = stave.getYForTopText(this.text_line);
      }
    }

    const isPlacedOnNoteheadSide = stemDir === StaveNote.STEM_DOWN;
    const spacing = stave.getSpacingBetweenLines();
    let lineSpacing = 1;

    // Beamed stems are longer than quarter note stems, adjust accordingly
    if (!isPlacedOnNoteheadSide && this.note.beam) {
      lineSpacing += 0.5;
    }

    const totalSpacing = spacing * (this.text_line + lineSpacing);
    const glyphYBetweenLines = y - totalSpacing;

    // Get initial coordinates for the modifier position
    const start = this.note.getModifierStartXY(this.position, this.index);
    let glyphX = start.x;
    let glyphY = Math.min(stave.getYForTopText(this.text_line), glyphYBetweenLines);
    glyphY += this.y_shift;

    // Ajdust x position if ornament is delayed
    if (this.delayed) {
      let delayXShift = 0;
      if (this.delayXShift !== undefined) {
        delayXShift = this.delayXShift;
      } else {
        delayXShift += this.glyph.getMetrics().width / 2;
        const nextContext = TickContext.getNextContext(this.note.getTickContext());
        if (nextContext) {
          delayXShift += (nextContext.getX() - glyphX) * 0.5;
        } else {
          delayXShift += (stave.x + stave.width - glyphX) * 0.5;
        }
        this.delayXShift = delayXShift;
      }
      glyphX += delayXShift;
    }

    L('Rendering ornament: ', this.ornament, glyphX, glyphY);

    if (this.accidentalLower) {
      this.accidentalLower.render(ctx, glyphX, glyphY);
      glyphY -= this.accidentalLower.getMetrics().height;
      glyphY -= this.render_options.accidentalLowerPadding;
    }

    this.glyph.render(ctx, glyphX, glyphY);
    glyphY -= this.glyph.getMetrics().height;

    if (this.accidentalUpper) {
      glyphY -= this.render_options.accidentalUpperPadding;
      this.accidentalUpper.render(ctx, glyphX, glyphY);
    }
  }
}
