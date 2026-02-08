<template>
  <div class="heart-wrapper" :style="{ '--bgColor': bgColor }">
    <div class="heart" :style="bgImage">
      <div class="health-value">
        {{ health }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    health: {
      type: [Number, String],
    },
    bgColor: {
      type: String,
    },
  },
  computed: {
    bgImage() {
      if (isNaN(this.health) && this.health.includes("-"))
        return {
          backgroundImage: `url(${require("@/assets/icons/card/heart_red.svg")})`,
        }
      else if (isNaN(this.health) && this.health.includes("+"))
        return {
          backgroundImage: `url(${require("@/assets/icons/card/heart_light_green.svg")})`,
        }
      else
        return {
          backgroundImage: `url(${require("@/assets/icons/card/heart_green.svg")})`,
        }
    },
  },
}
</script>

<style scoped>
.heart-wrapper {
  position: absolute;
  bottom: -1%;
  left: 1%;
  width: 20%;
  aspect-ratio: 1 / 1; /* Квадрат для ровного ромба */
  transform: rotate(-45deg);
  background-color: var(--bgColor);
  border-radius: 10%;
  container-type: size;
}

.heart {
  position: absolute;
  transform: rotate(45deg);
  top: 10%;
  right: 10%;
  bottom: 0;
  left: 0;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.health-value {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10%;
  margin-bottom: 10%;
  font-size: 50cqw; /* Относительно контейнера */
  color: white;
}
</style>
