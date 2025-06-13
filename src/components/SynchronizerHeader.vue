<template>
  <div class="d-flex align-items-center gap10">
    <div class="d-flex gap10 width-100">
      <span class="d-flex align-items-center gap10">
        <SvgIcon :name="iconName" class="svg-icon size30" />
        <span class="fontSemibold fontSize-14">{{ title }}</span>
      </span>
      <div v-if="sourceConn.length" class="header d-flex gap5 width-100 fontSize-12">
        <template v-for="(set, index) in sourceConn" :key="index">
          <span>{{ set.Name }}</span>
          <span>{{ sourceConn.length === 1 ? '|' : sourceConn.length - 1 === index ? '' : '|' }}</span>
          <span v-if="sourceConn.length === 1">{{ set.UserName }}</span>
          <span v-if="sourceConn.length === 1">|</span>
          <span v-if="sourceConn.length === 1">WITSML {{ set.Version }}</span>
        </template>
      </div>
    </div>
    <div v-if="primaryBtnText || secondaryBtnText" class="synchronizer-actions d-flex align-items-center">
      <CustomButton v-if="primaryBtnText" class="flex-gap-10" :disabled="disabledPrimaryBttn" :size="BtnSizes.SMALL" @click="$emit('emitPrimaryBtn')">
        {{ primaryBtnText }}
      </CustomButton>
      <CustomButton v-if="secondaryBtnText" class="flex-gap-10" :size="BtnSizes.SMALL" @click="$emit('emitSecondaryBtn')">
        {{ secondaryBtnText }}
      </CustomButton>
      <div class="search-input-width">
        <SearchInput placeholder="Search Record" @input="onSearch($event)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { ISourceConfig } from '../../server/interfaces/synchronizer.interfaces';
  import { BtnSizes } from './Globals/CustomButton.vue';

  export default defineComponent({
    name: 'SynchronizerHeader',
    props: {
      title: {
        type: String,
        required: true,
        default: '',
      },
      iconName: {
        type: String,
        required: true,
        default: '',
      },
      sourceConn: {
        type: Array as () => ISourceConfig[],
        default: () => [],
      },
      primaryBtnText: { type: String },
      secondaryBtnText: { type: String },
      disabledPrimaryBttn: { type: Boolean, default: false },
    },
    emits: ['search', 'emitPrimaryBtn', 'emitSecondaryBtn'],
    data() {
      return {
        BtnSizes,
      };
    },
    methods: {
      onSearch(event: Event) {
        const input = event.target as HTMLInputElement;
        this.$emit('search', input.value);
      },
    },
  });
</script>

<style scoped>
  .svg-icon {
    color: var(--icon-secondary);
    cursor: pointer;
  }
  .header {
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
    padding: 0.4rem 2.5rem 0.4rem 1rem;
    background-color: var(--bg-septenary);
  }

  .synchronizer-actions {
    gap: 0.5rem;
  }

  .btn.btn-pad {
    padding: 6px;
  }

  .search-input-width {
    width: 400px;
  }
</style>
