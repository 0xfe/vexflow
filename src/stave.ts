// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { BoundingBox, Bounds } from './boundingbox';
import { Clef } from './clef';
import { Element, ElementStyle } from './element';
import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { KeySignature } from './keysignature';
import { Barline, BarlineType } from './stavebarline';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Repetition } from './staverepetition';
import { StaveSection } from './stavesection';
import { StaveTempo, StaveTempoOptions } from './stavetempo';
import { StaveText } from './stavetext';
import { Volta } from './stavevolta';
import { Tables } from './tables';
import { TimeSignature } from './timesignature';
import { Category, isBarline } from './typeguard';
import { RuntimeError } from './util';

export interface StaveLineConfig {
  visible?: boolean;
}

export interface StaveOptions {
  bottom_text_position?: number;
  line_config?: StaveLineConfig[];
  space_below_staff_ln?: number;
  space_above_staff_ln?: number;
  vertical_bar_width?: number;
  fill_style?: string;
  left_bar?: boolean;
  right_bar?: boolean;
  spacing_between_lines_px?: number;
  top_text_position?: number;
  num_lines?: number;
}

// Used by Stave.format() to sort the modifiers at the beginning and end of a stave.
// The keys (computed property names) match the CATEGORY property in the
// Barline, Clef, KeySignature, TimeSignature classes.
const SORT_ORDER_BEG_MODIFIERS = {
  [Barline.CATEGORY]: 0,
  [Clef.CATEGORY]: 1,
  [KeySignature.CATEGORY]: 2,
  [TimeSignature.CATEGORY]: 3,
};

const SORT_ORDER_END_MODIFIERS = {
  [TimeSignature.CATEGORY]: 0,
  [KeySignature.CATEGORY]: 1,
  [Barline.CATEGORY]: 2,
  [Clef.CATEGORY]: 3,
};

export class Stave extends Element {
  static get CATEGORY(): string {
    return Category.Stave;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SANS_SERIF,
    size: 8,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
  };

  readonly options: Required<StaveOptions>;

  protected start_x: number;
  protected clef: string;
  protected endClef?: string;

  protected x: number;
  protected y: number;
  protected width: number;
  // Initialized by the constructor via this.resetLines().
  protected height: number = 0;

  protected formatted: boolean;
  protected end_x: number;
  protected measure: number;
  protected bounds: Bounds;
  protected readonly modifiers: StaveModifier[];

  protected defaultLedgerLineStyle: ElementStyle;

  // This is the sum of the padding that normally goes on left + right of a stave during
  // drawing. Used to size staves correctly with content width.
  static get defaultPadding(): number {
    const musicFont = Tables.currentMusicFont();
    return musicFont.lookupMetric('stave.padding') + musicFont.lookupMetric('stave.endPaddingMax');
  }

  // Right padding, used by system if startX is already determined.
  static get rightPadding(): number {
    const musicFont = Tables.currentMusicFont();
    return musicFont.lookupMetric('stave.endPaddingMax');
  }

  constructor(x: number, y: number, width: number, options?: StaveOptions) {
    super();

    this.x = x;
    this.y = y;
    this.width = width;
    this.formatted = false;
    this.start_x = x + 5;
    this.end_x = x + width;
    this.modifiers = []; // stave modifiers (clef, key, time, barlines, coda, segno, etc.)
    this.measure = 0;
    this.clef = 'treble';
    this.endClef = undefined;
    this.resetFont();

    this.options = {
      vertical_bar_width: 10, // Width around vertical bar end-marker
      num_lines: 5,
      fill_style: '#999999',
      left_bar: true, // draw vertical bar on left
      right_bar: true, // draw vertical bar on right
      spacing_between_lines_px: Tables.STAVE_LINE_DISTANCE, // in pixels
      space_above_staff_ln: 4, // in staff lines
      space_below_staff_ln: 4, // in staff lines
      top_text_position: 1, // in staff lines
      bottom_text_position: 4, // in staff lines
      line_config: [],
      ...options,
    };
    this.bounds = { x: this.x, y: this.y, w: this.width, h: 0 };
    this.defaultLedgerLineStyle = { strokeStyle: '#444', lineWidth: 1.4 };

    this.resetLines();

    // beg bar
    this.addModifier(new Barline(this.options.left_bar ? BarlineType.SINGLE : BarlineType.NONE));
    // end bar
    this.addEndModifier(new Barline(this.options.right_bar ? BarlineType.SINGLE : BarlineType.NONE));
  }

