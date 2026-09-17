#!/usr/bin/env node
/**
 * Greendale "Study Room F" map generator (Community theme).
 *
 * Authors src/renderer/src/assets/maps/community.tmj. Instead of hand-placing
 * gids, it uses office.tmj as a STAMP SOURCE: furniture blocks (the conference
 * table, PC desk pod, plants, bin) and the whole right-hand third of the office
 * (break room + the two-desk side room) are copied tile-for-tile across all
 * five layers, so every piece of art and its collision stays consistent with
 * the LimeZu tiles the app already ships. Re-run after a layout tweak:
 *   node tools/gen-community-map.cjs
 *
 * Layout (34x22, same footprint as the office so the camera fit is unchanged):
 *   x1..23  Study Room F  - the big table in the middle (8 chairs + the
 *                           armchair at the head = desk-ceo), a row of library
 *                           computer carrels along the north wall and another
 *                           along the south wall, an open "stacks" strip used
 *                           as overflow seating (boardroom zone).
 *   x24..33 copied office - cafeteria (coffee economy, cafe seats) and the
 *                           Dean's office (two desks) above it. Coordinates are
 *                           identical to office.tmj, so the coffee/fridge/shelf
 *                           anchors in the theme config carry over verbatim.
 *
 * A flood-fill validator asserts every seat / stand / anchor is reachable from
 * the entrance before anything is written; on failure it exits 1 and writes
 * nothing, so a broken layout can never land in the repo.
 */
const fs = require('fs');
const path = require('path');

const MAPS = path.join(__dirname, '..', 'src', 'renderer', 'src', 'assets', 'maps');
const SRC = path.join(MAPS, 'office.tmj');
const OUT = path.join(MAPS, 'community.tmj');

// ── load the stamp source ────────────────────────────────────────────────────
let office;
try {
  office = JSON.parse(fs.readFileSync(SRC, 'utf8'));
} catch (err) {
  console.error(`Cannot read stamp source ${SRC}: ${err.message}`);
  process.exit(1);
}
const W = office.width, H = office.height, TS = office.tilewidth;
if (W !== 34 || H !== 22) {
  console.error(`office.tmj is ${W}x${H}, expected 34x22 - the stamp coordinates below would be wrong.`);
  process.exit(1);
}
const LAYER_NAMES = { floor: 'floor', walls: 'walls', below: 'furniture-below', above: 'furniture-above', coll: 'collision' };
const S = {}; // source layers
for (const [k, name] of Object.entries(LAYER_NAMES)) {
  const layer = office.layers.find((l) => l.name === name);
  if (!layer || !Array.isArray(layer.data)) {
    console.error(`office.tmj has no tile layer '${name}'`);
    process.exit(1);
  }
  S[k] = layer.data;
}

// ── destination buffers + helpers ────────────────────────────────────────────
const mk = () => new Array(W * H).fill(0);
const L = { floor: mk(), walls: mk(), below: mk(), above: mk(), coll: mk() };
const KEYS = Object.keys(L);
const idx = (x, y) => y * W + x;
const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const set = (layer, x, y, gid) => { if (inb(x, y)) L[layer][idx(x, y)] = gid; };
/** Copy a source rectangle (all layers, or a subset) to a destination origin. */
function copyRegion(sx0, sy0, sx1, sy1, dx0, dy0, layers = KEYS) {
  for (let y = sy0; y <= sy1; y++) {
    for (let x = sx0; x <= sx1; x++) {
      for (const k of layers) set(k, dx0 + (x - sx0), dy0 + (y - sy0), S[k][idx(x, y)]);
    }
  }
}
const floorGid = (x, y) => (y % 2 === 0) ? (x % 2 === 0 ? 800 : 799) : (x % 2 === 0 ? 784 : 783);

// ── 1. shell: north wall band, side walls, south wall ────────────────────────
copyRegion(0, 0, W - 1, 2, 0, 0, ['walls', 'coll']);           // 3-row north wall
for (let y = 3; y <= 20; y++) { set('walls', 0, y, 530); set('coll', 0, y, 1); }
for (let x = 0; x < W; x++) { set('walls', x, 21, S.walls[idx(x, 21)]); set('coll', x, 21, 1); }
for (let y = 3; y <= 20; y++) for (let x = 1; x <= 23; x++) set('floor', x, y, floorGid(x, y));

