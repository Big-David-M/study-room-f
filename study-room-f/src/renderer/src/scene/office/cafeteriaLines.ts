// Cafeteria small-talk — Greendale edition.
//
// The cast are Greendale students and faculty (see cast.ts), so an agent's
// coffee break is an excuse for a one-liner in character. Two kinds of line:
//   • solo  — one quip shown above a single agent at a break spot
//   • pair  — a two-beat exchange between two agents at the same table
//
// Apart from a couple of two-word catchphrases, every line here is ORIGINAL
// writing in the spirit of each character, not dialogue lifted from the show. Lines are kept short so they fit the
// ThoughtBubble (≈MAX_WIDTH). Character keys match OfficeCharacterName; anyone
// without bespoke lines falls back to the shared pools so the floor never
// feels empty.

import type { OfficeCharacterName } from './cast';

/** Where an agent is lingering — picks a contextual line pool. */
export type BreakSpot = 'coffee' | 'vending' | 'snack' | 'table';

const pick = <T,>(arr: readonly T[], seed: number): T =>
  arr[((seed % arr.length) + arr.length) % arr.length];

// ─── solo lines, by spot ─────────────────────────────────────────────────────

const COFFEE: readonly string[] = [
  'cafeteria coffee: technically a liquid',
  'who labelled this pot "probably decaf"?',
  'third cup. the syllabus demands it.',
  'this mug says Human Being. go mascot.',
  'is the creamer… accredited?',
  'study fuel acquired',
];

const VENDING: readonly string[] = [
  'the machine ate my dollar. again.',
  'C3… please be the good chips',
  'it’s stuck. very Greendale.',
  'negotiating with a vending machine',
  'one emotional-support snack',
  'exact change is a social construct',
];

const SNACK: readonly string[] = [
  'are there chicken fingers today?',
  'who finished the sandwiches??',
  'just a little treat between classes',
  'is this communal? it is now.',
  'second lunch',
];

const TABLE: readonly string[] = [
  'this counts as studying',
  'five more minutes, then the diorama',
  'did anyone do the reading?',
  'pretending to highlight things',
  'I needed this break, honestly',
  'do NOT tell the group I’m in here',
];

const SPOT_POOL: Record<BreakSpot, readonly string[]> = {
  coffee: COFFEE, vending: VENDING, snack: SNACK, table: TABLE,
};

// ─── character flavour — overrides the generic pool when present ─────────────

const BY_CHARACTER: Partial<Record<OfficeCharacterName, readonly string[]>> = {
  jeff:      ['I can talk my way out of this task', 'checking my phone. it’s research.', 'a speech would fix this merge', 'I did not come here to try'],
  britta:    ['this coffee is not fair trade', 'I’m ruining it, aren’t I', 'someone should protest this fridge', 'I lived in New York, you know'],
  abed:      ['this is a bottle episode', 'we’re in the second act', 'cool. cool cool cool.', 'the break room is a classic set'],
  troy:      ['wait, there are snacks in here??', 'I fixed the A/C by looking at it', 'is crying at a build log normal?', 'me and Abed call dibs on this table'],
  annie:     ['I colour-coded the task board', 'who took my purple pen', 'there is a schedule, people', 'extra credit for finishing early'],
  shirley:   ['oh, that’s nice', 'I brought brownies for the sprint', 'somebody needs to pray on that code', 'my sandwiches would sell here'],
  pierce:    ['back in my day we compiled by hand', 'I own a towelette empire, you know', 'is this the smoking lounge?', 'nobody tells me about the meetings'],
  dean:      ['I have a DEAN-nouncement', 'just popping in. again.', 'new outfit for the quarterly review', 'Greendale pride, everyone!'],
  chang:     ['this break is CHANG-tastic', 'I was a teacher once. allegedly.', 'who left snacks unguarded?', 'I live in the vents now'],
  duncan:    ['purely academic interest in that snack', 'is it too early? asking as a doctor', 'I’ll analyse that later'],
  hickey:    ['I’m working on my duck comic', 'in my day the break was earned', 'don’t touch my drawings'],
  frankie:   ['this break is on the schedule', 'I made a spreadsheet for the snacks', 'let’s keep it to ten minutes'],
  elroy:     ['I built VR in the nineties', 'the network is fine. don’t touch it.', 'good coffee. I’ll allow it.'],
  magnitude: ['POP POP!', 'snack time! POP POP!'],
  starburns: ['my name is Alex', 'I can get you anything. for a price.', 'don’t look at the sideburns'],
  leonard:   ['I’ve reviewed this coffee. two stars.', 'shut up, vending machine', 'I’ve been a student since forever'],
  garrett:   ['CRISIS ALERT: we’re out of cups!', 'oh no oh no the build', 'is everything okay? it isn’t, is it'],
};

/** A solo break-room line. Character flavour ~60% of the time, else the line
 *  fits the spot the agent is standing at. `seed` keeps it deterministic per
 *  call site (avoids Math.random, which Pixi/Electron CSP-safe code prefers). */
