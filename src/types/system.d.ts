import {Stave} from "../stave";
import {Voice} from "../voice";
import {Factory} from "../factory";

export interface ISystemParams {
  stave: Stave;
  voices: Voice[];
  noJustification: boolean;
  options: any;
  spaceAbove: number;
  spaceBelow: number;
  debugNoteMetrics: number;
}

export interface ISystemOptions {
  factory: Factory;
  noPadding: boolean;
  debugFormatter: boolean;
  connector: any;
  spaceBetweenStaves: number;
  formatIterations: number;
  x: number;
  width: number;
  y: number;
  details: any;
  noJustification: boolean;
}

export interface IDebugNoteMetrics {
  y: number;
  voice: Voice;
}
