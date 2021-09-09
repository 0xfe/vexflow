// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { RuntimeError } from './util';
import { Flow } from './flow';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';

export interface BendPhrase {
  x?: number;
  type: number;
  text: string;
  width?: number;
  draw_width?: number;
}

export interface BendRenderOptions {
  line_width: number;
  release_width: number;
  bend_width: number;
  line_style: string;
}

/** Bend implements tablature bends. */
export class Bend extends Modifier {
  static get CATEGORY(): string {
    return 'Bend';
  }

  static get UP(): number {
    return 0;
  }

  static get DOWN(): number {
    return 1;
  }

  // Arrange bends in `ModifierContext`
  static format(bends: Bend[], state: ModifierContextState): boolean {
    if (!bends || bends.length === 0) return false;

    let last_width = 0;
    // Bends are always on top.
    const text_line = state.top_text_line;

    // Format Bends
    for (let i = 0; i < bends.length; ++i) {
      const bend = bends[i];
      bend.setXShift(last_width);
      last_width = bend.getWidth();
      bend.setTextLine(text_line);
    }

    state.right_shift += last_width;
    state.top_text_line += 1;
    return true;
  }

  protected text: string;
  protected release: boolean;
  protected phrase: BendPhrase[];
  protected font: string;
  protected render_options: BendRenderOptions;

  /**
   * Example of a phrase:
   * ```
   *    [{
   *     type: UP,
   *     text: "whole"
   *     width: 8;
   *   },
   *   {
   *     type: DOWN,
   *     text: "whole"
   *     width: 8;
   *   },
   *   {
   *     type: UP,
   *     text: "half"
   *     width: 8;
   *   },
   *   {
   *     type: UP,
   *     text: "whole"
   *     width: 8;
   *   },
   *   {
   *     type: DOWN,
   *     text: "1 1/2"
   *     width: 8;
   *   }]
   * ```
   * @param text text for bend ("Full", "Half", etc.) (DEPRECATED)
   * @param release if true, render a release. (DEPRECATED)
   * @param phrase if set, ignore "text" and "release", and use the more sophisticated phrase specified
   */
  constructor(text: string, release: boolean = false, phrase?: BendPhrase[]) {
    super();

    this.text = text;
    this.x_shift = 0;
    this.release = release;
    this.font = '10pt Arial';
    this.render_options = {
      line_width: 1.5,
      line_style: '#777777',
      bend_width: 8,
      release_width: 8,
    };

    if (phrase) {
      this.phrase = phrase;
    } else {
      // Backward compatibility
      this.phrase = [{ type: Bend.UP, text: this.text }];
      if (this.release) this.phrase.push({ type: Bend.DOWN, text: '' });
    }

    this.updateWidth();
  }

  /** Set horizontal shift in pixels. */
  setXShift(value: number): this {
    this.x_shift = value;
    this.updateWidth();
    return this;
  }

  /** Set text's font. */
  setFont(font: string): this {
    this.font = font;
    return this;
  }

  /** Get text provided in the constructor. */
  getText(): string {
    return this.text;
  }

  /** Recalculate width. */
  protected updateWidth(): this {
    // eslint-disable-next-line
    const that = this;

    function measure_text(text: string) {
      let text_width;
      const ctxThat = that.getContext();
      if (ctxThat) {
        text_width = ctxThat.measureText(text).width;
      } else {
        text_width = Flow.textWidth(text);
      }

      return text_width;
    }

    let total_width = 0;
    for (let i = 0; i < this.phrase.length; ++i) {
      const bend = this.phrase[i];
      if (bend.width != undefined) {
        total_width += bend.width;
      } else {
        const additional_width =
          bend.type === Bend.UP ? this.render_options.bend_width : this.render_options.release_width;

        bend.width = Math.max(additional_width, measure_text(bend.text)) + 3;
        bend.draw_width = bend.width / 2;
        total_width += bend.width;
      }
    }

    this.setWidth(total_width + this.x_shift);
    return this;
  }

