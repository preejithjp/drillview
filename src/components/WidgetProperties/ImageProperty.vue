<template>
  <div class="image-property-wrapper d-flex flex-col">
    <div class="field">
      <label class="input-label fontSize-12">Select Template</label>
      <select v-model="selectedTemplateId" class="input-box mb10" @change="onTemplateChange">
        <option disabled value="">Select Template</option>
        <option v-for="template in allTemplates" :key="template.TemplateId?.toString()" :value="template.TemplateId?.toString()">
          {{ template.TemplateName }}
        </option>
      </select>
    </div>

    <div v-if="selectedTemplate" class="image-template-entries">
      <div v-for="(entry, index) in selectedTemplate.Entries" :key="index" class="image-entry d-flex flex-row gap20 align-items-center">
        <div class="align-items-center d-flex flex-col gap10 flex-full">
          <label class="input-label fontSize-12">Range Min</label>
          <input v-model.number="entry.RangeMin" type="number" class="input-box" @blur="emitImageChange" />
        </div>
        <div class="align-items-center d-flex flex-col gap10 flex-full">
          <label class="input-label fontSize-12">Range Max</label>
          <input v-model.number="entry.RangeMax" type="number" class="input-box" @blur="emitImageChange" />
        </div>
        <div class="align-items-center d-flex flex-col gap10 flex-full">
          <label class="input-label fontSize-12">Image</label>
          <div class="preview-container position-relative" @click="openFilePicker(index)">
            <img :src="entry.ImageUrl" class="preview-image" alt="Image Preview" />
            <span class="avatar-overlay">
              <SvgIcon name="edit-icon" class="svg-icon size16" />
            </span>
            <input ref="fileInputs" type="file" class="d-none" accept="image/*" @change="(e) => onFileChange(e, index)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IImageTemplate } from '../../../server/interfaces/imagetemplate.interfaces';
  import { Api } from '@/services/api.services';
  import { store } from '@/main';
  import { ToastType } from '../ToastMessage.vue';

  export default defineComponent({
    name: 'ImageProperty',
    props: {
      modelValue: {
        type: Object as PropType<IImageTemplate>,
        required: true,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        allTemplates: [] as IImageTemplate[],
        selectedTemplateId: '',
        selectedTemplate: null as IImageTemplate | null,
        supportedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
        maxFileSize: 500 * 1024, // 500KB
      };
    },
    watch: {
      modelValue: {
        handler(newVal) {
          if (newVal?.TemplateId) {
            this.selectedTemplateId = newVal.TemplateId.toString();
            this.selectedTemplate = JSON.parse(JSON.stringify(newVal));
          }
        },
        immediate: true,
        deep: true,
      },
    },
    mounted() {
      this.fetchAllTemplates();
    },
    methods: {
      async fetchAllTemplates() {
        const response = await Api.fetch('imagetemplates');
        this.allTemplates = response;
        if (!this.modelValue?.TemplateId && this.allTemplates.length > 0) {
          const firstTemplate = this.allTemplates[0];
          this.selectedTemplateId = firstTemplate.TemplateId?.toString() ?? '';
          this.selectedTemplate = JSON.parse(JSON.stringify(firstTemplate));
          this.emitImageChange();
        }
      },
      onTemplateChange() {
        const template = this.allTemplates.find((t) => t.TemplateId?.toString() === this.selectedTemplateId);
        if (template) {
          this.selectedTemplate = JSON.parse(JSON.stringify(template));
          this.emitImageChange();
        }
      },
      emitImageChange() {
        if (this.selectedTemplate) {
          this.$emit('update:modelValue', { ...this.selectedTemplate });
        }
      },
      openFilePicker(index: number) {
        const inputRefs = this.$refs.fileInputs as HTMLInputElement[];
        const input = inputRefs?.[index];
        if (input) {
          input.click();
        } else {
          store.showToast(ToastType.ERROR, `No input files found`);
        }
      },
      async onFileChange(event: Event, index: number) {
        const target = event.target as HTMLInputElement;
        const file = target?.files?.[0];
        if (!file) return;
        if (!this.supportedFileTypes.includes(file.type)) {
          const types = this.supportedFileTypes.map((t) => t.split('/')[1]).join(', ');
          store.showToast(ToastType.ERROR, `Unsupported file type. Please use: ${types}`);
          target.value = '';
          return;
        }
        if (file.size > this.maxFileSize) {
          store.showToast(ToastType.ERROR, `File exceeds max size of ${this.maxFileSize / 1024}KB.`);
          target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          if (this.selectedTemplate && this.selectedTemplate.Entries[index]) {
            this.selectedTemplate.Entries[index].ImageUrl = base64;
            this.emitImageChange();
          }
        };
        reader.onerror = () => {
          store.showToast(ToastType.ERROR, 'Error reading file.');
          target.value = '';
        };
        reader.readAsDataURL(file);
      },
    },
  });
</script>

<style scoped>
  .image-property-wrapper {
    gap: 1.5rem;
  }

  .image-entry {
    margin-bottom: 20px;
  }

  .input-label {
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .input-box {
    width: 100%;
    height: 30px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    padding: 4px 8px;
    background-color: var(--bg-form-input);
  }

  .preview-container {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .avatar-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    padding: 4px;
    font-size: 16px;
    pointer-events: none;
  }

  .preview-container:hover .avatar-overlay {
    opacity: 1;
  }

  .d-none {
    display: none;
  }
</style>
