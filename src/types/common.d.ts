export interface FontInfo {
  size: number;
  weight: string;
  family: string;
  style?: string;
}

export interface Bounds {
  w: number;
  x: number;
  h: number;
  y: number;
}

export interface KeyProps {
  stem_down_x_offset: number;
  stem_up_x_offset: number;
  key: string;
  octave: number;
  line: number;
  int_value: number;
  accidental: string;
  code: string;
  stroke: number;
  shift_right: number;
  displaced: boolean;
}

export interface TypeProps extends KeyProps {
  getWidth(scale?: number): number;

  code: string;
  code_head: string;
  stem: boolean;
  rest: boolean;
  flag: boolean;
  stem_offset: number;
  stem_up_extension: number;
  stem_down_extension: number;
  tabnote_stem_up_extension: number;
  tabnote_stem_down_extension: number;
  dot_shiftY: number;
  line_above: number;
  line_below: number;
  beam_count: number;
  code_flag_upstem: string;
  code_flag_downstem: string;
  position: string;
}

/** Contexts common interface */
export interface RenderContext {
  clear(): void;
  setFont(family: string, size: number, weight?: string): RenderContext;
  setRawFont(font: string): RenderContext;
  setFillStyle(style: string): RenderContext;
  setBackgroundFillStyle(style: string): RenderContext;
  setStrokeStyle(style: string): RenderContext;
  setShadowColor(color: string): RenderContext;
  setShadowBlur(blur: string): RenderContext;
  setLineWidth(width: number): RenderContext;
  setLineCap(cap_type: string): this;
  setLineDash(dashPattern: number[]): this;
  scale(x: number, y: number): RenderContext;
  rect(x: number, y: number, width: number, height: number, attributes?: any): this;
  resize(width: number, height: number): this;
  fillRect(x: number, y: number, width: number, height: number): this;
  clearRect(x: number, y: number, width: number, height: number): this;
  beginPath(): this;
  moveTo(x: number, y: number): this;
  lineTo(x: number, y: number): this;
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this;
  quadraticCurveTo(x1: number, y1: number, x2: number, y2: number): this;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise: boolean): this;
  glow(): this;
  fill(attributes?: any): this;
  stroke(): this;
  closePath(): this;
  fillText(text: string, x: number, y: number): RenderContext;
  save(): this;
  restore(): this;
  // eslint-disable-next-line
  openGroup(...args: any[]): any;
  closeGroup(): void;

  /**
   * canvas returns TextMetrics, SVG returns SVGRect, Raphael returns {width : number, height : number}. Only width is used throughout VexFlow.
   */
  measureText(text: string): { width: number; height: number };
}

export interface TieNotes {
  first_note: Note;
  last_note: Note;
  first_indices: number[];
  last_indices: number[];
}
