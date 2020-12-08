export interface IElementAttributes {
  [name: string]: any;
  id: string;
  el: SVGSVGElement;
  type: string;
  classes: Record<string, boolean>
}
