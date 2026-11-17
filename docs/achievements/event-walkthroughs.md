# События достижений: от вызова до контракта

Разбираем по одному событию: зачем оно нужно, откуда берутся данные, что отправляется и как считается прогресс. Здесь описан существующий код. Разобраны `GameWon`, `GameLost`, `ActionPlayed`, `PassiveTriggered`, `EnemyKilled`, `EnemyShieldRemoved`, `EnemyArmorRemoved`, `DeckCreated`, `DeckSaved`, `DeckDeleted` и `DecksChecked`; остальные события описаны в [events.md](events.md).

## GameWon — победа в бою

### Как событие доходит до проверки контракта

**1. WinPage или ArenaWinPage вызывает:**

```ts
trackAchievementEvent({
  type: AchievementEventType.GameWon,
})
```

Вызов находится в `created`, после проверки одноразового `win_redirect` и до дальнейшей обработки победы. Флаг сразу снимается: повторное открытие страницы не создаёт новую победу. Обычные сезоны, random/random_n и мультиплеер используют WinPage, арена — ArenaWinPage.

**2. Мастер-функция вызывает finishAchievementBattle.**

Она собирает данные из стора:

```ts
{
  mode,
  difficulty,
  starting_deck: { cards, leader },
  leader_uses,
  enemy_grave,
}
```

Мастер-функция делает независимую JSON-копию этих данных и кладёт событие в `pendingEvents` через мутацию `enqueueAchievementEvent`. Дальнейшие изменения объектов игры уже не меняют событие в очереди.

**3. Событие из очереди получает processAchievementEvents.**

Именно в этой функции находится ветка, добавляющая `starting_deck.summary`. Её вызывают в двух случаях:

- Для отображения прогресса: геттер `localUserAchievements` передаёт ей подтверждённый прогресс и события из очередей `inFlightEvents`, затем `pendingEvents`.
- Для немедленной отправки: подписка на добавление события проверяет, достигли ли мы цели контракта. Для этого `shouldFlush` тоже вызывает `processAchievementEvents` — сначала для уже отправленной пачки, затем для новых событий.

Это два независимых расчёта от переданных исходных данных, а не два прибавления к сохранённому прогрессу. Если очередь уже достигла лимита, планировщик может отправить её без расчёта достижения цели.

**4. Внутри перебора событий встречается наша победа:**

```ts
for (const event of events) {
  let data = event.data

  if (event.type === AchievementEventType.GameWon) {
    // Вот мы и здесь.
  }
}
```

Здесь к данным колоды добавляется вычисленная `summary`, а дальше в этой же функции проверяются фильтры контрактов — например:

```json
"starting_deck.summary.all_bronze": true
```

То есть `summary` нужна для расчёта условий. Она добавляется к локальным данным обработки; **событие в очереди остаётся без неё**. Когда оно уйдёт на бэк, бэк самостоятельно посчитает такую же сводку.

### Откуда берётся каждое поле

| Поле в data | Источник и смысл |
|---|---|
| `mode` | `finishAchievementBattle()` вызывает `resolveAchievementGameMode()`, которая сама читает игровой стор: multiplayer по имени уровня, затем arena_mode, затем random_n/random, иначе normal. В вызов GameWon режим не передаётся. |
| `difficulty` | `store.state.game.level?.difficulty`. Если уровня нет, значение undefined не попадёт в JSON. |
| `starting_deck.cards` | `store.state.game.current_deck.map(entry => entry.card)`: полные объекты карт, без обёрток пользовательских записей. Не остаток игровой колоды и не рука. |
| `starting_deck.leader` | Текущий `store.state.game.leader`. Если лидер в сторе заменился, берём уже его. |
| `leader_uses` | Число из `store.state.achievements.leader_uses`: сколько раз применён заряд лидера за бой. Не вычисляется по оставшимся зарядам. |
| `enemy_grave.total` | `store.state.game.enemies_grave.length`. Лидер в кладбище не попадает; единицу за него не прибавляем. |
| `enemy_grave.bronze/silver/gold` | Число элементов этого же кладбища с color Bronze/Silver/Gold. Это состав кладбища на победе, не история убийств. |

`starting_deck` — имя поля события, а не отдельное поле игрового стора. Оно объединяет карты и лидера для фильтров контрактов. Отдельной копии исходной колоды в модуле достижений нет: игра работает с копиями, а при победе читаем игровой стор.

Откуда берётся `leader_uses`: при начале боя `startAchievementBattle()` обнуляет счётчик. Затем каждое применение заряда лидера прибавляет 1. Срабатывание пассивной способности лидера зарядом, сыгранным игроком, не считается. Поэтому при победе `leader_uses = 0` означает, что игрок ни разу не применил заряд лидера.

### Что отправляется на бэк

Экшен `sendAchievementEvents` отправляет POST `/user-achievements/{user_id}` с `events`. Ни локального UUID, ни вычисленной `summary` в передаваемом событии нет.

Пример формы запроса ниже. Для компактности в cards и leader показаны только некоторые поля: в реальном событии отправляются полные объекты из стора. Значения демонстрационные.

```json
{
  "events": [
    {
      "type": "game.won",
      "data": {
        "mode": "normal",
        "difficulty": "hard",
        "starting_deck": {
          "cards": [
            { "id": 1, "color": "Bronze", "faction": "Soldiers" },
            { "id": 2, "color": "Bronze", "faction": "Neutral" }
          ],
          "leader": { "id": 13, "faction": "Soldiers" }
        },
        "leader_uses": 0,
        "enemy_grave": { "total": 35, "bronze": 10, "silver": 5, "gold": 20 }
      }
    }
  ]
}
```

### Что вычисляется при обработке

Фронт вызывает `buildDeckSummary`, бэк — `build_deck_summary`. Обе функции получают cards и считают одинаковые признаки; лидер в сводку не входит.

| Поле starting_deck.summary | Значение |
|---|---|
| `cards_count` | Число карт |
| `by_color.Bronze/Silver/Gold` | Число карт каждого цвета |
| `neutral_count` | Число карт фракции Neutral |
| `all_bronze/all_silver/all_gold` | Колода непустая и все карты указанного цвета |
| `all_neutral` | Колода непустая и все карты Neutral |
| `no_neutral` | Колода непустая, у каждой карты известна фракция и ни одна не Neutral |

Пустая колода не получает флаги «все бронзовые» или «без нейтральных». Сводка пересчитывается из карт, даже если клиент прислал собственную summary.

### Что сейчас делает бэк

1. Схема `GameWonEvent` проверяет входное событие. В `GameWonData` обязательны mode, difficulty, starting_deck, leader_uses и enemy_grave. В составе колоды обязательны cards (список объектов карт) и leader (объект лидера). Внутри карт и лидера сохраняются все игровые поля. Неполное событие или неправильный тип отклоняются до подсчёта.
2. `apply_events` превращает data из Pydantic-модели в словарь.
3. Добавляет в `data["starting_deck"]["summary"]` сводку, рассчитанную из `event.data.starting_deck.cards`. Структура уже проверена схемой, поэтому повторная проверка dict не нужна. Входная модель не изменяется. Очистки None нет: обязательные поля победы не допускают null, а вложенные null в игровых объектах сохраняются для фильтров.
4. Общий обработчик проверяет event и filters каждого задания, обновляет соответствующий счётчик и собирает награды. Сервис сохраняет прогресс и начисляет награды в транзакции. Ответ затем заменяет подтверждённый прогресс на фронте.

