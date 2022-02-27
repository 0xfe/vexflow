import { VexFlowTests } from './vexflow_test_helpers.js';
import { TextFormatter } from '../src/textformatter.js';
const TextFormatterTests = {
    Start() {
        QUnit.module('TextFormatter');
        test('Basic', basic);
    },
};
function basic() {
    var _a;
    const registeredFamilies = TextFormatter.getFontFamilies();
    equal(registeredFamilies.length, 2, `There are two registered font families: 'Roboto Slab' & 'PetalumaScript'`);
    const petalumaFormatterInfo = TextFormatter.getInfo('PetalumaScript');
    equal((_a = petalumaFormatterInfo === null || petalumaFormatterInfo === void 0 ? void 0 : petalumaFormatterInfo.glyphs) === null || _a === void 0 ? void 0 : _a.C.advanceWidth, 623, 'PetalumaScript advanceWidth of C character is 623.');
    const formatterForPetalumaScript = TextFormatter.create({ family: 'PetalumaScript', size: '100px' });
    const metricsPetalumaScriptH = formatterForPetalumaScript.getGlyphMetrics('H');
    equal(metricsPetalumaScriptH.leftSideBearing, 37);
    const formatterForRobotoSlab = TextFormatter.create({ family: 'Roboto Slab', size: '100px', style: 'italic' });
    const metricsRobotoSlabH = formatterForRobotoSlab.getGlyphMetrics('H');
    equal(metricsRobotoSlabH.advanceWidth, 1578);
    equal(formatterForRobotoSlab.cacheKey, 'Roboto_Slab%75%normal%normal');
}
VexFlowTests.register(TextFormatterTests);
export { TextFormatterTests };
