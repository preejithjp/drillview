<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="isEditMode ? 'Edit Rig' : 'Create Rig'"
      primaryBtnText="Save"
      secondaryBtnText="Cancel"
      :wrapperStyle="{ width: '40%' }"
      @on-submit="handleSubmit(onSubmit)"
      @on-cancel="onCancel">
      <div class="createrigpopup-container d-flex flex-col gap20 fontSize-12">
        <div class="d-flex flex-col gap20">
          <!-- Rig Name -->
          <div class="inputgroup d-flex align-items-center gap10">
            <label for="rigName" class="fontSemibold text-static-tertiary flex-basis-25">Rig Name</label>
            <Field
              v-slot="{ field, errors, errorMessage, handleChange }"
              v-model="form.RigName"
              as="div"
              type="text"
              name="RigName"
              rules="required"
              class="p-relative d-flex flex-full">
              <input
                v-bind="field"
                id="rigName"
                placeholder="Rig Name"
                type="text"
                class="inputbox secondary fontNormal text-tertiary"
                autocomplete="off"
                @input="handleChange" />
              <span v-if="errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
            </Field>
          </div>

          <!-- Contract Start -->
          <div class="inputgroup d-flex align-items-center gap10">
            <label for="contractStartDate" class="fontSemibold text-static-tertiary flex-basis-25">Contract Start</label>
            <Field v-slot="{ field, errors, meta, errorMessage }" as="div" name="ContractStart" rules="required" class="p-relative d-flex flex-full">
              <DatePicker v-bind="field" id="contractStartDate" v-model="form.ContractStart" class="inputbox" :type="DatePickerFormat.DATE" />
              <span v-if="meta.touched && errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
            </Field>
          </div>

          <!-- Contract End -->
          <div class="inputgroup d-flex align-items-center gap10">
            <label for="contractEndDate" class="fontSemibold text-static-tertiary flex-basis-25">Contract End</label>
            <Field
              v-slot="{ field, errors, meta, errorMessage }"
              as="div"
              name="ContractEnd"
              :rules="{ required: true, min_value: form.ContractStart }"
              class="p-relative d-flex flex-full">
              <DatePicker v-bind="field" id="contractEndDate" v-model="form.ContractEnd" class="inputbox" :type="DatePickerFormat.DATE" />
              <span v-if="meta.touched && errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
            </Field>
          </div>

          <!-- Description -->
          <div class="inputgroup d-flex align-items-center gap10">
            <label for="description" class="fontSemibold text-static-tertiary flex-basis-25">Description</label>
            <input
              id="description"
              v-model="form.Description"
              type="text"
              class="inputbox secondary text-tertiary fontNormal"
              placeholder="Description" />
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
  import { IRigSchema } from '../../../server/interfaces/rigschema.interfaces';
  import { store } from '@/main';
  import { ToastType } from '@/components/ToastMessage.vue';
  import { Form as VForm, Field } from 'vee-validate';
  import DatePicker, { DatePickerFormat } from '../../components/Globals/DatePicker.vue';

  export default defineComponent({
    name: 'CreateRig',
    components: {
      CommonPopup,
      Field,
      VForm,
      DatePicker,
    },
    props: {
      rigData: {
        type: Object as PropType<IRigSchema>,
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
        DatePickerFormat,
        form: {
          RigName: '',
          ContractStart: null,
          ContractEnd: null,
          Description: '',
        } as Partial<IRigSchema>,
      };
    },
    watch: {
      rigData: {
        immediate: true,
        handler(val: IRigSchema | undefined) {
          if (val) {
            this.form = {
              RigName: val.RigName,
              ContractStart: val.ContractStart,
              ContractEnd: val.ContractEnd,
              Description: val.Description,
            };
          }
        },
      },
    },
    methods: {
      onCancel() {
        this.$emit('on-cancel');
      },
      async onSubmit() {
        const payload = {
          rawContent: {
            name: this.form.RigName || '',
            description: this.form.Description || '',
            contractStartDate: this.form.ContractStart ?? null,
            contractEndDate: this.form.ContractEnd ?? null,
            wellbores: [],
            supplierCode: '',
            supplierName: '',
            mainType: '',
            subType: '',
            waterDepthMin: null,
            waterDepthMax: null,
          },
        };

        const url = this.isEditMode && this.rigData?.RigId ? `rigs/${this.rigData.RigId}` : 'rigs';
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
  .createrigpopup-container {
    margin-bottom: 25px;
  }

  .inputgroup label {
    flex-basis: 25%;
    min-width: 100px;
  }

  .inputbox {
    flex: 1;
    padding: 6px 10px;
    border-radius: 4px;
    background-color: var(--bg-form-input);
    box-sizing: border-box;
    outline: none;
    height: 35px;
  }

  .inputbox.large {
    height: 60px;
  }
</style>
