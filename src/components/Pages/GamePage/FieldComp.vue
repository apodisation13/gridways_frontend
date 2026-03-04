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

<script>
import EnemyComp from "@/components/Cards/EnemyComp"
export default {
  name: "field-comp",
  components: { EnemyComp },
  props: {
    field: {
      required: true,
      type: Array,
    },
    in_cross_enemy_index: {
      required: false,
      default: null,
      type: [Number, null],
    },
  },
  data() {
    return {
      movingIndices: [],
    }
  },

  created() {
    this._prevField = [...this.field] // не реактивно, просто снимок
  },

  updated() {
    const old = this._prevField
    const now = this.field
    this._prevField = [...now] // обновляем снимок сразу

    const disappeared = []
    const appeared = []

    for (let i = 0; i < now.length; i++) {
      if (old[i] && !now[i]) disappeared.push({ enemy: old[i], i })
      else if (!old[i] && now[i]) appeared.push({ enemy: now[i], i })
    }

    // Ищем пары: тот же объект исчез тут и появился там → ход
    const moved = []
    for (const d of disappeared) {
      const match = appeared.find(a => a.enemy === d.enemy)
      if (match) moved.push(d.i, match.i)
    }

    if (moved.length > 0) {
      this.movingIndices = moved
      setTimeout(() => {
        this.movingIndices = []
      }, 350)
    }
  },

  methods: {
    get_index(i, j) {
      // расчёт индекса клетки поля
      return (i - 1) * 3 + (j - 1)
    },
    exec_damage_ai_card(i) {
      // эмиттим ВСЕГО врага
      this.$emit("exec_damage_ai_card", this.field[i])
    },
  },
  emits: ["exec_damage_ai_card"],
}
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
  /* width: 50%; */
  height: 20vh;
  /*border: dashed 0.5px black;*/
  overflow: hidden;
  padding: 3px;
  /*position: relative;*/
}

.enemy-enter-active {
  animation: enemy-spawn 0.95s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.enemy-leave-active {
  animation: enemy-die 0.45s ease-in forwards;
}

@keyframes enemy-spawn {
  0% {
    opacity: 0;
    transform: scale(2.5);
  }
  50% {
    opacity: 1;
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes enemy-die {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  15% {
    transform: scale(1.3) rotate(-8deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(45deg);
  }
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
