// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)

import {Element} from './element';
import {Stave} from "./stave";
import {Glyph} from "./glyph";
import {ILayoutMetrics} from "./types/common";

export class StaveModifier extends Element {
  width: number;
  x: number;

  protected padding: number;
  protected position: number;
  protected stave: Stave;
  private layoutMetrics: ILayoutMetrics;

  static get Position() {
    return {
      LEFT: 1,
      RIGHT: 2,
      ABOVE: 3,
      BELOW: 4,
      BEGIN: 5,
      END: 6,
    };
  }

  constructor() {
    super();
    this.setAttribute('type', 'StaveModifier');

    this.padding = 10;
    this.position = StaveModifier.Position.ABOVE;
    this.layoutMetrics = null;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position: number) {
    this.position = position;
    return this;
  }

  getStave() {
    return this.stave;
  }

  setStave(stave: Stave) {
    this.stave = stave;
    return this;
  }

  getWidth() {
    return this.width;
  }

  setWidth(width: number) {
    this.width = width;
    return this;
  }

  getX() {
    return this.x;
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  getCategory() {
    return '';
  }

  makeSpacer(padding: number) {
    // TODO(0xfe): Return an instance of type `Spacer` based on `GhostNote`
    // instead of this hack.

    return {
      getContext() {
        return true;
      },
      setStave() {
      },
      renderToStave() {
      },
      getMetrics() {
        return {width: padding};
      },
    };
  }

  placeGlyphOnLine(glyph: Glyph, stave: Stave, line: number, customShift = 0) {
    glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs() + customShift);
  }

  getPadding(index: number) {
    return (index !== undefined && index < 2 ? 0 : this.padding);
  }

  setPadding(padding: number) {
    this.padding = padding;
    return this;
  }

  setLayoutMetrics(layoutMetrics: any) {
    this.layoutMetrics = layoutMetrics;
    return this;
  }

  getLayoutMetrics() {
    return this.layoutMetrics;
  }
}
