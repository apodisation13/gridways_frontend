#!/usr/bin/env python3
"""Offline structural check of an achievements catalog; no DB/API/backend test execution."""
import argparse
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def require(condition, path, message):
    if not condition:
        raise ValueError(f"{path}: {message}")


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def scalar(value):
    return value is None or type(value) in (str, bool) or number(value)


def enum_values(source, name):
    match = re.search(r"export enum " + re.escape(name) + r"\s*\{([^}]+)\}", source)
    require(match is not None, name, "enum not found in TypeScript source")
    return set(re.findall(r'=\s*"([^"]+)"', match[1]))


def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, key, "duplicate JSON key")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError(f"Non-finite JSON constant: {value}")


def field_path(value, path):
    require(isinstance(value, str) and bool(value), path, "expected a nonempty field path")
    require(all(part and part not in {"__proto__", "prototype", "constructor"}
                for part in value.split(".")), path, "invalid/unsafe field path")


def validate_filters(filters, p, operators):
    require(isinstance(filters, dict), p, "filters object required")
    for field, condition in filters.items():
        field_path(field, p)
        if not isinstance(condition, dict):
            require(scalar(condition), p, "literal filter must be scalar")
            continue
        require(set(condition) == {"type", "value"}, p, "filter needs type and value only")
        op, value = condition["type"], condition["value"]
        require(isinstance(op, str) and op in operators, p, "unknown filter operator")
        valid = (scalar(value) if op in {"eq", "ne"} else
                 number(value) if op in {"gt", "gte", "lt", "lte"} else
                 type(value) is bool if op == "exists" else
                 isinstance(value, list) and all(scalar(v) for v in value))
        require(valid, p, f"invalid value for filter {op}")


def validate(catalog):
    source = (ROOT / "src/types/achievements.ts").read_text()
    events = enum_values(source, "AchievementEventType")
    # These inputs are normalized locally and must never appear in a task's event.
    excluded = re.search(r"export type AchievementRecordedEventType = Exclude<([\s\S]*?)>", source)
    require(excluded is not None, "AchievementRecordedEventType", "type not found")
    for name in re.findall(r"AchievementEventType\.(\w+)", excluded[1]):
        match = re.search(r"\b" + re.escape(name) + r'\s*=\s*"([^"]+)"', source)
        require(match is not None, name, "excluded event enum member not found")
        events.discard(match[1])
    counters = enum_values(source, "AchievementCounterType")
    operators = enum_values(source, "AchievementFilterOperator")
    upgrade_source = (ROOT / "src/types/upgrades.ts").read_text()
    upgrade_types = enum_values(upgrade_source, "UpgradeType")
    upgrade_subtypes = enum_values(upgrade_source, "UpgradeSubtype")
    checked = {"resources.checked", "upgrades.checked", "decks.checked"}
    require(isinstance(catalog, dict) and "permanent" in catalog, "$", "expected achievements root with permanent")
    require(set(catalog) <= {"permanent", "daily", "weekly"}, "$", "unexpected root keys; do not pass all game_const")
    total = 0
    for period, section in catalog.items():
        if period != "permanent" and section is None:
            continue
        require(isinstance(section, dict), period, "expected section object")
        require(isinstance(section.get("title"), str), period, "missing title")
        categories = section.get("categories")
        require(isinstance(categories, dict), period, "missing categories object")
        seen = set()
        for key, category in categories.items():
            path = f"{period}.categories.{key}"
            require(isinstance(category, dict) and category.get("id") == key, path, "category key must equal id")
            require(isinstance(category.get("title"), str) and type(category.get("ordering")) is int,
                    path, "title and integer ordering required")
            tasks = category.get("achievements")
            require(isinstance(tasks, dict), path, "missing achievements object")
            for task_id, task in tasks.items():
                p = f"{path}.achievements.{task_id}"
                require(isinstance(task, dict), p, "expected task object")
                require("achievements" not in task, p, "nested category: put categories beside each other, not inside achievements")
                require(task.get("id") == task_id and task_id not in seen, p, "ID mismatch or duplicate across categories")
                seen.add(task_id)
                require(isinstance(task.get("title"), str) and type(task.get("ordering")) is int,
                        p, "title and integer ordering required")
                if "group" in task:
                    require(isinstance(task["group"], str) and bool(task["group"].strip()), p, "group must be a nonempty string")
                event = task.get("event")
                require(isinstance(event, str) and event in events, p, "unknown or local-only event")
                target = task.get("target")
                require(number(target) and target > 0, p, "target must be positive and finite")
                counter = task.get("counter")
                require(isinstance(counter, dict), p, "counter object required")
                kind = counter.get("type")
                require(isinstance(kind, str) and kind in counters, p, "unknown counter")
                require(set(counter) == ({"type", "length", "reset"} if kind == "streak" else {"type"} if kind == "count" else {"type", "field"}), p, "invalid counter fields")
                if kind not in {"count", "streak"}:
                    field_path(counter["field"], p)
                require((kind == "current") == (event in checked), p, "current and state-check events must be used together")
                if kind in {"unique", "streak"}:
                    require(target == int(target), p, "unique/streak target must be an integer")
                if kind == "streak":
                    require(type(counter["length"]) is int and counter["length"] > 0, p, "streak length must be a positive integer")
                    reset = counter["reset"]
                    require(isinstance(reset, dict) and set(reset) == {"event", "filters"}, p, "reset needs event and filters")
                    require(isinstance(reset["event"], str) and reset["event"] in events, p, "unknown reset event")
                    validate_filters(reset["filters"], p + ".counter.reset", operators)
                if kind == "current":
                    parts = counter["field"].split(".")
                    if event == "resources.checked":
                        require(len(parts) == 2 and parts[0] == "resources", p, "expected resources.<resource>")
                    elif event == "decks.checked":
                        require(counter["field"] == "decks.count", p, "expected decks.count")
                    else:
                        item = (len(parts) == 4 and parts[0] == "upgrades" and parts[1] in upgrade_types
                                and parts[2] in upgrade_subtypes and parts[3] in {"level", "value"})
                        summary = (len(parts) == 3 and parts[0] == "summary" and parts[1] in upgrade_types | {"all", "non_settings"}
                                   and parts[2] in {"maxed_count", "total_count", "all_maxed"})
                        require(item or summary, p, "invalid upgrade snapshot path")
                validate_filters(task.get("filters"), p, operators)
                rewards = task.get("rewards")
                require(isinstance(rewards, dict) and set(rewards) == {"resources"}, p, "rewards.resources required; other rewards not implemented")
                require(isinstance(rewards["resources"], dict), p, "resources reward must be an object")
                require(all(isinstance(k, str) and k and type(v) is int and v >= 0 for k, v in rewards["resources"].items()),
                        p, "resource rewards must be nonnegative integers")
                total += 1
    return total


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog", type=Path, help="JSON rooted at permanent (not the whole game_const)")
    args = parser.parse_args()
    try:
        catalog = json.loads(args.catalog.read_text(), object_pairs_hook=unique_keys, parse_constant=reject_constant)
        total = validate(catalog)
    except (OSError, ValueError) as exc:
        parser.exit(1, f"Invalid catalog: {exc}\n")
    print(f"OK: {total} task definitions. Structural check only; verify live resource names, reachability and rewards separately.")


if __name__ == "__main__":
    main()
