import { RuntimeError } from './util.js';
class Index {
    constructor() {
        this.id = {};
        this.type = {};
        this.class = {};
    }
}
export class Registry {
    static getDefaultRegistry() {
        return Registry.defaultRegistry;
    }
    static enableDefaultRegistry(registry) {
        Registry.defaultRegistry = registry;
    }
    static disableDefaultRegistry() {
        Registry.defaultRegistry = undefined;
    }
    constructor() {
        this.index = new Index();
    }
    clear() {
        this.index = new Index();
        return this;
    }
    setIndexValue(name, value, id, elem) {
        const index = this.index;
        if (!index[name][value]) {
            index[name][value] = {};
        }
        index[name][value][id] = elem;
    }
    updateIndex({ id, name, value, oldValue }) {
        const elem = this.getElementById(id);
        if (oldValue !== undefined && this.index[name][oldValue]) {
            delete this.index[name][oldValue][id];
        }
        if (value && elem) {
            this.setIndexValue(name, value, elem.getAttribute('id'), elem);
        }
    }
    register(elem, id) {
        id = id || elem.getAttribute('id');
        if (!id) {
            throw new RuntimeError("Can't add element without `id` attribute to registry");
        }
        elem.setAttribute('id', id);
        this.setIndexValue('id', id, id, elem);
        this.updateIndex({ id, name: 'type', value: elem.getAttribute('type'), oldValue: undefined });
        elem.onRegister(this);
        return this;
    }
    getElementById(id) {
        var _a, _b;
        return (_b = (_a = this.index.id) === null || _a === void 0 ? void 0 : _a[id]) === null || _b === void 0 ? void 0 : _b[id];
    }
    getElementsByAttribute(attribute, value) {
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
    getElementsByType(type) {
        return this.getElementsByAttribute('type', type);
    }
    getElementsByClass(className) {
        return this.getElementsByAttribute('class', className);
    }
    onUpdate(info) {
        const allowedNames = ['id', 'type', 'class'];
        if (allowedNames.includes(info.name)) {
            this.updateIndex(info);
        }
        return this;
    }
}
