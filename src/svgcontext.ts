// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// @author Gregory Ristow (2015)

import { Font, FontInfo, FontStyle, FontWeight } from './font';
import { GroupAttributes, RenderContext, TextMeasure } from './rendercontext';
import { Tables } from './tables';
import { normalizeAngle, prefix, RuntimeError } from './util';

export type Attributes = {
  [name: string]: string | number | undefined;
  'font-family'?: string;
  'font-size'?: string | number;
  'font-style'?: string;
  'font-weight'?: string | number;
  scaleX?: number;
  scaleY?: number;
};

/** For a particular element type (e.g., rect), we will not apply certain presentation attributes. */
const ATTRIBUTES_TO_IGNORE: Record<string /* element type */, Record<string, boolean> /* ignored attributes */> = {
  path: {
    x: true,
    y: true,
    width: true,
    height: true,
    'font-family': true,
    'font-weight': true,
    'font-style': true,
    'font-size': true,
  },
  rect: {
    'font-family': true,
    'font-weight': true,
    'font-style': true,
    'font-size': true,
  },
  text: {
    width: true,
    height: true,
  },
};

/** Create the SVG in the SVG namespace. */
const SVG_NS = 'http://www.w3.org/2000/svg';

const TWO_PI = 2 * Math.PI;

export interface State {
  state: Attributes;
  attributes: Attributes;
  shadow_attributes: Attributes;
  lineWidth: number;
}

class MeasureTextCache {
  protected txt?: SVGTextElement;

  // The cache is keyed first by the text string, then by the font attributes
  // joined together.
  protected cache: Record<string, Record<string, TextMeasure>> = {};

  lookup(text: string, svg: SVGSVGElement, attributes: Attributes): TextMeasure {
    let entries = this.cache[text];
    if (entries === undefined) {
      entries = {};
      this.cache[text] = entries;
    }

    const family = attributes['font-family'];
    const size = attributes['font-size'];
    const weight = attributes['font-weight'];
    const style = attributes['font-style'];

    const key = `${family}%${size}%${weight}%${style}`;
    let entry = entries[key];
    if (entry === undefined) {
      entry = this.measureImpl(text, svg, attributes);
      entries[key] = entry;
    }
    return entry;
  }

  measureImpl(text: string, svg: SVGSVGElement, attributes: Attributes): TextMeasure {
    let txt = this.txt;
    if (!txt) {
      // Create the SVG text element that will be used to measure text in the event
      // of a cache miss.
      txt = document.createElementNS(SVG_NS, 'text');
      this.txt = txt;
    }

    txt.textContent = text;
    if (attributes['font-family']) txt.setAttributeNS(null, 'font-family', attributes['font-family']);
    if (attributes['font-size']) txt.setAttributeNS(null, 'font-size', `${attributes['font-size']}`);
    if (attributes['font-style']) txt.setAttributeNS(null, 'font-style', attributes['font-style']);
    if (attributes['font-weight']) txt.setAttributeNS(null, 'font-weight', `${attributes['font-weight']}`);
    svg.appendChild(txt);
    const bbox = txt.getBBox();
    svg.removeChild(txt);

    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
  }
}

/**
 * SVG rendering context with an API similar to CanvasRenderingContext2D.
 */
export class SVGContext extends RenderContext {
  protected static measureTextCache = new MeasureTextCache();

  element: HTMLElement; // the parent DOM object
  svg: SVGSVGElement;
  width: number = 0;
  height: number = 0;
  path: string;
  pen: { x: number; y: number };
  lineWidth: number;
  attributes: Attributes;
  shadow_attributes: Attributes;
  state: Attributes;
  state_stack: State[];

  // Always points to the current group.
  // Calls to add() or openGroup() will append the new element to `this.parent`.
  parent: SVGGElement;
  // The stack of groups.
  groups: SVGGElement[];
  // The stack of attributes associated with each group.
  protected groupAttributes: Attributes[];

  protected precision = 1;

  backgroundFillStyle: string = 'white';

  /** Formatted as CSS font shorthand (e.g., 'italic bold 12pt Arial') */
  protected fontCSSString: string = '';

