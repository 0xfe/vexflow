import { Fraction } from './fraction.js';
import { RuntimeError } from './util.js';
export class TickContext {
    static getNextContext(tContext) {
        const contexts = tContext.tContexts;
        const index = contexts.indexOf(tContext);
        if (index + 1 < contexts.length)
            return contexts[index + 1];
    }
    constructor(options) {
        this.preFormatted = false;
        this.postFormatted = false;
        this.tickID = options && options.tickID ? options.tickID : 0;
        this.currentTick = new Fraction(0, 1);
        this.maxTicks = new Fraction(0, 1);
        this.maxTickable = undefined;
        this.minTicks = undefined;
        this.minTickable = undefined;
        this.padding = 1;
        this.x = 0;
        this.xBase = 0;
        this.xOffset = 0;
        this.tickables = [];
        this.tickablesByVoice = {};
        this.notePx = 0;
        this.glyphPx = 0;
        this.leftDisplacedHeadPx = 0;
        this.rightDisplacedHeadPx = 0;
        this.modLeftPx = 0;
        this.modRightPx = 0;
        this.totalLeftPx = 0;
        this.totalRightPx = 0;
        this.tContexts = [];
        this.width = 0;
        this.formatterMetrics = {
            freedom: { left: 0, right: 0 },
        };
    }
    getTickID() {
        return this.tickID;
    }
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
        this.xBase = x;
        this.xOffset = 0;
        return this;
    }
    getXBase() {
        return this.xBase;
    }
    setXBase(xBase) {
        this.xBase = xBase;
        this.x = xBase + this.xOffset;
    }
    getXOffset() {
        return this.xOffset;
    }
    setXOffset(xOffset) {
        this.xOffset = xOffset;
        this.x = this.xBase + xOffset;
    }
    getWidth() {
        return this.width + this.padding * 2;
    }
    setPadding(padding) {
        this.padding = padding;
        return this;
    }
    getMaxTicks() {
        return this.maxTicks;
    }
    getMinTicks() {
        return this.minTicks;
    }
    getMaxTickable() {
        return this.maxTickable;
    }
    getMinTickable() {
        return this.minTickable;
    }
    getTickables() {
        return this.tickables;
    }
    getTickableForVoice(voiceIndex) {
        return this.tickablesByVoice[voiceIndex];
    }
    getTickablesByVoice() {
        return this.tickablesByVoice;
    }
    getCenterAlignedTickables() {
        return this.tickables.filter((tickable) => tickable.isCenterAligned());
    }
    getMetrics() {
        const { width, glyphPx, notePx, leftDisplacedHeadPx, rightDisplacedHeadPx, modLeftPx, modRightPx, totalLeftPx, totalRightPx, } = this;
        return {
            width,
            glyphPx,
            notePx,
            leftDisplacedHeadPx,
            rightDisplacedHeadPx,
            modLeftPx,
            modRightPx,
            totalLeftPx,
            totalRightPx,
        };
    }
    getCurrentTick() {
        return this.currentTick;
    }
    setCurrentTick(tick) {
        this.currentTick = tick;
        this.preFormatted = false;
    }
    addTickable(tickable, voiceIndex) {
        if (!tickable) {
            throw new RuntimeError('BadArgument', 'Invalid tickable added.');
        }
        if (!tickable.shouldIgnoreTicks()) {
            const ticks = tickable.getTicks();
            if (ticks.greaterThan(this.maxTicks)) {
                this.maxTicks = ticks.clone();
                this.maxTickable = tickable;
            }
            if (this.minTicks == null) {
                this.minTicks = ticks.clone();
                this.minTickable = tickable;
            }
            else if (ticks.lessThan(this.minTicks)) {
                this.minTicks = ticks.clone();
                this.minTickable = tickable;
            }
        }
        tickable.setTickContext(this);
        this.tickables.push(tickable);
        this.tickablesByVoice[voiceIndex || 0] = tickable;
        this.preFormatted = false;
        return this;
    }
    preFormat() {
        if (this.preFormatted)
            return this;
        for (let i = 0; i < this.tickables.length; ++i) {
            const tickable = this.tickables[i];
            tickable.preFormat();
            const metrics = tickable.getMetrics();
            this.leftDisplacedHeadPx = Math.max(this.leftDisplacedHeadPx, metrics.leftDisplacedHeadPx);
            this.rightDisplacedHeadPx = Math.max(this.rightDisplacedHeadPx, metrics.rightDisplacedHeadPx);
            this.notePx = Math.max(this.notePx, metrics.notePx);
            this.glyphPx = Math.max(this.glyphPx, metrics.glyphWidth || 0);
            this.modLeftPx = Math.max(this.modLeftPx, metrics.modLeftPx);
            this.modRightPx = Math.max(this.modRightPx, metrics.modRightPx);
            this.totalLeftPx = Math.max(this.totalLeftPx, metrics.modLeftPx + metrics.leftDisplacedHeadPx);
            this.totalRightPx = Math.max(this.totalRightPx, metrics.modRightPx + metrics.rightDisplacedHeadPx);
            this.width = this.notePx + this.totalLeftPx + this.totalRightPx;
        }
        return this;
    }
    postFormat() {
        if (this.postFormatted)
            return this;
        this.postFormatted = true;
        return this;
    }
    getFormatterMetrics() {
        return this.formatterMetrics;
    }
}
