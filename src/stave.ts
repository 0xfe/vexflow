// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

import { Vex } from './vex';
import { Element } from './element';
import { Flow } from './tables';
import { Barline } from './stavebarline';
import { StaveModifier } from './stavemodifier';
import { Repetition } from './staverepetition';
import { StaveSection } from './stavesection';
import { StaveTempo } from './stavetempo';
import { StaveText } from './stavetext';
import { BoundingBox } from './boundingbox';
import { Clef } from './clef';
import { KeySignature } from './keysignature';
import { TimeSignature } from './timesignature';
import { Volta } from './stavevolta';

export class Stave extends Element {
  constructor(x, y, width, options) {
    super();
    this.setAttribute('type', 'Stave');

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
    this.font = {
      family: 'sans-serif',
      size: 8,
      weight: '',
    };
    this.options = {
      vertical_bar_width: 10, // Width around vertical bar end-marker
      glyph_spacing_px: 10,
      num_lines: 5,
      fill_style: '#999999',
      left_bar: true, // draw vertical bar on left
      right_bar: true, // draw vertical bar on right
      spacing_between_lines_px: Flow.STAVE_LINE_DISTANCE, // in pixels
      space_above_staff_ln: 4, // in staff lines
      space_below_staff_ln: 4, // in staff lines
      top_text_position: 1, // in staff lines
    };
    this.bounds = { x: this.x, y: this.y, w: this.width, h: 0 };
    Vex.Merge(this.options, options);

    this.resetLines();

    const BARTYPE = Barline.type;
    // beg bar
    this.addModifier(new Barline(this.options.left_bar ? BARTYPE.SINGLE : BARTYPE.NONE));
    // end bar
    this.addEndModifier(new Barline(this.options.right_bar ? BARTYPE.SINGLE : BARTYPE.NONE));
  }

  space(spacing) {
    return this.options.spacing_between_lines_px * spacing;
  }

  resetLines() {
    this.options.line_config = [];
    for (let i = 0; i < this.options.num_lines; i++) {
      this.options.line_config.push({ visible: true });
    }
    this.height = (this.options.num_lines + this.options.space_above_staff_ln) * this.options.spacing_between_lines_px;
    this.options.bottom_text_position = this.options.num_lines;
  }

  getOptions() {
    return this.options;
  }

  setNoteStartX(x) {
    if (!this.formatted) this.format();

    this.start_x = x;
    const begBarline = this.modifiers[0];
    begBarline.setX(this.start_x - begBarline.getWidth());
    return this;
  }
  getNoteStartX() {
    if (!this.formatted) this.format();

    return this.start_x;
  }

  getNoteEndX() {
    if (!this.formatted) this.format();

    return this.end_x;
  }
  getTieStartX() {
    return this.start_x;
  }
  getTieEndX() {
    return this.x + this.width;
  }
  getX() {
    return this.x;
  }
  getNumLines() {
    return this.options.num_lines;
  }
  setNumLines(lines) {
    this.options.num_lines = parseInt(lines, 10);
    this.resetLines();
    return this;
  }
  setY(y) {
    this.y = y;
    return this;
  }

  getTopLineTopY() {
    return this.getYForLine(0) - Flow.STAVE_LINE_THICKNESS / 2;
  }
  getBottomLineBottomY() {
    return this.getYForLine(this.getNumLines() - 1) + Flow.STAVE_LINE_THICKNESS / 2;
  }

  setX(x) {
    const shift = x - this.x;
    this.formatted = false;
    this.x = x;
    this.start_x += shift;
    this.end_x += shift;
    for (let i = 0; i < this.modifiers.length; i++) {
      const mod = this.modifiers[i];
      if (mod.x !== undefined) {
        mod.x += shift;
      }
    }
    return this;
  }

  setWidth(width) {
    this.formatted = false;
    this.width = width;
    this.end_x = this.x + width;

    // reset the x position of the end barline (TODO(0xfe): This makes no sense)
    // this.modifiers[1].setX(this.end_x);
    return this;
  }

  getWidth() {
    return this.width;
  }

  getStyle() {
    return {
      fillStyle: this.options.fill_style,
      strokeStyle: this.options.fill_style, // yes, this is correct for legacy compatibility
      lineWidth: Flow.STAVE_LINE_THICKNESS,
      ...(this.style || {}),
    };
  }