Бэк здесь не воспроизводит бой: исходные карты, применения лидера и состав кладбища сообщает клиент. Пересчёт summary проверяет состав переданных карт, а не достоверность победы.

### Какие контракты можно описать

Ниже указаны условия, а не полные конфиги. Для всех строк event = `game.won`; обычный режим ограничивается `"mode": "normal"`. Несколько фильтров соединяются через И.

| Контракт | Дополнительные filters | counter и target |
|---|---|---|
| Победите 100 раз | Нет | count, 100 |
| Победите 100 раз за Soldiers | `starting_deck.leader.faction = Soldiers` | count, 100 |
| Победите 3 раза бронзовой колодой | `starting_deck.summary.all_bronze = true` | count, 3 |
| Победите без золотых карт | `starting_deck.summary.cards_count > 0`, `starting_deck.summary.by_color.Gold = 0` | count, 1 |
| Победите на сложном уровне 100 раз | `difficulty = hard` | count, 100 |
| Победите без применения лидера 3 раза | `leader_uses = 0` | count, 3 |
| Победите с минимум 30 врагами в кладбище 5 раз | `enemy_grave.total >= 30` | count, 5 |
| Победите с минимум 20 золотыми в кладбище 5 раз | `enemy_grave.gold >= 20` | count, 5 |
| Выиграйте 3 боя подряд — 5 серий | Нет | streak, length 3, target 5; reset по game.lost того же режима |

Порог 30/50/70, цвет или режим меняются конфигом. Возможны и другие общие счётчики: например unique по starting_deck.leader.id или sum по enemy_grave.gold. `current` для game.won не применяется — он предназначен для отдельных проверок состояния.

Фильтры работают и по другим доступным полям полных объектов. Это не отдельные проверки в коде для каждого задания. Точные JSON-формы операторов и счётчиков описаны в [configs.md](configs.md), готовые характерные примеры — в [config-examples.json](config-examples.json).

### Где смотреть код

- Вызовы победы: [WinPage.vue](../../src/pages/WinPage.vue) и [ArenaWinPage.vue](../../src/pages/ArenaWinPage.vue).
- Подготовка: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts), [battle.ts](../../src/logic/achievements/battle.ts), [gameMode.ts](../../src/logic/achievements/gameMode.ts).
- Очередь и геттер: [модуль achievements](../../src/store/modules/achievements.ts).
- Решение об отправке: [syncAchievementEvents.ts](../../src/logic/achievements/syncAchievementEvents.ts).
- Предварительный расчёт: [processAchievementEvents.ts](../../src/logic/achievements/processAchievementEvents.ts), [deckSummary.ts](../../src/logic/achievements/deckSummary.ts).
- В отдельном репозитории GridwaysBackend: `services/api/app/apps/user_achievements/schemas.py`, `logic/events.py`, `logic/decks.py`, `service.py`.

## GameLost — поражение в бою

### Как событие доходит до сброса серии

**1. Игровой код обнаруживает поражение и вызывает:**

```ts
trackAchievementEvent({
  type: AchievementEventType.GameLost,
})
```

Есть три места вызова:

- `check_lose`: здоровье игрока стало <= 0, перед переходом на страницу поражения.
- `MultiplayerGamePage`: наблюдатель здоровья обнаружил поражение вне своего хода, при инициализированной и ещё не завершённой игре.
- `MultiplayerGamePage`: получено сообщение GAME_END с поражением, перед переходом на страницу поражения.

Сама LosePage событие не создаёт. Простой выход из игры и отключение от матча без зафиксированного поражения тоже не создают GameLost.

**2. Мастер-функция собирает событие и кладёт его в очередь.**

Режим не передаётся аргументом. `resolveAchievementGameMode()` сама читает игровой стор: multiplayer по имени уровня, затем arena_mode, затем random_n/random, иначе normal. После multi_reset имя уровня остаётся в игровом сторе, поэтому режим по-прежнему определяется как multiplayer.

У события есть локальный UUID и всего одно поле data — mode. Здесь не нужны ни колода, ни лидер, ни кладбище. Ветка сразу вызывает `enqueueAchievementEvent` и возвращает локальный ID; до общей подготовки остальных событий выполнение не доходит.

**3. processAchievementEvents получает поражение из очереди.**

Как и для победы, предварительный расчёт вызывается для отображения прогресса и проверки необходимости отправки пачки. Для серий задание ищется не только по основному event, но и по событиям из counter.reset. Поэтому game.lost находит контракт, у которого основное событие — game.won.

**4. Совпало условие reset — обнуляем только streak.**

Например, контракт требует выиграть 3 боя подряд, повторить это 5 раз:

```json
{
  "event": "game.won",
  "filters": { "mode": "normal" },
  "counter": {
    "type": "streak",
    "length": 3,
    "reset": [
      { "event": "game.lost", "filters": { "mode": "normal" } }
    ]
  },
  "target": 5
}
```

Это фрагмент условий контракта, без названия, ID и награды. Если было `value = 2, streak = 2`, после поражения будет `value = 2, streak = 0`: две полные серии остаются, две победы текущей незаконченной серии теряются. Подтверждённые выполненные контракты не меняются. Поражение другого режима этот reset не проходит.

Проверки «бой ещё активен» в трекере нет. Повторное поражение тоже попадёт в очередь: для такого reset два последовательных сброса дают тот же нулевой streak. Это свойство сброса, а не общая защита от повторов событий.

### Что отправляется на бэк

```json
{
  "events": [
    {
      "type": "game.lost",
      "data": { "mode": "normal" }
    }
  ]
}
```

Локальный ID не отправляется. Поражение использует обычную очередь: каждые 10 секунд при наличии событий, при достижении размера пачки или другой причины немедленной отправки. Сам по себе сброс серии не означает выполнение контракта и не требует немедленного запроса.

Порядок событий сохраняется: если после поражения начался следующий бой и пришла победа, обработчик сначала сбросит серию, затем прибавит новую победу. Принятое правило потери неотправленных событий распространяется и на поражения: если событие потерялось, сервер не узнает о сбросе.

### Что делает бэк и какие контракты доступны

`GameLostData` явно содержит одно обязательное поле mode. Схема проверяет его, затем `apply_events` превращает data в словарь и передаёт в общую обработку. Специального расчёта или добавления summary для поражения нет.

Обработчик streak сначала проверяет все условия reset. Если одно совпало, обнуляет streak незавершённого задания, сохраняя value и ранее выданные награды. Текущий смысл GameLost в контрактах — сбрасывать серии побед выбранного режима.

