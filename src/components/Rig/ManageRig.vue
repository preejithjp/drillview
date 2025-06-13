<template>
  <div class="full-size p10 fontNormal">
    <LoadingIcon v-if="loading" />
    <div class="p10 managerig full-size">
      <div class="heading-row d-flex justify-space-between align-center p10 fontSize-20">
        <div class="d-flex gap10 align-center">
          <SvgIcon name="resource-icon" class="svg-icon size30 settings" />
          <span class="heading fontBold">Manage Rig</span>
        </div>
        <CustomButton class="fontBold" :size="BtnSizes.SMALL" @click="createNewRig">New</CustomButton>
      </div>
      <div class="rig-table-wrapper scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th>Rig Name</th>
              <th>Contract Start</th>
              <th>Contract End</th>
              <th>Description</th>
              <th class="text-center" colspan="2"></th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-if="rigList.length === 0">
              <td class="fontSize-14 text-center" colspan="6">No rigs available.</td>
            </tr>
            <tr v-for="rig in rigList" :key="String(rig.RigId)" class="selectable">
              <td class="col-name">{{ rig.RigName }}</td>
              <td class="col-date">{{ formatDate(rig.ContractStart) }}</td>
              <td class="col-date">{{ formatDate(rig.ContractEnd) }}</td>
              <td class="col-description">{{ rig.Description }}</td>
              <td class="text-center">
                <div class="d-flex align-items-center justify-content-center gap20">
                  <SvgIcon name="edit-icon" class="svg-icon size14" @click.stop="editRig(rig)" />
                  <SvgIcon name="delete-icon" class="svg-icon size14" @click.stop="confirmDelete(rig.RigId as string)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmationPopup v-if="showDeletePopup" :show="showDeletePopup" @on-cancel="cancelDelete" @on-submit="removeRig" />

    <CreateRig v-if="showCreateRigPopup" :rigData="selectedRig" :is-edit-mode="isEditMode" @on-cancel="closeEdit" @on-submit="handleRigCreated" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CreateRig from './CreateRig.vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import CustomButton, { BtnSizes } from '@/components/Globals/CustomButton.vue';
  import { Api } from '@/services/api.services';
  import { IRigSchema } from '../../../server/interfaces/rigschema.interfaces';

  export default defineComponent({
    name: 'ManageRig',
    components: {
      CreateRig,
      ConfirmationPopup,
      CustomButton,
    },
    data() {
      return {
        BtnSizes,
        rigList: [] as IRigSchema[],
        selectedRig: undefined as IRigSchema | undefined,
        isEditMode: false,
        showCreateRigPopup: false,
        showDeletePopup: false,
        rigToDeleteId: '',
        loading: false,
      };
    },
    mounted() {
      this.fetchAllRigs();
    },
    methods: {
      async fetchAllRigs() {
        this.loading = true;
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
            } as IRigSchema;
          });
        }
        this.loading = false;
      },
      createNewRig() {
        this.isEditMode = false;
        this.selectedRig = undefined;
        this.showCreateRigPopup = true;
      },
      editRig(rig: IRigSchema) {
        this.selectedRig = { ...rig };
        this.isEditMode = true;
        this.showCreateRigPopup = true;
      },
      confirmDelete(id: string) {
        this.rigToDeleteId = id;
        this.showDeletePopup = true;
      },
      cancelDelete() {
        this.showDeletePopup = false;
        this.rigToDeleteId = '';
      },
      async removeRig() {
        await Api.delete('rigs', this.rigToDeleteId);
        this.cancelDelete();
        this.fetchAllRigs();
      },
      async handleRigCreated() {
        this.showCreateRigPopup = false;
        this.selectedRig = undefined;
        await this.fetchAllRigs();
      },
      closeEdit() {
        this.selectedRig = undefined;
        this.showCreateRigPopup = false;
      },
      formatDate(timestamp?: number | null): string {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('en-US');
      },
    },
  });
</script>

<style scoped>
  .managerig {
    border-radius: 8px;
    background: var(--bg-quaternary);
    /* border: 1px solid var(--border-tertiary); */
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

  .rig-table-wrapper {
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
