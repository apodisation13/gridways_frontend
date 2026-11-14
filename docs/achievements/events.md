# События и интеграции

## Убийства и снятие защиты врагов

- `enemy.killed`: `{enemy, mode}`. Полный снимок врага до очистки статуса, восстановления HP и завещания. Источники: `remove_dead_enemy`, уничтожение в колоде `destroy_random_enemy_in_deck`, уничтожение занятой клетки `move_enemy`. Замена своей картой `place_self_in_field` не считается убийством. По принятому решению защита от повторного вызова смерти не добавлена.
- `enemy.shield_removed`: `{enemy, mode}`. Только переход от имеющегося щита к отсутствующему, без причины снятия.
- `enemy.armor_removed`: `{enemy, mode, amount}`. `amount` — фактически снятая броня, ограниченная имеющимся запасом. `count` считает один факт на одного врага, `sum amount` — количество снятых единиц.

Вызовы игровых функций сообщают изменения через `enemyEvents.ts`: снимок до эффекта и объект после. Отправка проходит через общую мастер-функцию, которая добавляет mode. Подключены hit_one_enemy, remove_enemy_armor, remove_all_enemies_armor, lock_enemy, purify, пассивка remove_shield и эффект Fire. Обёртки случайного снятия/поглощения брони и special-case уже вызывают remove_enemy_armor и не создают второго события. Массовое снятие даёт событие на каждого врага. Огонь может создать оба события, если снял обе защиты. Нулевые изменения и пассивная потеря своей брони `lose_armor` не учитываются.

Мультиплеер: события создаёт клиент, исполняющий игровую функцию; полученный GAME_STATE не воспроизводит снятие/убийство. Здесь нет распределения общей награды за убийство напарнику. Снимок `enemy` может быть обычным врагом или лидером; различение — `enemy.color exists true/false`. Фильтры смотрят статус/завещание на момент убийства, а не их наличие в базовом каталоге.

Пути ниже относятся к `event.data`. На фронте используем enum из `src/types/achievements.ts`. Для события нового wire-типа изменить также discriminated union бэка; дополнительный фильтр по существующему полю снимка не требует нового события.

## События, уходящие на бэк

| type | data | Примеры |
|---|---|---|
| `passive.triggered` | `{actor: <полный Card или Leader>, mode, location}` | count активаций, location hand/deck/grave/passive_once; лидер отличается отсутствием actor.color |
| `action.played` | `{actor: <полный Card или Leader>, mode}` | count зарядов, unique actor.id, фильтры actor.color/faction/type/data.damage |
| `game.lost` | `{mode}` | факт поражения, в том числе reset для streak |
| `game.won` | `{mode, difficulty?, starting_deck?, leader_uses?}` | count побед, условия по исходному составу и применению лидера |
| `arena.upgrade.purchased` | `{upgrade_subtype, level}` | count успешных покупок прокачек арены |
| `arena.level.reached` | `{level}` | count/target 1 с фильтром level gte N |
| `inventory.restored` | `{item, mode}` | count восстановлений предмета кнопкой |
| `resource.spent` | `{resources: {money: 100}, subtype?: string, item?: string}` | sum resources.money; use_inventory_item для обычного инвентаря |
| `resource.gained` | `{resources: {money: 100}, subtype?: string}` | фактический доход с учётом лимитов |
| `deck.saved` | `{deck: {name, leader, cards, health}}` | сохранение после создания или редактирования, вычисляемая deck.summary |
| `deck.created` / `deck.deleted` | `{deck: {name, leader, cards, health, id?}}` | count успешных операций, фильтр deck.leader.faction; cards — полные объекты карт |
| `decks.checked` | `{}` | current по decks.count из БД, включая базовую колоду |
| `inventory.used` | `{item, mode, result: {cards_drawn?: number}}` | одно событие применения любого предмета во всех режимах |
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
- `GameWon` принимает `{type, mode?}`; трекер определяет режим и дополняет событие статистикой боя и составом кладбища.

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

Не подключены: расход ресурсов на прокачки ArenaUpgradesModal, оплаченные покупки PaymentResultPage. Покупки прокачек арены и применения arena.inventoryCounts учитываются отдельными событиями. Начальные GET и обновление всего баланса не превращать в доход за всё время. `processCraftBonusCard` меняет коллекцию карт, не является платным craft и не считается actor.transformed.

