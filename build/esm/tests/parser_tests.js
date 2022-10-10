import { VexFlowTests } from './vexflow_test_helpers.js';
import { Parser } from '../src/parser.js';
const ParserTests = {
    Start() {
        QUnit.module('Parser');
        test('Basic', basic);
        test('Advanced', advanced);
        test('Mixed', mixed);
        test('Micro Score', microscore);
    },
};
class TestGrammar {
    begin() {
        return () => ({ expect: this.expect });
    }
    BIGORLITTLE() {
        return { expect: [this.BIGLINE, this.LITTLELINE], or: true };
    }
    BIGLINE() {
        return { expect: [this.LBRACE, this.WORD, this.WORDS, this.MAYBEEXCLAIM, this.RBRACE] };
    }
    LITTLELINE() {
        return { expect: [this.WORD, this.WORDS] };
    }
    WORDS() {
        return { expect: [this.COMMA, this.WORD], zeroOrMore: true };
    }
    MAYBEEXCLAIM() {
        return { expect: [this.EXCLAIM], maybe: true };
    }
    LBRACE() {
        return { token: '[{]' };
    }
    RBRACE() {
        return { token: '[}]' };
    }
    WORD() {
        return { token: '[a-zA-Z]+' };
    }
    COMMA() {
        return { token: '[,]' };
    }
    EXCLAIM() {
        return { token: '[!]' };
    }
    EOL() {
        return { token: '$' };
    }
}
class MicroScoreGrammar {
    constructor() {
        this.ITEM = () => ({ expect: [this.PIANO_KEY_NUMBER, this.CHORD], or: true });
        this.MAYBE_MORE_ITEMS = () => ({ expect: [this.ITEM], zeroOrMore: true });
        this.PIANO_KEY_NUMBER = () => ({ expect: [this.NUM], oneOrMore: true });
        this.CHORD = () => ({ expect: [this.LEFT_BRACKET, this.PIANO_KEY_NUMBER, this.MORE_CHORD_PARTS, this.RIGHT_BRACKET] });
        this.MORE_CHORD_PARTS = () => ({ expect: [this.PERIOD, this.PIANO_KEY_NUMBER], oneOrMore: true });
        this.NUM = () => ({ token: '\\d+' });
        this.WHITESPACE = () => ({ token: '\\s+' });
        this.PERIOD = () => ({ token: '\\.' });
        this.LEFT_BRACKET = () => ({ token: '\\[' });
        this.RIGHT_BRACKET = () => ({ token: '\\]' });
        this.EOL = () => ({ token: '$' });
    }
    begin() {
        return () => ({ expect: [this.ITEM, this.MAYBE_MORE_ITEMS, this.EOL] });
    }
}
function fails(result, expectedErrorPos, msg) {
    notOk(result.success, msg);
    equal(result.errorPos, expectedErrorPos, msg);
}
function basic() {
    const grammar = new TestGrammar();
    grammar.expect = [grammar.LITTLELINE, grammar.EOL];
    const parser = new Parser(grammar);
    const mustPass = ['first, second', 'first,second', 'first', 'first,second, third'];
    mustPass.forEach((line) => equal(parser.parse(line).success, true, line));
    fails(parser.parse(''), 0);
    fails(parser.parse('first second'), 6);
    fails(parser.parse('first,,'), 5);
    fails(parser.parse('first,'), 5);
    fails(parser.parse(',,'), 0);
}
function advanced() {
    const grammar = new TestGrammar();
    grammar.expect = [grammar.BIGLINE, grammar.EOL];
    const parser = new Parser(grammar);
    const mustPass = ['{first}', '{first!}', '{first,second}', '{first,second!}', '{first,second,third!}'];
    mustPass.forEach((line) => equal(parser.parse(line).success, true, line));
    fails(parser.parse('{first,second,third,}'), 19);
    fails(parser.parse('first,second,third'), 0);
    fails(parser.parse('{first,second,third'), 19);
    fails(parser.parse('{!}'), 1);
}
function mixed() {
    const grammar = new TestGrammar();
    grammar.expect = [grammar.BIGORLITTLE, grammar.EOL];
    const parser = new Parser(grammar);
    const mustPass = ['{first,second,third!}', 'first, second'];
    mustPass.forEach((line) => equal(parser.parse(line).success, true, line));
    fails(parser.parse('first second'), 6);
}
function microscore() {
    const grammar = new MicroScoreGrammar();
    const parser = new Parser(grammar);
    const mustPass = [
        '40 42 44 45 47 49 51 52',
        '[40.44.47] [45.49.52] [47.51.54] [49.52.56]',
        '40 [40.44.47] 45 47 [44.47.51]',
    ];
    mustPass.forEach((line) => {
        var _a;
        const result = parser.parse(line);
        equal(result.success, true, line);
        equal((_a = result.matches) === null || _a === void 0 ? void 0 : _a.length, 3, line);
    });
    fails(parser.parse('40 42 44 45 47 49 5A 52'), 19);
    fails(parser.parse('40.44.47] [45.49.52] [47.51.54] [49.52.56]'), 2);
    fails(parser.parse('40 [40] 45 47 [44.47.51]'), 3);
}
VexFlowTests.register(ParserTests);
export { ParserTests };
