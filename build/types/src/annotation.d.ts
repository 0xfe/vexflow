import { FontInfo } from './font';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
export declare enum AnnotationHorizontalJustify {
    LEFT = 1,
    CENTER = 2,
    RIGHT = 3,
    CENTER_STEM = 4
}
export declare enum AnnotationVerticalJustify {
    TOP = 1,
    CENTER = 2,
    BOTTOM = 3,
    CENTER_STEM = 4
}
/**
 * Annotations are modifiers that can be attached to
 * notes.
 *
 * See `tests/annotation_tests.ts` for usage examples.
 */
export declare class Annotation extends Modifier {
    /** To enable logging for this class. Set `Vex.Flow.Annotation.DEBUG` to `true`. */
    static DEBUG: boolean;
    /** Annotations category string. */
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    /** Text annotations can be positioned and justified relative to the note. */
    static HorizontalJustify: typeof AnnotationHorizontalJustify;
    static HorizontalJustifyString: Record<string, number>;
    static VerticalJustify: typeof AnnotationVerticalJustify;
    static VerticalJustifyString: Record<string, number>;
    static get minAnnotationPadding(): number;
    /** Arrange annotations within a `ModifierContext` */
    static format(annotations: Annotation[], state: ModifierContextState): boolean;
    protected horizontalJustification: AnnotationHorizontalJustify;
    protected verticalJustification: AnnotationVerticalJustify;
    protected text: string;
    /**
     * Annotations inherit from `Modifier` and is positioned correctly when
     * in a `ModifierContext`.
     * Create a new `Annotation` with the string `text`.
     */
    constructor(text: string);
    /**
     * Set vertical position of text (above or below stave).
     * @param just value in `AnnotationVerticalJustify`.
     */
    setVerticalJustification(just: string | AnnotationVerticalJustify): this;
    /**
     * Get horizontal justification.
     */
    getJustification(): AnnotationHorizontalJustify;
    /**
     * Set horizontal justification.
     * @param justification value in `Annotation.Justify`.
     */
    setJustification(just: string | AnnotationHorizontalJustify): this;
    /** Render text beside the note. */
    draw(): void;
}
