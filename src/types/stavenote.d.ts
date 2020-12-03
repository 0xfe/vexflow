import {StaveNote} from "../stavenote";

export interface IStaveNoteGetModifierStartXYOptions {
  forceFlagRight: boolean;
}

export interface IStaveNoteHeadBounds {
  y_top: number;
  y_bottom: number;
  displaced_x: number;
  non_displaced_x: number;
  highest_line: number;
  lowest_line: number;
  highest_displaced_line: boolean|number;
  lowest_displaced_line: boolean|number;
  highest_non_displaced_line: number;
  lowest_non_displaced_line: number;
}

export interface IStaveNoteFormatSettings {
  line: number;
  maxLine: number;
  minLine: number;
  isrest: boolean;
  stemDirection: number;
  stemMax: number;
  stemMin: number;
  voice_shift: number;
  is_displaced: boolean;
  note: StaveNote;
}