При новом месте изменения ресурсов сначала искать `processResources`, `set_resource`, альтернативные ответы с resources и прямые изменения баланса. Не добавлять общий трекер к каждой мутации стора: загрузка/подтверждение/новая операция имеют разную семантику.

## Уникальные использованные предметы

При обычном использовании инвентаря ResourcesChanged получает item (InventoryItem) и переносит его в resource.spent. Схема бэка принимает необязательное item (ResourceType). Для «используйте каждый предмет» ставим unique по item, subtype = use_inventory_item и фильтр item in со списком предметов. Старые расходы без item работают как раньше, но не продвигают этот unique-контракт. Прошлые использования не восстанавливаются. Арена остаётся отдельно и не учитывается.

## Результат использования инвентаря

`useInventory.ts` отправляет одно inventory.used после применения любого предмета, включая арену. item и mode обязательны; result пустой для неизмеряемых эффектов. Для draw_cards result.cards_drawn — реальная разница размера руки, включая ноль. Режим сохраняется до await: предмет может закончить бой. Отдельного события внутри ветки draw_cards больше нет. Обычное списание resource.spent остаётся до эффекта; аренный предмет его не создаёт.

Старые контракты по resource.spent/use_inventory_item не изменяются и по-прежнему учитывают только обычный запас инвентаря. Старому контракту на добор 3 карт для сохранения прежнего охвата добавить mode ne arena (либо mode normal для только обычного режима). Фильтр режима задаётся отдельно по нужному охвату. Для контракта на все применения в арене: inventory.used, mode arena, count.

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

GamePage после разрешённого перехода и start_game вызывает startAchievementBattle: только локальный снимок для условий победы, без события или запроса на бэк. При отсутствии start_game_redirect делает return после перенаправления и не инициализирует бой. MultiplayerGamePage сохраняет такой же локальный снимок на каждом клиенте после initAsHost/initFromStore.

WinPage/ArenaWinPage отправляют game.won после проверки и потребления одноразового win_redirect, до отдельных запросов статистики/наград. Оба участника кооператива переходят в WinPage с этим флагом: каждый отправляет свою победу. Нет запроса за другого пользователя и нет гарантированного начисления офлайн-напарнику. Арена: старт/победа относятся к отдельному бою, не к полному забегу.

`mode` обязателен в backend action.played/game.won. Существующие вызовы ActionPlayed в компонентах не требуют дополнительных аргументов. Фильтр режима всегда задаётся конфигом; отсутствие mode-фильтра означает все режимы. Чтобы ограничить старые permanent action.played обычным режимом, выполнить normal-mode-card-contracts.sql. Он не меняет прогресс, даты наград и уже явно заданные mode-фильтры. В config-examples.json оставлены характерные примеры режимов; другие режимы используют те же поля. Копировать нужно выбранные задания, а не весь файл поверх game_const. Эти файлы не применяются к БД автоматически.

## Контракты арены и статистика боя

AchievementsState.battle хранит mode, difficulty, независимые starting_deck.cards и starting_deck.leader, leader_uses. Прямой вызов startAchievementBattle из страницы игры заменяет снимок через battle.ts из game.current_deck; применённый лидер в ActionPlayed увеличивает leader_uses до постановки события в очередь. Возврат/изменение зарядов счётчик не уменьшает. На GameWon снимок копируется в событие и очищается. На LosePage и resetAchievementSession очищается; новый старт всегда заменяет предыдущий снимок, в том числе после выхода из боя. Если снимок отсутствует или режим не совпал, game.won не содержит starting_deck/leader_uses: отсутствие не считается нулём.

Frontend preview и backend events.py пересчитывают starting_deck.summary общей функцией сводки состава, не доверяя переданному summary. Лидер исключён. Контракт без золотых требует непустой колоды и by_color.Gold = 0; только бронзовые — all_bronze = true. Три победы без лидера — count/target 3, leader_uses = 0, mode arena, не серия. Обычные game.won-контракты без этих фильтров работают как прежде. Бэк принимает исходный состав/счётчик от клиента, не симулирует бой.

ArenaUpgradesModal.doUpgrade отправляет arena.upgrade.purchased после успешной оплаты и arena_increment_upgrade; расход ресурсов в этом месте пока отдельно не подключён. ArenaDeckbuildPage.restore_inventory отправляет inventory.restored после проверки доступности и мутации восстановления, не после покупки ARENA_RESTORE_SLOT. ArenaWinPage после arena_advance_level отправляет arena.level.reached: выигрыш уровня 4 означает достижение 5. Проверки по level gte N с target 1; загрузка старого состояния пока не даёт ретроспективных событий. В категории arena оставлены характерные примеры без повторения порогов.

