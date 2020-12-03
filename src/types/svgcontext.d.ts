import {ICoordinates} from "./common";

export interface ISVGContextAttributes {
  [name: string]: any;
  scale: ICoordinates,
  width: number;
  height: number;
  color: string;
  opacity: number;
  'font-family': string;
  'font-size': string;
  'font-weight': string;
  'stroke-width': number;
  'fill': string;
  stroke: string;
  'stroke-dasharray': string;
  'font-style': string;
  'stroke-linejoin': string;
  'stroke-linecap': string;
  x: number;
  y: number;
}

export interface ISVGAttributesStackItem {
  state: ISVGContextAttributes;
  attributes: ISVGContextAttributes;
  shadow_attributes: ISVGContextAttributes;
  lineWidth: number;
}

export interface ISVGIgnoreAttributes {
  [name: string]: boolean;
  x: boolean;
  y: boolean;
  width: boolean;
  height: boolean;
  'font-family': boolean;
  'font-weight': boolean;
  'font-style': boolean;
  'font-size': boolean;
}
