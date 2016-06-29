// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements notes for standard notation. This consists of one or
// more `NoteHeads`, an optional stem, and an optional flag.
//
// *Throughout these comments, a "note" refers to the entire `StaveNote`,
// and a "key" refers to a specific pitch/notehead within a note.*
//
// See `tests/stavenote_tests.js` for usage examples.

import { Vex } from './vex';
import { Flow } from './tables';
import { BoundingBox } from './boundingbox';
import { Stem } from './stem';
import { NoteHead } from './notehead';
import { StemmableNote } from './stemmablenote';
import { Modifier } from './modifier';
import { Dot } from './dot';
import { Glyph } from './glyph';

// To enable logging for this class. Set `Vex.Flow.StaveNote.DEBUG` to `true`.
function L(...args) { if (StaveNote.DEBUG) Vex.L('Vex.Flow.StaveNote', args); }

// Helper methods for rest positioning in ModifierContext.
function shiftRestVertical(rest, note, dir) {
  const delta = (note.isrest ? 0.0 : 1.0) * dir;

  rest.line += delta;
  rest.maxLine += delta;
  rest.minLine += delta;
  rest.note.setKeyLine(0, rest.note.getKeyLine(0) + (delta));
}

// Called from formatNotes :: center a rest between two notes
function centerRest(rest, noteU, noteL) {
  const delta = rest.line - Vex.MidLine(noteU.minLine, noteL.maxLine);
  rest.note.setKeyLine(0, rest.note.getKeyLine(0) - delta);
  rest.line -= delta;
  rest.maxLine -= delta;
  rest.minLine -= delta;
}

export class StaveNote extends StemmableNote {
  static get CATEGORY() { return 'stavenotes'; }
  static get STEM_UP() { return Stem.UP; }
  static get STEM_DOWN() { return Stem.DOWN; }

