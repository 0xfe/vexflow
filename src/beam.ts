// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Element } from './element';
import { Fraction } from './fraction';
import { Note } from './note';
import { RenderContext } from './rendercontext';
import { Stem } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Tuplet, TupletLocation } from './tuplet';
import { Category, isStaveNote, isTabNote } from './typeguard';
import { RuntimeError } from './util';
import { Voice } from './voice';

function calculateStemDirection(notes: StemmableNote[]) {
  let lineSum = 0;
  notes.forEach((note) => {
    if (note.keyProps) {
      note.keyProps.forEach((keyProp) => {
        lineSum += keyProp.line - 3;
      });
    }
  });

  if (lineSum >= 0) {
    return Stem.DOWN;
  }
  return Stem.UP;
}

function getStemSlope(firstNote: StemmableNote, lastNote: StemmableNote) {
  const firstStemTipY = firstNote.getStemExtents().topY;
  const firstStemX = firstNote.getStemX();
  const lastStemTipY = lastNote.getStemExtents().topY;
  const lastStemX = lastNote.getStemX();
  return (lastStemTipY - firstStemTipY) / (lastStemX - firstStemX);
}

export const BEAM_LEFT = 'L';
export const BEAM_RIGHT = 'R';
export const BEAM_BOTH = 'B';

export type PartialBeamDirection = typeof BEAM_LEFT | typeof BEAM_RIGHT | typeof BEAM_BOTH;

/** `Beams` span over a set of `StemmableNotes`. */
export class Beam extends Element {
  static get CATEGORY(): string {
    return Category.Beam;
  }

  public render_options: {
    flat_beam_offset?: number;
    flat_beams: boolean;
    secondary_break_ticks?: number;
    show_stemlets: boolean;
    beam_width: number;
    max_slope: number;
    min_slope: number;
    slope_iterations: number;
    slope_cost: number;
    stemlet_extension: number;
    partial_beam_length: number;
    min_flat_beam_offset: number;
  };

  notes: StemmableNote[];
  postFormatted: boolean;
  slope: number = 0;

  private readonly stem_direction: number;
  private readonly ticks: number;

  private y_shift: number = 0;
  private break_on_indices: number[];
  private beam_count: number;
  private unbeamable?: boolean;

  /**
   * Overrides to default beam directions for secondary-level beams that do not
   * connect to any other note. See further explanation at
   * `setPartialBeamSideAt`
   */
  private forcedPartialDirections: {
    [noteIndex: number]: PartialBeamDirection;
  } = {};

  /** Get the direction of the beam */
  getStemDirection(): number {
    return this.stem_direction;
  }

  /**
   * Get the default beam groups for a provided time signature.
   * Attempt to guess if the time signature is not found in table.
   * Currently this is fairly naive.
   */
  static getDefaultBeamGroups(time_sig: string): Fraction[] {
    if (!time_sig || time_sig === 'c') {
      time_sig = '4/4';
    }

    const defaults: { [key: string]: [string] } = {
      '1/2': ['1/2'],
      '2/2': ['1/2'],
      '3/2': ['1/2'],
      '4/2': ['1/2'],

      '1/4': ['1/4'],
      '2/4': ['1/4'],
      '3/4': ['1/4'],
      '4/4': ['1/4'],

      '1/8': ['1/8'],
      '2/8': ['2/8'],
      '3/8': ['3/8'],
      '4/8': ['2/8'],

      '1/16': ['1/16'],
      '2/16': ['2/16'],
      '3/16': ['3/16'],
      '4/16': ['2/16'],
    };

    const groups: string[] = defaults[time_sig];

    if (groups === undefined) {
      // If no beam groups found, naively determine
      // the beam groupings from the time signature
      const beatTotal = parseInt(time_sig.split('/')[0], 10);
      const beatValue = parseInt(time_sig.split('/')[1], 10);

      const tripleMeter = beatTotal % 3 === 0;

      if (tripleMeter) {
        return [new Fraction(3, beatValue)];
      } else if (beatValue > 4) {
        return [new Fraction(2, beatValue)];
      } else if (beatValue <= 4) {
        return [new Fraction(1, beatValue)];
      }
    } else {
      return groups.map((group) => new Fraction().parse(group));
    }

    return [new Fraction(1, 4)];
  }