Технически общий механизм также позволяет сделать самостоятельный контракт с `event: game.lost` и `counter: count`, но тогда каждое повторно отправленное событие считается отдельным поражением. Для принятого использования как reset такой подсчёт не нужен. Проверки колоды, сложности или количества врагов по этому событию невозможны: в нём есть только mode.

### Где смотреть код

- Источники: [check_lose.ts](../../src/logic/ai_move/service/check_lose.ts), [MultiplayerGamePage.vue](../../src/pages/MultiplayerGamePage.vue).
- Подготовка и очередь: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts), [gameMode.ts](../../src/logic/achievements/gameMode.ts), [модуль achievements](../../src/store/modules/achievements.ts).
- Сброс на фронте: [processAchievementEvents.ts](../../src/logic/achievements/processAchievementEvents.ts).
- На бэке: `services/api/app/apps/user_achievements/schemas.py` (GameLostData/GameLostEvent), `logic/events.py` (общая обработка reset).

## ActionPlayed — применение заряда карты или лидера

### Как событие доходит до проверки контракта

**1. Игрок применяет карту или лидера.**

В [player_move.ts](../../src/logic/player_move/player_move.ts) есть два места вызова:

- `damage_ai_card` — применение к одной цели.
- `damage_ai_card_multi` — применение к нескольким целям. Вызов трекера стоит после цикла целей, поэтому несколько поражённых врагов не превращаются в несколько сыгранных зарядов.

Это два варианта обработки хода, а не два обязательных вызова на каждый ход. Оба получают `card: Card | Leader`.

**2. До эффекта хода сохраняем объект для достижения.**

```ts
const achievementActor = copyObj(card)
```

В нём остаются значения до эффекта и расхода заряда: например, текущий урон, число зарядов, способность и пассивка. Это полный объект конкретной сыгранной карты/лидера, а не повторная загрузка базовой карты по ID.

Сообщаем о применении:

```ts
trackAchievementEvent({
  type: AchievementEventType.ActionPlayed,
  actor: achievementActor,
})
```

Один такой вызов означает один применённый заряд. Не требуется, чтобы способность обязательно нанесла урон или убила врага. Реакции пассивок на ход обрабатываются далее отдельно и не создают дополнительные ActionPlayed.

**3. Мастер-функция отдельно учитывает применение лидера.**

Если у actor нет поля color, это лидер. Тогда `recordAchievementLeaderUse` прибавляет 1 к локальному `leader_uses`. Это нужно для будущего события GameWon и контракта «победите без применения лидера».

При этом само ActionPlayed не пропускается: оно подходит для контрактов на заряды лидера. У карты есть color, поэтому её применение не увеличивает leader_uses. Здесь проверяется наличие поля, а не значение цвета.

**4. Формируем данные события и кладём в очередь.**

```ts
eventData = {
  actor: input.actor,
  mode: resolveAchievementGameMode(),
}
```

Мастер-функция создаёт независимую JSON-копию, добавляет локальный UUID и вызывает `enqueueAchievementEvent`. Первая копия в player_move сохранила состояние до эффекта; эта копия отделяет данные очереди от переданного объекта.

**5. processAchievementEvents проверяет контракты.**

Как и для GameWon, расчёт вызывается для предварительного прогресса интерфейса и для решения, пора ли немедленно отправить пачку. Для ActionPlayed дополнительной сводки нет: фильтры читают actor и mode непосредственно из события.

Например, один бронзовый заряд может одновременно продвинуть задания на 10 бронзовых зарядов, 20 бронзовых зарядов и игру карт фракции Soldiers. Обработчик не содержит отдельных веток для этих заданий — условия находятся в конфиге.

### Что отправляется и откуда берутся поля

| Поле | Источник |
|---|---|
| `actor` | Полная копия аргумента card из player_move, снятая до эффекта хода и расхода заряда |
| `mode` | Текущий игровой стор, который читает resolveAchievementGameMode() |

Внешний запрос содержит массив events. Ниже один пример; поля actor сокращены для чтения, реальные вложенные объекты отправляются полностью.

```json
{
  "events": [
    {
      "type": "action.played",
      "data": {
        "actor": {
          "id": 7,
          "color": "Gold",
          "faction": "Soldiers",
          "type": "Unit",
          "ability": { "name": "damage-one" },
          "passive_ability": { "name": "incr-self-dmg" },
          "data": {
            "damage": 7,
            "charges": 2,
            "base": { "base_damage": 7, "base_charges": 2 }
          }
        },
        "mode": "normal"
      }
    }
  ]
}
```

Для лидера форма события такая же, но actor — полный объект лидера без color. Отдельного события leader.played нет. Локальный UUID на бэк не отправляется. leader_uses также не входит в ActionPlayed: его итог передаётся при победе.

### Что делает бэк

`ActionPlayedData` явно содержит `actor: dict[str, JsonValue]` и обязательный mode. Проверяется форма события; внутри actor разрешены произвольные JSON-поля, чтобы новые фильтры по уже переданным полям не требовали изменения схемы.

`apply_events` переводит data в словарь и сразу использует общие условия и счётчики. Специального преобразования ActionPlayed, вычисления summary или увеличения отдельного счётчика применений лидера на бэке нет. Бэк не выполняет способность повторно и не списывает заряд — событие только сообщает о совершённом действии.

Пути фильтров начинаются от data: `actor.color`, `actor.ability.name`, `actor.data.damage`. Значения цветов сохраняют регистр: Bronze/Silver/Gold. faction — строка, поэтому используется `actor.faction`, не `actor.faction.name`.

### Какие контракты можно описать

Все строки ниже используют event = `action.played`. Если нужен обычный режим, добавляем `"mode": "normal"`; без этого фильтра учитываются все режимы.

| Контракт | filters | counter |
|---|---|---|
| Примените бронзовые карты 10 раз | `actor.color = Bronze` | count, target 10 |
| Примените заряды лидера 10 раз | `actor.color exists false` | count, target 10 |
| Примените 30 разных карт | `actor.color exists true` | unique по actor.id, target 30 |
| Примените лидеров трёх фракций | `actor.color exists false`, faction in нужные фракции | unique по actor.faction, target 3 |
| Примените бронзовые карты Soldiers | `actor.color = Bronze`, `actor.faction = Soldiers` | count |
| Примените бронзовую карту с уроном >= 8 | `actor.color = Bronze`, `actor.data.damage >= 8` | count |
| Примените карту со способностью damage-all | `actor.color exists true`, `actor.ability.name = damage-all` | count |
| Примените Special-карту без пассивки | `actor.color exists true`, `actor.type = Special`, `actor.passive_ability.name = null` | count |

Все условия в filters соединяются через И. Если нужны Monsters ИЛИ Animals, это один фильтр `actor.faction` с оператором in. Отсутствующее поле отличается от null: условие `actor.passive_ability.name = null` требует существующего поля со значением null.

Событие передаёт параметры сыгранного объекта, а не результат способности. Например, actor.data.damage — урон карты перед ходом, не фактически нанесённый всем целям урон.

### Серия: примените бронзовые карты 10 раз подряд

Полный пример задания для вставки в achievements категории cards:

