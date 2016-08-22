// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a registry for VexFlow elements. It allows users
// to track, query, and manage some subset of generated elements, and
// dynamically get and set attributes.
//
// There are two ways to regiser with a registry:
//
// 1) Explicitly call `element.register(registry)`, or,
// 2) Call `Registry.enableDefaultRegistry(registry)` when ready, and all future
//    elements will automatically register with it.
//
// Once an element is registered, selected attributes are tracked and indexed by
// the registry. This allows fast look up of elements by attributes like id, type,
// and class.

export class X extends Error {
  constructor(message, data) {
    super(message);
    this.name = 'RegistryException';
    this.message = message;
    this.data = data;
  }
}

export class Registry {
  static get INDEXES() { return ['id', 'type']; }

  static updateIndex(index, elem) {
    Registry.INDEXES.forEach(key => {
      const attr = elem.getAttribute(key);
      if (index[key][attr] === undefined) {
        index[key][attr] = [];
      }
      index[key][attr].push(elem);
    });
  }

  constructor() {
    this.clear();
  }

  static enableDefaultRegistry(registry) {
    Registry.defaultRegistry = registry;
  }

  static getDefaultRegistry() {
    return Registry.defaultRegistry;
  }

  clear() {
    this.elements = [];

    // Index by 'id' and type for now.
    this.elementMaps = {
      id: {},
      type: {},
    };
    return this;
  }

  register(elem, id) {
    id = id || elem.getAttribute('id');

    if (!id) {
      throw new X('Can\'t add element without `id` attribute to registry', elem);
    }

    elem.setAttribute('id', id);
    this.elements.push(elem);

    // Update indexes
    Registry.updateIndex(this.elementMaps, elem);
    elem.onRegister(this);
    return this;
  }

  getElementById(id) {
    return this.elementMaps.id[id] ? this.elementMaps.id[id][0] : null;
  }

  getElementsByType(type) { return this.elementMaps.type[type]; }

  onUpdate(id) {
    Registry.updateIndex(this.elementMaps, this.getElementById(id));
    return this;
  }
}

Registry.defaultRegistry = null;
