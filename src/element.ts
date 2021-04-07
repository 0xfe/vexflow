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
import { BoundingBox } from './boundingbox';
import { Font } from './smufl';
import { RenderContext, ElementStyle, ElementAttributes } from './types/common';

export abstract class Element {
  protected static ID: number = 1000;
  protected context?: RenderContext;
  protected rendered: boolean;
  protected style?: ElementStyle;
  private attrs: ElementAttributes;
  protected boundingBox?: BoundingBox;
  protected fontStack: Font[];
  protected musicFont: Font;
  protected registry?: Registry;

  static newID(): string {
    return `auto${Element.ID++}`;
  }

  constructor(type: string) {
    this.attrs = {
      id: Element.newID(),
      el: null,
      type: type || 'Base',
      classes: {},
    };

    this.rendered = false;
    this.fontStack = Flow.DEFAULT_FONT_STACK;
    this.musicFont = Flow.DEFAULT_FONT_STACK[0];

    // If a default registry exist, then register with it right away.
    if (Registry.getDefaultRegistry()) {
      Registry.getDefaultRegistry().register(this);
    }
  }

  // set music font
  setFontStack(fontStack: Font[]): this {
    this.fontStack = fontStack;
    this.musicFont = fontStack[0];
    return this;
  }
  getFontStack(): Font[] {
    return this.fontStack;
  }

  // set the draw style of a stemmable note:
  setStyle(style: ElementStyle): this {
    this.style = style;
    return this;
  }
  getStyle(): ElementStyle | undefined {
    return this.style;
  }

  // Apply current style to Canvas `context`
  applyStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;

    context.save();
    if (style.shadowColor) context.setShadowColor(style.shadowColor);
    if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
    if (style.fillStyle) context.setFillStyle(style.fillStyle);
    if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
    if (style.lineWidth) context.setLineWidth(style.lineWidth);
    return this;
  }

  restoreStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;
    context.restore();
    return this;
  }

  // draw with style of an element. */
  drawWithStyle(): void {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  abstract draw(element?: Element, x_shift?: number): void;

  // An element can have multiple class labels.
  hasClass(className: string): boolean {
    return this.attrs.classes[className] === true;
  }
  addClass(className: string): this {
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

  removeClass(className: string): this {
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
  onRegister(registry: Registry): this {
    this.registry = registry;
    return this;
  }
  isRendered(): boolean {
    return this.rendered;
  }
  setRendered(rendered = true): this {
    this.rendered = rendered;
    return this;
  }

  getAttributes(): ElementAttributes {
    return this.attrs;
  }
  getAttribute(name: string): string {
    return this.attrs[name];
  }
  setAttribute(name: string, value: string): this {
    const { id } = this.attrs;
    const oldValue = this.attrs[name];
    this.attrs[name] = value;
    if (this.registry) {
      // Register with old id to support id changes.
      this.registry.onUpdate({ id, name, value, oldValue });
    }
    return this;
  }

  getContext(): RenderContext | undefined {
    return this.context;
  }
  setContext(context?: RenderContext): this {
    this.context = context;
    return this;
  }
  getBoundingBox(): BoundingBox | undefined {
    return this.boundingBox;
  }

  // Validators
  checkContext(): RenderContext {
    if (!this.context) {
      throw new Vex.RERR('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}
