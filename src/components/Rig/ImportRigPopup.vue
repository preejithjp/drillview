<template>
  <CommonPopup
    popupTitle="Import Rig"
    primaryBtnText="Import"
    secondaryBtnText="Cancel"
    :wrapperStyle="{ width: '80%', height: 'auto' }"
    :disabledPrimaryBttn="!selectedRigIds.length"
    @on-submit="importSelectedRigs"
    @on-cancel="$emit('on-cancel')">
    <div class="import-rig-body d-flex flex-col scroll-auto">
      <div class="import-rig-table-wrapper scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th><input v-model="selectAll" type="checkbox" title="Select All" /></th>
              <th>Rig Name</th>
              <th>Description</th>
              <th>Contract Start</th>
              <th>Contract End</th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-if="!rigList.length">
              <td class="fontSize-14 text-center" colspan="5">No rigs available.</td>
            </tr>
            <tr
              v-for="rig in rigList"
              :key="String(rig.RigId)"
              class="selectable"
              :class="{ selected: selectedRigIds.includes(rig.RigId.toString()) }">
              <td>
                <input v-model="selectedRigIds" type="checkbox" :value="rig.RigId.toString()" title="Select Rig" />
              </td>
              <td class="col-name">{{ rig.RigName }}</td>
              <td class="col-description">{{ rig.Description || '-' }}</td>
              <td class="col-date">{{ formatDate(rig.ContractStart) }}</td>
              <td class="col-date">{{ formatDate(rig.ContractEnd) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { Api } from '@/services/api.services';
  import { IRigItem } from '../../../server/interfaces/rigscheduler.interfaces';

  export default defineComponent({
    name: 'ImportRigPopup',
    components: { CommonPopup },
    props: {
      // Pass in the already-assigned rigs so we can pre-check them
      initialSelectedIds: {
        type: Array as PropType<string[]>,
        default: () => [],
      },
    },
    emits: ['on-submit', 'on-cancel'],
    data() {
      return {
        rigList: [] as IRigItem[],
        selectedRigIds: [] as string[],
        selectAll: false as boolean,
      };
    },
    watch: {
      // keep "Select All" in sync
      selectAll(val: boolean) {
        this.selectedRigIds = val ? this.rigList.map((r) => r.RigId.toString()) : [];
      },
      selectedRigIds() {
        this.selectAll = this.selectedRigIds.length === this.rigList.length;
      },
      // whenever the popup is opened with new initialSelectedIds, update checkboxes
      initialSelectedIds: {
        handler(ids: string[]) {
          this.selectedRigIds = [...ids];
        },
        immediate: true,
      },
    },
    async mounted() {
      // load full list of available rigs
      const response = await Api.fetch('rigs');
      if (Array.isArray(response)) {
        this.rigList = response.map((r: any) => {
          const content = typeof r.content === 'string' ? JSON.parse(r.content) : r.rawContent || {};
          return {
            RigId: typeof r.originalId === 'object' ? r.originalId.toString() : r.originalId,
            RigName: content.name ?? '-',
            Description: content.description ?? '-',
            ContractStart: content.contractStartDate ?? null,
            ContractEnd: content.contractEndDate ?? null,
          } as IRigItem;
        });
        // after we've fetched rigList, ensure any IDs passed in are accounted for
        this.selectedRigIds = this.initialSelectedIds.filter((id) => this.rigList.some((r) => r.RigId.toString() === id));
      }
    },
    methods: {
      importSelectedRigs() {
        // emit the full rig objects
        const selected = this.rigList.filter((r) => this.selectedRigIds.includes(r.RigId.toString()));
        this.$emit('on-submit', selected);
      },
      formatDate(ts?: number | string | null): string {
        if (ts == null || ts === '') return '-';
        const ms = typeof ts === 'string' ? parseInt(ts, 10) : ts;
        if (isNaN(ms as number)) return '-';
        return new Date(ms as number).toLocaleDateString('en-US');
      },
    },
  });
</script>

<style scoped>
  .import-rig-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
  }
  .import-rig-table-wrapper {
    flex: 1;
  }
  .common-table th,
  .common-table td {
    padding: 8px;
    white-space: nowrap;
  }
  .selectable:hover {
    background-color: var(--bg-secondary);
    cursor: pointer;
  }
  .selected {
    background-color: var(--bg-primary-light);
  }
  .col-name {
    font-weight: 600;
  }
  .col-description {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .col-date {
    width: 120px;
  }
</style>