  /** Set default style for ledger lines. */
  setDefaultLedgerLineStyle(style: ElementStyle): void {
    this.defaultLedgerLineStyle = style;
  }

  /** Get default style for ledger lines. */
  getDefaultLedgerLineStyle(): ElementStyle {
    return { ...this.getStyle(), ...this.defaultLedgerLineStyle };
  }

  space(spacing: number): number {
    return this.options.spacing_between_lines_px * spacing;
  }

  resetLines(): void {
    this.options.line_config = [];
    for (let i = 0; i < this.options.num_lines; i++) {
      this.options.line_config.push({ visible: true });
    }
    this.height = (this.options.num_lines + this.options.space_above_staff_ln) * this.options.spacing_between_lines_px;
    this.options.bottom_text_position = this.options.num_lines;
  }

  setNoteStartX(x: number): this {
    if (!this.formatted) this.format();

    this.start_x = x;
    return this;
  }

  getNoteStartX(): number {
    if (!this.formatted) this.format();

    return this.start_x;
  }

  getNoteEndX(): number {
    if (!this.formatted) this.format();

    return this.end_x;
  }

  getTieStartX(): number {
    return this.start_x;
  }

  getTieEndX(): number {
    return this.end_x;
  }

  getX(): number {
    return this.x;
  }

  getNumLines(): number {
    return this.options.num_lines;
  }

  setNumLines(n: number): this {
    this.options.num_lines = n;
    this.resetLines();
    return this;
  }

  setY(y: number): this {
    this.y = y;
    return this;
  }

  getY(): number {
    return this.y;
  }

  getTopLineTopY(): number {
    return this.getYForLine(0) - Tables.STAVE_LINE_THICKNESS / 2;
  }

  getBottomLineBottomY(): number {
    return this.getYForLine(this.getNumLines() - 1) + Tables.STAVE_LINE_THICKNESS / 2;
  }

  setX(x: number): this {
    const shift = x - this.x;
    this.formatted = false;
    this.x = x;
    this.start_x += shift;
    this.end_x += shift;
    for (let i = 0; i < this.modifiers.length; i++) {
      const mod = this.modifiers[i];
      mod.setX(mod.getX() + shift);
    }
    return this;
  }

  setWidth(width: number): this {
    this.formatted = false;
    this.width = width;
    this.end_x = this.x + width;

    // reset the x position of the end barline (TODO(0xfe): This makes no sense)
    // this.modifiers[1].setX(this.end_x);
    return this;
  }

  getWidth(): number {
    return this.width;
  }

  getStyle(): ElementStyle {
    return {
      fillStyle: this.options.fill_style,
      strokeStyle: this.options.fill_style, // yes, this is correct for legacy compatibility
      lineWidth: Tables.STAVE_LINE_THICKNESS,
      ...super.getStyle(),
    };
  }

  /**
   * Set the measure number of this Stave.
   */
  setMeasure(measure: number): this {
    this.measure = measure;
    return this;
  }

  /**
   * Return the measure number of this Stave.
   */
  getMeasure(): number {
    return this.measure;
  }

