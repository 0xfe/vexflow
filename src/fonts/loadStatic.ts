import Bravura from '../fonts/bravura';
import Gonville from '../fonts/gonville';
import Petaluma from '../fonts/petaluma';
import Custom from '../fonts/custom';
import { FontData } from '../font';

// eslint-disable-next-line
export async function loadBravura(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  return Bravura;
}

// eslint-disable-next-line
export async function loadGonville(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  return Gonville;
}

// eslint-disable-next-line
export async function loadPetaluma(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  return Petaluma;
}

// eslint-disable-next-line
export async function loadCustom(): Promise<{ metrics: Record<string, any>; fontData: FontData }> {
  return Custom;
}
