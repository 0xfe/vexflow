var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Flow } from '../src/flow.js';
import { Font } from '../src/font.js';
import { loadTextFonts } from '../src/fonts/textfonts.js';
import { globalObject, RuntimeError } from '../src/util.js';
const fontModules = {
    Bravura: './vexflow-font-bravura.js',
    Gonville: './vexflow-font-gonville.js',
    Petaluma: './vexflow-font-petaluma.js',
    Leland: './vexflow-font-leland.js',
    Custom: './vexflow-font-custom.js',
};
Flow.fetchMusicFont = (fontName, fontModuleOrPath) => __awaiter(void 0, void 0, void 0, function* () {
    const font = Font.load(fontName);
    if (font.hasData()) {
        return;
    }
    if (!fontModuleOrPath) {
        if (fontName in fontModules) {
            fontModuleOrPath = fontModules[fontName];
        }
        else {
            throw new RuntimeError('UnknownFont', `Music font ${fontName} does not exist.`);
        }
    }
    let fontModule;
    if (typeof fontModuleOrPath === 'string') {
        const module = yield import(fontModuleOrPath);
        const g = globalObject();
        const VexFlowFont = g['VexFlowFont'];
        if (typeof VexFlowFont !== 'undefined' && typeof VexFlowFont[fontName] !== 'undefined') {
            fontModule = VexFlowFont[fontName];
        }
        else {
            fontModule = module.Font;
        }
    }
    else {
        fontModule = fontModuleOrPath;
    }
    font.setData(fontModule.data);
    font.setMetrics(fontModule.metrics);
});
loadTextFonts();
export * from '../src/index.js';
export * as default from '../src/index.js';
