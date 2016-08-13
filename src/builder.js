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
import { Renderer } from './renderer';
import { Stave } from './stave';

// To enable logging for this class. Set `Vex.Flow.Builder.DEBUG` to `true`.
function L(...args) { if (Builder.DEBUG) Vex.L('Vex.Flow.Builder', args); }

// Exceptions for this class.
function X(message, data) {
  this.name = 'BuilderException';
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

export class Builder {
  constructor(options) {
    L('New builder: ', options);
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
    if (this.options.renderer.el === '') {
      throw new X('HTML DOM element not set in Builder');
    }

    this.renderer = new Renderer(this.options.renderer.el, this.options.renderer.backend);
    this.renderer.resize(this.options.renderer.width, this.options.renderer.height);
    this.ctx = this.renderer.getContext();
  }

  getContext() { return this.ctx; }
  getStave() { return this.stave; }

  // Returns pixels from current stave spacing.
  getPx(spacing) { return this.options.stave.spacing_px * spacing; }

  Stave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - 10,
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

  draw() {
    this.renderQ.forEach(i => i.setContext(this.ctx).draw());
  }
}
