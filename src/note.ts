// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements an abstract interface for notes and chords that
// are rendered on a stave. Notes have some common properties: All of them
// have a value (e.g., pitch, fret, etc.) and a duration (quarter, half, etc.)
//
// Some notes have stems, heads, dots, etc. Most notational elements that
// surround a note are called *modifiers*, and every note has an associated
// array of them. All notes also have a rendering context and belong to a stave.

import {Vex} from './vex';
import {Flow} from './tables';
import {Tickable} from './tickable';
import {Stave} from "./stave";
import {DrawContext, ICoordinates, IMetrics} from "./types/common";
import {ModifierContext} from "./modifiercontext";
import {TickContext} from "./tickcontext";
import {Voice} from "./voice";
import {BoundingBox} from "./boundingbox";
import {Beam} from "./beam";
import {INoteDuration, INoteRenderOptions, IParsedNote, IStaveNoteStruct} from "./types/note";
import {IGlyphProps} from "./types/glyph";
import {ITabNotePositon} from "./types/tabnote";
import {Glyph} from "./glyph";
import {Stroke} from "./strokes";
import {ModifierClass} from "./types/modifiercontext";
import {Dot} from "./dot";

export class Note extends Tickable {
  stave: Stave;
  render_options: INoteRenderOptions;
  duration: string;
  positions: ITabNotePositon[];

  protected dots: number;
  protected leftDisplacedHeadPx: number;
  protected rightDisplacedHeadPx: number;
  protected noteType: string;
  protected customGlyphs: IGlyphProps[];
  protected ys: number[];
  protected glyph: IGlyphProps|Glyph;

  private customTypes: string[];
  private playNote: Note;

  static get CATEGORY(): string {
    return 'note';
  }

  // Debug helper. Displays various note metrics for the given
  // note.
  static plotMetrics(ctx: DrawContext, note: Note, yPos: number): void {
    const metrics = note.getMetrics();
    const xStart = note.getAbsoluteX() - metrics.modLeftPx - metrics.leftDisplacedHeadPx;
    const xPre1 = note.getAbsoluteX() - metrics.leftDisplacedHeadPx;
    const xAbs = note.getAbsoluteX();
    const xPost1 = note.getAbsoluteX() + metrics.notePx;
    const xPost2 = note.getAbsoluteX() + metrics.notePx + metrics.rightDisplacedHeadPx;
    const xEnd = note.getAbsoluteX()
      + metrics.notePx
      + metrics.rightDisplacedHeadPx
      + metrics.modRightPx;
    const xFreedomRight = xEnd + (note.getFormatterMetrics().freedom.right || 0);

    const xWidth = xEnd - xStart;
    ctx.save();
    ctx.setFont('Arial', 8, '');
    ctx.fillText(Math.round(xWidth) + 'px', xStart + note.getXShift(), yPos);

    const y = (yPos + 7);

    function stroke(x1: number, x2: number, color: string, yy: number = y) {
      ctx.beginPath();
      ctx.setStrokeStyle(color);
      ctx.setFillStyle(color);
      ctx.setLineWidth(3);
      ctx.moveTo(x1 + note.getXShift(), yy);
      ctx.lineTo(x2 + note.getXShift(), yy);
      ctx.stroke();
    }

    stroke(xStart, xPre1, 'red');
    stroke(xPre1, xAbs, '#999');
    stroke(xAbs, xPost1, 'green');
    stroke(xPost1, xPost2, '#999');
    stroke(xPost2, xEnd, 'red');
    stroke(xEnd, xFreedomRight, '#DD0');
    stroke(xStart - note.getXShift(), xStart, '#BBB'); // Shift
    Vex.drawDot(ctx, xAbs + note.getXShift(), y, 'blue');

    const formatterMetrics = note.getFormatterMetrics();
    if (formatterMetrics.iterations > 0) {
      const spaceDeviation = formatterMetrics.space.deviation;
      const prefix = spaceDeviation >= 0 ? '+' : '';
      ctx.setFillStyle('red');
      ctx.fillText(prefix + Math.round(spaceDeviation),
        xAbs + note.getXShift(), yPos - 10);
    }
    ctx.restore();
  }

