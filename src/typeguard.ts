import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';

/* eslint-disable */
type Constructor<T> = Function & { prototype: T };

/**
 * Use this instead of `instanceof` as a more flexible type guard.
 * @param cls a JavaScript class, such as `StaveNote`.
 * @param obj check if this object is an instance of the provided `cls`.
 * @param checkAncestors defaults to `true`, so we walk up the prototype chain to look for a matching `.getCategory()`.
 *        If `false`, we do not check the superclass or other ancestors.
 * @returns true if `obj` is an instance of `ClassName`, or has a `.getCategory()` that matches `ClassName.CATEGORY`.
 */
export function isCategory<Class>(cls: Constructor<Class>, obj: any, checkAncestors: boolean = true): obj is Class {
  // obj is NOT an instance of cls if it is:
  // undefined, a number, a primitive string, or null.
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  if (obj instanceof cls || cls.name === obj.constructor.name) {
    return true;
  }

  // Check for the getCategory() / .CATEGORY.
  const categoryToMatch: string | undefined = (cls as any).CATEGORY;
  if (categoryToMatch === undefined) {
    return false;
  }

  if (checkAncestors) {
    // Walk up the prototype chain to look for a matching .getCategory().
    while (obj !== null) {
      if ('getCategory' in obj && obj.getCategory() === categoryToMatch) {
        return true;
      }
      obj = Object.getPrototypeOf(obj);
    }
    return false;
  } else {
    // Do not walk up the prototype chain. Just check this object's .getCategory().
    return 'getCategory' in obj && obj.getCategory() === categoryToMatch;
  }
}

export function isStaveNote(obj: any): obj is StaveNote {
  return isCategory<StaveNote>(StaveNote, obj);
}

export function isTabNote(obj: any): obj is TabNote {
  return isCategory<TabNote>(TabNote, obj);
}

/* eslint-enable */
