<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="'Add New Records'"
      primaryBtnText="Add"
      secondaryBtnText="Cancel"
      @on-submit="handleSubmit(onSave)"
      @on-cancel="onCancel">
      <div class="popup-fields d-flex flex-col">
        <div class="field d-flex align-items-center">
          <label for="job-title" class="field-label fontSemibold fontSize-14">Name</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Name"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="job-title"
              v-model="records.Name"
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
          <label for="job-title" class="field-label fontSemibold fontSize-14">Record Id</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Record Id"
            :rules="{ required: true, not_one_of: recordIds, min_value: 1 }"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="job-title"
              v-model="records.RecordId"
              type="number"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Record Id"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="target-name" class="field-label fontSemibold fontSize-14">Target Name</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Target Name"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="target-name"
              v-model="records.TargetName"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Target Name"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
          <label for="target-name" class="field-label fontSemibold fontSize-14">Description</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Description"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="target-name"
              v-model="records.Description"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Description"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="operator-name" class="field-label fontSemibold fontSize-14">Time Log Uid</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Time Log Uid"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="operator-name"
              v-model="records.TimeLogUid"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Time Log Uid"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
          <label for="service-provider" class="field-label fontSemibold fontSize-14">Depth Log Uid</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Depth Log Uid"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="service-provider"
              v-model="records.DepthLogUid"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Depth Log Uid"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="time-based" class="field-label fontSemibold fontSize-14">Time</label>
          <input v-model="records.TimeBased" type="checkbox" :true-value="true" :false-value="false" class="custom-checkbox" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="depth-based" class="field-label fontSemibold fontSize-14">Depth</label>
          <input v-model="records.DepthBased" type="checkbox" :true-value="true" :false-value="false" class="custom-checkbox" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="depth-based" class="field-label fontSemibold fontSize-14">Depth Increasing</label>
          <input v-model="records.DepthIncreasing" type="checkbox" :true-value="true" :false-value="false" class="custom-checkbox" />
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IRecord } from '../../server/interfaces/datacollection.interfaces';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Form as VForm, Field } from 'vee-validate';

  export default defineComponent({
    name: 'CreateRecords',
    components: { CommonPopup, Field, VForm },
    props: {
      recordsDetails: {
        type: Array as PropType<IRecord[]>,
        required: true,
        default: () => [],
      },
    },
    emits: ['save', 'cancel'],
    data() {
      return {
        records: {
          TimeBased: false,
          DepthBased: false,
          DepthIncreasing: false,
        } as IRecord,
        recordIds: [] as number[],
        jobTypes: [] as string[],
      };
    },
    watch: {
      recordsDetails: {
        handler(newRecords: IRecord[]) {
          this.recordIds = newRecords?.map((record) => record?.RecordId);
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onCancel() {
        this.$emit('cancel');
      },
      onSave() {
        this.$emit('save', this.records);
      },
    },
  });
</script>
<style scoped>
  .popup-fields {
    gap: 1.2rem;
    padding: 1.5rem 1rem;
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
  .field-select {
    flex: 1;
    padding: 0.6rem;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    box-sizing: border-box;
    background-color: var(--bg-form-input);
  }
  .custom-checkbox {
    transform: scale(1.4);
  }
</style>
