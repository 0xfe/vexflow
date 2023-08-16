import { Beam } from './beam.js';
import { Font } from './font.js';
import { Fraction } from './fraction.js';
import { ModifierContext } from './modifiercontext.js';
import { Stave } from './stave.js';
import { StaveConnector } from './staveconnector.js';
import { Tables } from './tables.js';
import { TickContext } from './tickcontext.js';
import { isNote, isStaveNote } from './typeguard.js';
import { defined, log, midLine, RuntimeError, sumArray } from './util.js';
import { Voice } from './voice.js';
function createContexts(voices, makeContext, addToContext) {
    if (voices.length == 0)
        return {
            map: {},
            array: [],
            list: [],
            resolutionMultiplier: 0,
        };
    const tickToContextMap = {};
    const tickList = [];
    const contexts = [];
    const resolutionMultiplier = Formatter.getResolutionMultiplier(voices);
    voices.forEach((voice, voiceIndex) => {
        const ticksUsed = new Fraction(0, resolutionMultiplier);
        voice.getTickables().forEach((tickable) => {
            const integerTicks = ticksUsed.numerator;
            if (!tickToContextMap[integerTicks]) {
                const newContext = makeContext({ tickID: integerTicks });
                contexts.push(newContext);
                tickToContextMap[integerTicks] = newContext;
                tickList.push(integerTicks);
            }
            addToContext(tickable, tickToContextMap[integerTicks], voiceIndex);
            ticksUsed.add(tickable.getTicks());
        });
    });
    return {
        map: tickToContextMap,
        array: contexts,
        list: tickList.sort((a, b) => a - b),
        resolutionMultiplier,
    };
}
function L(...args) {
    if (Formatter.DEBUG)
        log('Vex.Flow.Formatter', args);
}
function getRestLineForNextNoteGroup(notes, currRestLine, currNoteIndex, compare) {
    let nextRestLine = currRestLine;
    for (let noteIndex = currNoteIndex + 1; noteIndex < notes.length; noteIndex++) {
        const note = notes[noteIndex];
        if (isNote(note) && !note.isRest() && !note.shouldIgnoreTicks()) {
            nextRestLine = note.getLineForRest();
            break;
        }
    }
    if (compare && currRestLine !== nextRestLine) {
        const top = Math.max(currRestLine, nextRestLine);
        const bot = Math.min(currRestLine, nextRestLine);
        nextRestLine = midLine(top, bot);
    }
    return nextRestLine;
}
class Formatter {
    static SimpleFormat(notes, x = 0, { paddingBetween = 10 } = {}) {
        notes.reduce((accumulator, note) => {
            note.addToModifierContext(new ModifierContext());
            const tick = new TickContext().addTickable(note).preFormat();
            const metrics = tick.getMetrics();
            tick.setX(accumulator + metrics.totalLeftPx);
            return accumulator + tick.getWidth() + metrics.totalRightPx + paddingBetween;
        }, x);
    }
    static plotDebugging(ctx, formatter, xPos, y1, y2, options) {
        options = Object.assign({ stavePadding: Tables.currentMusicFont().lookupMetric('stave.padding') }, options);
        const x = xPos + options.stavePadding;
        const contextGaps = formatter.contextGaps;
        function stroke(x1, x2, color) {
            ctx.beginPath();
            ctx.setStrokeStyle(color);
            ctx.setFillStyle(color);
            ctx.setLineWidth(1);
            ctx.fillRect(x1, y1, Math.max(x2 - x1, 0), y2 - y1);
        }
        ctx.save();
        ctx.setFont(Font.SANS_SERIF, 8);
        contextGaps.gaps.forEach((gap) => {
            stroke(x + gap.x1, x + gap.x2, 'rgba(100,200,100,0.4)');
            ctx.setFillStyle('green');
            ctx.fillText(Math.round(gap.x2 - gap.x1).toString(), x + gap.x1, y2 + 12);
        });
        ctx.setFillStyle('red');
        ctx.fillText(`Loss: ${(formatter.totalCost || 0).toFixed(2)} Shift: ${(formatter.totalShift || 0).toFixed(2)} Gap: ${contextGaps.total.toFixed(2)}`, x - 20, y2 + 27);
        ctx.restore();
    }
    static FormatAndDraw(ctx, stave, notes, params) {
        let options = {
            auto_beam: false,
            align_rests: false,
        };
        if (typeof params === 'object') {
            options = Object.assign(Object.assign({}, options), params);
        }
        else if (typeof params === 'boolean') {
            options.auto_beam = params;
        }
        const voice = new Voice(Tables.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(notes);
        const beams = options.auto_beam ? Beam.applyAndGetBeams(voice) : [];
        new Formatter()
            .joinVoices([voice])
            .formatToStave([voice], stave, { align_rests: options.align_rests, stave });
        voice.setStave(stave).draw(ctx, stave);
        beams.forEach((beam) => beam.setContext(ctx).draw());
        return voice.getBoundingBox();
    }
    static FormatAndDrawTab(ctx, tabstave, stave, tabnotes, notes, autobeam, params) {
        let opts = {
            auto_beam: autobeam,
            align_rests: false,
        };
        if (typeof params === 'object') {
            opts = Object.assign(Object.assign({}, opts), params);
        }
        else if (typeof params === 'boolean') {
            opts.auto_beam = params;
        }
        const notevoice = new Voice(Tables.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(notes);
        const tabvoice = new Voice(Tables.TIME4_4).setMode(Voice.Mode.SOFT).addTickables(tabnotes);
        const beams = opts.auto_beam ? Beam.applyAndGetBeams(notevoice) : [];
        new Formatter()
            .joinVoices([notevoice])
            .joinVoices([tabvoice])
            .formatToStave([notevoice, tabvoice], stave, { align_rests: opts.align_rests });
        notevoice.draw(ctx, stave);
        tabvoice.draw(ctx, tabstave);
        beams.forEach((beam) => beam.setContext(ctx).draw());
        new StaveConnector(stave, tabstave).setContext(ctx).draw();
    }
    static AlignRestsToNotes(tickables, alignAllNotes, alignTuplets) {
        tickables.forEach((currTickable, index) => {
            if (isStaveNote(currTickable) && currTickable.isRest()) {
                if (currTickable.getTuplet() && !alignTuplets) {
                    return;
                }
                const position = currTickable.getGlyphProps().position.toUpperCase();
                if (position !== 'R/4' && position !== 'B/4') {
                    return;
                }
                if (alignAllNotes || currTickable.getBeam()) {
                    const props = currTickable.getKeyProps()[0];
                    if (index === 0) {
                        props.line = getRestLineForNextNoteGroup(tickables, props.line, index, false);
                    }
                    else if (index > 0 && index < tickables.length) {
                        const prevTickable = tickables[index - 1];
                        if (isStaveNote(prevTickable)) {
                            if (prevTickable.isRest()) {
                                props.line = prevTickable.getKeyProps()[0].line;
                            }
                            else {
                                const restLine = prevTickable.getLineForRest();
                                props.line = getRestLineForNextNoteGroup(tickables, restLine, index, true);
                            }
                        }
                    }
                    currTickable.setKeyLine(0, props.line);
                }
            }
        });
    }
    constructor(options) {
        this.formatterOptions = Object.assign({ globalSoftmax: false, softmaxFactor: Tables.SOFTMAX_FACTOR, maxIterations: 5 }, options);
        this.justifyWidth = 0;
        this.totalCost = 0;
        this.totalShift = 0;
        this.durationStats = {};
        this.minTotalWidth = 0;
        this.hasMinTotalWidth = false;
        this.tickContexts = {
            map: {},
            array: [],
            list: [],
            resolutionMultiplier: 0,
        };
        this.modifierContexts = [];
        this.contextGaps = {
            total: 0,
            gaps: [],
        };
        this.voices = [];
        this.lossHistory = [];
    }
    alignRests(voices, alignAllNotes) {
        if (!voices || !voices.length) {
            throw new RuntimeError('BadArgument', 'No voices to format rests');
        }
        voices.forEach((voice) => Formatter.AlignRestsToNotes(voice.getTickables(), alignAllNotes));
    }
    preCalculateMinTotalWidth(voices) {
        const unalignedPadding = Tables.currentMusicFont().lookupMetric('stave.unalignedNotePadding');
        let unalignedCtxCount = 0;
        let wsum = 0;
        let dsum = 0;
        const widths = [];
        const durations = [];
        if (this.hasMinTotalWidth)
            return this.minTotalWidth;
        if (!voices) {
            throw new RuntimeError('BadArgument', "'voices' required to run preCalculateMinTotalWidth");
        }
        this.createTickContexts(voices);
        const { list: contextList, map: contextMap } = this.tickContexts;
        this.minTotalWidth = 0;
        contextList.forEach((tick) => {
            const context = contextMap[tick];
            context.preFormat();
            if (context.getTickables().length < voices.length) {
                unalignedCtxCount += 1;
            }
            context.getTickables().forEach((t) => {
                wsum += t.getMetrics().width;
                dsum += t.getTicks().value();
                widths.push(t.getMetrics().width);
                durations.push(t.getTicks().value());
            });
            const width = context.getWidth();
            this.minTotalWidth += width;
        });
        this.hasMinTotalWidth = true;
        const wavg = wsum > 0 ? wsum / widths.length : 1 / widths.length;
        const wvar = sumArray(widths.map((ll) => Math.pow(ll - wavg, 2)));
        const wpads = Math.pow(wvar / widths.length, 0.5) / wavg;
        const davg = dsum / durations.length;
        const dvar = sumArray(durations.map((ll) => Math.pow(ll - davg, 2)));
        const dpads = Math.pow(dvar / durations.length, 0.5) / davg;
        const padmax = Math.max(dpads, wpads) * contextList.length * unalignedPadding;
        const unalignedPad = unalignedPadding * unalignedCtxCount;
        return this.minTotalWidth + Math.max(unalignedPad, padmax);
    }
    getMinTotalWidth() {
        if (!this.hasMinTotalWidth) {
            throw new RuntimeError('NoMinTotalWidth', "Call 'preCalculateMinTotalWidth' or 'preFormat' before calling 'getMinTotalWidth'");
        }
        return this.minTotalWidth;
    }
    static getResolutionMultiplier(voices) {
        if (!voices || !voices.length) {
            throw new RuntimeError('BadArgument', 'No voices to format');
        }
        const totalTicks = voices[0].getTotalTicks();
        const resolutionMultiplier = voices.reduce((accumulator, voice) => {
            if (!voice.getTotalTicks().equals(totalTicks)) {
                throw new RuntimeError('TickMismatch', 'Voices should have same total note duration in ticks.');
            }
            if (voice.getMode() === Voice.Mode.STRICT && !voice.isComplete()) {
                throw new RuntimeError('IncompleteVoice', 'Voice does not have enough notes.');
            }
            return Math.max(accumulator, Fraction.LCM(accumulator, voice.getResolutionMultiplier()));
        }, 1);
        return resolutionMultiplier;
    }
    createModifierContexts(voices) {
        if (voices.length == 0)
            return;
        const resolutionMultiplier = Formatter.getResolutionMultiplier(voices);
        const tickToContextMap = new Map();
        const contexts = [];
        voices.forEach((voice) => {
            const ticksUsed = new Fraction(0, resolutionMultiplier);
            voice.getTickables().forEach((tickable) => {
                const integerTicks = ticksUsed.numerator;
                let staveTickToContextMap = tickToContextMap.get(tickable.getStave());
                if (!staveTickToContextMap) {
                    tickToContextMap.set(tickable.getStave(), {});
                    staveTickToContextMap = tickToContextMap.get(tickable.getStave());
                }
                if (!(staveTickToContextMap ? staveTickToContextMap[integerTicks] : undefined)) {
                    const newContext = new ModifierContext();
                    contexts.push(newContext);
                    staveTickToContextMap[integerTicks] = newContext;
                }
                tickable.addToModifierContext(staveTickToContextMap[integerTicks]);
                ticksUsed.add(tickable.getTicks());
            });
        });
        this.modifierContexts.push({
            map: tickToContextMap,
            array: contexts,
            resolutionMultiplier,
        });
    }
    createTickContexts(voices) {
        const fn = (tickable, context, voiceIndex) => context.addTickable(tickable, voiceIndex);
        const contexts = createContexts(voices, (tick) => new TickContext(tick), fn);
        this.tickContexts = contexts;
        const contextArray = this.tickContexts.array;
        contextArray.forEach((context) => {
            context.tContexts = contextArray;
        });
        return contexts;
    }
    getTickContexts() {
        return this.tickContexts;
    }
    preFormat(justifyWidth = 0, renderingContext, voicesParam, stave) {
        const contexts = this.tickContexts;
        if (!contexts) {
            throw new RuntimeError('NoTickContexts', 'preFormat requires TickContexts');
        }
        const { list: contextList, map: contextMap } = contexts;
        this.lossHistory = [];
        if (voicesParam && stave) {
            voicesParam.forEach((voice) => voice.setStave(stave).preFormat());
        }
        let x = 0;
        let shift = 0;
        this.minTotalWidth = 0;
        let totalTicks = 0;
        contextList.forEach((tick) => {
            const context = contextMap[tick];
            context.preFormat();
            const width = context.getWidth();
            this.minTotalWidth += width;
            const maxTicks = context.getMaxTicks().value();
            totalTicks += maxTicks;
            const metrics = context.getMetrics();
            x = x + shift + metrics.totalLeftPx;
            context.setX(x);
            shift = width - metrics.totalLeftPx;
        });
        const { globalSoftmax, softmaxFactor, maxIterations } = this.formatterOptions;
        const exp = (tick) => Math.pow(softmaxFactor, (contextMap[tick].getMaxTicks().value() / totalTicks));
        const expTicksUsed = sumArray(contextList.map(exp));
        this.minTotalWidth = x + shift;
        this.hasMinTotalWidth = true;
        if (justifyWidth <= 0)
            return this.evaluate();
        const firstContext = contextMap[contextList[0]];
        const lastContext = contextMap[contextList[contextList.length - 1]];
        function calculateIdealDistances(adjustedJustifyWidth) {
            const distances = contextList.map((tick, i) => {
                const context = contextMap[tick];
                const voices = context.getTickablesByVoice();
                let backTickable;
                if (i > 0) {
                    const prevContext = contextMap[contextList[i - 1]];
                    for (let j = i - 1; j >= 0; j--) {
                        const backTick = contextMap[contextList[j]];
                        const backVoices = backTick.getTickablesByVoice();
                        const matchingVoices = [];
                        Object.keys(voices).forEach((v) => {
                            if (backVoices[v]) {
                                matchingVoices.push(v);
                            }
                        });
                        if (matchingVoices.length > 0) {
                            let maxTicks = 0;
                            let maxNegativeShiftPx = Infinity;
                            let expectedDistance = 0;
                            matchingVoices.forEach((v) => {
                                const ticks = backVoices[v].getTicks().value();
                                if (ticks > maxTicks) {
                                    backTickable = backVoices[v];
                                    maxTicks = ticks;
                                }
                                const thisTickable = voices[v];
                                const insideLeftEdge = thisTickable.getX() -
                                    (thisTickable.getMetrics().modLeftPx + thisTickable.getMetrics().leftDisplacedHeadPx);
                                const backMetrics = backVoices[v].getMetrics();
                                const insideRightEdge = backVoices[v].getX() + backMetrics.notePx + backMetrics.modRightPx + backMetrics.rightDisplacedHeadPx;
                                maxNegativeShiftPx = Math.min(maxNegativeShiftPx, insideLeftEdge - insideRightEdge);
                            });
                            maxNegativeShiftPx = Math.min(maxNegativeShiftPx, context.getX() - (prevContext.getX() + adjustedJustifyWidth * 0.05));
                            if (globalSoftmax) {
                                const t = totalTicks;
                                expectedDistance = (Math.pow(softmaxFactor, (maxTicks / t)) / expTicksUsed) * adjustedJustifyWidth;
                            }
                            else if (typeof backTickable !== 'undefined') {
                                expectedDistance = backTickable.getVoice().softmax(maxTicks) * adjustedJustifyWidth;
                            }
                            return {
                                expectedDistance,
                                maxNegativeShiftPx,
                                fromTickable: backTickable,
                            };
                        }
                    }
                }
                return { expectedDistance: 0, fromTickablePx: 0, maxNegativeShiftPx: 0 };
            });
            return distances;
        }
        function shiftToIdealDistances(idealDistances) {
            const centerX = adjustedJustifyWidth / 2;
            let spaceAccum = 0;
            contextList.forEach((tick, index) => {
                const context = contextMap[tick];
                if (index > 0) {
                    const contextX = context.getX();
                    const ideal = idealDistances[index];
                    const errorPx = defined(ideal.fromTickable).getX() + ideal.expectedDistance - (contextX + spaceAccum);
                    let negativeShiftPx = 0;
                    if (errorPx > 0) {
                        spaceAccum += errorPx;
                    }
                    else if (errorPx < 0) {
                        negativeShiftPx = Math.min(ideal.maxNegativeShiftPx, Math.abs(errorPx));
                        spaceAccum += -negativeShiftPx;
                    }
                    context.setX(contextX + spaceAccum);
                }
                context.getCenterAlignedTickables().forEach((tickable) => {
                    tickable.setCenterXShift(centerX - context.getX());
                });
            });
            return lastContext.getX() - firstContext.getX();
        }
        const adjustedJustifyWidth = justifyWidth -
            lastContext.getMetrics().notePx -
            lastContext.getMetrics().totalRightPx -
            firstContext.getMetrics().totalLeftPx;
        const musicFont = Tables.currentMusicFont();
        const configMinPadding = musicFont.lookupMetric('stave.endPaddingMin');
        const configMaxPadding = musicFont.lookupMetric('stave.endPaddingMax');
        const leftPadding = musicFont.lookupMetric('stave.padding');
        let targetWidth = adjustedJustifyWidth;
        const distances = calculateIdealDistances(targetWidth);
        let actualWidth = shiftToIdealDistances(distances);
        if (contextList.length === 1)
            return 0;
        const calcMinDistance = (targetWidth, distances) => {
            let mdCalc = targetWidth / 2;
            if (distances.length > 1) {
                for (let di = 1; di < distances.length; ++di) {
                    mdCalc = Math.min(distances[di].expectedDistance / 2, mdCalc);
                }
            }
            return mdCalc;
        };
        const minDistance = calcMinDistance(targetWidth, distances);
        const paddingMaxCalc = (curTargetWidth) => {
            let lastTickablePadding = 0;
            const lastTickable = lastContext && lastContext.getMaxTickable();
            if (lastTickable) {
                const voice = lastTickable.getVoice();
                if (voice.getTicksUsed().value() > voice.getTotalTicks().value()) {
                    return configMaxPadding * 2 < minDistance ? minDistance : configMaxPadding;
                }
                const tickWidth = lastTickable.getWidth();
                lastTickablePadding =
                    voice.softmax(lastContext.getMaxTicks().value()) * curTargetWidth - (tickWidth + leftPadding);
            }
            return configMaxPadding * 2 < lastTickablePadding ? lastTickablePadding : configMaxPadding;
        };
        let paddingMax = paddingMaxCalc(targetWidth);
        let paddingMin = paddingMax - (configMaxPadding - configMinPadding);
        const maxX = adjustedJustifyWidth - paddingMin;
        let iterations = maxIterations;
        while ((actualWidth > maxX && iterations > 0) || (actualWidth + paddingMax < maxX && iterations > 1)) {
            targetWidth -= actualWidth - maxX;
            paddingMax = paddingMaxCalc(targetWidth);
            paddingMin = paddingMax - (configMaxPadding - configMinPadding);
            actualWidth = shiftToIdealDistances(calculateIdealDistances(targetWidth));
            iterations--;
        }
        this.justifyWidth = justifyWidth;
        return this.evaluate();
    }
    evaluate() {
        const contexts = this.tickContexts;
        const justifyWidth = this.justifyWidth;
        this.contextGaps = { total: 0, gaps: [] };
        contexts.list.forEach((tick, index) => {
            if (index === 0)
                return;
            const prevTick = contexts.list[index - 1];
            const prevContext = contexts.map[prevTick];
            const context = contexts.map[tick];
            const prevMetrics = prevContext.getMetrics();
            const currMetrics = context.getMetrics();
            const insideRightEdge = prevContext.getX() + prevMetrics.notePx + prevMetrics.totalRightPx;
            const insideLeftEdge = context.getX() - currMetrics.totalLeftPx;
            const gap = insideLeftEdge - insideRightEdge;
            this.contextGaps.total += gap;
            this.contextGaps.gaps.push({ x1: insideRightEdge, x2: insideLeftEdge });
            context.getFormatterMetrics().freedom.left = gap;
            prevContext.getFormatterMetrics().freedom.right = gap;
        });
        this.durationStats = {};
        const durationStats = this.durationStats;
        function updateStats(duration, space) {
            const stats = durationStats[duration];
            if (stats === undefined) {
                durationStats[duration] = { mean: space, count: 1 };
            }
            else {
                stats.count += 1;
                stats.mean = (stats.mean + space) / 2;
            }
        }
        this.voices.forEach((voice) => {
            voice.getTickables().forEach((note, i, notes) => {
                const duration = note.getTicks().clone().simplify().toString();
                const metrics = note.getMetrics();
                const formatterMetrics = note.getFormatterMetrics();
                const leftNoteEdge = note.getX() + metrics.notePx + metrics.modRightPx + metrics.rightDisplacedHeadPx;
                let space = 0;
                if (i < notes.length - 1) {
                    const rightNote = notes[i + 1];
                    const rightMetrics = rightNote.getMetrics();
                    const rightNoteEdge = rightNote.getX() - rightMetrics.modLeftPx - rightMetrics.leftDisplacedHeadPx;
                    space = rightNoteEdge - leftNoteEdge;
                    formatterMetrics.space.used = rightNote.getX() - note.getX();
                    rightNote.getFormatterMetrics().freedom.left = space;
                }
                else {
                    space = justifyWidth - leftNoteEdge;
                    formatterMetrics.space.used = justifyWidth - note.getX();
                }
                formatterMetrics.freedom.right = space;
                updateStats(duration, formatterMetrics.space.used);
            });
        });
        let totalDeviation = 0;
        this.voices.forEach((voice) => {
            voice.getTickables().forEach((note) => {
                const duration = note.getTicks().clone().simplify().toString();
                const metrics = note.getFormatterMetrics();
                metrics.space.mean = durationStats[duration].mean;
                metrics.duration = duration;
                metrics.iterations += 1;
                metrics.space.deviation = metrics.space.used - metrics.space.mean;
                totalDeviation += Math.pow(metrics.space.deviation, 2);
            });
        });
        this.totalCost = Math.sqrt(totalDeviation);
        this.lossHistory.push(this.totalCost);
        return this.totalCost;
    }
    tune(options) {
        var _a;
        const contexts = this.tickContexts;
        if (!contexts) {
            return 0;
        }
        const alpha = (_a = options === null || options === void 0 ? void 0 : options.alpha) !== null && _a !== void 0 ? _a : 0.5;
        function move(current, shift, prev, next) {
            current.setX(current.getX() + shift);
            current.getFormatterMetrics().freedom.left += shift;
            current.getFormatterMetrics().freedom.right -= shift;
            if (prev)
                prev.getFormatterMetrics().freedom.right += shift;
            if (next)
                next.getFormatterMetrics().freedom.left -= shift;
        }
        let shift = 0;
        this.totalShift = 0;
        contexts.list.forEach((tick, index, list) => {
            const context = contexts.map[tick];
            const prevContext = index > 0 ? contexts.map[list[index - 1]] : undefined;
            const nextContext = index < list.length - 1 ? contexts.map[list[index + 1]] : undefined;
            move(context, shift, prevContext, nextContext);
            const cost = -sumArray(context.getTickables().map((t) => t.getFormatterMetrics().space.deviation));
            if (cost > 0) {
                shift = -Math.min(context.getFormatterMetrics().freedom.right, Math.abs(cost));
            }
            else if (cost < 0) {
                if (nextContext) {
                    shift = Math.min(nextContext.getFormatterMetrics().freedom.right, Math.abs(cost));
                }
                else {
                    shift = 0;
                }
            }
            shift *= alpha;
            this.totalShift += shift;
        });
        return this.evaluate();
    }
    postFormat() {
        this.modifierContexts.forEach((modifierContexts) => {
            modifierContexts.array.forEach((mc) => mc.postFormat());
        });
        this.tickContexts.list.forEach((tick) => {
            this.tickContexts.map[tick].postFormat();
        });
        return this;
    }
    joinVoices(voices) {
        this.createModifierContexts(voices);
        this.hasMinTotalWidth = false;
        return this;
    }
    format(voices, justifyWidth, options) {
        const opts = Object.assign({ align_rests: false }, options);
        this.voices = voices;
        const softmaxFactor = this.formatterOptions.softmaxFactor;
        if (softmaxFactor) {
            this.voices.forEach((v) => v.setSoftmaxFactor(softmaxFactor));
        }
        this.alignRests(voices, opts.align_rests);
        this.createTickContexts(voices);
        this.preFormat(justifyWidth, opts.context, voices, opts.stave);
        if (opts.stave)
            this.postFormat();
        return this;
    }
    formatToStave(voices, stave, optionsParam) {
        const options = Object.assign({ context: stave.getContext() }, optionsParam);
        const justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - Stave.defaultPadding;
        L('Formatting voices to width: ', justifyWidth);
        return this.format(voices, justifyWidth, options);
    }
    getTickContext(tick) {
        var _a;
        return (_a = this.tickContexts) === null || _a === void 0 ? void 0 : _a.map[tick];
    }
}
Formatter.DEBUG = false;
export { Formatter };
