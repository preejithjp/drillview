<template>
  <div class="rig-container p10 gap10 d-grid height-100 width-100 fontSize-12 scroll primary scroll-auto">
    <div v-for="(rig, index) in rigs" :key="index" class="rig">
      <div class="rig-header d-flex align-items-center fontSemibold fontSize-12">
        {{ rig.Name }}
        <div class="d-flex gap5">
          <div class="d-flex gap10 align-items-center">
            <SvgIcon name="edit-icon" class="svg-icon size14 icon-actions icon-color" @click="editPopup(rig)" />
            <SvgIcon name="delete-icon" class="svg-icon size14 icon-actions icon-color" @click="deletRig(rig)" />
            <SvgIcon name="arrow-right" class="svg-icon size16 icon-color" @click="navigateToRigDetails(rig.RigId?.toString(), rig.Name)" />
          </div>
        </div>
      </div>
      <div class="rig-body d-flex flex-col fontMedium">
        <div class="text-ellipsis">
          <span class="pr5">Operator Name</span>
          <span class="fontSemibold">{{ rig.Well?.Operator }}</span>
        </div>
        <div class="text-ellipsis">
          <span class="pr5">Service Provider</span>
          <span class="fontSemibold">{{ rig.Well?.ServiceCompany }}</span>
        </div>
        <div class="text-ellipsis">
          <span class="pr5">Job Types</span>
          <span class="fontSemibold">
            <span
              v-for="(jobType, ind) in jobTypes(rig)"
              :key="ind"
              class="clickable-job cursor-pointer"
              @click="navigateJobType(jobType, rig.RigId?.toString(), rig.Name)">
              {{ jobType }}
              <span v-if="ind !== jobTypes(rig).length - 1">,</span>
            </span>
          </span>
        </div>
        <div class="text-ellipsis">
          <span class="pr5">Sync Time</span>
          <span v-if="isNeverSynched(rig)" class="fontSemibold">Never Synced</span>
          <span v-else v-dateTimeFormat="'datetimems'" class="fontSemibold">{{ rig?.SyncTime }}</span>
        </div>
        <div class="text-ellipsis">
          <span class="pr5">Target Machine Name</span>
          <span class="fontSemibold">{{ rig.Target?.Host }}</span>
        </div>
        <div class="statusHeader d-flex fontSize-12">
          <span>Status</span>
          <span>Sync Status</span>
        </div>
        <div class="statusBody d-grid align-items-center">
          <span class="statusIndicator" :class="rig.Status ? Status.Active : Status.Inactive"></span>
          <span class="status">{{ rig.Status ? Status.Active : Status.Inactive }}</span>
          <span class="statusIndicator" :class="rig.SyncStatus ? SyncUnsyncStatus.Sync : SyncUnsyncStatus.Unsync"></span>
          <span class="sync-status">{{ rig.SyncStatus ? SyncUnsyncStatus.Sync : SyncUnsyncStatus.Unsync }}</span>
        </div>
      </div>
    </div>
    <RigEditor v-if="rigEditPopup" :dataToEdit="selectedRigToEdit" @cancel="rigEditPopup = false" @save="saveEditedRig" />
    <ConfirmationPopup
      v-if="closeDeleteConfirmation"
      title="Confirmation"
      :show="true"
      message="Are you sure you want to proceed?"
      primaryBtnText="Remove"
      secondaryBtnText="Cancel"
      @on-cancel="closeDeleteConfirmation = false"
      @on-submit="confirmDelete" />
  </div>
  <div v-if="rigs.length === 0" class="d-flex justify-content-center align-items-center height-100">
    <span class="fontSize-16 noData">No data available.</span>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import RigEditor from '../components/RigEditor.vue';
  import ConfirmationPopup from './Common/ConfirmationPopup.vue';
  import { IRig } from '../../server/interfaces/datacollection.interfaces';
  import { Api } from '../services/api.services';
  import { Routes } from '@/router/index';

  export enum Status {
    Active = 'Active',
    Inactive = 'Inactive',
  }

  export enum SyncUnsyncStatus {
    Sync = 'Sync',
    Unsync = 'Unsync',
  }

  export default defineComponent({
    name: 'DataCollectionRigdetails',
    components: {
      RigEditor,
      ConfirmationPopup,
    },
    props: {
      allRigs: {
        type: Array as PropType<IRig[]>,
        required: true,
      },
    },
    emits: ['reFetchRig'],
    data() {
      return {
        SyncUnsyncStatus: SyncUnsyncStatus,
        Status: Status,
        rigs: [] as IRig[],
        rigEditPopup: false as boolean,
        closeDeleteConfirmation: false as boolean,
        selectedRigToEdit: {} as IRig,
        rigIdToDelet: '' as string,
      };
    },
    computed: {
      jobTypes() {
        return (rig: IRig) => [...new Set(rig.JobTypes?.map((record) => record.Name))];
      },
    },
    watch: {
      allRigs: {
        handler(newVal) {
          this.rigs = newVal ? JSON.parse(JSON.stringify(newVal)) : [];
        },
        immediate: true,
        deep: true,
      },
    },

    methods: {
      isNeverSynched(rig: IRig) {
        if (!rig?.SyncTime) return true;
        const syncDate = new Date(rig.SyncTime);
        return isNaN(syncDate.getTime()) || syncDate.getTime() === 0;
      },
      navigateJobType(jobType: string, rigId: string | undefined, name: string) {
        if (!rigId) {
          return;
        }
        this.$router.push({
          name: Routes.DataCollection,
          params: { id: rigId.toString(), jobtype: jobType, subtitle: name },
        });
      },
      async fetchRig() {
        const result = await Api.fetch('dataCollection');
        this.rigs = result;
      },
      deletRig(rig: Partial<IRig>) {
        this.closeDeleteConfirmation = true;
        this.rigIdToDelet = rig.RigId ? rig.RigId.toString() : '';
      },
      async confirmDelete() {
        const response = await Api.delete('dataCollection', this.rigIdToDelet);
        if (response) {
          this.$emit('reFetchRig');
        }
        this.closeDeleteConfirmation = false;
      },
      editPopup(rig: IRig) {
        this.rigEditPopup = true;
        this.selectedRigToEdit = rig;
      },
      async saveEditedRig(dataToUpdate: IRig) {
        const { RigId, ...fieldsToUpdate } = dataToUpdate;
        const result = await Api.patch(`dataCollection/${RigId}`, fieldsToUpdate);
        if (result) {
          this.$emit('reFetchRig');
        }
        this.rigEditPopup = false;
      },
      navigateToRigDetails(rigId: string | undefined, name: string) {
        if (!rigId) {
          return;
        }
        this.$router.push({
          name: Routes.DataCollection,
          params: { id: rigId.toString(), subtitle: name },
        });
      },
    },
  });
