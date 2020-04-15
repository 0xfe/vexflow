// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// @author Greg Ristow (modifications)
//
// ## Description
//
// This file implements accidentals as modifiers that can be attached to
// notes. Support is included for both western and microtonal accidentals.
//
// See `tests/accidental_tests.js` for usage examples.

import { Vex } from './vex';
import { Fraction } from './fraction';
import { Flow } from './tables';
import { Music } from './music';
import { Modifier } from './modifier';
import { Glyph } from './glyph';

// To enable logging for this class. Set `Vex.Flow.Accidental.DEBUG` to `true`.
function L(...args) { if (Accidental.DEBUG) Vex.L('Vex.Flow.Accidental', args); }

const getGlyphWidth = glyph => glyph.getMetrics().width;

// An `Accidental` inherits from `Modifier`, and is formatted within a
// `ModifierContext`.
export class Accidental extends Modifier {
  static get CATEGORY() { return 'accidentals'; }

  // Arrange accidentals inside a ModifierContext.
  static format(accidentals, state) {
    const noteheadAccidentalPadding = 1;
    const leftShift = state.left_shift + noteheadAccidentalPadding;
    const accidentalSpacing = 3;

    // If there are no accidentals, we needn't format their positions
    if (!accidentals || accidentals.length === 0) return;

    const accList = [];
    let prevNote = null;
    let shiftL = 0;

    // First determine the accidentals' Y positions from the note.keys
    for (let i = 0; i < accidentals.length; ++i) {
      const acc = accidentals[i];
      const note = acc.getNote();
      const stave = note.getStave();
      const props = note.getKeyProps()[acc.getIndex()];
      if (note !== prevNote) {
        // Iterate through all notes to get the displaced pixels
        for (let n = 0; n < note.keys.length; ++n) {
          shiftL = Math.max(note.getLeftDisplacedHeadPx(), shiftL);
        }
        prevNote = note;
      }
      if (stave !== null) {
        const lineSpace = stave.options.spacing_between_lines_px;
        const y = stave.getYForLine(props.line);
        const accLine = Math.round(y / lineSpace * 2) / 2;
        accList.push({ y, line: accLine, shift: shiftL, acc, lineSpace });
      } else {
        accList.push({ line: props.line, shift: shiftL, acc });
      }
    }

    // Sort accidentals by line number.
    accList.sort((a, b) => b.line - a.line);

    // FIXME: Confusing name. Each object in this array has a property called `line`.
    // So if this is a list of lines, you end up with: `line.line` which is very awkward.
    const lineList = [];

    // amount by which all accidentals must be shifted right or left for
    // stem flipping, notehead shifting concerns.
    let accShift = 0;
    let previousLine = null;

    // Create an array of unique line numbers (lineList) from accList
    for (let i = 0; i < accList.length; i++) {
      const acc = accList[i];

      // if this is the first line, or a new line, add a lineList
      if (previousLine === null || previousLine !== acc.line) {
        lineList.push({
          line: acc.line,
          flatLine: true,
          dblSharpLine: true,
          numAcc: 0,
          width: 0,
        });
      }
      // if this accidental is not a flat, the accidental needs 3.0 lines lower
      // clearance instead of 2.5 lines for b or bb.
      // FIXME: Naming could use work. acc.acc is very awkward
      if (acc.acc.type !== 'b' && acc.acc.type !== 'bb') {
        lineList[lineList.length - 1].flatLine = false;
      }

      // if this accidental is not a double sharp, the accidental needs 3.0 lines above
      if (acc.acc.type !== '##') {
        lineList[lineList.length - 1].dblSharpLine = false;
      }

      // Track how many accidentals are on this line:
      lineList[lineList.length - 1].numAcc++;

      // Track the total x_offset needed for this line which will be needed
      // for formatting lines w/ multiple accidentals:

      // width = accidental width + universal spacing between accidentals
      lineList[lineList.length - 1].width += acc.acc.getWidth() + accidentalSpacing;

      // if this accShift is larger, use it to keep first column accidentals in the same line
      accShift = acc.shift > accShift ? acc.shift : accShift;

      previousLine = acc.line;
    }

    // ### Place Accidentals in Columns
    //
    // Default to a classic triangular layout (middle accidental farthest left),
    // but follow exceptions as outlined in G. Read's _Music Notation_ and
    // Elaine Gould's _Behind Bars_.
    //
    // Additionally, this implements different vertical collision rules for
    // flats (only need 2.5 lines clearance below) and double sharps (only
    // need 2.5 lines of clearance above or below).
    //
    // Classic layouts and exception patterns are found in the 'tables.js'
    // in 'Vex.Flow.accidentalColumnsTable'
    //
    // Beyond 6 vertical accidentals, default to the parallel ascending lines approach,
    // using as few columns as possible for the verticle structure.
    //
    // TODO (?): Allow column to be specified for an accidental at run-time?

    let totalColumns = 0;

    // establish the boundaries for a group of notes with clashing accidentals:
    for (let i = 0; i < lineList.length; i++) {
      let noFurtherConflicts = false;
      const groupStart = i;
      let groupEnd = i;

      while (groupEnd + 1 < lineList.length && !noFurtherConflicts) {
        // if this note conflicts with the next:
        if (this.checkCollision(lineList[groupEnd], lineList[groupEnd + 1])) {
          // include the next note in the group:
          groupEnd++;
        } else {
          noFurtherConflicts = true;
        }
      }

      // Gets an a line from the `lineList`, relative to the current group
      const getGroupLine = (index) => lineList[groupStart + index];
      const getGroupLines = (indexes) => indexes.map(getGroupLine);
      const lineDifference = (indexA, indexB) => {
        const [a, b] = getGroupLines([indexA, indexB]).map(item => item.line);
        return a - b;
      };

      const notColliding = (...indexPairs) =>
        indexPairs
          .map(getGroupLines)
          .every(lines => !this.checkCollision(...lines));

      // Set columns for the lines in this group:
      const groupLength = groupEnd - groupStart + 1;

      // Set the accidental column for each line of the group
      let endCase = this.checkCollision(lineList[groupStart], lineList[groupEnd]) ? 'a' : 'b';

      switch (groupLength) {
        case 3:
          if (endCase === 'a' && lineDifference(1, 2) === 0.5 && lineDifference(0, 1) !== 0.5) {
            endCase = 'second_on_bottom';
          }
          break;
        case 4:
          if (notColliding([0, 2], [1, 3])) {
            endCase = 'spaced_out_tetrachord';
          }
          break;
        case 5:
          if (endCase === 'b' && notColliding([1, 3])) {
            endCase = 'spaced_out_pentachord';
            if (notColliding([0, 2], [2, 4])) {
              endCase = 'very_spaced_out_pentachord';
            }
          }
          break;
        case 6:
          if (notColliding([0, 3], [1, 4], [2, 5])) {
            endCase = 'spaced_out_hexachord';
          }
          if (notColliding([0, 2], [2, 4], [1, 3], [3, 5])) {
            endCase = 'very_spaced_out_hexachord';
          }
          break;
        default:
          break;
      }

      let groupMember;
      let column;
      // If the group contains more than seven members, use ascending parallel lines
      // of accidentals, using as few columns as possible while avoiding collisions.
      if (groupLength >= 7) {
        // First, determine how many columns to use:
        let patternLength = 2;
        let collisionDetected = true;
        while (collisionDetected === true) {
          collisionDetected = false;
          for (let line = 0; line + patternLength < lineList.length; line++) {
            if (this.checkCollision(lineList[line], lineList[line + patternLength])) {
              collisionDetected = true;
              patternLength++;
              break;
            }
          }
        }
        // Then, assign a column to each line of accidentals
        for (groupMember = i; groupMember <= groupEnd; groupMember++) {
          column = ((groupMember - i) % patternLength) + 1;
          lineList[groupMember].column = column;
          totalColumns = (totalColumns > column) ? totalColumns : column;
        }

        // Otherwise, if the group contains fewer than seven members, use the layouts from
        // the accidentalsColumnsTable housed in tables.js.
      } else {
        for (groupMember = i; groupMember <= groupEnd; groupMember++) {
          column = Flow.accidentalColumnsTable[groupLength][endCase][groupMember - i];
          lineList[groupMember].column = column;
          totalColumns = (totalColumns > column) ? totalColumns : column;
        }
      }

      // Increment i to the last note that was set, so that if a lower set of notes
      // does not conflict at all with this group, it can have its own classic shape.
      i = groupEnd;
    }

    // ### Convert Columns to x_offsets
    //
    // This keeps columns aligned, even if they have different accidentals within them
    // which sometimes results in a larger x_offset than is an accidental might need
    // to preserve the symmetry of the accidental shape.
    //
    // Neither A.C. Vinci nor G. Read address this, and it typically only happens in
    // music with complex chord clusters.
    //
    // TODO (?): Optionally allow closer compression of accidentals, instead of forcing
    // parallel columns.

    // track each column's max width, which will be used as initial shift of later columns:
    const columnWidths = [];
    const columnXOffsets = [];
    for (let i = 0; i <= totalColumns; i++) {
      columnWidths[i] = 0;
      columnXOffsets[i] = 0;
    }

    columnWidths[0] = accShift + leftShift;
    columnXOffsets[0] = accShift + leftShift;

    // Fill columnWidths with widest needed x-space;
    // this is what keeps the columns parallel.
    lineList.forEach(line => {
      if (line.width > columnWidths[line.column]) columnWidths[line.column] = line.width;
    });

    for (let i = 1; i < columnWidths.length; i++) {
      // this column's offset = this column's width + previous column's offset
      columnXOffsets[i] = columnWidths[i] + columnXOffsets[i - 1];
    }

    const totalShift = columnXOffsets[columnXOffsets.length - 1];
    // Set the xShift for each accidental according to column offsets:
    let accCount = 0;
    lineList.forEach(line => {
      let lineWidth = 0;
      const lastAccOnLine = accCount + line.numAcc;
      // handle all of the accidentals on a given line:
      for (accCount; accCount < lastAccOnLine; accCount++) {
        const xShift = (columnXOffsets[line.column - 1] + lineWidth);
        accList[accCount].acc.setXShift(xShift);
        // keep track of the width of accidentals we've added so far, so that when
        // we loop, we add space for them.
        lineWidth += accList[accCount].acc.getWidth() + accidentalSpacing;
        L('Line, accCount, shift: ', line.line, accCount, xShift);
      }
    });

    // update the overall layout with the full width of the accidental shapes:
    state.left_shift += totalShift;
  }

