import {Element} from "../element";

export interface IRegistryIndex {
  [name: string]: Record<string, Record<string, Element>>;
  id: Record<string, Record<string, Element>>;
  type: Record<string, Record<string, Element>>;
  class: Record<string, Record<string, Element>>;
}

export interface IRegistryUpdate {
  id: string;
  name: string;
  value: string;
  oldValue: string;
}
