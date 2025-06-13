<template>
  <div class="well-list-panel">
    <ul class="well-list">
      <li
        v-for="well in wellList"
        :key="well.WellId"
        class="well-item fontNormal fontSize-12 text-tertiary"
        draggable="true"
        @dragstart="onDragStart(well, $event)">
        {{ well.WellName }}
      </li>
      <li v-if="!wellList.length" class="no-wells fontNormal fontSize-12 text-tertiary">No wells available.</li>
    </ul>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Api } from '@/services/api.services';
  import type { DisplayWell } from '../../../server/interfaces/wellschema.interfaces';

  // Exported interface to avoid private name usage errors
  export interface WellItem extends DisplayWell {
    TowerName: string;
    Uri?: string;
    CreatedDate?: number;
    properties: Record<string, any>;
  }

  export default defineComponent({
    name: 'WellListPanel',
    data() {
      return {
        wellList: [] as WellItem[],
      };
    },
    async mounted() {
      const response = await Api.fetch('wells');
      if (Array.isArray(response)) {
        this.wellList = (response as any[]).map((w) => {
          const raw = w.rawContent || {};
          return {
            WellId: w.originalId,
            WellName: raw.wellName || '-',
            TowerName: raw.properties?.towerId || '',
            Uri: w.uri,
            CreatedDate: w.creationDate,
            properties: raw.properties || {},
          } as WellItem;
        });
      }
    },
    methods: {
      onDragStart(well: WellItem, event: DragEvent) {
        if (!event.dataTransfer) return;
        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({
            WellId: well.WellId,
            WellName: well.WellName,
            TowerName: well.TowerName,
            properties: well.properties,
          })
        );
      },
    },
  });
</script>

<style scoped>
  .well-list-panel {
    background: #f0f0f0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .well-list {
    flex: 1;
    margin: 0;
    padding: 10px;
    list-style: none;
    overflow-y: auto;
  }

  .well-item {
    padding: 6px 8px;
    margin-bottom: 4px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
  }

  .well-item:active {
    cursor: grabbing;
  }

  .no-wells {
    padding: 10px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
</style>
