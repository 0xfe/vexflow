// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements the `TextDynamics` which renders traditional
// text dynamics markings, **ie: p, f, sfz, rfz, ppp**
//
// You can render any dynamics string that contains a combination of
// the following letters:  P, M, F, Z, R, S

import { Vex } from './vex';
import { Note } from './note';
import { Glyph } from './glyph';

// To enable logging for this class. Set `Vex.Flow.TextDynamics.DEBUG` to `true`.
function L(...args) { if (TextDynamics.DEBUG) Vex.L('Vex.Flow.TextDynamics', args); }

export class TextDynamics extends Note {
  // The glyph data for each dynamics letter
  static get GLYPHS() {
    return {
      'f': {
        code: 'vba',
        width: 12,
      },
      'p': {
        code: 'vbf',
        width: 14,
      },
      'm': {
        code: 'v62',
        width: 17,
      },
      's': {
        code: 'v4a',
        width: 10,
      },
      'z': {
        code: 'v80',
        width: 12,
      },
      'r': {
        code: 'vb1',
        width: 12,
      },
    };
  }

  // A `TextDynamics` object inherits from `Note` so that it can be formatted
  // within a `Voice`.
  // Create the dynamics marking. `text_struct` is an object
  // that contains a `duration` property and a `sequence` of
  // letters that represents the letters to render
  constructor(text_struct) {
    super(text_struct);
    this.setAttribute('type', 'TextDynamics');

    this.sequence = text_struct.text.toLowerCase();
    this.line = text_struct.line || 0;
    this.glyphs = [];

    Vex.Merge(this.render_options, {
      glyph_font_size: 40,
    });

    L('New Dynamics Text: ', this.sequence);
  }

  // Set the Stave line on which the note should be placed
  setLine(line) {
    this.line = line;
    return this;
  }

  // Preformat the dynamics text
  preFormat() {
    let total_width = 0;
    // Iterate through each letter
    this.sequence.split('').forEach(letter => {
      // Get the glyph data for the letter
      const glyph_data = TextDynamics.GLYPHS[letter];
      if (!glyph_data) throw new Vex.RERR('Invalid dynamics character: ' + letter);

      const size =  this.render_options.glyph_font_size;
      const glyph = new Glyph(glyph_data.code, size);

      // Add the glyph
      this.glyphs.push(glyph);

      total_width += glyph_data.width;
    });

    // Store the width of the text
    this.setWidth(total_width);
    this.preFormatted = true;
    return this;
  }

  // Draw the dynamics text on the rendering context
  draw() {
    this.setRendered();
    const x = this.getAbsoluteX();
    const y = this.stave.getYForLine(this.line + (-3));

    L('Rendering Dynamics: ', this.sequence);

    let letter_x = x;
    this.glyphs.forEach((glyph, index) => {
      const current_letter = this.sequence[index];
      glyph.render(this.context, letter_x, y);
      letter_x += TextDynamics.GLYPHS[current_letter].width;
    });
  }
}
