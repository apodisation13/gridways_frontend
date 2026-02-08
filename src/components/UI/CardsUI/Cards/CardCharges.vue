<template>
  <div class="charge-wrapper" :style="{ '--bgColor': bgColor }">
    <div class="charge">
      <div class="charge-icon">
        <div class="charge-value">
          {{ charge }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    charge: {
      type: Number,
    },
    bgColor: {
      type: String,
    },
  },
}
</script>

<style scoped>
.charge-wrapper {
  position: absolute;
  width: 20%;
  aspect-ratio: 1 / 1;
  bottom: -1%;
  right: 0;
  transform: rotate(-45deg);
  background-color: var(--bgColor);
  border-radius: 10%;
  container-type: size;
}

.charge {
  position: absolute;
  transform: rotate(45deg);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.charge-icon {
  width: 65%;
  height: 110%;
  background-image: url("~@/assets/icons/card/charge.svg");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
}

.charge-value {
  display: block;
  font-size: 40cqw;
  color: white;
  margin-right: 10%;
}
</style>
