// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This file implements different types of pedal markings. These notation
// elements indicate to the performer when to depress and release the a pedal.
//
// In order to create "Sostenuto", and "una corda" markings, you must set
// custom text for the release/depress pedal markings.

import {Vex} from './vex';
import {Element} from './element';
import {Glyph} from './glyph';
import {DrawContext, IPedalMarkingGlyph, IPedalMarkingRenderOptions, IStyle} from "./types/common";
import {StaveNote} from "./stavenote";
import {IFont} from "./types/font";

// To enable logging for this class. Set `Vex.Flow.PedalMarking.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (PedalMarking.DEBUG) Vex.L('Vex.Flow.PedalMarking', args);
}

// Draws a pedal glyph with the provided `name` on a rendering `context`
// at the coordinates `x` and `y. Takes into account the glyph data
// coordinate shifts.
function drawPedalGlyph(name: string, context: DrawContext, x: number, y: number, point: number) {
  const glyph_data = PedalMarking.GLYPHS[name];
  const glyph = new Glyph(glyph_data.code, point, {category: 'pedalMarking'});
  glyph.render(context, x + glyph_data.x_shift, y + glyph_data.y_shift);
}

export class PedalMarking extends Element {
  static DEBUG: boolean;

  private line: number;
  private custom_depress_text: string;
  private custom_release_text: string;
  private render_options: IPedalMarkingRenderOptions;
  private font: IFont;
  private notes: StaveNote[];
  private static TEXT: never;

  // Glyph data
  static get GLYPHS(): Record<string, IPedalMarkingGlyph> {
    return {
      'pedal_depress': {
        code: 'keyboardPedalPed',
        x_shift: -10,
        y_shift: 0,
      },
      'pedal_release': {
        code: 'keyboardPedalUp',
        x_shift: -2,
        y_shift: 3,
      },
    };
  }

  static get Styles(): Record<string, number> {
    return {
      TEXT: 1,
      BRACKET: 2,
      MIXED: 3,
    };
  }

  static get StylesString(): Record<string, number> {
    return {
      text: PedalMarking.Styles.TEXT,
      bracket: PedalMarking.Styles.BRACKET,
      mixed: PedalMarking.Styles.MIXED,
    };
  }

  // Create a sustain pedal marking. Returns the defaults PedalMarking.
  // Which uses the traditional "Ped" and "*"" markings.
  static createSustain(notes: StaveNote[]): PedalMarking {
    return new PedalMarking(notes);
  }

  // Create a sostenuto pedal marking
  static createSostenuto(notes: StaveNote[]): PedalMarking {
    const pedal = new PedalMarking(notes);
    pedal.setStyle(PedalMarking.Styles.MIXED);
    pedal.setCustomText('Sost. Ped.');
    return pedal;
  }

  // Create an una corda pedal marking
  static createUnaCorda(notes: StaveNote[]): PedalMarking {
    const pedal = new PedalMarking(notes);
    pedal.setStyle(PedalMarking.Styles.TEXT);
    pedal.setCustomText('una corda', 'tre corda');
    return pedal;
  }

  // ## Prototype Methods
  constructor(notes: StaveNote[]) {
    super();
    this.setAttribute('type', 'PedalMarking');

    this.notes = notes;
    this.style = PedalMarking.TEXT;
    this.line = 0;

    // Custom text for the release/depress markings
    this.custom_depress_text = '';
    this.custom_release_text = '';

    this.font = {
      family: 'Times New Roman',
      size: 12,
      weight: 'italic bold',
    } as IFont;

    this.render_options = {
      bracket_height: 10,
      text_margin_right: 6,
      bracket_line_width: 1,
      color: 'black',
    };
  }

  // Set custom text for the `depress`/`release` pedal markings. No text is
  // set if the parameter is falsy.
  setCustomText(depress: string, release?: string): this {
    this.custom_depress_text = depress || '';
    this.custom_release_text = release || '';
    return this;
  }

