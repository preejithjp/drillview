<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup :popupTitle="'Add New Item'" primaryBtnText="Add" secondaryBtnText="Cancel" @on-submit="handleSubmit(onSave)" @on-cancel="onCancel">
      <div class="popup-fields d-flex flex-col">
        <div class="field d-flex align-items-center">
          <label for="description" class="field-label fontSemibold fontSize-14">Description</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Description"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="description"
              v-model="recordItem.Description"
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
          <label for="description" class="field-label fontSemibold fontSize-14">Item Id</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Item Id"
            :rules="{ required: true, not_one_of: itemsId, min_value: 1 }"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="description"
              v-model="recordItem.ItemId"
              type="number"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Item Id"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="longMnemonic" class="field-label fontSemibold fontSize-14">Long Mnemonic</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Long Mnemonic"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="longMnemonic"
              v-model="recordItem.LongMnemonic"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Long Mnemonic"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
          <label for="shortMnemonic" class="field-label fontSemibold fontSize-14">Short Mnemonic</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Short Mnemonic"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="shortMnemonic"
              v-model="recordItem.ShortMnemonic"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Short Mnemonic"
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
              v-model="recordItem.TargetName"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Target Name"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
          <label for="targetUid" class="field-label fontSemibold fontSize-14">Target Uid</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Target Uid"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="targetUid"
              v-model="recordItem.Uuid"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Target Uid"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field d-flex align-items-center">
          <label for="type" class="field-label fontSemibold fontSize-14">Type</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Type"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="type"
              v-model="recordItem.Type"
              type="text"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Type"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
          <label for="length" class="field-label fontSemibold fontSize-14">Length</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            as="div"
            type="text"
            name="Length"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="length"
              v-model="recordItem.Length"
              type="number"
              :aria-invalid="!meta.valid && meta.touched"
              autocomplete="off"
              class="field-input fontNormal fontSize-14"
              placeholder="Enter the Length"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Form as VForm, Field } from 'vee-validate';
  import { IRecordItem } from '../../server/interfaces/datacollection.interfaces';

  export default defineComponent({
    name: 'CreateRecordItem',
    components: { CommonPopup, Field, VForm },
    props: {
      itemsList: {
        type: Array as PropType<IRecordItem[]>,
        required: true,
        default: () => [],
      },
    },
    emits: ['save', 'cancel'],
    data() {
      return {
        recordItem: {} as IRecordItem,
        itemsId: [] as number[],
      };
    },
    watch: {
      itemsList: {
        handler(newRecords: IRecordItem[]) {
          this.itemsId = newRecords.map((item) => item.ItemId);
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
        this.$emit('save', this.recordItem);
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
    flex: 0 0 155px;
    text-align: left;
  }
  .field-input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }
</style>