export function pickSoloLine(character: OfficeCharacterName, spot: BreakSpot, seed: number): string {
  const flavour = BY_CHARACTER[character];
  if (flavour && seed % 5 < 3) return pick(flavour, Math.floor(seed / 5));
  return pick(SPOT_POOL[spot], seed);
}

// ─── paired exchanges (two agents at one table) ──────────────────────────────
//
// Each exchange is a list of beats that ALTERNATE between the two agents:
// beat[0] = the speaker who sat down, beat[1] = their table-mate, beat[2] =
// speaker again, and so on. The director plays them out one beat at a time.
// Lines are trimmed to fit the thought cloud; longer ones auto-truncate.

type Exchange = readonly string[];

// Generic banter — works between any two agents (they're all Greendale).
const PAIR_POOL: readonly Exchange[] = [
  ['did you do the reading?', 'there was reading?', '...we’re doomed.'],
  ['is this a study group or a friend group?', 'yes.'],
  ['the Dean’s back.', 'that’s the fourth time today.', 'new outfit though.'],
  ['we should make a diorama.', 'of what?', 'doesn’t matter. diorama.'],
  ['paintball’s coming.', 'it’s a rumour.', 'it’s always a rumour. until it isn’t.'],
  ['who’s leading this project?', 'whoever talks longest.', 'so, Jeff.'],
  ['this feels like a bottle episode.', 'we’re just on break.', 'that’s how they start.'],
  ['I lost my pen.', 'nobody leaves this room.', '...it’s a pen.'],
  ['is Greendale accredited?', 'mostly.', 'mostly?', 'don’t pull that thread.'],
  ['my task is blocked.', 'by what?', 'my feelings.', 'valid.'],
  ['we need a group vote.', 'on what?', 'on whether to vote.'],
  ['pillow fort or blanket fort?', 'choose carefully.', 'friendships have ended over less.'],
  ['who’s the Human Being?', 'the mascot.', 'it haunts me.'],
  ['I’m the heart of this group.', 'I thought I was.', 'we can’t both be.', 'watch us.'],
  ['somebody should give a speech.', 'about what?', 'unity. and the failing tests.'],
  ['the A/C is making a noise.', 'it’s singing.', 'that’s worse.'],
  ['extra credit if we finish today.', 'there’s no extra credit.', 'there’s always extra credit.'],
  ['do we get graded on this?', 'we get graded on everything.', 'even breaks?', 'especially breaks.'],
  ['I made a timeline of timelines.', 'which one are we in?', 'the one with coffee.'],
  ['new semester, new me.', 'you said that last sprint.', 'and I meant it then too.'],
  ['is the cafeteria out of chicken fingers?', 'somebody controls the supply.', 'then we take the fryer.'],
  ['standup ran 40 minutes.', 'could’ve been an email.'],
  ['is the build green yet?', '...don’t look.'],
  ['who reply-all’d everyone?', 'we don’t talk about it.'],
  ['I’ll review your PR after class.', 'which class?', 'the one I’m skipping.'],
  ['this table is reserved.', 'by who?', 'by tradition.'],
  ['can we study somewhere else?', 'no.', 'why?', 'this is our room.'],
  ['I have notes.', 'on the code?', 'on your attitude.', 'fair.'],
];

// Keyed off the SPEAKER so, when the right character sits down first, they get
// to open with their signature bit.
const KEYED_EXCHANGES: Partial<Record<OfficeCharacterName, Exchange>> = {
  jeff:      ['I have a speech ready.', 'nobody asked.', 'that’s never stopped me.'],
  britta:    ['I’m just saying, it’s problematic.', 'it’s a muffin.', 'a problematic muffin.'],
  abed:      ['this conversation is a callback.', 'to what?', 'you’ll see in act three.'],
  troy:      ['handshake?', 'handshake.', '*elaborate handshake*'],
  annie:     ['I made us a study schedule.', 'we’re on break.', 'the break is on the schedule.'],
  shirley:   ['I’m not mad. I’m disappointed.', 'that’s worse.', 'I know.'],
  pierce:    ['why wasn’t I invited?', 'you’re here.', 'to the OTHER meeting.'],
  dean:      ['I was just in the neighbourhood.', 'your office is in this building.', 'exactly!'],
  chang:     ['guess who’s back.', 'you never left.', 'and whose fault is that?'],
  garrett:   ['everything’s on fire!', 'it’s one failing test.', 'that’s how fires start!'],
  magnitude: ['POP POP!', '...good talk.'],
  leonard:   ['I’ve got a review for you.', 'of what?', 'this conversation. one star.'],
};

/** A multi-beat exchange for two agents sharing a table. Beats alternate:
 *  index 0 = `speaker`, 1 = the table-mate, 2 = speaker, … */
export function pickExchange(speaker: OfficeCharacterName, seed: number): Exchange {
  const keyed = KEYED_EXCHANGES[speaker];
  if (keyed && seed % 4 === 0) return keyed;
  return pick(PAIR_POOL, seed);
}
