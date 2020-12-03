export interface IStaveHairpinRenderParams {
  first_x: number;
  last_x: number;
  first_y: number;
  last_y: number;
  staff_height: number;
}

export interface IStaveHairpinRenderOptions {
  right_shift_ticks: number;
  left_shift_ticks: number;
  left_shift_px: number;
  right_shift_px: number;
  height: number;
  y_shift: number
}

export interface IStaveHairpinFormatter {
  pixelsPerTick: number;
}
