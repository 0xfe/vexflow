export interface FontInfo {
  size: number;
  weight: string;
  family: string;
  style?: string;
}

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
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

export interface RenderContext {
  clear(): void;
  setFont(family: string, size: number, weight: string): this;
  setRawFont(font: string): this;
  setFillStyle(style: string): this;
  setBackgroundFillStyle(style: string): this;
  setStrokeStyle(style: string): this;
  setShadowColor(color: string): this;
  setShadowBlur(blur: number): this;
  setLineWidth(width: number): this;
  setLineCap(capType: CanvasLineCap): this;
  setLineDash(dashPattern: number[]): this;
  scale(x: number, y: number): this;
  rect(x: number, y: number, width: number, height: number): this;
  resize(width: number, height: number): this;
  fillRect(x: number, y: number, width: number, height: number): this;
  clearRect(x: number, y: number, width: number, height: number): this;
  beginPath(): this;
  moveTo(x: number, y: number): this;
  lineTo(x: number, y: number): this;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, antiClockwise: boolean): this;
  glow(): this;
  fill(attributes?: any): this;
  stroke(): this;
  closePath(): this;
  fillText(text: string, x: number, y: number): this;
  save(): this;
  restore(): this;
  openGroup(cls: string, id?: string, attrs?: { pointerBBox: boolean }): any;
  closeGroup(): void;
  add(child: any): void;

  /**
   * canvas returns TextMetrics and SVG returns SVGRect.
   */
  measureText(text: string): { width: number; height?: number };
}

export interface TieNotes {
  first_note: Note;
  last_note: Note;
  first_indices: number[];
  last_indices: number[];
}
