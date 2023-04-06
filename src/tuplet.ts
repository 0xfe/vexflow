// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

/**
 * ## Description
 *
 * Create a new tuplet from the specified notes. The notes must
 * be part of the same voice. If they are of different rhythmic
 * values, then options.num_notes must be set.
 *
 * @constructor
 * @param {Array.<Vex.Flow.StaveNote>} A set of notes: staveNotes,
 *   notes, etc... any class that inherits stemmableNote at some
 *   point in its prototype chain.
 * @param options: object {
 *
 *   num_notes: fit this many notes into...
 *   notes_occupied: ...the space of this many notes
 *
 *       Together, these two properties make up the tuplet ratio
 *     in the form of num_notes : notes_occupied.
 *       num_notes defaults to the number of notes passed in, so
 *     it is important that if you omit this property, all of
 *     the notes passed should be of the same note value.
 *       notes_occupied defaults to 2 -- so you should almost
 *     certainly pass this parameter for anything other than
 *     a basic triplet.
 *
 *   location:
 *     default 1, which is above the notes: ┌─── 3 ───┐
 *      -1 is below the notes └─── 3 ───┘
 *
 *   bracketed: boolean, draw a bracket around the tuplet number
 *     when true: ┌─── 3 ───┐   when false: 3
 *     defaults to true if notes are not beamed, false otherwise
 *
 *   ratioed: boolean
 *     when true: ┌─── 7:8 ───┐, when false: ┌─── 7 ───┐
 *     defaults to true if the difference between num_notes and
 *     notes_occupied is greater than 1.
 *
 *   y_offset: int, default 0
 *     manually offset a tuplet, for instance to avoid collisions
 *     with articulations, etc...
 * }
 */

import { Element } from './element';
import { Formatter } from './formatter';
import { Glyph } from './glyph';
import { Note } from './note';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Category } from './typeguard';
import { defined, RuntimeError } from './util';

export interface TupletOptions {
  beats_occupied?: number;
  bracketed?: boolean;
  location?: number;
  notes_occupied?: number;
  num_notes?: number;
  ratioed?: boolean;
  y_offset?: number;
}

export interface TupletMetrics {
  noteHeadOffset: number;
  stemOffset: number;
  bottomLine: number;
  topModifierOffset: number;
}

export const enum TupletLocation {
  BOTTOM = -1,
  TOP = +1,
}

export class Tuplet extends Element {
  static get CATEGORY(): string {
    return Category.Tuplet;
  }

  notes: Note[];

  protected options: TupletOptions;
  protected num_notes: number;
  protected point: number;

  protected bracketed: boolean;
  protected y_pos: number;
  protected x_pos: number;
  protected width: number;

  // location is initialized by the constructor via setTupletLocation(...).
  protected location!: number;

  protected notes_occupied: number;
  protected ratioed: boolean;
  protected numerator_glyphs: Glyph[] = [];
  protected denom_glyphs: Glyph[] = [];

  static get LOCATION_TOP(): number {
    return TupletLocation.TOP;
  }
  static get LOCATION_BOTTOM(): number {
    return TupletLocation.BOTTOM;
  }
  static get NESTING_OFFSET(): number {
    return 15;
  }

  static get metrics(): TupletMetrics {
    const tupletMetrics = Tables.currentMusicFont().getMetrics().tuplet;

    if (!tupletMetrics) throw new RuntimeError('BadMetrics', `tuplet missing`);
    return tupletMetrics;
  }

  constructor(notes: Note[], options: TupletOptions = {}) {
    super();
    if (!notes || !notes.length) {
      throw new RuntimeError('BadArguments', 'No notes provided for tuplet.');
    }

    this.options = options;
    this.notes = notes;
    this.num_notes = this.options.num_notes != undefined ? this.options.num_notes : notes.length;

    // We accept beats_occupied, but warn that it's deprecated:
    // the preferred property name is now notes_occupied.
    if (this.options.beats_occupied) {
      this.beatsOccupiedDeprecationWarning();
    }
    this.notes_occupied = this.options.notes_occupied || this.options.beats_occupied || 2;
    if (this.options.bracketed != undefined) {
      this.bracketed = this.options.bracketed;
    } else {
      this.bracketed = notes.some((note) => !note.hasBeam());
    }

    this.ratioed =
      this.options.ratioed != undefined ? this.options.ratioed : Math.abs(this.notes_occupied - this.num_notes) > 1;
    this.point = (Tables.NOTATION_FONT_SCALE * 3) / 5;
    this.y_pos = 16;
    this.x_pos = 100;
    this.width = 200;

    this.setTupletLocation(this.options.location || Tuplet.LOCATION_TOP);

    Formatter.AlignRestsToNotes(notes, true, true);
    this.resolveGlyphs();
    this.attach();
  }

