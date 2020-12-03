import {Note} from "../note";

export interface IBuilderOptions {
  clef: string;
  stem: string
}

export interface IBuilderElements {
  notes: Note[];
  accidentals: any[]
}

export interface IBuilderPiece {
  duration: string;
  dots: number;
  chord: any[];
  options: any;
  type: string
}
