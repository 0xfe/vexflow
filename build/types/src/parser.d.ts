export type Match = string | Match[] | null;
export type RuleFunction = () => Rule;
export type TriggerFunction = (state?: {
    matches: Match[];
}) => void;
export interface Rule {
    token?: string;
    noSpace?: boolean;
    expect?: RuleFunction[];
    zeroOrMore?: boolean;
    oneOrMore?: boolean;
    maybe?: boolean;
    or?: boolean;
    run?: TriggerFunction;
}
export interface Result {
    success: boolean;
    pos?: number;
    incrementPos?: number;
    matchedString?: string;
    matches?: Match[];
    numMatches?: number;
    results?: GroupedResults;
    errorPos?: number;
}
export type GroupedResults = (Result | Result[])[];
export interface Grammar {
    begin(): RuleFunction;
}
export declare class Parser {
    static DEBUG: boolean;
    protected grammar: Grammar;
    protected line: string;
    protected pos: number;
    protected errorPos: number;
    constructor(grammar: Grammar);
    parse(line: string): Result;
    matchFail(returnPos: number): void;
    matchSuccess(): void;
    matchToken(token: string, noSpace?: boolean): Result;
    expectOne(rule: Rule, maybe?: boolean): Result;
    expectOneOrMore(rule: Rule, maybe?: boolean): Result;
    expectZeroOrMore(rule: Rule): Result;
    expect(ruleFunc: RuleFunction): Result;
}
