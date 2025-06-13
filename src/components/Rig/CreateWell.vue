<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="isEditMode ? 'Edit Well' : 'Create Well'"
      primaryBtnText="Save"
      secondaryBtnText="Cancel"
      :wrapperStyle="{ width: '40%' }"
      @on-submit="handleSubmit(onSubmit)"
      @on-cancel="onCancel">
      <div class="createwellpopup-container">
        <!-- Well Name -->
        <div class="inputgroup">
          <label for="wellName">Well Name</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange }"
            v-model="form.WellName"
            as="div"
            name="WellName"
            rules="required"
            class="input-wrapper">
            <input v-bind="field" id="wellName" placeholder="Well Name" type="text" class="inputbox" autocomplete="off" @input="handleChange" />
            <span v-if="errors[0]" class="invalid-msg">{{ errorMessage }}</span>
          </Field>
        </div>

        <!-- Tower Dropdown (No validation) -->
        <div class="inputgroup">
          <label for="tower">Tower</label>
          <div class="input-wrapper">
            <DropDown
              :modelValue="towerValue"
              class="dropdown"
              :options="towerOptions"
              placeholder="Select"
              :appendTo="'body'"
              @update:model-value="onTowerChange" />
          </div>
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { Api } from '@/services/api.services';
  import { IWellSchema } from '../../../server/interfaces/wellschema.interfaces';
  import { store } from '@/main';
  import { ToastType } from '@/components/ToastMessage.vue';
  import { Form as VForm, Field } from 'vee-validate';
  import DropDown, { IDropdownOptions } from '@/components/Globals/DropDown.vue';
  import { towers } from '@/assets/sample/dbJson.json';

  export default defineComponent({
    name: 'CreateWell',
    components: {
      CommonPopup,
      Field,
      VForm,
      DropDown,
    },
    props: {
      wellData: {
        type: Object as PropType<IWellSchema>,
        required: false,
      },
      isEditMode: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['on-submit', 'on-cancel'],
    data() {
      return {
        form: {
          WellName: '',
          TowerId: '',
        } as Partial<IWellSchema>,
        towerValue: {} as IDropdownOptions,
        towerOptions: towers.map((t) => ({ label: t.TowerName, value: t.TowerId })),
      };
    },
    watch: {
      wellData: {
        immediate: true,
        handler(val: IWellSchema | undefined) {
          if (val) {
            this.form.WellName = val.WellName;
            this.form.TowerId = val.TowerId;
            const match = this.towerOptions.find((t) => t.value === val.TowerId);
            if (match) this.towerValue = match;
          }
        },
      },
    },
    methods: {
      onTowerChange(option: IDropdownOptions) {
        this.towerValue = option;
        this.form.TowerId = option?.value?.toString() ?? '';
      },
      onCancel() {
        this.$emit('on-cancel');
      },
      async onSubmit() {
        const payload = {
          rawContent: {
            wellboreName: this.form.WellName ?? '',
            towerId: this.form.TowerId ?? '',
            wellName: this.form.WellName ?? '',
            colorGroupId: '',
            startDate: Date.now(),
            endDate: Date.now(),
            creationDate: Date.now(),
            properties: {
              wellTypeCode: '',
              company: '',
              operator: '',
              actualDuration: null,
              casingType: '',
              completionType: '',
              concession: '',
              equipmentRequirements: [],
              fieldName: '',
              holeType: '',
              loggingRequirements: [],
              mainCategory: '',
              mainProject: '',
              planDuration: null,
              remarks: '',
              slotNumber: null,
              subProject: '',
              targetReservoirZone: '',
              towerId: this.form.TowerId ?? '',
              waterDepth: null,
              totalDepth: null,
              surfaceStatus: '',
            },
          },
          uri: this.isEditMode ? this.wellData?.Uri : undefined,
        };
        console.log(payload);

        const url = this.isEditMode && this.wellData?.WellId ? `wells/${this.wellData.WellId}` : 'wells';
        const method = this.isEditMode ? Api.patch : Api.submit;
        const response = await method(url, payload);

        if (!response.error) {
          this.$emit('on-submit');
        } else {
          store.showToast(ToastType.ERROR, response.message || 'Operation failed');
        }
      },
    },
  });
</script>

<style scoped>
  .createwellpopup-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 20px;
    overflow: visible;
  }

  .inputgroup {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    overflow: visible;
  }

  .inputgroup label {
    width: 100px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: visible;
    position: relative;
  }

  .inputbox,
  .dropdown {
    height: 36px;
    border-radius: 4px;
    padding: 6px 10px;
    background-color: var(--bg-form-input);
    border: 1px solid var(--border-color, #ccc);
  }

  .invalid-msg {
    color: red;
    font-size: 12px;
    margin-top: 4px;
  }
</style>
