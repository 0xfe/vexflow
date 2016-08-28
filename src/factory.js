// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a high level API around VexFlow. It will eventually
// become the canonical way to use VexFlow.
//
// *This API is currently DRAFT*

import { Vex } from './vex';
import { Accidental } from './accidental';
import { Articulation } from './articulation';
import { Annotation } from './annotation';
import { Modifier } from './modifier';
import { Formatter } from './formatter';
import { FretHandFinger } from './frethandfinger';
import { ModifierContext } from './modifiercontext';
import { Renderer } from './renderer';
import { Stave } from './stave';
import { StaveNote } from './stavenote';
import { StaveConnector } from './staveconnector';
import { System } from './system';
import { TickContext } from './tickcontext';
import { Tuplet } from './tuplet';
import { Voice } from './voice';
import { Beam } from './beam';
import { Curve } from './curve';
import { GraceNote } from './gracenote';
import { GraceNoteGroup } from './gracenotegroup';
import { EasyScore } from './easyscore';

// To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`.
function L(...args) { if (Factory.DEBUG) Vex.L('Vex.Flow.Factory', args); }

export const X = Vex.MakeException('FactoryError');

function setDefaults(params = {}, defaults) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

export class Factory {
  constructor(options) {
    L('New factory: ', options);
    const defaults = {
      stave: {
        space: 10,
      },
      renderer: {
        context: null,
        selector: '',
        backend: Renderer.Backends.SVG,
        width: 500,
        height: 200,
        background: '#FFF',
      },
      font: {
        face: 'Arial',
        point: 10,
        style: '',
      },
    };

    this.options = defaults;
    this.setOptions(options);
  }

  static newFromSelector(selector, width = 500, height = 200) {
    return new Factory({ renderer: { selector, width, height } });
  }

  reset() {
    this.renderQ = [];
    this.systems = [];
    this.staves = [];
    this.voices = [];
    this.stave = null; // current stave
  }

  getOptions() { return this.options; }
  setOptions(options) {
    for (const key of ['stave', 'renderer', 'font']) {
      Object.assign(this.options[key], options[key]);
    }
    if (this.options.renderer.selector !== null || this.options.renderer.context) {
      this.initRenderer();
    }

    this.reset();
  }

  initRenderer() {
    const { selector, backend, width, height, background } = this.options.renderer;
    if (selector === '') {
      throw new X('HTML DOM element not set in Factory');
    }

    this.context = Renderer.buildContext(selector, backend, width, height, background);
  }

  getContext() { return this.context; }
  setContext(context) { this.context = context; return this; }
  getStave() { return this.stave; }

  // Returns pixels from current stave spacing.
  space(spacing) { return this.options.stave.space * spacing; }

  Stave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space,
      },
    });

    const stave = new Stave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  StaveNote(noteStruct) {
    const note = new StaveNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GraceNote(noteStruct) {
    const note = new GraceNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    return note;
  }

  GraceNoteGroup(params) {
    const group = new GraceNoteGroup(params.notes, params.slur);
    group.setContext(this.context);
    return group;
  }

  Accidental(params) {
    params = setDefaults(params, {
      type: null,
      options: {},
    });

    const acc = new Accidental(params.type);
    acc.setContext(this.context);
    return acc;
  }

  Annotation(params) {
    params = setDefaults(params, {
      text: 'p',
      vJustify: 'below',
      hJustify: 'center',
      font_family: 'Times',
      font_size: 14,
      font_weight: 'bold italic',
      options: {},
    });

    const annotation = new Annotation(params.text);
    annotation.setJustification(params.hJustify);
    annotation.setVerticalJustification(params.vJustify);
    annotation.setFont(params.font_family, params.font_size, params.font_weight);
    annotation.setContext(this.context);
    return annotation;
  }

  Articulation(params) {
    params = setDefaults(params, {
      type: 'a.',
      position: 'above',
      options: {},
    });

    const articulation = new Articulation(params.type);
    articulation.setPosition(params.position);
    articulation.setContext(this.context);
    return articulation;
  }

  Fingering(params) {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {},
    });

    const fingering = new FretHandFinger(params.number);
    fingering.setPosition(params.position);
    fingering.setContext(this.context);
    return fingering;
  }

  TickContext() {
    return new TickContext().setContext(this.context);
  }

  ModifierContext() {
    return new ModifierContext();
  }

  Voice(params) {
    params = setDefaults(params, {
      time: '4/4',
      options: {},
    });
    const voice = new Voice(params.time);
    this.voices.push(voice);
    return voice;
  }

  StaveConnector(params) {
    params = setDefaults(params, {
      top_stave: null,
      bottom_stave: null,
      options: {},
    });
    const connector = new StaveConnector(params.top_stave, params.bottom_stave);
    connector.setContext(this.context);
    this.renderQ.push(connector);
    return connector;
  }

  Formatter() {
    return new Formatter();
  }

  Tuplet(params) {
    params = setDefaults(params, {
      notes: [],
      options: {},
    });

    const tuplet = new Tuplet(params.notes, params.options).setContext(this.context);
    this.renderQ.push(tuplet);
    return tuplet;
  }

  Beam(params) {
    params = setDefaults(params, {
      notes: [],
      options: {
        autoStem: false,
      },
    });

    const beam = new Beam(params.notes, params.options.autoStem).setContext(this.context);
    this.renderQ.push(beam);
    return beam;
  }

  Curve(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {},
    });

    const curve = new Curve(params.from, params.to, params.options).setContext(this.context);
    this.renderQ.push(curve);
    return curve;
  }

  System(params = {}) {
    params.factory = this;
    const system = new System(params).setContext(this.context);
    this.systems.push(system);
    return system;
  }

  EasyScore(params = {}) {
    params.factory = this;
    return new EasyScore(params);
  }

  draw() {
    this.systems.forEach(i => i.setContext(this.context).format());
    this.staves.forEach(i => i.setContext(this.context).draw());
    this.voices.forEach(i => i.setContext(this.context).draw());
    this.renderQ.forEach(i => {
      if (!i.isRendered()) i.setContext(this.context).draw();
    });
    this.systems.forEach(i => i.setContext(this.context).draw());
    this.reset();
  }
}
