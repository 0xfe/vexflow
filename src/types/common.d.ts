export interface NoteAccidental {
  note: number;
  accidental: AccidentalValue;
}

export interface NoteParts {
  root: string;
  accidental: string;
  type?: string;
}

export type KeyValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type RootValue = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type AccidentalValue = -2 | -1 | 0 | 1 | 2;

export interface Key {
  root_index: RootValue;
  int_val: KeyValue;
}
