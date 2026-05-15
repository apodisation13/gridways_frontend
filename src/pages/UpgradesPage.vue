<template>
  <div class="upgrades-page">
    <div class="title">
      <h1>Прокачка</h1>
    </div>

    <div class="tabs">
      <div class="tabs__slider" :style="sliderStyle"></div>
      <button
        v-for="(cat, catIdx) in sortedCategoryEntries"
        :key="cat.key"
        class="tabs__btn"
        :class="{ 'tabs__btn--active': activeTabIdx === catIdx }"
        @click="activeTabIdx = catIdx"
      >
        {{ cat.data.title }}
      </button>
    </div>

    <div class="upgrades-list">
      <div
        v-for="upgrade in sortedActiveUpgrades"
        :key="upgrade.key"
        class="upgrade-item"
        :class="{
          'upgrade-item--dim': userLevel(activeCategoryKey, upgrade.key) === 0,
        }"
        @click="openModal(activeCategoryKey, upgrade.key, upgrade.item)"
      >
        <div class="upgrade-item__header">
          <span class="upgrade-item__title">{{ upgrade.item.title }}</span>
          <span class="upgrade-item__value">{{
            currentValueLabel(activeCategoryKey, upgrade.key, upgrade.item)
          }}</span>
        </div>
        <div class="upgrade-item__bar">
          <span
            v-for="lvl in totalLevels(upgrade.item)"
            :key="lvl"
            class="upgrade-item__segment"
            :class="{
              'upgrade-item__segment--active':
                lvl <= userLevel(activeCategoryKey, upgrade.key),
            }"
          />
        </div>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2 class="modal__title">{{ modal.item.title }}</h2>

        <div class="modal__section">
          <div class="modal__label">Текущий уровень</div>
          <div
            class="modal__level-row"
            :class="{
              'modal__level-row--dim':
                userLevel(modal.category, modal.key) === 0,
            }"
          >
            <span class="modal__level-num">{{
              userLevel(modal.category, modal.key) === 0
                ? "Базовый"
                : userLevel(modal.category, modal.key)
            }}</span>
            <span class="modal__level-sep">—</span>
            <span class="modal__level-value">{{
              formatValue(
                modal.item.upgrades[userLevel(modal.category, modal.key)].value
              )
            }}</span>
          </div>
        </div>

        <template v-if="canUpgrade(modal.category, modal.key, modal.item)">
          <div class="modal__section">
            <div class="modal__label">Следующий уровень</div>
            <div class="modal__level-row">
              <span class="modal__level-num">{{
                userLevel(modal.category, modal.key) + 1
              }}</span>
              <span class="modal__level-sep">—</span>
              <span class="modal__level-value">{{
                formatValue(
                  modal.item.upgrades[userLevel(modal.category, modal.key) + 1]
                    .value
                )
              }}</span>
            </div>
          </div>

          <div class="modal__section">
            <div class="modal__label">Стоимость</div>
            <resource-list
              :resources="upgradeCost(modal.category, modal.key, modal.item)"
            />
          </div>

          <button class="modal__upgrade-btn" @click="handleUpgrade">
            Прокачать
          </button>
        </template>
        <div v-else class="modal__maxed">Максимальный уровень</div>

        <div class="modal__roadmap">
          <button
            class="modal__roadmap-toggle"
            @click="showRoadmap = !showRoadmap"
          >
            {{ showRoadmap ? "Скрыть ↑" : "Все уровни ↓" }}
          </button>
          <div v-if="showRoadmap" class="roadmap">
            <div
              v-for="(lvlData, lvlNum) in modal.item.upgrades"
              :key="lvlNum"
              class="roadmap-row"
              :class="{
                'roadmap-row--done':
                  Number(lvlNum) < userLevel(modal.category, modal.key),
                'roadmap-row--current':
                  Number(lvlNum) === userLevel(modal.category, modal.key),
                'roadmap-row--future':
                  Number(lvlNum) > userLevel(modal.category, modal.key),
              }"
            >
              <div class="roadmap-row__marker">
                <span
                  v-if="Number(lvlNum) < userLevel(modal.category, modal.key)"
                  class="roadmap-row__dot roadmap-row__dot--done"
                  >✓</span
                >
                <span
                  v-else-if="
                    Number(lvlNum) === userLevel(modal.category, modal.key)
                  "
                  class="roadmap-row__dot roadmap-row__dot--current"
                  >●</span
                >
                <span v-else class="roadmap-row__dot roadmap-row__dot--future"
                  >○</span
                >
                <span
                  v-if="Number(lvlNum) < maxLevelNum(modal.item)"
                  class="roadmap-row__line"
                />
              </div>
              <div class="roadmap-row__content">
                <div class="roadmap-row__header">
                  <span class="roadmap-row__level-label">{{
                    Number(lvlNum) === 0 ? "Базовый" : "Ур. " + lvlNum
                  }}</span>
                  <span class="roadmap-row__value">{{
                    formatValue(lvlData.value)
                  }}</span>
                  <span
                    v-if="
                      Number(lvlNum) === userLevel(modal.category, modal.key)
                    "
                    class="roadmap-row__badge"
                    >← вы здесь</span
                  >
                </div>
                <div v-if="lvlData.next" class="roadmap-row__cost">
                  <resource-list :resources="positiveCost(lvlData.next)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="modal__close-btn" @click="closeModal">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import ResourceList from "@/components/ResourceList.vue"
