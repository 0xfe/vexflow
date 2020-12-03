export interface IFont {
  size: number;
  weight: string;
  family: string;
  style: string;
  font: string;
  face: string;
  point: number;
}

export interface IFontData {
  glyphs: Record<string, IFontGlyph>;
  fontFamily: string;
  resolution: number;
  generatedOn: string;
}

export interface IFontGlyph {
  x_min:            number;
  x_max:            number;
  y_min:            number;
  y_max:            number;
  ha:               number;
  o:                string;
  leftSideBearing?: number;
  advanceWidth?:    number;
  cached_outline: number[];
}
