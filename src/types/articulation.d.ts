export interface IArticulationCodes {
  (artic: string): IArticulation;

  articulations: Record<string, IArticulation>;
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

export interface IArticulationPosition {
  position: number;
  type: string;
}