  constructor(element: HTMLElement) {
    super();
    this.element = element;

    this.precision = Math.pow(10, Tables.RENDER_PRECISION_PLACES);

    // Create a SVG element and add it to the container element.
    const svg = this.create('svg');
    this.element.appendChild(svg);
    this.svg = svg;

    this.parent = this.svg;
    this.groups = [this.svg];

    this.path = '';
    this.pen = { x: NaN, y: NaN };
    this.lineWidth = 1.0;

    const defaultFontAttributes = {
      'font-family': Font.SANS_SERIF,
      'font-size': Font.SIZE + 'pt',
      'font-weight': FontWeight.NORMAL,
      'font-style': FontStyle.NORMAL,
    };

    this.state = {
      scaleX: 1,
      scaleY: 1,
      ...defaultFontAttributes,
    };

    this.attributes = {
      'stroke-width': 0.3,
      'stroke-dasharray': 'none',
      fill: 'black',
      stroke: 'black',
      ...defaultFontAttributes,
    };

    this.groupAttributes = [];
    this.applyAttributes(svg, this.attributes);
    this.groupAttributes.push({ ...this.attributes });

    this.shadow_attributes = {
      width: 0,
      color: 'black',
    };

    this.state_stack = [];
  }

  protected round(n: number): number {
    return Math.round(n * this.precision) / this.precision;
  }

  /**
   * Use one of the overload signatures to create an SVG element of a specific type.
   * The last overload accepts an arbitrary string, and is identical to the
   * implementation signature.
   * Feel free to add new overloads for other SVG element types as required.
   */
  create(svgElementType: 'g'): SVGGElement;
  create(svgElementType: 'path'): SVGPathElement;
  create(svgElementType: 'rect'): SVGRectElement;
  create(svgElementType: 'svg'): SVGSVGElement;
  create(svgElementType: 'text'): SVGTextElement;
  create(svgElementType: string): SVGElement;
  create(svgElementType: string): SVGElement {
    return document.createElementNS(SVG_NS, svgElementType);
  }

  // Allow grouping elements in containers for interactivity.
  openGroup(cls?: string, id?: string, attrs?: GroupAttributes): SVGGElement {
    const group = this.create('g');
    this.groups.push(group);
    this.parent.appendChild(group);
    this.parent = group;
    if (cls) group.setAttribute('class', prefix(cls));
    if (id) group.setAttribute('id', prefix(id));

    if (attrs && attrs.pointerBBox) {
      group.setAttribute('pointer-events', 'bounding-box');
    }
    this.applyAttributes(group, this.attributes);
    this.groupAttributes.push({ ...this.groupAttributes[this.groupAttributes.length - 1], ...this.attributes });
    return group;
  }

  closeGroup(): void {
    this.groups.pop();
    this.groupAttributes.pop();
    this.parent = this.groups[this.groups.length - 1];
  }

  add(elem: SVGElement): void {
    this.parent.appendChild(elem);
  }

  setFillStyle(style: string): this {
    this.attributes.fill = style;
    return this;
  }

  /**
   * Used to set the fill color for `clearRect()`. This allows us to simulate
   * cutting a "hole" into the SVG drawing.
   */
  setBackgroundFillStyle(style: string): this {
    this.backgroundFillStyle = style;
    return this;
  }

  setStrokeStyle(style: string): this {
    this.attributes.stroke = style;
    return this;
  }

  setShadowColor(color: string): this {
    this.shadow_attributes.color = color;
    return this;
  }

  /**
   * @param blur A non-negative float specifying the level of shadow blur, where 0
   *             represents no blur and larger numbers represent increasingly more blur.
   * @returns this
   */
  setShadowBlur(blur: number): this {
    this.shadow_attributes.width = blur;
    return this;
  }

  /**
   * @param width
   * @returns this
   */
  setLineWidth(width: number): this {
    this.attributes['stroke-width'] = width;
    this.lineWidth = width;
    return this;
  }

  /**
   * @param lineDash an array of integers in the form of [dash, space, dash, space, etc...]
   * @returns this
   *
   * See: [SVG `stroke-dasharray` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
   */
  setLineDash(lineDash: number[]): this {
    if (Object.prototype.toString.call(lineDash) === '[object Array]') {
      this.attributes['stroke-dasharray'] = lineDash.join(',');
      return this;
    } else {
      throw new RuntimeError('ArgumentError', 'lineDash must be an array of integers.');
    }
  }

