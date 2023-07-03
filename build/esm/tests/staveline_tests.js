import { VexFlowTests } from './vexflow_test_helpers.js';
import { Dot } from '../src/dot.js';
import { Font, FontStyle } from '../src/font.js';
const StaveLineTests = {
    Start() {
        QUnit.module('StaveLine');
        const run = VexFlowTests.runTests;
        run('Simple StaveLine', simple0);
        run('StaveLine Arrow Options', simple1);
    },
};
function simple0(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave().addClef('treble');
    const notes = [
        f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        f.StaveNote({ keys: ['c/5'], duration: '4', clef: 'treble' }),
        f.StaveNote({ keys: ['c/4', 'g/4', 'b/4'], duration: '4', clef: 'treble' }),
        f.StaveNote({ keys: ['f/4', 'a/4', 'f/5'], duration: '4', clef: 'treble' }),
    ];
    const voice = f.Voice().addTickables(notes);
    f.StaveLine({
        from: notes[0],
        to: notes[1],
        first_indices: [0],
        last_indices: [0],
        options: {
            font: { family: Font.SERIF, size: 12, style: FontStyle.ITALIC },
            text: 'gliss.',
        },
    });
    const staveLine2 = f.StaveLine({
        from: notes[2],
        to: notes[3],
        first_indices: [2, 1, 0],
        last_indices: [0, 1, 2],
    });
    staveLine2.render_options.line_dash = [10, 10];
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
function simple1(options) {
    const f = VexFlowTests.makeFactory(options, 770);
    const stave = f.Stave().addClef('treble');
    const notes = [
        f.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
        f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }).addModifier(f.Accidental({ type: '#' }), 0),
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', clef: 'treble' }),
        f
            .StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
            .addModifier(f.Accidental({ type: '#' }), 2),
        f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }).addModifier(f.Accidental({ type: '#' }), 0),
        f.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
        f.StaveNote({ keys: ['c/4', 'd/4', 'g/4'], duration: '4', clef: 'treble' }),
        f
            .StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
            .addModifier(f.Accidental({ type: '#' }), 2),
    ];
    Dot.buildAndAttach([notes[0]], { all: true });
    const voice = f.Voice().setStrict(false).addTickables(notes);
    const staveLine0 = f.StaveLine({
        from: notes[0],
        to: notes[1],
        first_indices: [0],
        last_indices: [0],
        options: { text: 'Left' },
    });
    const staveLine4 = f.StaveLine({
        from: notes[2],
        to: notes[3],
        first_indices: [1],
        last_indices: [1],
        options: { text: 'Right' },
    });
    const staveLine1 = f.StaveLine({
        from: notes[4],
        to: notes[5],
        first_indices: [0],
        last_indices: [0],
        options: { text: 'Center' },
    });
    const staveLine2 = f.StaveLine({
        from: notes[6],
        to: notes[7],
        first_indices: [1],
        last_indices: [0],
    });
    const staveLine3 = f.StaveLine({
        from: notes[6],
        to: notes[7],
        first_indices: [2],
        last_indices: [2],
        options: { text: 'Top' },
    });
    staveLine0.render_options.draw_end_arrow = true;
    staveLine0.render_options.text_justification = 1;
    staveLine0.render_options.text_position_vertical = 2;
    staveLine1.render_options.draw_end_arrow = true;
    staveLine1.render_options.arrowhead_length = 30;
    staveLine1.render_options.line_width = 5;
    staveLine1.render_options.text_justification = 2;
    staveLine1.render_options.text_position_vertical = 2;
    staveLine4.render_options.line_width = 2;
    staveLine4.render_options.draw_end_arrow = true;
    staveLine4.render_options.draw_start_arrow = true;
    staveLine4.render_options.arrowhead_angle = 0.5;
    staveLine4.render_options.arrowhead_length = 20;
    staveLine4.render_options.text_justification = 3;
    staveLine4.render_options.text_position_vertical = 2;
    staveLine2.render_options.draw_start_arrow = true;
    staveLine2.render_options.line_dash = [5, 4];
    staveLine3.render_options.draw_end_arrow = true;
    staveLine3.render_options.draw_start_arrow = true;
    staveLine3.render_options.color = 'red';
    staveLine3.render_options.text_position_vertical = 1;
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
VexFlowTests.register(StaveLineTests);
export { StaveLineTests };
