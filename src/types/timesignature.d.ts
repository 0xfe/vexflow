import {Glyph} from "../glyph";

export interface ITimeSignatureGlyph {
  code: string;
  point: number;
  line: number;
}

export interface ITimeSignature {
  glyph: Glyph;
  line: never;
  num: boolean
}