  // Set the pedal marking style
  setStyle(style: IStyle | number): this {
    if (style < 1 && style > 3) {
      throw new Vex.RERR('InvalidParameter', 'The style must be one found in PedalMarking.Styles');
    }

    this.style = style;
    return this;
  }

  // Set the staff line to render the markings on
  setLine(line: number): this {
    this.line = line;
    return this;
  }

  // Draw the bracket based pedal markings
  drawBracketed(): void {
    const ctx = this.context;
    let is_pedal_depressed = false;
    let prev_x: number;
    let prev_y: number;

    // Iterate through each note
    this.notes.forEach((note: StaveNote, index: number, notes: StaveNote[]) => {
      // Each note triggers the opposite pedal action
      is_pedal_depressed = !is_pedal_depressed;

      // Get the initial coordinates for the note
      const x = note.getAbsoluteX();
      const y = note.getStave().getYForBottomText(this.line + 3);

      // Throw if current note is positioned before the previous note
      if (x < prev_x) {
        throw new Vex.RERR(
          'InvalidConfiguration', 'The notes provided must be in order of ascending x positions'
        );
      }

      // Determine if the previous or next note are the same
      // as the current note. We need to keep track of this for
      // when adjustments are made for the release+depress action
      const next_is_same = notes[index + 1] === note;
      const prev_is_same = notes[index - 1] === note;

      let x_shift: number;
      const point = this.musicFont.lookupMetric(`pedalMarking.${is_pedal_depressed ? 'down' : 'up'}.point`);

      if (is_pedal_depressed) {
        // Adjustment for release+depress
        x_shift = prev_is_same ? 5 : 0;

        if (this.style === PedalMarking.Styles.MIXED && !prev_is_same) {
          // For MIXED style, start with text instead of bracket
          if (this.custom_depress_text) {
            // If we have custom text, use instead of the default "Ped" glyph
            const text_width = ctx.measureText(this.custom_depress_text).width;
            ctx.fillText(this.custom_depress_text, x - (text_width / 2), y);
            x_shift = (text_width / 2) + this.render_options.text_margin_right;
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

  // Draw the text based pedal markings. This defaults to the traditional
  // "Ped" and "*"" symbols if no custom text has been provided.
  drawText(): void {
    const ctx = this.context;
    let is_pedal_depressed = false;

    // Iterate through each note, placing glyphs or custom text accordingly
    this.notes.forEach(note => {
      is_pedal_depressed = !is_pedal_depressed;
      const stave = note.getStave();
      const x = note.getAbsoluteX();
      const y = stave.getYForBottomText(this.line + 3);

      const point = this.musicFont.lookupMetric(`pedalMarking.${is_pedal_depressed ? 'down' : 'up'}.point`);

      let text_width = 0;
      if (is_pedal_depressed) {
        if (this.custom_depress_text) {
          text_width = ctx.measureText(this.custom_depress_text).width;
          ctx.fillText(this.custom_depress_text, x - (text_width / 2), y);
        } else {
          drawPedalGlyph('pedal_depress', ctx, x, y, point);
        }
      } else {
        if (this.custom_release_text) {
          text_width = ctx.measureText(this.custom_release_text).width;
          ctx.fillText(this.custom_release_text, x - (text_width / 2), y);
        } else {
          drawPedalGlyph('pedal_release', ctx, x, y, point);
        }
      }
    });
  }

  // Render the pedal marking in position on the rendering context
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();

    ctx.save();
    ctx.setStrokeStyle(this.render_options.color);
    ctx.setFillStyle(this.render_options.color);
    ctx.setFont(this.font.family, this.font.size, this.font.weight);

    L('Rendering Pedal Marking');

    if (this.style === PedalMarking.Styles.BRACKET || this.style === PedalMarking.Styles.MIXED) {
      ctx.setLineWidth(this.render_options.bracket_line_width);
      this.drawBracketed();
    } else if (this.style === PedalMarking.Styles.TEXT) {
      this.drawText();
    }

    ctx.restore();
  }
}