  /**
   * Gets the pixels to shift from the beginning of the stave
   * following the modifier at the provided index
   * @param  {Number} index The index from which to determine the shift
   * @return {Number}       The amount of pixels shifted
   */
  getModifierXShift(index: number = 0): number {
    if (typeof index !== 'number') {
      throw new RuntimeError('InvalidIndex', 'Must be of number type');
    }

    if (!this.formatted) this.format();

    if (this.getModifiers(StaveModifierPosition.BEGIN).length === 1) {
      return 0;
    }

    // for right position modifiers zero shift seems correct, see 'Volta + Modifier Measure Test'
    if (this.modifiers[index].getPosition() === StaveModifierPosition.RIGHT) {
      return 0;
    }

    let start_x = this.start_x - this.x;
    const begBarline = this.modifiers[0] as Barline;
    if (begBarline.getType() === BarlineType.REPEAT_BEGIN && start_x > begBarline.getWidth()) {
      start_x -= begBarline.getWidth();
    }

    return start_x;
  }

  /** Coda & Segno Symbol functions */
  setRepetitionType(type: number, yShift: number = 0): this {
    this.modifiers.push(new Repetition(type, this.x, yShift));
    return this;
  }

  // Volta functions
  setVoltaType(type: number, number_t: string, y: number): this {
    this.modifiers.push(new Volta(type, number_t, this.x, y));
    return this;
  }

  // Section functions
  setSection(section: string, y: number, xOffset = 0, fontSize?: number, drawRect = true) {
    const staveSection = new StaveSection(section, this.x + xOffset, y, drawRect);
    if (fontSize) staveSection.setFontSize(fontSize);
    this.modifiers.push(staveSection);
    return this;
  }

  // Tempo functions
  setTempo(tempo: StaveTempoOptions, y: number): this {
    this.modifiers.push(new StaveTempo(tempo, this.x, y));
    return this;
  }

  // Text functions
  setText(
    text: string,
    position: number,
    options: {
      shift_x?: number;
      shift_y?: number;
      justification?: number;
    } = {}
  ): this {
    this.modifiers.push(new StaveText(text, position, options));
    return this;
  }

  getHeight(): number {
    return this.height;
  }

  getSpacingBetweenLines(): number {
    return this.options.spacing_between_lines_px;
  }

  getBoundingBox(): BoundingBox {
    return new BoundingBox(this.x, this.y, this.width, this.getBottomY() - this.y);
  }

  getBottomY(): number {
    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const score_bottom = this.getYForLine(options.num_lines) + options.space_below_staff_ln * spacing;

    return score_bottom;
  }

  getBottomLineY(): number {
    return this.getYForLine(this.options.num_lines);
  }

  // This returns
  /** @returns the y for the *center* of a staff line */
  getYForLine(line: number): number {
    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const headroom = options.space_above_staff_ln;

    const y = this.y + line * spacing + headroom * spacing;

    return y;
  }

  getLineForY(y: number): number {
    // Does the reverse of getYForLine - somewhat dumb and just calls
    // getYForLine until the right value is reaches

    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const headroom = options.space_above_staff_ln;
    return (y - this.y) / spacing - headroom;
  }

  getYForTopText(line: number = 0): number {
    return this.getYForLine(-line - this.options.top_text_position);
  }

  getYForBottomText(line: number = 0): number {
    return this.getYForLine(this.options.bottom_text_position + line);
  }

  getYForNote(line: number): number {
    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const headroom = options.space_above_staff_ln;
    return this.y + headroom * spacing + 5 * spacing - line * spacing;
  }

  getYForGlyphs(): number {
    return this.getYForLine(3);
  }

  // This method adds a stave modifier to the stave. Note that the first two
  // modifiers (BarLines) are automatically added upon construction.
  addModifier(modifier: StaveModifier, position?: number): this {
    if (position !== undefined) {
      modifier.setPosition(position);
    }

    modifier.setStave(this);
    this.formatted = false;
    this.modifiers.push(modifier);
    return this;
  }

  addEndModifier(modifier: StaveModifier): this {
    this.addModifier(modifier, StaveModifierPosition.END);
    return this;
  }

