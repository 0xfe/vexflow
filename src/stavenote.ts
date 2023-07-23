// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This file implements notes for standard notation. This consists of one or
// more `NoteHeads`, an optional stem, and an optional flag.
//
// Throughout these comments, a "note" refers to the entire `StaveNote`,
// and a "key" refers to a specific pitch/notehead within a note.
//
// See `tests/stavenote_tests.ts` for usage examples.

import { Beam } from './beam';
import { BoundingBox } from './boundingbox';
import { ElementStyle } from './element';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { KeyProps, Note, NoteStruct } from './note';
import { NoteHead } from './notehead';
import { Stave } from './stave';
import { Stem, StemOptions } from './stem';
import { StemmableNote } from './stemmablenote';
import { Tables } from './tables';
import { Category } from './typeguard';
import { defined, log, midLine, RuntimeError } from './util';

function showDeprecationWarningForNoteHeads(): void {
  // eslint-disable-next-line
  console.warn(
    'StaveNote.note_heads is deprecated. Use StaveNote.noteHeads instead.',
    'This accessor will be removed in VexFlow 5.0.'
  );
}

export interface StaveNoteHeadBounds {
  y_top: number;
  y_bottom: number;
  displaced_x?: number;
  non_displaced_x?: number;
  highest_line: number;
  lowest_line: number;
  highest_displaced_line?: number;
  lowest_displaced_line?: number;
  highest_non_displaced_line: number;
  lowest_non_displaced_line: number;
}

export interface StaveNoteFormatSettings {
  line: number;
  maxLine: number;
  minLine: number;
  isrest: boolean;
  stemDirection?: number;
  stemMax: number;
  stemMin: number;
  voice_shift: number;
  is_displaced: boolean;
  note: StaveNote;
}

export interface StaveNoteStruct extends NoteStruct {
  /** `Stem.UP` or `Stem.DOWN`. */
  stem_direction?: number;
  auto_stem?: boolean;
  stem_down_x_offset?: number;
  stem_up_x_offset?: number;
  stroke_px?: number;
  glyph_font_scale?: number;
  octave_shift?: number;
  clef?: string;
}

// To enable logging for this class. Set `Vex.Flow.StaveNote.DEBUG` to `true`.
// eslint-disable-next-line
function L(...args: any[]) {
  if (StaveNote.DEBUG) log('Vex.Flow.StaveNote', args);
}

const isInnerNoteIndex = (note: StaveNote, index: number) =>
  index === (note.getStemDirection() === Stem.UP ? note.keyProps.length - 1 : 0);

// Helper methods for rest positioning in ModifierContext.
function shiftRestVertical(rest: StaveNoteFormatSettings, note: StaveNoteFormatSettings, dir: number) {
  const delta = dir;

  rest.line += delta;
  rest.maxLine += delta;
  rest.minLine += delta;
  rest.note.setKeyLine(0, rest.note.getKeyLine(0) + delta);
}

// Called from formatNotes :: center a rest between two notes
function centerRest(rest: StaveNoteFormatSettings, noteU: StaveNoteFormatSettings, noteL: StaveNoteFormatSettings) {
  const delta = rest.line - midLine(noteU.minLine, noteL.maxLine);
  rest.note.setKeyLine(0, rest.note.getKeyLine(0) - delta);
  rest.line -= delta;
  rest.maxLine -= delta;
  rest.minLine -= delta;
}

