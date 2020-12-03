import {IDurationCode, INameValue} from "./common";
import {Font} from "../smufl";
import {IFontGlyph} from "./font";

export interface IGlyphProps {
  code_head: string;
  dot_shiftY: number;
  position: string;
  rest: boolean;
  line_below: number;
  line_above: number;
  stem_up_extension: never;
  stem_down_extension: never;
  stem: never;
  code: string;
  code_flag_upstem: string;
  code_flag_downstem: string;
  flag: boolean;
  width: number;
  text: string;
  tabnote_stem_down_extension: number;
  tabnote_stem_up_extension: number;
  beam_count: number;
  duration_codes: Record<string, IDurationCode>;
  validTypes: Record<string, INameValue>;

  (duration: string, type?: string): any;

  getWidth(a?: number): number;

  getMetrics(): IGlyphMetrics;
}

export interface IGlyphOptions {
  fontStack: any;
  category: any;
}

export interface IGlyphMetrics {
  width: number;
  height: number;
  x_min: number;
  x_max: number;
  x_shift: number;
  y_shift: number;
  scale: number;
  ha: number;
  outline: number[];
  font: Font;
}

export interface IGlyphLookup {
  font: Font;
  glyph: IFontGlyph;
}
