<template>
  <div class="full-size p10 fontNormal">
    <LoadingIcon v-if="loading" />
    <div class="p10 managewell full-size">
      <div class="heading-row d-flex justify-space-between align-center p10 fontSize-20">
        <div class="d-flex gap10 align-center">
          <SvgIcon name="wellbore-icon" class="svg-icon size30 settings" />
          <span class="heading fontBold">Manage Well</span>
        </div>
        <CustomButton class="fontBold" :size="BtnSizes.SMALL" @click="createNewWell">New</CustomButton>
      </div>
      <div class="well-table-wrapper scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th>Well Name</th>
              <th>Tower</th>
              <th>Created On</th>
              <th class="text-center" colspan="2"></th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-if="wellList.length === 0">
              <td class="fontSize-14 text-center" colspan="5">No wells available.</td>
            </tr>
            <tr v-for="well in wellList" :key="String(well.WellId)" class="selectable">
              <td class="col-name">{{ well.WellName }}</td>
              <td class="col-tower">{{ well.TowerName }}</td>
              <td class="col-date">{{ formatDate(well.CreatedDate) }}</td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap20">
                  <SvgIcon name="edit-icon" class="svg-icon size14" @click.stop="editWell(well)" />
                  <SvgIcon name="delete-icon" class="svg-icon size14" @click.stop="confirmDelete(well.WellId || '', well.Uri || '')" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmationPopup v-if="showDeletePopup" :show="showDeletePopup" @on-cancel="cancelDelete" @on-submit="removeWell" />

    <CreateWell
      v-if="showCreateWellPopup"
      :wellData="selectedWell"
      :is-edit-mode="isEditMode"
      @on-cancel="closeEdit"
      @on-submit="handleWellCreated" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import CustomButton, { BtnSizes } from '@/components/Globals/CustomButton.vue';
  import CreateWell from './CreateWell.vue';
  import { Api } from '@/services/api.services';
  import { IWellSchema, DisplayWell } from '../../../server/interfaces/wellschema.interfaces';

  export default defineComponent({
    name: 'ManageWell',
    components: {
      CreateWell,
      ConfirmationPopup,
      CustomButton,
    },
    data() {
      return {
        BtnSizes,
        wellList: [] as DisplayWell[],
        selectedWell: undefined as IWellSchema | undefined,
        isEditMode: false,
        showCreateWellPopup: false,
        showDeletePopup: false,
        wellToDeleteId: '',
        wellToDeleteUri: '',
        loading: false,
      };
    },
    mounted() {
      this.fetchAllWells();
    },
    methods: {
      async fetchAllWells() {
        this.loading = true;
        const response = await Api.fetch('wells');
        if (Array.isArray(response)) {
          this.wellList = response
            .sort((a: any, b: any) => {
              // Prefer `lastUpdatedDate`, fallback to `creationDate`
              const dateA = a.lastUpdatedDate ?? a.creationDate ?? 0;
              const dateB = b.lastUpdatedDate ?? b.creationDate ?? 0;
              return dateB - dateA; // Descending order
            })
            .map((w: any) => {
              const raw = w.rawContent || {};
              return {
                WellId: w.originalId,
                WellName: raw.wellName || '-',
                TowerName: raw.properties?.towerId || '-',
                CreatedDate: w.creationDate || null,
                Uri: w.uri || '',
              };
            });
        }
        this.loading = false;
      },
      createNewWell() {
        this.isEditMode = false;
        this.selectedWell = undefined;
        this.showCreateWellPopup = true;
      },
      editWell(well: DisplayWell) {
        this.selectedWell = {
          WellName: well.WellName,
          TowerName: well.TowerName,
          WellId: well.WellId,
          Uri: well.Uri,
          RigId: '',
          RigName: '',
          TowerId: well.TowerName,
          CommenceDate: Date.now(),
          EndDate: Date.now(),
          CreatedDate: well.CreatedDate,
        };
        this.isEditMode = true;
        this.showCreateWellPopup = true;
      },

      confirmDelete(id: string, uri: string) {
        this.wellToDeleteId = id;
        this.wellToDeleteUri = uri;
        this.showDeletePopup = true;
      },
      cancelDelete() {
        this.showDeletePopup = false;
        this.wellToDeleteId = '';
      },
      async removeWell() {
        await Api.delete('wells', encodeURIComponent(this.wellToDeleteUri));
        this.cancelDelete();
        await this.fetchAllWells();
      },

      async handleWellCreated() {
        this.showCreateWellPopup = false;
        this.selectedWell = undefined;
        await this.fetchAllWells();
      },

      closeEdit() {
        this.selectedWell = undefined;
        this.showCreateWellPopup = false;
      },
      formatDate(timestamp?: number): string {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('en-US');
      },
    },
  });
</script>

<style scoped>
  .managewell {
    border-radius: 8px;
    background: var(--bg-quaternary);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .heading-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    color: var(--text-tertiary);
  }

  .well-table-wrapper {
    margin-top: 1rem;
    border-radius: 6px;
    overflow-y: auto;
    max-height: 500px;
  }

  .common-table {
    width: 100%;
    border-collapse: collapse;
  }

  .common-table th,
  .common-table td {
    padding: 10px;
    text-align: left;
    white-space: nowrap;
  }

  .selectable:hover {
    background-color: var(--bg-secondary);
    cursor: pointer;
  }

  .text-center {
    text-align: center;
  }

  .common-table svg {
    color: var(--icon-secondary);
  }

  .svg-icon:hover {
    color: var(--icon-hover);
    cursor: pointer;
  }
</style>
