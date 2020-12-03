import {StaveNote} from "../stavenote";

export interface IStaveLineNotes {
  last_indices: number[];
  first_indices: number[];
  last_note: StaveNote;
  first_note: StaveNote;
}

export interface IStaveLineDrawArrowLineConfig {
  arrowhead_angle: number;
  color: string;
  arrowhead_length: number;
  draw_end_arrow: boolean;
  draw_start_arrow: boolean;
}
