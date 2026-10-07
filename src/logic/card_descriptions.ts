import type {
  Card,
  EffectInfo,
  EffectObject,
  EffectType,
  Enemy,
  EnemyLeader,
  Leader,
} from "@/types"

type DescriptionCard = Card | Leader | Enemy | EnemyLeader
type EffectsInfo = Partial<Record<EffectType, EffectInfo>>

// Keep unknown placeholders and the existing {{ number }} display convention.
function substitute(
  description: string | null | undefined,
  values: Record<string, number | undefined>
): string {
  return (description ?? "").replace(
    /\{(\w+)\}/g,
    (placeholder, key: string) =>
      values[key] !== undefined ? `{{ ${values[key]} }}` : placeholder
  )
}

function describeEffect(
  effect: EffectObject | null | undefined,
  effectsInfo: EffectsInfo
): string {
  if (!effect) return ""
  const description = substitute(effectsInfo[effect.type]?.description, {
    value: effect.value,
  })
  const parts = description ? [`\nЭффект: ${description}`] : []
  if (effect.times_count !== undefined) {
    parts.push(`\nЭффект длится ${effect.times_count} раз`)
  } else if (effect.turns !== undefined) {
    parts.push(`\nЭффект длится ${effect.turns} ходов`)
  }
  return parts.join("\n")
}

export function describeCardAbility(
  card: DescriptionCard,
  effectsInfo: EffectsInfo
): string {
  if (!("ability" in card)) return ""
  const data = card.data
  const parts = [
    card.ability?.name
      ? substitute(card.ability.description, {
          damage: "damage" in data ? data.damage : undefined,
          armor: "armor" in data ? data.armor : undefined,
          heal: "heal" in data ? data.heal : undefined,
          damage_once: data.value,
          value: data.value ?? data.passive?.value,
        })
      : "",
  ]
  if ("multi" in data && data.multi) {
    parts.push(`\nКарта бьет по ${data.multi.value} целям`)
  }
  if ("field_interaction" in data) {
    parts.push(describeEffect(data.field_interaction, effectsInfo))
  }
  return parts.filter(Boolean).join("\n")
}

export function describeCardPassiveAbility(
  card: DescriptionCard,
  effectsInfo: EffectsInfo
): string {
  if (!card.passive_ability?.name) return ""
  const passive = card.data.passive
  const effect = passive?.field_interaction
  const parts = [
    substitute(card.passive_ability.description, {
      value: passive?.value ?? effect?.turns ?? effect?.times_count,
    }),
    describeEffect(effect, effectsInfo),
  ]
  if (passive) {
    if ("has_passive_in_field" in passive && passive.has_passive_in_field)
      parts.push("\nСрабатывает когда карта НА ПОЛЕ")
    else if ("has_passive_in_hand" in passive && passive.has_passive_in_hand)
      parts.push("\nСрабатывает когда карта В РУКЕ")
    else if ("has_passive_in_deck" in passive && passive.has_passive_in_deck)
      parts.push("\nСрабатывает когда карта В КОЛОДЕ")
    else if ("has_passive_in_grave" in passive && passive.has_passive_in_grave)
      parts.push("\nСрабатывает когда карта В СБРОСЕ")
    if (passive.each_tick)
      parts.push("\nСрабатывает каждый ход пока таймер не равен 0")
    if (passive.reset_timer)
      parts.push(
        `\nВосстанавливает таймер. Значение таймера ${passive.default_timer ?? ""}`
      )
  }
  return parts.filter(Boolean).join("\n")
}

export function describeEnemyMove(card: DescriptionCard): string {
  if (!("move" in card)) return ""
  return substitute(card.move.description, { damage: card.data.damage })
}

export function describeEnemyDeathwish(
  card: DescriptionCard,
  effectsInfo: EffectsInfo
): string {
  if (!("deathwish" in card) || !card.deathwish?.name) return ""
  const deathwish = card.data.deathwish
  const effect = deathwish?.field_interaction
  return [
    substitute(card.deathwish.description, {
      deathwish_value: deathwish?.value ?? effect?.turns ?? effect?.times_count,
    }),
    describeEffect(effect, effectsInfo),
  ]
    .filter(Boolean)
    .join("\n")
}
