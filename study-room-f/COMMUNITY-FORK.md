# Study Room F — a Community re-skin of Munder Difflin

This is a themed fork of [Munder Difflin](https://github.com/chaitanyagiri/munder-difflin)
(MIT, v0.4.6). Everything the harness does is unchanged; what changed is who is on the floor and
where they sit.

## What is different

| Area | Upstream | This fork |
| --- | --- | --- |
| Cast | 15 Office characters | 17 Greendale characters (study group, faculty, campus regulars) |
| Orchestrator | Michael, in his own office | Jeff, in the armchair at the head of the study table |
| Default floor | Dunder Mifflin office | Study Room F: study table, library computer carrels, cafeteria, Dean's office |
| Break-room banter | Office lines | Original Greendale-flavoured lines |
| App name / id | Munder Difflin / `in.munderdiffl.app` | Study Room F / `app.studyroomf.community` (installs side by side) |
| Auto-update | On | **Off by default**, and no `publish` block |

Auto-update is off because the updater polls the *upstream* releases. Accepting one would replace
this fork with the original app. Pull upstream changes with git instead (see below).

The Office and Brooklyn Nine-Nine maps are still selectable under Settings -> Office Theme; they
will be populated by the Greendale cast, because the cast is global rather than per-theme.

## Files that carry the re-skin

- `src/renderer/src/scene/office/cast.ts` — roster (ids, display names, accent colours, blurbs)
- `src/renderer/src/scene/office/portraitArt.ts` — per-character drawing recipes (+ `styleQuiff`, `sideburns`)
- `src/renderer/src/scene/office/cafeteriaLines.ts` — break-room lines
- `src/renderer/src/scene/office/themeRegistry.ts` — `COMMUNITY_THEME` (seat order, anchors, errands)
- `tools/gen-community-map.cjs` -> `src/renderer/src/assets/maps/community.tmj`
- `src/shared/godIdentity.ts` — default orchestrator name

## Changing the room

Edit `tools/gen-community-map.cjs` and re-run it:

```bash
node tools/gen-community-map.cjs
python3 tools/mapgen/render_map.py src/renderer/src/assets/maps/community.tmj /tmp/room.png --labels
```

The generator flood-fills from the door and **refuses to write the map** if any seat, café stand
or errand tile is unreachable. If you move an errand/coffee stand in `COMMUNITY_THEME`, mirror it
in the generator's `STANDS` table so that check keeps covering it.

## Adding a character

1. Add the id to `OfficeCharacterName` and a row to `OFFICE_CAST` in `cast.ts`.
2. Add a recipe to `RECIPES` in `portraitArt.ts` (TypeScript will fail the build until you do).
3. Optionally add lines to `BY_CHARACTER` / `KEYED_EXCHANGES` in `cafeteriaLines.ts`.

An agent saved with an id that no longer exists falls back to the default character (Abed)
rather than crashing.

## Staying current with upstream

```bash
git remote add upstream https://github.com/chaitanyagiri/munder-difflin.git
git fetch upstream && git merge upstream/main
```

Type and export names were deliberately left as upstream has them (`OfficeCharacterName`,
`OFFICE_CAST`), so conflicts should be limited to the files listed above.

## Known leftovers

- Deep strings (update toasts, Slack setup text, release notes) and the logo still say Munder Difflin.
- Hire links still use the `munderdifflin://` scheme, so with both apps installed the OS decides which opens them.

## Credits

Munder Difflin by Chaitanya Giri and contributors (MIT). Tiles: *Modern Interiors* by
[LimeZu](https://limezu.itch.io/) — credit required by licence, see
`src/renderer/src/assets/ATTRIBUTION.md`. Not affiliated with *Community*, NBC or Sony Pictures
Television; no show artwork is included.
