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
import { ModifierContext } from './modifiercontext';
import { Renderer } from './renderer';
import { Stave } from './stave';
import { StaveNote } from './stavenote';
import { TickContext } from './tickcontext';

// To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`.
function L(...args) { if (Factory.DEBUG) Vex.L('Vex.Flow.Factory', args); }

// Exceptions for this class.
function X(message, data) {
  this.name = 'FactoryException';
  this.message = message;
  this.data = data;
  L(this.name + ':', message, data);
}

function setDefaults(params, defaults) {
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
        spacing_px: 10,
      },
      renderer: {
        el: '',
        backend: Renderer.Backends.SVG,
        width: 500,
        height: 200,
      },
      font: {
        face: 'Arial',
        point: 10,
        style: '',
      },
    };

    this.options = defaults;
    this.setOptions(options);
    this.initRenderer();
    this.renderQ = [];
    this.stave = null; // current stave
  }

  setOptions(options) {
    for (const key of ['stave', 'renderer', 'font']) {
      Object.assign(this.options[key], options[key]);
    }
  }

  initRenderer() {
    const o = this.options.renderer;
    if (o.el === '') {
      throw new X('HTML DOM element not set in Factory');
    }

    this.ctx = Renderer.buildContext(o.el, o.backend, o.width, o.height, o.background);
  }

  getContext() { return this.ctx; }
  getStave() { return this.stave; }

  // Returns pixels from current stave spacing.
  px(spacing) { return this.options.stave.spacing_px * spacing; }

  Stave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.px(1),
      options: {
        spacing_between_lines_px: this.options.stave.spacing_px,
      },
    });

    const stave = new Stave(params.x, params.y, params.width, params.options);
    stave.setContext(this.ctx);
    this.renderQ.push(stave);
    this.stave = stave;
    return stave;
  }

  StaveNote(noteStruct) {
    const note = new StaveNote(noteStruct);
    note.setStave(this.stave);
    note.setContext(this.ctx);
    this.renderQ.push(note);
    return note;
  }

  Accidental(params) {
    params = setDefaults(params, {
      type: null,
      options: {},
    });

    const acc = new Accidental(params.type);
    acc.setContext(this.ctx);
    // acc.render_options.stroke_px = this.px(0.3);
    return acc;
  }

  TickContext() {
    return new TickContext().setContext(this.ctx);
  }

  ModifierContext() {
    return new ModifierContext();
  }

  draw() {
    this.renderQ.forEach(i => i.setContext(this.ctx).draw());
  }
}
