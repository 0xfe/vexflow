import { Font } from '../font';
import { Gonville } from './gonville';

export function loadGonville() {
  Font.load('Gonville', Gonville.data, Gonville.metrics);
}
