# События и интеграции

Пути ниже относятся к `event.data`. На фронте используем enum из `src/types/achievements.ts`. Для события нового wire-типа изменить также discriminated union бэка; дополнительный фильтр по существующему полю снимка не требует нового события.

## События, уходящие на бэк

| type | data | Примеры |
|---|---|---|
| `action.played` | `{actor: <полный Card или Leader>}` | count зарядов, unique actor.id, фильтры actor.color/faction/type/data.damage |
| `resource.spent` | `{resources: {money: 100}, subtype?: string}` | sum resources.money; use_inventory_item для обычного инвентаря |
| `resource.gained` | `{resources: {money: 100}, subtype?: string}` | фактический доход с учётом лимитов |
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
- `ActionPlayed` принимает `{type, actor}`; в очереди будет `{type, data: {actor}}`.

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
| `src/mixins/GamePage/useInventory.ts` | после processResources вне arena_mode, subtype use_inventory_item; один предмет за операцию |
| `src/components/ModalWindows/CardModal.vue` | ActorTransition после craft/mill карты/лидера |
| `src/pages/UpgradesPage.vue` | UpgradeChanged после postUserUpgrade |
| `src/store/modules/achievements.ts` | после подтверждения: доход из granted_rewards, проверка current баланса |

Не подключены: ArenaUpgradesModal, отдельные arena.inventoryCounts, оплаченные покупки PaymentResultPage. Начальные GET и обновление всего баланса не превращать в доход за всё время. `processCraftBonusCard` меняет коллекцию карт, не является платным craft и не считается actor.transformed.

При новом месте изменения ресурсов сначала искать `processResources`, `set_resource`, альтернативные ответы с resources и прямые изменения баланса. Не добавлять общий трекер к каждой мутации стора: загрузка/подтверждение/новая операция имеют разную семантику.
