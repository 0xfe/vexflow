import {Note} from "../note";
import {StaveNote} from "../stavenote";
import {IStaveOptions} from "./stave";
import {Stave} from "../stave";

export interface IFactoryFontOptions {
  face: string;
  style: string;
  point: number
}

export interface IFactoryStaveOptions {
  space: number
}

export interface IFactoryRendererOptions {
  elementId: string;
  background: string;
  context: null;
  width: number;
  backend: number;
  height: number
  el: any;
}

export interface IFactoryOptions {
  [name: string]: any;
  renderer: IFactoryRendererOptions;
  stave: IFactoryStaveOptions;
  font: IFactoryFontOptions;
  spacing_between_lines_px: number;
  size: string;
  autoStem: boolean;
  secondaryBeamBreaks: never[];
  direction: string;
  harsh: boolean;
  superscript: string;
  position: number;
  style: string;
}

export interface IFactoryParams {
  slur: boolean;
  alterKey: string;
  cancelKey: string;
  key: string;
  time: string;
  options: IStaveOptions;
  x: number;
  y: number;
  width: number;
  type: number|string;
  text: string;
  vJustify: string;
  hJustify: string;
  fontFamily: string;
  fontSize: number
  fontWeight: string;
  position: string;
  duration: string;
  dots: number;
  line: number;
  number: string;
  top_stave: Stave;
  bottom_stave: Stave;
  notes: Note[];
  from: StaveNote;
  to: StaveNote;
  first_indices: number[];
  last_indices: number[];
}
