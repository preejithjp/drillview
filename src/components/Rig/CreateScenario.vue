<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="isEditMode ? 'Edit Scenario' : 'Create New Scenario'"
      primaryBtnText="Save"
      secondaryBtnText="Cancel"
      :wrapperStyle="{ width: '40%' }"
      @on-submit="handleSubmit(submitScenario)"
      @on-cancel="$emit('cancel')">
      <div class="popup-fields">
        <div class="field d-flex align-items-center">
          <label class="field-label fontBold fontSize-14 width-label">Scenario Name</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange }"
            v-model="localScenario.Name"
            name="ScenarioName"
            as="div"
            class="p-relative width-100 d-flex">
            <input
              v-bind="field"
              placeholder="Enter Scenario Name"
              type="text"
              class="fontNormal fontSize-14 flex-full"
              autocomplete="off"
              @input="handleChange" />
            <span v-if="errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>

        <div class="field d-flex align-items-center">
          <label class="field-label fontBold fontSize-14 width-label">Description</label>
          <textarea v-model="localScenario.Description" class="input-field flex-full" placeholder="Enter Description"></textarea>
        </div>

        <div class="field d-flex align-items-center">
          <label class="field-label fontBold fontSize-14 width-label">Upload Image</label>
          <div class="upload-wrapper d-flex align-items-center gap10">
            <div class="icon">
              <label>
                <SvgIcon name="upload-icon" class="svg-icon size30 secondary" />
                <span class="text-ellipsis fontSize-12">Upload</span>
                <input type="file" class="d-hidden" @change="handleFileUpload" />
              </label>
            </div>
            <img v-if="localScenario.Image" :src="localScenario.Image" class="preview-image" alt="Preview" />
          </div>
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { Field, Form as VForm } from 'vee-validate';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { Api } from '@/services/api.services';
  import { ToastType } from '@/components/ToastMessage.vue';
  import { store } from '@/main';
  import { IScenario } from '../../../server/interfaces/rigscheduler.interfaces';

  export default defineComponent({
    name: 'CreateScenario',
    components: { CommonPopup, Field, VForm },
    props: {
      scenario: {
        type: Object as PropType<IScenario | null>,
        default: () => ({ Name: '', Description: '', Image: '' }),
      },
      isEditMode: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['cancel', 'on-submit'],
    data() {
      return {
        localScenario: {
          Name: '',
          Description: '',
          Image: '',
        } as IScenario,
        uploadIconFile: null as FileList | null,
        supportedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/bmp', 'image/tiff', 'image/x-icon'],
        maxFileSize: 100 * 1024,
      };
    },
    watch: {
      scenario: {
        immediate: true,
        deep: true,
        handler(val: IScenario) {
          this.localScenario = {
            Name: val?.Name || '',
            Description: val?.Description || '',
            Image: val?.Image || '',
            ScenarioId: val?.ScenarioId,
          };
        },
      },
    },
    methods: {
      async submitScenario() {
        if (!this.localScenario.Name) {
          store.showToast(ToastType.ERROR, 'Scenario name is required.');
          return;
        }

        const url = this.isEditMode ? `scenarios/${this.localScenario.ScenarioId}` : 'scenarios';
        const method = this.isEditMode ? Api.patch : Api.submit;

        const response = await method(url, this.localScenario);

        if (!response?.error) {
          const msg = this.isEditMode ? 'Scenario updated successfully' : 'Scenario created successfully';
          store.showToast(ToastType.SUCCESS, msg);
          this.$emit('on-submit');
        } else {
          store.showToast(ToastType.ERROR, response.message || 'Operation failed');
        }
      },
      handleFileUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        this.uploadIconFile = target.files;
        if (this.uploadIconFile && this.uploadIconFile.length) {
          const file = this.uploadIconFile[0];
          if (!this.supportedFileTypes.includes(file.type)) {
            store.showToast(ToastType.ERROR, `File ${file.name} is not supported.`);
            return;
          }
          if (file.size > this.maxFileSize) {
            store.showToast(ToastType.ERROR, `File ${file.name} exceeds 100KB limit.`);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            this.localScenario.Image = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      },
    },
  });
</script>

<style scoped>
  .popup-fields {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .field-label.width-label {
    flex: 0 0 140px;
    color: var(--text-quinary);
  }

  .input-field {
    flex: 1;
    padding: 8px;
    font-size: 14px;
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
    background-color: var(--bg-septenary);
    color: var(--text-tertiary);
  }

  .upload-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    min-width: 60px;
    height: 60px;
    text-align: center;
  }

  .icon label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .icon .svg-icon {
    margin-bottom: 4px;
  }

  .icon span {
    line-height: 1;
    margin-top: 2px;
  }

  .preview-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
  }

  .mt10 {
    margin-top: 10px;
  }
</style>