  /**
   * A helper function to automatically build basic beams for a voice. For more
   * complex auto-beaming use `Beam.generateBeams()`.
   * @param voice the voice to generate the beams for
   * @param stem_direction a stem direction to apply to the entire voice
   * @param groups an array of `Fraction` representing beat groupings for the beam
   */
  static applyAndGetBeams(voice: Voice, stem_direction?: number, groups?: Fraction[]): Beam[] {
    return Beam.generateBeams(voice.getTickables() as StemmableNote[], { groups, stem_direction });
  }

  /**
   * A helper function to autimatically build beams for a voice with
   * configuration options.
   *
   * Example configuration object:
   *
   * ```
   * config = {
   *   groups: [new Vex.Flow.Fraction(2, 8)],
   *   stem_direction: -1,
   *   beam_rests: true,
   *   beam_middle_only: true,
   *   show_stemlets: false
   * };
   * ```
   * @param notes an array of notes to create the beams for
   * @param config the configuration object
   * @param config.stem_direction set to apply the same direction to all notes
   * @param config.beam_rests set to `true` to include rests in the beams
   * @param config.beam_middle_only set to `true` to only beam rests in the middle of the beat
   * @param config.show_stemlets set to `true` to draw stemlets for rests
   * @param config.maintain_stem_directions set to `true` to not apply new stem directions
   * @param config.groups array of `Fractions` that represent the beat structure to beam the notes
   *
   */
  static generateBeams(
    notes: StemmableNote[],
    config: {
      flat_beam_offset?: number;
      flat_beams?: boolean;
      secondary_breaks?: string;
      show_stemlets?: boolean;
      maintain_stem_directions?: boolean;
      beam_middle_only?: boolean;
      beam_rests?: boolean;
      groups?: Fraction[];
      stem_direction?: number;
    } = {}
  ): Beam[] {
    if (!config.groups || !config.groups.length) {
      config.groups = [new Fraction(2, 8)];
    }

    // Convert beam groups to tick amounts
    const tickGroups = config.groups.map((group) => {
      if (!group.multiply) {
        throw new RuntimeError('InvalidBeamGroups', 'The beam groups must be an array of Vex.Flow.Fractions');
      }
      return group.clone().multiply(Tables.RESOLUTION, 1);
    });

    const unprocessedNotes: StemmableNote[] = notes;
    let currentTickGroup = 0;
    let noteGroups: StemmableNote[][] = [];
    let currentGroup: StemmableNote[] = [];

    function getTotalTicks(vf_notes: Note[]) {
      return vf_notes.reduce((memo, note) => note.getTicks().clone().add(memo), new Fraction(0, 1));
    }

    function nextTickGroup() {
      if (tickGroups.length - 1 > currentTickGroup) {
        currentTickGroup += 1;
      } else {
        currentTickGroup = 0;
      }
    }

    function createGroups() {
      let nextGroup: StemmableNote[] = [];
      // number of ticks in current group
      let currentGroupTotalTicks = new Fraction(0, 1);
      unprocessedNotes.forEach((unprocessedNote) => {
        nextGroup = [];
        if (unprocessedNote.shouldIgnoreTicks()) {
          noteGroups.push(currentGroup);
          currentGroup = nextGroup;
          return; // Ignore untickables (like bar notes)
        }
        currentGroup.push(unprocessedNote);
        const ticksPerGroup = tickGroups[currentTickGroup].clone();
        const totalTicks = getTotalTicks(currentGroup).add(currentGroupTotalTicks);

        // Double the amount of ticks in a group, if it's an unbeamable tuplet
        const unbeamable = Tables.durationToNumber(unprocessedNote.getDuration()) < 8;
        if (unbeamable && unprocessedNote.getTuplet()) {
          ticksPerGroup.numerator *= 2;
        }

        // If the note that was just added overflows the group tick total
        if (totalTicks.greaterThan(ticksPerGroup)) {
          // If the overflow note can be beamed, start the next group
          // with it. Unbeamable notes leave the group overflowed.
          if (!unbeamable) {
            const note = currentGroup.pop();
            if (note) nextGroup.push(note);
          }
          noteGroups.push(currentGroup);

          // We have overflown, so we're going to next tick group. As we might have
          // overflown by more than 1 group, we need to go forward as many times as
          // needed, decreasing currentGroupTotalTicks by as many ticks as there are
          // in current groups as we go forward.
          do {
            currentGroupTotalTicks = totalTicks.subtract(tickGroups[currentTickGroup]);
            nextTickGroup();
          } while (currentGroupTotalTicks.greaterThanEquals(tickGroups[currentTickGroup]));
          currentGroup = nextGroup;
        } else if (totalTicks.equals(ticksPerGroup)) {
          noteGroups.push(currentGroup);
          currentGroupTotalTicks = new Fraction(0, 1);
          currentGroup = nextGroup;
          nextTickGroup();
        }
      });

      // Adds any remainder notes beam
      if (currentGroup.length > 0) {
        noteGroups.push(currentGroup);
      }
    }
    function getBeamGroups() {
      return noteGroups.filter((group) => {
        if (group.length > 1) {
          let beamable = true;
          group.forEach((note) => {
            if (note.getIntrinsicTicks() >= Tables.durationToTicks('4')) {
              beamable = false;
            }
          });
          return beamable;
        }
        return false;
      });
    }

    // Splits up groups by Rest
    function sanitizeGroups() {
      const sanitizedGroups: StemmableNote[][] = [];
      noteGroups.forEach((group) => {
        let tempGroup: StemmableNote[] = [];
        group.forEach((note, index, group) => {
          const isFirstOrLast = index === 0 || index === group.length - 1;
          const prevNote = group[index - 1];

          const breaksOnEachRest = !config.beam_rests && note.isRest();
          const breaksOnFirstOrLastRest =
            config.beam_rests && config.beam_middle_only && note.isRest() && isFirstOrLast;

          let breakOnStemChange = false;
          if (config.maintain_stem_directions && prevNote && !note.isRest() && !prevNote.isRest()) {
            const prevDirection = prevNote.getStemDirection();
            const currentDirection = note.getStemDirection();
            breakOnStemChange = currentDirection !== prevDirection;
          }

          const isUnbeamableDuration = parseInt(note.getDuration(), 10) < 8;

          // Determine if the group should be broken at this note
          const shouldBreak = breaksOnEachRest || breaksOnFirstOrLastRest || breakOnStemChange || isUnbeamableDuration;

          if (shouldBreak) {
            // Add current group
            if (tempGroup.length > 0) {
              sanitizedGroups.push(tempGroup);
            }

            // Start a new group. Include the current note if the group
            // was broken up by stem direction, as that note needs to start
            // the next group of notes
            tempGroup = breakOnStemChange ? [note] : [];
          } else {
            // Add note to group
            tempGroup.push(note);
          }
        });

        // If there is a remaining group, add it as well
        if (tempGroup.length > 0) {
          sanitizedGroups.push(tempGroup);
        }
      });

      noteGroups = sanitizedGroups;
    }

    function formatStems() {
      noteGroups.forEach((group) => {
        let stemDirection;
        if (config.maintain_stem_directions) {
          const note = findFirstNote(group);
          stemDirection = note ? note.getStemDirection() : Stem.UP;
        } else {
          if (config.stem_direction) {
            stemDirection = config.stem_direction;
          } else {
            stemDirection = calculateStemDirection(group);
          }
        }
        applyStemDirection(group, stemDirection);
      });
    }

    function findFirstNote(group: StemmableNote[]) {
      for (let i = 0; i < group.length; i++) {
        const note = group[i];
        if (!note.isRest()) {
          return note;
        }
      }

      return false;
    }

    function applyStemDirection(group: StemmableNote[], direction: number) {
      group.forEach((note) => {
        note.setStemDirection(direction);
      });
    }

    // Get all of the tuplets in all of the note groups
    function getTuplets() {
      const uniqueTuplets: Tuplet[] = [];

      // Go through all of the note groups and inspect for tuplets
      noteGroups.forEach((group) => {
        let tuplet: Tuplet;
        group.forEach((note) => {
          const noteTuplet = note.getTuplet();
          if (noteTuplet && tuplet !== noteTuplet) {
            tuplet = noteTuplet;
            uniqueTuplets.push(tuplet);
          }
        });
      });
      return uniqueTuplets;
    }

    // Using closures to store the variables throughout the various functions
    // IMO Keeps it this process lot cleaner - but not super consistent with
    // the rest of the API's style - Silverwolf90 (Cyril)
    createGroups();
    sanitizeGroups();
    formatStems();

    // Get the notes to be beamed
    const beamedNoteGroups = getBeamGroups();

    // Get the tuplets in order to format them accurately
    const allTuplets = getTuplets();

    // Create a Vex.Flow.Beam from each group of notes to be beamed
    const beams: Beam[] = [];
    beamedNoteGroups.forEach((group) => {
      const beam = new Beam(group);

      if (config.show_stemlets) {
        beam.render_options.show_stemlets = true;
      }
      if (config.secondary_breaks) {
        beam.render_options.secondary_break_ticks = Tables.durationToTicks(config.secondary_breaks);
      }
      if (config.flat_beams === true) {
        beam.render_options.flat_beams = true;
        beam.render_options.flat_beam_offset = config.flat_beam_offset;
      }
      beams.push(beam);
    });

    // Reformat tuplets
    allTuplets.forEach((tuplet) => {
      // Set the tuplet location based on the stem direction
      const direction =
        (tuplet.notes[0] as StemmableNote).stem_direction === Stem.DOWN ? TupletLocation.BOTTOM : TupletLocation.TOP;
      tuplet.setTupletLocation(direction);

      // If any of the notes in the tuplet are not beamed, draw a bracket.
      let bracketed = false;
      for (let i = 0; i < tuplet.notes.length; i++) {
        const note = tuplet.notes[i];
        if (!note.hasBeam()) {
          bracketed = true;
          break;
        }
      }
      tuplet.setBracketed(bracketed);
    });

    return beams;
  }

