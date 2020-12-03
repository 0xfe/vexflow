import {IMetrics} from "./common";

export interface IStaveModifierSpacer {
  getContext(): boolean;
  setStave(): void;
  renderToStave(): void;
  getMetrics(): IMetrics;
}