```json
{
  "play_bronze_streak_10": {
    "id": "play_bronze_streak_10",
    "title": "Примените бронзовые карты 10 раз подряд",
    "ordering": 60,
    "event": "action.played",
    "target": 1,
    "counter": {
      "type": "streak",
      "length": 10,
      "reset": [
        {
          "event": "action.played",
          "filters": {
            "mode": "normal",
            "actor.color": { "type": "ne", "value": "Bronze" }
          }
        },
        {
          "event": "action.played",
          "filters": {
            "mode": "normal",
            "actor.color": { "type": "exists", "value": false }
          }
        }
      ]
    },
    "filters": { "mode": "normal", "actor.color": "Bronze" },
    "rewards": { "resources": { "money": 1000 } }
  }
}
```

- Каждый заряд любой бронзовой карты в normal продолжает серию. Карты могут быть разными; одинаковый actor.id здесь не требуется.
- Другой цвет сбрасывает серию первым условием reset, применение лидера — вторым. Одного ne Bronze недостаточно: отсутствующий у лидера color не проходит ne.
- Пассивки, события врагов, победы, поражения и действия в других режимах эту серию не сбрасывают. Поэтому она продолжается между боями, а не ограничивается одним уровнем.
- На десятом подходящем заряде value увеличивается на 1, streak обнуляется. target 1 означает одну полную серию, target 5 — пять непересекающихся серий.
- Сам streak скрыт в интерфейсе; отображается число завершённых серий value/target. При достижении цели очередь получает основание для немедленной отправки, награда подтверждается бэком.

Механизм уже общий для фронта и бэка: для такого задания достаточно конфига. Награда в примере демонстрационная.

### Где смотреть код

- Два места вызова и копия до эффекта: [player_move.ts](../../src/logic/player_move/player_move.ts).
- Подготовка actor/mode и учёт заряда лидера: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts).
- Режим: [gameMode.ts](../../src/logic/achievements/gameMode.ts).
- Предварительный подсчёт и reset: [processAchievementEvents.ts](../../src/logic/achievements/processAchievementEvents.ts), [filters.ts](../../src/logic/achievements/filters.ts).
- На бэке: `services/api/app/apps/user_achievements/schemas.py` (ActionPlayedData/ActionPlayedEvent), `logic/events.py`, `logic/filters.py`.

## PassiveTriggered — активация пассивной способности

### Как событие доходит до проверки контракта

**1. Игровой обработчик запускает пассивку и сохраняет её владельца.**

Перед эффектом создаётся `actor = copyObj(card)` или `copyObj(leader)`. Это полный объект того, чья пассивка сработала. Если игра одной карты вызвала реакцию лидера, actor — лидер, а не сыгранная карта.

**2. После обработки сообщаем об активации:**

```ts
trackAchievementEvent({
  type: AchievementEventType.PassiveTriggered,
  actor,
  location: "passive_upon_playing_a_card",
})
```

`location` — имя поля. Строка справа — одно из разрешённых значений. Добавление строки в AchievementPassiveLocation расширяет допустимые значения этого поля, а не добавляет новое поле в объект события.

Есть четыре источника события, у них немного разный смысл «сработала»:

| Источник | Когда создаётся событие | location |
|---|---|---|
| `run_passive` | Таймер разрешил запуск и вызван поддерживаемый обработчик. Даже если эффект оказался бесполезен, это активация. При отказе таймера или неизвестной способности события нет. | hand/deck/grave, как передал вызывающий код |
| `passives_upon_beginning` | Обработчик разовой пассивки в начале боя вернул true. | passive_once |
| `passives_upon_playing_a_card` | Реакция конкретной карты на игру карты вернула true. Событие для каждой сработавшей карты. | passive_upon_playing_a_card |
| `leader_passive_abilities_upon_playing_a_card` | Реакция лидера на игру карты вернула true. Максимум одно событие за вызов диспетчера, даже при нескольких целях. | leader_passive_upon_playing_a_card |

Список карт для реакции на ход по-прежнему выбирается по флагам пассивки в руке/колоде/сбросе. Новое location только отделяет этот вид активации в контрактах, не меняет игровые условия работы способности.

**3. Мастер-функция добавляет режим и ставит событие в очередь.**

```ts
eventData = {
  actor: input.actor,
  mode: resolveAchievementGameMode(),
  location: input.location,
}
```

Далее — независимая JSON-копия, локальный UUID и `enqueueAchievementEvent`. Счётчик leader_uses не увеличивается: он относится к сыгранным зарядам ActionPlayed, а не к пассивкам.

**4. Фронт и бэк применяют общие фильтры и счётчики.**

Предварительный расчёт использует actor, mode и location без дополнительной сводки. На бэке `PassiveTriggeredData` явно описывает эти три обязательных поля: actor — полный JSON-объект, mode — режим, location — одно из шести разрешённых значений. В `apply_events` отдельной ветки для пассивок нет: работают обычные filters и counter. Бэк не запускает способность повторно и не вычисляет, был ли её эффект полезен.

### Что означает location

| Значение | Смысл |
|---|---|
| `hand` | Обычная пассивка в руке; обычная пассивка лидера тоже использует hand |
| `deck` | Обычная пассивка в колоде |
| `grave` | Обычная пассивка в сбросе |
| `passive_once` | Разовая пассивка в начале боя |
| `passive_upon_playing_a_card` | Реакция карты на сыгранную карту, независимо от зоны владельца |
| `leader_passive_upon_playing_a_card` | Реакция лидера на сыгранную карту |

Название поля сохранено, но для последних трёх значений оно обозначает ситуацию запуска, а не физическую зону. Лидер отличается от карты отсутствием actor.color.

### Что отправляется на бэк

Пример реакции лидера; actor сокращён для чтения, в запросе он полный:

```json
{
  "events": [
    {
      "type": "passive.triggered",
      "data": {
        "actor": {
          "id": 13,
          "faction": "Soldiers",
          "passive_ability": { "name": "add-charges-to-leader-if-play-special" }
        },
        "mode": "normal",
        "location": "leader_passive_upon_playing_a_card"
      }
    }
  ]
}
```

Значения actor демонстрационные; имя способности берётся из реального объекта, не назначается трекером. Локальный UUID не отправляется.

### Какие контракты можно описать

Для всех строк event = `passive.triggered`, counter = count, target — нужное число активаций. Для ограничения режима добавляем mode. Несколько фильтров соединяются через И.

| Контракт | filters |
|---|---|
| Пассивки карт в руке | location = hand, actor.color exists true |
| Пассивки карт в колоде или сбросе | location = deck или grave соответственно, actor.color exists true |
| Все пассивки лидера | actor.color exists false, без ограничения location |
| Только обычная пассивка лидера | actor.color exists false, location = hand |
| Разовые пассивки начала боя | location = passive_once |
| Реакции карт на ход | location = passive_upon_playing_a_card |
| Реакции лидера на ход | location = leader_passive_upon_playing_a_card |
| Любая реакция на ход | location in [passive_upon_playing_a_card, leader_passive_upon_playing_a_card] |
| Пассивки бронзовых карт с уроном >= 8 | actor.color = Bronze, actor.data.damage >= 8 |

