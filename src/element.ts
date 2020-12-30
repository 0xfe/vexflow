// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow elements.
import {Registry} from './registry';
import {DrawContext} from "./types/common";
import {BoundingBox} from "./boundingbox";
import {DefaultFontStack, Font} from "./smufl";
import {IElementAttributes} from "./types/element";
import {RuntimeError} from "./runtimeerror";

export class Element {
  static ID = 1000;

  context: DrawContext;
  rendered: boolean;
  style: any;
  attrs: IElementAttributes;
  boundingBox: BoundingBox;
  fontStack: Font[];
  musicFont: Font;
  registry: Registry;

  static newID(): string {
    return 'auto' + (Element.ID++);
  }

  constructor({type} = {} as IElementAttributes) {
    this.attrs = {
      id: Element.newID(),
      el: null,
      type: type || 'Base',
      classes: {},
    };

    this.boundingBox = null;
    this.context = null;
    this.rendered = false;
    this.fontStack = DefaultFontStack;
    this.musicFont = DefaultFontStack[0];

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
  setStyle(style: any): this {
    this.style = style;
    return this;
  }

  getStyle(): any {
    return this.style;
  }

  // Apply current style to Canvas `context`
  applyStyle(context = this.context, style = this.getStyle()): this {
    if (!style) return this;

    context.save();
    if (style.shadowColor) context.setShadowColor(style.shadowColor);
    if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
    if (style.fillStyle) context.setFillStyle(style.fillStyle);
    if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
    if (style.lineWidth) context.setLineWidth(style.lineWidth);
    return this;
  }

  restoreStyle(context = this.context, style = this.getStyle()): this {
    if (!style) return this;
    context.restore();
    return this;
  }

  // draw with style of an element.
  drawWithStyle(): void {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  draw(element?: any, x_shift?: any): void {
    // do nothing
  }

  // An element can have multiple class labels.
  hasClass(className: string): boolean {
    return (this.attrs.classes[className] === true);
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

  getAttributes(): IElementAttributes {
    return this.attrs;
  }

  getAttribute(name: string): any {
    return this.attrs[name];
  }

  setAttribute(name: string, value: any): this {
    const id = this.attrs.id;
    const oldValue = this.attrs[name];
    this.attrs[name] = value;
    if (this.registry) {
      // Register with old id to support id changes.
      this.registry.onUpdate({id, name, value, oldValue});
    }
    return this;
  }

  getContext(): DrawContext {
    return this.context;
  }

  setContext(context: DrawContext): this {
    this.context = context;
    return this;
  }

  getBoundingBox(): BoundingBox {
    return this.boundingBox;
  }

  // Validators
  checkContext(): DrawContext {
    if (!this.context) {
      throw new RuntimeError('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}
