<template>
  <div class="about-page">
    <h1 class="about-page__title global_text">О нас</h1>

    <div class="about-page__card">
      <p class="about-page__subtitle">
        Тут можно ознакомиться с информацией о нас
      </p>

      <div class="about-page__rows">
        <div class="about-page__row">
          <span class="about-page__label">Телефон</span>
          <span class="about-page__value">{{ phone }}</span>
        </div>
        <div class="about-page__row">
          <span class="about-page__label">Почта</span>
          <span class="about-page__value">{{ email }}</span>
        </div>
        <div class="about-page__row">
          <span class="about-page__label">Телеграм</span>
          <span class="about-page__value">{{ tg }}</span>
        </div>
      </div>

      <div class="about-page__footer">
        Самозанятый Солошенко Павел
        <br />
        ИНН: {{ inn }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AboutPage",
  data() {
    return {
      phone: process.env.VUE_APP_PHONE || "",
      email: process.env.VUE_APP_EMAIL || "",
      tg: process.env.VUE_APP_TG || "",
      inn: process.env.VUE_APP_INN || "",
    }
  },
}
</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(var(--vh, 1vh) * 100 - 100px);
  padding: 24px 16px calc(57px + env(safe-area-inset-bottom, 0px));
  color: white;
}

.about-page__title {
  font-size: 1.8rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
}

.about-page__card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(196, 155, 0, 0.25);
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-page__subtitle {
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin: 0;
}

.about-page__rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-page__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(196, 155, 0, 0.15);
}

.about-page__label {
  font-family: "Philosopher", serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.about-page__value {
  font-family: "Philosopher", serif;
  font-size: 0.9rem;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.about-page__footer {
  font-family: "Philosopher", serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  line-height: 1.6;
}
</style>
