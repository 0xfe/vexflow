// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// MIT License

import { BoundingBox } from './boundingbox';
import { Font } from './font';
import { FontInfo, FontStyle, FontWeight } from './font';
import { Registry } from './registry';
import { RenderContext } from './rendercontext';
import { defined } from './util';

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
  static get CATEGORY(): string {
    return 'Element';
  }

  protected static ID: number = 1000;
  protected static newID(): string {
    return `auto${Element.ID++}`;
  }

  /**
   * Default font for text.
   * See `Flow.setMusicFont(...fontNames)` to customize the font for musical symbols placed on the score.
   */
  static TEXT_FONT: Required<FontInfo> = {
    family: Font.SANS_SERIF,
    size: Font.SIZE,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
  };

  private context?: RenderContext;
  protected rendered: boolean;
  protected style?: ElementStyle;
  private attrs: ElementAttributes;
  protected boundingBox?: BoundingBox;
  protected registry?: Registry;

  /**
   * Some elements include text.
   * The `textFont` property contains information required to style the text (i.e., font family, size, weight, and style).
   * It starts as `undefined`, and must be set using `setFont()` or `resetFont()`.
   */
  protected textFont?: Required<FontInfo> = undefined;

  constructor() {
    this.attrs = {
      id: Element.newID(),
      el: undefined,
      type: this.getCategory(),
      classes: {},
    };

    this.rendered = false;

    // If a default registry exist, then register with it right away.
    Registry.getDefaultRegistry()?.register(this);
  }

  /** Get element category string. */
  getCategory(): string {
    return (<typeof Element>this.constructor).CATEGORY;
  }

  /**
   * Set the element's font family, size, weight, style (e.g., `Arial`, `10pt`, `bold`, `italic`).
   * @param f is 1) a `FontInfo` object or
   *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
   *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
   * @param style is a string (e.g., 'italic', 'normal').
   * If no arguments are provided, then the font is set to the default font.
   * Each Element subclass may specify its own default by overriding the static `TEXT_FONT` property.
   */
  setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    // Allow subclasses to override `TEXT_FONT`.
    const defaultTextFont = (<typeof Element>this.constructor).TEXT_FONT;
    const sizeWeightStyleUndefined = size === undefined && weight === undefined && style === undefined;
    if (typeof f === 'object' || (f === undefined && sizeWeightStyleUndefined)) {
      // `f` is case 1) a FontInfo object, or all arguments are undefined.
      // Do not check `arguments.length === 0`, to allow the extreme edge case:
      // setFont(undefined, undefined, undefined, undefined).
      this.textFont = { ...defaultTextFont, ...f };
    } else if (typeof f === 'string' && sizeWeightStyleUndefined) {
      // `f` is case 2) CSS font shorthand.
      this.textFont = Font.fromCSSString(f);
    } else {
      // `f` is case 3) a font family string (e.g., 'Times New Roman')
      // or it is undefined while one or more of the other arguments is provided.
      // Following CSS conventions, any unspecified params are reset to the default.
      this.textFont = Font.validate(
        f ?? defaultTextFont.family,
        size ?? defaultTextFont.size,
        weight ?? defaultTextFont.weight,
        style ?? defaultTextFont.style
      );
    }
    return this;
  }

  /**
   * Reset the text font to the style indicated by the static `TEXT_FONT` property.
   * Subclasses can call this to initialize `textFont` for the first time.
   */
  resetFont(): void {
    this.setFont();
  }

  getFont(): string {
    return Font.toCSSString(this.textFont);
  }

  /** Return a copy of the FontInfo object, or undefined if `setFont()` has never been called. */
  getFontInfo(): Required<FontInfo> | undefined {
    return this.textFont ? { ...this.textFont } : undefined;
  }

  set font(f: string) {
    this.setFont(f);
  }

  get font(): string {
    return Font.toCSSString(this.textFont);
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
    this.registry?.onUpdate({
      id: this.attrs.id,
      name: 'class',
      value: className,
      oldValue: undefined,
    });
    return this;
  }

  /** Remove a class label (An element can have multiple class labels).  */
  removeClass(className: string): this {
    delete this.attrs.classes[className];
    this.registry?.onUpdate({
      id: this.attrs.id,
      name: 'class',
      value: undefined,
      oldValue: className,
    });
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
    // Register with old id to support id changes.
    this.registry?.onUpdate({ id: oldID, name, value, oldValue });
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
