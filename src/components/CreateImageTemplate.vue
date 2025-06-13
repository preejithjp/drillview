<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="popupTitle"
      primaryBtnText="Save"
      secondaryBtnText="Cancel"
      :wrapperStyle="{ width: '50%' }"
      @on-submit="handleSubmit(saveTemplate)"
      @on-cancel="$emit('cancel')">
      <div class="popup-fields">
        <div class="field">
          <label class="field-label fontBold fontSize-14">Template Name</label>
          <Field
            v-slot="{ field, errors, errorMessage, handleChange }"
            v-model="template.TemplateName"
            name="Template Name"
            :rules="templateNameRules"
            as="div"
            class="p-relative width-100 d-flex">
            <input
              type="text"
              v-bind="field"
              placeholder="Enter Template Name"
              class="fontNormal fontSize-14 flex-full"
              autocomplete="off"
              @input="handleChange" />
            <span v-if="errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Field, Form as VForm } from 'vee-validate';
  import { IImageTemplate } from 'server/interfaces/imagetemplate.interfaces';
  import { ImagePopupList } from './ImageTemplateList.vue';

  export default defineComponent({
    name: 'CreateImageTemplate',
    components: { CommonPopup, Field, VForm },
    props: {
      templateData: {
        type: Object as PropType<IImageTemplate>,
        required: true,
      },
      templateList: {
        type: Array as () => IImageTemplate[],
        required: false,
        default: () => [],
      },
      mode: {
        type: String,
        required: true,
      },
    },
    emits: ['cancel', 'save'],
    data() {
      return {
        popupTitle: this.mode,
        template: {
          TemplateId: this.templateData.TemplateId ?? '',
          TemplateName: this.templateData.TemplateName,
          Entries: this.templateData.Entries ?? [{ RangeMin: 0, RangeMax: 0, ImageUrl: '' }],
        },
      };
    },
    computed: {
      templateNameRules() {
        const otherNames = this.templateList
          .map((d) => d.TemplateName?.trim().toLowerCase())
          .filter((name) => name !== this.templateData.TemplateName.trim().toLowerCase());
        if (this.mode === ImagePopupList.EditImageTemplate) {
          return {
            required: true,
            existIn: otherNames,
          };
        } else {
          return {
            required: true,
            existIn: this.templateList.map((d) => d.TemplateName?.trim().toLowerCase()),
          };
        }
      },
    },
    methods: {
      async saveTemplate() {
        this.$emit('save', this.template);
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

  .field-label {
    flex: 0 0 140px;
    color: var(--text-tertiary);
  }
</style>
