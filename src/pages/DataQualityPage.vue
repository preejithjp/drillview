<template>
  <div class="homePage fontNormal line-height1">
    <div v-show="!showNavbar" class="dataquality-header-content d-flex align-items-center">
      <div class="title-container gap5 align-items-center">
        <SvgIcon name="data-quality" class="svg-icon size34 mr4 header-color" />
        <span class="fontSize-12 fontSemibold header-color">Data Quality</span>
      </div>
      <div class="search-bar header-search-bar">
        <SearchInput placeholder="Search" />
      </div>
    </div>
    <div class="dataquality-body p10">
      <DataqualityCard v-show="!showNavbar"></DataqualityCard>
      <div class="graph-container mt10" :class="{ navbar_open: showNavbar, navbar: !showNavbar }">
        <div class="header-color d-flex gap5 align-items-center">
          <SvgIcon name="data-gap" class="svg-icon size24 mr4" />
          <span class="fontSize-14 fontBold">Data Gap</span>
          <span>|</span>
          <span class="flex-full fontSize-12">Co-relation</span>
          <SvgIcon name="full-screen" class="svg-icon size24 fullscreen" @click="openFullScreen()" />
        </div>
        <div class="graph-body">
          <div class="d-flex gap5">
            <input type="checkbox" />
            HKL
            <input type="checkbox" />
            BLOP
            <input type="checkbox" />
            DEPTH
            <input type="checkbox" />
            RPM
            <input type="checkbox" />
            ROP
            <input type="checkbox" />
            Flow-in
            <input type="checkbox" />
            Flow-out
          </div>
          <ChartContainer></ChartContainer>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ChartContainer from '@/components/ChartContainer.vue';
  import DataqualityCard from '@/components/DataqualityCard.vue';

  export default defineComponent({
    name: 'DataQualityPage',
    components: {
      ChartContainer,
      DataqualityCard,
    },
    data() {
      return {
        showNavbar: false as boolean,
      };
    },
    computed: {},
    mounted() {},
    methods: {
      openFullScreen() {
        this.showNavbar = !this.showNavbar;
      },
    },
  });
</script>

<style scoped>
  .line-height1 {
    line-height: 1;
  }

  /* header css start*/
  .dataquality-header-content {
    width: 100%;
    justify-content: space-between;
    height: 60px;
    background-color: var(--bg-secondary);
    padding: 0 10px;
  }

  .title-container {
    display: grid;
    grid-template-columns: 34px 1fr;
  }

  .header-search-bar {
    width: 300px;
    position: relative;
    border: 1px solid var(--tertiary-bg);
    border-radius: 5px;
  }

  .search-bar input {
    width: 100%;
    padding: 10px 40px 10px 10px;
    border: 1px solid var(--graph-title-color);
    border-radius: 5px;
  }

  /* header css end */

  /* graph container css start */

  .graph-container {
    border: 1px solid var(--graph-title-color);
    border-radius: 8px;
    padding: 20px;
  }

  .header-color {
    color: var(--graph-title-color);
  }

  .gap5 {
    gap: 5px;
  }

  .graph-body {
    padding: 10px 0;
  }

  .navbar_open {
    width: 100%;
    height: 100%;
    margin: unset;
    padding: inherit;
  }

  .navbar_open .fullscreen {
    transform: rotate(180deg);
  }

  /* graph container css end */
</style>