// ── 2. right-hand third: cafeteria + Dean's office, copied verbatim ──────────
copyRegion(24, 3, 33, 21, 24, 3);
copyRegion(24, 0, 33, 2, 24, 0, ['below', 'above']);            // dispenser top
// Column 24 above the cafeteria wall is open floor in the office but carries the
// tail of an office desk - clear it so the study room gets a clean alcove.
for (let y = 3; y <= 10; y++) { for (const k of ['below', 'above', 'coll']) set(k, 24, y, 0); set('floor', 24, y, floorGid(24, y)); }

// ── 3. entrance (south door, same tile as the office) ────────────────────────
const ENTRANCE = { x: 16, y: 20 };
set('walls', 16, 21, 0); set('coll', 16, 21, 0);

// ── 4. north-wall dressing: clock + windows ──────────────────────────────────
set('above', 1, 2, 370);                                          // wall clock tile
for (const wx of [2, 8, 20]) { set('above', wx, 2, 343); set('above', wx + 1, 2, 344); }

// ── 5. the study table (office conference table x10..16,y3..6 -> x9..15,y10..13)
const TABLE = { x: 9, y: 10 };
copyRegion(10, 3, 16, 6, TABLE.x, TABLE.y, ['below', 'above', 'coll']);
// Chairs become real seats: clear their collision so agents can sit on them.
const TABLE_SEATS = {};
let n = 1;
for (const cy of [TABLE.y, TABLE.y + 3]) {
  for (let cx = TABLE.x + 1; cx <= TABLE.x + 4; cx++) {
    TABLE_SEATS[`desk-table-${n++}`] = { x: cx, y: cy };
    set('coll', cx, cy, 0);
  }
}
// Head of the table: the armchair (2 tiles tall). The upper tile is the seat;
// the lower tile stays solid, so facingForSeat() resolves to 'down' and the
// orchestrator faces the room.
const HEAD_SEAT = { x: TABLE.x + 6, y: TABLE.y + 1 };
set('coll', HEAD_SEAT.x, HEAD_SEAT.y, 0);

// ── 6. computer carrels (PC desk pod copied from office pc-1 @ seat 2,13) ────
function stampDesk(sx, sy) {
  // pod footprint around the seat: x-1..x+1, y-2..y+1
  copyRegion(1, 11, 3, 14, sx - 1, sy - 2, ['below', 'above', 'coll']);
  set('coll', sx - 1, sy - 2, 0); // source tile is a partition wall in the office, not desk
  set('coll', sx, sy, 0);
}
const PCS = {
  'pc-1': { x: 6, y: 5 }, 'pc-2': { x: 10, y: 5 }, 'pc-3': { x: 14, y: 5 }, 'pc-4': { x: 18, y: 5 }, 'pc-5': { x: 22, y: 5 },
  'pc-6': { x: 3, y: 18 }, 'pc-7': { x: 7, y: 18 }, 'pc-8': { x: 11, y: 18 }, 'pc-9': { x: 21, y: 18 },
};
for (const s of Object.values(PCS)) stampDesk(s.x, s.y);

// ── 7. props: floor plants + bin by the door ─────────────────────────────────
set('below', 1, 20, 470); set('coll', 1, 20, 1);
set('below', 23, 20, 471); set('coll', 23, 20, 1);
set('below', 17, 20, 297); set('above', 17, 19, 281); set('coll', 17, 20, 1);

// ── 8. spawn points + zones ──────────────────────────────────────────────────
const SEATS = {
  'desk-ceo': HEAD_SEAT,
  ...TABLE_SEATS,
  ...PCS,
  'desk-dean': { x: 27, y: 5 },   // copied office desks in the side room
  'desk-chang': { x: 30, y: 5 },
};
const CAFE = {
  'cafe-seat-1': { x: 27, y: 14 }, 'cafe-seat-2': { x: 27, y: 16 },
  'cafe-seat-3': { x: 28, y: 14 }, 'cafe-seat-4': { x: 28, y: 16 },
  'cafe-stand-coffee': { x: 26, y: 20 }, 'cafe-stand-vending': { x: 29, y: 13 },
};
// Tiles the theme config stands agents on (must stay reachable). Mirrors
// COMMUNITY_THEME in themeRegistry.ts - keep the two in sync.
const STANDS = {
  'coffee:trayStand': { x: 29, y: 16 }, 'coffee:machineStand': { x: 26, y: 20 }, 'coffee:sinkStand': { x: 28, y: 20 },
  'errand:plant-sw': { x: 2, y: 20 }, 'errand:plant-se': { x: 22, y: 20 }, 'errand:plant-cafe': { x: 30, y: 20 },
  'errand:table-plant': { x: 8, y: 12 }, 'errand:smoke': { x: 2, y: 3 },
  'errand:window-1': { x: 8, y: 3 }, 'errand:window-2': { x: 20, y: 3 },
  'errand:dispenser': { x: 32, y: 4 }, 'errand:fridge': { x: 29, y: 20 },
  'errand:bin-door': { x: 18, y: 20 }, 'errand:bin-cafe': { x: 31, y: 16 },
};

