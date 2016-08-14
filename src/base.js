// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow classes.

import { Vex } from './vex';

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

  // TODO: Bounding boxes for all elements.

  space(spacing) { return this.attrs.staveSpace * spacing; }

  // Validators
  checkContext() {
    if (!this.context) {
      throw new Vex.RERR('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}

