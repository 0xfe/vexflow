import {ICodeValue} from "./common";

export interface IOrnamentCodes {
  (acc: string): ICodeValue;

  ornaments: Record<string, ICodeValue>
}

export interface IOrnamentRenderOptions {
  accidentalUpperPadding: number;
  accidentalLowerPadding: number;
  font_scale: number
}
