// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Balazs Forian-Szabo
//
// ## Description
//
// This file implements `VibratoBrackets`
// that renders vibrato effect between two notes.

import { Vex } from './vex';
import { Flow } from './tables';
import { Element } from './element';
import { Renderer } from './renderer';
import { Vibrato } from './vibrato';

// To enable logging for this class. Set `Vex.Flow.VibratoBracket.DEBUG` to `true`.
function L(...args) { if (VibratoBracket.DEBUG) Vex.L('Vex.Flow.VibratoBracket', args); }

export class VibratoBracket extends Element {

  // bracket_data = {
  //   start: Vex.Flow.Note,
  //   stop: Vex.Flow.Note (optional)
  // };
  //
  // If stop note is not set, then the vibrato effect stops at
  // the end of stave
  constructor(bracket_data) {
    super();
    this.setAttribute('type', 'VibratoBracket');

    this.start = bracket_data.start;
    this.stop = bracket_data.stop;

    this.line = 1;

    this.render_options = {
      harsh: false,
      wave_height: 6,
      wave_width: 4,
      wave_girth: 2,
    };
  }

  // Set line position of the vibrato bracket
  setLine(line) { this.line = line; return this; }
  setHarsh(harsh) { this.render_options.harsh = harsh; return this; }

  // Draw the octave bracket on the rendering context
  draw() {
    const ctx = this.context;

    const y = this.start.getStave().getYForTopText(this.line);

    // Get the preliminary start and stop coordintates for the bracket
    const start_x = this.start.getAbsoluteX();

    const stop_x = (this.stop
      ? this.stop.getAbsoluteX() - this.stop.getWidth() - 10
      : this.start.getStave().getTieEndX() - 10);

    this.render_options.vibrato_width = stop_x - start_x;

    L('Rendering VibratoBracket: start_x:', start_x, 'stop_x:', stop_x, 'y:', y);

    Vibrato.renderVibrato(ctx, start_x, y, this.render_options);

  }
}