  setMeasure(measure) {
    this.measure = measure;
    return this;
  }

  /**
   * Gets the pixels to shift from the beginning of the stave
   * following the modifier at the provided index
   * @param  {Number} index The index from which to determine the shift
   * @return {Number}       The amount of pixels shifted
   */
  getModifierXShift(index = 0) {
    if (typeof index !== 'number') {
      throw new Vex.RERR('InvalidIndex', 'Must be of number type');
    }

    if (!this.formatted) this.format();

    if (this.getModifiers(StaveModifier.Position.BEGIN).length === 1) {
      return 0;
    }

    // for right position modifiers zero shift seems correct, see 'Volta + Modifier Measure Test'
    if (this.modifiers[index].getPosition() === StaveModifier.Position.RIGHT) {
      return 0;
    }

    let start_x = this.start_x - this.x;
    const begBarline = this.modifiers[0];
    if (begBarline.getType() === Barline.type.REPEAT_BEGIN && start_x > begBarline.getWidth()) {
      start_x -= begBarline.getWidth();
    }

    return start_x;
  }

  // Coda & Segno Symbol functions
  setRepetitionTypeLeft(type, y) {
    this.modifiers.push(new Repetition(type, this.x, y));
    return this;
  }

  setRepetitionTypeRight(type, y) {
    this.modifiers.push(new Repetition(type, this.x, y));
    return this;
  }

  // Volta functions
  setVoltaType(type, number_t, y) {
    this.modifiers.push(new Volta(type, number_t, this.x, y));
    return this;
  }

  // Section functions
  setSection(section, y) {
    this.modifiers.push(new StaveSection(section, this.x, y));
    return this;
  }

  // Tempo functions
  setTempo(tempo, y) {
    this.modifiers.push(new StaveTempo(tempo, this.x, y));
    return this;
  }

  // Text functions
  setText(text, position, options) {
    this.modifiers.push(new StaveText(text, position, options));
    return this;
  }

  getHeight() {
    return this.height;
  }

  getSpacingBetweenLines() {
    return this.options.spacing_between_lines_px;
  }

  getBoundingBox() {
    return new BoundingBox(this.x, this.y, this.width, this.getBottomY() - this.y);
  }

  getBottomY() {
    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const score_bottom = this.getYForLine(options.num_lines) + options.space_below_staff_ln * spacing;

    return score_bottom;
  }

  getBottomLineY() {
    return this.getYForLine(this.options.num_lines);
  }

  // This returns the y for the *center* of a staff line
  getYForLine(line) {
    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const headroom = options.space_above_staff_ln;

    const y = this.y + line * spacing + headroom * spacing;

    return y;
  }

  getLineForY(y) {
    // Does the reverse of getYForLine - somewhat dumb and just calls
    // getYForLine until the right value is reaches

    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const headroom = options.space_above_staff_ln;
    return (y - this.y) / spacing - headroom;
  }

  getYForTopText(line) {
    const l = line || 0;
    return this.getYForLine(-l - this.options.top_text_position);
  }

  getYForBottomText(line) {
    const l = line || 0;
    return this.getYForLine(this.options.bottom_text_position + l);
  }

  getYForNote(line) {
    const options = this.options;
    const spacing = options.spacing_between_lines_px;
    const headroom = options.space_above_staff_ln;
    const y = this.y + headroom * spacing + 5 * spacing - line * spacing;

    return y;
  }

  getYForGlyphs() {
    return this.getYForLine(3);
  }

  // This method adds a stave modifier to the stave. Note that the first two
  // modifiers (BarLines) are automatically added upon construction.
  addModifier(modifier, position) {
    if (position !== undefined) {
      modifier.setPosition(position);
    }

    modifier.setStave(this);
    this.formatted = false;
    this.modifiers.push(modifier);
    return this;
  }

  addEndModifier(modifier) {
    this.addModifier(modifier, StaveModifier.Position.END);
    return this;
  }

  // Bar Line functions
  setBegBarType(type) {
    // Only valid bar types at beginning of stave is none, single or begin repeat
    const { SINGLE, REPEAT_BEGIN, NONE } = Barline.type;
    if (type === SINGLE || type === REPEAT_BEGIN || type === NONE) {
      this.modifiers[0].setType(type);
      this.formatted = false;
    }
    return this;
  }

