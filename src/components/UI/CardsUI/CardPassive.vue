<template>
  <div class="passive" :class="{ 'passive-inline': inline }">
    <div class="passive-clock" v-if="!card || card.timer === 0"></div>
    <div class="passive-timer" v-else>
      <span class="passive-timer-value">{{ card.timer }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    card: {
      required: false,
      default: null,
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.passive {
  position: absolute;
  right: -2%;
  bottom: 20%;
  width: 24%;
  aspect-ratio: 1 / 1;
  container-type: size;
}

/* Режим для строки */
.passive.passive-inline {
  position: relative;
  right: auto;
  bottom: auto;
  width: 50px;
  height: 5vh;
  display: inline-block;
  margin: 1%;
  border: solid 2px white;
  aspect-ratio: auto;
}

.passive-clock,
.passive-timer {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}

.passive-clock {
  background-image: url("~@/assets/icons/card/passive_clock.svg");
}

.passive-timer {
  background-image: url("~@/assets/icons/card/passive_timer.svg");
  display: flex;
  justify-content: center;
  align-items: center;
}

.passive-timer-value {
  color: white;
  font-size: 50cqw;
}

/* Фикс размера шрифта для inline режима */
.passive-inline .passive-timer-value {
  font-size: 12px;
}
</style>