  constructor(notes: StemmableNote[], auto_stem: boolean = false) {
    super();

    if (!notes || notes.length === 0) {
      throw new RuntimeError('BadArguments', 'No notes provided for beam.');
    }

    if (notes.length === 1) {
      throw new RuntimeError('BadArguments', 'Too few notes for beam.');
    }

    // Validate beam line, direction and ticks.
    this.ticks = notes[0].getIntrinsicTicks();

    if (this.ticks >= Tables.durationToTicks('4')) {
      throw new RuntimeError('BadArguments', 'Beams can only be applied to notes shorter than a quarter note.');
    }

    let i; // shared iterator
    let note;

    this.stem_direction = notes[0].getStemDirection();

    let stem_direction = this.stem_direction;
    // Figure out optimal stem direction based on given notes

    if (auto_stem && isStaveNote(notes[0])) {
      stem_direction = calculateStemDirection(notes);
    } else if (auto_stem && isTabNote(notes[0])) {
      // Auto Stem TabNotes
      const stem_weight = notes.reduce((memo, note) => memo + note.getStemDirection(), 0);
      stem_direction = stem_weight > -1 ? Stem.UP : Stem.DOWN;
    }

    // Apply stem directions and attach beam to notes
    for (i = 0; i < notes.length; ++i) {
      note = notes[i];
      if (auto_stem) {
        note.setStemDirection(stem_direction);
        this.stem_direction = stem_direction;
      }
      note.setBeam(this);
    }

    this.postFormatted = false;
    this.notes = notes;
    this.beam_count = this.getBeamCount();
    this.break_on_indices = [];
    this.render_options = {
      beam_width: 5,
      max_slope: 0.25,
      min_slope: -0.25,
      slope_iterations: 20,
      slope_cost: 100,
      show_stemlets: false,
      stemlet_extension: 7,
      partial_beam_length: 10,
      flat_beams: false,
      min_flat_beam_offset: 15,
    };
  }

