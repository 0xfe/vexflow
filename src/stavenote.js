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
function L() { if (StaveNote.DEBUG) Vex.L('Vex.Flow.StaveNote', arguments); }

// Helper methods for rest positioning in ModifierContext.
function shiftRestVertical(rest, note, dir) {
  const delta = (note.isrest ? 0.0 : 1.0) * dir;

  rest.line += delta;
  rest.max_line += delta;
  rest.min_line += delta;
  rest.note.setKeyLine(0, rest.note.getKeyLine(0) + (delta));
}

// Called from formatNotes :: center a rest between two notes
function centerRest(rest, noteU, noteL) {
  const delta = rest.line - Vex.MidLine(noteU.min_line, noteL.max_line);
  rest.note.setKeyLine(0, rest.note.getKeyLine(0) - delta);
  rest.line -= delta;
  rest.max_line -= delta;
  rest.min_line -= delta;
}

export class StaveNote extends StemmableNote {
  static get CATEGORY() { return 'stavenotes'; }

  // Stem directions
  static get STEM_UP() {
    return Stem.UP;
  }
  static get STEM_DOWN() {
    return Stem.DOWN;
  }

  // ## Static Methods
  //
  // Format notes inside a ModifierContext.
  static format(notes, state) {
    if (!notes || notes.length < 2) return false;

    if (notes[0].getStave() != null) return StaveNote.formatByY(notes, state);

    const notes_list = [];

    for (let i = 0; i < notes.length; i++) {
      const props = notes[i].getKeyProps();
      const line = props[0].line;
      let minL = props[props.length - 1].line;
      const stem_dir = notes[i].getStemDirection();
      const stem_max = notes[i].getStemLength() / 10;
      const stem_min = notes[i].getStemMinumumLength() / 10;

      let maxL;
      if (notes[i].isRest()) {
        maxL = line + notes[i].glyph.line_above;
        minL = line - notes[i].glyph.line_below;
      } else {
        maxL = stem_dir == 1 ? props[props.length - 1].line + stem_max
             : props[props.length - 1].line;
        minL = stem_dir == 1 ? props[0].line
             : props[0].line - stem_max;
      }
      notes_list.push(
        { line: props[0].line,         // note/rest base line
         max_line: maxL,              // note/rest upper bounds line
         min_line: minL,              // note/rest lower bounds line
         isrest: notes[i].isRest(),
         stem_dir,
         stem_max,          // Maximum (default) note stem length;
         stem_min,          // minimum note stem length
         voice_shift: notes[i].getVoiceShiftWidth(),
         is_displaced: notes[i].isDisplaced(),   // note manually displaced
         note: notes[i] });
    }

    const voices = notes_list.length;

    let noteU = notes_list[0];
    const noteM = voices > 2 ? notes_list[1] : null;
    let noteL = voices > 2 ? notes_list[2] : notes_list[1];

    // for two voice backward compatibility, ensure upper voice is stems up
    // for three voices, the voices must be in order (upper, middle, lower)
    if (voices == 2 && noteU.stem_dir == -1 && noteL.stem_dir == 1) {
      noteU = notes_list[1];
      noteL = notes_list[0];
    }

    const voice_x_shift = Math.max(noteU.voice_shift, noteL.voice_shift);
    let x_shift = 0;
    let stem_delta;

    // Test for two voice note intersection
    if (voices == 2) {
      const line_spacing = noteU.stem_dir == noteL.stem_dir ? 0.0 : 0.5;
      // if top voice is a middle voice, check stem intersection with lower voice
      if (noteU.stem_dir == noteL.stem_dir &&
          noteU.min_line <= noteL.max_line) {
        if (!noteU.isrest) {
          stem_delta = Math.abs(noteU.line - (noteL.max_line + 0.5));
          stem_delta = Math.max(stem_delta, noteU.stem_min);
          noteU.min_line = noteU.line - stem_delta;
          noteU.note.setStemLength(stem_delta * 10);
        }
      }
      if (noteU.min_line <= noteL.max_line + line_spacing) {
        if (noteU.isrest) {
          // shift rest up
          shiftRestVertical(noteU, noteL, 1);
        } else if (noteL.isrest) {
          // shift rest down
          shiftRestVertical(noteL, noteU, -1);
        } else {
          x_shift = voice_x_shift;
          if (noteU.stem_dir == noteL.stem_dir)
            // upper voice is middle voice, so shift it right
            noteU.note.setXShift(x_shift + 3);
          else
            // shift lower voice right
            noteL.note.setXShift(x_shift);
        }
      }

      // format complete
      return true;
    }

    // Check middle voice stem intersection with lower voice
    if (noteM != null && noteM.min_line < noteL.max_line + 0.5) {
      if (!noteM.isrest) {
        stem_delta = Math.abs(noteM.line - (noteL.max_line + 0.5));
        stem_delta = Math.max(stem_delta, noteM.stem_min);
        noteM.min_line = noteM.line - stem_delta;
        noteM.note.setStemLength(stem_delta * 10);
      }
    }

    // For three voices, test if rests can be repositioned
    //
    // Special case 1 :: middle voice rest between two notes
    //
    if (noteM.isrest && !noteU.isrest && !noteL.isrest) {
      if (noteU.min_line <= noteM.max_line ||
          noteM.min_line <= noteL.max_line) {
        const rest_height = noteM.max_line - noteM.min_line;
        const space = noteU.min_line - noteL.max_line;
        if (rest_height < space)
           // center middle voice rest between the upper and lower voices
          centerRest(noteM, noteU, noteL);
        else {
          x_shift = voice_x_shift + 3;    // shift middle rest right
          noteM.note.setXShift(x_shift);
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
    if (noteM.isrest && noteU.isrest && noteM.min_line <= noteL.max_line)
      // Shift middle voice rest up
      shiftRestVertical(noteM, noteL, 1);
    if (noteM.isrest && noteL.isrest && noteU.min_line <= noteM.max_line)
      // Shift middle voice rest down
      shiftRestVertical(noteM, noteU, -1);
    if (noteU.isrest && noteU.min_line <= noteM.max_line)
      // shift upper voice rest up;
      shiftRestVertical(noteU, noteM, 1);
    if (noteL.isrest && noteM.min_line <= noteL.max_line)
      // shift lower voice rest down
      shiftRestVertical(noteL, noteM, -1);

    // If middle voice intersects upper or lower voice
    if ((!noteU.isrest && !noteM.isrest && noteU.min_line <= noteM.max_line + 0.5) ||
        (!noteM.isrest && !noteL.isrest && noteM.min_line <= noteL.max_line)) {
      x_shift = voice_x_shift + 3;      // shift middle note right
      noteM.note.setXShift(x_shift);
    }

    return true;
  }
  static formatByY(notes, state) {
    // NOTE: this function does not support more than two voices per stave
    //       use with care.
    let hasStave = true;
    let i;

    for (i = 0; i < notes.length; i++) {
      hasStave = hasStave && notes[i].getStave() != null;
    }

    if (!hasStave) throw new Vex.RERR('Stave Missing',
      'All notes must have a stave - Vex.Flow.ModifierContext.formatMultiVoice!');

    let x_shift = 0;

    for (i = 0; i < notes.length - 1; i++) {
      let top_note = notes[i];
      let bottom_note = notes[i + 1];

      if (top_note.getStemDirection() == StaveNote.STEM_DOWN) {
        top_note = notes[i + 1];
        bottom_note = notes[i];
      }

      const top_keys = top_note.getKeyProps();
      const bottom_keys = bottom_note.getKeyProps();

      const topY = top_note.getStave().getYForLine(top_keys[0].line);
      const bottomY = bottom_note.getStave().getYForLine(bottom_keys[bottom_keys.length - 1].line);

      const line_space = top_note.getStave().options.spacing_between_lines_px;
      if (Math.abs(topY - bottomY) == line_space / 2) {
        x_shift = top_note.getVoiceShiftWidth();
        bottom_note.setXShift(x_shift);
      }
    }

    state.right_shift += x_shift;
  }
  static postFormat(notes) {
    if (!notes) return false;

    notes.forEach(note => {
      note.postFormat();
    });

    return true;
  }

  constructor(note_struct) {
    super(note_struct);

    this.keys = note_struct.keys;
    this.clef = note_struct.clef;
    this.octave_shift = note_struct.octave_shift;
    this.beam = null;

    // Pull note rendering properties
    this.glyph = Flow.durationToGlyph(this.duration, this.noteType);
    if (!this.glyph) {
      throw new Vex.RuntimeError('BadArguments',
          `Invalid note initialization data (No glyph found): ${JSON.stringify(note_struct)}`);
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
    if (note_struct.auto_stem) {
      this.autoStem();
    } else {
      this.setStemDirection(note_struct.stem_direction);
    }

    this.buildNoteHeads();

    // Calculate left/right padding
    this.calcExtraPx();
  }

  getCategory() { return StaveNote.CATEGORY; }

  // Builds a `Stem` for the note
  buildStem() {
    const glyph = this.getGlyph();

    let y_extend = 0;
    if (glyph.code_head == 'v95' || glyph.code_head == 'v3e') {
      y_extend = -4;
    }

    const stem = new Stem({
      y_extend,
    });

    if (this.isRest()) {
      stem.hide = true;
    }

    this.setStem(stem);
  }

  // Builds a `NoteHead` for each key in the note
  buildNoteHeads() {
    const stem_direction = this.getStemDirection();

    const keys = this.getKeys();

    let last_line = null;
    let line_diff = null;
    let displaced = false;

    // Draw notes from bottom to top.
    let start_i = 0;
    let end_i = keys.length;
    let step_i = 1;

    // For down-stem notes, we draw from top to bottom.
    if (stem_direction === Stem.DOWN) {
      start_i = keys.length - 1;
      end_i = -1;
      step_i = -1;
    }

    for (let i = start_i; i != end_i; i += step_i) {
      const note_props = this.keyProps[i];

      const line = note_props.line;

      // Keep track of last line with a note head, so that consecutive heads
      // are correctly displaced.
      if (last_line === null) {
        last_line = line;
      } else {
        line_diff = Math.abs(last_line - line);
        if (line_diff === 0 || line_diff === 0.5) {
          displaced = !displaced;
        } else {
          displaced = false;
          this.use_default_head_x = true;
        }
      }
      last_line = line;

      const note_head = new NoteHead({
        duration: this.duration,
        note_type: this.noteType,
        displaced,
        stem_direction,
        custom_glyph_code: note_props.code,
        glyph_font_scale: this.render_options.glyph_font_scale,
        x_shift: note_props.shift_right,
        line: note_props.line,
      });

      this.note_heads[i] = note_head;
    }
  }

  // Automatically sets the stem direction based on the keys in the note
  autoStem() {
    let auto_stem_direction;

    // Figure out optimal stem direction based on given notes
    this.min_line = this.keyProps[0].line;
    this.max_line = this.keyProps[this.keyProps.length - 1].line;
    const decider = (this.min_line + this.max_line) / 2;

    if (decider < 3) {
      auto_stem_direction = 1;
    } else {
      auto_stem_direction = -1;
    }

    this.setStemDirection(auto_stem_direction);
  }

  // Calculates and stores the properties for each key in the note
  calculateKeyProps() {
    let last_line = null;
    for (let i = 0; i < this.keys.length; ++i) {
      const key = this.keys[i];

      // All rests use the same position on the line.
      // if (this.glyph.rest) key = this.glyph.position;
      if (this.glyph.rest) this.glyph.position = key;
      const options = { octave_shift: this.octave_shift || 0 };
      const props = Flow.keyProperties(key, this.clef, options);
      if (!props) {
        throw new Vex.RuntimeError('BadArguments',
            `Invalid key for note properties: ${key}`);
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
      if (last_line === null) {
        last_line = line;
      } else {
        if (Math.abs(last_line - line) == 0.5) {
          this.displaced = true;
          props.displaced = true;

          // Have to mark the previous note as
          // displaced as well, for modifier placement
          if (this.keyProps.length > 0) {
            this.keyProps[i - 1].displaced = true;
          }
        }
      }

      last_line = line;
      this.keyProps.push(props);
    }

    // Sort the notes from lowest line to highest line
    const sorted = true;
    let lastLine = -1000;
    const that = this;
    this.keyProps.forEach(key => {
      if (key.line < lastLine) {
        Vex.W('Unsorted keys in note will be sorted. ' +
          'See https://github.com/0xfe/vexflow/issues/104 for details.');
      }
      lastLine = key.line;
    });
    this.keyProps.sort((a, b) => a.line - b.line);
  }

  // Get the `BoundingBox` for the entire note
  getBoundingBox() {
    if (!this.preFormatted) throw new Vex.RERR('UnformattedNote',
        "Can't call getBoundingBox on an unformatted note.");

    const metrics = this.getMetrics();

    const w = metrics.width;
    const x = this.getAbsoluteX() - metrics.modLeftPx - metrics.extraLeftPx;

    let min_y = 0;
    let max_y = 0;
    const half_line_spacing = this.getStave().getSpacingBetweenLines() / 2;
    const line_spacing = half_line_spacing * 2;

    if (this.isRest()) {
      const y = this.ys[0];
      const frac = Flow.durationToFraction(this.duration);
      if (frac.equals(1) || frac.equals(2)) {
        min_y = y - half_line_spacing;
        max_y = y + half_line_spacing;
      } else {
        min_y = y - (this.glyph.line_above * line_spacing);
        max_y = y + (this.glyph.line_below * line_spacing);
      }
    } else if (this.glyph.stem) {
      const ys = this.getStemExtents();
      ys.baseY += half_line_spacing * this.stem_direction;
      min_y = Vex.Min(ys.topY, ys.baseY);
      max_y = Vex.Max(ys.topY, ys.baseY);
    } else {
      min_y = null;
      max_y = null;

      for (let i = 0; i < this.ys.length; ++i) {
        const yy = this.ys[i];
        if (i === 0) {
          min_y = yy;
          max_y = yy;
        } else {
          min_y = Vex.Min(yy, min_y);
          max_y = Vex.Max(yy, max_y);
        }
      }
      min_y -= half_line_spacing;
      max_y += half_line_spacing;
    }

    return new BoundingBox(x, min_y, w, max_y - min_y);
  }

  // Gets the line number of the top or bottom note in the chord.
  // If `is_top_note` is `true` then get the top note
  getLineNumber(is_top_note) {
    if (!this.keyProps.length) throw new Vex.RERR('NoKeyProps',
        "Can't get bottom note line, because note is not initialized properly.");
    let result_line = this.keyProps[0].line;

    // No precondition assumed for sortedness of keyProps array
    for (let i = 0; i < this.keyProps.length; i++) {
      const this_line = this.keyProps[i].line;
      if (is_top_note) {
        if (this_line > result_line) result_line = this_line;
      } else {
        if (this_line < result_line) result_line = this_line;
      }
    }

    return result_line;
  }

  // Determine if current note is a rest
  isRest() { return this.glyph.rest; }

  // Determine if the current note is a chord
  isChord() { return !this.isRest() && this.keys.length > 1; }

  // Determine if the `StaveNote` has a stem
  hasStem() { return this.glyph.stem; }

  // Get the `y` coordinate for text placed on the top/bottom of a
  // note at a desired `text_line`
  getYForTopText(text_line) {
    const extents = this.getStemExtents();
    return Vex.Min(this.stave.getYForTopText(text_line),
        extents.topY - (this.render_options.annotation_spacing * (text_line + 1)));
  }
  getYForBottomText(text_line) {
    const extents = this.getStemExtents();
    return Vex.Max(this.stave.getYForTopText(text_line),
        extents.baseY + (this.render_options.annotation_spacing * (text_line)));
  }

  // Sets the current note to the provided `stave`. This applies
  // `y` values to the `NoteHeads`.
  setStave(stave) {
    super.setStave(stave);

    const ys = this.note_heads.map(note_head => {
      note_head.setStave(stave);
      return note_head.getY();
    });

    this.setYs(ys);

    const bounds = this.getNoteHeadBounds();
    if (this.hasStem()) {
      this.stem.setYBounds(bounds.y_top, bounds.y_bottom);
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
    let rest_line = this.keyProps[0].line;
    if (this.keyProps.length > 1) {
      const last_line  = this.keyProps[this.keyProps.length - 1].line;
      const top = Vex.Max(rest_line, last_line);
      const bot = Vex.Min(rest_line, last_line);
      rest_line = Vex.MidLine(top, bot);
    }

    return rest_line;
  }

  // Get the default `x` and `y` coordinates for the provided `position`
  // and key `index`
  getModifierStartXY(position, index) {
    if (!this.preFormatted) throw new Vex.RERR('UnformattedNote',
        "Can't call GetModifierStartXY on an unformatted note");

    if (this.ys.length === 0) throw new Vex.RERR('NoYValues',
        'No Y-Values calculated for this note.');

    let x = 0;
    if (position == Modifier.Position.LEFT) {
      // extra_left_px
      x = -1 * 2;
    } else if (position == Modifier.Position.RIGHT) {
      // extra_right_px
      x = this.glyph.head_width + this.x_shift + 2;
    } else if (position == Modifier.Position.BELOW ||
               position == Modifier.Position.ABOVE) {
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
    for (let i = 0; i < this.keys.length; ++i)
      this.addDot(i);
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
    this.setExtraLeftPx((this.displaced && this.stem_direction == -1) ?
        this.glyph.head_width : 0);

    // For upstems with flags, the extra space is unnecessary, since it's taken
    // up by the flag.
    this.setExtraRightPx((!this.hasFlag() && this.displaced && this.stem_direction == 1) ?
        this.glyph.head_width : 0);
  }

  // Pre-render formatting
  preFormat() {
    if (this.preFormatted) return;
    if (this.modifierContext) this.modifierContext.preFormat();

    let width = this.glyph.head_width + this.extraLeftPx + this.extraRightPx;

    // For upward flagged notes, the width of the flag needs to be added
    if (this.glyph.flag && this.beam === null && this.stem_direction == 1) {
      width += this.glyph.head_width;
    }

    this.setWidth(width);
    this.setPreFormatted(true);
  }

  // Gets the staff line and y value for the highest and lowest noteheads
  getNoteHeadBounds() {
    // Top and bottom Y values for stem.
    let y_top = null;
    let y_bottom = null;

    let highest_line = this.stave.getNumLines();
    let lowest_line = 1;

    this.note_heads.forEach(note_head => {
      const line = note_head.getLine();
      const y = note_head.getY();

      if (y_top === null || y < y_top)  {
        y_top = y;
      }

      if (y_bottom === null || y > y_bottom) {
        y_bottom = y;
      }

      highest_line = line > highest_line ? line : highest_line;
      lowest_line = line < lowest_line ? line : lowest_line;
    }, this);

    return {
      y_top,
      y_bottom,
      highest_line,
      lowest_line,
    };
  }

  // Get the starting `x` coordinate for the noteheads
  getNoteHeadBeginX() {
    return this.getAbsoluteX() + this.x_shift;
  }

  // Get the ending `x` coordinate for the noteheads
  getNoteHeadEndX() {
    const x_begin = this.getNoteHeadBeginX();
    return x_begin + this.glyph.head_width - (Flow.STEM_WIDTH / 2);
  }

  // Draw the ledger lines between the stave and the highest/lowest keys
  drawLedgerLines() {
    if (this.isRest()) { return; }
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");
    const ctx = this.context;

    const bounds = this.getNoteHeadBounds();
    const highest_line = bounds.highest_line;
    const lowest_line = bounds.lowest_line;
    let head_x = this.note_heads[0].getAbsoluteX();

    const that = this;
    function stroke(y) {
      if (that.use_default_head_x === true)  {
        head_x = that.getAbsoluteX() + that.x_shift;
      }
      const x = head_x - that.render_options.stroke_px;
      const length = ((head_x + that.glyph.head_width) - head_x) +
        (that.render_options.stroke_px * 2);

      ctx.fillRect(x, y, length, 1);
    }

    let line; // iterator
    for (line = 6; line <= highest_line; ++line) {
      stroke(this.stave.getYForNote(line));
    }

    for (line = 0; line >= lowest_line; --line) {
      stroke(this.stave.getYForNote(line));
    }
  }

  // Draw all key modifiers
  drawModifiers() {
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");
    const ctx = this.context;
    ctx.openGroup('modifiers');
    for (let i = 0; i < this.modifiers.length; i++) {
      const mod = this.modifiers[i];
      const note_head = this.note_heads[mod.getIndex()];
      const key_style = note_head.getStyle();
      if (key_style) {
        ctx.save();
        note_head.applyStyle(ctx);
      }
      mod.setContext(ctx);
      mod.draw();
      if (key_style) {
        ctx.restore();
      }
    }
    ctx.closeGroup();
  }

  // Draw the flag for the note
  drawFlag() {
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");
    const ctx = this.context;
    const glyph = this.getGlyph();
    const render_flag = this.beam === null;
    const bounds = this.getNoteHeadBounds();

    const x_begin = this.getNoteHeadBeginX();
    const x_end = this.getNoteHeadEndX();

    if (glyph.flag && render_flag) {
      const note_stem_height = this.stem.getHeight();
      let flag_x, flag_y, flag_code;

      if (this.getStemDirection() === Stem.DOWN) {
        // Down stems have flags on the left.
        flag_x = x_begin + 1;
        flag_y = bounds.y_top - note_stem_height + 2;
        flag_code = glyph.code_flag_downstem;
      } else {
        // Up stems have flags on the left.
        flag_x = x_end + 1;
        flag_y = bounds.y_bottom - note_stem_height - 2;
        flag_code = glyph.code_flag_upstem;
      }

      // Draw the Flag
      this.context.openGroup('flag', null, { pointerBBox: true });
      Glyph.renderGlyph(ctx, flag_x, flag_y,
          this.render_options.glyph_font_scale, flag_code);
      this.context.closeGroup();
    }
  }

  // Draw the NoteHeads
  drawNoteHeads() {
    const that = this;
    this.note_heads.forEach(note_head => {
      that.context.openGroup('notehead', null, { pointerBBox: true });
      note_head.setContext(that.context).draw();
      that.context.closeGroup();
    }, this);
  }

  // Render the stem onto the canvas
  drawStem(stem_struct) {
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");

    if (stem_struct) {
      this.setStem(new Stem(stem_struct));
    }

    this.context.openGroup('stem', null, { pointerBBox: true });
    this.stem.setContext(this.context).draw();
    this.context.closeGroup();
  }

  // Draws all the `StaveNote` parts. This is the main drawing method.
  draw() {
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");
    if (!this.stave) throw new Vex.RERR('NoStave',
        "Can't draw without a stave.");
    if (this.ys.length === 0) throw new Vex.RERR('NoYValues',
        "Can't draw note without Y values.");

    const x_begin = this.getNoteHeadBeginX();
    const x_end = this.getNoteHeadEndX();

    const render_stem = this.hasStem() && !this.beam;

    // Format note head x positions
    this.note_heads.forEach(note_head => {
      note_head.setX(x_begin);
    }, this);

    // Format stem x positions
    this.stem.setNoteHeadXBounds(x_begin, x_end);

    L('Rendering ', this.isChord() ? 'chord :' : 'note :', this.keys);

    // Draw each part of the note
    this.drawLedgerLines();

    this.elem = this.context.openGroup('stavenote', this.id);
    this.context.openGroup('note', null, { pointerBBox: true });
    if (render_stem) this.drawStem();
    this.drawNoteHeads();
    this.drawFlag();
    this.context.closeGroup();
    this.drawModifiers();
    this.context.closeGroup();
  }
}
