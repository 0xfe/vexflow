import { KeyParts, Music } from './music';
export declare class KeyManager {
    protected music: Music;
    protected keyParts: KeyParts;
    protected keyString: string;
    protected key: string;
    protected scale: number[];
    protected scaleMap: Record<string, string>;
    protected scaleMapByValue: Record<number, string>;
    protected originalScaleMapByValue: Record<number, string>;
    constructor(key: string);
    setKey(key: string): this;
    getKey(): string;
    reset(): this;
    getAccidental(key: string): {
        note: string;
        accidental?: string;
        change?: boolean;
    };
    selectNote(note: string): {
        note: string;
        accidental?: string;
        change: boolean;
    };
}