  /**
   * @param capType
   * @returns this
   */
  setLineCap(capType: CanvasLineCap): this {
    this.attributes['stroke-linecap'] = capType;
    return this;
  }

  // ### Sizing & Scaling Methods:

  // TODO (GCR): See note at scale() -- separate our internal
  // conception of pixel-based width/height from the style.width
  // and style.height properties eventually to allow users to
  // apply responsive sizing attributes to the SVG.
  resize(width: number, height: number): this {
    this.width = width;
    this.height = height;
    this.element.style.width = width.toString();

    this.svg.style.width = width.toString();
    this.svg.style.height = height.toString();

    const attributes = {
      width,
      height,
    };

    this.applyAttributes(this.svg, attributes);
    this.scale(this.state.scaleX as number, this.state.scaleY as number);
    return this;
  }

  scale(x: number, y: number): this {
    // uses viewBox to scale
    // TODO (GCR): we may at some point want to distinguish the
    // style.width / style.height properties that are applied to
    // the SVG object from our internal conception of the SVG
    // width/height.  This would allow us to create automatically
    // scaling SVG's that filled their containers, for instance.
    //
    // As this isn't implemented in Canvas contexts,
    // I've left as is for now, but in using the viewBox to
    // handle internal scaling, am trying to make it possible
    // for us to eventually move in that direction.

    this.state.scaleX = this.state.scaleX ? this.state.scaleX * x : x;
    this.state.scaleY = this.state.scaleY ? this.state.scaleY * y : y;
    const visibleWidth = this.width / this.state.scaleX;
    const visibleHeight = this.height / this.state.scaleY;
    this.setViewBox(0, 0, visibleWidth, visibleHeight);

    return this;
  }

  /**
   * 1 arg: string in the "x y w h" format
   * 4 args: x:number, y:number, w:number, h:number
   */
  setViewBox(viewBox_or_minX: string | number, minY?: number, width?: number, height?: number): void {
    if (typeof viewBox_or_minX === 'string') {
      this.svg.setAttribute('viewBox', viewBox_or_minX);
    } else {
      const viewBoxString = viewBox_or_minX + ' ' + minY + ' ' + width + ' ' + height;
      this.svg.setAttribute('viewBox', viewBoxString);
    }
  }

  // ### Drawing helper methods:

  applyAttributes(element: SVGElement, attributes: Attributes): SVGElement {
    const attrNamesToIgnore = ATTRIBUTES_TO_IGNORE[element.nodeName];
    for (const attrName in attributes) {
      if (attrNamesToIgnore && attrNamesToIgnore[attrName]) {
        continue;
      }
      if (
        attributes[attrName] &&
        (this.groupAttributes.length == 0 ||
          attributes[attrName] != this.groupAttributes[this.groupAttributes.length - 1][attrName])
      )
        element.setAttributeNS(null, attrName, attributes[attrName] as string);
    }

    return element;
  }

  // ### Shape & Path Methods:

  clear(): void {
    // Clear the SVG by removing all inner children.

    // (This approach is usually slightly more efficient
    // than removing the old SVG & adding a new one to
    // the container element, since it does not cause the
    // container to resize twice.  Also, the resize
    // triggered by removing the entire SVG can trigger
    // a touchcancel event when the element resizes away
    // from a touch point.)

    while (this.svg.lastChild) {
      this.svg.removeChild(this.svg.lastChild);
    }

    // Replace the viewbox attribute we just removed.
    this.scale(this.state.scaleX as number, this.state.scaleY as number);
  }

  // ## Rectangles:
  rect(x: number, y: number, width: number, height: number, attributes?: Attributes): this {
    // Avoid invalid negative height attributes by flipping the rectangle on its head:
    if (height < 0) {
      y += height;
      height *= -1;
    }

    const rectangle = this.create('rect');
    attributes = attributes ?? { fill: 'none', 'stroke-width': this.lineWidth, stroke: 'black' };
    x = this.round(x);
    y = this.round(y);
    width = this.round(width);
    height = this.round(height);
    this.applyAttributes(rectangle, { x, y, width, height, ...attributes });
    this.add(rectangle);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number): this {
    const attributes = { fill: this.attributes.fill, stroke: 'none' };
    this.rect(x, y, width, height, attributes);
    return this;
  }

