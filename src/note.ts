// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Beam } from './beam';
import { Font } from './font';
import { Fraction } from './fraction';
import { GlyphProps } from './glyph';
import { Modifier } from './modifier';
import { drawDot, RenderContext } from './rendercontext';
import { Stave } from './stave';
import { Stroke } from './strokes';
import { Tables } from './tables';
import { Tickable } from './tickable';
import { TickContext } from './tickcontext';
import { Category } from './typeguard';
import { defined, RuntimeError } from './util';
import { Voice } from './voice';

export interface KeyProps {
  stem_down_x_offset?: number;
  stem_up_x_offset?: number;
  key: string;
  octave: number;
  line: number;
  int_value?: number;
  accidental?: string;
  code?: string;
  stroke: number;
  shift_right?: number;
  displaced: boolean;
}

export interface NoteMetrics {
  /** The total width of the note (including modifiers). */
  width: number;
  glyphWidth?: number;
  /** The width of the note head only. */
  notePx: number;
  /** Start `X` for left modifiers. */
  modLeftPx: number;
  /** Start `X` for right modifiers. */
  modRightPx: number;
  /** Extra space on left of note. */
  leftDisplacedHeadPx: number;
  glyphPx: number;
  /** Extra space on right of note. */
  rightDisplacedHeadPx: number;
}

export interface NoteDuration {
  duration: string;
  dots: number;
  type: string;
}

export interface ParsedNote {
  duration: string;
  type: string;
  customTypes: string[];
  dots: number;
  ticks: number;
}

export interface NoteStruct {
  /** Array of pitches, e.g: `['c/4', 'e/4', 'g/4']` */
  keys?: string[];
  /** The time length (e.g., `q` for quarter, `h` for half, `8` for eighth etc.). */
  duration: string;
  line?: number;
  /** The number of dots, which affects the duration. */
  dots?: number;
  /** The note type (e.g., `r` for rest, `s` for slash notes, etc.). */
  type?: string;
  align_center?: boolean;
  duration_override?: Fraction;
}

/**
 * Note implements an abstract interface for notes and chords that
 * are rendered on a stave. Notes have some common properties: All of them
 * have a value (e.g., pitch, fret, etc.) and a duration (quarter, half, etc.)
 *
 * Some notes have stems, heads, dots, etc. Most notational elements that
 * surround a note are called *modifiers*, and every note has an associated
 * array of them. All notes also have a rendering context and belong to a stave.
 */
export abstract class Note extends Tickable {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // STATIC MEMBERS

  static get CATEGORY(): string {
    return Category.Note;
  }

  /** Debug helper. Displays various note metrics for the given note. */
  static plotMetrics(ctx: RenderContext, note: Tickable, yPos: number): void {
    const metrics = note.getMetrics();
    const xStart = note.getAbsoluteX() - metrics.modLeftPx - metrics.leftDisplacedHeadPx;
    const xPre1 = note.getAbsoluteX() - metrics.leftDisplacedHeadPx;
    const xAbs = note.getAbsoluteX();
    const xPost1 = note.getAbsoluteX() + metrics.notePx;
    const xPost2 = note.getAbsoluteX() + metrics.notePx + metrics.rightDisplacedHeadPx;
    const xEnd = note.getAbsoluteX() + metrics.notePx + metrics.rightDisplacedHeadPx + metrics.modRightPx;
    const xFreedomRight = xEnd + (note.getFormatterMetrics().freedom.right || 0);

    const xWidth = xEnd - xStart;
    ctx.save();
    ctx.setFont(Font.SANS_SERIF, 8);
    ctx.fillText(Math.round(xWidth) + 'px', xStart + note.getXShift(), yPos);

    const y = yPos + 7;
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
    drawDot(ctx, xAbs + note.getXShift(), y, 'blue');

    const formatterMetrics = note.getFormatterMetrics();
    if (formatterMetrics.iterations > 0) {
      const spaceDeviation = formatterMetrics.space.deviation;
      const prefix = spaceDeviation >= 0 ? '+' : '';
      ctx.setFillStyle('red');
      ctx.fillText(prefix + Math.round(spaceDeviation), xAbs + note.getXShift(), yPos - 10);
    }
    ctx.restore();
  }

