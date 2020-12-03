import {DrawContext, ILeftRight, ISpace} from "./common";
import {Stave} from "../stave";

export interface IFormatterOptions {
  softmaxFactor: number;
  maxIterations: number;
}

export interface IFormatterMetrics {
  duration: string;
  freedom: ILeftRight;
  iterations: number;
  space: ISpace;
}

export interface IDurationStat {
  mean: number;
  count: number;
}

export interface IFormatterPlotDebuggingOptions {
  stavePadding: number;
}

export interface IFormatAndDrawOptions {
  align_rests: boolean;
  auto_beam: boolean;
}

export interface IFormatterTuneOptions {
  alpha: number;
}

export interface IFormatOptions {
  padding: number;
  align_rests: boolean;
  stave: Stave;
  context: DrawContext;
}
