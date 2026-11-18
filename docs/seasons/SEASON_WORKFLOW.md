# Season Tree Workflow

Migrated from `data/SEASON_WORKFLOW.md` on 2026-11-13. The rules and ID pools below describe the historical seasons 6–13 dataset; verify them against the current backend catalog before generating a new season.

This file documents the process for adding new season level trees to the game.
Reference it at the start of any new session to avoid rediscovering everything.

---

## Files involved

| File | Purpose |
|------|---------|
| `data/levels.tsv` | Level definitions: id, name, starting_enemies_number, difficulty, enemy_leader_id, unlocked, season_id, x, y |
| `data/connections.tsv` | Connections: id, level_id, related_level_id, line |
| `data/level_enemies.tsv` | Enemy assignments: level_id, enemy_id |
| `docs/seasons/generate_enemies.py` | Script that fills enemy_leader_id and level_enemies.tsv |
| `data/user_seasons_s1_5.json` | Backend API response for seasons 1–5 (reference for structure) |

---

## TSV column formats

### Working data and repository references

`data/` is local and ignored by Git. The maintained instruction and generator are in `docs/seasons/`; the old `data/SEASON_WORKFLOW.md` pointer and `data/generate_enemies.py` wrapper were retained locally during migration.

The committed `docs/seasons/reference/levels.tsv` and `connections.tsv` preserve the historical seasons 6–13 dataset (400 levels and 956 connections at the 2026-11-13 audit). They contain game definitions, not user progress. They are neither a live database export nor the generator's output directory. Verify IDs and enemy pools before extending them.

After a fresh clone, if the working files do not already exist, prepare them from the repository root:

```sh
mkdir -p data
cp docs/seasons/reference/levels.tsv data/levels.tsv
cp docs/seasons/reference/connections.tsv data/connections.tsv
python3 docs/seasons/generate_enemies.py --data-dir data
```

Do not overwrite newer working data with these reference copies. Generated `data/level_enemies.tsv` stays local. The old `data/user_seasons_s1_5.json` contains user IDs/progress and must not be committed as an example. Git does not back up ignored files.

The generator overwrites `levels.tsv` and `level_enemies.tsv`. Use a temporary copy and `--data-dir` for experiments. Its historical rules cover seasons 6–13; enemy assignments for seasons outside the configured rules are not preserved in the regenerated output. Check the algorithm before expanding the dataset. Seed and execution details are described in Step 10 below.

### levels.tsv
```
id	name	starting_enemies_number	difficulty	enemy_leader_id	unlocked	season_id	x	y
```
- `name`: `УровеньN` where N = level id
- `difficulty`: `easy` / `normal` / `hard`
- `enemy_leader_id`: filled by generate_enemies.py (can leave empty when first inserting)
- `unlocked`: `TRUE` for the first level of a season, `FALSE` for all others
- `x`, `y`: pixel coordinates on the canvas. Current `src/components/Pages/LevelPage/LevelTree.vue` starts at **1000×1000** and expands to fit `maxX + w`, `maxY + w`

### connections.tsv
```
id	level_id	related_level_id	line
```
- Every A→B edge produces **two rows**: one with a direction and one with `NONE`
- The row with direction is on the level where the player exits (A→B has direction on A)
- The row with `NONE` is the reverse (B→A)
- **Direction rule**: compare Δx = x_B − x_A, Δy = y_B − y_A
  - `|Δx| ≥ |Δy|` → `right` (Δx > 0) or `left` (Δx < 0)
  - `|Δy| > |Δx|` → `down` (Δy > 0) or `top` (Δy < 0)
- File is sorted by `level_id` ascending, then by `related_level_id` ascending
- IDs are sequential 1–N across the whole file

---

## Coordinate scaling (draw.io → canvas)

draw.io exports raw pixel positions. To fit into the 1000×1000 visible area with 50px margins:

```
scaled = (raw - min) * (900 / range) + 50
```

**Current code check (2026-11-13):** the canvas starts at 1000×1000 and expands with the data. Keep the scaling formula as a historical layout convention, not a fixed canvas requirement. Do not automatically replace 900 with 1400; inspect `LevelTree.vue` and choose the desired layout bounds for the task.

When parsing draw.io XML:
- Node center = XML `x + 15`, `y + 15` (nodes are 30×30px in draw.io)
- Edge nodes have `source` and `target` attributes referencing cell IDs

### Y-spreading technique
When nodes are too close vertically, apply:
```
y_new = y_old + 5 * i
```
where `i` is the 0-based index when rows are sorted by `y_old` ascending.
Apply only within the season's rows. Can be applied multiple times to a sub-range.

---

## Workflow steps

### Step 1 — Check existing data
- Open `levels.tsv` and `connections.tsv` to see the highest level id and connection id
- Next season levels start at `max_level_id + 1`
- Connection IDs are renumbered after every bulk insert (see step 7)

### Step 2 — Design the tree shape
- Decide the shape (spiral, ring, diamond, grid, fishbone, etc.)
- Make sure the shape is visually distinct from all previous seasons
- Lines between levels must not cross through other level nodes

### Step 3 — Build in draw.io
- Create nodes (30×30px squares) labeled with level IDs
- Connect them with edges
- Export as XML (Extras → Edit Diagram, copy XML)

