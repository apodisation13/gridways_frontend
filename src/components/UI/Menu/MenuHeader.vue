<template>
  <div class="header" v-if="menuNeeded">
    <img
      class="header__border"
      :src="require('@/assets/icons/VectorDown.svg')"
      alt=""
    />
    <div class="wrapper__avatar-resources">
      <button
        class="avatar"
        @click="showExpandedMenu"
        v-touch:swipe.bottom="showExpandedMenu"
      >
        <img
          class="avatar__btn"
          :src="require('@/assets/icons/' + 'Avatar.svg')"
          alt=""
          v-if="!path_to_icon"
        />
        <img
          :src="require(`@/assets/icons/resources/${path_to_icon}.svg`)"
          alt=""
          class="avatar__btn"
          v-else
        />
      </button>
      <div @click="showRightMenu" class="resources-clickable" v-if="isLoggedIn">
        <resource-item
          v-for="(count, name) in resources_list"
          :key="name"
          :name="name"
          :count="count"
        />
      </div>
    </div>
    <img
      class="header__border"
      :src="require('@/assets/icons/VectorUp.svg')"
      alt=""
    />
    <div
      class="expand-menu"
      v-if="expanded"
      v-touch:swipe.top="showExpandedMenu"
      @click.self="showExpandedMenu"
    >
      <div class="expand-menu__wrapper">
        <div class="expand-menu__content">
          <div class="expand-menu__top">
            <button
              v-for="button in routes"
              :key="button"
              class="menu-btn"
              @click="push(button.path)"
            >
              <span
                class="global_text menu-btn__text"
                v-if="!button.requireAuth"
              >
                {{ button.title }}
              </span>
              <span
                class="global_text menu-btn__text"
                v-if="button.requireAuth && isLoggedIn"
                >{{ button.title }}</span
              >
            </button>
          </div>
          <div class="expand-menu__footer" @click="showExpandedMenu">
            <button class="menu-btn">
              <span class="global_text menu-btn__text">Закрыть</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- ПРАВОЕ МЕНЮ - замени старые классы на эти -->
    <div
      class="expand-menu-right"
      v-if="expandedRight"
      v-touch:swipe.top="showRightMenu"
      @click.self="showRightMenu"
    >
      <div class="expand-menu-right__wrapper">
        <div class="expand-menu-right__content">
          <div @click="goToBonus">
            <div class="expand-menu-right__resources-row">
              <resource-item name="raw_bronze" :count="resources.raw_bronze" />
              <resource-item name="raw_silver" :count="resources.raw_silver" />
              <resource-item name="raw_gold" :count="resources.raw_gold" />
            </div>
            <div class="expand-menu-right__resources-row">
              <resource-item name="scraps" :count="resources.scraps" />
              <resource-item
                name="bronze_ingots"
                :count="resources.bronze_ingots"
              />
              <resource-item
                name="silver_ingots"
                :count="resources.silver_ingots"
              />
              <resource-item
                name="gold_ingots"
                :count="resources.gold_ingots"
              />
            </div>
            <div class="expand-menu-right__resources-row">
              <resource-item name="crops" :count="resources.crops" />
              <resource-item name="wood" :count="resources.wood" />
              <resource-item name="silk" :count="resources.silk" />
            </div>
            <div class="expand-menu-right__resources-row">
              <resource-item name="kegs" :count="resources.kegs" />
              <resource-item name="big_kegs" :count="resources.big_kegs" />
              <resource-item name="chests" :count="resources.chests" />
            </div>
            <div class="expand-menu-right__resources-row">
              <resource-item name="rare_gem" :count="resources.rare_gem" />
              <resource-item name="keys" :count="resources.keys" />
              <resource-item name="money" :count="resources.money" />
            </div>
          </div>
          <div class="expand-menu-right__footer" @click="showRightMenu">
            <button class="menu-btn">
              <span class="global_text menu-btn__text">Закрыть</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ResourceItem from "@/components/UI/ResourceItem.vue"
export default {
  name: "MenuHeader",
  components: {
    ResourceItem,
  },
  computed: {
    // меню не нужны, если в роутере есть notRequireMenu (страницы загрузки, игры)
    menuNeeded() {
      return !this.$router.currentRoute.value.meta.notRequireMenu
    },
    isLoggedIn() {
      return this.$store.getters["isLoggedIn"]
    },
    path_to_icon() {
      return this.$store.getters["selectedAvatar"]
    },
    resources() {
      return this.$store.getters["resource"]
    },
    currentPath() {
      return this.$route.path
    },
    resources_list() {
      if (this.currentPath === "/start_game") {
        return {
          crops: this.resources.crops,
          wood: this.resources.wood,
          silk: this.resources.silk,
          keys: this.resources.keys,
          money: this.resources.money,
        }
      } else if (this.currentPath === "/deckbuild") {
        return {
          scraps: this.resources.scraps,
          bronze_ingots: this.resources.bronze_ingots,
          silver_ingots: this.resources.silver_ingots,
          gold_ingots: this.resources.gold_ingots,
          rare_gem: this.resources.rare_gem,
          money: this.resources.money,
        }
      } else if (this.currentPath === "/bonus") {
        return {
          raw_bronze: this.resources.raw_bronze,
          raw_silver: this.resources.raw_silver,
          raw_gold: this.resources.raw_gold,
          rare_gem: this.resources.rare_gem,
          money: this.resources.money,
        }
      } else if (this.currentPath === "/win") {
        return {
          scraps: this.resources.scraps,
          raw_bronze: this.resources.raw_bronze,
          raw_silver: this.resources.raw_silver,
          raw_gold: this.resources.raw_gold,
          keys: this.resources.keys,
          money: this.resources.money,
        }
      }
      return { keys: this.resources.keys, money: this.resources.money }
    },
  },
  data() {
    return {
      routes: [
        { title: "Главная", path: "/main" },
        { title: "Правила", path: "/rules" },
        { title: "О нас", path: "/about" },
        { title: "Настройки", path: "/settings", requireAuth: true },
      ],
      expanded: false,
      expandedRight: false, // для правого меню
    }
  },
  methods: {
    showRightMenu() {
      this.expandedRight = !this.expandedRight
      if (this.expandedRight) this.expanded = false // закрываем левое, если открыто правое
    },
    showExpandedMenu() {
      this.expanded = !this.expanded
    },
    push(path) {
      if (!path) return
      this.expanded = false
      this.$router.push(path)
    },
    goToBonus() {
      this.expandedRight = false
      this.expanded = false
      this.$router.push("/bonus")
    },
  },
}
</script>

