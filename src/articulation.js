// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Larry Kuhns.
//
// ## Description
//
// This file implements articulations and accents as modifiers that can be
// attached to notes. The complete list of articulations is available in
// `tables.js` under `Vex.Flow.articulationCodes`.
//
// See `tests/articulation_tests.js` for usage examples.

import { Vex } from './vex';
import { Flow } from './tables';
import { Modifier } from './modifier';
import { Glyph } from './glyph';
import { Stem } from './stem';

// To enable logging for this class. Set `Vex.Flow.Articulation.DEBUG` to `true`.
function L(...args) { if (Articulation.DEBUG) Vex.L('Vex.Flow.Articulation', args); }

const { ABOVE, BELOW } = Modifier.Position;

const roundToNearestHalf = (mathFn, value) => mathFn(value / 0.5) * 0.5;

// This includes both staff and ledger lines
const isWithinLines = (line, position) => position === ABOVE ? line <= 5 : line >= 1;

const getRoundingFunction = (line, position) => {
  if (isWithinLines(line, position)) {
    if (position === ABOVE) {
      return Math.ceil;
    } else {
      return Math.floor;
    }
  } else {
    return Math.round;
  }
};

const snapLineToStaff = (canSitBetweenLines, line, position, offsetDirection) => {
  // Initially, snap to nearest staff line or space
  const snappedLine = roundToNearestHalf(getRoundingFunction(line, position), line);
  const onStaffLine = snappedLine % 1 === 0;

  const shouldSnapToStaffSpace =
    canSitBetweenLines && isWithinLines(snappedLine, position) && onStaffLine;

  // If within staff, snap to staff space
  if (shouldSnapToStaffSpace) {
    return snappedLine + (0.5 * -offsetDirection);
  } else {
    return snappedLine;
  }
};

const getTopY = (note, textLine) => {
  const stave = note.getStave();
  const stemDirection = note.getStemDirection();
  const { topY: stemTipY, baseY: stemBaseY } = note.getStemExtents();

  if (note.getCategory() === 'stavenotes') {
    if (stemDirection === Stem.UP) {
      return stemTipY;
    } else {
      return stemBaseY;
    }
  } else if (note.getCategory() === 'tabnotes') {
    if (note.hasStem()) {
      if (stemDirection === Stem.UP) {
        return stemTipY;
      } else {
        return stave.getYForTopText(textLine);
      }
    } else {
      return stave.getYForTopText(textLine);
    }
  } else {
    throw new Vex.RERR(
      'UnknownCategory', 'Only can get the top and bottom ys of stavenotes and tabnotes'
    );
  }
};

const getBottomY = (note, textLine) => {
  const stave = note.getStave();
  const stemDirection = note.getStemDirection();
  const { topY: stemTipY, baseY: stemBaseY } = note.getStemExtents();

  if (note.getCategory() === 'stavenotes') {
    if (stemDirection === Stem.UP) {
      return stemBaseY;
    } else {
      return stemTipY;
    }
  } else if (note.getCategory() === 'tabnotes') {
    if (note.hasStem()) {
      if (stemDirection === Stem.UP) {
        return stave.getYForBottomText(textLine);
      } else {
        return stemTipY;
      }
    } else {
      return stave.getYForBottomText(textLine);
    }
  } else {
    throw new Vex.RERR(
      'UnknownCategory', 'Only can get the top and bottom ys of stavenotes and tabnotes'
    );
  }
};

export class Articulation extends Modifier {
  static get CATEGORY() { return 'articulations'; }

  static format(articulations, state) {
    if (!articulations || articulations.length === 0) return false;

    let width = 0;
    for (let i = 0; i < articulations.length; ++i) {
      let increment = 1;
      const articulation = articulations[i];
      width = Math.max(articulation.getWidth(), width);

      const type = Flow.articulationCodes(articulation.type);

      if (!type.between_lines) increment += 1.5;

      if (articulation.getPosition() === ABOVE) {
        articulation.setTextLine(state.top_text_line);
        state.top_text_line += increment;
      } else {
        articulation.setTextLine(state.text_line);
        state.text_line += increment;
      }
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }

  // Create a new articulation of type `type`, which is an entry in
  // `Vex.Flow.articulationCodes` in `tables.js`.
  constructor(type) {
    super();

    this.note = null;
    this.index = null;
    this.type = type;
    this.position = BELOW;
    this.render_options = {
      font_scale: 38,
    };

    this.articulation = Flow.articulationCodes(this.type);
    if (!this.articulation) {
      throw new Vex.RERR('ArgumentError', `Articulation not found: ${this.type}`);
    }

    this.glyph = new Glyph(this.articulation.code, this.render_options.font_scale);

    // Default width comes from articulation table.
    this.setWidth(this.glyph.getMetrics().width);
  }

  getCategory() { return Articulation.CATEGORY; }

  // Render articulation in position next to note.
  draw() {
    const {
      note, index, position, glyph,
      articulation: { between_lines: canSitBetweenLines },
      text_line: textLine,
      context: ctx,
    } = this;

    if (!ctx) {
      throw new Vex.RERR('NoContext', "Can't draw Articulation without a context.");
    }

    if (!note || index == null) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw Articulation without a note and index.");
    }

    const stave = note.getStave();
    const staffSpace = stave.getSpacingBetweenLines();
    const isTab = note.getCategory() === 'tabnotes';

    // Articulations are centered over/under the note head.
    const { x } = note.getModifierStartXY(position, index);
    const shouldSitOutsideStaff = !canSitBetweenLines || isTab;

    const y = {
      [ABOVE]: () => {
        glyph.setOrigin(0.5, 1);
        const y = getTopY(note, textLine) - ((textLine + 1) * staffSpace);
        return shouldSitOutsideStaff ? Math.min(stave.getYForTopText(0), y) : y;
      },
      [BELOW]: () => {
        glyph.setOrigin(0.5, 0);
        const y = getBottomY(note, textLine) + ((textLine + 1) * staffSpace);
        return shouldSitOutsideStaff ? Math.max(stave.getYForBottomText(0), y) : y;
      },
    }[position]();

    let yAdjustment = 0;
    if (!isTab) {
      const offsetDirection = position === ABOVE ? -1 : +1;
      const noteLine = isTab ? note.positions[index].str : note.getKeyProps()[index].line;
      const distanceFromNote = (note.getYs()[index] - y) / staffSpace;
      const articLine = distanceFromNote + noteLine;
      const snappedLine = snapLineToStaff(canSitBetweenLines, articLine, position, offsetDirection);

      if (isWithinLines(snappedLine, position)) glyph.setOrigin(0.5, 0.5);

      yAdjustment = Math.abs(snappedLine - articLine) * staffSpace * offsetDirection;
    }

    glyph.render(ctx, x, y + yAdjustment);
  }
}
