import {IStringTable} from "./common";

export interface IArticulationCodes {
  (artic: any): IArticulation;

  articulations: IStringTable<IArticulation>;
}

export interface IStringArticulation {
  articulations: string;
}

export interface IArticulation {
  code: string;
  aboveCode: string;
  belowCode: string;
  between_lines: boolean;
}

export interface IArticulationState {
  right_shift: number;
  left_shift: number;
  text_line: number;
  top_text_line: number;
}

export interface IArticulationRenderOptions {
  font_scale: number
}