</script>

<style scoped>
  .rig-body {
    gap: 2px;
  }
  .rig-container {
    overflow-y: overlay;
    grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
    height: max-content !important;
    padding: 8px 20px;
    scrollbar-gutter: stable;
  }
  .rig {
    line-height: 1.6;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid var(--border-tertiary);
    background: var(--bg-septenary);
  }
  .rig-header {
    justify-content: space-between;
    padding-bottom: 5px;
  }
  .statusIndicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .statusHeader {
    padding-top: 5px;
    grid-template-columns: 1fr 1fr;
    color: var(--text-senary);
    gap: 30px;
  }
  .statusBody {
    padding: 5px 0;
    grid-template-columns: 15px 50px 15px 1fr;
  }
  .icon-actions {
    display: flex;
    gap: 15px;
    opacity: 0;
    transition: all 0.3s ease;
  }
  .icon-actions .svg-icon {
    cursor: pointer;
  }
  .rig:hover .icon-actions {
    opacity: 1;
  }
  .Active,
  .Sync {
    background-color: var(--status-active-color);
  }
  .Inactive,
  .Unsync {
    background-color: var(--status-inactive-color);
  }
  .noData {
    text-align: center;
    color: var(--text-quinary);
    padding: 10px;
  }
  .text-ellipsis .pr5 {
    color: var(--text-senary);
  }
  .icon-color {
    color: var(--icon-secondary);
  }
</style>
