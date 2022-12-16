import { StemmableNote } from './stemmablenote.js';
import { isAnnotation } from './typeguard.js';
import { RuntimeError } from './util.js';
const ERROR_MSG = 'Ghost note must have valid initialization data to identify duration.';
export class GhostNote extends StemmableNote {
    static get CATEGORY() {
        return "GhostNote";
    }
    constructor(parameter) {
        if (!parameter) {
            throw new RuntimeError('BadArguments', ERROR_MSG);
        }
        let noteStruct;
        if (typeof parameter === 'string') {
            noteStruct = { duration: parameter };
        }
        else if (typeof parameter === 'object') {
            noteStruct = parameter;
        }
        else {
            throw new RuntimeError('BadArguments', ERROR_MSG);
        }
        super(noteStruct);
        this.setWidth(0);
    }
    isRest() {
        return true;
    }
    setStave(stave) {
        super.setStave(stave);
        return this;
    }
    addToModifierContext(mc) {
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        this.setRendered();
        for (let i = 0; i < this.modifiers.length; ++i) {
            const modifier = this.modifiers[i];
            if (isAnnotation(modifier)) {
                modifier.setContext(this.getContext());
                modifier.drawWithStyle();
            }
        }
    }
}
