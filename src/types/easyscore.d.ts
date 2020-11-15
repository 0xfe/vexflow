import {Builder} from "../easyscore";
import {Factory} from "../factory";
import {ICommitHook} from "./common";

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
