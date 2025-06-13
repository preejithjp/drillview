<template>
  <div class="d-flex flex-col width-100 p10 mb10 mt10 mr10 document-details-container">
    <div v-if="headerName" class="p10 ml6 mt5">
      <div class="d-flex justify-content-space-between align-items-center">
        <div class="fontWeight-700 pb5">{{ headerName }}</div>
        <SvgIcon name="save-icon" class="svg-icon size26 mr10 pb5 secondary"></SvgIcon>
      </div>
      <hr class="border-line mr10" />
    </div>
    <div v-if="detailedData" class="p10 ml6 mb10 section text-quinary">
      <ul>
        <li v-for="(value, key) in detailedData" :key="key">
          <div v-if="typeof value === 'object'">
            {{ key }}:
            <ul>
              <li v-for="(nestedValue, nestedKey) in value" :key="nestedKey">{{ nestedKey }} : {{ nestedValue || 'null' }}</li>
            </ul>
          </div>
          <div v-else>{{ key }} : {{ value || 'null' }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
  import { NodeDetails } from '../../server/interfaces/documentmanager.interface';
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: 'DocumentDetails',
    props: {
      headerName: { type: String, required: true },
      detailedData: { type: {} as PropType<NodeDetails>, required: true },
    },
  });
</script>

<style scoped>
  .document-details-container {
    border-radius: 0px 8px 8px 0px;
    border: 1px solid var(--border-tertiary);
    background: var(--bg-quinary);
  }

  .border-line {
    background-color: var(--border-tertiary);
    border: none;
    height: 1px;
  }
  .section {
    flex-grow: 1;
    overflow: hidden;
  }
  .section:hover {
    overflow: auto;
  }
</style>
