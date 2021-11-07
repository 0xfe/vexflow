// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a registry for VexFlow elements. It allows users
// to track, query, and manage some subset of generated elements, and
// dynamically get and set attributes.
//
// There are two ways to register with a registry:
//
// 1) Explicitly call `registry.register(elem:Element, id?:string)`, or,
// 2) Call `Registry.enableDefaultRegistry(registry)` when ready, and all future
//    elements will automatically register with it.
//
// Once an element is registered, selected attributes are tracked and indexed by
// the registry. This allows fast look up of elements by attributes like id, type,
// and class.

import { Element } from './element';
import { RuntimeError } from './util';

// Indexes are represented as maps of maps of maps. This allows
// for both multi-labeling (e.g., an element can have multiple classes)
// and efficient lookup.
class Index {
  // [attribute_name][attribute_value][element_id] => Element
  [key: string]: { [key: string]: { [key: string]: Element } };
  constructor() {
    this.id = {};
    this.type = {};
    this.class = {};
  }
}

export interface RegistryUpdate {
  id: string;
  name: string;
  value: string | undefined;
  oldValue: string | undefined;
}

export class Registry {
  private static defaultRegistry?: Registry;

  static getDefaultRegistry(): Registry | undefined {
    return Registry.defaultRegistry;
  }

  // If you call `enableDefaultRegistry`, any new elements will auto-register with
  // the provided registry as soon as they're constructed.
  static enableDefaultRegistry(registry: Registry): void {
    Registry.defaultRegistry = registry;
  }

  static disableDefaultRegistry(): void {
    Registry.defaultRegistry = undefined;
  }

  protected index: Index;

  constructor() {
    this.index = new Index();
  }

  clear(): this {
    this.index = new Index();
    return this;
  }

  setIndexValue(name: string, value: string, id: string, elem: Element): void {
    const index = this.index;
    if (!index[name][value]) {
      index[name][value] = {};
    }
    index[name][value][id] = elem;
  }

  // Updates the indexes for element 'id'. If an element's attribute changes
  // from A -> B, make sure to remove the element from A.
  updateIndex({ id, name, value, oldValue }: RegistryUpdate): void {
    const elem = this.getElementById(id);
    if (oldValue !== undefined && this.index[name][oldValue]) {
      delete this.index[name][oldValue][id];
    }
    if (value && elem) {
      this.setIndexValue(name, value, elem.getAttribute('id'), elem);
    }
  }

  /**
   * Register element `elem` with this registry.
   * This adds the element to its index and watches it for attribute changes.
   * @param elem
   * @param id
   * @returns this
   */
  register(elem: Element, id?: string): this {
    id = id || elem.getAttribute('id');
    if (!id) {
      throw new RuntimeError("Can't add element without `id` attribute to registry");
    }

    // Manually add id to index, then update other indexes.
    elem.setAttribute('id', id);
    this.setIndexValue('id', id, id, elem);
    this.updateIndex({ id, name: 'type', value: elem.getAttribute('type'), oldValue: undefined });
    elem.onRegister(this);
    return this;
  }

  getElementById(id: string): Element | undefined {
    return this.index.id?.[id]?.[id]; // return undefined if the id is not found.
  }

  getElementsByAttribute(attribute: string, value: string): Element[] {
    const index_attr = this.index[attribute];
    if (index_attr) {
      const index_attr_val = index_attr[value];
      if (index_attr_val) {
        const keys = Object.keys(index_attr_val);
        return keys.map((k) => index_attr_val[k]);
      }
    }
    return [];
  }

  getElementsByType(type: string): Element[] {
    return this.getElementsByAttribute('type', type);
  }

  getElementsByClass(className: string): Element[] {
    return this.getElementsByAttribute('class', className);
  }

  // This is called by the element when an attribute value changes. If an indexed
  // attribute changes, then update the local index.
  onUpdate(info: RegistryUpdate): this {
    const allowedNames = ['id', 'type', 'class'];
    if (allowedNames.includes(info.name)) {
      this.updateIndex(info);
    }
    return this;
  }
}
