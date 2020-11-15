import {IKeySpec, IStringTable} from "./common";

export interface IKeySignature {
  (spec: string): any[];

  keySpecs: IStringTable<IKeySpec>;
  accidentalList: (acc: string) => number[]
}