  // Helper function to determine whether two lines of accidentals collide vertically
  static checkCollision(line1, line2) {
    let clearance = line2.line - line1.line;
    let clearanceRequired = 3;
    // But less clearance is required for certain accidentals: b, bb and ##.
    if (clearance > 0) { // then line 2 is on top
      clearanceRequired = (line2.flatLine || line2.dblSharpLine) ? 2.5 : 3.0;
      if (line1.dblSharpLine) clearance -= 0.5;
    } else { // line 1 is on top
      clearanceRequired = (line1.flatLine || line1.dblSharpLine) ? 2.5 : 3.0;
      if (line2.dblSharpLine) clearance -= 0.5;
    }
    const collision = Math.abs(clearance) < clearanceRequired;
    L('Line_1, Line_2, Collision: ', line1.line, line2.line, collision);
    return collision;
  }

  // Use this method to automatically apply accidentals to a set of `voices`.
  // The accidentals will be remembered between all the voices provided.
  // Optionally, you can also provide an initial `keySignature`.
  static applyAccidentals(voices, keySignature) {
    const tickPositions = [];
    const tickNoteMap = {};

    // Sort the tickables in each voice by their tick position in the voice
    voices.forEach(voice => {
      const tickPosition = new Fraction(0, 1);
      const notes = voice.getTickables();
      notes.forEach(note => {
        if (note.shouldIgnoreTicks()) return;

        const notesAtPosition = tickNoteMap[tickPosition.value()];

        if (!notesAtPosition) {
          tickPositions.push(tickPosition.value());
          tickNoteMap[tickPosition.value()] = [note];
        } else {
          notesAtPosition.push(note);
        }

        tickPosition.add(note.getTicks());
      });
    });

    const music = new Music();

    // Default key signature is C major
    if (!keySignature) keySignature = 'C';

    // Get the scale map, which represents the current state of each pitch
    const scaleMap = music.createScaleMap(keySignature);

    tickPositions.forEach(tick => {
      const notes = tickNoteMap[tick];

      // Array to store all pitches that modified accidental states
      // at this tick position
      const modifiedPitches = [];

      const processNote = (note) => {
        if (note.isRest() || note.shouldIgnoreTicks()) return;

        // Go through each key and determine if an accidental should be
        // applied
        note.keys.forEach((keyString, keyIndex) => {
          const key = music.getNoteParts(keyString.split('/')[0]);

          // Force a natural for every key without an accidental
          const accidentalString = key.accidental || 'n';
          const pitch = key.root + accidentalString;

          // Determine if the current pitch has the same accidental
          // as the scale state
          const sameAccidental = scaleMap[key.root] === pitch;

          // Determine if an identical pitch in the chord already
          // modified the accidental state
          const previouslyModified = modifiedPitches.indexOf(pitch) > -1;

          // Add the accidental to the StaveNote
          if (!sameAccidental || (sameAccidental && previouslyModified)) {
            // Modify the scale map so that the root pitch has an
            // updated state
            scaleMap[key.root] = pitch;

            // Create the accidental
            const accidental = new Accidental(accidentalString);

            // Attach the accidental to the StaveNote
            note.addAccidental(keyIndex, accidental);

            // Add the pitch to list of pitches that modified accidentals
            modifiedPitches.push(pitch);
          }
        });

        // process grace notes
        note.getModifiers().forEach(modifier => {
          if (modifier.getCategory() === 'gracenotegroups') {
            modifier.getGraceNotes().forEach(processNote);
          }
        });
      };

      notes.forEach(processNote);
    });
  }