  // Bar Line functions
  setBegBarType(type: number | BarlineType): this {
    // Only valid bar types at beginning of stave is none, single or begin repeat
    const { SINGLE, REPEAT_BEGIN, NONE } = BarlineType;
    if (type === SINGLE || type === REPEAT_BEGIN || type === NONE) {
      (this.modifiers[0] as Barline).setType(type);
      this.formatted = false;
    }
    return this;
  }

  setEndBarType(type: number | BarlineType): this {
    // Repeat end not valid at end of stave
    if (type !== BarlineType.REPEAT_BEGIN) {
      (this.modifiers[1] as Barline).setType(type);
      this.formatted = false;
    }
    return this;
  }

  /**
   * treat the stave as if the clef is clefSpec, but don't display the clef
   */
  setClefLines(clefSpec: string) {
    this.clef = clefSpec;
    return this;
  }

  setClef(clefSpec: string, size?: string, annotation?: string, position?: number): this {
    if (position === undefined) {
      position = StaveModifierPosition.BEGIN;
    }

    if (position === StaveModifierPosition.END) {
      this.endClef = clefSpec;
    } else {
      this.clef = clefSpec;
    }

    const clefs = this.getModifiers(position, Clef.CATEGORY) as Clef[];
    if (clefs.length === 0) {
      this.addClef(clefSpec, size, annotation, position);
    } else {
      clefs[0].setType(clefSpec, size, annotation);
    }

    return this;
  }

  getClef(): string {
    return this.clef;
  }

  setEndClef(clefSpec: string, size?: string, annotation?: string): this {
    this.setClef(clefSpec, size, annotation, StaveModifierPosition.END);
    return this;
  }

  getEndClef(): string | undefined {
    return this.endClef;
  }

  setKeySignature(keySpec: string, cancelKeySpec?: string, position?: number): this {
    if (position === undefined) {
      position = StaveModifierPosition.BEGIN;
    }

    const keySignatures = this.getModifiers(position, KeySignature.CATEGORY) as KeySignature[];
    if (keySignatures.length === 0) {
      this.addKeySignature(keySpec, cancelKeySpec, position);
    } else {
      keySignatures[0].setKeySig(keySpec, cancelKeySpec);
    }

    return this;
  }

  setEndKeySignature(keySpec: string, cancelKeySpec?: string): this {
    this.setKeySignature(keySpec, cancelKeySpec, StaveModifierPosition.END);
    return this;
  }

  setTimeSignature(timeSpec: string, customPadding?: number, position?: number): this {
    if (position === undefined) {
      position = StaveModifierPosition.BEGIN;
    }

    const timeSignatures = this.getModifiers(position, TimeSignature.CATEGORY) as TimeSignature[];
    if (timeSignatures.length === 0) {
      this.addTimeSignature(timeSpec, customPadding, position);
    } else {
      timeSignatures[0].setTimeSig(timeSpec);
    }

    return this;
  }

  setEndTimeSignature(timeSpec: string, customPadding?: number): this {
    this.setTimeSignature(timeSpec, customPadding, StaveModifierPosition.END);
    return this;
  }

  /**
   * Add a key signature to the stave.
   *
   * Example:
   * `stave.addKeySignature('Db');`
   * @param keySpec new key specification `[A-G][b|#]?`
   * @param cancelKeySpec
   * @param position
   * @returns
   */
  addKeySignature(keySpec: string, cancelKeySpec?: string, position?: number): this {
    if (position === undefined) {
      position = StaveModifierPosition.BEGIN;
    }
    this.addModifier(new KeySignature(keySpec, cancelKeySpec).setPosition(position), position);
    return this;
  }

