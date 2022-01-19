// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements curves (for slurs)

import { Element } from './element';
import { Note } from './note';
import { Category } from './typeguard';
import { RuntimeError } from './util';

export interface CurveOptions {
  /** Two control points for the bezier curves. */
  cps?: { x: number; y: number }[];
  thickness?: number;
  x_shift?: number;
  y_shift?: number;
  position?: string | number;
  position_end?: string | number;
  invert?: boolean;
}

export enum CurvePosition {
  NEAR_HEAD = 1,
  NEAR_TOP = 2,
}

export class Curve extends Element {
  static get CATEGORY(): string {
    return Category.Curve;
  }

  public render_options: Required<CurveOptions>;
  protected from: Note;
  protected to: Note;

  static get Position(): typeof CurvePosition {
    return CurvePosition;
  }

  static get PositionString(): Record<string, number> {
    return {
      nearHead: CurvePosition.NEAR_HEAD,
      nearTop: CurvePosition.NEAR_TOP,
    };
  }

  // from: Start note
  // to: End note
  // options:
  //    cps: List of control points
  //    x_shift: pixels to shift
  //    y_shift: pixels to shift
  constructor(from: Note, to: Note, options: CurveOptions) {
    super();

    this.render_options = {
      thickness: 2,
      x_shift: 0,
      y_shift: 10,
      position: CurvePosition.NEAR_HEAD,
      position_end: CurvePosition.NEAR_HEAD,
      invert: false,
      cps: [
        { x: 0, y: 10 },
        { x: 0, y: 10 },
      ],
      ...options,
    };

    this.from = from;
    this.to = to;
  }

  setNotes(from: Note, to: Note): this {
    if (!from && !to) {
      throw new RuntimeError('BadArguments', 'Curve needs to have either `from` or `to` set.');
    }

    this.from = from;
    this.to = to;
    return this;
  }

  /**
   * @return {boolean} Returns true if this is a partial bar.
   */
  isPartial(): boolean {
    return !this.from || !this.to;
  }

  renderCurve(params: { last_y: number; last_x: number; first_y: number; first_x: number; direction: number }): void {
    const ctx = this.checkContext();

    const x_shift = this.render_options.x_shift;
    const y_shift = this.render_options.y_shift * params.direction;

    const first_x = params.first_x + x_shift;
    const first_y = params.first_y + y_shift;
    const last_x = params.last_x - x_shift;
    const last_y = params.last_y + y_shift;
    const thickness = this.render_options.thickness;

    const cps = this.render_options.cps;
    const { x: cp0x, y: cp0y } = cps[0];
    const { x: cp1x, y: cp1y } = cps[1];

    const cp_spacing = (last_x - first_x) / (cps.length + 2);

    ctx.beginPath();
    ctx.moveTo(first_x, first_y);
    ctx.bezierCurveTo(
      first_x + cp_spacing + cp0x,
      first_y + cp0y * params.direction,
      last_x - cp_spacing + cp1x,
      last_y + cp1y * params.direction,
      last_x,
      last_y
    );
    ctx.bezierCurveTo(
      last_x - cp_spacing + cp1x,
      last_y + (cp1y + thickness) * params.direction,
      first_x + cp_spacing + cp0x,
      first_y + (cp0y + thickness) * params.direction,
      first_x,
      first_y
    );
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
  }

  draw(): boolean {
    this.checkContext();
    this.setRendered();

    const first_note = this.from;
    const last_note = this.to;
    let first_x;
    let last_x;
    let first_y;
    let last_y;
    let stem_direction = 0;

    let metric = 'baseY';
    let end_metric = 'baseY';

    function getPosition(position: string | number) {
      return typeof position === 'string' ? Curve.PositionString[position] : position;
    }
    const position = getPosition(this.render_options.position);
    const position_end = getPosition(this.render_options.position_end);

    if (position === CurvePosition.NEAR_TOP) {
      metric = 'topY';
      end_metric = 'topY';
    }

    if (position_end === CurvePosition.NEAR_HEAD) {
      end_metric = 'baseY';
    } else if (position_end === CurvePosition.NEAR_TOP) {
      end_metric = 'topY';
    }

    if (first_note) {
      first_x = first_note.getTieRightX();
      stem_direction = first_note.getStemDirection();
      first_y = first_note.getStemExtents()[metric];
    } else {
      const stave = last_note.checkStave();
      first_x = stave.getTieStartX();
      first_y = last_note.getStemExtents()[metric];
    }

    if (last_note) {
      last_x = last_note.getTieLeftX();
      stem_direction = last_note.getStemDirection();
      last_y = last_note.getStemExtents()[end_metric];
    } else {
      const stave = first_note.checkStave();
      last_x = stave.getTieEndX();
      last_y = first_note.getStemExtents()[end_metric];
    }

    this.renderCurve({
      first_x,
      last_x,
      first_y,
      last_y,
      direction: stem_direction * (this.render_options.invert === true ? -1 : 1),
    });
    return true;
  }
}