let oid = 1;
const spawnObjs = [];
const addSpawn = (name, t) => spawnObjs.push({ id: oid++, name, point: true, x: t.x * TS, y: t.y * TS, width: 0, height: 0, rotation: 0, type: '', visible: true });
for (const [name, t] of Object.entries(SEATS)) addSpawn(name, t);
for (const [name, t] of Object.entries(CAFE)) addSpawn(name, t);
addSpawn('entrance', ENTRANCE);

const zoneObjs = [];
const addZone = (name, x, y, w, h) => zoneObjs.push({ id: oid++, name, x: x * TS, y: y * TS, width: w * TS, height: h * TS, rotation: 0, type: '', visible: true });
addZone('boardroom', 17, 9, 6, 5);                      // the stacks: overflow seating
const srcCafe = office.layers.find((l) => l.name === 'zones')?.objects.find((o) => o.name === 'cafeteria');
if (!srcCafe) { console.error("office.tmj has no 'cafeteria' zone to copy"); process.exit(1); }
zoneObjs.push({ ...srcCafe, id: oid++ });

// ── 9. validate reachability ─────────────────────────────────────────────────
const walk = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => L.coll[idx(x, y)] === 0 && L.floor[idx(x, y)] !== 0));
const forceWalk = (t) => { if (inb(t.x, t.y)) walk[t.y][t.x] = true; };
Object.values(SEATS).forEach(forceWalk);
forceWalk(ENTRANCE);
const seen = Array.from({ length: H }, () => Array(W).fill(false));
const q = [[ENTRANCE.x, ENTRANCE.y]]; seen[ENTRANCE.y][ENTRANCE.x] = true;
while (q.length) {
  const [x, y] = q.shift();
  for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
    if (inb(nx, ny) && !seen[ny][nx] && walk[ny][nx]) { seen[ny][nx] = true; q.push([nx, ny]); }
  }
}
const targets = [...Object.entries(SEATS), ...Object.entries(CAFE), ...Object.entries(STANDS)];
const unreachable = targets.filter(([, t]) => !(inb(t.x, t.y) && seen[t.y][t.x])).map(([name]) => name);
if (unreachable.length) {
  console.error('VALIDATION FAILED - unreachable from the entrance: ' + unreachable.join(', '));
  process.exit(1);
}

// ── 10. write ────────────────────────────────────────────────────────────────
const tileLayer = (name, data, id) => ({ id, name, type: 'tilelayer', data, width: W, height: H, x: 0, y: 0, opacity: 1, visible: true });
const map = {
  compressionlevel: -1, infinite: false, orientation: 'orthogonal', renderorder: 'right-down',
  width: W, height: H, tilewidth: TS, tileheight: TS, nextlayerid: 99, nextobjectid: oid, version: '1.10', tiledversion: '1.10.2', type: 'map',
  tilesets: office.tilesets, // same refs + order as office.tmj (theme loader patches a5/interiors)
  layers: [
    tileLayer('floor', L.floor, 1), tileLayer('walls', L.walls, 2),
    tileLayer('furniture-below', L.below, 3), tileLayer('furniture-above', L.above, 4),
    tileLayer('collision', L.coll, 5),
    { id: 6, name: 'spawn-points', type: 'objectgroup', objects: spawnObjs, draworder: 'topdown', opacity: 1, visible: true, x: 0, y: 0 },
    { id: 7, name: 'zones', type: 'objectgroup', objects: zoneObjs, draworder: 'topdown', opacity: 1, visible: true, x: 0, y: 0 },
  ],
};
try {
  fs.writeFileSync(OUT, JSON.stringify(map));
} catch (err) {
  console.error(`Failed to write ${OUT}: ${err.message}`);
  process.exit(1);
}
console.log(`OK wrote ${path.relative(path.join(__dirname, '..'), OUT)} - ${W}x${H}, ${Object.keys(SEATS).length} seats (1 head + 8 table + ${Object.keys(PCS).length} carrels + 2 side room)`);
console.log('   validation: every seat / stand / errand tile reachable from the entrance');
