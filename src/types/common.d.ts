export interface MusicAccidental {
  note: number;
  accidental: number;
}

export interface MusicNoteParts {
  root: string;
  accidental: string;
  type?: string;
}

/** Range 0 - 11 */
export type KeyValue = number;
/** Range 0 - 6 */
export type RootValue = number;
/** Range -2 to +2 */
export type AccidentalValue = number;

export interface Key {
  root_index: RootValue;
  int_val: KeyValue;
}
