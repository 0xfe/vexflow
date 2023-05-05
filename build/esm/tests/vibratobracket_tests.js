import { VexFlowTests } from './vexflow_test_helpers.js';
const VibratoBracketTests = {
    Start() {
        QUnit.module('VibratoBracket');
        const run = VexFlowTests.runTests;
        run('Simple VibratoBracket', simple);
        run('Harsh VibratoBracket Without End Note', withoutEndNote);
        run('Harsh VibratoBracket Without Start Note', withoutStartNote);
    },
};
function createTest(noteGroup, setupVibratoBracket) {
    return (options) => {
        const factory = VexFlowTests.makeFactory(options, 650, 200);
        const stave = factory.Stave();
        const score = factory.EasyScore();
        const voice = score.voice(score.notes(noteGroup));
        setupVibratoBracket(factory, voice.getTickables());
        factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        factory.draw();
        options.assert.ok(true);
    };
}
const simple = createTest('c4/4, c4, c4, c4', (factory, notes) => {
    factory.VibratoBracket({
        from: notes[0],
        to: notes[3],
        options: { line: 2 },
    });
});
const withoutEndNote = createTest('c4/4, c4, c4, c4', (factory, notes) => {
    factory.VibratoBracket({
        from: notes[2],
        to: null,
        options: { line: 2, harsh: true },
    });
});
const withoutStartNote = createTest('c4/4, c4, c4, c4', (factory, notes) => {
    factory.VibratoBracket({
        from: null,
        to: notes[2],
        options: { line: 2, harsh: true },
    });
});
VexFlowTests.register(VibratoBracketTests);
export { VibratoBracketTests };