import {
  ModalState,
  UpgradeCategory,
  UpgradeItem,
  UpgradesConfig,
  UserUpgrades,
} from "@/types/upgrades"

const RESOURCE_ORDER: Record<string, number> = {
  scraps: 0,
  raw_bronze: 1,
  raw_silver: 2,
  raw_gold: 3,
  crops: 4,
  wood: 5,
  silk: 6,
  bronze_ingots: 7,
  silver_ingots: 8,
  gold_ingots: 9,
  money: Infinity,
}

const FAKE_UPGRADES_CONFIG: UpgradesConfig = {
  game: {
    ordering: 0,
    title: "Игровые",
    upgrades: {
      max_cards_in_deck: {
        ordering: 1,
        title: "Карт в колоде",
        upgrades: {
          0: {
            value: 10,
            next: {
              money: -1000,
              raw_bronze: -30,
              raw_silver: -10,
              raw_gold: -5,
            },
          },
          1: {
            value: 11,
            next: {
              money: -2000,
              raw_bronze: -50,
              raw_silver: -30,
              raw_gold: -20,
            },
          },
          2: {
            value: 12,
            next: {
              money: -3000,
              raw_bronze: -50,
              raw_silver: -30,
              raw_gold: -20,
            },
          },
          3: {
            value: 13,
            next: {
              money: -5000,
              raw_bronze: -100,
              raw_silver: -50,
              raw_gold: -40,
              bronze_ingots: -5,
              silver_ingots: -3,
              gold_ingots: -1,
            },
          },
          4: {
            value: 14,
            next: {
              money: -5000,
              raw_bronze: -200,
              raw_silver: -80,
              raw_gold: -50,
              bronze_ingots: -7,
              silver_ingots: -5,
              gold_ingots: -2,
            },
          },
          5: {
            value: 15,
            next: {
              money: -6000,
              raw_bronze: -300,
              raw_silver: -100,
              raw_gold: -75,
              bronze_ingots: -10,
              silver_ingots: -8,
              gold_ingots: -5,
            },
          },
          6: {
            value: 16,
            next: {
              money: -8000,
              raw_bronze: -400,
              raw_silver: -100,
              raw_gold: -90,
              bronze_ingots: -10,
              silver_ingots: -8,
              gold_ingots: -5,
            },
          },
          7: {
            value: 17,
            next: {
              money: -10000,
              raw_bronze: -500,
              raw_silver: -250,
              raw_gold: -150,
              bronze_ingots: -15,
              silver_ingots: -10,
              gold_ingots: -8,
            },
          },
          8: { value: 18, next: null },
        },
      },
      hand_size: {
        ordering: 2,
        title: "Размер руки",
        upgrades: {
          0: {
            value: 5,
            next: {
              money: -1000,
              scraps: -1000,
              raw_bronze: -20,
              raw_silver: -10,
              raw_gold: -5,
            },
          },
          1: {
            value: 6,
            next: {
              money: -5000,
              scraps: -2500,
              raw_bronze: -200,
              raw_silver: -100,
              raw_gold: -100,
              bronze_ingots: 10,
              silver_ingots: 8,
              gold_ingots: 5,
            },
          },
          2: {
            value: 7,
            next: {
              money: -15000,
              scraps: -7500,
              raw_bronze: -500,
              raw_silver: -300,
              raw_gold: -250,
              bronze_ingots: 30,
              silver_ingots: 20,
              gold_ingots: 15,
            },
          },
          3: { value: 8, next: null },
        },
      },
      max_armor: {
        ordering: 4,
        title: "Броня лидера",
        upgrades: {
          0: { value: 0, next: { money: -1000, wood: -500, crops: -1000 } },
          1: { value: 10, next: { money: -2000, wood: -1000, crops: -1500 } },
          2: {
            value: 15,
            next: { money: -3000, wood: -2000, crops: -3000, silk: -1 },
          },
          3: {
            value: 20,
            next: { money: -4000, wood: -3000, crops: -4000, silk: -3 },
          },
          4: {
            value: 25,
            next: { money: -5000, wood: -4000, crops: -5000, silk: -5 },
          },
          5: {
            value: 30,
            next: { money: -6000, wood: -5000, crops: -6000, silk: -7 },
          },
          6: {
            value: 35,
            next: { money: -7000, wood: -6000, crops: -7000, silk: -10 },
          },
          7: {
            value: 40,
            next: { money: -10000, wood: -10000, crops: -10000, silk: -20 },
          },
          8: { value: 100, next: null },
        },
      },
      max_hp: {
        ordering: 3,
        title: "Здоровье колоды",
        upgrades: {
          0: {
            value: 100,
            next: { money: -1000, scraps: -300, bronze_ingots: -2 },
          },
          1: {
            value: 125,
            next: { money: -1500, scraps: -700, bronze_ingots: -3 },
          },
          2: {
            value: 150,
            next: {
              money: -2500,
              scraps: -1000,
              bronze_ingots: -5,
              silver_ingots: -2,
            },
          },
          3: {
            value: 175,
            next: {
              money: -3000,
              scraps: -1500,
              bronze_ingots: -6,
              silver_ingots: -3,
              gold_ingots: -2,
            },
          },
          4: {
            value: 200,
            next: {
              money: -3500,
              wood: -2000,
              crops: -3000,
              bronze_ingots: -8,
              silver_ingots: -5,
              gold_ingots: -3,
            },
          },
          5: {
            value: 225,
            next: {
              money: -5000,
              wood: -3000,
              crops: -4000,
              bronze_ingots: -10,
              silver_ingots: -7,
              gold_ingots: -5,
            },
          },
          6: {
            value: 250,
            next: {
              money: -5000,
              wood: -4000,
              crops: -5000,
              silk: -10,
              bronze_ingots: -10,
              silver_ingots: -7,
              gold_ingots: -5,
            },
          },
          7: {
            value: 275,
            next: {
              money: -7000,
              wood: -5000,
              crops: -7000,
              silk: -15,
              bronze_ingots: -15,
              silver_ingots: -10,
              gold_ingots: -7,
            },
          },
          8: { value: 300, next: null },
        },
      },
      max_decks: {
        ordering: 0,
        title: "Количество колод",
        upgrades: {
          0: { value: 2, next: { money: -1000, crops: -1000 } },
          1: { value: 3, next: { money: -2000, crops: -1500, wood: -1000 } },
          2: {
            value: 5,
            next: { money: -3000, crops: -3000, wood: -2000, silk: -5 },
          },
          3: {
            value: 7,
            next: {
              money: -5000,
              crops: -3000,
              wood: -2000,
              silk: -5,
              silver_ingots: -5,
            },
          },
          4: {
            value: 8,
            next: {
              money: -10000,
              crops: -5000,
              wood: -4000,
              silk: -15,
              bronze_ingots: -30,
              silver_ingots: -15,
              gold_ingots: -5,
            },
          },
          5: { value: 10, next: null },
        },
      },
    },
  },
  settings: {
    ordering: 2,
    title: "Настройки",
    upgrades: {
      avatar: {
        ordering: 0,
        title: "Аватары",
        upgrades: {
          0: { value: false, next: { money: -10000, crops: -5000 } },
          1: { value: true, next: null },
        },
      },
      theme: {
        ordering: 1,
        title: "Темы",
        upgrades: {
          0: {
            value: false,
            next: { money: -10000, wood: -3000, scraps: -3000 },
          },
          1: { value: true, next: null },
        },
      },
    },
  },
  resources: {
    ordering: 1,
    title: "Ресурсы",
    upgrades: {
      money: {
        ordering: 0,
        title: "Запас монет",
        upgrades: {
          0: {
            value: 5000,
            next: { money: -1000, crops: -500, raw_bronze: -30 },
          },
          1: {
            value: 10000,
            next: { money: -2000, crops: -1000, raw_bronze: -50 },
          },
          2: {
            value: 15000,
            next: {
              money: -3000,
              crops: -2000,
              raw_bronze: -100,
              raw_silver: -30,
            },
          },
          3: {
            value: 20000,
            next: {
              money: -3000,
              crops: -2000,
              wood: -1000,
              raw_bronze: -150,
              raw_silver: -50,
            },
          },
          4: {
            value: 30000,
            next: {
              money: -4000,
              crops: -3000,
              wood: -2000,
              raw_bronze: -200,
              raw_silver: -70,
              raw_gold: -30,
            },
          },
          5: {
            value: 40000,
            next: {
              money: -4000,
              crops: -3000,
              wood: -2000,
              silk: -20,
              raw_bronze: -250,
              raw_silver: -100,
              raw_gold: -50,
            },
          },
          6: {
            value: 50000,
            next: {
              money: -5000,
              crops: -4000,
              wood: -3000,
              silk: -30,
              raw_bronze: -300,
              raw_silver: -150,
              raw_gold: -100,
            },
          },
          7: {
            value: 75000,
            next: {
              money: -7000,
              crops: -3000,
              wood: -2000,
              silk: -20,
              bronze_ingots: -20,
              silver_ingots: -15,
              gold_ingots: -5,
            },
          },
          8: {
            value: 100000,
            next: {
              money: -10000,
              crops: -5000,
              wood: -4000,
              silk: -50,
              bronze_ingots: -40,
              silver_ingots: -25,
              gold_ingots: -15,
            },
          },
          9: {
            value: 200000,
            next: {
              money: -20000,
              crops: -7000,
              wood: -7000,
              silk: -50,
              bronze_ingots: -50,
              silver_ingots: -50,
              gold_ingots: -50,
            },
          },
          10: { value: 1000000, next: null },
        },
      },
      scraps: {
        ordering: 4,
        title: "Запас тряпок",
        upgrades: {
          0: { value: 2000, next: { money: -1000, crops: -500 } },
          1: { value: 3000, next: { money: -1000, crops: -500, wood: -200 } },
          2: { value: 5000, next: { money: -2000, crops: -1000, wood: -500 } },
          3: {
            value: 7500,
            next: { money: -3000, crops: -1500, wood: -750, silk: -5 },
          },
          4: {
            value: 10000,
            next: { money: -4000, crops: -2000, wood: -1000, silk: -8 },
          },
          5: {
            value: 15000,
            next: {
              money: -8000,
              silk: -10,
              bronze_ingots: -8,
              silver_ingots: -4,
            },
          },
          6: {
            value: 20000,
            next: {
              money: -10000,
              silk: -15,
              bronze_ingots: -13,
              silver_ingots: -8,
            },
          },
          7: {
            value: 30000,
            next: {
              money: -10000,
              silk: -15,
              bronze_ingots: -20,
              silver_ingots: -14,
              gold_ingots: -4,
            },
          },
          8: {
            value: 40000,
            next: {
              money: -10000,
              silk: -15,
              bronze_ingots: -20,
              silver_ingots: -15,
              gold_ingots: -10,
            },
          },
          9: {
            value: 50000,
            next: {
              money: -15000,
              silk: -20,
              raw_gold: -100,
              gold_ingots: -20,
            },
          },
          10: { value: 100000, next: null },
        },
      },
      kegs: {
        ordering: 1,
        title: "Запас бочек/коробок",
        upgrades: {
          0: { value: 0, next: { money: -1000, wood: -300 } },
          1: { value: 1, next: { money: -1000, wood: -500 } },
          2: {
            value: 3,
            next: { money: -2000, wood: -1000, bronze_ingots: -5 },
          },
          3: {
            value: 5,
            next: {
              money: -2500,
              wood: -1500,
              bronze_ingots: -8,
              silver_ingots: -4,
            },
          },
          4: {
            value: 7,
            next: {
              money: -3500,
              wood: -2000,
              bronze_ingots: -12,
              silver_ingots: -6,
            },
          },
          5: {
            value: 10,
            next: {
              money: -3500,
              wood: -2500,
              bronze_ingots: -15,
              silver_ingots: -8,
              gold_ingots: -3,
            },
          },
          6: {
            value: 15,
            next: {
              money: -5000,
              wood: -3000,
              bronze_ingots: -15,
              silver_ingots: -10,
              gold_ingots: -5,
            },
          },
          7: {
            value: 25,
            next: {
              money: -5000,
              wood: -3000,
              bronze_ingots: -15,
              silver_ingots: -10,
              gold_ingots: -5,
              silk: -10,
            },
          },
          8: {
            value: 40,
            next: {
              money: -5000,
              wood: -3000,
              bronze_ingots: -15,
              silver_ingots: -10,
              gold_ingots: -5,
              silk: -20,
            },
          },
          9: { value: 100, next: null },
        },
      },
      silk: {
        ordering: 6,
        title: "Запас золотого шёлка",
        upgrades: {
          0: { value: 0, next: { money: -1000, raw_gold: -5 } },
          1: { value: 3, next: { money: -1000, raw_gold: -8 } },
          2: {
            value: 5,
            next: { money: -1500, raw_gold: -8, gold_ingots: -2 },
          },
          3: {
            value: 10,
            next: { money: -2500, raw_gold: -10, gold_ingots: -4 },
          },
          4: {
            value: 15,
            next: { money: -2500, raw_gold: -10, gold_ingots: -4, silk: -5 },
          },
          5: {
            value: 25,
            next: { money: -3500, raw_gold: -15, gold_ingots: -8, silk: -8 },
          },
          6: {
            value: 40,
            next: { money: -5000, raw_gold: -25, gold_ingots: -10, silk: -10 },
          },
          7: {
            value: 60,
            next: { money: -7000, raw_gold: -30, gold_ingots: -14, silk: -14 },
          },
          8: {
            value: 100,
            next: { money: -10000, raw_gold: -30, gold_ingots: -15, silk: -20 },
          },
          9: { value: 200, next: null },
        },
      },
      rare_gems: {
        ordering: 7,
        title: "Запас редких камней",
        upgrades: {
          0: { value: 0, next: { money: -2000 } },
          1: { value: 1, next: { money: -3000 } },
          2: { value: 3, next: { money: -5000 } },
          3: { value: 5, next: { money: -10000 } },
          4: { value: 7, next: { money: -10000 } },
          5: { value: 10, next: null },
        },
      },
      wood: {
        ordering: 5,
        title: "Запас соломы/дерева",
        upgrades: {
          0: { value: 3000, next: { money: -1000, crops: -500, wood: -200 } },
          1: { value: 5000, next: { money: -1500, crops: -700, wood: -400 } },
          2: { value: 7000, next: { money: -2000, crops: -1000, wood: -500 } },
          3: { value: 1000, next: { money: -2500, crops: -1200, wood: -700 } },
          4: {
            value: 15000,
            next: { money: -3000, crops: -1500, wood: -1000 },
          },
          5: {
            value: 20000,
            next: { money: -3500, crops: -2000, wood: -1200 },
          },
          6: {
            value: 25000,
            next: { money: -4000, crops: -2500, wood: -1500, silk: -5 },
          },
          7: {
            value: 35000,
            next: { money: -5000, crops: -3000, wood: -2000, silk: -8 },
          },
          8: {
            value: 50000,
            next: { money: -6000, crops: -3500, wood: -2500, silk: -10 },
          },
          9: {
            value: 75000,
            next: {
              money: -10000,
              crops: -5000,
              wood: -3000,
              silk: -15,
              gold_ingots: -10,
            },
          },
          10: { value: 100000, next: null },
        },
      },
      ingots: {
        ordering: 3,
        title: "Запас слитков",
        upgrades: {
          0: { value: 0, next: { money: -1000, crops: -1000 } },
          1: { value: 5, next: { money: -1500, raw_bronze: -30 } },
          2: { value: 10, next: { money: -2000, raw_bronze: -50 } },
          3: {
            value: 15,
            next: { money: -2500, raw_bronze: -75, raw_silver: -20 },
          },
          4: {
            value: 20,
            next: { money: -3000, raw_bronze: -100, raw_silver: -35 },
          },
          5: {
            value: 30,
            next: {
              money: -3500,
              raw_bronze: -130,
              raw_silver: -50,
              raw_gold: -5,
            },
          },
          6: {
            value: 40,
            next: {
              money: -5000,
              raw_bronze: -150,
              raw_silver: -75,
              raw_gold: -15,
            },
          },
          7: {
            value: 50,
            next: {
              money: -6000,
              raw_bronze: -165,
              raw_silver: -80,
              raw_gold: -25,
            },
          },
          8: {
            value: 70,
            next: {
              money: -7000,
              raw_bronze: -200,
              raw_silver: -100,
              raw_gold: -45,
            },
          },
          9: {
            value: 90,
            next: {
              money: -10000,
              raw_bronze: -300,
              raw_silver: -150,
              raw_gold: -100,
            },
          },
          10: { value: 200, next: null },
        },
      },
      raw: {
        ordering: 2,
        title: "Запас чистых камней",
        upgrades: {
          0: { value: 50, next: { money: -1000, crops: -500 } },
          1: { value: 75, next: { money: -1500, crops: -700, wood: -400 } },
          2: {
            value: 100,
            next: { money: -2000, crops: -1000, wood: -500, silk: -5 },
          },
          3: {
            value: 150,
            next: { money: -2500, crops: -1500, wood: -700, silk: -8 },
          },
          4: {
            value: 250,
            next: { money: -3000, crops: -2000, wood: -1200, silk: -10 },
          },
          5: {
            value: 400,
            next: { money: -3500, crops: -2400, wood: -1500, silk: -12 },
          },
          6: {
            value: 600,
            next: { money: -4000, crops: -2900, wood: -1700, silk: -15 },
          },
          7: {
            value: 800,
            next: { money: -4500, crops: -3300, wood: -2200, silk: -18 },
          },
          8: {
            value: 1000,
            next: {
              money: -5000,
              crops: -5000,
              wood: -3000,
              silk: -25,
              raw_gold: -50,
            },
          },
          9: {
            value: 1500,
            next: {
              money: -10000,
              crops: -10000,
              wood: -5000,
              silk: -50,
              raw_gold: -100,
            },
          },
          10: { value: 5000, next: null },
        },
      },
    },
  },
}