### Step 4 — Parse draw.io XML
Key parsing steps:
1. Strip any trailing text after `</mxfile>`
2. Extract `mxCell` nodes where `vertex="1"` — these are levels
3. Extract `mxCell` nodes where `edge="1"` — these are connections
4. Node value may be wrapped in HTML: `<div>487</div>` → strip tags → `487`
5. Node value is already the level ID (not an index)
6. Node center = `geometry.x + 15`, `geometry.y + 15`
7. Apply scaling formula to fit canvas

### Step 5 — Compute directions
For each edge (source → target):
- Get pixel coordinates of both nodes
- Apply direction rule (see above)
- Create two TSV rows: one with direction, one with NONE

### Step 6 — Append to TSV files

**levels.tsv**: append N new rows (one per level).
- `enemy_leader_id` can be left blank or `0` at this point
- `unlocked`: only the starting level is `TRUE`

**connections.tsv**: append 2×E new rows (two per edge).
- Then sort the entire file by `level_id ASC`, `related_level_id ASC`
- Renumber all `id` values sequentially 1–N

### Step 7 — Renumber connection IDs
After sorting:
```python
with open('connections.tsv', 'r') as f:
    lines = f.readlines()
header = lines[0]
rows = [line.split('\t') for line in lines[1:] if line.strip()]
for i, row in enumerate(rows, 1):
    row[0] = str(i)
with open('connections.tsv', 'w') as f:
    f.write(header)
    f.writelines('\t'.join(row) for row in rows)
```

### Step 8 — Visual check
- Load the data into the game / Konva canvas
- Verify no crossing lines, correct directions, tree looks correct
- If nodes are too crowded vertically, apply y-spreading (see above)

### Step 9 — Assign enemies
Provide the enemy distribution spec:
- Which faction the season uses (2 = blue, 3 = green, 4 = red, None = any)
- Whether leaders/enemies are "new" characters only
- Add the season rule to `generate_enemies.py` → `SEASON_RULES`

### Step 10 — Run generate_enemies.py

The maintained script is now in `docs/seasons/`. By default it still reads/writes repository `data/`. Use `--data-dir /tmp/season-work` to work on a copy. It overwrites both TSV outputs; inspect changes before importing them into a database.
```bash
python3 docs/seasons/generate_enemies.py
```
This:
- Re-reads `levels.tsv`
- Assigns a random `enemy_leader_id` per level (per season-faction rules)
- Writes `level_enemies.tsv` with all enemy assignments
- Overwrites `levels.tsv` with updated `enemy_leader_id` values

**Important:** Script uses `random.seed(42)`. Results are deterministic but depend on
iteration order — if you change which seasons are in `SEASON_RULES`, re-run the script
and it will regenerate all seasons, not just the new one.

---

## Season rules reference

| Season | Levels | Shape | Faction | Leader new | Enemy new |
|--------|--------|-------|---------|-----------|-----------|
| 6 | 161–190 | Ring with chords | 2 (blue) | new only | new only |
| 7 | 191–220 | Diamond | 4 (red) | new only | new only |
| 8 | 221–250 | Spiral | 3 (green) | new only | new only |
| 9 | 251–300 | — | 2 (blue) | any | any |
| 10 | 301–350 | — | 4 (red) | any | any |
| 11 | 351–400 | — | 3 (green) | any | any |
| 12 | 401–460 | — | any | new only | new only |
| 13 | 461–560 | — | any | any | any |

---

## generate_enemies.py — faction/leader data

```
LEADERS:
  faction 2 (blue), old:  1,2,3,4
  faction 4 (red), old:   5,6,7,8
  faction 3 (green), old: 9,10,11,12
  faction 2, new:  13,14,15,16,25
  faction 4, new:  17,18,19,20,27
  faction 3, new:  21,22,23,24,26

DIFFICULTY_SETTINGS:
  easy:   19–27 enemies, 45% bronze / 30% silver / 25% gold
  normal: 30–50 enemies, 40% bronze / 30% silver / 30% gold
  hard:   55–80 enemies, 40% bronze / 30% silver / 30% gold
```

---

## Backend API structure reference

The local, ignored file `data/user_seasons_s1_5.json` contains an old user-progress API response. It is intentionally not committed. The structural illustration below is sufficient for orientation; check current TypeScript/backend schemas before relying on the historical array format.

Key structure:
```json
[
  {
    "id": 10,            // user_season id
    "finished": true,
    "season": {
      "id": 1,
      "name": "Сезон 1",
      "x": 25, "y": 25,  // season icon position on world map
      "levels": [
        {
          "id": 141,       // user_level id
          "unlocked": true,
          "finished": true,
          "level": {
            "id": 1,
            "name": "Уровень1",
            "starting_enemies_number": 3,
            "difficulty": "easy",
            "x": 25, "y": 25,
            "enemy_leader": 1,
            "enemies": [3, 1, 7, 6, 5, 4, 2],
            "children": [
              { "related_level_id": 2, "line": "right", "connection": "1-2" },
              { "related_level_id": 3, "line": "down",  "connection": "1-3" }
            ]
          }
        }
      ]
    }
  }
]
```

Note: `children` contains only the **outgoing** connections (line ≠ NONE).
The reverse direction (NONE rows) is not exposed in the API.

---

## Known issues

1. **Historical layout bounds**: older notes described a fixed 1500×1500 canvas. Current code is dynamic (minimum 1000×1000); verify the intended bounds instead of applying that old assumption.

2. **Season 12 shape**: Must be visually distinct from season 5 (check season 5 in the
   LevelTree component before finalising season 12's layout).

3. **Crossing lines**: When designing the tree, verify no connection line passes through
   a level node that is not its endpoint. draw.io does not enforce this automatically.
