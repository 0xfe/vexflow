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

/** Element attributes. */
export interface ElementAttributes {
  [name: string]: any;
  id: string;
  el?: SVGSVGElement;
  type: string;
  classes: Record<string, boolean>;
}

/** Contexts common interface */
export interface RenderContext {
  clear(): void;
  setFont(family: string, size: number, weight?: string): RenderContext;
  setRawFont(font: string): RenderContext;
  setFillStyle(style: string): RenderContext;
  setBackgroundFillStyle(style: string): RenderContext;
  setStrokeStyle(style: string): RenderContext;
  setShadowColor(color: string): RenderContext;
  setShadowBlur(blur: string): RenderContext;
  setLineWidth(width: number): RenderContext;
  setLineCap(cap_type: string): RenderContext;
  setLineDash(dash: string): RenderContext;
  scale(x: number, y: number): RenderContext;
  resize(width: number, height: number): RenderContext;
  fillRect(x: number, y: number, width: number, height: number): RenderContext;
  clearRect(x: number, y: number, width: number, height: number): RenderContext;
  beginPath(): RenderContext;
  moveTo(x: number, y: number): RenderContext;
  lineTo(x: number, y: number): RenderContext;
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): RenderContext;
  quadraticCurveTo(x1: number, y1: number, x2: number, y2: number): RenderContext;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    antiClockwise: boolean
  ): RenderContext;
  glow(): RenderContext;
  fill(): RenderContext;
  stroke(): RenderContext;
  closePath(): RenderContext;
  fillText(text: string, x: number, y: number): RenderContext;
  save(): RenderContext;
  restore(): RenderContext;
  openGroup(): Node | undefined;
  closeGroup(): void;

  /**
   * canvas returns TextMetrics, SVG returns SVGRect, Raphael returns {width : number, height : number}. Only width is used throughout VexFlow.
   */
  measureText(text: string): { width: number };
}

//** Element style */
export interface Style {
  shadowColor?: string;
  shadowBlur?: string;
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

  protected context?: RenderContext;

  protected rendered: boolean;

  protected style?: Style;

  private attrs: ElementAttributes;

  protected boundingBox?: BoundingBox;

  protected fontStack: Font[];

  protected musicFont: Font;

  protected registry?: Registry;

  static newID(): string {
    return `auto${Element.ID++}`;
  }

  //** Constructor, type is optional. */
  constructor({ type } = {} as ElementAttributes) {
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
    if (Registry.getDefaultRegistry()) {
      Registry.getDefaultRegistry().register(this);
    }
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
  setStyle(style: Style): this {
    this.style = style;
    return this;
  }

  /** Gets the draw style of a stemmable note. */
  getStyle(): Style | undefined {
    return this.style;
  }

  /** Applies current style to Canvas `context`. */
  applyStyle(context: RenderContext | undefined = this.context, style: Style | undefined = this.getStyle()): this {
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
  restoreStyle(context: RenderContext | undefined = this.context, style: Style | undefined = this.getStyle()): this {
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
  abstract draw(element?: Element, x_shift?: number): void;

  /** Checkes if it has a class label (An element can have multiple class labels).  */
  hasClass(className: string): boolean {
    return this.attrs.classes[className] === true;
  }

  /** Adds a class label (An element can have multiple class labels).  */
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

  /** Removes a class label (An element can have multiple class labels).  */
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
  getAttribute(name: string): string {
    return this.attrs[name];
  }

  /** Sets an attribute. */
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
      throw new Vex.RERR('NoContext', 'No rendering context attached to instance');
    }
    return this.context;
  }
}
