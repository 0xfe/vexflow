// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// MIT License

import { defined } from './util';
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
  protected registry?: Registry;

  // fontStack and musicFont are both initialized by the constructor via this.setFontStack(...).
  protected fontStack!: Font[];
  protected musicFont!: Font;

  protected static newID(): string {
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
    this.setFontStack(Flow.DEFAULT_FONT_STACK);

    // If a default registry exist, then register with it right away.
    Registry.getDefaultRegistry()?.register(this);
  }

  /** Set music fonts stack. */
  setFontStack(fontStack: Font[]): this {
    this.fontStack = fontStack;
    this.musicFont = fontStack[0];
    return this;
  }

  /** Get music fonts stack. */
  getFontStack(): Font[] {
    return this.fontStack;
  }

  /** Set the draw style of a stemmable note. */
  setStyle(style: ElementStyle): this {
    this.style = style;
    return this;
  }

  /** Get the draw style of a stemmable note. */
  getStyle(): ElementStyle | undefined {
    return this.style;
  }

  /** Apply current style to Canvas `context`. */
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

  /** Restore style of `context`. */
  restoreStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;
    context.restore();
    return this;
  }

  /** Draw with style of an element. */
  drawWithStyle(): void {
    this.checkContext();
    this.applyStyle();
    this.draw();
    this.restoreStyle();
  }

  /** Draw an element. */
  // eslint-disable-next-line
  abstract draw(...args: any[]): void;

  /** Check if it has a class label (An element can have multiple class labels).  */
  hasClass(className: string): boolean {
    return this.attrs.classes[className] === true;
  }

  /** Add a class label (An element can have multiple class labels).  */
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

  /** Remove a class label (An element can have multiple class labels).  */
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

  /** Return the rendered status. */
  isRendered(): boolean {
    return this.rendered;
  }

  /** Set the rendered status. */
  setRendered(rendered = true): this {
    this.rendered = rendered;
    return this;
  }

  /** Return the element attributes. */
  getAttributes(): ElementAttributes {
    return this.attrs;
  }

  /** Return an attribute. */
  // eslint-disable-next-line
  getAttribute(name: string): any {
    return this.attrs[name];
  }

  /** Set an attribute. */
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

  /** Get the boundingBox. */
  getBoundingBox(): BoundingBox | undefined {
    return this.boundingBox;
  }

  /** Return the context. */
  getContext(): RenderContext | undefined {
    return this.context;
  }

  /** Set the context. */
  setContext(context?: RenderContext): this {
    this.context = context;
    return this;
  }

  /** Validate and return the context. */
  checkContext(): RenderContext {
    return defined(this.context, 'NoContext', 'No rendering context attached to instance.');
  }
}
