// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)

import { Element } from './element';

export class StaveModifier extends Element {
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

  getPosition() { return this.position; }
  setPosition(position) { this.position = position; return this; }
  getStave() { return this.stave; }
  setStave(stave) { this.stave = stave; return this; }
  getWidth() { return this.width; }
  setWidth(width) { this.width = width; return this; }
  getX() { return this.x; }
  setX(x) { this.x = x; return this; }
  getCategory() { return ''; }
  makeSpacer(padding) {
    // TODO(0xfe): Return an instance of type `Spacer` based on `GhostNote`
    // instead of this hack.

    return {
      getContext() { return true; },
      setStave() {},
      renderToStave() {},
      getMetrics() {
        return { width: padding };
      },
    };
  }
  placeGlyphOnLine(glyph, stave, line, customShift = 0) {
    glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs() + customShift);
  }
  getPadding(index) {
    return (index !== undefined && index < 2 ? 0 : this.padding);
  }
  setPadding(padding) { this.padding = padding; return this; }
  setLayoutMetrics(layoutMetrics) {
    this.layoutMetrics = layoutMetrics;
    return this;
  }
  getLayoutMetrics() {
    return this.layoutMetrics;
  }
}
