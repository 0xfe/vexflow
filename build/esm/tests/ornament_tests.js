import { VexFlowTests } from './vexflow_test_helpers.js';
import { Accidental } from '../src/accidental.js';
import { Beam } from '../src/beam.js';
import { Dot } from '../src/dot.js';
import { Formatter } from '../src/formatter.js';
import { Glyph } from '../src/glyph.js';
import { Ornament } from '../src/ornament.js';
import { Stave } from '../src/stave.js';
import { StaveNote } from '../src/stavenote.js';
import { Voice, VoiceMode } from '../src/voice.js';
const OrnamentTests = {
    Start() {
        QUnit.module('Ornament');
        const run = VexFlowTests.runTests;
        run('Ornaments', drawOrnaments);
        run('Ornaments Vertically Shifted', drawOrnamentsDisplaced);
        run('Ornaments - Delayed turns', drawOrnamentsDelayed);
        run('Ornaments - Delayed turns, Multiple Draws', drawOrnamentsDelayedMultipleDraws);
        run('Stacked', drawOrnamentsStacked);
        run('With Upper/Lower Accidentals', drawOrnamentsWithAccidentals);
        run('Jazz Ornaments', jazzOrnaments);
    },
};
function drawOrnaments(options, contextBuilder) {
    expect(0);
    const ctx = contextBuilder(options.elementId, 750, 195);
    const stave = new Stave(10, 30, 700);
    stave.setContext(ctx).draw();
    const notes = [
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    ];
    notes[0].addModifier(new Ornament('mordent'), 0);
    notes[1].addModifier(new Ornament('mordent_inverted'), 0);
    notes[2].addModifier(new Ornament('turn'), 0);
    notes[3].addModifier(new Ornament('turn_inverted'), 0);
    notes[4].addModifier(new Ornament('tr'), 0);
    notes[5].addModifier(new Ornament('upprall'), 0);
    notes[6].addModifier(new Ornament('downprall'), 0);
    notes[7].addModifier(new Ornament('prallup'), 0);
    notes[8].addModifier(new Ornament('pralldown'), 0);
    notes[9].addModifier(new Ornament('upmordent'), 0);
    notes[10].addModifier(new Ornament('downmordent'), 0);
    notes[11].addModifier(new Ornament('lineprall'), 0);
    notes[12].addModifier(new Ornament('prallprall'), 0);
    Formatter.FormatAndDraw(ctx, stave, notes);
}
function drawOrnamentsDisplaced(options, contextBuilder) {
    expect(0);
    const ctx = contextBuilder(options.elementId, 750, 195);
    const stave = new Stave(10, 30, 700);
    stave.setContext(ctx).draw();
    const notes = [
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];
    notes[0].addModifier(new Ornament('mordent'), 0);
    notes[1].addModifier(new Ornament('mordent_inverted'), 0);
    notes[1].addModifier(new Ornament('mordent_inverted'), 0);
    notes[2].addModifier(new Ornament('turn'), 0);
    notes[3].addModifier(new Ornament('turn_inverted'), 0);
    notes[4].addModifier(new Ornament('tr'), 0);
    notes[5].addModifier(new Ornament('upprall'), 0);
    notes[6].addModifier(new Ornament('downprall'), 0);
    notes[7].addModifier(new Ornament('prallup'), 0);
    notes[8].addModifier(new Ornament('pralldown'), 0);
    notes[9].addModifier(new Ornament('upmordent'), 0);
    notes[10].addModifier(new Ornament('downmordent'), 0);
    notes[11].addModifier(new Ornament('lineprall'), 0);
    notes[12].addModifier(new Ornament('prallprall'), 0);
    Formatter.FormatAndDraw(ctx, stave, notes);
}
const addDelayedTurns = (options, contextBuilder) => {
    const context = contextBuilder(options.elementId, 550, 195);
    const stave = new Stave(10, 30, 500);
    stave.setContext(context).draw();
    const notes = [
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];
    notes[0].addModifier(new Ornament('turn').setDelayed(true), 0);
    notes[1].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
    notes[2].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
    notes[3].addModifier(new Ornament('turn').setDelayed(true), 0);
    return { context, stave, notes };
};
function drawOrnamentsDelayed(options, contextBuilder) {
    expect(0);
    const { context, stave, notes } = addDelayedTurns(options, contextBuilder);
    Formatter.FormatAndDraw(context, stave, notes);
}
function drawOrnamentsDelayedMultipleDraws(options, contextBuilder) {
    expect(0);
    const { context, stave, notes } = addDelayedTurns(options, contextBuilder);
    Formatter.FormatAndDraw(context, stave, notes);
    Formatter.FormatAndDraw(context, stave, notes);
}
function drawOrnamentsStacked(options, contextBuilder) {
    expect(0);
    const ctx = contextBuilder(options.elementId, 550, 195);
    const stave = new Stave(10, 30, 500);
    stave.setContext(ctx).draw();
    const notes = [
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];
    notes[0].addModifier(new Ornament('mordent'), 0);
    notes[1].addModifier(new Ornament('turn_inverted'), 0);
    notes[2].addModifier(new Ornament('turn'), 0);
    notes[3].addModifier(new Ornament('turn_inverted'), 0);
    notes[0].addModifier(new Ornament('turn'), 0);
    notes[1].addModifier(new Ornament('prallup'), 0);
    notes[2].addModifier(new Ornament('upmordent'), 0);
    notes[3].addModifier(new Ornament('lineprall'), 0);
    Formatter.FormatAndDraw(ctx, stave, notes);
}
function drawOrnamentsWithAccidentals(options, contextBuilder) {
    expect(0);
    const ctx = contextBuilder(options.elementId, 650, 250);
    const stave = new Stave(10, 60, 600);
    stave.setContext(ctx).draw();
    const notes = [
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
        new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    ];
    notes[0].addModifier(new Ornament('mordent').setUpperAccidental('#').setLowerAccidental('#'), 0);
    notes[1].addModifier(new Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'), 0);
    notes[2].addModifier(new Ornament('turn').setUpperAccidental('##').setLowerAccidental('##'), 0);
    notes[3].addModifier(new Ornament('mordent_inverted').setLowerAccidental('db').setUpperAccidental('db'), 0);
    notes[4].addModifier(new Ornament('turn_inverted').setUpperAccidental('++').setLowerAccidental('++'), 0);
    notes[5].addModifier(new Ornament('tr').setUpperAccidental('n').setLowerAccidental('n'), 0);
    notes[6].addModifier(new Ornament('prallup').setUpperAccidental('d').setLowerAccidental('d'), 0);
    notes[7].addModifier(new Ornament('lineprall').setUpperAccidental('db').setLowerAccidental('db'), 0);
    notes[8].addModifier(new Ornament('upmordent').setUpperAccidental('bbs').setLowerAccidental('bbs'), 0);
    notes[9].addModifier(new Ornament('prallprall').setUpperAccidental('bb').setLowerAccidental('bb'), 0);
    notes[10].addModifier(new Ornament('turn_inverted').setUpperAccidental('+').setLowerAccidental('+'), 0);
    Formatter.FormatAndDraw(ctx, stave, notes);
}
function jazzOrnaments(options) {
    const clefWidth = Glyph.getWidth('gClef', 38);
    function draw(modifiers, keys, x, width, y, stemDirection) {
        const note = (keys, duration, modifier, stemDirection) => {
            const n = new StaveNote({ keys, duration, stem_direction: stemDirection })
                .addModifier(modifier, 0)
                .addModifier(new Accidental('b'), 0);
            const dot = duration.indexOf('d') >= 0;
            if (dot) {
                Dot.buildAndAttach([n], { all: true });
            }
            return n;
        };
        const stave = new Stave(x, y, width).addClef('treble').setContext(ctx).draw();
        const notes = [
            note(keys, '4d', modifiers[0], stemDirection),
            note(keys, '8', modifiers[1], stemDirection),
            note(keys, '4d', modifiers[2], stemDirection),
            note(keys, '8', modifiers[3], stemDirection),
        ];
        if (modifiers.length > 4) {
            notes[3].addModifier(modifiers[4], 0);
        }
        Beam.generateBeams(notes);
        const voice = new Voice({
            num_beats: 4,
            beat_value: 4,
        }).setMode(VoiceMode.SOFT);
        voice.addTickables(notes);
        const formatter = new Formatter().joinVoices([voice]);
        formatter.format([voice], width - Stave.defaultPadding - clefWidth);
        stave.setContext(ctx).draw();
        voice.draw(ctx, stave);
    }
    expect(0);
    const f = VexFlowTests.makeFactory(options, 950, 400);
    const ctx = f.getContext();
    ctx.scale(1, 1);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const xStart = 10;
    const width = 300;
    const yStart = 50;
    const staffHeight = 70;
    let curX = xStart;
    let curY = yStart;
    let mods = [
        new Ornament('scoop'),
        new Ornament('doit'),
        new Ornament('fall'),
        new Ornament('doitLong'),
    ];
    draw(mods, ['a/5'], curX, width, curY, -1);
    curX += width;
    mods = [
        new Ornament('fallLong'),
        new Ornament('bend'),
        new Ornament('plungerClosed'),
        new Ornament('plungerOpen'),
        new Ornament('bend'),
    ];
    draw(mods, ['a/5'], curX, width, curY, -1);
    curX += width;
    mods = [
        new Ornament('flip'),
        new Ornament('jazzTurn'),
        new Ornament('smear'),
        new Ornament('doit'),
    ];
    draw(mods, ['a/5'], curX, width, curY, 1);
    curX = xStart;
    curY += staffHeight;
    mods = [
        new Ornament('scoop'),
        new Ornament('doit'),
        new Ornament('fall'),
        new Ornament('doitLong'),
    ];
    draw(mods, ['e/5'], curX, width, curY);
    curX += width;
    mods = [
        new Ornament('fallLong'),
        new Ornament('bend'),
        new Ornament('plungerClosed'),
        new Ornament('plungerOpen'),
        new Ornament('bend'),
    ];
    draw(mods, ['e/5'], curX, width, curY);
    curX += width;
    mods = [
        new Ornament('flip'),
        new Ornament('jazzTurn'),
        new Ornament('smear'),
        new Ornament('doit'),
    ];
    draw(mods, ['e/5'], curX, width, curY);
    curX = xStart;
    curY += staffHeight;
    mods = [
        new Ornament('scoop'),
        new Ornament('doit'),
        new Ornament('fall'),
        new Ornament('doitLong'),
    ];
    draw(mods, ['e/4'], curX, width, curY);
    curX += width;
    mods = [
        new Ornament('fallLong'),
        new Ornament('bend'),
        new Ornament('plungerClosed'),
        new Ornament('plungerOpen'),
        new Ornament('bend'),
    ];
    draw(mods, ['e/4'], curX, width, curY);
    curX += width;
    mods = [
        new Ornament('flip'),
        new Ornament('jazzTurn'),
        new Ornament('smear'),
        new Ornament('doit'),
    ];
    draw(mods, ['e/4'], curX, width, curY);
}
VexFlowTests.register(OrnamentTests);
export { OrnamentTests };