  // Create accidental. `type` can be a value from the
  // `Vex.Flow.accidentalCodes.accidentals` table in `tables.js`. For
  // example: `#`, `##`, `b`, `n`, etc.
  constructor(type = null) {
    super();
    this.setAttribute('type', 'Accidental');

    L('New accidental: ', type);

    this.note = null;
    // The `index` points to a specific note in a chord.
    this.index = null;
    this.type = type;
    this.position = Modifier.Position.LEFT;

    this.render_options = {
      // Font size for glyphs
      font_scale: 38,

      // Length of stroke across heads above or below the stave.
      stroke_px: 3,

      // Padding between accidental and parentheses on each side
      parenLeftPadding: 2,
      parenRightPadding: 2,
    };

    this.accidental = Flow.accidentalCodes(this.type);
    if (!this.accidental) {
      throw new Vex.RERR('ArgumentError', `Unknown accidental type: ${type}`);
    }

    // Cautionary accidentals have parentheses around them
    this.cautionary = false;
    this.parenLeft = null;
    this.parenRight = null;

    this.reset();
  }

  reset() {
    const fontScale = this.render_options.font_scale;
    this.glyph = new Glyph(this.accidental.code, fontScale);
    this.glyph.setOriginX(1.0);

    if (this.cautionary) {
      this.parenLeft = new Glyph(Flow.accidentalCodes('{').code, fontScale);
      this.parenRight = new Glyph(Flow.accidentalCodes('}').code, fontScale);
      this.parenLeft.setOriginX(1.0);
      this.parenRight.setOriginX(1.0);
    }
  }