// const FAKE_USER_UPGRADES: UserUpgrades = {
//   game: { max_cards_in_deck: 2, hand_size: 0 },
//   settings: { avatar: 1, theme: 0 },
//   resources: { money: 1, scraps: 0 },
// }

export default defineComponent({
  name: "UpgradesPage",
  components: { ResourceList },
  data() {
    return {
      activeTabIdx: 0,
      modal: null as ModalState | null,
      showRoadmap: false,
      upgradesConfig: FAKE_UPGRADES_CONFIG as UpgradesConfig,
    }
  },
  computed: {
    userUpgrades(): UserUpgrades {
      return this.$store.getters["userUpgrades"]
    },
    sortedCategoryEntries(): Array<{ key: string; data: UpgradeCategory }> {
      return Object.entries(this.upgradesConfig)
        .map(([key, data]) => ({ key, data }))
        .sort((a, b) => a.data.ordering - b.data.ordering)
    },
    categoryKeys(): string[] {
      return this.sortedCategoryEntries.map(c => c.key)
    },
    activeCategoryKey(): string {
      return this.categoryKeys[this.activeTabIdx]
    },
    activeCategory(): UpgradeCategory {
      return this.upgradesConfig[this.activeCategoryKey]
    },
    sortedActiveUpgrades(): Array<{ key: string; item: UpgradeItem }> {
      return Object.entries(this.activeCategory.upgrades)
        .map(([key, item]) => ({ key, item }))
        .sort((a, b) => a.item.ordering - b.item.ordering)
    },
    sliderStyle(): Record<string, string> {
      return {
        transform: `translateX(${this.activeTabIdx * 100}%)`,
        width: `${100 / this.categoryKeys.length}%`,
      }
    },
  },
  async created() {
    await this.$store.dispatch("getUserUpgrades")
  },
  methods: {
    userLevel(category: string, key: string): number {
      return (this.userUpgrades[category]?.[key] as number) ?? 0
    },
    totalLevels(item: UpgradeItem): number {
      // exclude level 0 (base state) — bar shows upgrade steps only
      return Object.keys(item.upgrades).length - 1
    },
    currentValueLabel(
      category: string,
      key: string,
      item: UpgradeItem
    ): string {
      const level = this.userLevel(category, key)
      return this.formatValue(item.upgrades[level]?.value)
    },
    formatValue(value: number | boolean | undefined): string {
      if (value === undefined) return "—"
      if (value === true) return "Открыто"
      if (value === false) return "Закрыто"
      return String(value)
    },
    canUpgrade(category: string, key: string, item: UpgradeItem): boolean {
      const level = this.userLevel(category, key)
      const currentEntry = item.upgrades[level]
      return !!(currentEntry?.next !== null && item.upgrades[level + 1])
    },
    upgradeCost(
      category: string,
      key: string,
      item: UpgradeItem
    ): Record<string, number> {
      const level = this.userLevel(category, key)
      const raw = item.upgrades[level]?.next ?? null
      if (!raw) return {}
      const entries = Object.entries(raw).map(
        ([k, v]) => [k, Math.abs(v)] as [string, number]
      )
      entries.sort(
        (a, b) => (RESOURCE_ORDER[a[0]] ?? 99) - (RESOURCE_ORDER[b[0]] ?? 99)
      )
      return Object.fromEntries(entries)
    },
    positiveCost(next: Record<string, number>): Record<string, number> {
      const entries = Object.entries(next).map(
        ([k, v]) => [k, Math.abs(v)] as [string, number]
      )
      entries.sort(
        (a, b) => (RESOURCE_ORDER[a[0]] ?? 99) - (RESOURCE_ORDER[b[0]] ?? 99)
      )
      return Object.fromEntries(entries)
    },
    maxLevelNum(item: UpgradeItem): number {
      return Math.max(...Object.keys(item.upgrades).map(Number))
    },
    openModal(category: string, key: string, item: UpgradeItem): void {
      this.modal = { category, key, item }
      this.showRoadmap = false
    },
    closeModal(): void {
      this.modal = null
      this.showRoadmap = false
    },
    handleUpgrade(): void {
      // TODO: API call for upgrade
      this.closeModal()
    },
  },
})
</script>

