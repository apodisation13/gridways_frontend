import { defineComponent } from "vue"

import { choice_element, copyObj } from "@/lib/utils"
import { timeoutAnimationFlag } from "@/logic/game_logic/timers"
import { sound_passive_increase_damage } from "@/logic/play_sounds"
import {
  change_card_charges,
  enemy_as_card,
  remove_dead_card,
} from "@/logic/player_move/service/service_for_player_move"
import type { Card, CardEntry, Enemy, Leader } from "@/types"
import { CardAbility, CardColor, CardType } from "@/types"

export default defineComponent({
  data() {
    return {
      ability: "" as string, // параметр для выхода из эмита
      selectedCardAbilityDescription: "" as string, // описание абилки той карты, которую мы изначально играли
      cards_pool: [] as (Card | Enemy)[], // список карт, которые будем показывать в окне
      show_pick_a_card_selection: false,
      show_picked_card: false, // показать ли выбранную карту из абилок play_from_
      special_case_value: null as number | null, // сохраняем какое-то особое значения для абилок
      enemyView: false, // показать окно с картами или с картами, или с врагами
      sca: false, // КОСТЫЛЬ: играем ли мы доп карту! (чтобы не заблокировать руку когда доп карта играется из лидера!)
      dead_card: null as Card | Leader | null, // КОСТЫЛЬ: тут мы запоминаем исходную карту, которой играли 1й раз, чтобы сбросить ее ПОСЛЕ закрытия окна
    }
  },
  methods: {
    // !!!МЕНЕДЖЕР особых абилок, которые требуют каких-либо окон!!!
    special_case_abilities() {
      // в этой функции мы подготавливаем cards_pool - список карт, которые будут в открывшемся окне
      // ещё мы запоминаем способность (ability) и если есть то значение (speical_case_value)
      // сам выбор карты - в следующей функции
      const ability = this.selected_card!.ability.name

      if (ability === CardAbility.Resurrect) {
        // берем из кладбища только юнитов (кроме себя, потому что сама она тоже ушла в кладбище уже)
        this.cards_pool = this.gameObj.grave.filter(
          (card: Card) =>
            card.type === CardType.Unit && card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.DrawTwoCards) {
        this.draw_one_card()
      } else if (ability === CardAbility.GiveChargesToCardInHand1) {
        // прибавляем 1 заряд бронзовой карте в руке
        this.cards_pool = this.gameObj.hand.filter(
          (card: Card) =>
            card.color === CardColor.Bronze &&
            card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.PlayFromDeck) {
        // играем бронзовую карту из колоды
        this.cards_pool = this.gameObj.deck.filter(
          (card: Card) =>
            card.color === CardColor.Bronze &&
            card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.PlayFromGrave) {
        // играем из кладбища бронзовую или серебряную карту
        this.cards_pool = this.gameObj.grave.filter(
          (card: Card) =>
            (card.color === CardColor.Bronze ||
              card.color === CardColor.Silver) &&
            card.type === CardType.Unit &&
            card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.DiscardDraw2) {
        // тут мы 1 карту сбросим, 2 возьмем
        this.cards_pool = this.gameObj.hand.filter(
          (card: Card) => card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.PlayBronzeSilverFromDeck) {
        // играем бронзовую или серебряную карту из колоды
        this.cards_pool = this.gameObj.deck.filter(
          (card: Card) =>
            card.color === CardColor.Bronze || card.color === CardColor.Silver
        )
      } else if (ability === CardAbility.IncrDmgToHandBySelfDmg) {
        // выбираем карту из руки, увеличиваем её урон на значение урона той карты, которую мы играли
        this.special_case_value = this.selected_card!.data.damage // сохранили значение урона
        this.cards_pool = this.gameObj.hand.filter(
          (card: Card) => card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.PlayEnemyFromGrave) {
        // играем бронзового ВРАГА из их кладбища (+костыль на врагов)
        this.cards_pool = this.gameObj.enemies_grave.filter(
          (e: Enemy) => e.color === CardColor.Bronze
        )
        this.enemyView = true
      } else if (ability === CardAbility.PlaySpecialFromDeck) {
        // играем любую специальную карту из колоды
        this.cards_pool = this.gameObj.deck.filter(
          (card: Card) => card.type === CardType.Special
        )
      } else if (ability === CardAbility.PlaySpecialFromGrave) {
        // играем бронзовую специальную карту из сброса
        this.cards_pool = this.gameObj.grave.filter(
          (card: Card) =>
            card.type === CardType.Special && card.color === CardColor.Bronze
        )
      } else if (ability === CardAbility.MoveEnemyFromDeckToGrave) {
        // выбираем врага из их колоды и перемещаем его в их сброс (+костыль на врагов)
        this.cards_pool = this.gameObj.enemies
        this.enemyView = true
      } else if (ability === CardAbility.DecrDmgToHandIncrToRandomHand) {
        // выбираем карту, уменьшаем ее урон на value, прибавляем value урона рандомной карте в руке
        this.special_case_value =
          (this.selected_card! as Card).data.value ?? null // сохранили значение урона
        this.cards_pool = this.gameObj.hand.filter(
          (card: Card) => card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.IncrDmgByNCharges) {
        // увеличиваем урон карты в руке на количество зарядов у той
        this.cards_pool = this.gameObj.hand.filter(
          (card: Card) => card.id !== this.selected_card!.id
        )
      } else if (ability === CardAbility.CreateSpecial) {
        // вот это сложно... выбираем 3 случайные бронзовые спец карты НЕ из фракции
        const pool = (this.$store.getters["all_cards"] as CardEntry[]).filter(
          c =>
            c.card.faction !== this.gameObj.leader.faction &&
            c.card.type === CardType.Special &&
            c.card.color === CardColor.Bronze
        )
        for (let i = 0; i < 3; i++) {
          const r = choice_element(pool)
          this.cards_pool.push(copyObj(r.card))
        }
      } else if (ability === CardAbility.CreateAnyUnit) {
        // выбираем 3 случайных ЮНИТА из всех карт этой фракции
        const pool = (this.$store.getters["all_cards"] as CardEntry[]).filter(
          c =>
            c.card.faction === this.gameObj.leader.faction &&
            c.card.type === CardType.Unit
        )
        for (let i = 0; i < 3; i++) {
          const r = choice_element(pool)
          this.cards_pool.push(copyObj(r.card))
        }
      } else if (ability === CardAbility.CreateAndPutToDeck) {
        // выбираем 3 случайных ЮНИТА из всех карт вообще и кладем его в КОЛОДУ
        const pool = (this.$store.getters["all_cards"] as CardEntry[]).filter(
          c => c.card.type === CardType.Unit
        )
        for (let i = 0; i < 3; i++) {
          const r = choice_element(pool)
          this.cards_pool.push(copyObj(r.card))
        }
      } else if (ability === CardAbility.DrawExact) {
        // берем из колоды ЛЮБУЮ КАРТУ!
        if (this.calc_can_draw()) this.cards_pool = this.gameObj.deck
      } else if (
        ability === CardAbility.MoveEnemyFromDeckToHand ||
        ability === CardAbility.MoveEnemyFromDeckToDeck
      ) {
        this.enemyView = true
        this.cards_pool = this.gameObj.enemies
        // сколько зарядов установить той карте врага, которую мы возьмем
        this.special_case_value = this.selected_card?.data?.value || 0
      } else if (ability === CardAbility.MoveEnemyFromGraveToDeck) {
        this.enemyView = true
        this.cards_pool = this.gameObj.enemies_grave
        // сколько зарядов установить той карте врага, которую мы возьмем
        this.special_case_value = this.selected_card?.data?.value || 0
      }
      this.ability = this.selected_card!.ability.name
      if (this.cards_pool.length) {
        this.selectedCardAbilityDescription =
          this.selected_card!.ability.description
        this.sca = true
        this.show_pick_a_card_selection = true
        this.dead_card = this.selected_card // раз мы пришли сюда, нужно открыть окно, запоминаем ИСХОДНУЮ карту
      }
    },

    // А ЭТО МЕНЕДЖЕР абилок той карты, которую мы выбрали из открывшегося окна!
    confirm_selection(card: Card | Enemy): void {
      // card - это та карта, которую мы выбрали из какого-либо дополнительного окна
      if (this.ability === CardAbility.Resurrect) {
        ;(card as Card).data.charges = 1
        this.gameObj.hand.push(card as Card)
        this.gameObj.grave.splice(this.gameObj.grave.indexOf(card as Card), 1)
      } else if (this.ability === CardAbility.GiveChargesToCardInHand1) {
        change_card_charges(card as Card, 1)
      } else if (this.ability === CardAbility.DiscardDraw2) {
        this.gameObj.grave.push(card as Card)
        this.gameObj.hand.splice(this.gameObj.hand.indexOf(card as Card), 1)
        this.draw_one_card()
      } else if (
        this.ability === CardAbility.PlayFromDeck ||
        this.ability === CardAbility.PlayFromGrave ||
        this.ability === CardAbility.PlayBronzeSilverFromDeck ||
        this.ability === CardAbility.PlayEnemyFromGrave ||
        this.ability === CardAbility.PlaySpecialFromDeck ||
        this.ability === CardAbility.PlaySpecialFromGrave ||
        this.ability === CardAbility.PlayFromGrave ||
        this.ability === CardAbility.CreateSpecial ||
        this.ability === CardAbility.CreateAnyUnit
      ) {
        if (
          this.ability === CardAbility.PlayFromGrave ||
          this.ability === CardAbility.PlaySpecialFromGrave
        ) {
          ;(card as Card).data.charges = 1
        }

        // Показать эту выбранную для игры карту. А снимаем этот ФЛАГ уже в самом GamePage!
        this.show_picked_card = true
        this.selected_card = card as Card | Leader // ВОТ ЗДЕСЬ МЫ ЗАПОМНИЛИ ЭТУ КАРТУ НА КОТОРУЮ ТКНУЛИ ИЗ ОКНА
        // this.isActive.player_cards = true // ТЕПЕРЬ РУКУ здесь не активируем, работаем через sca
        this.isActive.player_leader = false // а лидер теперь неактивен
        this.setActive() // поле и лидер врагов теперь активны
      } else if (this.ability === CardAbility.IncrDmgToHandBySelfDmg) {
        card.data.damage += this.special_case_value!
        this.incrDmg(card as Card, this.special_case_value!)
      } else if (this.ability === CardAbility.MoveEnemyFromDeckToGrave) {
        const enemy = card as Enemy
        const cd = this.gameObj.enemies.findIndex(
          (c: Enemy) => c.id === enemy.id
        )
        this.gameObj.enemies.splice(cd, 1)
        enemy.data.hp = enemy.data.base.base_hp
        this.gameObj.enemies_grave.push(enemy)
      } else if (this.ability === CardAbility.DecrDmgToHandIncrToRandomHand) {
        card.data.damage -= this.special_case_value!
        if (card.data.damage < 0) card.data.damage = 0
        const random_card = choice_element(this.gameObj.hand) as Card
        random_card.data.damage += this.special_case_value!
        this.incrDmg(random_card, this.special_case_value!)
      } else if (this.ability === CardAbility.IncrDmgByNCharges) {
        const c = card as Card
        c.data.damage += c.data.charges
        this.incrDmg(c, c.data.charges)
      } else if (this.ability === CardAbility.CreateAndPutToDeck) {
        this.gameObj.deck.push(card as Card)
      } else if (this.ability === CardAbility.DrawExact) {
        this.gameObj.deck.splice(this.gameObj.deck.indexOf(card as Card), 1)
        this.gameObj.hand.push(card as Card)
      } else if (this.ability === CardAbility.MoveEnemyFromDeckToHand) {
        this.gameObj.enemies.splice(
          this.gameObj.enemies.indexOf(card as Enemy),
          1
        )
        this.gameObj.hand.push(
          enemy_as_card(card as Enemy, this.special_case_value!)
        )
      } else if (this.ability === CardAbility.MoveEnemyFromDeckToDeck) {
        this.gameObj.enemies.splice(
          this.gameObj.enemies.indexOf(card as Enemy),
          1
        )
        this.gameObj.deck.push(
          enemy_as_card(card as Enemy, this.special_case_value!)
        )
      } else if (this.ability === CardAbility.MoveEnemyFromGraveToDeck) {
        this.gameObj.enemies_grave.splice(
          this.gameObj.enemies_grave.indexOf(card as Enemy),
          1
        )
        this.gameObj.deck.push(
          enemy_as_card(card as Enemy, this.special_case_value!)
        )
      }

      // сбрасываем ИСХОДНУЮ карту, которой 1й раз играли
      remove_dead_card(
        this.dead_card!,
        this.gameObj.grave,
        this.gameObj.hand,
        this.gameObj.deck
      )
      this.dead_card = null // обнуляем ту запомненную ИСХОДНУЮ карту

      this.enemyView = false
      this.show_pick_a_card_selection = false
      this.ability = ""
      this.selectedCardAbilityDescription = ""
      this.cards_pool = []
      this.special_case_value = null
    },

    // чтобы показать фиолетовую рамку для этой карты и проиграть анимацию
    incrDmg(card: Card, value: number): void {
      timeoutAnimationFlag(
        card,
        "incr_dmg",
        sound_passive_increase_damage,
        this.$store.getters["selectedMoveTimeout"]
      )
      card.dmg_delta = value
      setTimeout(() => {
        card.dmg_delta = null
      }, this.$store.getters["selectedMoveTimeout"] * 0.5)
    },
  },
})