  clearRect(x: number, y: number, width: number, height: number): this {
    // Currently this fills a rect with the backgroundFillStyle, rather
    // than "cut a hole" into the existing shapes.
    //
    // Since tabNote seems to be the only module that makes use of this
    // it may be worth creating a separate tabStave that would
    // draw lines around locations of tablature fingering.
    this.rect(x, y, width, height, { fill: this.backgroundFillStyle, stroke: 'none' });
    return this;
  }

  // ## Paths:

  beginPath(): this {
    this.path = '';
    this.pen.x = NaN;
    this.pen.y = NaN;
    return this;
  }

  moveTo(x: number, y: number): this {
    x = this.round(x);
    y = this.round(y);
    this.path += 'M' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  lineTo(x: number, y: number): this {
    x = this.round(x);
    y = this.round(y);
    this.path += 'L' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    x = this.round(x);
    y = this.round(y);
    x1 = this.round(x1);
    y1 = this.round(y1);
    x2 = this.round(x2);
    y2 = this.round(y2);
    this.path += 'C' + x1 + ' ' + y1 + ',' + x2 + ' ' + y2 + ',' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): this {
    x = this.round(x);
    y = this.round(y);
    x1 = this.round(x1);
    y1 = this.round(y1);
    this.path += 'Q' + x1 + ' ' + y1 + ',' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this {
    let x0 = x + radius * Math.cos(startAngle);
    let y0 = y + radius * Math.sin(startAngle);
    x0 = this.round(x0);
    y0 = this.round(y0);

    // svg behavior different from canvas.  Don't normalize angles if
    // we are drawing a circle because they both normalize to 0
    const tmpStartTest = normalizeAngle(startAngle);
    const tmpEndTest = normalizeAngle(endAngle);
    if (
      (!counterclockwise && endAngle - startAngle >= TWO_PI) ||
      (counterclockwise && startAngle - endAngle >= TWO_PI) ||
      tmpStartTest === tmpEndTest
    ) {
      let x1 = x + radius * Math.cos(startAngle + Math.PI);
      let y1 = y + radius * Math.sin(startAngle + Math.PI);
      // There's no way to specify a completely circular arc in SVG so we have to
      // use two semi-circular arcs.
      x1 = this.round(x1);
      y1 = this.round(y1);
      radius = this.round(radius);
      this.path += `M${x0} ${y0} A${radius} ${radius} 0 0 0 ${x1} ${y1} `;
      this.path += `A${radius} ${radius} 0 0 0 ${x0} ${y0}`;
      this.pen.x = x0;
      this.pen.y = y0;
    } else {
      let x1 = x + radius * Math.cos(endAngle);
      let y1 = y + radius * Math.sin(endAngle);

      startAngle = tmpStartTest;
      endAngle = tmpEndTest;
      let large: boolean;
      if (Math.abs(endAngle - startAngle) < Math.PI) {
        large = counterclockwise;
      } else {
        large = !counterclockwise;
      }
      if (startAngle > endAngle) {
        large = !large;
      }

      const sweep = !counterclockwise;

      x1 = this.round(x1);
      y1 = this.round(y1);
      radius = this.round(radius);
      this.path += `M${x0} ${y0} A${radius} ${radius} 0 ${+large} ${+sweep} ${x1} ${y1}`;
      this.pen.x = x1;
      this.pen.y = y1;
    }
    return this;
  }

  closePath(): this {
    this.path += 'Z';
    return this;
  }

  private getShadowStyle(): string {
    const sa = this.shadow_attributes;
    // A CSS drop-shadow filter blur looks different than a canvas shadowBlur
    // of the same radius, so we scale the drop-shadow radius here to make it
    // look close to the canvas shadow.
    return `filter: drop-shadow(0 0 ${(sa.width as number) / 1.5}px ${sa.color})`;
  }

  fill(attributes?: Attributes): this {
    const path = this.create('path');
    if (typeof attributes === 'undefined') {
      attributes = { ...this.attributes, stroke: 'none' };
    }

    attributes.d = this.path;
    if ((this.shadow_attributes.width as number) > 0) {
      attributes.style = this.getShadowStyle();
    }

    this.applyAttributes(path, attributes);
    this.add(path);
    return this;
  }

  stroke(): this {
    const path = this.create('path');
    const attributes: Attributes = {
      ...this.attributes,
      fill: 'none',
      'stroke-width': this.lineWidth,
      d: this.path,
    };
    if ((this.shadow_attributes.width as number) > 0) {
      attributes.style = this.getShadowStyle();
    }

    this.applyAttributes(path, attributes);
    this.add(path);
    return this;
  }

  // ## Text Methods:
  measureText(text: string): TextMeasure {
    return SVGContext.measureTextCache.lookup(text, this.svg, this.attributes);
  }

  fillText(text: string, x: number, y: number): this {
    if (!text || text.length <= 0) {
      return this;
    }
    x = this.round(x);
    y = this.round(y);
    const attributes: Attributes = {
      ...this.attributes,
      stroke: 'none',
      x,
      y,
    };

    const txt = this.create('text');
    txt.textContent = text;
    this.applyAttributes(txt, attributes);
    this.add(txt);
    return this;
  }

  // TODO: State should be deep-copied.
  save(): this {
    this.state_stack.push({
      state: {
        'font-family': this.state['font-family'],
        'font-weight': this.state['font-weight'],
        'font-style': this.state['font-style'],
        'font-size': this.state['font-size'],
        scale: this.state.scale,
      },
      attributes: {
        'font-family': this.attributes['font-family'],
        'font-weight': this.attributes['font-weight'],
        'font-style': this.attributes['font-style'],
        'font-size': this.attributes['font-size'],
        fill: this.attributes.fill,
        stroke: this.attributes.stroke,
        'stroke-width': this.attributes['stroke-width'],
        'stroke-dasharray': this.attributes['stroke-dasharray'],
      },
      shadow_attributes: {
        width: this.shadow_attributes.width,
        color: this.shadow_attributes.color,
      },
      lineWidth: this.lineWidth,
    });
    return this;
  }

  // TODO: State should be deep-restored.
  restore(): this {
    const savedState = this.state_stack.pop();
    if (savedState) {
      const state = savedState;
      this.state['font-family'] = state.state['font-family'];
      this.state['font-weight'] = state.state['font-weight'];
      this.state['font-style'] = state.state['font-style'];
      this.state['font-size'] = state.state['font-size'];
      this.state.scale = state.state.scale;

      this.attributes['font-family'] = state.attributes['font-family'];
      this.attributes['font-weight'] = state.attributes['font-weight'];
      this.attributes['font-style'] = state.attributes['font-style'];
      this.attributes['font-size'] = state.attributes['font-size'];

      this.attributes.fill = state.attributes.fill;
      this.attributes.stroke = state.attributes.stroke;
      this.attributes['stroke-width'] = state.attributes['stroke-width'];
      this.attributes['stroke-dasharray'] = state.attributes['stroke-dasharray'];

      this.shadow_attributes.width = state.shadow_attributes.width;
      this.shadow_attributes.color = state.shadow_attributes.color;

      this.lineWidth = state.lineWidth;
    }
    return this;
  }

  set fillStyle(style: string | CanvasGradient | CanvasPattern) {
    this.setFillStyle(style as string);
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.attributes.fill as string;
  }

  set strokeStyle(style: string | CanvasGradient | CanvasPattern) {
    this.setStrokeStyle(style as string);
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.attributes.stroke as string;
  }

  /**
   * @param f is 1) a `FontInfo` object or
   *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
   *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
   * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
   * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900). It is inserted
   *               into the font-weight attribute (e.g., font-weight="bold")
   * @param style is a string (e.g., 'italic', 'normal') that is inserted into the
   *              font-style attribute (e.g., font-style="italic")
   */
  setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this {
    const fontInfo = Font.validate(f, size, weight, style);
    this.fontCSSString = Font.toCSSString(fontInfo);
    const fontAttributes = {
      'font-family': fontInfo.family,
      'font-size': fontInfo.size,
      'font-weight': fontInfo.weight,
      'font-style': fontInfo.style,
    };
    this.attributes = { ...this.attributes, ...fontAttributes };
    this.state = { ...this.state, ...fontAttributes };
    return this;
  }

  /** Return a string of the form `'italic bold 15pt Arial'` */
  getFont(): string {
    return this.fontCSSString;
  }
}