В текущей схеме бэка режимы используют LeaderboardGameMode плюс literal normal для контрактов обычного режима. Поле mode у inventory.used теперь обязательно. result — словарь неотрицательных целых результатов; пока фронт измеряет только cards_drawn.

## Победы обычного режима

Каждое `game.won` также содержит `enemy_grave: {total, bronze, silver, gold}`. `finishAchievementBattle` считает текущий `game.enemies_grave` на момент победы, до очистки игрового состояния. Лидер туда не попадает и к total не прибавляется; повторяющиеся экземпляры считаются отдельно. Это состав кладбища, а не накопленная история убийств. Данные добавляются во всех режимах; backend принимает неотрицательные целые, поле необязательно для совместимости со старыми событиями. Вложенные фильтры и count обрабатываются обычным механизмом.

При старте battle.ts копирует полного лидера из game.leader в starting_deck.leader и difficulty из game.level. На победе оба поля берутся из этого снимка, не из текущего изменяемого состояния. Фильтры: mode normal, starting_deck.leader.faction Soldiers, difficulty easy/normal/hard. Сводка starting_deck.summary по-прежнему считает только карты, не лидера. Без снимка дополнительные поля не подставляются. Backend GameWonData принимает необязательную difficulty (easy/normal/hard), лидер уже входит в произвольный словарь starting_deck.

Категория normal демонстрирует фракцию лидера, сложность, отсутствие применения лидера и серию побед. Сложность normal и режим normal — разные поля. Повторное прохождение уровня считается новой победой; последовательность требуется только для streak.

GameLost вызывается только из фактических веток поражения; принимает {type}, читает режим из battle и очищает его. Повторный вызов без battle ничего не отправляет. LosePage, выход и ожидание матча не создают события поражения. Для streak условия сброса задаются непустым массивом counter.reset отдельно от основного event задания. Достаточно совпадения одного элемента; повторяющиеся типы событий в индексе не дублируют обработку задания.

## Активации пассивных способностей

PassiveTriggered принимает {type, actor, location}; трекер добавляет mode по текущему режиму. actor — владелец пассивки, не карта, запустившая реакцию лидера. Снимок сохраняется до эффекта. Используются общие вложенные фильтры по actor, mode, location. Событие не увеличивает leader_uses: пассивка лидера не является применением его заряда.

Четыре источника:
- player_move/passive_abilities/passives_dispatcher.run_passive: после allowActionTimer и вызова поддерживаемого обработчика. Допускается бесполезный эффект без цели; неизвестная/отсутствующая пассивка не считается.
- leader_passive_abilities_upon_playing_a_card: boolean от конкретной условной способности; событие только при true. location hand, actor лидер. Много целей обрабатываются все; один вызов диспетчера даёт максимум одно событие.
- passives_upon_playing_a_card: DamageWheneverLock возвращает true при выполненном условии перехода врага в locked и ненулевом значении эффекта; событие для каждой подходящей карты.
- passives_upon_beginning: SetSelfAsDeckLen возвращает true при выполнении условия единственной нейтральной карты; location passive_once, снимок до изменения параметров.

Для условных способностей добавлено возвращаемое boolean без изменения условий/порядка применения эффектов. При неизвестной или неподходящей способности нет события. Тип run_passive остаётся прежним; расположение не переопределяется: согласно конфигу флаги зон взаимоисключающие. Лидер исторически проходит как hand. Поэтому контракт «карта в руке» обязательно фильтрует actor.color exists true, а контракт лидера — exists false. Вражеские пассивки не подключены. Мультиплеер использует локальные обработчики владельца; обновления состояния напарника сами событий не создают.

В категории passives оставлены примеры hand, leader и passive_once, mode normal. Сменить режим можно одним фильтром; исходный снимок позволяет фильтровать цвет, фракцию, урон и название способности. Текущая очередь не гарантирует доставку, как и для остальных фактов.

Пассивки начала боя используют отдельную location passive_once (событие остаётся passive.triggered). Поэтому они больше не увеличивают контракты с location deck. В категории passives оставлен passive_once_10, mode normal. Одна успешно применённая пассивка одной карты — одно событие; это не счётчик начатых боёв. Ранее накопленный прогресс deck автоматически не пересчитывается.
