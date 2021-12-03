import { Font } from '../font';
import { Petaluma } from './petaluma';

export function loadPetaluma() {
  Font.load('Petaluma', Petaluma.data, Petaluma.metrics);
}
