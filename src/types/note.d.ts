import {IDuration} from "./common";
import {Note} from "../note";
import {IFont} from "./font";

export interface INoteValue {
  index: number;
  int_val: number;
  accidental: any;
  rest: boolean;
  octave: any;
  shift_right: number;
  code: string;
}

export interface INoteRenderOptions {
  draw_stem_through_stave: boolean;
  draw_dots: boolean;
  draw_stem: any;
  y_shift: number;
  extend_left: number;
  extend_right: number;
  glyph_font_scale: number;
  annotation_spacing: number;
  glyph_font_size: number;
  scale: number;
  font: string;
  stroke_px: number;
}

export interface INoteStruct {
  line: number;
  dots: number;
  keys: string[];
  type: string;
  align_center: boolean;
  duration_override: IDuration;
  duration: string;
}

export interface INoteHeadOptions extends INoteStruct {
  glyph_font_scale: number;
  slashed: any;
  style: any;
  stem_down_x_offset: number;
  stem_up_x_offset: number;
  custom_glyph_code: any;
  x_shift: number;
  line: number;
  stem_direction: number;
  displaced: boolean;
  duration: string;
  note_type: any;
  y: number;
  x: number;
  index: number;
}

export interface INotesStruct {
  first_note: Note;
  last_note: Note;
  first_indices: number[];
  last_indices: number[];
}

export interface IStaveNoteStruct {
  ignore_ticks: boolean;
  smooth: boolean;
  glyph: string;
  font: IFont;
  subscript: string;
  superscript: string;
  text: string;
  positions: any[];
  slashed: any;
  style: any;
  stem_down_x_offset: number;
  stem_up_x_offset: number;
  custom_glyph_code: any;
  x_shift: number;
  displaced: boolean;
  note_type: any;
  y: number;
  x: number;
  index: number;
  line: number;
  align_center: boolean;
  duration_override: IDuration;
  slash: boolean;
  stroke_px: number;
  glyph_font_scale: number;
  stem_direction: number;
  auto_stem: boolean;
  octave_shift: number;
  clef: string;
  keys: string[];
  duration: string;
  dots: number;
  type: string;
}
