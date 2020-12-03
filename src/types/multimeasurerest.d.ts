export interface IMultimeasureRestRenderOptions {
  number_of_measures: number;
  padding_left: number;
  line: number;
  number_glyph_point: number;
  show_number: boolean;
  line_thickness: number;
  symbol_spacing: number;
  serif_thickness: number;
  use_symbols: boolean;
  number_line: number;
  spacing_between_lines_px: number;
  semibrave_rest_glyph_scale: number;
  padding_right: number;
}

export interface IMultimeasureRestSemibraveRest {
  glyph_font_scale: number;
  glyph_code: string;
  width: number;
}