  static parseDuration(durationString: string): INoteDuration {
    if (typeof (durationString) !== 'string') {
      return null;
    }

    const regexp = /(\d*\/?\d+|[a-z])(d*)([nrhms]|$)/;
    const result = regexp.exec(durationString);
    if (!result) {
      return null;
    }

    const duration = result[1];
    const dots = result[2].length;
    const type = result[3] || 'n';

    return {duration, dots, type};
  }

  static parseNoteStruct(noteStruct: IStaveNoteStruct): IParsedNote {
    const durationString = noteStruct.duration;
    const customTypes: string[] = [];

    // Preserve backwards-compatibility
    const durationProps = Note.parseDuration(durationString);
    if (!durationProps) {
      return null;
    }

    // If specified type is invalid, return null
    let type = noteStruct.type;
    if (type && !Flow.getGlyphProps.validTypes[type]) {
      return null;
    }

    // If no type specified, check duration or custom types
    if (!type) {
      type = durationProps.type || 'n';

      // If we have keys, try and check if we've got a custom glyph
      if (noteStruct.keys !== undefined) {
        noteStruct.keys.forEach((k, i) => {
          const result = k.split('/');
          // We have a custom glyph specified after the note eg. /X2
          customTypes[i] = (result && result.length === 3) ? result[2] : type;
        });
      }
    }

    // Calculate the tick duration of the note
    let ticks = Flow.durationToTicks(durationProps.duration);
    if (ticks == null) {
      return null;
    }

    // Are there any dots?
    const dots = noteStruct.dots ? noteStruct.dots : durationProps.dots;
    if (typeof (dots) !== 'number') {
      return null;
    }

    // Add ticks as necessary depending on the numbr of dots
    let currentTicks = ticks;
    for (let i = 0; i < dots; i++) {
      if (currentTicks <= 1) return null;

      currentTicks = currentTicks / 2;
      ticks += currentTicks;
    }

    return {
      duration: durationProps.duration,
      type,
      customTypes,
      dots,
      ticks,
    };
  }

  // Every note is a tickable, i.e., it can be mutated by the `Formatter` class for
  // positioning and layout.
  // To create a new note you need to provide a `noteStruct`, which consists
  // of the following fields:
  //
  // `type`: The note type (e.g., `r` for rest, `s` for slash notes, etc.)
  // `dots`: The number of dots, which affects the duration.
  // `duration`: The time length (e.g., `q` for quarter, `h` for half, `8` for eighth etc.)
  //
  // The range of values for these parameters are available in `src/tables.js`.
  constructor(noteStruct: IStaveNoteStruct) {
    super();
    this.setAttribute('type', 'Note');

    if (!noteStruct) {
      throw new Vex.RuntimeError(
        'BadArguments', 'Note must have valid initialization data to identify duration and type.'
      );
    }

    // Parse `noteStruct` and get note properties.
    const initStruct = Note.parseNoteStruct(noteStruct);
    if (!initStruct) {
      throw new Vex.RuntimeError(
        'BadArguments', `Invalid note initialization object: ${JSON.stringify(noteStruct)}`
      );
    }

    // Set note properties from parameters.
    this.duration = initStruct.duration;
    this.dots = initStruct.dots;
    this.noteType = initStruct.type;
    this.customTypes = initStruct.customTypes;

    if (noteStruct.duration_override) {
      // Custom duration
      this.setDuration(noteStruct.duration_override);
    } else {
      // Default duration
      this.setIntrinsicTicks(initStruct.ticks);
    }

    this.modifiers = [];

    // Get the glyph code for this note from the font.
    this.glyph = Flow.getGlyphProps(this.duration, this.noteType);
    this.customGlyphs = this.customTypes.map(t => Flow.getGlyphProps(this.duration, t));

    if (this.positions && (typeof (this.positions) !== 'object' || !this.positions.length)) {
      throw new Vex.RuntimeError('BadArguments', 'Note keys must be array type.');
    }

    // Note to play for audio players.
    this.playNote = null;

    // Positioning contexts used by the Formatter.
    this.tickContext = null;    // The current tick context.
    this.modifierContext = null;
    this.ignore_ticks = false;

    // Positioning variables
    this.width = 0;             // Width in pixels calculated after preFormat
    this.leftDisplacedHeadPx = 0;       // Extra room on left for displaced note head
    this.rightDisplacedHeadPx = 0;      // Extra room on right for displaced note head
    this.x_shift = 0;           // X shift from tick context X
    this.voice = null;          // The voice that this note is in
    this.preFormatted = false;  // Is this note preFormatted?
    this.ys = [];               // list of y coordinates for each note
    // we need to hold on to these for ties and beams.

    if (noteStruct.align_center) {
      this.setCenterAlignment(noteStruct.align_center);
    }

    // The render surface.
    this.stave = null;
    this.render_options = {
      annotation_spacing: 5,
    } as INoteRenderOptions;
  }

