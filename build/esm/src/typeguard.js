export function isCategory(obj, category, checkAncestors = true) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    let constructorFcn = obj.constructor;
    if (checkAncestors) {
        while (obj !== null) {
            constructorFcn = obj.constructor;
            if ('CATEGORY' in constructorFcn && constructorFcn.CATEGORY === category) {
                return true;
            }
            obj = Object.getPrototypeOf(obj);
        }
        return false;
    }
    else {
        return 'CATEGORY' in constructorFcn && constructorFcn.CATEGORY === category;
    }
}
export const isAccidental = (obj) => isCategory(obj, "Accidental");
export const isAnnotation = (obj) => isCategory(obj, "Annotation");
export const isBarline = (obj) => isCategory(obj, "Barline");
export const isDot = (obj) => isCategory(obj, "Dot");
export const isGraceNote = (obj) => isCategory(obj, "GraceNote");
export const isGraceNoteGroup = (obj) => isCategory(obj, "GraceNoteGroup");
export const isNote = (obj) => isCategory(obj, "Note");
export const isRenderContext = (obj) => isCategory(obj, "RenderContext");
export const isStaveNote = (obj) => isCategory(obj, "StaveNote");
export const isStemmableNote = (obj) => isCategory(obj, "StemmableNote");
export const isTabNote = (obj) => isCategory(obj, "TabNote");
