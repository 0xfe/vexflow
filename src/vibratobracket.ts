// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Balazs Forian-Szabo
//
// ## Description
//
// This file implements `VibratoBrackets`
// that renders vibrato effect between two notes.

import { Vex } from './vex';
import { Element } from './element';
import { Vibrato } from './vibrato';
import { Note } from './note';

// To enable logging for this class. Set `Vex.Flow.VibratoBracket.DEBUG` to `true`.
function L(
  // eslint-disable-next-line
  ...args: any []) {
  if (VibratoBracket.DEBUG) Vex.L('Vex.Flow.VibratoBracket', args);
}

export class VibratoBracket extends Element {
  static DEBUG: boolean;

  protected line: number;

  protected start: Note;
  protected stop: Note;
  protected render_options: {
    vibrato_width: number;
    wave_height: number;
    wave_girth: number;
    harsh: boolean;
    wave_width: number;
  };

  // bracket_data = {
  //   start: Vex.Flow.Note (optional)
  //   stop: Vex.Flow.Note (optional)
  // };
  // Either the stop or start note must be set, or both of them.
  // A null value for the start or stop note indicates that the vibrato
  // is drawn from the beginning or until the end of the stave accordingly.
  constructor(bracket_data: { stop: Note; start: Note }) {
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
      vibrato_width: 0,
    };
  }

  // Set line position of the vibrato bracket
  setLine(line: number): this {
    this.line = line;
    return this;
  }
  setHarsh(harsh: boolean): this {
    this.render_options.harsh = harsh;
    return this;
  }

  // Draw the vibrato bracket on the rendering context
  draw(): void {
    const ctx = this.checkContext();
    this.setRendered();
    let y = 0;
    let start_x = 0;
    let stop_x = 0;
    if (this.start) {
      y = this.start.checkStave().getYForTopText(this.line);
      start_x = this.start.getAbsoluteX();
    } else if (this.stop) {
      y = this.stop.checkStave().getYForTopText(this.line);
      // If start note is not set then vibrato will be drawn
      // from the beginning of the stave
      start_x = this.stop.checkStave().getTieStartX();
    }

    if (this.stop) {
      stop_x = this.stop.getAbsoluteX() - this.stop.getWidth() - 5;
    } else if (this.start) {
      // If stop note is not set then vibrato will be drawn
      // until the end of the stave
      stop_x = this.start.checkStave().getTieEndX() - 10;
    }

    this.render_options.vibrato_width = stop_x - start_x;

    L('Rendering VibratoBracket: start_x:', start_x, 'stop_x:', stop_x, 'y:', y);

    Vibrato.renderVibrato(ctx, start_x, y, this.render_options);
  }
}
