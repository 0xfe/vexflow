import { VexFlowTests } from './vexflow_test_helpers.js';
import { Flow } from '../src/flow.js';
import { Font } from '../src/font.js';
const MultiMeasureRestTests = {
    Start() {
        QUnit.module('MultiMeasureRest');
        const run = VexFlowTests.runTests;
        run('Simple Test', simple);
        run('Stave with modifiers Test', staveWithModifiers);
    },
};
function simple(options) {
    const width = 910;
    const f = VexFlowTests.makeFactory(options, width, 300);
    const line_spacing_15px = { options: { spacing_between_lines_px: 15 } };
    const params = [
        [{}, { number_of_measures: 2, show_number: false }],
        [{}, { number_of_measures: 2 }],
        [{}, { number_of_measures: 2, line_thickness: 8, serif_thickness: 3 }],
        [{}, { number_of_measures: 1, use_symbols: true }],
        [{}, { number_of_measures: 2, use_symbols: true }],
        [{}, { number_of_measures: 3, use_symbols: true }],
        [{}, { number_of_measures: 4, use_symbols: true }],
        [{}, { number_of_measures: 5, use_symbols: true }],
        [{}, { number_of_measures: 6, use_symbols: true }],
        [{}, { number_of_measures: 7, use_symbols: true }],
        [{}, { number_of_measures: 8, use_symbols: true }],
        [{}, { number_of_measures: 9, use_symbols: true }],
        [{}, { number_of_measures: 10, use_symbols: true }],
        [{}, { number_of_measures: 11, use_symbols: true }],
        [{}, { number_of_measures: 11, use_symbols: false, padding_left: 20, padding_right: 20 }],
        [{}, { number_of_measures: 11, use_symbols: true, symbol_spacing: 5 }],
        [{}, { number_of_measures: 11, use_symbols: false, line: 3, number_line: 2 }],
        [{}, { number_of_measures: 11, use_symbols: true, line: 3, number_line: 2 }],
        [line_spacing_15px, { number_of_measures: 12 }],
        [line_spacing_15px, { number_of_measures: 9, use_symbols: true }],
        [line_spacing_15px, { number_of_measures: 12, spacing_between_lines_px: 15, number_glyph_point: 40 * 1.5 }],
        [
            line_spacing_15px,
            {
                number_of_measures: 9,
                spacing_between_lines_px: 15,
                use_symbols: true,
                number_glyph_point: 40 * 1.5,
            },
        ],
        [
            line_spacing_15px,
            {
                number_of_measures: 9,
                spacing_between_lines_px: 15,
                use_symbols: true,
                number_glyph_point: 40 * 1.5,
                semibreve_rest_glyph_scale: Flow.NOTATION_FONT_SCALE * 1.5,
            },
        ],
    ];
    const staveWidth = 100;
    let x = 0;
    let y = 0;
    const mmRests = params.map((param) => {
        if (x + staveWidth * 2 > width) {
            x = 0;
            y += 80;
        }
        const staveParams = param[0];
        const mmRestParams = param[1];
        staveParams.x = x;
        staveParams.y = y;
        staveParams.width = staveWidth;
        x += staveWidth;
        const stave = f.Stave(staveParams);
        return f.MultiMeasureRest(mmRestParams).setStave(stave);
    });
    f.draw();
    const xs = mmRests[0].getXs();
    const strY = mmRests[0].getStave().getYForLine(-0.5);
    const str = 'TACET';
    const context = f.getContext();
    context.save();
    context.setFont(Font.SERIF, 16, 'bold');
    const metrics = context.measureText(str);
    context.fillText(str, xs.left + (xs.right - xs.left) * 0.5 - metrics.width * 0.5, strY);
    context.restore();
    options.assert.ok(true, 'Simple Test');
}
function staveWithModifiers(options) {
    const width = 910;
    const f = VexFlowTests.makeFactory(options, width, 200);
    let x = 0;
    let y = 0;
    const params = [
        [{ clef: 'treble', params: { width: 150 } }, { number_of_measures: 5 }],
        [{ clef: 'treble', keySig: 'G', params: { width: 150 } }, { number_of_measures: 5 }],
        [{ clef: 'treble', timeSig: '4/4', keySig: 'G', params: { width: 150 } }, { number_of_measures: 5 }],
        [{ clef: 'treble', endClef: 'bass', params: { width: 150 } }, { number_of_measures: 5 }],
        [{ clef: 'treble', endKeySig: 'F', params: { width: 150 } }, { number_of_measures: 5 }],
        [{ clef: 'treble', endTimeSig: '2/4', params: { width: 150 } }, { number_of_measures: 5 }],
        [{ clef: 'treble', endClef: 'bass', endTimeSig: '2/4', params: { width: 150 } }, { number_of_measures: 5 }],
        [
            { clef: 'treble', endClef: 'bass', endTimeSig: '2/4', params: { width: 150 } },
            { number_of_measures: 5, use_symbols: true },
        ],
    ];
    params.forEach((param) => {
        const staveOptions = param[0];
        const staveParams = staveOptions.params;
        const mmrestParams = param[1];
        if (x + staveParams.width > width) {
            x = 0;
            y += 80;
        }
        staveParams.x = x;
        x += staveParams.width;
        staveParams.y = y;
        const stave = f.Stave(staveParams);
        if (staveOptions.clef) {
            stave.addClef(staveOptions.clef);
        }
        if (staveOptions.timeSig) {
            stave.addTimeSignature(staveOptions.timeSig);
        }
        if (staveOptions.keySig) {
            stave.addKeySignature(staveOptions.keySig);
        }
        if (staveOptions.endClef) {
            stave.addEndClef(staveOptions.endClef);
        }
        if (staveOptions.endKeySig) {
            stave.setEndKeySignature(staveOptions.endKeySig);
        }
        if (staveOptions.endTimeSig) {
            stave.setEndTimeSignature(staveOptions.endTimeSig);
        }
        return f.MultiMeasureRest(mmrestParams).setStave(stave);
    });
    f.draw();
    options.assert.ok(true, 'Stave with modifiers Test');
}
VexFlowTests.register(MultiMeasureRestTests);
export { MultiMeasureRestTests };
