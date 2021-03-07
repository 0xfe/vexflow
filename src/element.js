// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow elements.

import { Vex } from './vex';
import { Registry } from './registry';
import { Flow } from './tables';

export class Element {
  static newID() {
    return 'auto' + Element.ID++;
  }

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
    this.fontStack = Flow.DEFAULT_FONT_STACK;
    this.musicFont = Flow.DEFAULT_FONT_STACK[0];

    // If a default registry exist, then register with it right away.
    if (Registry.getDefaultRegistry()) {
      Registry.getDefaultRegistry().register(this);
    }
  }

  // set music font
  setFontStack(fontStack) {
    this.fontStack = fontStack;
    this.musicFont = fontStack[0];
    return this;
  }
  getFontStack() {
    return this.fontStack;
  }

  // set the draw style of a stemmable note:
  setStyle(style) {
    this.style = style;
    return this;
  }
  getStyle() {
    return this.style;
  }

  // Apply current style to Canvas `context`
  applyStyle(context = this.context, style = this.getStyle()) {
    if (!style) return this;

    context.save();
    if (style.shadowColor) context.setShadowColor(style.shadowColor);
    if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
    if (style.fillStyle) context.setFillStyle(style.fillStyle);
    if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
    if (style.lineWidth) context.setLineWidth(style.lineWidth);
    return this;
  }

  restoreStyle(context = this.context, style = this.getStyle()) {
    if (!style) return this;
    context.restore();
    return this;
  }

  // draw with style of an element.
  drawWithStyle() {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  // An element can have multiple class labels.
  hasClass(className) {
    return this.attrs.classes[className] === true;
  }
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

  // This is called by the registry after the element is registered.
  onRegister(registry) {
    this.registry = registry;
    return this;
  }
  isRendered() {
    return this.rendered;
  }
  setRendered(rendered = true) {
    this.rendered = rendered;
    return this;
  }

  getAttributes() {
    return this.attrs;
  }
  getAttribute(name) {
    return this.attrs[name];
  }
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

  getContext() {
    return this.context;
  }
  setContext(context) {
    this.context = context;
    return this;
  }
  getBoundingBox() {
    return this.boundingBox;
  }

  // Validators
  checkContext() {
    if (!this.context) {
      throw new Vex.RERR('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}

Element.ID = 1000;
