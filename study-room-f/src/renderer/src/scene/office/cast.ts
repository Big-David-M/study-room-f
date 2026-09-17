// The Greendale cast (Community re-skin) — roster metadata + sprite frames.
//
// Both the static portraits (cards / picker) and the in-scene walking sprites are
// now fully custom-drawn from the same per-character recipes in portraitArt.ts:
// the scene sprite reuses the portrait's exact head/face/clothing and adds legs,
// so an agent on the office floor looks identical to its card. The LimeZu base
// sheets are no longer used for the cast. See assets/ATTRIBUTION.md.

import { Texture } from 'pixi.js';
import { paintPortrait, sceneFrameBufs, SCENE_W, SCENE_H } from './portraitArt';

/** Greendale roster ids. The type keeps its upstream name (OfficeCharacterName)
 *  so the rest of the app - and future upstream merges - need no renames. */
export type OfficeCharacterName =
  | 'jeff' | 'britta' | 'abed' | 'troy' | 'annie' | 'shirley' | 'pierce'
  | 'dean' | 'chang' | 'duncan' | 'hickey' | 'frankie' | 'elroy'
  | 'magnitude' | 'starburns' | 'leonard' | 'garrett';

export interface CastMember {
  name: OfficeCharacterName;
  displayName: string;
  /** Signature accent color (hex) — used for the in-scene selection glow. */
  shirt: string;
  /** Blurb shown when this character is picked / has no description yet. */
  blurb: string;
}

/** Selectable roster, in display order: the study group first, then faculty,
 *  then the rest of campus. */
export const OFFICE_CAST: CastMember[] = [
  { name: 'jeff',      displayName: 'Jeff',      shirt: '#33486b', blurb: 'Ex-lawyer, gives the speeches' },
  { name: 'britta',    displayName: 'Britta',    shirt: '#6b4a8c', blurb: 'Activist, psych major' },
  { name: 'abed',      displayName: 'Abed',      shirt: '#3f8f86', blurb: 'Film student, sees the pattern' },
  { name: 'troy',      displayName: 'Troy',      shirt: '#4a4f5c', blurb: 'Ex-quarterback, A/C prodigy' },
  { name: 'annie',     displayName: 'Annie',     shirt: '#c0504d', blurb: 'Overachiever, owns the binder' },
  { name: 'shirley',   displayName: 'Shirley',   shirt: '#8e4a9e', blurb: 'Baker, sandwich entrepreneur' },
  { name: 'pierce',    displayName: 'Pierce',    shirt: '#9c3b3b', blurb: 'Moist-towelette heir' },
  { name: 'dean',      displayName: 'The Dean',  shirt: '#5f8fc4', blurb: 'Dean of Greendale, has an announcement' },
  { name: 'chang',     displayName: 'Chang',     shirt: '#b8a13e', blurb: 'Former Spanish teacher' },
  { name: 'duncan',    displayName: 'Duncan',    shirt: '#7a6a4b', blurb: 'Psychology professor' },
  { name: 'hickey',    displayName: 'Hickey',    shirt: '#5c6b5a', blurb: 'Criminology, draws ducks' },
  { name: 'frankie',   displayName: 'Frankie',   shirt: '#4b6b7a', blurb: 'Consultant, keeps it on schedule' },
  { name: 'elroy',     displayName: 'Elroy',     shirt: '#7a5a3a', blurb: 'VR pioneer, IT' },
  { name: 'magnitude', displayName: 'Magnitude', shirt: '#d9a93a', blurb: 'One-man party' },
  { name: 'starburns', displayName: 'Star-Burns', shirt: '#3a3a44', blurb: 'His name is Alex' },
  { name: 'leonard',   displayName: 'Leonard',   shirt: '#8c8c7a', blurb: 'Oldest student on campus' },
  { name: 'garrett',   displayName: 'Garrett',   shirt: '#6f9a5a', blurb: 'Perpetually in crisis' },
];

export const CAST_BY_NAME: Record<OfficeCharacterName, CastMember> =
  Object.fromEntries(OFFICE_CAST.map((c) => [c.name, c])) as Record<OfficeCharacterName, CastMember>;

export const DEFAULT_CHARACTER: OfficeCharacterName = 'abed';

export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

// ─── scene frames ────────────────────────────────────────────────────────────
const frameCache = new Map<OfficeCharacterName, Texture[][]>();

function bufToTexture(buf: Uint8ClampedArray): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_W; canvas.height = SCENE_H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(SCENE_W, SCENE_H);
  img.data.set(buf);
  ctx.putImageData(img, 0, 0);
  const tex = Texture.from(canvas);
  tex.source.scaleMode = 'nearest';
  return tex;
}

/**
 * Frame grid CharacterSprite expects: 3 rows (down, up, right) × 7 frames
 * [walk1, walk2, walk3, type1, type2, read1, read2]. We provide a front view
 * (down — and reused for the side row, so left/right walkers still show a face)
 * and a back view (up — agents seated facing their desk show their back). The
 * three walk frames are stand / step-left / step-right.
 */
export async function getCastFrames(name: OfficeCharacterName): Promise<Texture[][]> {
  const cached = frameCache.get(name);
  if (cached) return cached;
  const { front, back } = sceneFrameBufs(name);
  const toRow = (bufs: Uint8ClampedArray[]): Texture[] => {
    const [stand, stepL, stepR] = bufs.map(bufToTexture);
    return [stand, stepL, stepR, stand, stand, stand, stand];
  };
  const frontRow = toRow(front);
  const frames: Texture[][] = [frontRow, toRow(back), frontRow]; // down, up, right
  frameCache.set(name, frames);
  return frames;
}

/**
 * Paint a character's static portrait for cards / the picker (delegates to the
 * custom procedural composer in portraitArt.ts).
 */
export async function paintCastPortrait(
  ctx: CanvasRenderingContext2D,
  name: OfficeCharacterName,
  scale = 2,
): Promise<void> {
  paintPortrait(ctx, name, scale);
}