  // ## Static Methods
  //
  // Format notes inside a ModifierContext.
  static format(notes, state) {
    if (!notes || notes.length < 2) return false;

    if (notes[0].getStave() != null) return StaveNote.formatByY(notes, state);

    const notesList = [];

    for (let i = 0; i < notes.length; i++) {
      const props = notes[i].getKeyProps();
      const line = props[0].line;
      let minL = props[props.length - 1].line;
      const stemDirection = notes[i].getStemDirection();
      const stemMax = notes[i].getStemLength() / 10;
      const stemMin = notes[i].getStemMinumumLength() / 10;

      let maxL;
      if (notes[i].isRest()) {
        maxL = line + notes[i].glyph.line_above;
        minL = line - notes[i].glyph.line_below;
      } else {
        maxL = stemDirection === 1
          ? props[props.length - 1].line + stemMax
          : props[props.length - 1].line;

        minL = stemDirection === 1
          ? props[0].line
          : props[0].line - stemMax;
      }

      notesList.push({
        line: props[0].line, // note/rest base line
        maxLine: maxL, // note/rest upper bounds line
        minLine: minL, // note/rest lower bounds line
        isrest: notes[i].isRest(),
        stemDirection,
        stemMax, // Maximum (default) note stem length;
        stemMin, // minimum note stem length
        voice_shift: notes[i].getVoiceShiftWidth(),
        is_displaced: notes[i].isDisplaced(), // note manually displaced
        note: notes[i],
      });
    }

    const voices = notesList.length;

    let noteU = notesList[0];
    const noteM = voices > 2 ? notesList[1] : null;
    let noteL = voices > 2 ? notesList[2] : notesList[1];

    // for two voice backward compatibility, ensure upper voice is stems up
    // for three voices, the voices must be in order (upper, middle, lower)
    if (voices === 2 && noteU.stemDirection === -1 && noteL.stemDirection === 1) {
      noteU = notesList[1];
      noteL = notesList[0];
    }

    const voiceXShift = Math.max(noteU.voice_shift, noteL.voice_shift);
    let xShift = 0;
    let stemDelta;

    // Test for two voice note intersection
    if (voices === 2) {
      const lineSpacing = noteU.stemDirection === noteL.stemDirection ? 0.0 : 0.5;
      // if top voice is a middle voice, check stem intersection with lower voice
      if (noteU.stemDirection === noteL.stemDirection &&
          noteU.minLine <= noteL.maxLine) {
        if (!noteU.isrest) {
          stemDelta = Math.abs(noteU.line - (noteL.maxLine + 0.5));
          stemDelta = Math.max(stemDelta, noteU.stemMin);
          noteU.minLine = noteU.line - stemDelta;
          noteU.note.setStemLength(stemDelta * 10);
        }
      }
      if (noteU.minLine <= noteL.maxLine + lineSpacing) {
        if (noteU.isrest) {
          // shift rest up
          shiftRestVertical(noteU, noteL, 1);
        } else if (noteL.isrest) {
          // shift rest down
          shiftRestVertical(noteL, noteU, -1);
        } else {
          xShift = voiceXShift;
          if (noteU.stemDirection === noteL.stemDirection) {
            // upper voice is middle voice, so shift it right
            noteU.note.setXShift(xShift + 3);
          } else {
            // shift lower voice right
            noteL.note.setXShift(xShift);
          }
        }
      }

      // format complete
      return true;
    }

    // Check middle voice stem intersection with lower voice
    if (noteM !== null && noteM.minLine < noteL.maxLine + 0.5) {
      if (!noteM.isrest) {
        stemDelta = Math.abs(noteM.line - (noteL.maxLine + 0.5));
        stemDelta = Math.max(stemDelta, noteM.stemMin);
        noteM.minLine = noteM.line - stemDelta;
        noteM.note.setStemLength(stemDelta * 10);
      }
    }

    // For three voices, test if rests can be repositioned
    //
    // Special case 1 :: middle voice rest between two notes
    //
    if (noteM.isrest && !noteU.isrest && !noteL.isrest) {
      if (noteU.minLine <= noteM.maxLine || noteM.minLine <= noteL.maxLine) {
        const restHeight = noteM.maxLine - noteM.minLine;
        const space = noteU.minLine - noteL.maxLine;
        if (restHeight < space) {
           // center middle voice rest between the upper and lower voices
          centerRest(noteM, noteU, noteL);
        } else {
          xShift = voiceXShift + 3;    // shift middle rest right
          noteM.note.setXShift(xShift);
        }
         // format complete
        return true;
      }
    }

    // Special case 2 :: all voices are rests
    if (noteU.isrest && noteM.isrest && noteL.isrest) {
      // Shift upper voice rest up
      shiftRestVertical(noteU, noteM, 1);
      // Shift lower voice rest down
      shiftRestVertical(noteL, noteM, -1);
      // format complete
      return true;
    }

    // Test if any other rests can be repositioned
    if (noteM.isrest && noteU.isrest && noteM.minLine <= noteL.maxLine) {
      // Shift middle voice rest up
      shiftRestVertical(noteM, noteL, 1);
    }
    if (noteM.isrest && noteL.isrest && noteU.minLine <= noteM.maxLine) {
      // Shift middle voice rest down
      shiftRestVertical(noteM, noteU, -1);
    }
    if (noteU.isrest && noteU.minLine <= noteM.maxLine) {
      // shift upper voice rest up;
      shiftRestVertical(noteU, noteM, 1);
    }
    if (noteL.isrest && noteM.minLine <= noteL.maxLine) {
      // shift lower voice rest down
      shiftRestVertical(noteL, noteM, -1);
    }

    // If middle voice intersects upper or lower voice
    if ((!noteU.isrest && !noteM.isrest && noteU.minLine <= noteM.maxLine + 0.5) ||
        (!noteM.isrest && !noteL.isrest && noteM.minLine <= noteL.maxLine)) {
      xShift = voiceXShift + 3;      // shift middle note right
      noteM.note.setXShift(xShift);
    }

    return true;
  }

