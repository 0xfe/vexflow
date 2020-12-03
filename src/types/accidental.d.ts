import {Accidental} from "../accidental";

export interface IAccidentalCodes {
  (acc: string): any;

  accidentals: Record<string, IAccidental>
}

export interface IAccidental {
  code: string;
  parenRightPaddingAdjustment: number;
}

export interface IAccidentalListItem {
  y: number,
  line: number,
  shift: number,
  acc: Accidental,
  lineSpace: number
}

export interface IAccidentalState {
  left_shift: number;
}

export interface IAccidentalRenderOptions {
  parenLeftPadding: number;
  stroke_px: number;
  font_scale: number;
  parenRightPadding: number
}