  // Get and set the play note, which is arbitrary data that can be used by an
  // audio player.
  getPlayNote(): Note {
    return this.playNote;
  }

  setPlayNote(note: Note): this {
    this.playNote = note;
    return this;
  }

  // Don't play notes by default, call them rests. This is also used by things like
  // beams and dots for positioning.
  isRest(): boolean {
    return false;
  }

  // TODO(0xfe): Why is this method here?
  addStroke(index: number, stroke: Stroke): this {
    stroke.setNote(this);
    stroke.setIndex(index);
    this.modifiers.push(stroke);
    this.setPreFormatted(false);
    return this;
  }

  // Get and set the target stave.
  getStave(): Stave {
    return this.stave;
  }

  setStave(stave: Stave): this {
    this.stave = stave;
    this.setYs([stave.getYForLine(0)]); // Update Y values if the stave is changed.
    this.context = this.stave.context;
    return this;
  }

  // `Note` is not really a modifier, but is used in
  // a `ModifierContext`.
  getCategory(): string {
    return Note.CATEGORY;
  }

  // Set the rendering context for the note.
  setContext(context: DrawContext): this {
    this.context = context;
    return this;
  }

  // Get and set spacing to the left and right of the notes.
  getLeftDisplacedHeadPx(): number {
    return this.leftDisplacedHeadPx;
  }

  getRightDisplacedHeadPx(): number {
    return this.rightDisplacedHeadPx;
  }

  setLeftDisplacedHeadPx(x: number): this {
    this.leftDisplacedHeadPx = x;
    return this;
  }

  setRightDisplacedHeadPx(x: number): this {
    this.rightDisplacedHeadPx = x;
    return this;
  }

  // Returns true if this note has no duration (e.g., bar notes, spacers, etc.)
  shouldIgnoreTicks(): boolean {
    return this.ignore_ticks;
  }

  // Get the stave line number for the note.
  getLineNumber(): number {
    return 0;
  }

  // Get the stave line number for rest.
  getLineForRest(): number {
    return 0;
  }

  // Get the glyph associated with this note.
  getGlyph(): IGlyphProps|Glyph {
    return this.glyph;
  }

  getGlyphWidth(): number {
    // TODO: FIXME (multiple potential values for this.glyph)
    if (this.glyph) {
      if (this.glyph.getMetrics) {
        return this.glyph.getMetrics().width;
      } else if ((this.glyph as IGlyphProps).getWidth) {
        return (this.glyph as IGlyphProps).getWidth(this.render_options.glyph_font_scale);
      }
    }

    return 0;
  }

  // Set and get Y positions for this note. Each Y value is associated with
  // an individual pitch/key within the note/chord.
  setYs(ys: number[]): this {
    this.ys = ys;
    return this;
  }

  getYs(): number[] {
    if (this.ys.length === 0) {
      throw new Vex.RERR('NoYValues', 'No Y-values calculated for this note.');
    }

    return this.ys;
  }

  // Get the Y position of the space above the stave onto which text can
  // be rendered.
  getYForTopText(text_line: number): number {
    if (!this.stave) {
      throw new Vex.RERR('NoStave', 'No stave attached to this note.');
    }

    return this.stave.getYForTopText(text_line);
  }

  // Get a `BoundingBox` for this note.
  getBoundingBox(): BoundingBox {
    return null;
  }