Можно дополнительно фильтровать фракцию, имя пассивки и любые переданные поля actor. Урон и прочие параметры относятся к снимку до эффекта, а не к фактическому результату пассивки. Общий unique также подходит, например по actor.id для разных карт, с actor.color exists true для исключения лидеров.

### Где смотреть код

- Обычные пассивки: [passives_dispatcher.ts](../../src/logic/player_move/passive_abilities/passives_dispatcher.ts).
- Начало боя: [passives_upon_beginning.ts](../../src/logic/player_move/passive_abilities/passives_upon_beginning.ts).
- Реакции карт: [passives_upon_playing_a_card.ts](../../src/logic/player_move/passive_abilities/passives_upon_playing_a_card.ts).
- Реакции лидера: [leader_passive_abilities_upon_playing_a_card.ts](../../src/logic/player_move/leader_passive_abilities_upon_playing_a_card.ts).
- Тип location: [achievements.ts](../../src/types/achievements.ts); подготовка события: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts).
- На бэке: `services/api/app/apps/user_achievements/schemas.py` (PassiveTriggeredData/PassiveTriggeredEvent), `logic/events.py` (общий подсчёт).

## EnemyKilled — смерть врага или лидера врагов

### Как событие доходит до проверки контракта

**1. Игровая логика вызывает remove_dead_enemy.**

Единственное место создания EnemyKilled — функция `remove_dead_enemy` в `enemy_takes_damage.ts`. Обычный урон приходит сюда после проверки HP <= 0; также её вызывают обработчики яда/уничтожения и вражеская пассивка брони. Трекер не ищет причину смерти и не проверяет повторно здоровье: ему сообщает об этом обработчик смерти.

Удаление случайного врага из колоды (`destroy_random_enemy_in_deck`), замена занятой клетки при перемещении (`move_enemy`) и замена своей картой (`place_self_in_field`) не создают EnemyKilled. Само исчезновение врага из игрового массива не считается этим событием.

**2. До изменения мёртвого врага вызываем мастер-функцию:**

```ts
trackAchievementEvent({
  type: AchievementEventType.EnemyKilled,
  enemy,
})
```

Вызов стоит до очистки статуса, восстановления HP, перемещения в кладбище и выполнения завещания. Поэтому фильтры видят признаки врага именно в момент обработки смерти: например veil или наличие deathwish. Текущее HP может быть нулевым/отрицательным при смерти от урона; для контрактов на исходные жизни используем `enemy.data.base.base_hp`.

**3. Мастер-функция добавляет режим и копирует данные в очередь.**

Для EnemyKilled используется общая ветка событий с enemy:

```ts
eventData = {
  enemy: input.enemy,
  mode: resolveAchievementGameMode(),
}
```

Затем создаётся независимая JSON-копия, локальный UUID и вызывается `enqueueAchievementEvent`. Копирование происходит синхронно: дальнейшая очистка статуса или восстановление HP в remove_dead_enemy уже не меняют записанное событие.

**4. Фронт и бэк проверяют обычные filters и counter.**

На фронте `processAchievementEvents` использует enemy и mode напрямую. Дополнительной summary нет. Один враг может одновременно продвинуть контракты на общее число убийств, его цвет, фракцию и статус.

На бэке `EnemyKilledEvent` использует `EnemyEventData`: полный `enemy: dict[str, JsonValue]` и обязательный mode. После проверки схемы `apply_events` передаёт словарь в общие фильтры и счётчики. Отдельной ветки подсчёта EnemyKilled нет. Бэк не убивает врага повторно и не проверяет состояние поля.

### Что отправляется и откуда берутся поля

| Поле | Источник |
|---|---|
| `enemy` | Полный аргумент enemy функции remove_dead_enemy, до очистки и восстановления |
| `mode` | Текущий игровой стор, который читает resolveAchievementGameMode() |

Пример запроса, enemy сокращён для чтения:

```json
{
  "events": [
    {
      "type": "enemy.killed",
      "data": {
        "enemy": {
          "id": 7,
          "color": "Bronze",
          "faction": "Soldiers",
          "deathwish": { "name": null, "description": null },
          "data": {
            "hp": 0,
            "damage": 7,
            "status": "veil",
            "base": { "base_hp": 7, "base_damage": 7 }
          }
        },
        "mode": "normal"
      }
    }
  ]
}
```

Локальный ID события не отправляется. Если умер лидер врагов, enemy содержит полный объект лидера без color. Никакого отдельного события для него нет.

### Какие контракты можно описать

Для строк ниже event = `enemy.killed`, counter = count, target — нужное количество. Добавляем mode для ограничения режима. Фильтры соединяются через И.

| Контракт | filters |
|---|---|
| Убейте 50 обычных врагов | enemy.color exists true |
| Убейте 100 лидеров врагов | enemy.color exists false |
| Убейте врагов Soldiers | enemy.color exists true, enemy.faction = Soldiers |
| Убейте золотых врагов | enemy.color = Gold |
| Убейте врагов со статусом veil | enemy.color exists true, enemy.data.status = veil |
| Убейте врагов с завещанием | enemy.color exists true, enemy.deathwish.name ne null |
| Убейте врагов с базовыми жизнями больше 50 | enemy.color exists true, enemy.data.base.base_hp > 50 |

Без ограничения color контракт учитывает и обычных врагов, и лидеров. `deathwish.name ne null` требует существующего ненулевого имени; это не проверка того, что завещание уже выполнилось — событие создаётся перед ним.

Поддерживается и streak. Для «5 Bronze подряд, повторить 5 раз» используются length 5, target 5, основной фильтр enemy.color = Bronze и два reset по enemy.killed: другой существующий цвет (ne Bronze) либо отсутствие color (лидер). Условия режима нужно указать и в основном фильтре, и в reset. Уже завершённые серии сохраняются; неподходящие события и границы боёв сами по себе серию не сбрасывают.

Unique по enemy.id считает разные виды врагов, а не разные экземпляры одного вида. Две карты врага с одним id дают два факта для count, но одно уникальное значение для unique. Чтобы исключить пересечение ID карт и лидеров, такой контракт следует ограничить одним из этих видов через color.

### Отличие от кладбища при победе

EnemyKilled — факт обработки смерти. `GameWon.enemy_grave` — состав кладбища в конце боя. Это разные данные: лидер и враг со статусом Doomed не добавляются в обычное кладбище, но их смерть через remove_dead_enemy создаёт EnemyKilled. Поэтому для «убейте суммарно» используем EnemyKilled, а для «победите с минимум 30 врагами в кладбище» — GameWon.

Защиты от повторного вызова remove_dead_enemy в трекере нет: каждый вызов создаёт новый факт. enemy.id не используется для подавления повторов, потому что в бою могут быть разные экземпляры одного врага. В мультиплеере событие создаётся у клиента, который выполняет обработчик смерти; получение состояния напарника само по себе не воспроизводит событие.

### Где смотреть код

