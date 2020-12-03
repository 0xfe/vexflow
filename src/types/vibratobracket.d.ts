import {Note} from "../note";

export interface IVibratoBracketData {
  stop: Note;
  start: Note;
}

export interface IVibratoBracketRenderOptions {
  vibrato_width: number;
  wave_height: number;
  wave_girth: number;
  harsh: boolean;
  wave_width: number
}