  /** Draw the bend on the rendering context. */
  draw(): void {
    const ctx = this.checkContext();
    const note = this.checkAttachedNote();
    this.setRendered();

    const start = note.getModifierStartXY(Modifier.Position.RIGHT, this.index);
    start.x += 3;
    start.y += 0.5;
    const x_shift = this.x_shift;

    const stave = note.checkStave();
    const bend_height = stave.getYForTopText(this.text_line) + 3;
    const annotation_y = stave.getYForTopText(this.text_line) - 1;
    // eslint-disable-next-line
    const that = this;

    function renderBend(x: number, y: number, width: number, height: number) {
      const cp_x = x + width;
      const cp_y = y;

      ctx.save();
      ctx.beginPath();
      ctx.setLineWidth(that.render_options.line_width);
      ctx.setStrokeStyle(that.render_options.line_style);
      ctx.setFillStyle(that.render_options.line_style);
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(cp_x, cp_y, x + width, height);
      ctx.stroke();
      ctx.restore();
    }

    function renderRelease(x: number, y: number, width: number, height: number) {
      ctx.save();
      ctx.beginPath();
      ctx.setLineWidth(that.render_options.line_width);
      ctx.setStrokeStyle(that.render_options.line_style);
      ctx.setFillStyle(that.render_options.line_style);
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + width, height, x + width, y);
      ctx.stroke();
      ctx.restore();
    }

    function renderArrowHead(x: number, y: number, direction?: number) {
      const width = 4;
      const dir = direction || 1;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - width, y + width * dir);
      ctx.lineTo(x + width, y + width * dir);
      ctx.closePath();
      ctx.fill();
    }

    function renderText(x: number, text: string) {
      ctx.save();
      ctx.setRawFont(that.font);
      const render_x = x - ctx.measureText(text).width / 2;
      ctx.fillText(text, render_x, annotation_y);
      ctx.restore();
    }

    let last_bend = undefined;
    let last_bend_draw_width = 0;
    let last_drawn_width = 0;
    for (let i = 0; i < this.phrase.length; ++i) {
      const bend = this.phrase[i];
      if (!bend.draw_width) bend.draw_width = 0;
      if (i === 0) bend.draw_width += x_shift;

      last_drawn_width = bend.draw_width + last_bend_draw_width - (i === 1 ? x_shift : 0);
      if (bend.type === Bend.UP) {
        if (last_bend && last_bend.type === Bend.UP) {
          renderArrowHead(start.x, bend_height);
        }

        renderBend(start.x, start.y, last_drawn_width, bend_height);
      }

      if (bend.type === Bend.DOWN) {
        if (last_bend && last_bend.type === Bend.UP) {
          renderRelease(start.x, start.y, last_drawn_width, bend_height);
        }

        if (last_bend && last_bend.type === Bend.DOWN) {
          renderArrowHead(start.x, start.y, -1);
          renderRelease(start.x, start.y, last_drawn_width, bend_height);
        }

        if (!last_bend) {
          last_drawn_width = bend.draw_width;
          renderRelease(start.x, start.y, last_drawn_width, bend_height);
        }
      }

      renderText(start.x + last_drawn_width, bend.text);
      last_bend = bend;
      last_bend_draw_width = bend.draw_width;
      last_bend.x = start.x;

      start.x += last_drawn_width;
    }

    if (!last_bend || last_bend.x == undefined) {
      throw new RuntimeError('NoLastBendForBend', 'Internal error.');
    }

    // Final arrowhead and text
    if (last_bend.type === Bend.UP) {
      renderArrowHead(last_bend.x + last_drawn_width, bend_height);
    } else if (last_bend.type === Bend.DOWN) {
      renderArrowHead(last_bend.x + last_drawn_width, start.y, -1);
    }
  }
}
