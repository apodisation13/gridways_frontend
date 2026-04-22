<template>
  <div class="field">
    <table class="table">
      <tr v-for="i in 4" :key="i">
        <td
          v-for="j in 3"
          :key="j"
          @dblclick="exec_damage_ai_card(get_index(i, j))"
          @contextmenu.prevent
        >
          <transition
            :name="
              movingIndices.includes(get_index(i, j)) ? 'enemy-move' : 'enemy'
            "
          >
            <enemy-comp
              v-if="field[get_index(i, j)]"
              :key="field[get_index(i, j)]?.id || get_index(i, j)"
              :enemy="field[get_index(i, j)]"
              :index="get_index(i, j)"
              :in_cross="in_cross_enemy_index === get_index(i, j)"
            />
          </transition>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue"
import EnemyComp from "@/components/Cards/EnemyComp.vue"
import type { Enemy } from "@/types"

export default defineComponent({
  name: "field-comp",
  components: { EnemyComp },
  props: {
    field: {
      required: true,
      type: Array as PropType<(Enemy | "")[]>,
    },
    in_cross_enemy_index: {
      required: false,
      default: null,
      type: Number as unknown as PropType<number | null>,
    },
  },
  data() {
    return {
      movingIndices: [] as number[],
    }
  },

  created() {
    ;(this as any)._prevField = [...this.field]
  },

  watch: {
    field: {
      handler(newVal: (Enemy | "")[]) {
        const old = (this as any)._prevField as (Enemy | "")[]
        const now = newVal

        const disappeared: { enemy: Enemy; i: number }[] = []
        const appeared: { enemy: Enemy; i: number }[] = []
        for (let i = 0; i < now.length; i++) {
          if (old[i] && !now[i]) disappeared.push({ enemy: old[i] as Enemy, i })
          else if (!old[i] && now[i])
            appeared.push({ enemy: now[i] as Enemy, i })
        }

        const moved: number[] = []
        for (const d of disappeared) {
          const match = appeared.find(a => a.enemy === d.enemy)
          if (match) moved.push(d.i, match.i)
        }

        ;(this as any)._prevField = [...now]

        if (moved.length > 0) {
          this.movingIndices = moved
          setTimeout(() => {
            this.movingIndices = []
          }, 350)
        }
      },
      deep: true,
    },
  },

  methods: {
    get_index(i: number, j: number): number {
      return (i - 1) * 3 + (j - 1)
    },
    exec_damage_ai_card(i: number): void {
      this.$emit("exec_damage_ai_card", this.field[i])
    },
  },
  emits: ["exec_damage_ai_card"],
})
</script>

<style scoped>
.field {
  width: 73%;
  overflow: hidden;
}

.table {
  table-layout: fixed;
  width: 100%;
}

table tr,
td {
  height: 20vh;
  overflow: hidden;
  padding: 3px;
}

/*
Вариант 1: Шахматка (mask dissolve)
.enemy-leave-active {
  animation: enemy-die 0.8s ease-in forwards;
}
@keyframes enemy-die {
  0%  { opacity: 1; mask: none; }
  20% { mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 / 25% 25%; opacity: 1; }
  60% { mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 / 10% 10%; opacity: 0.7; }
  100%{ mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 / 3% 3%;  opacity: 0; }
}

---
Вариант 2: Разлом (диагональный разрез)
.enemy-leave-active {
  animation: enemy-die 0.6s ease-in forwards;
}
@keyframes enemy-die {
  0%  { transform: scale(1); filter: none; opacity: 1;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
  25% { transform: scale(1.1); filter: brightness(3) saturate(0); }
  50% { clip-path: polygon(0 0, 52% 0, 52% 48%, 48% 52%, 48% 100%, 0 100%);
    transform: scale(1); opacity: 1; }
  100%{ clip-path: polygon(0 0, 52% 0, 52% 48%, 48% 52%, 48% 100%, 0 100%);
    transform: translateX(-30%) rotate(-15deg); opacity: 0; }
}

---
Вариант 3: Взрыв (размытие наружу)
.enemy-leave-active {
  animation: enemy-die 0.5s ease-out forwards;
}
@keyframes enemy-die {
  0%  { transform: scale(1);   opacity: 1; filter: brightness(1); }
  30% { transform: scale(1.3); opacity: 1; filter: brightness(4) saturate(0); }
  100%{ transform: scale(3);   opacity: 0; filter: blur(15px) brightness(0); }
}

---
Вариант 4: Сдавливание (squish)
.enemy-leave-active {
  animation: enemy-die 0.5s cubic-bezier(0.4, 0, 1, 1) forwards;
}
@keyframes enemy-die {
  0%  { transform: scale(1, 1);    opacity: 1; }
  30% { transform: scale(1.3, 0.7); }
  60% { transform: scale(0.2, 1.2); opacity: 0.7; }
  100%{ transform: scale(0, 0);    opacity: 0; }
}

Вариант 5: Дрожание + коллапс
  .enemy-leave-active {
    animation: enemy-die 0.7s ease-in forwards;
  }
  @keyframes enemy-die {
    0%  { transform: scale(1) rotate(0deg) translate(0, 0); opacity: 1; }
    10% { transform: scale(1) rotate(-6deg) translate(-3px, 0); }
    20% { transform: scale(1) rotate(6deg)  translate(3px, 0); }
    30% { transform: scale(1) rotate(-5deg) translate(-2px, 0); }
    40% { transform: scale(1) rotate(4deg)  translate(2px, 0); }
    50% { transform: scale(1) rotate(0deg); opacity: 1; }
    100%{ transform: scale(0) rotate(40deg); opacity: 0; }
  }
*/

.enemy-leave-active {
  animation: enemy-die 0.7s ease-in forwards;
}
@keyframes enemy-die {
  0% {
    opacity: 1;
    mask: none;
  }
  20% {
    mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) center / 25%
      25%;
    opacity: 1;
  }
  60% {
    mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) center / 10%
      10%;
    opacity: 0.7;
  }
  100% {
    mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) center / 3%
      3%;
    opacity: 0;
    transform: scale(0.9);
  }
}

.enemy-enter-active {
  animation: enemy-spawn 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/*@keyframes enemy-spawn {
  0%  { opacity: 0; mask: none; }
  20%{ mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 / 3% 3%;  opacity: 0; }
  60% { mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 / 10% 10%; opacity: 0.7; }
  100% { mask: repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 / 25% 25%; opacity: 1; }
}
*/
@keyframes enemy-spawn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  25% {
    transform: scale(1.25) rotate(-5deg);
    opacity: 1;
  }
  40% {
    transform: scale(0.88) rotate(4deg);
  }
  55% {
    transform: scale(1.12) rotate(-3deg);
  }
  68% {
    transform: scale(0.94) rotate(2deg);
  }
  80% {
    transform: scale(1.05) rotate(-1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.enemy-move-enter-active {
  animation: enemy-step-in 0.25s ease-out forwards;
}

@keyframes enemy-step-in {
  0% {
    opacity: 0.4;
    transform: scale(0.85);
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.enemy-move-leave-active {
  animation: enemy-step-out 0.25s ease-in forwards;
}

@keyframes enemy-step-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.85);
  }
}
</style>
