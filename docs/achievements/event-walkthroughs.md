# События достижений: от вызова до контракта

Разбираем по одному событию: зачем оно нужно, откуда берутся данные, что отправляется и как считается прогресс. Здесь описан существующий код, а не предлагаемый рефакторинг. Первая разобранная глава — `GameWon`; остальные события пока описаны в [events.md](events.md).

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

