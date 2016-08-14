// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow classes.

import { Vex } from './vex';

// To enable logging for this class. Set `Vex.Flow.Base.DEBUG` to `true`.
// function L(...args) { if (Base.DEBUG) Vex.L('Vex.Flow.Base', args); }

function setDefaults(params, defaults) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

export class Base {
  constructor() {
    this.attrs = {
      id: '',
      staveSpace: 10,
      type: 'Base',
    };
    this.context = null;
  }

  getAttrs() { return this.attrs; }
  getAttr(key) { return this.attrs[key]; }
  setAttr(key, val) { this.attrs[key] = val; return this; }

  getContext() { return this.context; }
  setContext(context) { this.context = context; return this; } 

  space(spacing) { return this.attrs.staveSpace * spacing; }

  // Validators
  checkContext() {
    if (!this.context) {
      throw new Vex.RERR('NoContext', "No rendering context attached to instance");
    }
  }
}

