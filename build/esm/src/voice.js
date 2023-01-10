import { Element } from './element.js';
import { Fraction } from './fraction.js';
import { Tables } from './tables.js';
import { defined, RuntimeError, sumArray } from './util.js';
export var VoiceMode;
(function (VoiceMode) {
    VoiceMode[VoiceMode["STRICT"] = 1] = "STRICT";
    VoiceMode[VoiceMode["SOFT"] = 2] = "SOFT";
    VoiceMode[VoiceMode["FULL"] = 3] = "FULL";
})(VoiceMode || (VoiceMode = {}));
export class Voice extends Element {
    static get CATEGORY() {
        return "Voice";
    }
    static get Mode() {
        return VoiceMode;
    }
    constructor(time) {
        super();
        this.resolutionMultiplier = 1;
        this.mode = VoiceMode.STRICT;
        this.preFormatted = false;
        this.ticksUsed = new Fraction(0, 1);
        this.largestTickWidth = 0;
        this.tickables = [];
        this.options = {
            softmaxFactor: Tables.SOFTMAX_FACTOR,
        };
        let voiceTime;
        if (typeof time === 'string') {
            const match = time.match(/(\d+)\/(\d+)/);
            if (match) {
                voiceTime = {
                    num_beats: parseInt(match[1]),
                    beat_value: parseInt(match[2]),
                };
            }
        }
        else {
            voiceTime = time;
        }
        this.time = Object.assign({ num_beats: 4, beat_value: 4, resolution: Tables.RESOLUTION }, voiceTime);
        this.totalTicks = new Fraction(this.time.num_beats * (this.time.resolution / this.time.beat_value), 1);
        this.smallestTickCount = this.totalTicks.clone();
    }
    getTotalTicks() {
        return this.totalTicks;
    }
    getTicksUsed() {
        return this.ticksUsed;
    }
    getLargestTickWidth() {
        return this.largestTickWidth;
    }
    getSmallestTickCount() {
        return this.smallestTickCount;
    }
    getTickables() {
        return this.tickables;
    }
    getMode() {
        return this.mode;
    }
    setMode(mode) {
        this.mode = mode;
        return this;
    }
    getResolutionMultiplier() {
        return this.resolutionMultiplier;
    }
    getActualResolution() {
        return this.resolutionMultiplier * this.time.resolution;
    }
    setStave(stave) {
        this.stave = stave;
        this.boundingBox = undefined;
        return this;
    }
    getStave() {
        return this.stave;
    }
    getBoundingBox() {
        if (!this.boundingBox) {
            const stave = this.checkStave();
            let boundingBox = undefined;
            for (let i = 0; i < this.tickables.length; ++i) {
                const tickable = this.tickables[i];
                if (!tickable.getStave())
                    tickable.setStave(stave);
                const bb = tickable.getBoundingBox();
                if (bb) {
                    boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
                }
            }
            this.boundingBox = boundingBox;
        }
        return this.boundingBox;
    }
    setStrict(strict) {
        this.mode = strict ? VoiceMode.STRICT : VoiceMode.SOFT;
        return this;
    }
    isComplete() {
        if (this.mode === VoiceMode.STRICT || this.mode === VoiceMode.FULL) {
            return this.ticksUsed.equals(this.totalTicks);
        }
        else {
            return true;
        }
    }
    setSoftmaxFactor(factor) {
        this.options.softmaxFactor = factor;
        this.expTicksUsed = 0;
        return this;
    }
    reCalculateExpTicksUsed() {
        const totalTicks = this.ticksUsed.value();
        const exp = (tickable) => Math.pow(this.options.softmaxFactor, tickable.getTicks().value() / totalTicks);
        this.expTicksUsed = sumArray(this.tickables.map(exp));
        return this.expTicksUsed;
    }
    softmax(tickValue) {
        if (!this.expTicksUsed) {
            this.expTicksUsed = this.reCalculateExpTicksUsed();
        }
        const totalTicks = this.ticksUsed.value();
        const exp = (v) => Math.pow(this.options.softmaxFactor, v / totalTicks);
        const sm = exp(tickValue) / this.expTicksUsed;
        return sm;
    }
    addTickable(tickable) {
        if (!tickable.shouldIgnoreTicks()) {
            const ticks = tickable.getTicks();
            this.ticksUsed.add(ticks);
            this.expTicksUsed = 0;
            if ((this.mode === VoiceMode.STRICT || this.mode === VoiceMode.FULL) &&
                this.ticksUsed.greaterThan(this.totalTicks)) {
                this.ticksUsed.subtract(ticks);
                throw new RuntimeError('BadArgument', 'Too many ticks.');
            }
            if (ticks.lessThan(this.smallestTickCount)) {
                this.smallestTickCount = ticks.clone();
            }
            this.resolutionMultiplier = this.ticksUsed.denominator;
            this.totalTicks.add(0, this.ticksUsed.denominator);
        }
        this.tickables.push(tickable);
        tickable.setVoice(this);
        return this;
    }
    addTickables(tickables) {
        for (let i = 0; i < tickables.length; ++i) {
            this.addTickable(tickables[i]);
        }
        return this;
    }
    preFormat() {
        if (this.preFormatted)
            return this;
        const stave = this.checkStave();
        this.tickables.forEach((tickable) => {
            if (!tickable.getStave()) {
                tickable.setStave(stave);
            }
        });
        this.preFormatted = true;
        return this;
    }
    checkStave() {
        return defined(this.stave, 'NoStave', 'No stave attached to instance.');
    }
    draw(context = this.checkContext(), stave) {
        stave = stave !== null && stave !== void 0 ? stave : this.stave;
        this.setRendered();
        let boundingBox = undefined;
        for (let i = 0; i < this.tickables.length; ++i) {
            const tickable = this.tickables[i];
            if (stave) {
                tickable.setStave(stave);
            }
            defined(tickable.getStave(), 'MissingStave', 'The voice cannot draw tickables without staves.');
            const bb = tickable.getBoundingBox();
            if (bb) {
                boundingBox = boundingBox ? boundingBox.mergeWith(bb) : bb;
            }
            tickable.setContext(context);
            tickable.drawWithStyle();
        }
        this.boundingBox = boundingBox;
    }
}
