import { Font } from '../font';
import { Custom } from './custom';

export function loadCustom() {
  Font.load('Custom', Custom.data, Custom.metrics);
}
