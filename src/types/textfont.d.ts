import {Factory} from "../factory";

export interface ITextFontMetrics {
  advanceWidth: number;
  ha: number;
}

export interface ITextFontGlyph {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  ha: number;
  leftSideBearing: number;
  advanceWidth: number;
}

export interface ITextFontParams {
  resolution: never;
  glyphs: never;
  name: string;
}

export interface ITextFontRegistry {
  [name: string]: unknown;

  name: string;
  resolution: number;
  glyphs: Record<string, ITextFontGlyph>;
  family: string;
  serifs: boolean;
  monospaced: boolean;
  italic: boolean;
  bold: boolean;
  maxSizeGlyph: string;
  superscriptOffset: number;
  subscriptOffset: number;
  description: string;
}

export interface ITextFontAttributes {
  type: string;
}
