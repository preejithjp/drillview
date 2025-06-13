<template>
  <div class="search-input-container">
    <input v-model="searchQuery" type="text" :placeholder="placeholder" autocomplete="off" class="search-input" />
    <SvgIcon v-if="!searchQuery" name="search-icon" class="svg-icon size16 search-icon" />
    <SvgIcon v-else-if="!hideClear" name="close-icon" class="svg-icon size12 search-icon" @click="clearSearch" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'SearchInput',
    props: {
      modelValue: String,
      placeholder: {
        type: String,
        default: 'Search',
      },
      hideClear: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    computed: {
      searchQuery: {
        get(): string {
          return this.modelValue || '';
        },
        set(value: string) {
          this.$emit('update:modelValue', value);
        },
      },
    },
    methods: {
      clearSearch() {
        this.$emit('update:modelValue', '');
      },
    },
  });
</script>

<style scoped>
  .search-input-container {
    position: relative;
    min-width: 100px;
    width: 100%;
    height: 100%;
  }

  .search-input {
    width: 100%;
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
    box-sizing: border-box;
    padding-right: 30px;
  }

  .search-icon {
    position: absolute;
    top: 50%;
    right: 0.8rem;
    transform: translateY(-50%);
    color: var(--icon-secondary);
  }
</style>
