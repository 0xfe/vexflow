import {IAccItem, IKeySpec} from "./common";

export interface IKeySignature {
  (spec: string): IAccItem[];

  keySpecs: Record<string, IKeySpec>;
  accidentalList: (acc: string) => number[]
}

export interface IAccidentalSpacing {
  above: number;
  below: number;
}

export interface IAccList {
  accList: IAccItem[];
  type: string;
}