- Единственное место вызова: [enemy_takes_damage.ts](../../src/logic/player_move/abilities/enemy_takes_damage.ts), функция remove_dead_enemy.
- Копирование enemy и добавление режима: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts).
- Общие фильтры и счётчики: [processAchievementEvents.ts](../../src/logic/achievements/processAchievementEvents.ts), [filters.ts](../../src/logic/achievements/filters.ts).
- На бэке: `services/api/app/apps/user_achievements/schemas.py` (EnemyKilledEvent/EnemyEventData/GameModeData), `logic/events.py`, `logic/filters.py`.

## EnemyShieldRemoved и EnemyArmorRemoved — снятие защиты врага

### Как события доходят до проверки контракта

**1. Игровой обработчик сохраняет врага до изменения защиты.**

```ts
const before = copyObj(enemy)
// Здесь существующая игровая логика снимает щит или броню.
trackEnemyDefenceChanges(before, enemy)
```

`before` — независимый полный снимок. Второй аргумент — тот же игровой враг после эффекта. Общая функция не снимает защиту сама: она сравнивает два состояния и сообщает о результате.

**2. trackEnemyDefenceChanges определяет, что действительно снялось.**

- Щит: до эффекта data.shield был включён, после — выключен или отсутствует. Тогда создаётся EnemyShieldRemoved. Если щита и так не было, события нет.
- Броня: отсутствующее значение считается нулём; из неотрицательного значения до эффекта вычитается неотрицательное значение после. Если разница > 0, создаётся EnemyArmorRemoved с amount этой разницы. При неизменной/возросшей броне события нет; неконечные числа не учитываются.

Примеры брони: 5 → 4 даёт amount 1; 5 → 0 даёт amount 5; 2 → 0 после способности «снять 10» даёт amount 2. То есть считаем реально снятую броню, а не запрошенную силу способности.

Если эффект снял обе защиты, функция создаст два события: сначала щит, потом броню. Оба получают полный enemy из снимка before.

**3. Мастер-функция добавляет режим и кладёт события в очередь.**

Для щита:

```ts
trackAchievementEvent({
  type: AchievementEventType.EnemyShieldRemoved,
  enemy: before,
})
```

Для брони:

```ts
trackAchievementEvent({
  type: AchievementEventType.EnemyArmorRemoved,
  enemy: before,
  amount,
})
```

У каждого события своя явная ветка в мастере. Она добавляет mode через resolveAchievementGameMode(). Затем создаются независимая JSON-копия и локальный UUID, событие передаётся в enqueueAchievementEvent. Режим в игровых местах вызова передавать не нужно.

**4. Предварительный расчёт и бэк используют общие filters и counter.**

Дополнительных сводок и специальной обработки этих событий нет. На бэке EnemyShieldRemovedData явно содержит enemy и mode; EnemyArmorRemovedData явно содержит enemy, mode и amount. Обе модели наследуют только общий Base, поля одного события не спрятаны в другом. Enemy — произвольный JSON-объект; amount — положительное конечное число.

Бэк использует переданный факт и amount: не повторяет удар, не снимает защиту в игре и не вычисляет разницу состояний заново.

### Где подключено сравнение защиты

| Место | Что может быть засчитано |
|---|---|
| hit_one_enemy | Сначала щит; если его нет — 1 единица брони. После снятия защиты ветка возвращается, поэтому один такой удар не снимает сразу щит и броню. |
| lock_enemy | Щит, если блокировка прошла. При Veil функция выходит до эффекта и события. |
| purify | Щит. Снимок сделан до удаления статуса, пассивки и завещания, поэтому фильтры видят прежние признаки. Броню эта функция не снимает. |
| Пассивка remove_shield | Щит выбранного врага |
| remove_enemy_armor | Часть или вся броня одного врага |
| remove_all_enemies_armor | Отдельное событие снятия брони для каждого врага, у которого она уменьшилась |
| Эффект Fire в effects_interaction | Щит и вся броня; может создать оба события |

Случайное снятие/поглощение брони, делегирующее в remove_enemy_armor, учитывается там же; второй вызов трекера в обёртке не нужен. Самостоятельная потеря брони вражеской пассивкой lose_armor не подключена к этим событиям.

Причину снятия не передаём: удар, блокировка, очищение и огонь подходят под один тип события. Фильтры по «только ударом» здесь отсутствуют.

### Что отправляется на бэк

Пример: эффект снял щит и 3 единицы брони у одного врага. Enemy сокращён для чтения; в реальном запросе передаётся полный снимок до эффекта.

```json
{
  "events": [
    {
      "type": "enemy.shield_removed",
      "data": {
        "enemy": {
          "id": 7,
          "color": "Bronze",
          "faction": "Soldiers",
          "data": { "shield": true, "armor": 3 }
        },
        "mode": "normal"
      }
    },
    {
      "type": "enemy.armor_removed",
      "data": {
        "enemy": {
          "id": 7,
          "color": "Bronze",
          "faction": "Soldiers",
          "data": { "shield": true, "armor": 3 }
        },
        "mode": "normal",
        "amount": 3
      }
    }
  ]
}
```

enemy.data.armor — сколько брони было до эффекта, amount — сколько снялось. При снятии 1 из 3 эти значения будут 3 и 1 соответственно. У щита amount нет: его снятие — один факт. Локальные ID в запрос не входят.

### Какие контракты можно описать

| Контракт | event | counter | Дополнительные filters |
|---|---|---|---|
| Снимите щит 10 раз | enemy.shield_removed | count, target 10 | mode = normal, если нужен обычный режим |
| Снимите броню 10 раз | enemy.armor_removed | count, target 10 | Аналогично |
| Снимите суммарно 10 единиц брони | enemy.armor_removed | sum по amount, target 10 | Аналогично |
| Снимите не менее 5 брони с одного врага за одно изменение — 3 раза | enemy.armor_removed | count, target 3 | amount >= 5 |
| Снимите щиты у золотых врагов | enemy.shield_removed | count | enemy.color = Gold |
| Снимите броню у лидеров | enemy.armor_removed | count или sum amount | enemy.color exists false |

Если цвет не ограничен, подходят и враги-карты, и лидеры. Можно сочетать режим, фракцию, статус, завещание и другие поля снимка enemy обычными AND-фильтрами.

Одна способность, снявшая всю броню у трёх врагов с запасами 2, 3 и 5, создаёт три события: count увеличится на 3, sum amount — на 10. Это не «один раз примените способность». Повторное получение и снятие защиты с того же врага считается новым фактом; unique по enemy.id, если использовать такой счётчик, считает разные ID, а не экземпляры.

Старые контракты на снятие щита/брони менять не требуется: типы событий и поля запроса сохранились, mode присутствует у обоих.

### Где смотреть код

