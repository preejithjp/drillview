<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup :popupTitle="'Add New Rig'" primaryBtnText="Save" secondaryBtnText="Cancel" @on-submit="handleSubmit(onSave)" @on-cancel="onCancel">
      <div class="popup-fields d-flex height-100 width-100">
        <div class="field d-flex align-items-center">
          <label for="job-title" class="field-label fontSemibold fontSize-14">Job Title</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Job Title"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="job-title"
              v-model="rigs.Name"
              autocomplete="off"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Job Title"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="rig-status" class="field-label fontSemibold fontSize-14">Status</label>
          <DropDown v-model="selectedStatus" :options="filterOptions()" :placeholder="Status.Active" class="filter-dropdown" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="operator-name" class="field-label fontSemibold fontSize-14">Operator Name</label>
          <input
            id="operator-name"
            v-model="rigs.Well.Operator"
            type="text"
            autocomplete="off"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter the Operator Name" />
          <label for="service-provider" class="field-label fontSemibold fontSize-14">Service Provider</label>
          <input
            id="service-provider"
            v-model="rigs.Well.ServiceCompany"
            type="text"
            autocomplete="off"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter the Service Provider" />
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { IRig } from '../../server/interfaces/datacollection.interfaces';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Form as VForm, Field } from 'vee-validate';
  import { Api } from '../services/api.services';
  import { IDropdownOptions } from './Globals/DropDown.vue';
  import { Status } from '../components/DataCollectionRigdetails.vue';

  export default defineComponent({
    name: 'AddnewRig',
    components: { CommonPopup, Field, VForm },
    emits: ['save', 'cancel'],
    data() {
      return {
        Status: Status,
        rigs: {
          Well: {
            Operator: '',
            ServiceCompany: '',
          },
          Wellbore: {
            Name: '',
            Uid: '',
          },
        } as IRig,
        selectedStatus: {
          label: Status.Active,
          value: Status.Active,
        } as IDropdownOptions,
      };
    },
    mounted() {},
    methods: {
      filterOptions() {
        return Object.keys(Status).map((key) => ({
          label: key,
          value: key,
        }));
      },
      onCancel() {
        this.$emit('cancel');
      },
      async onSave() {
        this.rigs.Status = this.selectedStatus.value === Status.Active ? true : false;
        const response = await Api.submit('datacollection', this.rigs);
        if (response) {
          this.$emit('save');
        }
        this.$emit('cancel');
      },
    },
  });
</script>
<style scoped>
  .popup-fields {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem 1rem;
    color: var(--text-quinary);
  }
  .field {
    gap: 1rem;
  }
  .field-label {
    flex: 0 0 155px;
    text-align: left;
  }
  .field-input {
    flex: 1;
    padding: 0.6rem;
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--bg-septenary);
  }
  .field-select {
    flex: 1;
    padding: 0.6rem;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    box-sizing: border-box;
    background-color: var(--bg-form-input);
  }
  .jobtype-container {
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
  .datepicker-wrapper {
    flex: 1;
    padding: 0.2rem;
    position: relative;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    box-sizing: border-box;
    background-color: var(--bg-form-input);
  }
  .filter-dropdown {
    border: 1px solid var(--border-tertiary);
    height: 38px !important;
  }
</style>
