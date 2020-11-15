import {Accidental} from "../accidental";
import {IStringTable} from "./common";

export interface IAccidentalCodes {
  (acc: string): any;

  accidentals: IStringTable<IAccidental>
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

export interface IAccidentalColumn {
  (index: string): IStringTable<number[]>
}

export interface IAccidentalRenderOptions {
  parenLeftPadding: number;
  stroke_px: number;
  font_scale: number;
  parenRightPadding: number
}