  static formatByY(notes, state) {
    // NOTE: this function does not support more than two voices per stave
    // use with care.
    let hasStave = true;

    for (let i = 0; i < notes.length; i++) {
      hasStave = hasStave && notes[i].getStave() != null;
    }

    if (!hasStave) {
      throw new Vex.RERR(
        'Stave Missing',
        'All notes must have a stave - Vex.Flow.ModifierContext.formatMultiVoice!'
      );
    }

    let xShift = 0;

    for (let i = 0; i < notes.length - 1; i++) {
      let topNote = notes[i];
      let bottomNote = notes[i + 1];

      if (topNote.getStemDirection() === Stem.DOWN) {
        topNote = notes[i + 1];
        bottomNote = notes[i];
      }

      const topKeys = topNote.getKeyProps();
      const bottomKeys = bottomNote.getKeyProps();

      const topY = topNote.getStave().getYForLine(topKeys[0].line);
      const bottomY = bottomNote.getStave().getYForLine(bottomKeys[bottomKeys.length - 1].line);

      const lineSpace = topNote.getStave().options.spacing_between_lines_px;
      if (Math.abs(topY - bottomY) === lineSpace / 2) {
        xShift = topNote.getVoiceShiftWidth();
        bottomNote.setXShift(xShift);
      }
    }

    state.right_shift += xShift;
  }

  static postFormat(notes) {
    if (!notes) return false;

    notes.forEach(note => note.postFormat());

    return true;
  }

  constructor(noteStruct) {
    super(noteStruct);

    this.keys = noteStruct.keys;
    this.clef = noteStruct.clef;
    this.octave_shift = noteStruct.octave_shift;
    this.beam = null;

    // Pull note rendering properties
    this.glyph = Flow.durationToGlyph(this.duration, this.noteType);

    if (!this.glyph) {
      throw new Vex.RuntimeError(
        'BadArguments',
        `Invalid note initialization data (No glyph found): ${JSON.stringify(noteStruct)}`
      );
    }

    // if true, displace note to right
    this.displaced = false;
    this.dot_shiftY = 0;
    // per-pitch properties
    this.keyProps = [];
    // for displaced ledger lines
    this.use_default_head_x = false;

    // Drawing
    this.note_heads = [];
    this.modifiers = [];

    Vex.Merge(this.render_options, {
      // font size for note heads and rests
      glyph_font_scale: 35,
      // number of stroke px to the left and right of head
      stroke_px: 3,
    });

    this.calculateKeyProps();

    this.buildStem();

    // Set the stem direction
    if (noteStruct.auto_stem) {
      this.autoStem();
    } else {
      this.setStemDirection(noteStruct.stem_direction);
    }

    this.buildNoteHeads();

    // Calculate left/right padding
    this.calcExtraPx();
  }

  getCategory() { return StaveNote.CATEGORY; }

  // Builds a `Stem` for the note
  buildStem() {
    const glyph = this.getGlyph();
    const yExtend = glyph.code_head === 'v95' || glyph.code_head === 'v3e' ? -4 : 0;
    const stem = new Stem({ yExtend });

    if (this.isRest()) {
      stem.hide = true;
    }

    this.setStem(stem);
  }

