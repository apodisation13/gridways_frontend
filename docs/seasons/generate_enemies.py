import argparse
from pathlib import Path
import random
import csv

random.seed(42)

# ==================== DATA ====================

# Leaders: id -> (faction_id, is_new)
LEADERS = {
    1:  (2, False), 2:  (2, False), 3:  (2, False), 4:  (2, False),
    5:  (4, False), 6:  (4, False), 7:  (4, False), 8:  (4, False),
    9:  (3, False), 10: (3, False), 11: (3, False), 12: (3, False),
    13: (2, True),  14: (2, True),  15: (2, True),  16: (2, True),  25: (2, True),
    17: (4, True),  18: (4, True),  19: (4, True),  20: (4, True),  27: (4, True),
    21: (3, True),  22: (3, True),  23: (3, True),  24: (3, True),  26: (3, True),
}

# Enemy pools: (faction_id, color_id, is_new) -> [enemy_ids]
ENEMY_POOLS = {
    # Faction 2, old
    (2, 1, False): [1,2,3,4,5,7,14,15,17,19,20,66,67,68,69,70,71,72,73,74,75],
    (2, 2, False): [6,9,10,12,16,76,77,78,79,80,81],
    (2, 3, False): [8,11,13,18,82,83,84,85],
    # Faction 2, new
    (2, 1, True):  [126,127,128,129,150,151,152,153,154,155,188,189,190,195],
    (2, 2, True):  [130,131,157,159,162,191,192,196,197,198],
    (2, 3, True):  [132,133,156,158,160,161,163,193,194,199,200],
    # Faction 3, old
    (3, 1, False): [44,45,46,47,48,49,50,51,52,53,54,106,107,108,109,110,111,112,113,114,115],
    (3, 2, False): [55,56,57,58,59,60,61,116,117,118,119,120,121],
    (3, 3, False): [62,63,64,65,122,123,124,125],
    # Faction 3, new
    (3, 1, True):  [134,135,136,137,164,165,166,169,170,171,172,201,202,207],
    (3, 2, True):  [138,139,167,173,174,203,204,208,209,210],
    (3, 3, True):  [140,141,168,175,176,205,206,211,212],
    # Faction 4, old
    (4, 1, False): [27,28,29,30,31,32,33,34,35,36,37,38,39,86,87,88,89,90,91,92,93,94,95],
    (4, 2, False): [21,22,23,25,40,41,96,97,98,99,100,101],
    (4, 3, False): [24,26,42,43,102,103,104,105],
    # Faction 4, new
    (4, 1, True):  [142,143,144,145,177,178,179,213,214,215,216,217],
    (4, 2, True):  [146,147,180,182,183,185,218,219,220,221],
    (4, 3, True):  [148,149,181,184,186,187,222,223,224],
}

# Season rules
# faction=None means any faction (determined by chosen leader)
SEASON_RULES = {
    6:  {'faction': 2,    'leader_new': True,  'enemy_new': True},
    7:  {'faction': 4,    'leader_new': True,  'enemy_new': True},
    8:  {'faction': 3,    'leader_new': True,  'enemy_new': True},
    9:  {'faction': 2,    'leader_new': False, 'enemy_new': False},
    10: {'faction': 4,    'leader_new': False, 'enemy_new': False},
    11: {'faction': 3,    'leader_new': False, 'enemy_new': False},
    12: {'faction': None, 'leader_new': True,  'enemy_new': True},
    13: {'faction': None, 'leader_new': False, 'enemy_new': False},
}

# difficulty -> (total_range, bronze_ratio, silver_ratio)
# gold = total - bronze - silver
DIFFICULTY_SETTINGS = {
    'easy':   {'range': (19, 27), 'bronze': 0.45, 'silver': 0.30},
    'normal': {'range': (30, 50), 'bronze': 0.40, 'silver': 0.30},
    'hard':   {'range': (55, 80), 'bronze': 0.40, 'silver': 0.30},
}

# ==================== HELPERS ====================

def get_pool(faction, color, new_only):
    if new_only:
        return ENEMY_POOLS.get((faction, color, True), [])
    old = ENEMY_POOLS.get((faction, color, False), [])
    new = ENEMY_POOLS.get((faction, color, True), [])
    return old + new

def get_leader_pool(season_id):
    rules = SEASON_RULES[season_id]
    faction = rules['faction']
    new_only = rules['leader_new']
    return [
        lid for lid, (f, is_new) in LEADERS.items()
        if (faction is None or f == faction) and (not new_only or is_new)
    ]

def pick_enemies(faction, difficulty, enemy_new):
    s = DIFFICULTY_SETTINGS[difficulty]
    total = random.randint(*s['range'])
    bronze = round(total * s['bronze'])
    silver = round(total * s['silver'])
    gold = total - bronze - silver

    pool1 = get_pool(faction, 1, enemy_new)
    pool2 = get_pool(faction, 2, enemy_new)
    pool3 = get_pool(faction, 3, enemy_new)

    result = []
    if pool1 and bronze > 0:
        result += random.choices(pool1, k=bronze)
    if pool2 and silver > 0:
        result += random.choices(pool2, k=silver)
    if pool3 and gold > 0:
        result += random.choices(pool3, k=gold)
    return result

# ==================== MAIN ====================

def main():
    parser = argparse.ArgumentParser(description="Generate enemy assignments for the historical season rules.")
    parser.add_argument("--data-dir", type=Path, default=Path(__file__).resolve().parents[2] / "data",
                        help="Working directory with levels.tsv; both TSV outputs are overwritten.")
    args = parser.parse_args()
    levels_path = args.data_dir / "levels.tsv"
    enemies_path = args.data_dir / "level_enemies.tsv"

    with open(levels_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')
        header = next(reader)
        rows = list(reader)

    updated_rows = []
    enemy_rows = []

    for row in rows:
        level_id = int(row[0])
        difficulty = row[3]
        season_id = int(row[6])

        if season_id not in SEASON_RULES:
            updated_rows.append(row)
            continue

        rules = SEASON_RULES[season_id]

        # Pick leader
        leader_pool = get_leader_pool(season_id)
        leader_id = random.choice(leader_pool)
        faction = LEADERS[leader_id][0]

        # Update enemy_leader_id (column index 4)
        new_row = list(row)
        new_row[4] = str(leader_id)
        updated_rows.append(new_row)

        # Pick enemies for this level
        enemies = pick_enemies(faction, difficulty, rules['enemy_new'])
        for eid in enemies:
            enemy_rows.append((level_id, eid))

    # Write updated levels.tsv
    with open(levels_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter='\t', lineterminator='\n')
        writer.writerow(header)
        writer.writerows(updated_rows)

    # Write level_enemies.tsv
    with open(enemies_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter='\t', lineterminator='\n')
        writer.writerow(['level_id', 'enemy_id'])
        writer.writerows(enemy_rows)

    print(f"Updated {len(updated_rows)} levels -> {levels_path}")
    print(f"Wrote {len(enemy_rows)} enemy assignments -> {enemies_path}")

if __name__ == '__main__':
    main()
