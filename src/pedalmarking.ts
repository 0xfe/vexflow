// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Element } from './element';
import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Glyph } from './glyph';
import { RenderContext } from './rendercontext';
import { StaveNote } from './stavenote';
import { Tables } from './tables';
import { Category } from './typeguard';
import { log, RuntimeError } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (PedalMarking.DEBUG) log('Vex.Flow.PedalMarking', args);
}

/**
 * Draws a pedal glyph with the provided `name` on a rendering `context`
 * at the coordinates `x` and `y. Takes into account the glyph data
 * coordinate shifts.
 */
function drawPedalGlyph(name: string, context: RenderContext, x: number, y: number, point: number): void {
  const glyph_data = PedalMarking.GLYPHS[name];
  const glyph = new Glyph(glyph_data.code, point, { category: 'pedalMarking' });
  // Center the middle of the glyph with the middle of the note head (Tables.STAVE_LINE_DISTANCE / 2)
  glyph.render(context, x - (glyph.getMetrics().width - Tables.STAVE_LINE_DISTANCE) / 2, y);
}

/**
 * PedalMarking implements different types of pedal markings. These notation
 * elements indicate to the performer when to depress and release the a pedal.
 *
 * In order to create "Sostenuto", and "una corda" markings, you must set
 * custom text for the release/depress pedal markings.
 */
export class PedalMarking extends Element {
  /** To enable logging for this class. Set `Vex.Flow.PedalMarking.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.PedalMarking;
  }

  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SERIF,
    size: 12,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
  };

  protected line: number;
  protected type: number;
  protected custom_depress_text: string;
  protected custom_release_text: string;
  public render_options: {
    color: string;
    bracket_height: number;
    text_margin_right: number;
    bracket_line_width: number;
  };
  protected notes: StaveNote[];

  /** Glyph data */
  static readonly GLYPHS: Record<string, { code: string }> = {
    pedal_depress: {
      code: 'keyboardPedalPed',
    },
    pedal_release: {
      code: 'keyboardPedalUp',
    },
  };

  /** Pedal type as number. */
  static readonly type = {
    TEXT: 1,
    BRACKET: 2,
    MIXED: 3,
  };

  /** Pedal type as string. */
  static readonly typeString: Record<string, number> = {
    text: PedalMarking.type.TEXT,
    bracket: PedalMarking.type.BRACKET,
    mixed: PedalMarking.type.MIXED,
  };

  /**
   * Create a sustain pedal marking. Returns the defaults PedalMarking.
   * Which uses the traditional "Ped" and "*"" markings.
   */
  static createSustain(notes: StaveNote[]): PedalMarking {
    const pedal = new PedalMarking(notes);
    return pedal;
  }

  /** Create a sostenuto pedal marking */
  static createSostenuto(notes: StaveNote[]): PedalMarking {
    const pedal = new PedalMarking(notes);
    pedal.setType(PedalMarking.type.MIXED);
    pedal.setCustomText('Sost. Ped.');
    return pedal;
  }

  /** Create an una corda pedal marking */
  static createUnaCorda(notes: StaveNote[]): PedalMarking {
    const pedal = new PedalMarking(notes);
    pedal.setType(PedalMarking.type.TEXT);
    pedal.setCustomText('una corda', 'tre corda');
    return pedal;
  }

  constructor(notes: StaveNote[]) {
    super();

    this.notes = notes;
    this.type = PedalMarking.type.TEXT;
    this.line = 0;

    // Custom text for the release/depress markings
    this.custom_depress_text = '';
    this.custom_release_text = '';

    this.resetFont();

    this.render_options = {
      bracket_height: 10,
      text_margin_right: 6,
      bracket_line_width: 1,
      color: 'black',
    };
  }

  /** Set pedal type. */
  setType(type: string | number): this {
    type = typeof type === 'string' ? PedalMarking.typeString[type] : type;

    if (type >= PedalMarking.type.TEXT && type <= PedalMarking.type.MIXED) {
      this.type = type;
    }
    return this;
  }

  /**
   * Set custom text for the `depress`/`release` pedal markings. No text is
   * set if the parameter is falsy.
   */
  setCustomText(depress: string, release?: string): this {
    this.custom_depress_text = depress || '';
    this.custom_release_text = release || '';
    return this;
  }