<style scoped>
.upgrades-page {
  width: 98%;
  margin: 1%;
  height: 75vh;
  overflow-y: auto;
}

div {
  font-family: "Brush Script MT", cursive;
  font-size: 14pt;
  color: white;
}

.title {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 16px;
}

.title h1 {
  font-family: "Philosopher", serif;
  font-size: 2rem;
  line-height: 2rem;
  color: hsl(39, 82%, 62%);
}

/* Tab selector — same style as BonusPage */
.tabs {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  margin: 0 8px 12px;
  padding: 3px;
}

.tabs__slider {
  position: absolute;
  top: 3px;
  left: 3px;
  height: calc(100% - 6px);
  border-radius: 8px;
  background: var(--primary-gold-gradient, #c49000);
  transition: transform 0.25s ease;
  pointer-events: none;
}

.tabs__btn {
  flex: 1;
  z-index: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s;
}

.tabs__btn--active {
  color: #1a1208;
  font-weight: bold;
}

/* Upgrade items list */
.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
}

.upgrade-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.upgrade-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.upgrade-item--dim {
  background: rgba(255, 255, 255, 0.02);
}

.upgrade-item--dim .upgrade-item__title {
  color: rgba(255, 255, 255, 0.4);
}

.upgrade-item--dim .upgrade-item__value {
  color: rgba(255, 255, 255, 0.3);
}

