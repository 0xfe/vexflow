import {IFont} from "./font";

export interface IStaveTieRenderOptions {
  cp2: number;
  last_x_shift: number;
  tie_spacing: number;
  cp1: number;
  first_x_shift: number;
  text_shift_x: number;
  y_shift: number;
  font: IFont
}

export interface IStaveTieRenderTieParams {
  direction: number;
  first_x_px: number;
  last_x_px: number;
  last_ys: number[];
  first_ys: number[];
}
