import {IFactoryRendererOptions, IFactoryStaveOptions} from "./factory";
import {ICoordinates} from "./common";
import {IFont} from "./font";

export interface IStaveLineConfig {
  visible: boolean;
}

export interface IStaveOptions {
  [name: string]: any;
  spacing: 2,
  thickness: 2,
  x_shift: 0,
  y_shift: 10,
  position_end: number;
  invert: boolean;
  cps: ICoordinates[];
  bottom_text_position: number;
  line_config: IStaveLineConfig[];
  space_below_staff_ln: number;
  glyph_spacing_px: number;
  space_above_staff_ln: number;
  vertical_bar_width: number;
  fill_style: string;
  left_bar: boolean;
  right_bar: boolean;
  spacing_between_lines_px: number;
  top_text_position: number;
  num_lines: number
  size: string;
  renderer: IFactoryRendererOptions;
  stave: IFactoryStaveOptions;
  font: IFont;
  autoStem: boolean;
  secondaryBeamBreaks: never[];
  direction: number;
  harsh: boolean;
  superscript: string;
  position: number;
  style: string;
}

export interface IStaveTextOptions {
  shift_x: number;
  shift_y: number;
  justification: number;
}