.upgrade-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.upgrade-item__title {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.upgrade-item__value {
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  color: hsl(39, 82%, 62%);
}

/* Segmented progress bar */
.upgrade-item__bar {
  display: flex;
  gap: 5px;
}

.upgrade-item__segment {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s;
}

.upgrade-item__segment--active {
  background: var(--primary-gold-gradient, #c49000);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: linear-gradient(
    180deg,
    rgba(30, 35, 50, 0.98) 0%,
    rgba(15, 20, 35, 0.98) 100%
  );
  border-radius: 16px;
  padding: 24px 20px 20px;
  width: min(340px, 90vw);
  max-height: 82vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(196, 144, 0, 0.3);
}

.modal__title {
  font-family: "Philosopher", serif;
  font-size: 1.3rem;
  color: hsl(39, 82%, 62%);
  text-align: center;
  margin: 0;
}

.modal__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal__label {
  font-family: "Philosopher", serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__level-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: white;
}

.modal__level-row--dim {
  color: rgba(255, 255, 255, 0.4);
}

.modal__level-num {
  font-weight: bold;
  color: hsl(39, 82%, 62%);
}

.modal__level-sep {
  color: rgba(255, 255, 255, 0.3);
}

.modal__level-value {
  color: rgba(255, 255, 255, 0.9);
}

.modal__maxed {
  font-family: "Philosopher", serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.modal__upgrade-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: var(--primary-gold-gradient, #c49000);
  font-family: "Philosopher", serif;
  font-size: 1rem;
  font-weight: bold;
  color: #1a1208;
  cursor: pointer;
}

.modal__close-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: none;
  font-family: "Philosopher", serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

/* Roadmap toggle */
.modal__roadmap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal__roadmap-toggle {
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: color 0.2s;
}

.modal__roadmap-toggle:active {
  color: rgba(255, 255, 255, 0.7);
}

/* Roadmap rows */
.roadmap {
  display: flex;
  flex-direction: column;
}

.roadmap-row {
  display: flex;
  gap: 10px;
}

.roadmap-row__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.roadmap-row__dot {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.roadmap-row__dot--done {
  color: hsl(39, 60%, 50%);
}

.roadmap-row__dot--current {
  color: hsl(39, 82%, 62%);
  font-size: 1rem;
}

.roadmap-row__dot--future {
  color: rgba(255, 255, 255, 0.2);
}

.roadmap-row__line {
  flex: 1;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 2px 0;
  min-height: 8px;
}

.roadmap-row__content {
  flex: 1;
  padding-bottom: 10px;
}

.roadmap-row__header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.roadmap-row__level-label {
  font-family: "Philosopher", serif;
  font-size: 0.85rem;
  font-weight: bold;
}

.roadmap-row--done .roadmap-row__level-label {
  color: rgba(255, 255, 255, 0.45);
}

.roadmap-row--current .roadmap-row__level-label {
  color: hsl(39, 82%, 62%);
}

.roadmap-row--future .roadmap-row__level-label {
  color: rgba(255, 255, 255, 0.6);
}

.roadmap-row__value {
  font-family: "Philosopher", serif;
  font-size: 0.85rem;
}

.roadmap-row--done .roadmap-row__value {
  color: rgba(255, 255, 255, 0.35);
}

.roadmap-row--current .roadmap-row__value {
  color: rgba(255, 255, 255, 0.9);
}

.roadmap-row--future .roadmap-row__value {
  color: rgba(255, 255, 255, 0.5);
}

.roadmap-row__badge {
  font-family: "Philosopher", serif;
  font-size: 0.75rem;
  color: hsl(39, 82%, 62%);
  opacity: 0.7;
}

.roadmap-row__cost {
  transform: scale(0.8);
  transform-origin: left center;
  opacity: 0.7;
  margin-top: 2px;
}

.roadmap-row--done .roadmap-row__cost {
  opacity: 0.3;
}
</style>