- Сравнение before/after: [enemyEvents.ts](../../src/logic/achievements/enemyEvents.ts).
- Формирование события: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts).
- Удар: [hit_one_enemy.ts](../../src/logic/player_move/abilities/hit_one_enemy.ts).
- Броня: [ability_enemy_armor.ts](../../src/logic/player_move/abilities/ability_enemy_armor.ts).
- Блокировка/очищение: [ability_lock.ts](../../src/logic/player_move/abilities/ability_lock.ts), [ability_purify.ts](../../src/logic/player_move/abilities/ability_purify.ts).
- Пассивка: [remove_shield.ts](../../src/logic/player_move/passive_abilities/passives_card/remove_shield.ts); огонь: [effects_interaction.ts](../../src/logic/ai_move/effects_interaction.ts).
- На бэке: `services/api/app/apps/user_achievements/schemas.py` (EnemyShieldRemovedData/EnemyArmorRemovedData и их Event-модели), `logic/events.py` (общий подсчёт).

## DeckCreated, DeckSaved и DeckDeleted — операции с колодами

### Чем отличаются создание и сохранение

**DeckCreated — появилась новая колода. DeckSaved — сохранён её состав.**

При создании произошло и то, и другое. При редактировании новая колода не появилась, но состав снова сохранён. Поэтому:

| Действие | События |
|---|---|
| Создать колоду | deck.created и затем deck.saved |
| Сохранить редактирование колоды | Только deck.saved |
| Удалить колоду | Только deck.deleted |
| Загрузить/просмотреть/выбрать колоду | Ни одного из этих трёх |

Так «создайте 5 колод» не выполняется пятью редактированиями одной колоды. А «соберите полностью бронзовую колоду» можно выполнить и сразу при создании, и изменив существующую.

### Как события доходят до проверки контрактов

**1. До запроса сохраняем данные колоды.**

В DeckbuildPage функция `achievementDeckSnapshot()` создаёт независимую JSON-копию:

```ts
{
  name: this.deck.deck_name.trim(),
  leader: this.deck.leader,
  cards: this.deck.deck_is_progress.map(entry => entry.card),
  health: this.deck.health,
}
```

Снимок нужен до await: успешный запрос сбрасывает форму сборки. Cards содержит полные объекты карт без обёрток, leader — полный объект лидера. Это данные формы, а не чтение колоды из уже очищенной формы после ответа.

При удалении DeckSelection сначала находит колоду по ID, сохраняет копию `selected.deck` и заменяет cards на список полных объектов карт. Здесь сохраняются также id и остальные поля выбранной колоды. После удаления записи в сторе уже не будет.

**2. После успешной операции вызываем мастер-функцию.**

- `DeckbuildPage.save_deck`: после createUserDeck — `{type: DeckCreated, data: {deck}}`.
- `DeckbuildPage.patch_deck`: после patchUserDeck — `{type: DeckSaved, data: {deck}}`.
- `DeckSelection.confirm_delete`: после deleteUserDeck — `{type: DeckDeleted, data: {deck}}`.

Если запрос завершился ошибкой, до вызова трекера выполнение не доходит. Для создания и редактирования сначала проходит существующая проверка формы.

**3. Мастер-функция кладёт готовое data в очередь.**

Общая ветка берёт `input.data`, делает независимую JSON-копию, добавляет локальный UUID и вызывает enqueueAchievementEvent. Режима mode у этих событий нет: работа с колодой не относится к конкретному бою.

После записи DeckCreated трекер сам вызывает себя ещё раз с DeckSaved и тем же снимком колоды. Компоненту не нужно отправлять оба события вручную. Это конечный вызов: у DeckSaved нет ветки, создающей ещё одно DeckSaved.

После создания и удаления дополнительно вызывается checkCurrentDecks для контрактов «имейте сейчас N колод». Это отдельная проверка: она ставит decks.checked с пустым data только при достижении цели current и отсутствии такого сигнала в очереди. Создание/удаление само по себе не означает обязательную отправку decks.checked. При редактировании число колод не меняется.

**4. Для DeckSaved вычисляем сводку состава.**

В processAchievementEvents фронт добавляет `deck.summary = buildDeckSummary(deck.cards)` к данным обработки. В событии очереди summary отсутствует. На бэке apply_events делает то же через build_deck_summary, используя проверенный `event.data.deck.cards`.

Сводка содержит cards_count, by_color.Bronze/Silver/Gold, neutral_count и флаги all_bronze/all_silver/all_gold/all_neutral/no_neutral — такие же, как для колоды в GameWon. Лидер в подсчёт карт не входит. Пустая колода не проходит условия «все карты такие-то».

У DeckCreated и DeckDeleted сводка автоматически не строится. Для проверки состава используем DeckSaved; для факта создания/удаления доступны исходные поля deck.

**5. Общие filters и counter считают прогресс.**

Бэк принимает все три типа через DeckEventData, в котором одно поле deck. UserDeckSnapshot явно перечисляет cards, leader, name и health; наследования от DeckComposition больше нет. Дополнительные поля колоды разрешены, чтобы сохранить id и другие сведения при удалении. Поля внутри карт и лидера остаются произвольным JSON для фильтров.

Далее — общая обработка заданий. События не создают, не редактируют и не удаляют колоду повторно: игровая операция уже выполнена соответствующей ручкой.

### Что отправляется на бэк

Пример создания. Поля карты и лидера сокращены для чтения, в запросе они полные:

```json
{
  "events": [
    {
      "type": "deck.created",
      "data": {
        "deck": {
          "name": "Бронзовая колода",
          "leader": { "id": 13, "faction": "Soldiers" },
          "cards": [{ "id": 1, "color": "Bronze", "faction": "Soldiers" }],
          "health": 100
        }
      }
    },
    {
      "type": "deck.saved",
      "data": {
        "deck": {
          "name": "Бронзовая колода",
          "leader": { "id": 13, "faction": "Soldiers" },
          "cards": [{ "id": 1, "color": "Bronze", "faction": "Soldiers" }],
          "health": 100
        }
      }
    }
  ]
}
```

Пример показывает два создаваемых события. Они не обязаны попасть в один HTTP-запрос: если первое довело контракт до цели, отправка может начаться до добавления второго.

После редактирования структура та же, но событие только deck.saved. При удалении — deck.deleted и снимок удалённой колоды, включая её id. При создании/редактировании текущий snapshot не содержит ID колоды, поэтому unique по deck.id для этих событий использовать нельзя. Локальные UUID и вычисленная summary в запрос не входят.

### Какие контракты можно описать

| Контракт | event | counter и filters |
|---|---|---|
| Создайте суммарно 5 колод | deck.created | count, target 5 |
| Создайте 5 колод за Soldiers | deck.created | count, target 5, deck.leader.faction = Soldiers |
| Удалите 3 колоды | deck.deleted | count, target 3 |
| Соберите полностью бронзовую колоду | deck.saved | count, target 1, deck.summary.all_bronze = true |
| Соберите полностью серебряную/золотую колоду | deck.saved | Аналогично all_silver/all_gold |
| Соберите колоду без нейтральных/только из нейтральных | deck.saved | Аналогично no_neutral/all_neutral |
| Соберите колоду из 20 карт | deck.saved | count, target 1, deck.summary.cards_count = 20 |
| Создайте колоды за три разные фракции | deck.created | unique по deck.leader.faction, target 3; при необходимости ограничить список фракций через in |

