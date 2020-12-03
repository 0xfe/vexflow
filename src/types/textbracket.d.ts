import {Note} from "../note";

export interface ITextBracketParams {
  start: Note;
  stop: Note;
  text: string;
  superscript: string;
  position: number;
}
