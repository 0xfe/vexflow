import { FontDataMetrics } from '../font';
export async function loadBravura(fontDataMetrics: FontDataMetrics) {
  const _ = await import(/* webpackChunkName: "bravura" */ '../fonts/bravura');
  fontDataMetrics.fontData = _.default.fontData;
  fontDataMetrics.metrics = _.default.metrics;
}

export async function loadCustom(fontDataMetrics: FontDataMetrics) {
  const _ = await import(/* webpackChunkName: "custom" */ '../fonts/custom');
  fontDataMetrics.fontData = _.default.fontData;
  fontDataMetrics.metrics = _.default.metrics;
}

export async function loadGonville(fontDataMetrics: FontDataMetrics) {
  const _ = await import(/* webpackChunkName: "gonville" */ '../fonts/gonville');
  fontDataMetrics.fontData = _.default.fontData;
  fontDataMetrics.metrics = _.default.metrics;
}

export async function loadPetaluma(fontDataMetrics: FontDataMetrics) {
  const _ = await import(/* webpackChunkName: "petaluma" */ '../fonts/petaluma');
  fontDataMetrics.fontData = _.default.fontData;
  fontDataMetrics.metrics = _.default.metrics;
}
