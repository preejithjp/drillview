<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup :popupTitle="'Edit Rig'" primaryBtnText="Save" secondaryBtnText="Cancel" @on-submit="handleSubmit(onSave)" @on-cancel="onCancel">
      <div class="popup-fields d-flex height-100 width-100">
        <div class="field d-flex align-items-center">
          <label for="name" class="field-label fontBold fontSize-14">Job Title</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange, meta }"
            v-model="rigData.Name"
            as="div"
            type="text"
            name="Job Title"
            rules="required"
            class="p-relative flex-full">
            <input
              v-bind="field"
              id="name"
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
          <label for="operator-name" class="field-label fontBold fontSize-14">Operator Name</label>
          <input
            id="operator-name"
            v-model="rigData.Well.Operator"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter the Operator Name" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="service-provider" class="field-label fontBold fontSize-14">Service Provider</label>
          <input
            id="service-provider"
            v-model="rigData.Well.ServiceCompany"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter the Name" />
        </div>
        <div class="field d-flex align-items-center">
          <label for="target-name" class="field-label fontBold fontSize-14">Target Machine Name</label>
          <input id="target-name" type="text" class="field-input fontNormal fontSize-14" placeholder="Enter the Service Provider" />
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IRig } from '../../server/interfaces/datacollection.interfaces';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Form as VForm, Field } from 'vee-validate';

  export default defineComponent({
    name: 'RigEditor',
    components: { CommonPopup, Field, VForm },
    props: {
      dataToEdit: {
        type: Object as PropType<IRig>,
        default: null,
      },
    },
    emits: ['save', 'cancel'],
    data() {
      return {
        rigData: {} as IRig,
      };
    },
    created() {
      this.rigData = this.dataToEdit ? JSON.parse(JSON.stringify(this.dataToEdit)) : {};
    },
    methods: {
      onCancel() {
        this.$emit('cancel');
      },
      onSave() {
        this.$emit('save', this.rigData);
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
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }
</style>