  /**
   * Add a clef to the stave.
   *
   * Example:
   *
   * stave.addClef('treble')
   * @param clef clef (treble|bass|...) see {@link Clef.types}
   * @param size
   * @param annotation
   * @param position
   * @returns
   */
  addClef(clef: string, size?: string, annotation?: string, position?: number): this {
    if (position === undefined || position === StaveModifierPosition.BEGIN) {
      this.clef = clef;
    } else if (position === StaveModifierPosition.END) {
      this.endClef = clef;
    }

    this.addModifier(new Clef(clef, size, annotation), position);
    return this;
  }

  addEndClef(clef: string, size?: string, annotation?: string): this {
    this.addClef(clef, size, annotation, StaveModifierPosition.END);
    return this;
  }

  /**
   * Add a time signature to the stave
   *
   * Example:
   *
   * `stave.addTimeSignature('4/4');`
   * @param timeSpec time signature specification `(C\||C|\d\/\d)`
   * @param customPadding
   * @param position
   * @returns
   */
  addTimeSignature(timeSpec: string, customPadding?: number, position?: number): this {
    this.addModifier(new TimeSignature(timeSpec, customPadding), position);
    return this;
  }

  addEndTimeSignature(timeSpec: string, customPadding?: number): this {
    this.addTimeSignature(timeSpec, customPadding, StaveModifierPosition.END);
    return this;
  }

  // Deprecated
  addTrebleGlyph(): this {
    this.addClef('treble');
    return this;
  }

  /**
   * @param position
   * @param category
   * @returns array of StaveModifiers that match the provided position and category.
   */
  getModifiers(position?: number, category?: string): StaveModifier[] {
    const noPosition = position === undefined;
    const noCategory = category === undefined;
    if (noPosition && noCategory) {
      return this.modifiers;
    } else if (noPosition) {
      // A category was provided.
      return this.modifiers.filter((m: StaveModifier) => category === m.getCategory());
    } else if (noCategory) {
      // A position was provided.
      return this.modifiers.filter((m: StaveModifier) => position === m.getPosition());
    } else {
      // Both position and category were provided!
      return this.modifiers.filter((m: StaveModifier) => position === m.getPosition() && category === m.getCategory());
    }
  }

  /**
   * Use the modifier's `getCategory()` as a key for the `order` array.
   * The retrieved value is used to sort modifiers from left to right (0 to to 3).
   */
  sortByCategory(items: StaveModifier[], order: Record<string, number>): void {
    for (let i = items.length - 1; i >= 0; i--) {
      for (let j = 0; j < i; j++) {
        if (order[items[j].getCategory()] > order[items[j + 1].getCategory()]) {
          const temp = items[j];
          items[j] = items[j + 1];
          items[j + 1] = temp;
        }
      }
    }
  }

