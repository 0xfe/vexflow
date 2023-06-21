import { log, RuntimeError } from './util.js';
function L(...args) {
    if (Parser.DEBUG)
        log('Vex.Flow.Parser', args);
}
const NO_ERROR_POS = -1;
function flattenMatches(r) {
    if ('matchedString' in r)
        return r.matchedString;
    if ('results' in r)
        return flattenMatches(r.results);
    const results = r;
    if (results.length === 1)
        return flattenMatches(results[0]);
    if (results.length === 0)
        return null;
    return results.map(flattenMatches);
}
class Parser {
    constructor(grammar) {
        this.grammar = grammar;
        this.line = '';
        this.pos = 0;
        this.errorPos = NO_ERROR_POS;
    }
    parse(line) {
        this.line = line;
        this.pos = 0;
        this.errorPos = NO_ERROR_POS;
        const result = this.expect(this.grammar.begin());
        result.errorPos = this.errorPos;
        return result;
    }
    matchFail(returnPos) {
        if (this.errorPos === NO_ERROR_POS)
            this.errorPos = this.pos;
        this.pos = returnPos;
    }
    matchSuccess() {
        this.errorPos = NO_ERROR_POS;
    }
    matchToken(token, noSpace = false) {
        const regexp = noSpace ? new RegExp('^((' + token + '))') : new RegExp('^((' + token + ')\\s*)');
        const workingLine = this.line.slice(this.pos);
        const result = workingLine.match(regexp);
        if (result !== null) {
            return {
                success: true,
                matchedString: result[2],
                incrementPos: result[1].length,
                pos: this.pos,
            };
        }
        else {
            return { success: false, pos: this.pos };
        }
    }
    expectOne(rule, maybe = false) {
        const results = [];
        const pos = this.pos;
        let allMatches = true;
        let oneMatch = false;
        maybe = maybe === true || rule.maybe === true;
        if (rule.expect) {
            for (const next of rule.expect) {
                const localPos = this.pos;
                const result = this.expect(next);
                if (result.success) {
                    results.push(result);
                    oneMatch = true;
                    if (rule.or)
                        break;
                }
                else {
                    allMatches = false;
                    if (!rule.or) {
                        this.pos = localPos;
                        break;
                    }
                }
            }
        }
        const gotOne = (rule.or && oneMatch) || allMatches;
        const success = gotOne || maybe === true;
        const numMatches = gotOne ? 1 : 0;
        if (maybe && !gotOne)
            this.pos = pos;
        if (success) {
            this.matchSuccess();
        }
        else {
            this.matchFail(pos);
        }
        return { success, results, numMatches };
    }
    expectOneOrMore(rule, maybe = false) {
        const results = [];
        const pos = this.pos;
        let numMatches = 0;
        let more = true;
        do {
            const result = this.expectOne(rule);
            if (result.success && result.results) {
                numMatches++;
                results.push(result.results);
            }
            else {
                more = false;
            }
        } while (more);
        const success = numMatches > 0 || maybe === true;
        if (maybe && !(numMatches > 0))
            this.pos = pos;
        if (success) {
            this.matchSuccess();
        }
        else {
            this.matchFail(pos);
        }
        return { success, results, numMatches };
    }
    expectZeroOrMore(rule) {
        return this.expectOneOrMore(rule, true);
    }
    expect(ruleFunc) {
        L('Evaluating rule function:', ruleFunc);
        if (!ruleFunc) {
            throw new RuntimeError('Invalid rule function');
        }
        let result;
        const rule = ruleFunc.bind(this.grammar)();
        if (rule.token) {
            result = this.matchToken(rule.token, rule.noSpace === true);
            if (result.success) {
                this.pos += result.incrementPos;
            }
        }
        else if (rule.expect) {
            if (rule.oneOrMore) {
                result = this.expectOneOrMore(rule);
            }
            else if (rule.zeroOrMore) {
                result = this.expectZeroOrMore(rule);
            }
            else {
                result = this.expectOne(rule);
            }
        }
        else {
            L(rule);
            throw new RuntimeError('Bad grammar! No `token` or `expect` property ' + rule);
        }
        const matches = [];
        result.matches = matches;
        if (result.results) {
            result.results.forEach((r) => matches.push(flattenMatches(r)));
        }
        if (rule.run && result.success) {
            rule.run({ matches });
        }
        return result;
    }
}
Parser.DEBUG = false;
export { Parser };
