# События и интеграции

Пути ниже относятся к `event.data`. На фронте используем enum из `src/types/achievements.ts`. Для события нового wire-типа изменить также discriminated union бэка; дополнительный фильтр по существующему полю снимка не требует нового события.

## События, уходящие на бэк

| type | data | Примеры |
|---|---|---|
| `action.played` | `{actor: <полный Card или Leader>, mode}` | count зарядов, unique actor.id, фильтры actor.color/faction/type/data.damage |
| `game.started` / `game.won` | `{mode}` | count начатых/выигранных боёв |
| `resource.spent` | `{resources: {money: 100}, subtype?: string, item?: string}` | sum resources.money; use_inventory_item для обычного инвентаря |
| `resource.gained` | `{resources: {money: 100}, subtype?: string}` | фактический доход с учётом лимитов |
| `deck.saved` | `{deck: {name, leader, cards, health}}` | сохранение после создания или редактирования, вычисляемая deck.summary |
| `deck.created` / `deck.deleted` | `{deck: {name, leader, cards, health, id?}}` | count успешных операций, фильтр deck.leader.faction; cards — полные объекты карт |
| `decks.checked` | `{}` | current по decks.count из БД, включая базовую колоду |
| `inventory.used` | `{item: "draw_cards", result: {cards_drawn: 3}}` | count применений с фактическим результатом; пока только draw_cards вне арены |
| `resource.opened` | `{resource: "kegs"}` | count открытий; keys, kegs, big_kegs, chests |
| `resource.transformed` | `{action, resource, amount, spent, gained}` | buy/sell/craft/mill; amount = quantity × step |
| `actor.transformed` | `{action, actor, recipe, spent, gained}` | craft/mill карты или лидера, unique actor.faction |
| `upgrade.purchased` | `{upgrade_type, upgrade_subtype, level, value, maxed}` | count покупок, фильтры типа/подтипа |
| `resources.checked` | `{}` | current по resources.money; серверный баланс |
| `upgrades.checked` | `{}` | current по серверным прокачкам/сводке |

spent/gained содержат положительные количества и могут быть пустыми. recipe в actor.transformed сохраняет исходные знаки; для rare_gem можно проверять `recipe.rare_gem ne 0` либо фактический `spent.rare_gem gt 0`. resource.transformed не содержит recipe — не смешивать два формата.

Старые `card.played`, `leader.played`, `rarity`, одиночные resource/amount для расходов не являются текущим контрактом API.

Сыгранная карта/лидер — один израсходованный заряд, не один поражённый враг. Различение: `actor.color exists true` — карта, `false` — лидер. У карт цвета Bronze/Silver/Gold, регистр сохраняется; actor.faction — строка, не объект name. Для passive null и отсутствующее поле разные случаи. Снимок берётся до расходования заряда/эффектов; трекер вызывается после расходования. У multi-target один вызов вне цикла целей.

## Локальные входы мастер-функции

Не отправлять эти промежуточные типы в API:

- `ResourcesChanged`: `{resources, before?, after?, subtype?}` или `{before, after, subtype?}`. С явным resources минусы становятся расходом; плюсы требуют обоих снимков и ограничиваются `min(requested, max(0, after-before))`. Без resources разница балансов разделяется на расходы и доходы. Пустые/nonfinite значения не создают событий.
- `ResourceGained` дополнительно принимает `{before, after}` локально: только положительная разница; не превращает падение баланса в расход. Wire-форма у него всегда resources.
- `ResourceTransition`: `{resource, action, quantity, step, recipe, before, after}`. Формирует обычные расходы/доходы и resource.transformed. Рецепт за операцию дополняется знаком изменения самого ресурса, умножается на quantity. amount не обрезается лимитом повторно: UI уже проверяет допустимость обмена.
- `ActorTransition`: `{action, actor, recipe, before, after}`. Разница балансов + actor.transformed; снимок actor и recipe до await. Это заменяет старый ResourcesChanged в том же месте, а не добавляется рядом с ним.
- `UpgradeChanged`: `{upgrade_type, upgrade_subtype, upgrades, before, after}`. Расход/доход, один upgrade.purchased, проверки current. Ответ postUserUpgrade теперь весь UpgradesResponse, не только resources.
- `ActionPlayed` принимает `{type, actor}`; трекер добавляет текущий mode, в очереди будет `{type, data: {actor, mode}}`.
- `GameStarted`/`GameWon` принимают `{type, mode?}`; трекер определяет режим, если он не задан. Wire-форма — `{type, data: {mode}}`.

