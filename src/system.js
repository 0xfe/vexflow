// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// This class implements a musical system, which is a collection of staves,
// each which can have one or more voices. All voices across all staves in
// the system are formatted together.

import { Element } from './element';
import { Factory } from './factory';
import { Formatter } from './formatter';
import { Note } from './note';

function setDefaults(params, defaults) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

export class System extends Element {
  constructor(params) {
    super();
    this.setAttribute('type', 'System');
    this.setOptions(params);
    this.parts = [];
  }

  setOptions(options = {}) {
    this.options = setDefaults(options, {
      x: 10,
      y: 10,
      width: 500,
      connector: null,
      spaceBetweenStaves: 12, // stave spaces
      endPadding: 0,
      factory: null,
      debugFormatter: false,
      formatIterations: 6,
      options: {},
    });

    this.factory = this.options.factory || new Factory({ renderer: { el: null } });
  }

  setContext(context) {
    super.setContext(context);
    this.factory.setContext(context);
    return this;
  }

  addConnector() {
    this.connector = this.factory.StaveConnector({
      top_stave: this.parts[0].stave,
      bottom_stave: this.parts[this.parts.length - 1].stave,
    });
    return this.connector;
  }

  addStave(params) {
    params = setDefaults(params, {
      stave: null,
      voices: [],
      spaceAbove: 0, // stave spaces
      spaceBelow: 0, // stave spaces
      debugNoteMetrics: false,
      options: {},
    });

    if (!params.stave) {
      const options = { left_bar: false };
      params.stave = this.factory.Stave(
        { x: this.options.x, y: this.options.y, width: this.options.width, options });
    }

    params.voices.forEach(voice => voice.setContext(this.context).setStave(params.stave));
    this.parts.push(params);
    return params.stave;
  }

  draw() {
    const ctx = this.checkContext();
    const formatter = new Formatter();

    let y = this.options.y;
    let startX = 0;
    let allVoices = [];
    const debugNoteMetricsYs = [];

    // Join the voices for each stave.
    this.parts.forEach(part => {
      y = y + part.stave.space(part.spaceAbove);
      part.stave.setY(y);
      formatter.joinVoices(part.voices);
      y = y + part.stave.space(part.spaceBelow);
      y = y + part.stave.space(this.options.spaceBetweenStaves);
      if (part.debugNoteMetrics) {
        debugNoteMetricsYs.push({ y, voice: part.voices[0] });
        y += 15;
      }
      allVoices = allVoices.concat(part.voices);

      startX = Math.max(startX, part.stave.getNoteStartX());
    });

    // Update the start position of all staves.
    this.parts.forEach(part => part.stave.setNoteStartX(startX));
    const justifyWidth = this.options.width
      - (startX - this.options.x) - this.options.endPadding - Note.STAVEPADDING;
    formatter.format(allVoices, justifyWidth);

    for (let i = 0; i < this.options.formatIterations; i++) {
      formatter.tune();
    }

    // Render.
    this.parts.forEach(part => {
      part.voices.forEach(voice => voice.draw());
    });

    // Render debug info.
    if (this.options.debugFormatter) {
      Formatter.plotDebugging(ctx, formatter, startX, this.options.y, y);
    }

    debugNoteMetricsYs.forEach(d => {
      d.voice.getTickables().forEach(note => Note.plotMetrics(ctx, note, d.y));
    });
  }
}
