import Bravura from '../fonts/bravura';
import Gonville from '../fonts/gonville';
import Petaluma from '../fonts/petaluma';
import Custom from '../fonts/custom';
import { FontDataMetrics } from '../font';

export function loadBravura(fontDataMetrics: FontDataMetrics) {
  fontDataMetrics.fontData = Bravura.fontData;
  fontDataMetrics.metrics = Bravura.metrics;
}

export function loadGonville(fontDataMetrics: FontDataMetrics) {
  fontDataMetrics.fontData = Gonville.fontData;
  fontDataMetrics.metrics = Gonville.metrics;
}

export function loadPetaluma(fontDataMetrics: FontDataMetrics) {
  fontDataMetrics.fontData = Petaluma.fontData;
  fontDataMetrics.metrics = Petaluma.metrics;
}

export function loadCustom(fontDataMetrics: FontDataMetrics) {
  fontDataMetrics.fontData = Custom.fontData;
  fontDataMetrics.metrics = Custom.metrics;
}