«Имейте 5 колод» — другой контракт: decks.checked, current по decks.count. Он учитывает текущее хранение, включая базовую колоду, а не число созданий за всё время.

DeckSaved означает факт сохранения, а не уникальную колоду и не доказанное изменение её состава. Если несколько раз успешно сохранить одну и ту же подходящую колоду, count увеличивается каждый раз, пока задание не завершено. Поэтому для «соберите бронзовую колоду» используется target 1; target 5 означал бы пять подходящих сохранений, а не пять разных колод.

### Где смотреть код

- Создание, редактирование и снимок формы: [DeckbuildPage.vue](../../src/pages/DeckbuildPage.vue).
- Удаление и снимок выбранной колоды: [DeckSelection.vue](../../src/components/DeckSelection.vue).
- Дополнительное DeckSaved и проверка количества: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts), [currentDecks.ts](../../src/logic/achievements/currentDecks.ts).
- Сводка и предварительный подсчёт: [deckSummary.ts](../../src/logic/achievements/deckSummary.ts), [processAchievementEvents.ts](../../src/logic/achievements/processAchievementEvents.ts).
- На бэке: `services/api/app/apps/user_achievements/schemas.py` (UserDeckSnapshot/DeckEventData и три Event-модели), `logic/events.py`, `logic/decks.py`.

## DecksChecked — сколько колод сейчас хранится у игрока

**DeckCreated считает создания за всё время. DecksChecked проверяет количество колод сейчас.** Например, создали пять колод, удалили четыре: число созданий осталось пять, а число хранящихся колод уменьшилось. Базовая колода тоже входит в хранение.

Это событие — просьба проверить состояние. Фронт не сообщает серверу ни количество, ни список колод: сервер сам читает их из БД.

### Как событие доходит до проверки контракта

**1. Фронт проверяет количество после загрузки, создания и удаления.**

При загрузке installAchievementSync ждёт три мутации: `set_decks`, `setUserAchievements` и `setAchievementsConfig`. Когда загружены колоды, прогресс и конфиги, один раз вызывает checkCurrentDecks. После входа/выхода из аккаунта флаги этой первичной проверки сбрасываются.

Ещё два места вызова — мастер-функция после DeckCreated и DeckDeleted. Операция с колодой к этому моменту уже успешно завершилась. Редактирование не меняет количество, поэтому после DeckSaved такой проверки нет.

**2. checkCurrentDecks сначала проверяет цель локально.**

Функция берёт `store.getters.all_decks.length` и передаёт его в previewCurrentDecks вместе с конфигами и подтверждённым прогрессом. Preview создаёт временное событие:

```ts
{
  id: "current-decks-preview",
  type: AchievementEventType.DecksChecked,
  data: { decks: { count } },
}
```

Оно нужно только для локального вызова processAchievementEvents: в очередь и HTTP-запрос этот объект не попадает. Общий обработчик проверяет filters и подставляет число колод в current-счётчик.

Если пользователь не авторизован, ни одна незавершённая цель не достигнута или в pendingEvents уже есть DecksChecked, новый сигнал не создаётся. Проверка наличия здесь относится именно к ожидающей очереди, не к уже отправленной пачке.

**3. При достижении цели отправляем пустой сигнал.**

```ts
trackAchievementEvent({
  type: AchievementEventType.DecksChecked,
  data: {},
})
```

Трекер использует общую ветку input.data и кладёт событие в очередь. installAchievementSync распознаёт DecksChecked и запускает отправку, не дожидаясь 10 секунд или 20 событий. Если другой запрос уже выполняется, новый сигнал остаётся в очереди до следующей отправки.

На бэк уходит:

```json
{
  "events": [
    { "type": "decks.checked", "data": {} }
  ]
}
```

Ни mode, ни deck, ни count в запросе нет. В схеме бэка DecksCheckedEvent использует пустую модель ResourcesCheckedData. Название общее с проверкой ресурсов, но полей ресурсов в этой модели нет: она запрещает любые дополнительные поля через extra="forbid".

**4. Бэк сам считает колоды пользователя.**

В AchievementsService.process_events есть отдельная ветка: если в пачке присутствует DecksChecked, сервис блокирует строку пользователя в users и считает строки user_decks для его user_id. Базовая колода учитывается наравне с остальными. Количество читается один раз для всей пачки.

Блокировка согласована с созданием/удалением колод: количество остаётся стабильным до завершения транзакции проверки и награждения. Получается серверный снимок `decks = {"count": число}`.

В apply_events пустое data заменяется на:

```json
{ "decks": { "count": 5 } }
```

Именно этот объект видят фильтры и счётчик на бэке. Клиентское число из preview здесь не используется.

**5. current заменяет прогресс текущим количеством.**

Для DecksChecked схема конфигов разрешает только counter.type = current и counter.field = decks.count. Это не прибавление единицы и не сумма проверок: value становится текущим количеством, ограниченным target.

Если цель достигнута, бэк обычным способом сохраняет выполнение и выдаёт награду. После подтверждения удаление колоды уже не отменяет выполненный контракт и награду.

### Что показывается на странице

Геттер localUserAchievements отдельно вызывает previewCurrentDecks с актуальным all_decks.length. Поэтому до подтверждения прогресс виден сразу и может уменьшаться: было 4/5, удалили колоду — стало 3/5. Для каждого такого изменения запрос не требуется; промежуточные числа в БД не обязаны совпадать с отображаемыми на странице.

Сервер подтверждает количество **на момент обработки**, а не исторический максимум. Если фронт увидел 5 колод, но до серверной проверки одну удалили, бэк увидит 4 и цель 5 не подтвердит. Если же награду уже выдали, контракт остаётся выполненным.

### Пример контракта

```json
"have_decks_5": {
  "id": "have_decks_5",
  "title": "Имейте в хранении 5 колод",
  "event": "decks.checked",
  "target": 5,
  "counter": { "type": "current", "field": "decks.count" },
  "filters": {},
  "rewards": { "resources": { "money": 1000 } },
  "ordering": 10
}
```

Для целей 3, 7 или 10 меняются id, title и target. Несколько таких контрактов проверяются одним событием. Состав и фракцию конкретной колоды проверяем через DeckSaved/DeckCreated: у DecksChecked есть только общее число колод, без их объектов.

### Где смотреть код

- Локальная проверка и пустой сигнал: [currentDecks.ts](../../src/logic/achievements/currentDecks.ts).
- Первичная проверка и немедленная отправка: [syncAchievementEvents.ts](../../src/logic/achievements/syncAchievementEvents.ts).
- Проверки после создания/удаления: [trackAchievementEvent.ts](../../src/logic/achievements/trackAchievementEvent.ts).
- Прогресс на странице: localUserAchievements в [achievements.ts](../../src/store/modules/achievements.ts).
- Общий current-счётчик: [processAchievementEvents.ts](../../src/logic/achievements/processAchievementEvents.ts).
- На бэке: `services/api/app/apps/user_achievements/service.py` (чтение количества), `logic/events.py` (подстановка снимка и current), `schemas.py` (пустой вход и допустимый счётчик).

