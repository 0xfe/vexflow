export function isCategory(obj, cls, checkAncestors = true) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    let constructorFcn = obj.constructor;
    if (obj instanceof cls || constructorFcn === cls) {
        return true;
    }
    const categoryToMatch = cls.CATEGORY;
    if (categoryToMatch === undefined) {
        return false;
    }
    if (checkAncestors) {
        while (obj !== null) {
            constructorFcn = obj.constructor;
            if ('CATEGORY' in constructorFcn && constructorFcn.CATEGORY === categoryToMatch) {
                return true;
            }
            obj = Object.getPrototypeOf(obj);
        }
        return false;
    }
    else {
        return 'CATEGORY' in constructorFcn && constructorFcn.CATEGORY === categoryToMatch;
    }
}