  /** Get the notes in this beam. */
  getNotes(): StemmableNote[] {
    return this.notes;
  }

  /** Get the max number of beams in the set of notes. */
  getBeamCount(): number {
    const beamCounts = this.notes.map((note) => note.getGlyphProps().beam_count);

    const maxBeamCount = beamCounts.reduce((max, beamCount) => (beamCount > max ? beamCount : max));

    return maxBeamCount;
  }

  /** Set which note `indices` to break the secondary beam at. */
  breakSecondaryAt(indices: number[]): this {
    this.break_on_indices = indices;
    return this;
  }

  /**
   * Forces the direction of a partial beam (a secondary-level beam that exists
   * on one note only of the beam group). This is useful in rhythms such as 6/8
   * eighth-sixteenth-eighth-sixteenth, where the direction of the beam on the
   * first sixteenth note can help imply whether the rhythm is to be felt as
   * three groups of eighth notes (typical) or as two groups of three-sixteenths
   * (less common):
   * ```
   *  ┌───┬──┬──┐      ┌──┬──┬──┐
   *  │   ├─ │ ─┤  vs  │ ─┤  │ ─┤
   *  │   │  │  │      │  │  │  │
   * ```
   */
  setPartialBeamSideAt(noteIndex: number, side: PartialBeamDirection) {
    this.forcedPartialDirections[noteIndex] = side;
    return this;
  }

