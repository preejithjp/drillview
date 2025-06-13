<template>
  <label class="theme-toggle full-size">
    <input v-model="isDarkMode" type="checkbox" class="d-hidden" />
    <span class="slider">
      <SvgIcon name="light-icon" :class="{ active: currentTheme === Themes.LIGHT }" class="svg-icon size14" />
      <SvgIcon name="dark-icon" :class="{ active: currentTheme !== Themes.LIGHT }" class="svg-icon size14" />
    </span>
  </label>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { store } from '@/main';
  import { Themes } from '@/interfaces/state.interfaces';

  export default defineComponent({
    name: 'ThemeSelector',
    data() {
      return {
        Themes: Themes,
        isDarkMode: false as boolean,
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
    },
    watch: {
      isDarkMode() {
        store.setTheme(this.isDarkMode ? Themes.DARK : Themes.LIGHT);
      },
    },
    created() {
      this.isDarkMode = store.theme === Themes.DARK;
    },
  });
</script>

<style scoped>
  .theme-toggle {
    position: relative;
    display: inline-block;
    min-height: 10px;
    min-width: 30px;
  }

  .theme-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    background-color: var(--text-primary);
    border-radius: 50px;
    width: 100%;
    height: 100%;
    align-items: center;
    display: flex;
    justify-content: space-around;
  }

  .slider svg {
    width: 70%;
    height: 70%;
    transition: 0.3s;
    color: var(--icon-teritiary);
  }

  .light-icon {
    left: 10px;
  }

  .dark-icon {
    right: 10px;
    opacity: 0;
  }

  .theme-toggle input + .slider::before {
    content: '';
    position: absolute;
    top: 0;
    width: 50%;
    background-color: var(--bg-primary);
    height: 100%;
    border: 1px solid white;
  }

  .theme-toggle input:checked + .slider::before {
    right: 22px;
    border-top-left-radius: 50px;
    border-bottom-left-radius: 50px;
  }

  .theme-toggle input:not(:checked) + .slider::before {
    left: 22px;
    border-top-right-radius: 50px;
    border-bottom-right-radius: 50px;
  }

  .slider svg.active {
    opacity: 0.7;
    color: var(--black);
  }
</style>
