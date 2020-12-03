import {StaveNote} from "../stavenote";
import {Dot} from "../dot";
import {FretHandFinger} from "../frethandfinger";
import {Accidental} from "../accidental";
import {Stroke} from "../strokes";
import {GraceNoteGroup} from "../gracenotegroup";
import {NoteSubGroup} from "../notesubgroup";
import {StringNumber} from "../stringnumber";
import {Articulation} from "../articulation";
import {Ornament} from "../ornament";
import {Annotation} from "../annotation";
import {ChordSymbol} from "../chordsymbol";
import {Bend} from "../bend";
import {Vibrato} from "../vibrato";

export interface IModifierContextMetrics {
  width: number;
  spacing: number;
}

export type PreformatModifierType = typeof StaveNote |
  typeof Dot |
  typeof FretHandFinger |
  typeof Accidental |
  typeof Stroke |
  typeof GraceNoteGroup |
  typeof NoteSubGroup |
  typeof StringNumber |
  typeof Articulation |
  typeof Ornament |
  typeof Annotation |
  typeof ChordSymbol |
  typeof Bend |
  typeof Vibrato;

export type PostformatModifierType = typeof StaveNote;

export type ModifierClass = StaveNote |
  Dot |
  FretHandFinger |
  Accidental |
  Stroke |
  GraceNoteGroup |
  NoteSubGroup |
  StringNumber |
  Articulation |
  Ornament |
  Annotation |
  ChordSymbol |
  Bend |
  Vibrato;