Не считать награды из обещания в конфиге, когда уже есть серверный фактический доход. При лимите 5000 и изменении 4900 → 5000 награда 1000 даёт событие +100; повтор при 5000 → 5000 — ни одного доходного события.

## Проверка прокачек

`upgradeSnapshot.ts` и backend `logic/upgrades.py` строят одинаковые данные для current:

```text
upgrades.<upgrade_type>.<upgrade_subtype>.level
upgrades.<upgrade_type>.<upgrade_subtype>.value
summary.<group>.total_count
summary.<group>.maxed_count
summary.<group>.all_maxed
```

Groups: game/resources/settings/inventory, all, non_settings. maxed по `next === null`, отсутствующая пользовательская ступень по умолчанию 0. Неизвестная ступень не считается максимумом, параметр остаётся в total_count. all_maxed — число 0/1, пустая группа не считается завершённой. Порог «всё» обычно target 1; это не индикатор количества прокачанных параметров. Для «хотя бы один максимум кроме Settings» — summary.non_settings.maxed_count, target 1.

Для размера колоды используется `upgrades.game.max_cards_in_deck.value`, не hand_size и не номер ступени. Выбранный target должен реально существовать/достигаться в актуальном game_const. Список параметров для «всё» берётся из текущего конфига: новые параметры влияют на ещё не выполненный контракт, но не отменяют подтверждённое выполнение.

## Места вызова (2026-11-13)

| Место | Что учитывается |
|---|---|
| `src/logic/player_move/player_move.ts`: damage_ai_card, damage_ai_card_multi | ActionPlayed; полный снимок карты/лидера |
| `src/pages/StartGame.vue` | плата за обычный уровень |
| `src/pages/WinPage.vue`: pay_resources | награда за победу, before/after + запрошенная сумма |
| WinPage.open_levels | ресурсы за первое прохождение/завершение сезона; before после обычной награды, after из openRelatedLevels; null пропускается |
| `src/pages/ArenaStartGame.vue`, `ArenaWinPage.vue` | плата/награда за уровень арены |
| `src/pages/LevelPage.vue` | вход на арену |
| `src/pages/BonusPage.vue`: pay_resource | контейнеры/ключи и принятие награды ключа |
| BonusPage.handleAction | ResourceTransition |
| BonusPage.openResource | успешное открытие одного ресурса; ключ считается при открытии выбора, не при принятии награды |
| `src/mixins/GamePage/useInventory.ts` | после processResources вне arena_mode, subtype use_inventory_item, item — название предмета; один предмет за операцию |
| `src/components/ModalWindows/CardModal.vue` | ActorTransition после craft/mill карты/лидера |
| `src/pages/UpgradesPage.vue` | UpgradeChanged после postUserUpgrade |
| `src/store/modules/achievements.ts` | после подтверждения: доход из granted_rewards, проверка current баланса |

Не подключены: ArenaUpgradesModal, отдельные arena.inventoryCounts, оплаченные покупки PaymentResultPage. Начальные GET и обновление всего баланса не превращать в доход за всё время. `processCraftBonusCard` меняет коллекцию карт, не является платным craft и не считается actor.transformed.

При новом месте изменения ресурсов сначала искать `processResources`, `set_resource`, альтернативные ответы с resources и прямые изменения баланса. Не добавлять общий трекер к каждой мутации стора: загрузка/подтверждение/новая операция имеют разную семантику.

## Уникальные использованные предметы

При обычном использовании инвентаря ResourcesChanged получает item (InventoryItem) и переносит его в resource.spent. Схема бэка принимает необязательное item (ResourceType). Для «используйте каждый предмет» ставим unique по item, subtype = use_inventory_item и фильтр item in со списком предметов. Старые расходы без item работают как раньше, но не продвигают этот unique-контракт. Прошлые использования не восстанавливаются. Арена остаётся отдельно и не учитывается.

## Результат использования инвентаря

`useInventory.ts` отправляет `inventory.used` после синхронного цикла draw_cards. `result.cards_drawn` — разница размера руки после и до цикла, включая ноль, а не число попыток или значение INVENTORY_CARDS_DRAWN. Списание остаётся отдельным resource.spent до применения эффекта; новое событие повторно ресурсы не списывает и не считает расход.

Для «взять ровно 3 карты пять раз» используются filters item = draw_cards и result.cards_drawn = 3, counter count, target 5. Для «не менее 3» нужен gte. Схемы фронта и бэка пока описывают только результат cards_drawn; другие эффекты ещё не подключены. Фактический результат сообщает клиент, сервер не симулирует добор карт. Арена по-прежнему исключена.