  // Builds a `NoteHead` for each key in the note
  buildNoteHeads() {
    const stemDirection = this.getStemDirection();
    const keys = this.getKeys();

    let lastLine = null;
    let lineDiff = null;
    let displaced = false;

    // Draw notes from bottom to top.

    // For down-stem notes, we draw from top to bottom.
    let start;
    let end;
    let step;
    if (stemDirection === Stem.UP) {
      start = 0;
      end = keys.length;
      step = 1;
    } else if (stemDirection === Stem.DOWN) {
      start = keys.length - 1;
      end = -1;
      step = -1;
    }

    for (let i = start; i !== end; i += step) {
      const noteProps = this.keyProps[i];
      const line = noteProps.line;

      // Keep track of last line with a note head, so that consecutive heads
      // are correctly displaced.
      if (lastLine === null) {
        lastLine = line;
      } else {
        lineDiff = Math.abs(lastLine - line);
        if (lineDiff === 0 || lineDiff === 0.5) {
          displaced = !displaced;
        } else {
          displaced = false;
          this.use_default_head_x = true;
        }
      }
      lastLine = line;

      const notehead = new NoteHead({
        duration: this.duration,
        note_type: this.noteType,
        displaced,
        stem_direction: stemDirection,
        custom_glyph_code: noteProps.code,
        glyph_font_scale: this.render_options.glyph_font_scale,
        x_shift: noteProps.shift_right,
        line: noteProps.line,
      });

      this.note_heads[i] = notehead;
    }
  }

  // Automatically sets the stem direction based on the keys in the note
  autoStem() {
    // Figure out optimal stem direction based on given notes
    this.minLine = this.keyProps[0].line;
    this.maxLine = this.keyProps[this.keyProps.length - 1].line;

    const MIDDLE_LINE = 3;
    const decider = (this.minLine + this.maxLine) / 2;
    const stemDirection = decider < MIDDLE_LINE ? Stem.UP : Stem.DOWN;

    this.setStemDirection(stemDirection);
  }

  // Calculates and stores the properties for each key in the note
  calculateKeyProps() {
    let lastLine = null;
    for (let i = 0; i < this.keys.length; ++i) {
      const key = this.keys[i];

      // All rests use the same position on the line.
      // if (this.glyph.rest) key = this.glyph.position;
      if (this.glyph.rest) this.glyph.position = key;

      const options = { octave_shift: this.octave_shift || 0 };
      const props = Flow.keyProperties(key, this.clef, options);

      if (!props) {
        throw new Vex.RuntimeError('BadArguments', `Invalid key for note properties: ${key}`);
      }

      // Override line placement for default rests
      if (props.key === 'R') {
        if (this.duration === '1' || this.duration === 'w') {
          props.line = 4;
        } else {
          props.line = 3;
        }
      }

      // Calculate displacement of this note
      const line = props.line;
      if (lastLine === null) {
        lastLine = line;
      } else {
        if (Math.abs(lastLine - line) === 0.5) {
          this.displaced = true;
          props.displaced = true;

          // Have to mark the previous note as
          // displaced as well, for modifier placement
          if (this.keyProps.length > 0) {
            this.keyProps[i - 1].displaced = true;
          }
        }
      }

      lastLine = line;
      this.keyProps.push(props);
    }

    // Sort the notes from lowest line to highest line
    lastLine = -1000;
    this.keyProps.forEach(key => {
      if (key.line < lastLine) {
        Vex.W(
          'Unsorted keys in note will be sorted. ' +
          'See https://github.com/0xfe/vexflow/issues/104 for details.'
        );
      }
      lastLine = key.line;
    });
    this.keyProps.sort((a, b) => a.line - b.line);
  }