  attach(): void {
    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      note.setTuplet(this);
    }
  }

  detach(): void {
    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      note.resetTuplet(this);
    }
  }

  /**
   * Set whether or not the bracket is drawn.
   */
  setBracketed(bracketed: boolean): this {
    this.bracketed = !!bracketed;
    return this;
  }

  /**
   * Set whether or not the ratio is shown.
   */
  setRatioed(ratioed: boolean): this {
    this.ratioed = !!ratioed;
    return this;
  }

  /**
   * Set the tuplet indicator to be displayed either on the top or bottom of the stave.
   */
  setTupletLocation(location: number): this {
    if (location !== Tuplet.LOCATION_TOP && location !== Tuplet.LOCATION_BOTTOM) {
      // eslint-disable-next-line
      console.warn(`Invalid tuplet location [${location}]. Using Tuplet.LOCATION_TOP.`);
      location = Tuplet.LOCATION_TOP;
    }

    this.location = location;
    return this;
  }

  getNotes(): Note[] {
    return this.notes;
  }

  getNoteCount(): number {
    return this.num_notes;
  }

  beatsOccupiedDeprecationWarning(): void {
    // eslint-disable-next-line
    console.warn(
      'beats_occupied has been deprecated as an option for tuplets. Please use notes_occupied instead.',
      'Calls to getBeatsOccupied / setBeatsOccupied should now be routed to getNotesOccupied / setNotesOccupied.',
      'The old methods will be removed in VexFlow 5.0.'
    );
  }

  getBeatsOccupied(): number {
    this.beatsOccupiedDeprecationWarning();
    return this.getNotesOccupied();
  }

  setBeatsOccupied(beats: number): void {
    this.beatsOccupiedDeprecationWarning();
    return this.setNotesOccupied(beats);
  }

  getNotesOccupied(): number {
    return this.notes_occupied;
  }

  setNotesOccupied(notes: number): void {
    this.detach();
    this.notes_occupied = notes;
    this.resolveGlyphs();
    this.attach();
  }

  resolveGlyphs(): void {
    this.numerator_glyphs = [];
    let n = this.num_notes;
    while (n >= 1) {
      this.numerator_glyphs.unshift(new Glyph('timeSig' + (n % 10), this.point));
      n = parseInt((n / 10).toString(), 10);
    }

    this.denom_glyphs = [];
    n = this.notes_occupied;
    while (n >= 1) {
      this.denom_glyphs.unshift(new Glyph('timeSig' + (n % 10), this.point));
      n = parseInt((n / 10).toString(), 10);
    }
  }

  // determine how many tuplets are nested within this tuplet
  // on the same side (above/below), to calculate a y
  // offset for this tuplet:
  getNestedTupletCount(): number {
    const location = this.location;
    const first_note = this.notes[0];
    let maxTupletCount = countTuplets(first_note, location);
    let minTupletCount = countTuplets(first_note, location);

    // Count the tuplets that are on the same side (above/below)
    // as this tuplet:
    function countTuplets(note: Note, location: number) {
      return note.getTupletStack().filter((tuplet) => tuplet.location === location).length;
    }

    this.notes.forEach((note) => {
      const tupletCount = countTuplets(note, location);
      maxTupletCount = tupletCount > maxTupletCount ? tupletCount : maxTupletCount;
      minTupletCount = tupletCount < minTupletCount ? tupletCount : minTupletCount;
    });

    return maxTupletCount - minTupletCount;
  }

  // determine the y position of the tuplet:
  getYPosition(): number {
    // offset the tuplet for any nested tuplets between
    // it and the notes:
    const nested_tuplet_y_offset = this.getNestedTupletCount() * Tuplet.NESTING_OFFSET * -this.location;

    // offset the tuplet for any manual y_offset:
    const y_offset = this.options.y_offset || 0;

    // now iterate through the notes and find our highest
    // or lowest locations, to form a base y_pos
    const first_note = this.notes[0];
    let y_pos;
    if (this.location === Tuplet.LOCATION_TOP) {
      y_pos = first_note.checkStave().getYForLine(0) - Tuplet.metrics.topModifierOffset;

      // check modifiers above note to see if they will collide with tuplet beam
      for (let i = 0; i < this.notes.length; ++i) {
        const note = this.notes[i];
        let modLines = 0;
        const mc = note.getModifierContext();
        if (mc) {
          modLines = Math.max(modLines, mc.getState().top_text_line);
        }
        const modY = note.getYForTopText(modLines) - Tuplet.metrics.noteHeadOffset;
        if (note.hasStem() || note.isRest()) {
          const top_y =
            note.getStemDirection() === Stem.UP
              ? note.getStemExtents().topY - Tuplet.metrics.stemOffset
              : note.getStemExtents().baseY - Tuplet.metrics.noteHeadOffset;
          y_pos = Math.min(top_y, y_pos);
          if (modLines > 0) {
            y_pos = Math.min(modY, y_pos);
          }
        }
      }
    } else {
      let lineCheck = Tuplet.metrics.bottomLine; // tuplet default on line 4
      // check modifiers below note to see if they will collide with tuplet beam
      this.notes.forEach((nn) => {
        const mc = nn.getModifierContext();
        if (mc) {
          lineCheck = Math.max(lineCheck, mc.getState().text_line + 1);
        }
      });
      y_pos = first_note.checkStave().getYForLine(lineCheck) + Tuplet.metrics.noteHeadOffset;

      for (let i = 0; i < this.notes.length; ++i) {
        if (this.notes[i].hasStem() || this.notes[i].isRest()) {
          const bottom_y =
            this.notes[i].getStemDirection() === Stem.UP
              ? this.notes[i].getStemExtents().baseY + Tuplet.metrics.noteHeadOffset
              : this.notes[i].getStemExtents().topY + Tuplet.metrics.stemOffset;
          if (bottom_y > y_pos) {
            y_pos = bottom_y;
          }
        }
      }
    }

    return y_pos + nested_tuplet_y_offset + y_offset;
  }

  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    // determine x value of left bound of tuplet
    const first_note = this.notes[0] as StemmableNote;
    const last_note = this.notes[this.notes.length - 1] as StemmableNote;

    if (!this.bracketed) {
      this.x_pos = first_note.getStemX();
      this.width = last_note.getStemX() - this.x_pos;
    } else {
      this.x_pos = first_note.getTieLeftX() - 5;
      this.width = last_note.getTieRightX() - this.x_pos + 5;
    }

    // determine y value for tuplet
    this.y_pos = this.getYPosition();

    const addGlyphWidth = (width: number, glyph: Glyph) => width + defined(glyph.getMetrics().width);

    // calculate total width of tuplet notation
    let width = this.numerator_glyphs.reduce(addGlyphWidth, 0);
    if (this.ratioed) {
      width = this.denom_glyphs.reduce(addGlyphWidth, width);
      width += this.point * 0.32;
    }

    const notation_center_x = this.x_pos + this.width / 2;
    const notation_start_x = notation_center_x - width / 2;

    // draw bracket if the tuplet is not beamed
    if (this.bracketed) {
      const line_width = this.width / 2 - width / 2 - 5;

      // only draw the bracket if it has positive length
      if (line_width > 0) {
        ctx.fillRect(this.x_pos, this.y_pos, line_width, 1);
        ctx.fillRect(this.x_pos + this.width / 2 + width / 2 + 5, this.y_pos, line_width, 1);
        ctx.fillRect(
          this.x_pos,
          this.y_pos + (this.location === Tuplet.LOCATION_BOTTOM ? 1 : 0),
          1,
          this.location * 10
        );
        ctx.fillRect(
          this.x_pos + this.width,
          this.y_pos + (this.location === Tuplet.LOCATION_BOTTOM ? 1 : 0),
          1,
          this.location * 10
        );
      }
    }

    // draw numerator glyphs
    const shiftY = Tables.currentMusicFont().lookupMetric('digits.shiftY', 0);

    let x_offset = 0;
    this.numerator_glyphs.forEach((glyph) => {
      glyph.render(ctx, notation_start_x + x_offset, this.y_pos + this.point / 3 - 2 + shiftY);
      x_offset += defined(glyph.getMetrics().width);
    });

    // display colon and denominator if the ratio is to be shown
    if (this.ratioed) {
      const colon_x = notation_start_x + x_offset + this.point * 0.16;
      const colon_radius = this.point * 0.06;
      ctx.beginPath();
      ctx.arc(colon_x, this.y_pos - this.point * 0.08, colon_radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(colon_x, this.y_pos + this.point * 0.12, colon_radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
      x_offset += this.point * 0.32;
      this.denom_glyphs.forEach((glyph) => {
        glyph.render(ctx, notation_start_x + x_offset, this.y_pos + this.point / 3 - 2 + shiftY);
        x_offset += defined(glyph.getMetrics().width);
      });
    }
  }
}
