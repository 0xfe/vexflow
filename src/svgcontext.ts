// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// @author Gregory Ristow (2015)

import { RuntimeError, prefix } from './util';
import { RenderContext, TextMeasure } from './types/common';

// eslint-disable-next-line
type Attributes = { [key: string]: any };

const attrNamesToIgnoreMap: { [nodeName: string]: Attributes } = {
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

interface State {
  state: Attributes;
  attributes: Attributes;
  shadow_attributes: Attributes;
  lineWidth: number;
}

class MeasureTextCache {
  protected txt: SVGTextElement;

  // The cache is keyed first by the text string, then by the font attributes
  // joined together.
  protected cache: Record<string, Record<string, TextMeasure>> = {};

  constructor() {
    // Create the SVG elements that will be used to measure the text in the event
    // of a cache miss.
    this.txt = document.createElementNS(SVG_NS, 'text');
  }

  lookup(text: string, svg: SVGSVGElement, attributes: Attributes): TextMeasure {
    let entries = this.cache[text];
    if (entries === undefined) {
      entries = {};
      this.cache[text] = entries;
    }

    const family = attributes['font-family'];
    const size = attributes['font-size'];
    const style = attributes['font-style'];
    const weight = attributes['font-weight'];

    const key = `${family}%${size}%${style}%${weight}`;
    let entry = entries[key];
    if (entry === undefined) {
      entry = this.measureImpl(text, svg, attributes);
      entries[key] = entry;
    }
    return entry;
  }

  measureImpl(text: string, svg: SVGSVGElement, attributes: Attributes): TextMeasure {
    this.txt.textContent = text;
    this.txt.setAttributeNS(null, 'font-family', attributes['font-family']);
    this.txt.setAttributeNS(null, 'font-size', attributes['font-size']);
    this.txt.setAttributeNS(null, 'font-style', attributes['font-style']);
    this.txt.setAttributeNS(null, 'font-weight', attributes['font-weight']);
    svg.appendChild(this.txt);
    const bbox = this.txt.getBBox();
    svg.removeChild(this.txt);

    // Remove the trailing 'pt' from the font size and scale to convert from points
    // to canvas units.
    // CSS specifies dpi to be 96 and there are 72 points to an inch: 96/72 == 4/3.
    const fontSize = attributes['font-size'];
    const height = (fontSize.substring(0, fontSize.length - 2) * 4) / 3;
    return {
      width: bbox.width,
      height: height,
    };
  }
}

/**
 * SVG rendering context with an API similar to CanvasRenderingContext2D.
 */
export class SVGContext implements RenderContext {
  protected static measureTextCache = new MeasureTextCache();

  element: HTMLElement; // the parent DOM object
  svg: SVGSVGElement;
  width: number = 0;
  height: number = 0;
  path: string;
  pen: { x: number; y: number };
  lineWidth: number;
  attributes: Attributes;
  background_attributes: Attributes;
  shadow_attributes: Attributes;
  state: Attributes;
  state_stack: State[];
  parent: SVGGElement;
  groups: SVGGElement[];
  fontString: string = '';

  constructor(element: HTMLElement) {
    this.element = element;

    const svg = this.create('svg');
    // Add it to the canvas:
    this.element.appendChild(svg);

    // Point to it:
    this.svg = svg;
    this.groups = [this.svg]; // Create the group stack
    this.parent = this.svg;

    this.path = '';
    this.pen = { x: NaN, y: NaN };
    this.lineWidth = 1.0;
    this.state = {
      scale: { x: 1, y: 1 },
      'font-family': 'Arial',
      'font-size': '8pt',
      'font-weight': 'normal',
    };

    const defaultAttributes = {
      'stroke-dasharray': 'none',
      'font-family': 'Arial',
      'font-size': '10pt',
      'font-weight': 'normal',
      'font-style': 'normal',
    };

    this.attributes = {
      'stroke-width': 0.3,
      fill: 'black',
      stroke: 'black',
      ...defaultAttributes,
    };

    this.background_attributes = {
      'stroke-width': 0,
      fill: 'white',
      stroke: 'white',
      ...defaultAttributes,
    };

    this.shadow_attributes = {
      width: 0,
      color: 'black',
    };

    this.state_stack = [];
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
  openGroup(cls: string, id?: string, attrs?: { pointerBBox: boolean }): SVGGElement {
    const group = this.create('g');
    this.groups.push(group);
    this.parent.appendChild(group);
    this.parent = group;
    if (cls) group.setAttribute('class', prefix(cls));
    if (id) group.setAttribute('id', prefix(id));

    if (attrs && attrs.pointerBBox) {
      group.setAttribute('pointer-events', 'bounding-box');
    }
    return group;
  }

  closeGroup(): void {
    this.groups.pop();
    this.parent = this.groups[this.groups.length - 1];
  }

  add(elem: SVGElement): void {
    this.parent.appendChild(elem);
  }

  // ### Styling & State Methods:

  setFont(family: string, size: number, weight: string): this {
    // In SVG italic is handled by font-style.
    // We search the weight argument and apply bold and italic
    // to font-weight and font-style respectively.
    let foundBold = false;
    let foundItalic = false;
    // Weight might also be a number (200, 400, etc...) so we
    // test its type to be sure we have access to String methods.
    if (typeof weight === 'string') {
      // look for "italic" in the weight:
      if (weight.indexOf('italic') !== -1) {
        weight = weight.replace(/italic/g, '');
        foundItalic = true;
      }
      // look for "bold" in weight
      if (weight.indexOf('bold') !== -1) {
        weight = weight.replace(/bold/g, '');
        foundBold = true;
      }
      // remove any remaining spaces
      weight = weight.replace(/ /g, '');
    }
    const noWeightProvided = typeof weight === 'undefined' || weight === '';
    if (noWeightProvided) {
      weight = 'normal';
    }

    const fontAttributes = {
      'font-family': family,
      'font-size': size + 'pt',
      'font-weight': foundBold ? 'bold' : weight,
      'font-style': foundItalic ? 'italic' : 'normal',
    };

    // Currently this.fontString only supports size & family. See setRawFont().
    this.fontString = `${size}pt ${family}`;
    this.attributes = { ...this.attributes, ...fontAttributes };
    this.state = { ...this.state, ...fontAttributes };

    return this;
  }

  setRawFont(font: string): this {
    this.fontString = font.trim();
    // Assumes size first, splits on space -- which is presently
    // how all existing modules are calling this.
    const fontArray = this.fontString.split(' ');

    const size = fontArray[0];
    this.attributes['font-size'] = size;
    this.state['font-size'] = size;

    const family = fontArray[1];
    this.attributes['font-family'] = family;
    this.state['font-family'] = family;

    return this;
  }

  setFillStyle(style: string): this {
    this.attributes.fill = style;
    return this;
  }

  setBackgroundFillStyle(style: string): this {
    this.background_attributes.fill = style;
    this.background_attributes.stroke = style;
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
    this.scale(this.state.scale.x, this.state.scale.y);
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

    this.state.scale = { x, y };
    const visibleWidth = this.width / x;
    const visibleHeight = this.height / y;
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
    const attrNamesToIgnore = attrNamesToIgnoreMap[element.nodeName];
    Object.keys(attributes).forEach((propertyName) => {
      if (attrNamesToIgnore && attrNamesToIgnore[propertyName]) {
        return;
      }
      element.setAttributeNS(null, propertyName, attributes[propertyName]);
    });

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

    // Replace the viewbox attribute we just removed:
    this.scale(this.state.scale.x, this.state.scale.y);
  }

  // ## Rectangles:
  rect(x: number, y: number, width: number, height: number, attributes?: Attributes): this {
    // Avoid invalid negative height attribs by
    // flipping the rectangle on its head:
    if (height < 0) {
      y += height;
      height *= -1;
    }

    // Create the rect & style it:
    const rectangle = this.create('rect');
    if (typeof attributes === 'undefined') {
      attributes = {
        fill: 'none',
        'stroke-width': this.lineWidth,
        stroke: 'black',
      };
    }

    attributes = { ...attributes, x, y, width, height };

    this.applyAttributes(rectangle, attributes);

    this.add(rectangle);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number): this {
    if (height < 0) {
      y += height;
      height *= -1;
    }

    this.rect(x, y, width, height, this.attributes);
    return this;
  }

  clearRect(x: number, y: number, width: number, height: number): this {
    // TODO(GCR): Improve implementation of this...
    // Currently it draws a box of the background color, rather
    // than creating alpha through lower z-levels.
    //
    // See the implementation of this in SVGKit:
    // http://sourceforge.net/projects/svgkit/
    // as a starting point.
    //
    // Adding a large number of transform paths (as we would
    // have to do) could be a real performance hit.  Since
    // tabNote seems to be the only module that makes use of this
    // it may be worth creating a separate tabStave that would
    // draw lines around locations of tablature fingering.
    //
    this.rect(x, y, width, height, this.background_attributes);
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
    this.path += 'M' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  lineTo(x: number, y: number): this {
    this.path += 'L' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    this.path += 'C' + x1 + ' ' + y1 + ',' + x2 + ' ' + y2 + ',' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): this {
    this.path += 'Q' + x1 + ' ' + y1 + ',' + x + ' ' + y;
    this.pen.x = x;
    this.pen.y = y;
    return this;
  }

  // This is an attempt (hack) to simulate the HTML5 canvas arc method.
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise: boolean): this {
    function normalizeAngle(angle: number) {
      while (angle < 0) {
        angle += Math.PI * 2;
      }
      while (angle > Math.PI * 2) {
        angle -= Math.PI * 2;
      }
      return angle;
    }

    startAngle = normalizeAngle(startAngle);
    endAngle = normalizeAngle(endAngle);

    // Swap the start and end angles if necessary.
    if (startAngle > endAngle) {
      const tmp = startAngle;
      startAngle = endAngle;
      endAngle = tmp;
      antiClockwise = !antiClockwise;
    }

    const delta = endAngle - startAngle;
    if (delta > Math.PI) {
      this.arcHelper(x, y, radius, startAngle, startAngle + delta / 2, antiClockwise);
      this.arcHelper(x, y, radius, startAngle + delta / 2, endAngle, antiClockwise);
    } else {
      this.arcHelper(x, y, radius, startAngle, endAngle, antiClockwise);
    }
    return this;
  }

  arcHelper(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise: boolean): void {
    const x1 = x + radius * Math.cos(startAngle);
    const y1 = y + radius * Math.sin(startAngle);

    const x2 = x + radius * Math.cos(endAngle);
    const y2 = y + radius * Math.sin(endAngle);

    let largeArcFlag = 0;
    let sweepFlag = 0;
    if (antiClockwise) {
      sweepFlag = 1;
      if (endAngle - startAngle < Math.PI) {
        largeArcFlag = 1;
      }
    } else if (endAngle - startAngle > Math.PI) {
      largeArcFlag = 1;
    }

    this.path += `M${x1} ${y1} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;

    if (!isNaN(this.pen.x) && !isNaN(this.pen.y)) {
      this.path += 'M' + this.pen.x + ' ' + this.pen.y;
    }
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
    return `filter: drop-shadow(0 0 ${sa.width / 1.5}px ${sa.color})`;
  }

  fill(attributes: Attributes): this {
    const path = this.create('path');
    if (typeof attributes === 'undefined') {
      attributes = { ...this.attributes, stroke: 'none' };
    }

    attributes.d = this.path;
    if (this.shadow_attributes.width > 0) {
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
    if (this.shadow_attributes.width > 0) {
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

  save(): this {
    // TODO(mmuthanna): State needs to be deep-copied.
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

  restore(): this {
    // TODO(0xfe): State needs to be deep-restored.
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

  set font(value: string) {
    this.setRawFont(value);
  }

  get font(): string {
    return this.fontString;
  }

  set fillStyle(style: string | CanvasGradient | CanvasPattern) {
    this.setFillStyle(style as string);
  }

  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.attributes.fill;
  }

  set strokeStyle(style: string | CanvasGradient | CanvasPattern) {
    this.setStrokeStyle(style as string);
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.attributes.stroke;
  }
}