  /**
   * Restore the default direction of a partial beam (a secondary-level beam
   * that does not connect to any other notes).
   */
  unsetPartialBeamSideAt(noteIndex: number) {
    delete this.forcedPartialDirections[noteIndex];
    return this;
  }

  /** Return the y coordinate for linear function. */
  getSlopeY(x: number, first_x_px: number, first_y_px: number, slope: number): number {
    return first_y_px + (x - first_x_px) * slope;
  }

  /** Calculate the best possible slope for the provided notes. */
  calculateSlope(): void {
    const {
      notes,
      stem_direction: stemDirection,
      render_options: { max_slope, min_slope, slope_iterations, slope_cost },
    } = this;

    const firstNote = notes[0];
    const initialSlope = getStemSlope(firstNote, notes[notes.length - 1]);
    const increment = (max_slope - min_slope) / slope_iterations;
    let minCost = Number.MAX_VALUE;
    let bestSlope = 0;
    let yShift = 0;

    // iterate through slope values to find best weighted fit
    for (let slope = min_slope; slope <= max_slope; slope += increment) {
      let totalStemExtension = 0;
      let yShiftTemp = 0;

      // iterate through notes, calculating y shift and stem extension
      for (let i = 1; i < notes.length; ++i) {
        const note = notes[i];
        if (note.hasStem() || note.isRest()) {
          const adjustedStemTipY =
            this.getSlopeY(note.getStemX(), firstNote.getStemX(), firstNote.getStemExtents().topY, slope) + yShiftTemp;

          const stemTipY = note.getStemExtents().topY;
          // beam needs to be shifted up to accommodate note
          if (stemTipY * stemDirection < adjustedStemTipY * stemDirection) {
            const diff = Math.abs(stemTipY - adjustedStemTipY);
            yShiftTemp += diff * -stemDirection;
            totalStemExtension += diff * i;
          } else {
            // beam overshoots note, account for the difference
            totalStemExtension += (stemTipY - adjustedStemTipY) * stemDirection;
          }
        }
      }

      // most engraving books suggest aiming for a slope about half the angle of the
      // difference between the first and last notes' stem length;
      const idealSlope = initialSlope / 2;
      const distanceFromIdeal = Math.abs(idealSlope - slope);

      // This tries to align most beams to something closer to the idealSlope, but
      // doesn't go crazy. To disable, set this.render_options.slope_cost = 0
      const cost = slope_cost * distanceFromIdeal + Math.abs(totalStemExtension);

      // update state when a more ideal slope is found
      if (cost < minCost) {
        minCost = cost;
        bestSlope = slope;
        yShift = yShiftTemp;
      }
    }

    this.slope = bestSlope;
    this.y_shift = yShift;
  }