  /** Set the staff line to render the markings on. */
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  /** Draw the bracket based pedal markings. */
  drawBracketed(): void {
    const ctx = this.checkContext();
    let is_pedal_depressed = false;
    let prev_x: number;
    let prev_y: number;

    // Iterate through each note
    this.notes.forEach((note, index, notes) => {
      // Each note triggers the opposite pedal action
      is_pedal_depressed = !is_pedal_depressed;

      // Get the initial coordinates for the note
      const x = note.getAbsoluteX();
      const y = note.checkStave().getYForBottomText(this.line + 3);

      // Throw if current note is positioned before the previous note
      if (x < prev_x) {
        throw new RuntimeError('InvalidConfiguration', 'The notes provided must be in order of ascending x positions');
      }

      // Determine if the previous or next note are the same
      // as the current note. We need to keep track of this for
      // when adjustments are made for the release+depress action
      const next_is_same = notes[index + 1] === note;
      const prev_is_same = notes[index - 1] === note;

      let x_shift = 0;
      const point =
        Tables.currentMusicFont().lookupMetric(`pedalMarking.${is_pedal_depressed ? 'down' : 'up'}.point`) ??
        Tables.NOTATION_FONT_SCALE;

      if (is_pedal_depressed) {
        // Adjustment for release+depress
        x_shift = prev_is_same ? 5 : 0;

        if (this.type === PedalMarking.type.MIXED && !prev_is_same) {
          // For MIXED style, start with text instead of bracket
          if (this.custom_depress_text) {
            // If we have custom text, use instead of the default "Ped" glyph
            const text_width = ctx.measureText(this.custom_depress_text).width;
            ctx.fillText(this.custom_depress_text, x - text_width / 2, y);
            x_shift = text_width / 2 + this.render_options.text_margin_right;
          } else {
            // Render the Ped glyph in position
            drawPedalGlyph('pedal_depress', ctx, x, y, point);
            x_shift = 20 + this.render_options.text_margin_right;
          }
        } else {
          // Draw start bracket
          ctx.beginPath();
          ctx.moveTo(x, y - this.render_options.bracket_height);
          ctx.lineTo(x + x_shift, y);
          ctx.stroke();
          ctx.closePath();
        }
      } else {
        // Adjustment for release+depress
        x_shift = next_is_same ? -5 : 0;

        // Draw end bracket
        ctx.beginPath();
        ctx.moveTo(prev_x, prev_y);
        ctx.lineTo(x + x_shift, y);
        ctx.lineTo(x, y - this.render_options.bracket_height);
        ctx.stroke();
        ctx.closePath();
      }

      // Store previous coordinates
      prev_x = x + x_shift;
      prev_y = y;
    });
  }

  /**
   * Draw the text based pedal markings. This defaults to the traditional
   * "Ped" and "*"" symbols if no custom text has been provided.
   */
  drawText(): void {
    const ctx = this.checkContext();
    let is_pedal_depressed = false;

    // Iterate through each note, placing glyphs or custom text accordingly
    this.notes.forEach((note) => {
      is_pedal_depressed = !is_pedal_depressed;
      const stave = note.checkStave();
      const x = note.getAbsoluteX();
      const y = stave.getYForBottomText(this.line + 3);

      const point =
        Tables.currentMusicFont().lookupMetric(`pedalMarking.${is_pedal_depressed ? 'down' : 'up'}.point`) ??
        Tables.NOTATION_FONT_SCALE;

      let text_width = 0;
      if (is_pedal_depressed) {
        if (this.custom_depress_text) {
          text_width = ctx.measureText(this.custom_depress_text).width;
          ctx.fillText(this.custom_depress_text, x - text_width / 2, y);
        } else {
          drawPedalGlyph('pedal_depress', ctx, x, y, point);
        }
      } else {
        if (this.custom_release_text) {
          text_width = ctx.measureText(this.custom_release_text).width;
          ctx.fillText(this.custom_release_text, x - text_width / 2, y);
        } else {
          drawPedalGlyph('pedal_release', ctx, x, y, point);
        }
      }
    });
  }

  /** Render the pedal marking in position on the rendering context. */
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setStrokeStyle(this.render_options.color);
    ctx.setFillStyle(this.render_options.color);
    ctx.setFont(this.textFont);

    L('Rendering Pedal Marking');

    if (this.type === PedalMarking.type.BRACKET || this.type === PedalMarking.type.MIXED) {
      ctx.setLineWidth(this.render_options.bracket_line_width);
      this.drawBracketed();
    } else if (this.type === PedalMarking.type.TEXT) {
      this.drawText();
    }

    ctx.restore();
  }
}
