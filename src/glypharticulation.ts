// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Articulation } from './articulation';
import { Glyph } from './glyph';
import { Category } from './typeguard';

export class GlyphArticulation extends Articulation {
  static get CATEGORY(): string {
    return Category.Articulation;
  }

  constructor(code: string, between_lines = false) {
    super('glyph');
    this.articulation = { code, between_lines };
    this.glyph = new Glyph(code ?? '', this.render_options.font_scale);
    this.setWidth(this.glyph.getMetrics().width);
  }

  protected reset(): void {
    // Do nothing.
  }
}
