export interface IParserResult {
  matches: string[];
  errorPos: number;
  success: boolean;
  matchedString: string;
  numMatches: number;
  incrementPos: number;
  results: IParserResult[];
  pos: number;
}
