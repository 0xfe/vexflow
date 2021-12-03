import { Font } from '../font';
import { Bravura } from './bravura';

export function loadBravura() {
  Font.load('Bravura', Bravura.data, Bravura.metrics);
}
