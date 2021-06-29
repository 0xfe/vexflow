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

import { RuntimeError, log, check } from './util';
import { Flow } from './flow';
import { Modifier } from './modifier';
import { Glyph } from './glyph';
import { Stem } from './stem';
import { Note } from './note';
import { StaveNote } from './stavenote';
import { ModifierContextState } from './modifiercontext';
import { Builder } from './easyscore';
import { TabNote } from './tabnote';
import { GraceNote } from './gracenote';

export interface ArticulationStruct {
  code?: string;
  aboveCode?: string;
  belowCode?: string;
  between_lines: boolean;
}

// To enable logging for this class. Set `Vex.Flow.Articulation.DEBUG` to `true`.
function L(
  // eslint-disable-next-line
  ...args: any[]) {
  if (Articulation.DEBUG) log('Vex.Flow.Articulation', args);
}

const { ABOVE, BELOW } = Modifier.Position;

function roundToNearestHalf(mathFn: (a: number) => number, value: number): number {
  return mathFn(value / 0.5) * 0.5;
}

// This includes both staff and ledger lines
function isWithinLines(line: number, position: number): boolean {
  return position === ABOVE ? line <= 5 : line >= 1;
}

function getRoundingFunction(line: number, position: number): (a: number) => number {
  if (isWithinLines(line, position)) {
    if (position === ABOVE) {
      return Math.ceil;
    } else {
      return Math.floor;
    }
  } else {
    return Math.round;
  }
}

function snapLineToStaff(canSitBetweenLines: boolean, line: number, position: number, offsetDirection: number): number {
  // Initially, snap to nearest staff line or space
  const snappedLine = roundToNearestHalf(getRoundingFunction(line, position), line);
  const canSnapToStaffSpace = canSitBetweenLines && isWithinLines(snappedLine, position);
  const onStaffLine = snappedLine % 1 === 0;

  if (canSnapToStaffSpace && onStaffLine) {
    const HALF_STAFF_SPACE = 0.5;
    return snappedLine + HALF_STAFF_SPACE * -offsetDirection;
  } else {
    return snappedLine;
  }
}

function isStaveNote(note: Note): boolean {
  const noteCategory = note.getCategory();
  return noteCategory === StaveNote.CATEGORY || noteCategory === GraceNote.CATEGORY;
}

function getTopY(note: Note, textLine: number): number {
  const stemDirection = note.getStemDirection();
  const { topY: stemTipY, baseY: stemBaseY } = note.getStemExtents();

  if (isStaveNote(note)) {
    if (note.hasStem()) {
      if (stemDirection === Stem.UP) {
        return stemTipY;
      } else {
        return stemBaseY;
      }
    } else {
      return Math.min(...note.getYs());
    }
  } else if (note.getCategory() === TabNote.CATEGORY) {
    if (note.hasStem()) {
      if (stemDirection === Stem.UP) {
        return stemTipY;
      } else {
        return note.checkStave().getYForTopText(textLine);
      }
    } else {
      return note.checkStave().getYForTopText(textLine);
    }
  } else {
    throw new RuntimeError('UnknownCategory', 'Only can get the top and bottom ys of stavenotes and tabnotes');
  }
}

function getBottomY(note: Note, textLine: number): number {
  const stemDirection = note.getStemDirection();
  const { topY: stemTipY, baseY: stemBaseY } = note.getStemExtents();

  if (isStaveNote(note)) {
    if (note.hasStem()) {
      if (stemDirection === Stem.UP) {
        return stemBaseY;
      } else {
        return stemTipY;
      }
    } else {
      return Math.max(...note.getYs());
    }
  } else if (note.getCategory() === TabNote.CATEGORY) {
    if (note.hasStem()) {
      if (stemDirection === Stem.UP) {
        return note.checkStave().getYForBottomText(textLine);
      } else {
        return stemTipY;
      }
    } else {
      return note.checkStave().getYForBottomText(textLine);
    }
  } else {
    throw new RuntimeError('UnknownCategory', 'Only can get the top and bottom ys of stavenotes and tabnotes');
  }
}

// Gets the initial offset of the articulation from the y value of the starting position.
// This is required because the top/bottom text positions already have spacing applied to
// provide a "visually pleasent" default position. However the y values provided from
// the stavenote's top/bottom do *not* have any pre-applied spacing. This function
// normalizes this asymmetry.
function getInitialOffset(note: Note, position: number): number {
  const isOnStemTip =
    (position === ABOVE && note.getStemDirection() === Stem.UP) ||
    (position === BELOW && note.getStemDirection() === Stem.DOWN);

  if (isStaveNote(note)) {
    if (note.hasStem() && isOnStemTip) {
      return 0.5;
    } else {
      // this amount is larger than the stem-tip offset because we start from
      // the center of the notehead
      return 1;
    }
  } else {
    if (note.hasStem() && isOnStemTip) {
      return 1;
    } else {
      return 0;
    }
  }
}

export class Articulation extends Modifier {
  note?: Note;
  readonly type: string;
  static readonly INITIAL_OFFSET: number = -0.5;

  protected render_options: { font_scale: number };
  protected articulation?: ArticulationStruct;
  // glyph defined calling reset in constructor
  // eslint-disable-next-line
  protected glyph!: Glyph;
  static DEBUG: boolean;

  static get CATEGORY(): string {
    return 'articulations';
  }