  setEndBarType(type) {
    // Repeat end not valid at end of stave
    if (type !== Barline.type.REPEAT_BEGIN) {
      this.modifiers[1].setType(type);
      this.formatted = false;
    }
    return this;
  }

  setClef(clefSpec, size, annotation, position) {
    if (position === undefined) {
      position = StaveModifier.Position.BEGIN;
    }

    if (position === StaveModifier.Position.END) {
      this.endClef = clefSpec;
    } else {
      this.clef = clefSpec;
    }

    const clefs = this.getModifiers(position, Clef.CATEGORY);
    if (clefs.length === 0) {
      this.addClef(clefSpec, size, annotation, position);
    } else {
      clefs[0].setType(clefSpec, size, annotation);
    }

    return this;
  }

  setEndClef(clefSpec, size, annotation) {
    this.setClef(clefSpec, size, annotation, StaveModifier.Position.END);
    return this;
  }

  setKeySignature(keySpec, cancelKeySpec, position) {
    if (position === undefined) {
      position = StaveModifier.Position.BEGIN;
    }

    const keySignatures = this.getModifiers(position, KeySignature.CATEGORY);
    if (keySignatures.length === 0) {
      this.addKeySignature(keySpec, cancelKeySpec, position);
    } else {
      keySignatures[0].setKeySig(keySpec, cancelKeySpec);
    }

    return this;
  }

  setEndKeySignature(keySpec, cancelKeySpec) {
    this.setKeySignature(keySpec, cancelKeySpec, StaveModifier.Position.END);
    return this;
  }

  setTimeSignature(timeSpec, customPadding, position) {
    if (position === undefined) {
      position = StaveModifier.Position.BEGIN;
    }

    const timeSignatures = this.getModifiers(position, TimeSignature.CATEGORY);
    if (timeSignatures.length === 0) {
      this.addTimeSignature(timeSpec, customPadding, position);
    } else {
      timeSignatures[0].setTimeSig(timeSpec);
    }

    return this;
  }

  setEndTimeSignature(timeSpec, customPadding) {
    this.setTimeSignature(timeSpec, customPadding, StaveModifier.Position.END);
    return this;
  }

  addKeySignature(keySpec, cancelKeySpec, position) {
    if (position === undefined) {
      position = StaveModifier.Position.BEGIN;
    }
    this.addModifier(new KeySignature(keySpec, cancelKeySpec).setPosition(position), position);
    return this;
  }

  addClef(clef, size, annotation, position) {
    if (position === undefined || position === StaveModifier.Position.BEGIN) {
      this.clef = clef;
    } else if (position === StaveModifier.Position.END) {
      this.endClef = clef;
    }

    this.addModifier(new Clef(clef, size, annotation), position);
    return this;
  }

  addEndClef(clef, size, annotation) {
    this.addClef(clef, size, annotation, StaveModifier.Position.END);
    return this;
  }

  addTimeSignature(timeSpec, customPadding, position) {
    this.addModifier(new TimeSignature(timeSpec, customPadding), position);
    return this;
  }

  addEndTimeSignature(timeSpec, customPadding) {
    this.addTimeSignature(timeSpec, customPadding, StaveModifier.Position.END);
    return this;
  }

  // Deprecated
  addTrebleGlyph() {
    this.addClef('treble');
    return this;
  }

  getModifiers(position, category) {
    if (position === undefined && category === undefined) return this.modifiers;

    return this.modifiers.filter(
      (modifier) =>
        (position === undefined || position === modifier.getPosition()) &&
        (category === undefined || category === modifier.getCategory())
    );
  }