## Колоды

DeckbuildPage.save_deck сохраняет снимок перед createUserDeck, отправляет deck.created после успешного завершения. DeckSelection.confirm_delete сохраняет снимок перед deleteUserDeck, отправляет deck.deleted после успеха. В снимке cards — массив объектов карт, leader — полный объект лидера. Новый ID создания в ответе отдельно не выделяется и в снимке создания отсутствует. patchUserDeck создаёт только deck.saved, не deck.created. Экшены колод не вызывают трекер.

Трекер после deck.created формирует также deck.saved; после deck.created/deleted вызывает checkCurrentDecks. Первичная проверка ждёт set_decks, setUserAchievements и setAchievementsConfig. Preview использует all_decks.length; бэк принимает пустой decks.checked и считает строки user_decks с блокировкой users, общей с операциями над колодами. В decks.count входит базовая колода id=1. При локальном достижении цели проверка отправляется немедленно. До подтверждения количество может уменьшаться; после подтверждения выполнение сохраняется. Сервер проверяет актуальное количество на момент обработки, не исторический пик.

Создания и удаления до подключения событий не восстанавливаются; загрузка списка не считается созданием. События операций, как и другие факты клиента, не подтверждаются отдельной историей в БД.

### Состав сохранённой колоды

Для deck.saved фронтовый processAchievementEvents и backend logic/decks.py вычисляют deck.summary из deck.cards. Сводка не отправляется отдельным источником истины: любое переданное summary при обработке заменяется. Поля: cards_count, by_color.Bronze/Silver/Gold, neutral_count, all_bronze/all_silver/all_gold, all_neutral, no_neutral. Лидер не учитывается. Фракция нейтральных карт — строка Neutral. Пустой состав не проходит ни один all_* или no_neutral; неизвестные цвета не проходят all_<color>, отсутствующая фракция не проходит no_neutral.

Создание автоматически порождает одно deck.saved внутри трекера; patch_deck вызывает его напрямую после успеха. Снимок создаётся до запроса и сброса формы. Загрузка уже сохранённых колод не создаёт это событие. Повторное сохранение — новый факт; контракты с count/target 1 выдаются однократно. Счётчики по summary могут использовать обычные вложенные пути; для ровно 20 карт фильтр deck.summary.cards_count = 20.

## Режимы и результаты боя

AchievementGameMode: normal (обычные сезоны), random_n, random, multiplayer, arena. Это значения для контрактов; в leaderboard обычный режим по-прежнему называется season. `gameMode.ts` определяет режим по multiplayer-имени уровня, затем arena_mode, затем random_n/random, иначе normal. Имя multiplayer сохраняется после multi_reset, поэтому результат обоих участников относится к нужному режиму.

ActionPlayed вызывается в двух общих обработчиках player_move. Считается один заряд карты/лидера; для контрактов только на карты нужен actor.color exists true. В мультиплеере каждый клиент вызывает обработчик для своей карты. Входящий GAME_STATE только обновляет поле, не воспроизводит attack и не создаёт событие карты напарника.

GamePage после разрешённого перехода и start_game отправляет game.started (normal/random/random_n/arena). При отсутствии start_game_redirect делает return после перенаправления и не инициализирует бой. MultiplayerGamePage отправляет game.started отдельно на каждом клиенте после initAsHost/initFromStore; ожидание матчмейкинга не считается.

WinPage/ArenaWinPage отправляют game.won после проверки и потребления одноразового win_redirect, до отдельных запросов статистики/наград. Оба участника кооператива переходят в WinPage с этим флагом: каждый отправляет свою победу. Нет запроса за другого пользователя и нет гарантированного начисления офлайн-напарнику. Арена: старт/победа относятся к отдельному бою, не к полному забегу.

`mode` обязателен в backend action.played/game.started/game.won. Существующие вызовы ActionPlayed в компонентах не требуют дополнительных аргументов. Фильтр режима всегда задаётся конфигом; отсутствие mode-фильтра означает все режимы. Чтобы ограничить старые permanent action.played обычным режимом, выполнить normal-mode-card-contracts.sql. Он не меняет прогресс, даты наград и уже явно заданные mode-фильтры. Категории random_n/random/multiplayer/arena находятся в config-examples.json внутри permanent.categories; копировать нужно выбранные категории, а не весь файл поверх game_const. Эти файлы не применяются к БД автоматически.