  format(): void {
    const begBarline = this.modifiers[0] as Barline;
    const endBarline = this.modifiers[1];

    const begModifiers = this.getModifiers(StaveModifierPosition.BEGIN);
    const endModifiers = this.getModifiers(StaveModifierPosition.END);

    this.sortByCategory(begModifiers, SORT_ORDER_BEG_MODIFIERS);
    this.sortByCategory(endModifiers, SORT_ORDER_END_MODIFIERS);

    if (begModifiers.length > 1 && begBarline.getType() === BarlineType.REPEAT_BEGIN) {
      begModifiers.push(begModifiers.splice(0, 1)[0]);
      begModifiers.splice(0, 0, new Barline(BarlineType.SINGLE));
    }

    if (endModifiers.indexOf(endBarline) > 0) {
      endModifiers.splice(0, 0, new Barline(BarlineType.NONE));
    }

    let width;
    let padding;
    let modifier;
    let offset = 0;
    let x = this.x;
    for (let i = 0; i < begModifiers.length; i++) {
      modifier = begModifiers[i];
      padding = modifier.getPadding(i + offset);
      width = modifier.getWidth();

      x += padding;
      modifier.setX(x);
      x += width;

      if (padding + width === 0) offset--;
    }

    this.start_x = x;
    x = this.x + this.width;

    const widths = {
      left: 0,
      right: 0,
      paddingRight: 0,
      paddingLeft: 0,
    };

    let lastBarlineIdx = 0;

    for (let i = 0; i < endModifiers.length; i++) {
      modifier = endModifiers[i];
      lastBarlineIdx = isBarline(modifier) ? i : lastBarlineIdx;

      widths.right = 0;
      widths.left = 0;
      widths.paddingRight = 0;
      widths.paddingLeft = 0;
      const layoutMetrics = modifier.getLayoutMetrics();

      if (layoutMetrics) {
        if (i !== 0) {
          widths.right = layoutMetrics.xMax || 0;
          widths.paddingRight = layoutMetrics.paddingRight || 0;
        }
        widths.left = -layoutMetrics.xMin || 0;
        widths.paddingLeft = layoutMetrics.paddingLeft || 0;

        if (i === endModifiers.length - 1) {
          widths.paddingLeft = 0;
        }
      } else {
        widths.paddingRight = modifier.getPadding(i - lastBarlineIdx);
        if (i !== 0) {
          widths.right = modifier.getWidth();
        }
        if (i === 0) {
          widths.left = modifier.getWidth();
        }
      }
      x -= widths.paddingRight;
      x -= widths.right;

      modifier.setX(x);

      x -= widths.left;
      x -= widths.paddingLeft;
    }

    this.end_x = endModifiers.length === 1 ? this.x + this.width : x;
    this.formatted = true;
  }

  /**
   * All drawing functions below need the context to be set.
   */
  draw(): this {
    const ctx = this.checkContext();
    this.setRendered();

    this.applyStyle();
    ctx.openGroup('stave', this.getAttribute('id'));
    if (!this.formatted) this.format();

    const num_lines = this.options.num_lines;
    const width = this.width;
    const x = this.x;
    let y;

    // Render lines
    for (let line = 0; line < num_lines; line++) {
      y = this.getYForLine(line);

      if (this.options.line_config[line].visible) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
      }
    }

    ctx.closeGroup();
    this.restoreStyle();

    // Draw the modifiers (bar lines, coda, segno, repeat brackets, etc.)
    for (let i = 0; i < this.modifiers.length; i++) {
      const modifier = this.modifiers[i];
      // Only draw modifier if it has a draw function
      if (typeof modifier.draw === 'function') {
        modifier.applyStyle(ctx);
        modifier.draw(this, this.getModifierXShift(i));
        modifier.restoreStyle(ctx);
      }
    }

