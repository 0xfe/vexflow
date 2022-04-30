// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
// MIT License

import { BoundingBox } from './boundingbox';
import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { Registry } from './registry';
import { RenderContext } from './rendercontext';
import { Category } from './typeguard';
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
  /**
   * CSS color used for the shadow.
   *
   * Examples: 'red', '#ff0000', '#ff000010', 'rgb(255,0,0)'
   *
   * See [CSS Legal Color Values](https://www.w3schools.com/cssref/css_colors_legal.asp)
   */
  shadowColor?: string;
  /**
   * Level of blur applied to shadows.
   *
   * Values that are not finite numbers greater than or equal to zero are ignored.
   */
  shadowBlur?: number;
  /**
   * CSS color used with context fill command.
   *
   * Examples: 'red', '#ff0000', '#ff000010', 'rgb(255,0,0)'
   *
   * See [CSS Legal Color Values](https://www.w3schools.com/cssref/css_colors_legal.asp)
   */
  fillStyle?: string;
  /**
   * CSS color used with context stroke command.
   *
   * Examples: 'red', '#ff0000', '#ff000010', 'rgb(255,0,0)'
   *
   * See [CSS Legal Color Values](https://www.w3schools.com/cssref/css_colors_legal.asp)
   */
  strokeStyle?: string;
  /**
   * Line width, 1.0 by default.
   */
  lineWidth?: number;
}

/**
 * Element implements a generic base class for VexFlow, with implementations
 * of general functions and properties that can be inherited by all VexFlow elements.
 */
export abstract class Element {
  static get CATEGORY(): string {
    return Category.Element;
  }

  protected children: Element[] = [];
  protected static ID: number = 1000;
  protected static newID(): string {
    return `auto${Element.ID++}`;
  }

  /**
   * Default font for text. This is not related to music engraving. Instead, see `Flow.setMusicFont(...fontNames)`
   * to customize the font for musical symbols placed on the score.
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
   * It is undefined by default, and can be set using `setFont(...)` or `resetFont()`.
   */
  protected textFont?: Required<FontInfo>;

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

  addChildElement(child: Element): this {
    this.children.push(child);
    return this;
  }

  getCategory(): string {
    return (<typeof Element>this.constructor).CATEGORY;
  }

  /**
   * Set the element style used to render.
   *
   * Example:
   * ```typescript
   * element.setStyle({ fillStyle: 'red', strokeStyle: 'red' });
   * element.draw();
   * ```
   * Note: If the element draws additional sub-elements (ie.: Modifiers in a Stave),
   * the style can be applied to all of them by means of the context:
   * ```typescript
   * element.setStyle({ fillStyle: 'red', strokeStyle: 'red' });
   * element.getContext().setFillStyle('red');
   * element.getContext().setStrokeStyle('red');
   * element.draw();
   * ```
   * or using drawWithStyle:
   * ```typescript
   * element.setStyle({ fillStyle: 'red', strokeStyle: 'red' });
   * element.drawWithStyle();
   * ```
   */
  setStyle(style: ElementStyle): this {
    this.style = style;
    return this;
  }

  /** Set the element & associated children style used for rendering. */
  setGroupStyle(style: ElementStyle): this {
    this.style = style;
    this.children.forEach((child) => child.setGroupStyle(style));
    return this;
  }

  /** Get the element style used for rendering. */
  getStyle(): ElementStyle | undefined {
    return this.style;
  }

  /** Apply the element style to `context`. */
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

  /** Restore the style of `context`. */
  restoreStyle(
    context: RenderContext | undefined = this.context,
    style: ElementStyle | undefined = this.getStyle()
  ): this {
    if (!style) return this;
    if (!context) return this;
    context.restore();
    return this;
  }

  /**
   * Draw the element and all its sub-elements (ie.: Modifiers in a Stave)
   * with the element style.
   */
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

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Font Handling

  /**
   * Provide a CSS compatible font string (e.g., 'bold 16px Arial').
   */
  set font(f: string) {
    this.setFont(f);
  }

  /** Returns the CSS compatible font string. */
  get font(): string {
    return Font.toCSSString(this.textFont);
  }

