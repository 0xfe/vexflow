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

function setIndex(index, name, value, id, elem) {
  if (!index[name][value]) index[name][value] = {};
  index[name][value][id] = elem;
}

export class Registry {
  static get INDEXES() { return ['type', 'class']; }

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
    // Indexes are represented as maps of maps (of maps). This allows
    // for both multi-labeling (e.g., an element can have multiple classes)
    // and efficient lookup.
    this.index = {
      id: {},
      type: {},
      class: {},
    };
    return this;
  }

  // Updates the indexes for element 'id'. If an element's attribute changes
  // from A -> B, make sure to remove the element from A.
  updateIndex({ id, name, value, oldValue }) {
    const elem = this.getElementById(id);
    if (oldValue !== null && this.index[name][oldValue]) delete this.index[name][oldValue][id];
    setIndex(this.index, name, value, elem.getAttribute('id'), elem);
  }

  register(elem, id) {
    id = id || elem.getAttribute('id');

    if (!id) {
      throw new X('Can\'t add element without `id` attribute to registry', elem);
    }

    // Update indexes
    elem.setAttribute('id', id);
    setIndex(this.index, 'id', id, id, elem);
    Registry.INDEXES.forEach(name => {
      this.updateIndex({ id, name, value: elem.getAttribute(name), oldValue: null });
    });
    elem.onRegister(this);
    return this;
  }

  getElementById(id) {
    return this.index.id[id] ? this.index.id[id][id] : null;
  }

  getElementsByType(type) { return this.index.type[type]; }

  onUpdate({ id, name, value, oldValue }) {
    this.updateIndex({ id, name, value, oldValue });
    return this;
  }
}

Registry.defaultRegistry = null;
