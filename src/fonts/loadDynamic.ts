import { FontData } from '../font';
export async function loadBravura(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  const _ = await import(/* webpackChunkName: "bravura" */ '../fonts/bravura');
  return _.default;
}

export async function loadCustom(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  const _ = await import(/* webpackChunkName: "custom" */ '../fonts/custom');
  return _.default;
}

export async function loadGonville(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  const _ = await import(/* webpackChunkName: "gonville" */ '../fonts/gonville');
  return _.default;
}

export async function loadPetaluma(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  const _ = await import(/* webpackChunkName: "petaluma" */ '../fonts/petaluma');
  return _.default;
}
