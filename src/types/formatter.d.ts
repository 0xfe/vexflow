import {ILeftRight, ISpace} from "./common";

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
