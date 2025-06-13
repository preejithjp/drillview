<template>
  <div class="popover">
    <span>Version: {{ version }}</span>
    <span v-if="packageConfig.buildNumber">Build: #{{ packageConfig.buildNumber }}</span>
    <span v-if="packageConfig.branchName">{{ buildVersion?.key }}: {{ buildVersion?.value }}</span>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { version, config } from '../../package.json';

  export default defineComponent({
    data() {
      return {
        version: version,
        packageConfig: config,
      };
    },
    computed: {
      buildVersion() {
        const splitKey = this.packageConfig.branchName.includes('refs/tags/') ? '/tags/' : '/heads/';
        const divided = this.packageConfig.branchName.split(splitKey);
        return {
          key: splitKey.includes('tags') ? 'Tag' : 'Branch',
          value: divided[1] ? divided[1] : divided[0],
        };
      },
    },
  });
</script>

<style scoped>
  .popover {
    font-family: monospace;
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 1em;
    left: 1em;
    padding: 8px 12px;
    background-color: var(--bg-secondary);
    color: var(--text-tertiary);
    border-radius: 4px;
    box-shadow: 0 0 13px 4px #00000070;
    z-index: 1000;
    font-size: 14px;
    gap: 5px;
  }
</style>
