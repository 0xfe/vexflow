import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';

/* eslint-disable */
type Constructor<T> = Function & { prototype: T };
/**
 * Use this instead of `instanceof` as a more flexible type guard.
 * @param ClassName
 * @param obj
 * @returns true if `obj` is likely an instance of `ClassName`.
 */
export function isCategory<T>(ClassName: Constructor<T>, obj: any): obj is T {
  // e.g., if obj is undefined or a number
  if (typeof obj !== 'object') {
    return false;
  }

  return (
    obj instanceof ClassName ||
    ClassName.name === obj.constructor.name ||
    ('getCategory' in obj && obj.getCategory() === (ClassName as any).CATEGORY)
  );
}

export function isStaveNote(obj: any): obj is StaveNote {
  return isCategory<StaveNote>(StaveNote, obj);
}

export function isTabNote(obj: any): obj is TabNote {
  return isCategory<TabNote>(TabNote, obj);
}
/* eslint-enable */