  // Get the `BoundingBox` for the entire note
  getBoundingBox() {
    if (!this.preFormatted) {
      throw new Vex.RERR('UnformattedNote', "Can't call getBoundingBox on an unformatted note.");
    }

    const { width: w, modLeftPx, extraLeftPx } = this.getMetrics();
    const x = this.getAbsoluteX() - modLeftPx - extraLeftPx;

    let minY = 0;
    let maxY = 0;
    const halfLineSpacing = this.getStave().getSpacingBetweenLines() / 2;
    const lineSpacing = halfLineSpacing * 2;

    if (this.isRest()) {
      const y = this.ys[0];
      const frac = Flow.durationToFraction(this.duration);
      if (frac.equals(1) || frac.equals(2)) {
        minY = y - halfLineSpacing;
        maxY = y + halfLineSpacing;
      } else {
        minY = y - (this.glyph.line_above * lineSpacing);
        maxY = y + (this.glyph.line_below * lineSpacing);
      }
    } else if (this.glyph.stem) {
      const ys = this.getStemExtents();
      ys.baseY += halfLineSpacing * this.stem_direction;
      minY = Vex.Min(ys.topY, ys.baseY);
      maxY = Vex.Max(ys.topY, ys.baseY);
    } else {
      minY = null;
      maxY = null;

      for (let i = 0; i < this.ys.length; ++i) {
        const yy = this.ys[i];
        if (i === 0) {
          minY = yy;
          maxY = yy;
        } else {
          minY = Vex.Min(yy, minY);
          maxY = Vex.Max(yy, maxY);
        }
      }
      minY -= halfLineSpacing;
      maxY += halfLineSpacing;
    }

    return new BoundingBox(x, minY, w, maxY - minY);
  }

  // Gets the line number of the top or bottom note in the chord.
  // If `isTopNote` is `true` then get the top note
  getLineNumber(isTopNote) {
    if (!this.keyProps.length) {
      throw new Vex.RERR(
        'NoKeyProps', "Can't get bottom note line, because note is not initialized properly."
      );
    }

    let resultLine = this.keyProps[0].line;

    // No precondition assumed for sortedness of keyProps array
    for (let i = 0; i < this.keyProps.length; i++) {
      const thisLine = this.keyProps[i].line;
      if (isTopNote) {
        if (thisLine > resultLine) resultLine = thisLine;
      } else {
        if (thisLine < resultLine) resultLine = thisLine;
      }
    }

    return resultLine;
  }

  // Determine if current note is a rest
  isRest() { return this.glyph.rest; }

  // Determine if the current note is a chord
  isChord() { return !this.isRest() && this.keys.length > 1; }

  // Determine if the `StaveNote` has a stem
  hasStem() { return this.glyph.stem; }

  // Get the `y` coordinate for text placed on the top/bottom of a
  // note at a desired `text_line`
  getYForTopText(textLine) {
    const extents = this.getStemExtents();
    return Math.min(
      this.stave.getYForTopText(textLine),
      extents.topY - (this.render_options.annotation_spacing * (textLine + 1))
    );
  }
  getYForBottomText(textLine) {
    const extents = this.getStemExtents();
    return Math.max(
      this.stave.getYForTopText(textLine),
      extents.baseY + (this.render_options.annotation_spacing * (textLine))
    );
  }

  // Sets the current note to the provided `stave`. This applies
  // `y` values to the `NoteHeads`.
  setStave(stave) {
    super.setStave(stave);

    const ys = this.note_heads.map(notehead => {
      notehead.setStave(stave);
      return notehead.getY();
    });

    this.setYs(ys);

    if (this.hasStem()) {
      const { y_top, y_bottom } = this.getNoteHeadBounds();
      this.stem.setYBounds(y_top, y_bottom);
    }

    return this;
  }

  // Get the pitches in the note
  getKeys() { return this.keys; }

  // Get the properties for all the keys in the note
  getKeyProps() {
    return this.keyProps;
  }

  // Check if note is shifted to the right
  isDisplaced() {
    return this.displaced;
  }

  // Sets whether shift note to the right. `displaced` is a `boolean`
  setNoteDisplaced(displaced) {
    this.displaced = displaced;
    return this;
  }

  // Get the starting `x` coordinate for a `StaveTie`
  getTieRightX() {
    let tieStartX = this.getAbsoluteX();
    tieStartX += this.glyph.head_width + this.x_shift + this.extraRightPx;
    if (this.modifierContext) tieStartX += this.modifierContext.getExtraRightPx();
    return tieStartX;
  }