  protected static parseDuration(durationString?: string): NoteDuration | undefined {
    if (!durationString) {
      return undefined;
    }
    const regexp = /(\d*\/?\d+|[a-z])(d*)([nrhms]|$)/;
    const result = regexp.exec(durationString);
    if (!result) {
      return undefined;
    }

    const duration = result[1];
    const dots = result[2].length;
    const type = result[3] || 'n';

    return { duration, dots, type };
  }

  protected static parseNoteStruct(noteStruct: NoteStruct): ParsedNote | undefined {
    // Preserve backwards-compatibility
    const durationProps = Note.parseDuration(noteStruct.duration);
    if (!durationProps) {
      return undefined;
    }

    // If specified type is invalid, return undefined.
    let type = noteStruct.type;
    if (type && !Tables.validTypes[type]) {
      return undefined;
    }

    // If no type specified, check duration or custom types
    const customTypes: string[] = [];
    if (!type) {
      type = durationProps.type || 'n';

      // If we have keys, try and check if we've got a custom glyph
      if (noteStruct.keys !== undefined) {
        noteStruct.keys.forEach((k, i) => {
          const result = k.split('/');
          // We have a custom glyph specified after the note eg. /X2
          customTypes[i] = (result && result.length === 3 ? result[2] : type) as string;
        });
      }
    }

    // Calculate the tick duration of the note
    let ticks = Tables.durationToTicks(durationProps.duration);
    if (!ticks) {
      return undefined;
    }

    // Are there any dots?
    const dots = noteStruct.dots ? noteStruct.dots : durationProps.dots;
    if (typeof dots !== 'number') {
      return undefined;
    }

    // Add ticks as necessary depending on the numbr of dots
    let currentTicks = ticks;
    for (let i = 0; i < dots; i++) {
      if (currentTicks <= 1) return undefined;

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

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // INSTANCE MEMBERS

  glyphProps: GlyphProps;
  keys: string[];
  keyProps: KeyProps[];

  protected stave?: Stave;
  public render_options: {
    draw_stem_through_stave?: boolean;
    draw?: boolean;
    draw_dots?: boolean;
    draw_stem?: boolean;
    y_shift: number;
    extend_left?: number;
    extend_right?: number;
    glyph_font_scale: number;
    annotation_spacing: number;
    glyph_font_size?: number;
    scale: number;
    font: string;
    stroke_px: number;
  };
  protected duration: string;
  protected leftDisplacedHeadPx: number;
  protected rightDisplacedHeadPx: number;
  protected noteType: string;
  protected customGlyphs: GlyphProps[];
  protected ys: number[];
  protected customTypes: string[];
  protected playNote?: Note;
  protected beam?: Beam;

  /**
   * Every note is a tickable, i.e., it can be mutated by the `Formatter` class for
   * positioning and layout.
   *
   * @param noteStruct To create a new note you need to provide a `noteStruct`.
   */
  constructor(noteStruct: NoteStruct) {
    super();

    if (!noteStruct) {
      throw new RuntimeError('BadArguments', 'Note must have valid initialization data to identify duration and type.');
    }

    /** Parses `noteStruct` and get note properties. */
    const parsedNoteStruct = Note.parseNoteStruct(noteStruct);
    if (!parsedNoteStruct) {
      throw new RuntimeError('BadArguments', `Invalid note initialization object: ${JSON.stringify(noteStruct)}`);
    }

    // Set note properties from parameters.
    this.keys = noteStruct.keys || [];
    // per-pitch properties
    this.keyProps = [];

    this.duration = parsedNoteStruct.duration;
    this.noteType = parsedNoteStruct.type;
    this.customTypes = parsedNoteStruct.customTypes;

    if (noteStruct.duration_override) {
      // Custom duration
      this.setDuration(noteStruct.duration_override);
    } else {
      // Default duration
      this.setIntrinsicTicks(parsedNoteStruct.ticks);
    }

    this.modifiers = [];

    // Get the glyph code for this note from the font.
    this.glyphProps = Tables.getGlyphProps(this.duration, this.noteType);
    this.customGlyphs = this.customTypes.map((t) => Tables.getGlyphProps(this.duration, t));

    // Note to play for audio players.
    this.playNote = undefined;

    // Positioning contexts used by the Formatter.
    this.ignore_ticks = false;

    // Positioning variables
    this.width = 0; // Width in pixels calculated after preFormat
    this.leftDisplacedHeadPx = 0; // Extra room on left for displaced note head
    this.rightDisplacedHeadPx = 0; // Extra room on right for displaced note head
    this.x_shift = 0; // X shift from tick context X
    this.ys = []; // list of y coordinates for each note
    // we need to hold on to these for ties and beams.

    if (noteStruct.align_center) {
      this.setCenterAlignment(noteStruct.align_center);
    }

    // The render surface.
    this.render_options = {
      annotation_spacing: 5,
      glyph_font_scale: 1,
      stroke_px: 1,
      scale: 1,
      font: '',
      y_shift: 0,
    };
  }

  /**
   * Get the play note, which is arbitrary data that can be used by an
   * audio player.
   */
  getPlayNote(): Note | undefined {
    return this.playNote;
  }

  /**
   * Set the play note, which is arbitrary data that can be used by an
   * audio player.
   */
  setPlayNote(note: Note): this {
    this.playNote = note;
    return this;
  }

  /**
   * @returns true if this note is a type of rest.
   *
   * Rests don't have pitches, but take up space in the score.
   * Subclasses should override this default implementation.
   */
  isRest(): boolean {
    return false;
  }

  /** Add stroke. */
  addStroke(index: number, stroke: Stroke): this {
    stroke.setNote(this);
    stroke.setIndex(index);
    this.modifiers.push(stroke);
    this.preFormatted = false;
    return this;
  }

  /** Get the target stave. */
  getStave(): Stave | undefined {
    return this.stave;
  }

  /** Check and get the target stave. */
  checkStave(): Stave {
    return defined(this.stave, 'NoStave', 'No stave attached to instance.');
  }

  /** Set the target stave. */
  setStave(stave: Stave): this {
    this.stave = stave;
    this.setYs([stave.getYForLine(0)]); // Update Y values if the stave is changed.
    this.setContext(this.stave.getContext());
    return this;
  }

  /** Get spacing to the left of the notes. */
  getLeftDisplacedHeadPx(): number {
    return this.leftDisplacedHeadPx;
  }

  /** Get spacing to the right of the notes. */
  getRightDisplacedHeadPx(): number {
    return this.rightDisplacedHeadPx;
  }

  /** Set spacing to the left of the notes. */
  setLeftDisplacedHeadPx(x: number): this {
    this.leftDisplacedHeadPx = x;
    return this;
  }

  /** Set spacing to the right of the notes. */
  setRightDisplacedHeadPx(x: number): this {
    this.rightDisplacedHeadPx = x;
    return this;
  }

  /** True if this note has no duration (e.g., bar notes, spacers, etc.). */
  shouldIgnoreTicks(): boolean {
    return this.ignore_ticks;
  }

  /** Get the stave line number for the note. */
  // eslint-disable-next-line
  getLineNumber(isTopNote?: boolean): number {
    return 0;
  }

  /** Get the stave line number for rest. */
  getLineForRest(): number {
    return 0;
  }

  /**
   * @deprecated Use `getGlyphProps()` instead.
   */
  // eslint-disable-next-line
  getGlyph(): any {
    return this.glyphProps;
  }

  /** Get the glyph associated with this note. */
  getGlyphProps(): GlyphProps {
    return this.glyphProps;
  }

  /** Get the glyph width. */
  getGlyphWidth(): number {
    return this.glyphProps.getWidth(this.render_options.glyph_font_scale);
  }

  /**
   * Set Y positions for this note. Each Y value is associated with
   * an individual pitch/key within the note/chord.
   */
  setYs(ys: number[]): this {
    this.ys = ys;
    return this;
  }

  /**
   * Get Y positions for this note. Each Y value is associated with
   * an individual pitch/key within the note/chord.
   */
  getYs(): number[] {
    if (this.ys.length === 0) {
      throw new RuntimeError('NoYValues', 'No Y-values calculated for this note.');
    }

    return this.ys;
  }

  /**
   * Get the Y position of the space above the stave onto which text can
   * be rendered.
   */
  getYForTopText(text_line: number): number {
    return this.checkStave().getYForTopText(text_line);
  }

  /** Return the voice that this note belongs in. */
  getVoice(): Voice {
    if (!this.voice) throw new RuntimeError('NoVoice', 'Note has no voice.');
    return this.voice;
  }

  /** Attach this note to `voice`. */
  setVoice(voice: Voice): this {
    this.voice = voice;
    this.preFormatted = false;
    return this;
  }

  /** Get the `TickContext` for this note. */
  getTickContext(): TickContext {
    return this.checkTickContext();
  }

  /** Set the `TickContext` for this note. */
  setTickContext(tc: TickContext): this {
    this.tickContext = tc;
    this.preFormatted = false;
    return this;
  }

  /** Accessor to duration. */
  getDuration(): string {
    return this.duration;
  }

  /** Accessor to isDotted. */
  isDotted(): boolean {
    return this.getModifiersByType(Category.Dot).length > 0;
  }

  /** Accessor to hasStem. */
  hasStem(): boolean {
    return false;
  }

  /** Accessor to note type. */
  getNoteType(): string {
    return this.noteType;
  }

  /** Get the beam. */
  getBeam(): Beam | undefined {
    return this.beam;
  }

  /** Check and get the beam. */
  checkBeam(): Beam {
    return defined(this.beam, 'NoBeam', 'No beam attached to instance');
  }

  /** Check it has a beam. */
  hasBeam(): boolean {
    return this.beam != undefined;
  }

  /** Set the beam. */
  setBeam(beam: Beam): this {
    this.beam = beam;
    return this;
  }

  /**
   * Attach a modifier to this note.
   * @param modifier the Modifier to add.
   * @param index of the key to modify.
   * @returns this
   */
  addModifier(modifier: Modifier, index: number = 0): this {
    const signature = 'Note.addModifier(modifier: Modifier, index: number=0)';
    // Backwards compatibility with 3.0.9.
    if (typeof index === 'string') {
      index = parseInt(index);
      // eslint-disable-next-line
      console.warn(signature + ' expected a number for `index`, but received a string.');
    }

    // Some versions of VexFlow had the two parameters reversed.
    // Check here and throw an error if the argument types are not correct.
    if (typeof modifier !== 'object' || typeof index !== 'number') {
      throw new RuntimeError('WrongParams', 'Incorrect call signature. Use ' + signature + ' instead.');
    }
    modifier.setNote(this);
    modifier.setIndex(index);
    super.addModifier(modifier);
    return this;
  }

  /** Get all modifiers of a specific type in `this.modifiers`. */
  getModifiersByType(type: string): Modifier[] {
    return this.modifiers.filter((modifier) => modifier.getCategory() === type);
  }

  /** Get the coordinates for where modifiers begin. */
  // eslint-disable-next-line
  getModifierStartXY(position?: number, index?: number, options?: any): { x: number; y: number } {
    if (!this.preFormatted) {
      throw new RuntimeError('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
    }

    return {
      x: this.getAbsoluteX(),
      y: this.ys[0],
    };
  }

  getRightParenthesisPx(index: number): number {
    const props = this.getKeyProps()[index];
    return props.displaced ? this.getRightDisplacedHeadPx() : 0;
  }

  getLeftParenthesisPx(index: number): number {
    const props = this.getKeyProps()[index];
    return props.displaced ? this.getLeftDisplacedHeadPx() - this.x_shift : -this.x_shift;
  }

  getFirstDotPx(): number {
    let px = this.getRightDisplacedHeadPx();

    if (this.checkModifierContext().getMembers('Parenthesis').length !== 0)
      px += Tables.currentMusicFont().lookupMetric('parenthesis.default.width');
    return px;
  }

  /** Get the metrics for this note. */
  getMetrics(): NoteMetrics {
    if (!this.preFormatted) {
      throw new RuntimeError('UnformattedNote', "Can't call getMetrics on an unformatted note.");
    }

    const modLeftPx = this.modifierContext ? this.modifierContext.getState().left_shift : 0;
    const modRightPx = this.modifierContext ? this.modifierContext.getState().right_shift : 0;
    const width = this.getWidth();
    const glyphWidth = this.getGlyphWidth();
    const notePx =
      width -
      modLeftPx - // subtract left modifiers
      modRightPx - // subtract right modifiers
      this.leftDisplacedHeadPx - // subtract left displaced head
      this.rightDisplacedHeadPx; // subtract right displaced head

    // NOTE: If you change this, remember to update MockTickable.getMetrics() in the tests/ directory.
    return {
      width,
      glyphWidth,
      notePx,

      // Modifier spacing.
      modLeftPx,
      modRightPx,

      // Displaced note head on left or right.
      leftDisplacedHeadPx: this.leftDisplacedHeadPx,
      rightDisplacedHeadPx: this.rightDisplacedHeadPx,
      glyphPx: 0,
    };
  }

  /**
   * Get the absolute `X` position of this note's tick context. This
   * excludes x_shift, so you'll need to factor it in if you're
   * looking for the post-formatted x-position.
   */
  getAbsoluteX(): number {
    const tickContext = this.checkTickContext(`Can't getAbsoluteX() without a TickContext.`);
    // Position note to left edge of tick context.
    let x = tickContext.getX();
    if (this.stave) {
      x += this.stave.getNoteStartX() + Tables.currentMusicFont().lookupMetric('stave.padding');
    }
    if (this.isCenterAligned()) {
      x += this.getCenterXShift();
    }
    return x;
  }

  /** Get point for notes. */
  static getPoint(size?: string): number {
    // for sizes other than 'default', note is 2/3 of the default value
    return size == 'default' ? Tables.NOTATION_FONT_SCALE : (Tables.NOTATION_FONT_SCALE / 5) * 3;
  }

  /** Get the direction of the stem. */
  getStemDirection(): number {
    throw new RuntimeError('NoStem', 'No stem attached to this note.');
  }

  /** Get the top and bottom `y` values of the stem. */
  getStemExtents(): Record<string, number> {
    throw new RuntimeError('NoStem', 'No stem attached to this note.');
  }

  /** Get the `x` coordinate to the right of the note. */
  getTieRightX(): number {
    let tieStartX = this.getAbsoluteX();
    const note_glyph_width = this.glyphProps.getWidth();
    tieStartX += note_glyph_width / 2;
    tieStartX += -this.width / 2 + this.width + 2;

    return tieStartX;
  }

  /** Get the `x` coordinate to the left of the note. */
  getTieLeftX(): number {
    let tieEndX = this.getAbsoluteX();
    const note_glyph_width = this.glyphProps.getWidth();
    tieEndX += note_glyph_width / 2;
    tieEndX -= this.width / 2 + 2;

    return tieEndX;
  }

  // Get the pitches in the note
  getKeys(): string[] {
    return this.keys;
  }

  // Get the properties for all the keys in the note
  getKeyProps(): KeyProps[] {
    return this.keyProps;
  }
}
