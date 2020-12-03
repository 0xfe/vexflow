import {Builder} from "../easyscore";
import {Factory} from "../factory";
import {ICommitHook, IState} from "./common";

export interface IEasyScoreOptions {
  throwOnError: boolean;
  commitHooks: ICommitHook[];
  builder: Builder;
  factory: Factory;
}

export interface IEasyScoreDefaults {
  clef: string;
  time: string;
  stem: string
}

export interface IGrammarVal {
  noSpace: boolean;
  token: string;
  or: boolean;
  expect: (() => IGrammarVal)[];
  run: (state?: IState) => void;
  zeroOrMore: boolean;
  maybe: boolean;
  oneOrMore: boolean;
  bind: <T>(a: T) => T;
}