  // Get the ending `x` coordinate for a `StaveTie`
  getTieLeftX() {
    let tieEndX = this.getAbsoluteX();
    tieEndX += this.x_shift - this.extraLeftPx;
    return tieEndX;
  }

  // Get the stave line on which to place a rest
  getLineForRest() {
    let restLine = this.keyProps[0].line;
    if (this.keyProps.length > 1) {
      const lastLine  = this.keyProps[this.keyProps.length - 1].line;
      const top = Math.max(restLine, lastLine);
      const bot = Math.min(restLine, lastLine);
      restLine = Vex.MidLine(top, bot);
    }

    return restLine;
  }

  // Get the default `x` and `y` coordinates for the provided `position`
  // and key `index`
  getModifierStartXY(position, index) {
    if (!this.preFormatted) {
      throw new Vex.RERR('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
    }

    if (this.ys.length === 0) {
      throw new Vex.RERR('NoYValues', 'No Y-Values calculated for this note.');
    }

    let x = 0;
    if (position === Modifier.Position.LEFT) {
      // extra_left_px
      x = -1 * 2;
    } else if (position === Modifier.Position.RIGHT) {
      // extra_right_px
      x = this.glyph.head_width + this.x_shift + 2;
    } else if (position === Modifier.Position.BELOW ||
               position === Modifier.Position.ABOVE) {
      x = this.glyph.head_width / 2;
    }

    return { x: this.getAbsoluteX() + x, y: this.ys[index] };
  }

  // Sets the style of the complete StaveNote, including all keys
  // and the stem.
  setStyle(style) {
    this.note_heads.forEach(notehead => {
      notehead.setStyle(style);
    }, this);
    this.stem.setStyle(style);
  }

  // Sets the notehead at `index` to the provided coloring `style`.
  //
  // `style` is an `object` with the following properties: `shadowColor`,
  // `shadowBlur`, `fillStyle`, `strokeStyle`
  setKeyStyle(index, style) {
    this.note_heads[index].setStyle(style);
    return this;
  }

  setKeyLine(index, line) {
    this.keyProps[index].line = line;
    this.note_heads[index].setLine(line);
    return this;
  }

  getKeyLine(index) {
    return this.keyProps[index].line;
  }

  // Add self to modifier context. `mContext` is the `ModifierContext`
  // to be added to.
  addToModifierContext(mContext) {
    this.setModifierContext(mContext);
    for (let i = 0; i < this.modifiers.length; ++i) {
      this.modifierContext.addModifier(this.modifiers[i]);
    }
    this.modifierContext.addModifier(this);
    this.setPreFormatted(false);
    return this;
  }

  // Generic function to add modifiers to a note
  //
  // Parameters:
  // * `index`: The index of the key that we're modifying
  // * `modifier`: The modifier to add
  addModifier(index, modifier) {
    modifier.setNote(this);
    modifier.setIndex(index);
    this.modifiers.push(modifier);
    this.setPreFormatted(false);
    return this;
  }

  // Helper function to add an accidental to a key
  addAccidental(index, accidental) {
    return this.addModifier(index, accidental);
  }

  // Helper function to add an articulation to a key
  addArticulation(index, articulation) {
    return this.addModifier(index, articulation);
  }

  // Helper function to add an annotation to a key
  addAnnotation(index, annotation) {
    return this.addModifier(index, annotation);
  }

  // Helper function to add a dot on a specific key
  addDot(index) {
    const dot = new Dot();
    dot.setDotShiftY(this.glyph.dot_shiftY);
    this.dots++;
    return this.addModifier(index, dot);
  }

  // Convenience method to add dot to all keys in note
  addDotToAll() {
    for (let i = 0; i < this.keys.length; ++i) {
      this.addDot(i);
    }
    return this;
  }

  // Get all accidentals in the `ModifierContext`
  getAccidentals() {
    return this.modifierContext.getModifiers('accidentals');
  }

  // Get all dots in the `ModifierContext`
  getDots() {
    return this.modifierContext.getModifiers('dots');
  }

  // Get the width of the note if it is displaced. Used for `Voice`
  // formatting
  getVoiceShiftWidth() {
    // TODO: may need to accomodate for dot here.
    return this.glyph.head_width * (this.displaced ? 2 : 1);
  }

  // Calculates and sets the extra pixels to the left or right
  // if the note is displaced.
  calcExtraPx() {
    this.setExtraLeftPx(
      this.displaced && this.stem_direction === Stem.DOWN
        ? this.glyph.head_width
        : 0
    );

    // For upstems with flags, the extra space is unnecessary, since it's taken
    // up by the flag.
    this.setExtraRightPx(
      !this.hasFlag() && this.displaced && this.stem_direction === Stem.UP
        ? this.glyph.head_width
        : 0
    );
  }

  // Pre-render formatting
  preFormat() {
    if (this.preFormatted) return;
    if (this.modifierContext) this.modifierContext.preFormat();

    let width = this.glyph.head_width + this.extraLeftPx + this.extraRightPx;

    // For upward flagged notes, the width of the flag needs to be added
    if (this.glyph.flag && this.beam === null && this.stem_direction === Stem.UP) {
      width += this.glyph.head_width;
    }

    this.setWidth(width);
    this.setPreFormatted(true);
  }

  // Gets the staff line and y value for the highest and lowest noteheads
  getNoteHeadBounds() {
    // Top and bottom Y values for stem.
    let yTop = null;
    let yBottom = null;

    let highestLine = this.stave.getNumLines();
    let lowestLine = 1;

    this.note_heads.forEach(notehead => {
      const line = notehead.getLine();
      const y = notehead.getY();

      if (yTop === null || y < yTop)  {
        yTop = y;
      }

      if (yBottom === null || y > yBottom) {
        yBottom = y;
      }

      highestLine = line > highestLine ? line : highestLine;
      lowestLine = line < lowestLine ? line : lowestLine;
    }, this);

    return {
      y_top: yTop,
      y_bottom: yBottom,
      highest_line: highestLine,
      lowest_line: lowestLine,
    };
  }

  // Get the starting `x` coordinate for the noteheads
  getNoteHeadBeginX() {
    return this.getAbsoluteX() + this.x_shift;
  }

  // Get the ending `x` coordinate for the noteheads
  getNoteHeadEndX() {
    const xBegin = this.getNoteHeadBeginX();
    return xBegin + this.glyph.head_width - (Flow.STEM_WIDTH / 2);
  }

  // Draw the ledger lines between the stave and the highest/lowest keys
  drawLedgerLines() {
    const {
      note_heads, stave, use_default_head_x, x_shift, glyph,
      render_options: { stroke_px },
      context: ctx,
    } = this;

    if (this.isRest()) return;
    if (!ctx) {
      throw new Vex.RERR('NoCanvasContext', "Can't draw without a canvas context.");
    }

    const { highest_line, lowest_line } = this.getNoteHeadBounds();
    let headX = note_heads[0].getAbsoluteX();

    const drawLedgerLine = (y) => {
      if (use_default_head_x === true)  {
        headX = this.getAbsoluteX() + x_shift;
      }
      const x = headX - stroke_px;
      const length = ((headX + glyph.head_width) - headX) + (stroke_px * 2);

      ctx.fillRect(x, y, length, 1);
    };

    for (let line = 6; line <= highest_line; ++line) {
      drawLedgerLine(stave.getYForNote(line));
    }

    for (let line = 0; line >= lowest_line; --line) {
      drawLedgerLine(stave.getYForNote(line));
    }
  }

  // Draw all key modifiers
  drawModifiers() {
    if (!this.context) {
      throw new Vex.RERR('NoCanvasContext', "Can't draw without a canvas context.");
    }

    const ctx = this.context;
    ctx.openGroup('modifiers');
    for (let i = 0; i < this.modifiers.length; i++) {
      const modifier = this.modifiers[i];
      const notehead = this.note_heads[modifier.getIndex()];
      const noteheadStyle = notehead.getStyle();
      if (noteheadStyle) {
        ctx.save();
        notehead.applyStyle(ctx);
      }
      modifier.setContext(ctx);
      modifier.draw();
      if (noteheadStyle) {
        ctx.restore();
      }
    }
    ctx.closeGroup();
  }

  // Draw the flag for the note
  drawFlag() {
    const {
      stem, beam,
      context: ctx,
      render_options: { glyph_font_scale },
    } = this;

    if (!ctx) {
      throw new Vex.RERR('NoCanvasContext', "Can't draw without a canvas context.");
    }

    const shouldRenderFlag = beam === null;
    const glyph = this.getGlyph();

    if (glyph.flag && shouldRenderFlag) {
      let flagX;
      let flagY;
      let flagCode;

      const xBegin = this.getNoteHeadBeginX();
      const xEnd = this.getNoteHeadEndX();
      const { y_top, y_bottom } = this.getNoteHeadBounds();
      const noteStemHeight = stem.getHeight();
      if (this.getStemDirection() === Stem.DOWN) {
        // Down stems have flags on the left.
        flagX = xBegin + 1;
        flagY = y_top - noteStemHeight + 2;
        flagCode = glyph.code_flag_downstem;
      } else {
        // Up stems have flags on the left.
        flagX = xEnd + 1;
        flagY = y_bottom - noteStemHeight - 2;
        flagCode = glyph.code_flag_upstem;
      }

      // Draw the Flag
      ctx.openGroup('flag', null, { pointerBBox: true });
      Glyph.renderGlyph(ctx, flagX, flagY, glyph_font_scale, flagCode);
      ctx.closeGroup();
    }
  }

  // Draw the NoteHeads
  drawNoteHeads() {
    this.note_heads.forEach(notehead => {
      this.context.openGroup('notehead', null, { pointerBBox: true });
      notehead.setContext(this.context).draw();
      this.context.closeGroup();
    });
  }

  // Render the stem onto the canvas
  drawStem(stemStruct) {
    if (!this.context) {
      throw new Vex.RERR('NoCanvasContext', "Can't draw without a canvas context.");
    }

    if (stemStruct) {
      this.setStem(new Stem(stemStruct));
    }

    this.context.openGroup('stem', null, { pointerBBox: true });
    this.stem.setContext(this.context).draw();
    this.context.closeGroup();
  }

  // Draws all the `StaveNote` parts. This is the main drawing method.
  draw() {
    if (!this.context) {
      throw new Vex.RERR('NoCanvasContext', "Can't draw without a canvas context.");
    }
    if (!this.stave) {
      throw new Vex.RERR('NoStave', "Can't draw without a stave.");
    }
    if (this.ys.length === 0) {
      throw new Vex.RERR('NoYValues', "Can't draw note without Y values.");
    }

    const xBegin = this.getNoteHeadBeginX();
    const xEnd = this.getNoteHeadEndX();
    const shouldRenderStem = this.hasStem() && !this.beam;

    // Format note head x positions
    this.note_heads.forEach(notehead => notehead.setX(xBegin));

    // Format stem x positions
    this.stem.setNoteHeadXBounds(xBegin, xEnd);

    L('Rendering ', this.isChord() ? 'chord :' : 'note :', this.keys);

    // Draw each part of the note
    this.drawLedgerLines();

    this.elem = this.context.openGroup('stavenote', this.id);
    this.context.openGroup('note', null, { pointerBBox: true });
    if (shouldRenderStem) this.drawStem();
    this.drawNoteHeads();
    this.drawFlag();
    this.context.closeGroup();
    this.drawModifiers();
    this.context.closeGroup();
  }
}
