import { Builder } from './easyscore';
import { FontInfo } from './font';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { StemmableNote } from './stemmablenote';
export declare class FretHandFinger extends Modifier {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    static format(nums: FretHandFinger[], state: ModifierContextState): boolean;
    static easyScoreHook({ fingerings }: {
        fingerings?: string | undefined;
    } | undefined, note: StemmableNote, builder: Builder): void;
    protected finger: string;
    protected x_offset: number;
    protected y_offset: number;
    constructor(finger: string);
    setFretHandFinger(finger: string): this;
    getFretHandFinger(): string;
    setOffsetX(x: number): this;
    setOffsetY(y: number): this;
    draw(): void;
}