  /** Calculate a slope and y-shift for flat beams. */
  calculateFlatSlope(): void {
    const {
      notes,
      stem_direction,
      render_options: { beam_width, min_flat_beam_offset, flat_beam_offset },
    } = this;

    // If a flat beam offset has not yet been supplied or calculated,
    // generate one based on the notes in this particular note group
    let total = 0;
    let extremeY = 0; // Store the highest or lowest note here
    let extremeBeamCount = 0; // The beam count of the extreme note
    let currentExtreme = 0;
    for (let i = 0; i < notes.length; i++) {
      // Total up all of the offsets so we can average them out later
      const note = notes[i];
      const stemTipY = note.getStemExtents().topY;
      total += stemTipY;

      // Store the highest (stems-up) or lowest (stems-down) note so the
      //  offset can be adjusted in case the average isn't enough
      if (stem_direction === Stem.DOWN && currentExtreme < stemTipY) {
        currentExtreme = stemTipY;
        extremeY = Math.max(...note.getYs());
        extremeBeamCount = note.getBeamCount();
      } else if (stem_direction === Stem.UP && (currentExtreme === 0 || currentExtreme > stemTipY)) {
        currentExtreme = stemTipY;
        extremeY = Math.min(...note.getYs());
        extremeBeamCount = note.getBeamCount();
      }
    }

    // Average the offsets to try and come up with a reasonable one that
    //  works for all of the notes in the beam group.
    let offset = total / notes.length;

    // In case the average isn't long enough, add or subtract some more
    //  based on the highest or lowest note (again, based on the stem
    //  direction). This also takes into account the added height due to
    //  the width of the beams.
    const beamWidth = beam_width * 1.5;
    const extremeTest = min_flat_beam_offset + extremeBeamCount * beamWidth;
    const newOffset = extremeY + extremeTest * -stem_direction;
    if (stem_direction === Stem.DOWN && offset < newOffset) {
      offset = extremeY + extremeTest;
    } else if (stem_direction === Stem.UP && offset > newOffset) {
      offset = extremeY - extremeTest;
    }

    if (!flat_beam_offset) {
      // Set the offset for the group based on the calculations above.
      this.render_options.flat_beam_offset = offset;
    } else if (stem_direction === Stem.DOWN && offset > flat_beam_offset) {
      this.render_options.flat_beam_offset = offset;
    } else if (stem_direction === Stem.UP && offset < flat_beam_offset) {
      this.render_options.flat_beam_offset = offset;
    }

    // for flat beams, the slope and y_shift are simply 0
    this.slope = 0;
    this.y_shift = 0;
  }

  /** Return the Beam y offset. */
  getBeamYToDraw(): number {
    const firstNote = this.notes[0];
    const firstStemTipY = firstNote.getStemExtents().topY;
    let beamY = firstStemTipY;

    // For flat beams, set the first and last Y to the offset, rather than
    //  using the note's stem extents.
    if (this.render_options.flat_beams && this.render_options.flat_beam_offset) {
      beamY = this.render_options.flat_beam_offset;
    }
    return beamY;
  }

