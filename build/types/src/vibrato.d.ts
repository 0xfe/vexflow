import { Modifier } from './modifier';
import { ModifierContext, ModifierContextState } from './modifiercontext';
import { RenderContext } from './rendercontext';
export interface VibratoRenderOptions {
    wave_height: number;
    wave_girth: number;
    vibrato_width: number;
    harsh: boolean;
    wave_width: number;
}
/** `Vibrato` implements diverse vibratos. */
export declare class Vibrato extends Modifier {
    static get CATEGORY(): string;
    render_options: VibratoRenderOptions;
    /** Arrange vibratos inside a `ModifierContext`. */
    static format(vibratos: Vibrato[], state: ModifierContextState, context: ModifierContext): boolean;
    constructor();
    /** Set harsh vibrato. */
    setHarsh(harsh: boolean): this;
    /** Set vibrato width in pixels. */
    setVibratoWidth(width: number): this;
    /** Draw the vibrato on the rendering context. */
    draw(): void;
    /**
     * Static rendering method that can be called from
     * other classes (e.g. VibratoBracket).
     */
    static renderVibrato(ctx: RenderContext, x: number, y: number, opts: VibratoRenderOptions): void;
}