  sortByCategory(items, order) {
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

  format() {
    const begBarline = this.modifiers[0];
    const endBarline = this.modifiers[1];

    const begModifiers = this.getModifiers(StaveModifier.Position.BEGIN);
    const endModifiers = this.getModifiers(StaveModifier.Position.END);

    this.sortByCategory(begModifiers, {
      barlines: 0,
      clefs: 1,
      keysignatures: 2,
      timesignatures: 3,
    });

    this.sortByCategory(endModifiers, {
      timesignatures: 0,
      keysignatures: 1,
      barlines: 2,
      clefs: 3,
    });

    if (begModifiers.length > 1 && begBarline.getType() === Barline.type.REPEAT_BEGIN) {
      begModifiers.push(begModifiers.splice(0, 1)[0]);
      begModifiers.splice(0, 0, new Barline(Barline.type.SINGLE));
    }

    if (endModifiers.indexOf(endBarline) > 0) {
      endModifiers.splice(0, 0, new Barline(Barline.type.NONE));
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
      lastBarlineIdx = modifier.getCategory() === 'barlines' ? i : lastBarlineIdx;

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
  draw() {
    this.checkContext();
    this.setRendered();

    if (!this.formatted) this.format();

    const num_lines = this.options.num_lines;
    const width = this.width;
    const x = this.x;
    let y;

    // Render lines
    for (let line = 0; line < num_lines; line++) {
      y = this.getYForLine(line);

      this.applyStyle();
      if (this.options.line_config[line].visible) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + width, y);
        this.context.stroke();
      }
      this.restoreStyle();
    }

    // Draw the modifiers (bar lines, coda, segno, repeat brackets, etc.)
    for (let i = 0; i < this.modifiers.length; i++) {
      // Only draw modifier if it has a draw function
      if (typeof this.modifiers[i].draw === 'function') {
        this.modifiers[i].applyStyle(this.context);
        this.modifiers[i].draw(this, this.getModifierXShift(i));
        this.modifiers[i].restoreStyle(this.context);
      }
    }

    // Render measure numbers
    if (this.measure > 0) {
      this.context.save();
      this.context.setFont(this.font.family, this.font.size, this.font.weight);
      const text_width = this.context.measureText('' + this.measure).width;
      y = this.getYForTopText(0) + 3;
      this.context.fillText('' + this.measure, this.x - text_width / 2, y);
      this.context.restore();
    }

    return this;
  }

  // Draw Simple barlines for backward compatability
  // Do not delete - draws the beginning bar of the stave
  drawVertical(x, isDouble) {
    this.drawVerticalFixed(this.x + x, isDouble);
  }

  drawVerticalFixed(x, isDouble) {
    this.checkContext();

    const top_line = this.getYForLine(0);
    const bottom_line = this.getYForLine(this.options.num_lines - 1);
    if (isDouble) {
      this.context.fillRect(x - 3, top_line, 1, bottom_line - top_line + 1);
    }
    this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
  }

  drawVerticalBar(x) {
    this.drawVerticalBarFixed(this.x + x, false);
  }

  drawVerticalBarFixed(x) {
    this.checkContext();

    const top_line = this.getYForLine(0);
    const bottom_line = this.getYForLine(this.options.num_lines - 1);
    this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
  }

  /**
   * Get the current configuration for the Stave.
   * @return {Array} An array of configuration objects.
   */
  getConfigForLines() {
    return this.options.line_config;
  }

  /**
   * Configure properties of the lines in the Stave
   * @param line_number The index of the line to configure.
   * @param line_config An configuration object for the specified line.
   * @throws Vex.RERR "StaveConfigError" When the specified line number is out of
   *   range of the number of lines specified in the constructor.
   */
  setConfigForLine(line_number, line_config) {
    if (line_number >= this.options.num_lines || line_number < 0) {
      throw new Vex.RERR(
        'StaveConfigError',
        'The line number must be within the range of the number of lines in the Stave.'
      );
    }

    if (line_config.visible === undefined) {
      throw new Vex.RERR('StaveConfigError', "The line configuration object is missing the 'visible' property.");
    }

    if (typeof line_config.visible !== 'boolean') {
      throw new Vex.RERR(
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
   * @throws Vex.RERR "StaveConfigError" When the lines_configuration array does not have
   *   exactly the same number of elements as the num_lines configuration object set in
   *   the constructor.
   */
  setConfigForLines(lines_configuration) {
    if (lines_configuration.length !== this.options.num_lines) {
      throw new Vex.RERR(
        'StaveConfigError',
        'The length of the lines configuration array must match the number of lines in the Stave'
      );
    }

    // Make sure the defaults are present in case an incomplete set of
    //  configuration options were supplied.
    // eslint-disable-next-line
    for (const line_config in lines_configuration) {
      // Allow 'null' to be used if the caller just wants the default for a particular node.
      if (!lines_configuration[line_config]) {
        lines_configuration[line_config] = this.options.line_config[line_config];
      }
      Vex.Merge(this.options.line_config[line_config], lines_configuration[line_config]);
    }

    this.options.line_config = lines_configuration;

    return this;
  }
}