  /**
   * Create new stems for the notes in the beam, so that each stem
   * extends into the beams.
   */
  applyStemExtensions(): void {
    const {
      notes,
      slope,
      y_shift,
      beam_count,
      render_options: { show_stemlets, stemlet_extension, beam_width },
    } = this;

    const firstNote = notes[0];
    const firstStemTipY = this.getBeamYToDraw();
    const firstStemX = firstNote.getStemX();

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const stem = note.getStem();
      if (stem) {
        const stemX = note.getStemX();
        const { topY: stemTipY } = note.getStemExtents();
        const beamedStemTipY = this.getSlopeY(stemX, firstStemX, firstStemTipY, slope) + y_shift;
        const preBeamExtension = stem.getExtension();
        const beamExtension =
          note.getStemDirection() === Stem.UP ? stemTipY - beamedStemTipY : beamedStemTipY - stemTipY;
        // Determine necessary extension for cross-stave notes in the beam group
        let crossStemExtension = 0;
        if (note.getStemDirection() !== this.stem_direction) {
          const beamCount = note.getGlyphProps().beam_count;
          crossStemExtension = (1 + (beamCount - 1) * 1.5) * this.render_options.beam_width;

          /* This will be required if the partial beams are moved to the note side.
          if (i > 0 && note.getGlyph().beam_count > 1) {
            const prevBeamCount = this.notes[i - 1].getGlyph().beam_count;
            const beamDiff = Math.abs(prevBeamCount - beamCount);
            if (beamDiff > 0) crossStemExtension -= beamDiff * (this.render_options.beam_width * 1.5);
          }
          */
        }

        stem.setExtension(preBeamExtension + beamExtension + crossStemExtension);
        stem.adjustHeightForBeam();

        if (note.isRest() && show_stemlets) {
          const beamWidth = beam_width;
          const totalBeamWidth = (beam_count - 1) * beamWidth * 1.5 + beamWidth;
          stem.setVisibility(true).setStemlet(true, totalBeamWidth + stemlet_extension);
        }
      }
    }
  }

  /** Return upper level beam direction. */
  lookupBeamDirection(
    duration: string,
    prev_tick: number,
    tick: number,
    next_tick: number,
    noteIndex: number
  ): PartialBeamDirection {
    if (duration === '4') {
      return BEAM_LEFT;
    }

    const forcedBeamDirection = this.forcedPartialDirections[noteIndex];
    if (forcedBeamDirection) return forcedBeamDirection;

    const lookup_duration = `${Tables.durationToNumber(duration) / 2}`;
    const prev_note_gets_beam = prev_tick < Tables.durationToTicks(lookup_duration);
    const next_note_gets_beam = next_tick < Tables.durationToTicks(lookup_duration);
    const note_gets_beam = tick < Tables.durationToTicks(lookup_duration);

    if (prev_note_gets_beam && next_note_gets_beam && note_gets_beam) {
      return BEAM_BOTH;
    } else if (prev_note_gets_beam && !next_note_gets_beam && note_gets_beam) {
      return BEAM_LEFT;
    } else if (!prev_note_gets_beam && next_note_gets_beam && note_gets_beam) {
      return BEAM_RIGHT;
    }

    return this.lookupBeamDirection(lookup_duration, prev_tick, tick, next_tick, noteIndex);
  }

  /** Get the x coordinates for the beam lines of specific `duration`. */
  getBeamLines(duration: string): { start: number; end?: number }[] {
    const tick_of_duration = Tables.durationToTicks(duration);
    let beam_started = false;

    type BeamInfo = { start: number; end?: number };
    const beam_lines: BeamInfo[] = [];
    let current_beam: BeamInfo | undefined = undefined;
    const partial_beam_length = this.render_options.partial_beam_length;
    let previous_should_break = false;
    let tick_tally = 0;
    for (let i = 0; i < this.notes.length; ++i) {
      const note = this.notes[i];

      // See if we need to break secondary beams on this note.
      const ticks = note.getTicks().value();
      tick_tally += ticks;
      let should_break = false;

      // 8th note beams are always drawn.
      if (parseInt(duration, 10) >= 8) {
        // First, check to see if any indices were set up through breakSecondaryAt()
        should_break = this.break_on_indices.indexOf(i) !== -1;

        // If the secondary breaks were auto-configured in the render options,
        //  handle that as well.
        if (this.render_options.secondary_break_ticks && tick_tally >= this.render_options.secondary_break_ticks) {
          tick_tally = 0;
          should_break = true;
        }
      }
      const note_gets_beam = note.getIntrinsicTicks() < tick_of_duration;

      const stem_x = note.getStemX() - Stem.WIDTH / 2;

      // Check to see if the next note in the group will get a beam at this
      //  level. This will help to inform the partial beam logic below.
      const prev_note = this.notes[i - 1];
      const next_note = this.notes[i + 1];
      const next_note_gets_beam = next_note && next_note.getIntrinsicTicks() < tick_of_duration;
      const prev_note_gets_beam = prev_note && prev_note.getIntrinsicTicks() < tick_of_duration;
      const beam_alone = prev_note && next_note && note_gets_beam && !prev_note_gets_beam && !next_note_gets_beam;
      // const beam_alone = note_gets_beam && !prev_note_gets_beam && !next_note_gets_beam;
      if (note_gets_beam) {
        // This note gets a beam at the current level
        if (beam_started) {
          // We're currently in the middle of a beam. Just continue it on to
          //  the stem X of the current note.
          current_beam = beam_lines[beam_lines.length - 1];
          current_beam.end = stem_x;

          // If a secondary beam break is set up, end the beam right now.
          if (should_break) {
            beam_started = false;
            if (next_note && !next_note_gets_beam && current_beam.end === undefined) {
              // This note gets a beam,.but the next one does not. This means
              //  we need a partial pointing right.
              current_beam.end = current_beam.start - partial_beam_length;
            }
          }
        } else {
          // No beam started yet. Start a new one.
          current_beam = { start: stem_x, end: undefined };
          beam_started = true;

          if (beam_alone) {
            // previous and next beam exists and does not get a beam but current gets it.
            const prev_tick = prev_note.getIntrinsicTicks();
            const next_tick = next_note.getIntrinsicTicks();
            const tick = note.getIntrinsicTicks();
            const beam_direction = this.lookupBeamDirection(duration, prev_tick, tick, next_tick, i);

            if ([BEAM_LEFT, BEAM_BOTH].includes(beam_direction)) {
              current_beam.end = current_beam.start - partial_beam_length;
            } else {
              current_beam.end = current_beam.start + partial_beam_length;
            }
          } else if (!next_note_gets_beam) {
            // The next note doesn't get a beam. Draw a partial.
            if ((previous_should_break || i === 0) && next_note) {
              // This is the first note (but not the last one), or it is
              //  following a secondary break. Draw a partial to the right.
              current_beam.end = current_beam.start + partial_beam_length;
            } else {
              // By default, draw a partial to the left.
              current_beam.end = current_beam.start - partial_beam_length;
            }
          } else if (should_break) {
            // This note should have a secondary break after it. Even though
            //  we just started a beam, it needs to end immediately.
            current_beam.end = current_beam.start - partial_beam_length;
            beam_started = false;
          }
          beam_lines.push(current_beam);
        }
      } else {
        // The current note does not get a beam.
        beam_started = false;
      }

      // Store the secondary break flag to inform the partial beam logic in
      //  the next iteration of the loop.
      previous_should_break = should_break;
    }

    // Add a partial beam pointing left if this is the last note in the group
    const last_beam = beam_lines[beam_lines.length - 1];
    if (last_beam && last_beam.end === undefined) {
      last_beam.end = last_beam.start - partial_beam_length;
    }
    return beam_lines;
  }

  /** Render the stems for each note. */
  protected drawStems(ctx: RenderContext): void {
    this.notes.forEach((note) => {
      const stem = note.getStem();
      if (stem) {
        const stem_x = note.getStemX();
        stem.setNoteHeadXBounds(stem_x, stem_x);
        stem.setContext(ctx).draw();
      }
    }, this);
  }

  // Render the beam lines
  protected drawBeamLines(ctx: RenderContext): void {
    const valid_beam_durations = ['4', '8', '16', '32', '64'];

    const firstNote = this.notes[0];
    let beamY = this.getBeamYToDraw();
    const firstStemX = firstNote.getStemX();
    const beamThickness = this.render_options.beam_width * this.stem_direction;

    // Draw the beams.
    for (let i = 0; i < valid_beam_durations.length; ++i) {
      const duration = valid_beam_durations[i];
      const beamLines = this.getBeamLines(duration);

      for (let j = 0; j < beamLines.length; ++j) {
        const beam_line = beamLines[j];
        const startBeamX = beam_line.start;

        const startBeamY = this.getSlopeY(startBeamX, firstStemX, beamY, this.slope);
        const lastBeamX = beam_line.end;
        if (lastBeamX) {
          const lastBeamY = this.getSlopeY(lastBeamX, firstStemX, beamY, this.slope);

          ctx.beginPath();
          ctx.moveTo(startBeamX, startBeamY);
          ctx.lineTo(startBeamX, startBeamY + beamThickness);
          ctx.lineTo(lastBeamX + 1, lastBeamY + beamThickness);
          ctx.lineTo(lastBeamX + 1, lastBeamY);
          ctx.closePath();
          ctx.fill();
        } else {
          throw new RuntimeError('NoLastBeamX', 'lastBeamX undefined.');
        }
      }

      beamY += beamThickness * 1.5;
    }
  }

  /** Pre-format the beam. */
  preFormat(): this {
    return this;
  }

  /**
   * Post-format the beam. This can only be called after
   * the notes in the beam have both `x` and `y` values. ie: they've
   * been formatted and have staves.
   */
  postFormat(): void {
    if (this.postFormatted) return;

    // Calculate a smart slope if we're not forcing the beams to be flat.
    if (isTabNote(this.notes[0]) || this.render_options.flat_beams) {
      this.calculateFlatSlope();
    } else {
      this.calculateSlope();
    }
    this.applyStemExtensions();

    this.postFormatted = true;
  }

  /** Render the beam to the canvas context */
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();
    if (this.unbeamable) return;

    if (!this.postFormatted) {
      this.postFormat();
    }

    this.drawStems(ctx);
    this.applyStyle();
    ctx.openGroup('beam', this.getAttribute('id'));
    this.drawBeamLines(ctx);
    ctx.closeGroup();
    this.restoreStyle();
  }
}