  // FIXME:
  // Most of the complex formatting logic (ie: snapping to space) is
  // actually done in .render(). But that logic belongs in this method.
  //
  // Unfortunately, this isn't possible because, by this point, stem lengths
  // have not yet been finalized. Finalized stem lengths are required to determine the
  // initial position of any stem-side articulation.
  //
  // This indicates that all objects should have their stave set before being
  // formatted. It can't be an optional if you want accurate vertical positioning.
  // Consistently positioned articulations that play nice with other modifiers
  // won't be possible until we stop relying on render-time formatting.
  //
  // Ideally, when this function has completed, the vertical articulation positions
  // should be ready to render without further adjustment. But the current state
  // is far from this ideal.
  static format(articulations: Articulation[], state: ModifierContextState): boolean {
    if (!articulations || articulations.length === 0) return false;

    const isAbove = (artic: Articulation) => artic.getPosition() === ABOVE;
    const isBelow = (artic: Articulation) => artic.getPosition() === BELOW;
    const margin = 0.5;
    const getIncrement = (articulation: Articulation, line: number, position: number) =>
      roundToNearestHalf(
        getRoundingFunction(line, position),
        check<number>(articulation.glyph.getMetrics().height) / 10 + margin
      );

    articulations.filter(isAbove).forEach((articulation) => {
      articulation.setTextLine(state.top_text_line);
      state.top_text_line += getIncrement(articulation, state.top_text_line, ABOVE);
    });

    articulations.filter(isBelow).forEach((articulation) => {
      articulation.setTextLine(state.text_line);
      state.text_line += getIncrement(articulation, state.text_line, BELOW);
    });

    const width = articulations
      .map((articulation) => articulation.getWidth())
      .reduce((maxWidth, articWidth) => Math.max(articWidth, maxWidth));

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }

  static easyScoreHook({ articulations }: { articulations: string }, note: StaveNote, builder: Builder): void {
    if (!articulations) return;

    const articNameToCode: Record<string, string> = {
      staccato: 'a.',
      tenuto: 'a-',
      accent: 'a>',
    };

    articulations
      .split(',')
      .map((articString) => articString.trim().split('.'))
      .map(([name, position]) => {
        const artic: { type: string; position?: number } = { type: articNameToCode[name] };
        if (position) artic.position = Modifier.PositionString[position];
        return builder.getFactory().Articulation(artic);
      })
      .map((artic) => note.addModifier(artic, 0));
  }

  // Create a new articulation of type `type`, which is an entry in
  // `Vex.Flow.articulationCodes` in `tables.js`.
  constructor(type: string) {
    super();
    this.setAttribute('type', 'Articulation');

    this.type = type;
    this.position = BELOW;
    this.render_options = {
      font_scale: 38,
    };

    this.reset();
  }

  reset(): void {
    this.articulation = Flow.articulationCodes(this.type);
    if (!this.articulation) {
      throw new RuntimeError('ArgumentError', `Articulation not found: ${this.type}`);
    }

    const code =
      (this.position === ABOVE ? this.articulation.aboveCode : this.articulation.belowCode) || this.articulation.code;
    this.glyph = new Glyph(code ?? '', this.render_options.font_scale);

    this.setWidth(check<number>(this.glyph.getMetrics().width));
  }

  getCategory(): string {
    return Articulation.CATEGORY;
  }

  // Render articulation in position next to note.
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const index = this.checkIndex();
    const { position, glyph, text_line: textLine } = this;
    const canSitBetweenLines = this.articulation?.between_lines ?? false;

    const stave = note.checkStave();
    const staffSpace = stave.getSpacingBetweenLines();
    const isTab = note.getCategory() === TabNote.CATEGORY;

    // Articulations are centered over/under the note head.
    const { x } = note.getModifierStartXY(position, index);
    const shouldSitOutsideStaff = !canSitBetweenLines || isTab;

    const initialOffset = getInitialOffset(note, position);

    const padding = this.musicFont.lookupMetric(`articulation.${glyph.getCode()}.padding`, 0);

    let y = (
      {
        [ABOVE]: () => {
          glyph.setOrigin(0.5, 1);
          const y = getTopY(note, textLine) - (textLine + initialOffset) * staffSpace;
          return shouldSitOutsideStaff ? Math.min(stave.getYForTopText(Articulation.INITIAL_OFFSET), y) : y;
        },
        [BELOW]: () => {
          glyph.setOrigin(0.5, 0);
          const y = getBottomY(note, textLine) + (textLine + initialOffset) * staffSpace;
          return shouldSitOutsideStaff ? Math.max(stave.getYForBottomText(Articulation.INITIAL_OFFSET), y) : y;
        },
      } as Record<number, () => number>
    )[position]();

    if (!isTab) {
      const offsetDirection = position === ABOVE ? -1 : +1;
      const noteLine = isTab
        ? (note as TabNote).getPositions()[index].str
        : (note as StaveNote).getKeyProps()[index].line;
      const distanceFromNote = (note.getYs()[index] - y) / staffSpace;
      const articLine = distanceFromNote + Number(noteLine);
      const snappedLine = snapLineToStaff(canSitBetweenLines, articLine, position, offsetDirection);

      if (isWithinLines(snappedLine, position)) glyph.setOrigin(0.5, 0.5);

      y += Math.abs(snappedLine - articLine) * staffSpace * offsetDirection + padding * offsetDirection;
    }

    L(`Rendering articulation at (x: ${x}, y: ${y})`);

    glyph.render(ctx, x, y);
  }
}