<style scoped>
.header__border {
  padding: 0;
  margin: 0;
  display: flex;
}

@media screen and (max-width: 1000px) {
  .header {
    /*border: solid 1px yellow;*/
    width: 100%;
    height: 100px;
  }
}

@media screen and (max-width: 500px) {
  .header {
    /*border: solid 1px red;*/
    width: 100%;
    height: 100px;
  }
}

.header {
  padding-top: 15px;
}

.avatar {
  position: absolute;
  background: var(--five-gold-gradient);
  border-radius: 40px;
  padding: 3px;
  border: 5px solid #1a1d24;
  height: 81px;
  width: 81px;
  margin-left: 12px;
}

.avatar__btn {
  width: 100%;
  height: 100%;
}

.wrapper__avatar-resources {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--dark-gradient);
  box-shadow:
    0 4px 4px rgba(0, 0, 0, 0.25),
    0 -4px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(2px);
  margin: 0;
  height: 53px;
}

.expand-menu__wrapper {
  background-image: url("~@/assets/header-menu-background.png");
  width: 207px;
  height: 271px;
  border-radius: 8px;
  margin-left: 10px;
  z-index: 8;
}

.expand-menu__content {
  background-image: linear-gradient(
    180deg,
    rgba(102, 112, 128, 0.95) 0%,
    rgba(21, 45, 81, 0.95) 100%
  );
  mix-blend-mode: multiply;
  position: relative;
  display: flex;
  box-sizing: border-box;
  margin-top: 18px;
  flex-direction: column;
  justify-content: space-around;
  border-radius: 5px;
  height: 100%;
}

.expand-menu__content ::before {
  content: "";
  position: absolute;
  z-index: -2;
  inset: 0;
  border-radius: 5px;
  padding: 2px;
  background: var(--primary-gold-gradient);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.expand-menu__top {
  display: flex;
  flex-direction: column;
  margin: 20px 22px 39px 22px;
  gap: 22px;
}

.expand-menu__footer {
  border-top: 1px solid;
  border-image-source: linear-gradient(
    266.83deg,
    rgba(192, 150, 69, 0) 0%,
    #facf5d 46.39%,
    rgba(192, 150, 70, 0) 93.76%
  );
  border-image-slice: 1;
}

.expand-menu__footer button {
  margin: 15px 0 21px 22px;
}

.expand-menu {
  content: "";
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.menu-btn {
  border: none;
  background: none;
  text-align: start;
}

.menu-btn__text {
  font-size: 20px;
  background: var(--primary-gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.resources-clickable {
  cursor: pointer;
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin-right: 15px;
}

.expand-menu-right {
  content: "";
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
}

.expand-menu-right__wrapper {
  background-image: url("~@/assets/header-menu-background.png");
  width: 207px;
  height: 331px;
  border-radius: 8px;
  margin-right: 10px;
  z-index: 8;
  position: relative;
  margin-top: 18px;
}

.expand-menu-right__content {
  background-image: linear-gradient(
    180deg,
    rgba(102, 112, 128, 0.95) 0%,
    rgba(21, 45, 81, 0.95) 100%
  );
  mix-blend-mode: multiply;
  position: relative;
  display: flex;
  box-sizing: border-box;
  /* margin-top: 18px;  ← УДАЛИ ЭТУ СТРОКУ ПОЛНОСТЬЮ */
  flex-direction: column;
  justify-content: space-around;
  border-radius: 5px;
  height: 100%;
}

.expand-menu-right__content::before {
  content: "";
  position: absolute;
  z-index: -2;
  inset: 0;
  border-radius: 5px;
  padding: 2px;
  background: var(--primary-gold-gradient);
  -webkit-mask:
    linear-gradient(0deg, #fff 0 0) content-box,
    linear-gradient(0deg, #fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.expand-menu-right__footer button {
  margin: 15px 0 21px 22px;
}

.expand-menu-right__content {
  background-image: linear-gradient(
    180deg,
    rgba(102, 112, 128, 0.95) 0%,
    rgba(21, 45, 81, 0.95) 100%
  );
  mix-blend-mode: multiply;
  position: relative;
  display: flex;
  box-sizing: border-box;
  /* margin-top: 18px;  ← УДАЛИ ЭТУ СТРОКУ ПОЛНОСТЬЮ */
  flex-direction: column;
  justify-content: space-around;
  border-radius: 5px;
  height: 100%;
}

.expand-menu-right__resources-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 5px 5px 0;
  gap: 8px;
}

.expand-menu-right__resources-row resource-item {
  width: auto;
  flex: 0 0 auto;
}

.expand-menu-right__footer {
  margin-top: auto; /* прижимает кнопку вниз */
  border-top: 1px solid;
  border-image-source: linear-gradient(
    266.83deg,
    rgba(192, 150, 69, 0) 0%,
    #facf5d 46.39%,
    rgba(192, 150, 70, 0) 93.76%
  );
  border-image-slice: 1;
}
</style>
