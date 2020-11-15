export interface IAnnotationState {
  matches: any[];
  right_shift: number;
  left_shift: number;
  text_line: number;
  top_text_line: number;
}

export interface IAnnotation {
  code: string;
  line: number;
  x_shift: number;
  point: number
}