  // Returns the voice that this note belongs in.
  getVoice(): Voice {
    if (!this.voice) throw new Vex.RERR('NoVoice', 'Note has no voice.');
    return this.voice;
  }

  // Attach this note to `voice`.
  setVoice(voice: Voice): this {
    this.voice = voice;
    this.preFormatted = false;
    return this;
  }

  // Get and set the `TickContext` for this note.
  getTickContext(): TickContext {
    return this.tickContext;
  }

  setTickContext(tc: TickContext): this {
    this.tickContext = tc;
    this.preFormatted = false;
    return this;
  }

  // Accessors for the note type.
  getDuration(): string {
    return this.duration;
  }

  isDotted(): boolean {
    return (this.dots > 0);
  }

  hasStem(): boolean {
    return false;
  }

  getDots(): number {
    return this.dots;
  }

  getNoteType(): string {
    return this.noteType;
  }

  setBeam(beam?: Beam): this {
    return this;
  } // ignore parameters

  // Attach this note to a modifier context.
  setModifierContext(mc: ModifierContext | TickContext): this {
    this.modifierContext = mc;
    return this;
  }

  // Attach a modifier to this note.
  addModifier(modifier: ModifierClass, index = 0): this {
    (modifier as Dot).setNote(this);
    (modifier as Dot).setIndex(index);
    this.modifiers.push(modifier);
    this.setPreFormatted(false);
    return this;
  }

  // Get the coordinates for where modifiers begin.
  getModifierStartXY(position?: number, index?: number, options?: any): ICoordinates {
    if (!this.preFormatted) {
      throw new Vex.RERR('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
    }

    return {
      x: this.getAbsoluteX(),
      y: this.ys[0],
    };
  }

  // Get bounds and metrics for this note.
  //
  // Returns a struct with fields:
  // `width`: The total width of the note (including modifiers.)
  // `notePx`: The width of the note head only.
  // `left_shift`: The horizontal displacement of the note.
  // `modLeftPx`: Start `X` for left modifiers.
  // `modRightPx`: Start `X` for right modifiers.
  // `leftDisplacedHeadPx`: Extra space on left of note.
  // `rightDisplacedHeadPx`: Extra space on right of note.
  getMetrics(): IMetrics {
    if (!this.preFormatted) {
      throw new Vex.RERR('UnformattedNote', "Can't call getMetrics on an unformatted note.");
    }

    const modLeftPx = this.modifierContext ? (this.modifierContext as ModifierContext).state.left_shift : 0;
    const modRightPx = this.modifierContext ? (this.modifierContext as ModifierContext).state.right_shift : 0;
    const width = this.getWidth();
    const glyphWidth = this.getGlyphWidth();
    const notePx = width
      - modLeftPx           // subtract left modifiers
      - modRightPx          // subtract right modifiers
      - this.leftDisplacedHeadPx   // subtract left displaced head
      - this.rightDisplacedHeadPx;  // subtract right displaced head

    return {
      // ----------
      // NOTE: If you change this, remember to update MockTickable in the tests/ directory.
      // --------------
      width,
      glyphWidth,
      notePx,

      // Modifier spacing.
      modLeftPx,
      modRightPx,

      // Displaced note head on left or right.
      leftDisplacedHeadPx: this.leftDisplacedHeadPx,
      rightDisplacedHeadPx: this.rightDisplacedHeadPx,
    } as IMetrics;
  }

  // Get the absolute `X` position of this note's tick context. This
  // excludes x_shift, so you'll need to factor it in if you're
  // looking for the post-formatted x-position.
  getAbsoluteX(): number {
    if (!this.tickContext) {
      throw new Vex.RERR('NoTickContext', 'Note needs a TickContext assigned for an X-Value');
    }

    // Position note to left edge of tick context.
    let x = this.tickContext.getX();
    if (this.stave) {
      x += this.stave.getNoteStartX() + this.musicFont.lookupMetric('stave.padding');
    }

    if (this.isCenterAligned()) {
      x += this.getCenterXShift();
    }

    return x;
  }

  setPreFormatted(value: boolean): void {
    this.preFormatted = value;
  }
}