    // Render measure numbers
    if (this.measure > 0) {
      ctx.save();
      ctx.setFont(this.textFont);
      const textWidth = ctx.measureText('' + this.measure).width;
      y = this.getYForTopText(0) + 3;
      ctx.fillText('' + this.measure, this.x - textWidth / 2, y);
      ctx.restore();
    }
    return this;
  }

  getVerticalBarWidth(): number {
    return this.options.vertical_bar_width;
  }

  /**
   * Get the current configuration for the Stave.
   * @return {Array} An array of configuration objects.
   */
  getConfigForLines(): StaveLineConfig[] {
    return this.options.line_config;
  }

  /**
   * Configure properties of the lines in the Stave
   * @param line_number The index of the line to configure.
   * @param line_config An configuration object for the specified line.
   * @throws RuntimeError "StaveConfigError" When the specified line number is out of
   *   range of the number of lines specified in the constructor.
   */
  setConfigForLine(line_number: number, line_config: StaveLineConfig): this {
    if (line_number >= this.options.num_lines || line_number < 0) {
      throw new RuntimeError(
        'StaveConfigError',
        'The line number must be within the range of the number of lines in the Stave.'
      );
    }

    if (line_config.visible === undefined) {
      throw new RuntimeError('StaveConfigError', "The line configuration object is missing the 'visible' property.");
    }

    if (typeof line_config.visible !== 'boolean') {
      throw new RuntimeError(
        'StaveConfigError',
        "The line configuration objects 'visible' property must be true or false."
      );
    }

    this.options.line_config[line_number] = line_config;

    return this;
  }

  /**
   * Set the staff line configuration array for all of the lines at once.
   * @param lines_configuration An array of line configuration objects.  These objects
   *   are of the same format as the single one passed in to setLineConfiguration().
   *   The caller can set null for any line config entry if it is desired that the default be used
   * @throws RuntimeError "StaveConfigError" When the lines_configuration array does not have
   *   exactly the same number of elements as the num_lines configuration object set in
   *   the constructor.
   */
  setConfigForLines(lines_configuration: StaveLineConfig[]): this {
    if (lines_configuration.length !== this.options.num_lines) {
      throw new RuntimeError(
        'StaveConfigError',
        'The length of the lines configuration array must match the number of lines in the Stave'
      );
    }

    // Make sure the defaults are present in case an incomplete set of
    //  configuration options were supplied.
    // eslint-disable-next-line
    for (const line_config in lines_configuration) {
      // Allow '{}' to be used if the caller just wants the default for a particular node.
      if (lines_configuration[line_config].visible == undefined) {
        lines_configuration[line_config] = this.options.line_config[line_config];
      }
      this.options.line_config[line_config] = {
        ...this.options.line_config[line_config],
        ...lines_configuration[line_config],
      };
    }

    this.options.line_config = lines_configuration;

    return this;
  }

  static formatBegModifiers(staves: Stave[]): void {
    const adjustCategoryStartX = (category: Category) => {
      let minStartX = 0;
      // Calculate min start X for the category
      staves.forEach((stave) => {
        const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, category);
        // Consider only the first instance
        if (modifiers.length > 0 && modifiers[0].getX() > minStartX) minStartX = modifiers[0].getX();
      });
      let adjustX = 0;
      staves.forEach((stave) => {
        adjustX = 0;
        const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, category);
        // Calculate adjustement required for the stave
        modifiers.forEach((modifier) => {
          if (minStartX - modifier.getX() > adjustX) adjustX = minStartX - modifier.getX();
        });
        const allModifiers = stave.getModifiers(StaveModifierPosition.BEGIN);
        let bAdjust = false;
        // Apply adjustment to all the modifiers in and beyond the category
        allModifiers.forEach((modifier) => {
          if (modifier.getCategory() === category) bAdjust = true;
          if (bAdjust && adjustX > 0) modifier.setX(modifier.getX() + adjustX);
        });
        // Apply adjustment also to note start.
        stave.setNoteStartX(stave.getNoteStartX() + adjustX);
      });
    };

    // Make sure that staves are formatted
    staves.forEach((stave) => {
      if (!stave.formatted) stave.format();
    });
    // Align Clefs
    adjustCategoryStartX(Category.Clef);
    // Align key signatures
    adjustCategoryStartX(Category.KeySignature);
    // Align time signatures
    adjustCategoryStartX(Category.TimeSignature);

    let maxX = 0;
    // align note start
    staves.forEach((stave) => {
      if (stave.getNoteStartX() > maxX) maxX = stave.getNoteStartX();
    });
    staves.forEach((stave) => {
      stave.setNoteStartX(maxX);
    });

    maxX = 0;
    // align REPEAT_BEGIN
    staves.forEach((stave) => {
      const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, Category.Barline);
      modifiers.forEach((modifier) => {
        if ((modifier as Barline).getType() == BarlineType.REPEAT_BEGIN)
          if (modifier.getX() > maxX) maxX = modifier.getX();
      });
    });
    staves.forEach((stave) => {
      const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, Category.Barline);
      modifiers.forEach((modifier) => {
        if ((modifier as Barline).getType() == BarlineType.REPEAT_BEGIN) modifier.setX(maxX);
      });
    });
  }
}
