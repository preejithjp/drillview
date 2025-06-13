<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="'Add New Job Type'"
      primaryBtnText="Add"
      secondaryBtnText="Cancel"
      @on-submit="handleSubmit(onSave)"
      @on-cancel="onCancel">
      <div class="popup-fields d-flex flex-col">
        <div class="field d-flex align-items-center">
          <label for="name" class="field-label fontSemibold fontSize-14">Name</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Name"
            :rules="{ required: true, existIn: jobTypeList }"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="name"
              v-model="jobTypeDetails.Name"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Name"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="Description" class="field-label fontSemibold fontSize-14">Description</label>
          <input
            id="Description"
            v-model="jobTypeDetails.Description"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter the Description" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="job-name" class="field-label fontSemibold fontSize-14">Select Template</label>
          <DropDown v-model="selectedTemplate" :options="filterOptions" placeholder="Select " class="filter-dropdown" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="job-name" class="field-label fontSemibold fontSize-14">Unit Type</label>
          <DropDown v-model="selectedUnit" :options="unitTypeFilter()" :placeholder="UnitType.Imperial" class="filter-dropdown" />
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Form as VForm, Field } from 'vee-validate';
  import { IDropdownOptions } from './Globals/DropDown.vue';
  import { IJobType, IRecord, IRigTemplate } from '../../server/interfaces/datacollection.interfaces';
  import { Api } from '@/services/api.services';

  export enum UnitType {
    Imperial = 'Imperial',
    Metric = 'Metric',
  }

  export default defineComponent({
    name: 'CreateJobType',
    components: {
      CommonPopup,
      Field,
      VForm,
    },
    props: {
      jobTypeListProp: {
        type: Array as PropType<string[]>,
        require: true,
      },
    },
    emits: ['cancel', 'save'],
    data() {
      return {
        UnitType: UnitType,
        selectedTemplate: {} as IDropdownOptions,
        selectedUnit: {
          label: UnitType.Imperial,
          value: UnitType.Imperial,
        } as IDropdownOptions,
        records: [] as Partial<IRecord>,
        jobTypeDetails: {
          UnitType: UnitType.Imperial,
        } as IJobType,
        jobTypeList: [] as string[],
        recordsTemplate: [] as IRigTemplate[],
      };
    },
    computed: {
      filterOptions() {
        return this.recordsTemplate.map((item) => ({
          label: item.Name ?? '',
          value: item.Name ?? '',
        }));
      },
    },
    watch: {
      selectedTemplate: {
        handler(newVal) {
          if (newVal) {
            this.jobTypeDetails.Records = this.recordsTemplate.find((item) => item.Name === newVal)?.Records || [];
          }
        },
        deep: true,
      },
      selectedUnit: {
        handler(newval) {
          this.jobTypeDetails.UnitType = newval.value;
        },
      },
    },
    async created() {
      this.recordsTemplate = await Api.fetch('datacollection/recordstemplate');
    },
    mounted() {
      this.jobTypeList = this.jobTypeListProp || [];
    },
    methods: {
      unitTypeFilter() {
        return Object.keys(UnitType).map((key) => ({
          label: key,
          value: key,
        }));
      },
      onCancel() {
        this.$emit('cancel');
      },
      onSave() {
        this.$emit('save', this.jobTypeDetails);
      },
    },
  });
</script>

<style scoped>
  .popup-fields {
    gap: 1.2rem;
    padding: 1.5rem 1rem;
    height: 320px;
    width: 100%;
    color: var(--text-quinary);
  }
  .field {
    gap: 1rem;
  }
  .field-label {
    flex: 0 0 120px;
    text-align: left;
  }
  .field-input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }
  .filter-dropdown {
    min-height: 38px;
  }
</style>
