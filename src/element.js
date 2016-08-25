// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow elements.

import { Vex } from './vex';
import { Registry } from './registry';

export class Element {
  static newID() { return 'auto' + (Element.ID++); }

  constructor({ type } = {}) {
    this.attrs = {
      id: Element.newID(),
      el: null,
      type: type || 'Base',
      classes: {},
    };

    this.boundingBox = null;
    this.context = null;
    this.rendered = false;
    if (Registry.getDefaultRegistry()) {
      Registry.getDefaultRegistry().register(this);
    }
  }

  hasClass(className) { return (this.attrs.classes[className] === true); }

  addClass(className) {
    this.attrs.classes[className] = true;
    if (this.registry) {
      this.registry.onUpdate({
        id: this.getAttribute('id'),
        name: 'class',
        value: className,
        oldValue: null,
      });
    }
    return this;
  }

  removeClass(className) {
    delete this.attrs.classes[className];
    if (this.registry) {
      this.registry.onUpdate({
        id: this.getAttribute('id'),
        name: 'class',
        value: null,
        oldValue: className,
      });
    }
    return this;
  }

  onRegister(registry) { this.registry = registry; return this; }
  isRendered() { return this.rendered; }
  setRendered(rendered = true) { this.rendered = rendered; return this; }

  getAttributes() { return this.attrs; }
  getAttribute(name) { return this.attrs[name]; }
  setAttribute(name, value) {
    const id = this.attrs.id;
    const oldValue = this.attrs[name];
    this.attrs[name] = value;
    if (this.registry) {
      // Register with old id to support id changes.
      this.registry.onUpdate({ id, name, value, oldValue });
    }
    return this;
  }

  getContext() { return this.context; }
  setContext(context) { this.context = context; return this; }
  getBoundingBox() { return this.boundingBox; }

  // Validators
  checkContext() {
    if (!this.context) {
      throw new Vex.RERR('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}

Element.ID = 1000;