  /**
   * Set the element's font family, size, weight, style (e.g., `Arial`, `10pt`, `bold`, `italic`).
   * @param font is 1) a `FontInfo` object or
   *                2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
   *                3) a string representing the font family (at least one of `size`, `weight`, or `style` must also be provided).
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
   * @param style is a string (e.g., 'italic', 'normal').
   * If no arguments are provided, then the font is set to the default font.
   * Each Element subclass may specify its own default by overriding the static `TEXT_FONT` property.
   */
  setFont(font?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    // Allow subclasses to override `TEXT_FONT`.
    const defaultTextFont: Required<FontInfo> = (<typeof Element>this.constructor).TEXT_FONT;

    const fontIsObject = typeof font === 'object';
    const fontIsString = typeof font === 'string';
    const fontIsUndefined = font === undefined;
    const sizeWeightStyleAreUndefined = size === undefined && weight === undefined && style === undefined;

    if (fontIsObject) {
      // `font` is case 1) a FontInfo object
      this.textFont = { ...defaultTextFont, ...font };
    } else if (fontIsString && sizeWeightStyleAreUndefined) {
      // `font` is case 2) CSS font shorthand.
      this.textFont = Font.fromCSSString(font);
    } else if (fontIsUndefined && sizeWeightStyleAreUndefined) {
      // All arguments are undefined. Do not check for `arguments.length === 0`,
      // which fails on the edge case: `setFont(undefined)`.
      // TODO: See if we can remove this case entirely without introducing a visual diff.
      // The else case below seems like it should be equivalent to this case.
      this.textFont = { ...defaultTextFont };
    } else {
      // `font` is case 3) a font family string (e.g., 'Times New Roman').
      // The other parameters represent the size, weight, and style.
      // It is okay for `font` to be undefined while one or more of the other arguments is provided.
      // Following CSS conventions, unspecified params are reset to the default.
      this.textFont = Font.validate(
        font ?? defaultTextFont.family,
        size ?? defaultTextFont.size,
        weight ?? defaultTextFont.weight,
        style ?? defaultTextFont.style
      );
    }
    return this;
  }

  getFont(): string {
    if (!this.textFont) {
      this.resetFont();
    }
    return Font.toCSSString(this.textFont);
  }

  /**
   * Reset the text font to the style indicated by the static `TEXT_FONT` property.
   * Subclasses can call this to initialize `textFont` for the first time.
   */
  resetFont(): void {
    this.setFont();
  }

  /** Return a copy of the current FontInfo object. */
  get fontInfo(): Required<FontInfo> {
    if (!this.textFont) {
      this.resetFont();
    }
    // We can cast to Required<FontInfo> here, because
    // we just called resetFont() above to ensure this.textFont is set.
    return { ...this.textFont } as Required<FontInfo>;
  }

  set fontInfo(fontInfo: FontInfo) {
    this.setFont(fontInfo);
  }

  /** Change the font size, while keeping everything else the same. */
  setFontSize(size?: string | number): this {
    const fontInfo = this.fontInfo;
    this.setFont(fontInfo.family, size, fontInfo.weight, fontInfo.style);
    return this;
  }

  /**
   * @returns a CSS font-size string (e.g., '18pt', '12px', '1em').
   * See Element.fontSizeInPixels or Element.fontSizeInPoints if you need to get a number for calculation purposes.
   */
  getFontSize(): string {
    return this.fontSize;
  }

  /**
   * The size is 1) a string of the form '10pt' or '16px', compatible with the CSS font-size property.
   *          or 2) a number, which is interpreted as a point size (i.e. 12 == '12pt').
   */
  set fontSize(size: string | number) {
    this.setFontSize(size);
  }

  /**
   * @returns a CSS font-size string (e.g., '18pt', '12px', '1em').
   */
  get fontSize(): string {
    let size = this.fontInfo.size;
    if (typeof size === 'number') {
      size = `${size}pt`;
    }
    return size;
  }

  /**
   * @returns the font size in `pt`.
   */
  get fontSizeInPoints(): number {
    return Font.convertSizeToPointValue(this.fontSize);
  }

  /**
   * @returns the font size in `px`.
   */
  get fontSizeInPixels(): number {
    return Font.convertSizeToPixelValue(this.fontSize);
  }

  /**
   * @returns a CSS font-style string (e.g., 'italic').
   */
  get fontStyle(): string {
    return this.fontInfo.style;
  }

  set fontStyle(style: string) {
    const fontInfo = this.fontInfo;
    this.setFont(fontInfo.family, fontInfo.size, fontInfo.weight, style);
  }

  /**
   * @returns a CSS font-weight string (e.g., 'bold').
   * As in CSS, font-weight is always returned as a string, even if it was set as a number.
   */
  get fontWeight(): string {
    return this.fontInfo.weight + '';
  }

  set fontWeight(weight: string | number) {
    const fontInfo = this.fontInfo;
    this.setFont(fontInfo.family, fontInfo.size, weight, fontInfo.style);
  }
}