export class StaveNote extends StemmableNote {
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.StaveNote;
  }

  /**
   * @deprecated Use Stem.UP.
   */
  static get STEM_UP(): number {
    return Stem.UP;
  }

  /**
   * @deprecated Use Stem.DOWN.
   */
  static get STEM_DOWN(): number {
    return Stem.DOWN;
  }

  static get LEDGER_LINE_OFFSET(): number {
    return 3;
  }

  static get minNoteheadPadding(): number {
    const musicFont = Tables.currentMusicFont();
    return musicFont.lookupMetric('noteHead.minPadding');
  }

  /** Format notes inside a ModifierContext. */
  static format(notes: StaveNote[], state: ModifierContextState): boolean {
    if (!notes || notes.length < 2) return false;

    const notesList: StaveNoteFormatSettings[] = [];

    for (let i = 0; i < notes.length; i++) {
      // Formatting uses sortedKeyProps to calculate line and minL.
      const props = notes[i].sortedKeyProps;
      const line = props[0].keyProps.line;
      let minL = props[props.length - 1].keyProps.line;
      const stemDirection = notes[i].getStemDirection();
      const stemMax = notes[i].getStemLength() / 10;
      const stemMin = notes[i].getStemMinimumLength() / 10;

      let maxL;
      if (notes[i].isRest()) {
        maxL = line + notes[i].glyphProps.line_above;
        minL = line - notes[i].glyphProps.line_below;
      } else {
        maxL =
          stemDirection === 1 ? props[props.length - 1].keyProps.line + stemMax : props[props.length - 1].keyProps.line;

        minL = stemDirection === 1 ? props[0].keyProps.line : props[0].keyProps.line - stemMax;
      }

      notesList.push({
        line: props[0].keyProps.line, // note/rest base line
        maxLine: maxL, // note/rest upper bounds line
        minLine: minL, // note/rest lower bounds line
        isrest: notes[i].isRest(),
        stemDirection: stemDirection,
        stemMax, // Maximum (default) note stem length;
        stemMin, // minimum note stem length
        voice_shift: notes[i].getVoiceShiftWidth(),
        is_displaced: notes[i].isDisplaced(), // note manually displaced
        note: notes[i],
      });
    }

    let voices = 0;
    let noteU = undefined;
    let noteM = undefined;
    let noteL = undefined;
    const draw = [false, false, false];

    for (let i = 0; i < notesList.length; i++) {
      draw[i] = notesList[i].note.render_options.draw == false ? false : true;
    }

    if (draw[0] && draw[1] && draw[2]) {
      // Three visible notes
      voices = 3;
      noteU = notesList[0];
      noteM = notesList[1];
      noteL = notesList[2];
    } else if (draw[0] && draw[1]) {
      // Two visible notes, 0 & 1
      voices = 2;
      noteU = notesList[0];
      noteL = notesList[1];
    } else if (draw[0] && draw[2]) {
      // Two visible notes, 0 & 2
      voices = 2;
      noteU = notesList[0];
      noteL = notesList[2];
    } else if (draw[1] && draw[2]) {
      // Two visible notes, 1 & 2
      voices = 2;
      noteU = notesList[1];
      noteL = notesList[2];
    } else {
      // No shift required for less than 2 visible notes
      return true;
    }

    // for two voice backward compatibility, ensure upper voice is stems up
    // for three voices, the voices must be in order (upper, middle, lower)
    if (voices === 2 && noteU.stemDirection === -1 && noteL.stemDirection === 1) {
      noteU = notesList[1];
      noteL = notesList[0];
    }

    const voiceXShift = Math.max(noteU.voice_shift, noteL.voice_shift);
    let xShift = 0;

    // Test for two voice note intersection
    if (voices === 2) {
      const lineSpacing =
        noteU.note.hasStem() && noteL.note.hasStem() && noteU.stemDirection === noteL.stemDirection ? 0.0 : 0.5;
      if (noteL.isrest && noteU.isrest && noteU.note.duration === noteL.note.duration) {
        noteL.note.render_options.draw = false;
      } else if (noteU.minLine <= noteL.maxLine + lineSpacing) {
        if (noteU.isrest) {
          // shift rest up
          shiftRestVertical(noteU, noteL, 1);
        } else if (noteL.isrest) {
          // shift rest down
          shiftRestVertical(noteL, noteU, -1);
        } else {
          //Instead of shifting notes, remove the appropriate flag
          //If we are sharing a line, switch one notes stem direction.
          //If we are sharing a line and in the same voice, only then offset one note
          const lineDiff = Math.abs(noteU.line - noteL.line);
          if (noteU.note.hasStem() && noteL.note.hasStem()) {
            const noteUHead = Tables.codeNoteHead(
              noteU.note.sortedKeyProps[0].keyProps.code ?? 'N',
              noteU.note.duration
            );
            const noteLHead = Tables.codeNoteHead(
              noteL.note.sortedKeyProps[noteL.note.sortedKeyProps.length - 1].keyProps.code ?? 'N',
              noteL.note.duration
            );
            if (
              // If unison is not configured, shift
              !Tables.UNISON ||
              // If we have different noteheads, shift
              noteUHead !== noteLHead ||
              // If we have different dot values, shift
              noteU.note.getModifiers().filter((item) => item.getCategory() === Category.Dot && item.getIndex() === 0)
                .length !==
                noteL.note.getModifiers().filter((item) => item.getCategory() === Category.Dot && item.getIndex() === 0)
                  .length ||
              // If the notes are quite close but not on the same line, shift
              (lineDiff < 1 && lineDiff > 0) ||
              // If styles are different, shift
              JSON.stringify(noteU.note.getStyle()) !== JSON.stringify(noteL.note.getStyle())
            ) {
              xShift = voiceXShift + 2;
              if (noteU.stemDirection === noteL.stemDirection) {
                // upper voice is middle voice, so shift it right
                noteU.note.setXShift(xShift);
              } else {
                // shift lower voice right
                noteL.note.setXShift(xShift);
              }
            } else if (noteU.note.voice !== noteL.note.voice) {
              //If we are not in the same voice
              if (noteU.stemDirection === noteL.stemDirection) {
                if (noteU.line != noteL.line) {
                  xShift = voiceXShift + 2;
                  noteU.note.setXShift(xShift);
                } else {
                  //same line, swap stem direction for one note
                  if (noteL.stemDirection === 1) {
                    noteL.stemDirection = -1;
                    noteL.note.setStemDirection(-1);
                  }
                }
              }
            } //Very close whole notes
          } else if (lineDiff < 1) {
            xShift = voiceXShift + 2;
            if (noteU.note.duration < noteL.note.duration) {
              // upper voice is shorter, so shift it right
              noteU.note.setXShift(xShift);
            } else {
              // shift lower voice right
              noteL.note.setXShift(xShift);
            }
          } else if (noteU.note.hasStem()) {
            noteU.stemDirection = -noteU.note.getStemDirection();
            noteU.note.setStemDirection(noteU.stemDirection);
          } else if (noteL.note.hasStem()) {
            noteL.stemDirection = -noteL.note.getStemDirection();
            noteL.note.setStemDirection(noteL.stemDirection);
          }
        }
      }

      // format complete
      state.right_shift += xShift;
      return true;
    }

    if (!noteM) throw new RuntimeError('InvalidState', 'noteM not defined.');

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
          xShift = voiceXShift + 2; // shift middle rest right
          noteM.note.setXShift(xShift);
          if (noteL.note.hasBeam() === false) {
            noteL.stemDirection = -1;
            noteL.note.setStemDirection(-1);
          }
          if (noteU.minLine <= noteL.maxLine && noteU.note.hasBeam() === false) {
            noteU.stemDirection = 1;
            noteU.note.setStemDirection(1);
          }
        }
        // format complete
        state.right_shift += xShift;
        return true;
      }
    }

    // Special case 2 :: all voices are rests
    if (noteU.isrest && noteM.isrest && noteL.isrest) {
      // Hide upper voice rest
      noteU.note.render_options.draw = false;
      // Hide lower voice rest
      noteL.note.render_options.draw = false;
      // format complete
      state.right_shift += xShift;
      return true;
    }

    // Test if any other rests can be repositioned
    if (noteM.isrest && noteU.isrest && noteM.minLine <= noteL.maxLine) {
      // Hide middle voice rest
      noteM.note.render_options.draw = false;
    }
    if (noteM.isrest && noteL.isrest && noteU.minLine <= noteM.maxLine) {
      // Hide middle voice rest
      noteM.note.render_options.draw = false;
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
    if (noteU.minLine <= noteM.maxLine + 0.5 || noteM.minLine <= noteL.maxLine) {
      // shift middle note right
      xShift = voiceXShift + 2;
      noteM.note.setXShift(xShift);
      if (noteL.note.hasBeam() === false) {
        noteL.stemDirection = -1;
        noteL.note.setStemDirection(-1);
      }
      if (noteU.minLine <= noteL.maxLine && noteU.note.hasBeam() === false) {
        noteU.stemDirection = 1;
        noteU.note.setStemDirection(1);
      }
    }

    state.right_shift += xShift;
    return true;
  }

  static postFormat(notes: Note[]): boolean {
    if (!notes) return false;

    notes.forEach((note) => note.postFormat());

    return true;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // INSTANCE MEMBERS

  minLine: number = 0;
  maxLine: number = 0;

  protected readonly clef: string;
  protected readonly octave_shift?: number;

  protected displaced: boolean;
  protected dot_shiftY: number;
  protected use_default_head_x: boolean;
  protected ledgerLineStyle: ElementStyle;
  private _noteHeads: NoteHead[];
  // Sorted variant of keyProps used internally
  private sortedKeyProps: { keyProps: KeyProps; index: number }[] = [];

  constructor(noteStruct: StaveNoteStruct) {
    super(noteStruct);

    this.ledgerLineStyle = {};

    this.clef = noteStruct.clef ?? 'treble';
    this.octave_shift = noteStruct.octave_shift ?? 0;

    // Pull note rendering properties.
    this.glyphProps = Tables.getGlyphProps(this.duration, this.noteType);
    defined(
      this.glyphProps,
      'BadArguments',
      `No glyph found for duration '${this.duration}' and type '${this.noteType}'`
    );

    // if true, displace note to right
    this.displaced = false;
    this.dot_shiftY = 0;
    // for displaced ledger lines
    this.use_default_head_x = false;

    // Drawing
    this._noteHeads = [];
    this.modifiers = [];

    this.render_options = {
      ...this.render_options,
      // font size for note heads and rests
      glyph_font_scale: noteStruct.glyph_font_scale || Tables.NOTATION_FONT_SCALE,
      // number of stroke px to the left and right of head
      stroke_px: noteStruct.stroke_px || StaveNote.LEDGER_LINE_OFFSET,
    };

    this.calculateKeyProps();
    this.buildStem();

    // Set the stem direction
    if (noteStruct.auto_stem) {
      this.autoStem();
    } else {
      this.setStemDirection(noteStruct.stem_direction ?? Stem.UP);
    }
    this.reset();
    this.buildFlag();
  }

  reset(): this {
    super.reset();

    // Save prior noteHead styles & reapply them after making new noteheads.
    const noteHeadStyles = this._noteHeads.map((noteHead) => noteHead.getStyle());
    this.buildNoteHeads();
    this._noteHeads.forEach((noteHead, index) => {
      const noteHeadStyle = noteHeadStyles[index];
      if (noteHeadStyle) noteHead.setStyle(noteHeadStyle);
    });

    const stave = this.stave;
    if (stave) {
      this.setStave(stave);
    }
    this.calcNoteDisplacements();
    return this;
  }

  setBeam(beam: Beam): this {
    this.beam = beam;
    this.calcNoteDisplacements();
    // Update stem extension if a beam is assigned.
    if (this.stem) {
      this.stem.setExtension(this.getStemExtension());
    }
    return this;
  }

  // Builds a `Stem` for the note
  buildStem(): this {
    this.setStem(new Stem({ hide: !!this.isRest() }));
    return this;
  }

  // Builds a `NoteHead` for each key in the note
  buildNoteHeads(): NoteHead[] {
    this._noteHeads = [];
    const stemDirection = this.getStemDirection();
    const keys = this.getKeys();

    let lastLine = undefined;
    let lineDiff = undefined;
    let displaced = false;

    // Draw notes from bottom to top.

    // For down-stem notes, we draw from top to bottom.
    let start: number;
    let end: number;
    let step: number;
    if (stemDirection === Stem.UP) {
      start = 0;
      end = keys.length;
      step = 1;
    } else {
      start = keys.length - 1;
      end = -1;
      step = -1;
    }

    for (let i = start; i !== end; i += step) {
      // Building noteheads rely on sortedKeNotes in order to calculate the displacements
      const noteProps = this.sortedKeyProps[i].keyProps;
      const line = noteProps.line;

      // Keep track of last line with a note head, so that consecutive heads
      // are correctly displaced.
      if (lastLine === undefined) {
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
        stem_up_x_offset: noteProps.stem_up_x_offset,
        stem_down_x_offset: noteProps.stem_down_x_offset,
        line: noteProps.line,
      });

      this.addChildElement(notehead);
      this._noteHeads[this.sortedKeyProps[i].index] = notehead;
    }
    return this._noteHeads;
  }

  // Automatically sets the stem direction based on the keys in the note
  autoStem(): void {
    this.setStemDirection(this.calculateOptimalStemDirection());
  }

  calculateOptimalStemDirection(): number {
    // Figure out optimal stem direction based on given notes
    // minLine & maxLine rely on sortedKeyProps
    this.minLine = this.sortedKeyProps[0].keyProps.line;
    this.maxLine = this.sortedKeyProps[this.keyProps.length - 1].keyProps.line;

    const MIDDLE_LINE = 3;
    const decider = (this.minLine + this.maxLine) / 2;
    const stemDirection = decider < MIDDLE_LINE ? Stem.UP : Stem.DOWN;

    return stemDirection;
  }

  // Calculates and stores the properties for each key in the note
  calculateKeyProps(): void {
    let lastLine: number | undefined;
    for (let i = 0; i < this.keys.length; ++i) {
      const key = this.keys[i];

      // All rests use the same position on the line.
      // if (this.glyph.rest) key = this.glyph.position;
      if (this.glyphProps.rest) this.glyphProps.position = key;

      const options = { octave_shift: this.octave_shift || 0, duration: this.duration };
      const props = Tables.keyProperties(key, this.clef, options);

      if (!props) {
        throw new RuntimeError('BadArguments', `Invalid key for note properties: ${key}`);
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
      if (lastLine == undefined) {
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
    // Sort the notes from lowest line to highest line in sortedKeyProps
    // Warn no longer required as keyProps remains unsorted
    this.keyProps.forEach((keyProps, index) => {
      this.sortedKeyProps.push({ keyProps, index });
    });
    this.sortedKeyProps.sort((a, b) => a.keyProps.line - b.keyProps.line);
  }

  // Get the `BoundingBox` for the entire note
  getBoundingBox(): BoundingBox {
    if (!this.preFormatted) {
      throw new RuntimeError('UnformattedNote', "Can't call getBoundingBox on an unformatted note.");
    }

    const { width: w, modLeftPx, leftDisplacedHeadPx } = this.getMetrics();
    const x = this.getAbsoluteX() - modLeftPx - leftDisplacedHeadPx;

    let minY: number = 0;
    let maxY: number = 0;
    const halfLineSpacing = (this.getStave()?.getSpacingBetweenLines() ?? 0) / 2;
    const lineSpacing = halfLineSpacing * 2;

    if (this.isRest()) {
      const y = this.ys[0];
      const frac = Tables.durationToFraction(this.duration);
      if (frac.equals(1) || frac.equals(2)) {
        minY = y - halfLineSpacing;
        maxY = y + halfLineSpacing;
      } else {
        minY = y - this.glyphProps.line_above * lineSpacing;
        maxY = y + this.glyphProps.line_below * lineSpacing;
      }
    } else if (this.glyphProps.stem) {
      const ys = this.getStemExtents();
      ys.baseY += halfLineSpacing * this.getStemDirection();
      minY = Math.min(ys.topY, ys.baseY);
      maxY = Math.max(ys.topY, ys.baseY);
    } else {
      minY = 0;
      maxY = 0;

      for (let i = 0; i < this.ys.length; ++i) {
        const yy = this.ys[i];
        if (i === 0) {
          minY = yy;
          maxY = yy;
        } else {
          minY = Math.min(yy, minY);
          maxY = Math.max(yy, maxY);
        }
      }
      minY -= halfLineSpacing;
      maxY += halfLineSpacing;
    }

    return new BoundingBox(x, minY, w, maxY - minY);
  }

  // Gets the line number of the bottom note in the chord.
  // If `isTopNote` is `true` then get the top note's line number instead
  getLineNumber(isTopNote?: boolean): number {
    if (!this.keyProps.length) {
      throw new RuntimeError('NoKeyProps', "Can't get bottom note line, because note is not initialized properly.");
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

  /**
   * @returns true if this note is a type of rest. Rests don't have pitches, but take up space in the score.
   */
  isRest(): boolean {
    return this.glyphProps.rest;
  }

  // Determine if the current note is a chord
  isChord(): boolean {
    return !this.isRest() && this.keys.length > 1;
  }

  // Determine if the `StaveNote` has a stem
  hasStem(): boolean {
    return this.glyphProps.stem;
  }

  hasFlag(): boolean {
    return super.hasFlag() && !this.isRest();
  }

  getStemX(): number {
    if (this.noteType === 'r') {
      return this.getCenterGlyphX();
    } else {
      // We adjust the origin of the stem because we want the stem left-aligned
      // with the notehead if stemmed-down, and right-aligned if stemmed-up
      return super.getStemX() + (this.stem_direction ? Stem.WIDTH / (2 * -this.stem_direction) : 0);
    }
  }

  // Get the `y` coordinate for text placed on the top/bottom of a
  // note at a desired `text_line`
  getYForTopText(textLine: number): number {
    const extents = this.getStemExtents();
    return Math.min(
      this.checkStave().getYForTopText(textLine),
      extents.topY - this.render_options.annotation_spacing * (textLine + 1)
    );
  }
  getYForBottomText(textLine: number): number {
    const extents = this.getStemExtents();
    return Math.max(
      this.checkStave().getYForTopText(textLine),
      extents.baseY + this.render_options.annotation_spacing * textLine
    );
  }

  // Sets the current note to the provided `stave`. This applies
  // `y` values to the `NoteHeads`.
  setStave(stave: Stave): this {
    super.setStave(stave);

    const ys = this._noteHeads.map((notehead) => {
      notehead.setStave(stave);
      return notehead.getY();
    });

    this.setYs(ys);

    if (this.stem) {
      const { y_top, y_bottom } = this.getNoteHeadBounds();
      this.stem.setYBounds(y_top, y_bottom);
    }

    return this;
  }

  // Check if note is shifted to the right
  isDisplaced(): boolean {
    return this.displaced;
  }

  // Sets whether shift note to the right. `displaced` is a `boolean`
  setNoteDisplaced(displaced: boolean): this {
    this.displaced = displaced;
    return this;
  }

  // Get the starting `x` coordinate for a `StaveTie`
  getTieRightX(): number {
    let tieStartX = this.getAbsoluteX();
    tieStartX += this.getGlyphWidth() + this.x_shift + this.rightDisplacedHeadPx;
    if (this.modifierContext) tieStartX += this.modifierContext.getRightShift();
    return tieStartX;
  }

  // Get the ending `x` coordinate for a `StaveTie`
  getTieLeftX(): number {
    let tieEndX = this.getAbsoluteX();
    tieEndX += this.x_shift - this.leftDisplacedHeadPx;
    return tieEndX;
  }

  // Get the stave line on which to place a rest
  getLineForRest(): number {
    let restLine = this.keyProps[0].line;
    if (this.keyProps.length > 1) {
      const lastLine = this.keyProps[this.keyProps.length - 1].line;
      const top = Math.max(restLine, lastLine);
      const bot = Math.min(restLine, lastLine);
      restLine = midLine(top, bot);
    }

    return restLine;
  }

  // Get the default `x` and `y` coordinates for the provided `position`
  // and key `index`
  getModifierStartXY(
    position: number,
    index: number,
    options: { forceFlagRight?: boolean } = {}
  ): { x: number; y: number } {
    if (!this.preFormatted) {
      throw new RuntimeError('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
    }

    if (this.ys.length === 0) {
      throw new RuntimeError('NoYValues', 'No Y-Values calculated for this note.');
    }

    const { ABOVE, BELOW, LEFT, RIGHT } = Modifier.Position;
    let x = 0;
    if (position === LEFT) {
      // FIXME: Left modifier padding, move to font file
      x = -1 * 2;
    } else if (position === RIGHT) {
      // FIXME: Right modifier padding, move to font file
      x = this.getGlyphWidth() + this.x_shift + 2;

      if (
        this.stem_direction === Stem.UP &&
        this.hasFlag() &&
        (options.forceFlagRight || isInnerNoteIndex(this, index))
      ) {
        x += this?.flag?.getMetrics().width ?? 0;
      }
    } else if (position === BELOW || position === ABOVE) {
      x = this.getGlyphWidth() / 2;
    }

    return {
      x: this.getAbsoluteX() + x,
      y: this.ys[index],
    };
  }

  // Sets the style of the complete StaveNote, including all keys
  // and the stem.
  setStyle(style: ElementStyle): this {
    return super.setGroupStyle(style);
  }

  setStemStyle(style: ElementStyle): this {
    const stem = this.getStem();
    if (stem) stem.setStyle(style);
    return this;
  }
  getStemStyle(): ElementStyle | undefined {
    return this.stem?.getStyle();
  }

  setLedgerLineStyle(style: ElementStyle): void {
    this.ledgerLineStyle = style;
  }

  getLedgerLineStyle(): ElementStyle {
    return this.ledgerLineStyle;
  }

  setFlagStyle(style: ElementStyle): void {
    this.flag?.setStyle(style);
  }
  getFlagStyle(): ElementStyle | undefined {
    return this.flag?.getStyle();
  }

  // Sets the notehead at `index` to the provided coloring `style`.
  //
  // `style` is an `object` with the following properties: `shadowColor`,
  // `shadowBlur`, `fillStyle`, `strokeStyle`
  setKeyStyle(index: number, style: ElementStyle): this {
    this._noteHeads[index].setStyle(style);
    return this;
  }

  setKeyLine(index: number, line: number): this {
    this.keyProps[index].line = line;
    this.reset();
    return this;
  }

  getKeyLine(index: number): number {
    return this.keyProps[index].line;
  }

  // Get the width of the note if it is displaced. Used for `Voice`
  // formatting
  getVoiceShiftWidth(): number {
    // TODO: may need to accommodate for dot here.
    return this.getGlyphWidth() * (this.displaced ? 2 : 1);
  }

  // Calculates and sets the extra pixels to the left or right
  // if the note is displaced.
  calcNoteDisplacements(): void {
    this.setLeftDisplacedHeadPx(this.displaced && this.stem_direction === Stem.DOWN ? this.getGlyphWidth() : 0);

    // For upstems with flags, the extra space is unnecessary, since it's taken
    // up by the flag.
    this.setRightDisplacedHeadPx(
      !this.hasFlag() && this.displaced && this.stem_direction === Stem.UP ? this.getGlyphWidth() : 0
    );
  }

  // Pre-render formatting
  preFormat(): void {
    if (this.preFormatted) return;

    let noteHeadPadding = 0;
    if (this.modifierContext) {
      this.modifierContext.preFormat();
      // If there are no modifiers on this note, make sure there is adequate padding
      // between the notes.
      if (this.modifierContext.getWidth() === 0) {
        noteHeadPadding = StaveNote.minNoteheadPadding;
      }
    }

    let width = this.getGlyphWidth() + this.leftDisplacedHeadPx + this.rightDisplacedHeadPx + noteHeadPadding;

    // For upward flagged notes, the width of the flag needs to be added
    if (this.shouldDrawFlag() && this.stem_direction === Stem.UP) {
      width += this.getGlyphWidth();
      // TODO: Add flag width as a separate metric
    }

    this.setWidth(width);
    this.preFormatted = true;
  }

  /**
   * @typedef {Object} noteHeadBounds
   * @property {number} y_top the highest notehead bound
   * @property {number} y_bottom the lowest notehead bound
   * @property {number|Null} displaced_x the starting x for displaced noteheads
   * @property {number|Null} non_displaced_x the starting x for non-displaced noteheads
   * @property {number} highest_line the highest notehead line in traditional music line
   *  numbering (bottom line = 1, top line = 5)
   * @property {number} lowest_line the lowest notehead line
   * @property {number|false} highest_displaced_line the highest staff line number
   *   for a displaced notehead
   * @property {number|false} lowest_displaced_line
   * @property {number} highest_non_displaced_line
   * @property {number} lowest_non_displaced_line
   */

  /**
   * Get the staff line and y value for the highest & lowest noteheads
   * @returns {noteHeadBounds}
   */
  getNoteHeadBounds(): StaveNoteHeadBounds {
    // Top and bottom Y values for stem.
    let yTop: number = +Infinity;
    let yBottom: number = -Infinity;
    let nonDisplacedX: number | undefined;
    let displacedX: number | undefined;

    let highestLine = this.checkStave().getNumLines();
    let lowestLine = 1;
    let highestDisplacedLine: number | undefined;
    let lowestDisplacedLine: number | undefined;
    let highestNonDisplacedLine = highestLine;
    let lowestNonDisplacedLine = lowestLine;

    this._noteHeads.forEach((notehead) => {
      const line: number = notehead.getLine();
      const y = notehead.getY();

      yTop = Math.min(y, yTop);
      yBottom = Math.max(y, yBottom);

      if (displacedX === undefined && notehead.isDisplaced()) {
        displacedX = notehead.getAbsoluteX();
      }

      if (nonDisplacedX === undefined && !notehead.isDisplaced()) {
        nonDisplacedX = notehead.getAbsoluteX();
      }

      highestLine = Math.max(line, highestLine);
      lowestLine = Math.min(line, lowestLine);

      if (notehead.isDisplaced()) {
        highestDisplacedLine = highestDisplacedLine === undefined ? line : Math.max(line, highestDisplacedLine);
        lowestDisplacedLine = lowestDisplacedLine === undefined ? line : Math.min(line, lowestDisplacedLine);
      } else {
        highestNonDisplacedLine = Math.max(line, highestNonDisplacedLine);
        lowestNonDisplacedLine = Math.min(line, lowestNonDisplacedLine);
      }
    }, this);

    return {
      y_top: yTop,
      y_bottom: yBottom,
      displaced_x: displacedX,
      non_displaced_x: nonDisplacedX,
      highest_line: highestLine,
      lowest_line: lowestLine,
      highest_displaced_line: highestDisplacedLine,
      lowest_displaced_line: lowestDisplacedLine,
      highest_non_displaced_line: highestNonDisplacedLine,
      lowest_non_displaced_line: lowestNonDisplacedLine,
    };
  }

  // Get the starting `x` coordinate for the noteheads
  getNoteHeadBeginX(): number {
    return this.getAbsoluteX() + this.x_shift;
  }

  // Get the ending `x` coordinate for the noteheads
  getNoteHeadEndX(): number {
    const xBegin = this.getNoteHeadBeginX();
    return xBegin + this.getGlyphWidth();
  }

  get noteHeads(): NoteHead[] {
    return this._noteHeads.slice();
  }

  /** @deprecated use StaveNote.noteHeads instead. */
  get note_heads(): NoteHead[] {
    showDeprecationWarningForNoteHeads();
    return this.noteHeads;
  }

  // Draw the ledger lines between the stave and the highest/lowest keys
  drawLedgerLines(): void {
    const stave = this.checkStave();
    const {
      glyphProps,
      render_options: { stroke_px },
    } = this;
    const ctx = this.checkContext();
    const width = glyphProps.getWidth() + stroke_px * 2;
    const doubleWidth = 2 * (glyphProps.getWidth() + stroke_px) - Stem.WIDTH / 2;

    if (this.isRest()) return;
    if (!ctx) {
      throw new RuntimeError('NoCanvasContext', "Can't draw without a canvas context.");
    }

    const {
      highest_line,
      lowest_line,
      highest_displaced_line,
      highest_non_displaced_line,
      lowest_displaced_line,
      lowest_non_displaced_line,
      displaced_x,
      non_displaced_x,
    } = this.getNoteHeadBounds();

    // Early out if there are no ledger lines to draw.
    if (highest_line < 6 && lowest_line > 0) return;

    const min_x = Math.min(displaced_x ?? 0, non_displaced_x ?? 0);

    const drawLedgerLine = (y: number, normal: boolean, displaced: boolean) => {
      let x;
      if (displaced && normal) x = min_x - stroke_px;
      else if (normal) x = (non_displaced_x ?? 0) - stroke_px;
      else x = (displaced_x ?? 0) - stroke_px;
      const ledgerWidth = normal && displaced ? doubleWidth : width;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + ledgerWidth, y);
      ctx.stroke();
    };

    const style = { ...stave.getDefaultLedgerLineStyle(), ...this.getLedgerLineStyle() };
    this.applyStyle(ctx, style);

    // Draw ledger lines below the staff:
    for (let line = 6; line <= highest_line; ++line) {
      const normal = non_displaced_x !== undefined && line <= highest_non_displaced_line;
      const displaced = highest_displaced_line !== undefined && line <= highest_displaced_line;
      drawLedgerLine(stave.getYForNote(line), normal, displaced);
    }

    // Draw ledger lines above the staff:
    for (let line = 0; line >= lowest_line; --line) {
      const normal = non_displaced_x !== undefined && line >= lowest_non_displaced_line;
      const displaced = lowest_displaced_line !== undefined && line >= lowest_displaced_line;
      drawLedgerLine(stave.getYForNote(line), normal, displaced);
    }

    this.restoreStyle(ctx, style);
  }

  // Draw all key modifiers
  drawModifiers(noteheadParam: NoteHead): void {
    const ctx = this.checkContext();
    for (let i = 0; i < this.modifiers.length; i++) {
      const modifier = this.modifiers[i];
      const index = modifier.checkIndex();
      const notehead = this._noteHeads[index];
      if (notehead == noteheadParam) {
        const noteheadStyle = notehead.getStyle();
        notehead.applyStyle(ctx, noteheadStyle);
        modifier.setContext(ctx);
        modifier.drawWithStyle();
        notehead.restoreStyle(ctx, noteheadStyle);
      }
    }
  }

  shouldDrawFlag(): boolean {
    const hasStem = this.stem !== undefined;
    const hasFlag = this.glyphProps.flag == true;
    const hasNoBeam = this.beam === undefined;
    return hasStem && hasFlag && hasNoBeam;
  }

  // Draw the flag for the note
  drawFlag(): void {
    const ctx = this.checkContext();
    if (!ctx) {
      throw new RuntimeError('NoCanvasContext', "Can't draw without a canvas context.");
    }

    if (this.shouldDrawFlag()) {
      const { y_top, y_bottom } = this.getNoteHeadBounds();
      // eslint-disable-next-line
      const noteStemHeight = this.stem!.getHeight();
      const flagX = this.getStemX();
      // What's with the magic +/- 2
      // ANSWER: a corner of the note stem pokes out beyond the tip of the flag.
      // The extra +/- 2 pushes the flag glyph outward so it covers the stem entirely.
      // Alternatively, we could shorten the stem.
      const flagY =
        this.getStemDirection() === Stem.DOWN
          ? // Down stems are below the note head and have flags on the right.
            y_top -
            noteStemHeight +
            2 -
            (this.glyphProps ? this.glyphProps.stem_down_extension : 0) * this.getStaveNoteScale() -
            (this.flag?.getMetrics().y_shift ?? 0) * (1 - this.getStaveNoteScale())
          : // Up stems are above the note head and have flags on the right.
            y_bottom -
            noteStemHeight -
            2 +
            (this.glyphProps ? this.glyphProps.stem_up_extension : 0) * this.getStaveNoteScale() -
            (this.flag?.getMetrics().y_shift ?? 0) * (1 - this.getStaveNoteScale());

      // Draw the Flag
      this.flag?.render(ctx, flagX, flagY);
    }
  }

  // Draw the NoteHeads
  drawNoteHeads(): void {
    const ctx = this.checkContext();
    this._noteHeads.forEach((notehead) => {
      notehead.applyStyle(ctx);
      ctx.openGroup('notehead', notehead.getAttribute('id'), { pointerBBox: true });
      notehead.setContext(ctx).draw();
      this.drawModifiers(notehead);
      ctx.closeGroup();
      notehead.restoreStyle(ctx);
    });
  }

  drawStem(stemOptions?: StemOptions): void {
    // GCR TODO: I can't find any context in which this is called with the stemStruct
    // argument in the codebase or tests. Nor can I find a case where super.drawStem
    // is called at all. Perhaps these should be removed?
    const ctx = this.checkContext();

    if (stemOptions) {
      this.setStem(new Stem(stemOptions));
    }

    // If we will render a flag, we shorten the stem so that the tip
    // does not poke through the flag.
    if (this.shouldDrawFlag() && this.stem) {
      this.stem.adjustHeightForFlag();
    }

    if (this.stem) {
      this.stem.setContext(ctx).draw();
    }
  }

  /** Primarily used as the scaling factor for grace notes, GraceNote will return the required scale. */
  getStaveNoteScale(): number {
    return 1.0;
  }

  /**
   * Override stemmablenote stem extension to adjust for distance from middle line.
   */
  getStemExtension(): number {
    const super_stem_extension = super.getStemExtension();
    if (!this.glyphProps.stem) {
      return super_stem_extension;
    }

    const stem_direction = this.getStemDirection();
    if (stem_direction !== this.calculateOptimalStemDirection()) {
      return super_stem_extension; // no adjustment for manually set stem direction.
    }
    let mid_line_distance;
    const MIDDLE_LINE = 3;
    if (stem_direction === Stem.UP) {
      // Note that the use of maxLine here instead of minLine might
      // seem counterintuitive, but in the case of (say) treble clef
      // chord(F2, E4) stem up, we do not want to extend the stem because
      // of F2, when a normal octave-length stem above E4 is fine.
      //
      // maxLine and minLine are set in calculateOptimalStemDirection() so
      // will be known.
      mid_line_distance = MIDDLE_LINE - this.maxLine;
    } else {
      mid_line_distance = this.minLine - MIDDLE_LINE;
    }

    // how many lines more than an octave is the relevant notehead?
    const lines_over_octave_from_mid_line = mid_line_distance - 3.5;
    if (lines_over_octave_from_mid_line <= 0) {
      return super_stem_extension;
    }
    const stave = this.getStave();
    let spacing_between_lines = 10;
    if (stave != undefined) {
      spacing_between_lines = stave.getSpacingBetweenLines();
    }
    return super_stem_extension + lines_over_octave_from_mid_line * spacing_between_lines;
  }

  // Draws all the `StaveNote` parts. This is the main drawing method.
  draw(): void {
    if (this.render_options.draw === false) return;

    if (this.ys.length === 0) {
      throw new RuntimeError('NoYValues', "Can't draw note without Y values.");
    }

    const ctx = this.checkContext();
    const xBegin = this.getNoteHeadBeginX();
    const shouldRenderStem = this.hasStem() && !this.beam;

    // Format note head x positions
    this._noteHeads.forEach((notehead) => notehead.setX(xBegin));

    if (this.stem) {
      // Format stem x positions
      const stemX = this.getStemX();
      this.stem.setNoteHeadXBounds(stemX, stemX);
    }

    L('Rendering ', this.isChord() ? 'chord :' : 'note :', this.keys);

    // Apply the overall style -- may be contradicted by local settings:
    this.applyStyle();
    ctx.openGroup('stavenote', this.getAttribute('id'));
    this.drawLedgerLines();
    if (shouldRenderStem) this.drawStem();
    this.drawNoteHeads();
    this.drawFlag();
    ctx.closeGroup();
    this.restoreStyle();
    this.setRendered();
  }
}
