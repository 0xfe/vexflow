import { Element } from './element';
declare class Index {
    [key: string]: {
        [key: string]: {
            [key: string]: Element;
        };
    };
    constructor();
}
export interface RegistryUpdate {
    id: string;
    name: string;
    value: string | undefined;
    oldValue: string | undefined;
}
export declare class Registry {
    private static defaultRegistry?;
    static getDefaultRegistry(): Registry | undefined;
    static enableDefaultRegistry(registry: Registry): void;
    static disableDefaultRegistry(): void;
    protected index: Index;
    constructor();
    clear(): this;
    setIndexValue(name: string, value: string, id: string, elem: Element): void;
    updateIndex({ id, name, value, oldValue }: RegistryUpdate): void;
    /**
     * Register element `elem` with this registry.
     * This adds the element to its index and watches it for attribute changes.
     * @param elem
     * @param id
     * @returns this
     */
    register(elem: Element, id?: string): this;
    getElementById(id: string): Element | undefined;
    getElementsByAttribute(attribute: string, value: string): Element[];
    getElementsByType(type: string): Element[];
    getElementsByClass(className: string): Element[];
    onUpdate(info: RegistryUpdate): this;
}
export {};
