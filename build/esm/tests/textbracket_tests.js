import { VexFlowTests } from './vexflow_test_helpers.js';
const TextBracketTests = {
    Start() {
        QUnit.module('TextBracket');
        const run = VexFlowTests.runTests;
        run('Simple TextBracket', simple0);
        run('TextBracket Styles', simple1);
    },
};
function simple0(options) {
    const f = VexFlowTests.makeFactory(options, 550);
    const stave = f.Stave();
    const score = f.EasyScore();
    const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
    const voice = score.voice(notes, { time: '5/4' });
    f.TextBracket({
        from: notes[0],
        to: notes[4],
        text: '15',
        options: {
            superscript: 'va',
            position: 'top',
        },
    });
    f.TextBracket({
        from: notes[0],
        to: notes[4],
        text: '8',
        options: {
            superscript: 'vb',
            position: 'bottom',
            line: 3,
        },
    });
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
function simple1(options) {
    const f = VexFlowTests.makeFactory(options, 550);
    const stave = f.Stave();
    const score = f.EasyScore();
    const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
    const voice = score.voice(notes, { time: '5/4' });
    const topOctaves = [
        f.TextBracket({
            from: notes[0],
            to: notes[1],
            text: 'Cool notes',
            options: {
                superscript: '',
                position: 'top',
            },
        }),
        f.TextBracket({
            from: notes[2],
            to: notes[4],
            text: 'Testing',
            options: {
                position: 'top',
                superscript: 'superscript',
                font: { family: 'Arial', size: 15, weight: 'normal', style: 'normal' },
            },
        }),
    ];
    const bottomOctaves = [
        f.TextBracket({
            from: notes[0],
            to: notes[1],
            text: '8',
            options: {
                superscript: 'vb',
                position: 'bottom',
                line: 3,
                font: { size: 30 },
            },
        }),
        f.TextBracket({
            from: notes[2],
            to: notes[4],
            text: 'Not cool notes',
            options: {
                superscript: ' super uncool',
                position: 'bottom',
                line: 4,
            },
        }),
    ];
    topOctaves[1].render_options.line_width = 2;
    topOctaves[1].render_options.show_bracket = false;
    bottomOctaves[0].render_options.underline_superscript = false;
    bottomOctaves[0].setDashed(false);
    bottomOctaves[1].render_options.bracket_height = 40;
    bottomOctaves[1].setDashed(true, [2, 2]);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
VexFlowTests.register(TextBracketTests);
export { TextBracketTests };
