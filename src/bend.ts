// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Element } from './element';
import { FontInfo } from './font';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { TextFormatter } from './textformatter';
import { Category, isTabNote } from './typeguard';
import { RuntimeError } from './util';

export interface BendPhrase {
  x?: number;
  type: number;
  text: string;
  width?: number;
  draw_width?: number;
}

/** Bend implements tablature bends. */
export class Bend extends Modifier {
  static get CATEGORY(): string {
    return Category.Bend;
  }

  static get UP(): number {
    return 0;
  }

  static get DOWN(): number {
    return 1;
  }

  /** Default text font. */
  static TEXT_FONT: Required<FontInfo> = { ...Element.TEXT_FONT };

  // Arrange bends in `ModifierContext`
  static format(bends: Bend[], state: ModifierContextState): boolean {
    if (!bends || bends.length === 0) return false;

    let last_width = 0;
    // Format Bends
    for (let i = 0; i < bends.length; ++i) {
      const bend = bends[i];
      const note = bend.checkAttachedNote();

      if (isTabNote(note)) {
        const stringPos = note.leastString() - 1;
        if (state.top_text_line < stringPos) {
          state.top_text_line = stringPos;
        }
      }
      bend.setXShift(last_width);
      last_width = bend.getWidth();
      bend.setTextLine(state.top_text_line);
    }

    state.right_shift += last_width;
    state.top_text_line += 1;
    return true;
  }

  protected text: string;
  protected tap: string;
  protected release: boolean;
  protected phrase: BendPhrase[];

  public render_options: {
    line_width: number;
    release_width: number;
    bend_width: number;
    line_style: string;
  };

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
    this.tap = '';
    this.resetFont();
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

  setTap(value: string): this {
    this.tap = value;
    return this;
  }

  /** Get text provided in the constructor. */
  getText(): string {
    return this.text;
  }
  getTextHeight(): number {
    const textFormatter = TextFormatter.create(this.textFont);
    return textFormatter.maxHeight;
  }

  /** Recalculate width. */
  protected updateWidth(): this {
    const textFormatter = TextFormatter.create(this.textFont);
    const measureText = (text: string) => {
      return textFormatter.getWidthForTextInPx(text);
    };

    let totalWidth = 0;
    for (let i = 0; i < this.phrase.length; ++i) {
      const bend = this.phrase[i];
      if (bend.width !== undefined) {
        totalWidth += bend.width;
      } else {
        const additional_width =
          bend.type === Bend.UP ? this.render_options.bend_width : this.render_options.release_width;

        bend.width = Math.max(additional_width, measureText(bend.text)) + 3;
        bend.draw_width = bend.width / 2;
        totalWidth += bend.width;
      }
    }

    this.setWidth(totalWidth + this.x_shift);
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
    const spacing = stave.getSpacingBetweenLines();
    const lowestY = note.getYs().reduce((a, b) => (a < b ? a : b));
    // this.text_line is relative to top string in the group.
    const bend_height = start.y - ((this.text_line + 1) * spacing + start.y - lowestY) + 3;
    const annotation_y = start.y - ((this.text_line + 1) * spacing + start.y - lowestY) - 1;

    const renderBend = (x: number, y: number, width: number, height: number) => {
      const cp_x = x + width;
      const cp_y = y;

      ctx.save();
      ctx.beginPath();
      ctx.setLineWidth(this.render_options.line_width);
      ctx.setStrokeStyle(this.render_options.line_style);
      ctx.setFillStyle(this.render_options.line_style);
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(cp_x, cp_y, x + width, height);
      ctx.stroke();
      ctx.restore();
    };

    const renderRelease = (x: number, y: number, width: number, height: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.setLineWidth(this.render_options.line_width);
      ctx.setStrokeStyle(this.render_options.line_style);
      ctx.setFillStyle(this.render_options.line_style);
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + width, height, x + width, y);
      ctx.stroke();
      ctx.restore();
    };

    const renderArrowHead = (x: number, y: number, direction: number) => {
      const width = 4;
      const yBase = y + width * direction;

      ctx.beginPath();
      ctx.moveTo(x, y); // tip of the arrow
      ctx.lineTo(x - width, yBase);
      ctx.lineTo(x + width, yBase);
      ctx.closePath();
      ctx.fill();
    };

    const renderText = (x: number, text: string) => {
      ctx.save();
      ctx.setFont(this.textFont);
      const render_x = x - ctx.measureText(text).width / 2;
      ctx.fillText(text, render_x, annotation_y);
      ctx.restore();
    };

    let last_bend = undefined;
    let last_bend_draw_width = 0;
    let last_drawn_width = 0;
    if (this.tap?.length) {
      const tapStart = note.getModifierStartXY(Modifier.Position.CENTER, this.index);
      renderText(tapStart.x, this.tap);
    }

    for (let i = 0; i < this.phrase.length; ++i) {
      const bend = this.phrase[i];
      if (!bend.draw_width) bend.draw_width = 0;
      if (i === 0) bend.draw_width += x_shift;

      last_drawn_width = bend.draw_width + last_bend_draw_width - (i === 1 ? x_shift : 0);
      if (bend.type === Bend.UP) {
        if (last_bend && last_bend.type === Bend.UP) {
          renderArrowHead(start.x, bend_height, +1);
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
      renderArrowHead(last_bend.x + last_drawn_width, bend_height, +1);
    } else if (last_bend.type === Bend.DOWN) {
      renderArrowHead(last_bend.x + last_drawn_width, start.y, -1);
    }
  }
}