  getCategory() { return Accidental.CATEGORY; }

  getWidth() {
    const parenWidth = this.cautionary
      ? (
        getGlyphWidth(this.parenLeft) +
        getGlyphWidth(this.parenRight) +
        this.render_options.parenLeftPadding +
        this.render_options.parenRightPadding
      )
      : 0;

    return getGlyphWidth(this.glyph) + parenWidth;
  }

  // Attach this accidental to `note`, which must be a `StaveNote`.
  setNote(note) {
    if (!note) {
      throw new Vex.RERR('ArgumentError', `Bad note value: ${note}`);
    }

    this.note = note;

    // Accidentals attached to grace notes are rendered smaller.
    if (this.note.getCategory() === 'gracenotes') {
      this.render_options.font_scale = 25;
      this.reset();
    }
  }

  // If called, draws parenthesis around accidental.
  setAsCautionary() {
    this.cautionary = true;
    this.render_options.font_scale = 28;
    this.reset();
    return this;
  }

  // Render accidental onto canvas.
  draw() {
    const {
      context,
      type, position, note, index, cautionary,
      x_shift, y_shift,
      glyph, parenLeft, parenRight,
      render_options: { parenLeftPadding, parenRightPadding },
    } = this;

    this.checkContext();

    if (!(note && (index != null))) {
      throw new Vex.RERR('NoAttachedNote', "Can't draw accidental without a note and index.");
    }

    // Figure out the start `x` and `y` coordinates for note and index.
    const start = note.getModifierStartXY(position, index);
    let accX = start.x + x_shift;
    const accY = start.y + y_shift;
    L('Rendering: ', type, accX, accY);

    if (!cautionary) {
      glyph.render(context, accX, accY);
    } else {
      // Render the accidental in parentheses.
      parenRight.render(context, accX, accY);
      accX -= getGlyphWidth(parenRight);
      accX -= parenRightPadding;
      accX -= this.accidental.parenRightPaddingAdjustment;
      glyph.render(context, accX, accY);
      accX -= getGlyphWidth(glyph);
      accX -= parenLeftPadding;
      parenLeft.render(context, accX, accY);
    }

    this.setRendered();
  }
}
