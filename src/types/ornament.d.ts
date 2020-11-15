import {ICodeValue, IStringTable} from "./common";

export interface IOrnamentCodes {
  (acc: string): ICodeValue;

  ornaments: IStringTable<ICodeValue>
}

export interface IOrnamentRenderOptions {
  accidentalUpperPadding: number;
  accidentalLowerPadding: number;
  font_scale: number
}
