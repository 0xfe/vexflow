// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a generic base class for VexFlow, with implementations
// of general functions and properties that can be inherited by all VexFlow elements.

import { RuntimeError } from './util';
import { Registry } from './registry';
import { BoundingBox } from './boundingbox';
import { Font } from './font';
import { RenderContext } from './types/common';
import { Flow } from './flow';

/** Element attributes. */
export interface ElementAttributes {
  // eslint-disable-next-line
  [name: string]: any;
  id: string;
  // eslint-disable-next-line
  el?: any;
  type: string;
  classes: Record<string, boolean>;
}

/** Element style */
export interface ElementStyle {
  shadowColor?: string;
  shadowBlur?: number;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

/**
 * Element implements a generic base class for VexFlow, with implementations
 * of general functions and properties that can be inherited by all VexFlow elements.
 */
export abstract class Element {
  protected static ID: number = 1000;
  private context?: RenderContext;
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

  /** Constructor. */
  constructor({ type }: { type?: string } = {}) {
    this.attrs = {
      id: Element.newID(),
      el: undefined,
      type: type || 'Base',
      classes: {},
    };

    this.rendered = false;

    this.fontStack = Flow.DEFAULT_FONT_STACK;
    this.musicFont = Flow.DEFAULT_FONT_STACK[0];

    // If a default registry exist, then register with it right away.
    Registry.getDefaultRegistry()?.register(this);
  }

  /** Sets music fonts stack. */
  setFontStack(fontStack: Font[]): this {
    this.fontStack = fontStack;
    this.musicFont = fontStack[0];
    return this;
  }

  /** gets music fonts stack. */
  getFontStack(): Font[] {
    return this.fontStack;
  }

  /** Sets the draw style of a stemmable note. */
  setStyle(style: ElementStyle): this {
    this.style = style;
    return this;
  }

  /** Gets the draw style of a stemmable note. */
  getStyle(): ElementStyle | undefined {
    return this.style;
  }

  /** Applies current style to Canvas `context`. */
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

  /** Restores style of Canvas `context`. */
  restoreStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;
    context.restore();
    return this;
  }

  /** Draws with style of an element. */
  drawWithStyle(): void {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  /** Draws an element. */
  // eslint-disable-next-line
  abstract draw(...args: any[]): void;

  /** Checkes if it has a class label (An element can have multiple class labels).  */
  hasClass(className: string): boolean {
    return this.attrs.classes[className] === true;
  }

  /** Adds a class label (An element can have multiple class labels).  */
  addClass(className: string): this {
    this.attrs.classes[className] = true;
    if (this.registry) {
      this.registry.onUpdate({
        id: this.attrs.id,
        name: 'class',
        value: className,
        oldValue: undefined,
      });
    }
    return this;
  }

  /** Removes a class label (An element can have multiple class labels).  */
  removeClass(className: string): this {
    delete this.attrs.classes[className];
    if (this.registry) {
      this.registry.onUpdate({
        id: this.attrs.id,
        name: 'class',
        value: undefined,
        oldValue: className,
      });
    }
    return this;
  }

  /** Call back from registry after the element is registered. */
  onRegister(registry: Registry): this {
    this.registry = registry;
    return this;
  }

  /** Returns the rendered status. */
  isRendered(): boolean {
    return this.rendered;
  }

  /** Sets the rendered status. */
  setRendered(rendered = true): this {
    this.rendered = rendered;
    return this;
  }

  /** Returns the element attributes. */
  getAttributes(): ElementAttributes {
    return this.attrs;
  }

  /** Returns an attribute. */
  // eslint-disable-next-line
  getAttribute(name: string): any {
    return this.attrs[name];
  }

  /** Sets an attribute. */
  // eslint-disable-next-line
  setAttribute(name: string, value: any): this {
    const oldID = this.attrs.id;
    const oldValue = this.attrs[name];
    this.attrs[name] = value;
    if (this.registry) {
      // Register with old id to support id changes.
      this.registry.onUpdate({ id: oldID, name, value, oldValue });
    }
    return this;
  }

  /** Returns the context. */
  getContext(): RenderContext | undefined {
    return this.context;
  }

  /** Sets the context. */
  setContext(context?: RenderContext): this {
    this.context = context;
    return this;
  }

  /** Gets the boundingBox. */
  getBoundingBox(): BoundingBox | undefined {
    return this.boundingBox;
  }

  /** Validates and returns the context. */
  checkContext(): RenderContext {
    if (!this.context) {
      throw new RuntimeError('NoContext', 'No rendering context attached to instance.');
    }
    return this.context;
  }
}
