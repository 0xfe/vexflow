import {IDurationCode, INameValue, IStringTable} from "./common";
import {Font} from "../smufl";

export interface IGlyphProps {
  (duration: string, type?: string): any;

  getWidth(a: number): number;

  getMetrics(): IGlyphMetrics;

  beam_count: number;
  duration_codes: IStringTable<IDurationCode>;
  validTypes: IStringTable<INameValue>;
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
