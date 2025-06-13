<template>
  <div class="imgtemplate-list-wrapper">
    <LoadingIcon v-if="loading" />
    <div class="search-bar d-flex align-items-center">
      <SvgIcon name="plus-icon" class="svg-icon size30 border secondary" @click="openCreate" />
      <SearchInput v-model="searchQuery" placeholder="Search" class="filtersearchbar" />
    </div>

    <div class="imgtemplate-list-view flex-full">
      <div
        v-for="item in filteredTemplates"
        :key="item.TemplateId as string"
        :class="['imgtemplate-item', { selected: selectedTemplate && selectedTemplate.TemplateId === item.TemplateId }]"
        @click="selectedImageTemplate(item)">
        <div class="imgtemplate-content flex-full">
          <div class="fontSemibold fontSize-12">{{ item.TemplateName }}</div>
        </div>

        <SvgIcon name="edit-icon" class="controls svg-icon size14" @click.stop="editTemplate(item)" />
        <SvgIcon name="delete-icon" class="controls svg-icon size14" @click.stop="confirmDelete(item.TemplateId as string)" />
        <div v-if="filteredTemplates.length === 0" class="no-data fontSize-16">No imgtemplates available.</div>
      </div>
    </div>
    <ConfirmationPopup
      v-if="activePopup === ImagePopupList.DeleteImageTemplate"
      :show="activePopup === ImagePopupList.DeleteImageTemplate"
      @on-cancel="closePopup"
      @on-submit="deleteTemplate" />

    <CreateImageTemplate
      v-if="activePopup === ImagePopupList.CreateImageTemplate || activePopup === ImagePopupList.EditImageTemplate"
      :templateData="selectedTemplate"
      :templateList="templates"
      :mode="activePopup"
      @cancel="closePopup"
      @save="handleSave" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import SvgIcon from './Globals/SvgIcon.vue';
  import LoadingIcon from './Globals/LoadingIcon.vue';
  import ConfirmationPopup from './Common/ConfirmationPopup.vue';
  import CreateImageTemplate from './CreateImageTemplate.vue';
  import { Api } from '@/services/api.services';
  import { IImageTemplate } from '../../server/interfaces/imagetemplate.interfaces';

  export enum ImagePopupList {
    None = 'None',
    CreateImageTemplate = 'Create Image Template',
    EditImageTemplate = 'Edit Image Template',
    DeleteImageTemplate = 'Delete Image Template',
  }

  export default defineComponent({
    name: 'ImageTemplateList',
    components: {
      SvgIcon,
      LoadingIcon,
      ConfirmationPopup,
      CreateImageTemplate,
    },
    emits: ['templateData'],
    data() {
      return {
        templates: [] as IImageTemplate[],
        loading: false,
        activePopup: ImagePopupList.None as ImagePopupList,
        selectedTemplate: {} as IImageTemplate,
        deleteId: '' as string,
        ImagePopupList: ImagePopupList,
        searchQuery: '' as string,
      };
    },
    computed: {
      filteredTemplates() {
        return this.templates.filter((imgtemplate) => imgtemplate.TemplateName.toLowerCase().includes(this.searchQuery.toLowerCase()));
      },
    },
    mounted() {
      this.fetchTemplates();
    },
    methods: {
      async fetchTemplates() {
        this.loading = true;
        const response = await Api.fetch('imagetemplates');
        this.templates = response;
        this.loading = false;
        if (this.templates.length > 0) {
          this.selectedTemplate = this.templates[0];
          this.$emit('templateData', this.selectedTemplate);
        }
      },
      openCreate() {
        this.selectedTemplate = {
          TemplateName: '',
          Entries: [{ RangeMin: 0, RangeMax: 0, ImageUrl: '' }],
        };
        this.activePopup = this.ImagePopupList.CreateImageTemplate;
      },

      editTemplate(item: IImageTemplate) {
        this.selectedTemplate = { ...item, TemplateId: item.TemplateId?.toString?.() ?? '' };
        this.activePopup = this.ImagePopupList.EditImageTemplate;
      },
      confirmDelete(id: string) {
        this.deleteId = id;
        this.activePopup = this.ImagePopupList.DeleteImageTemplate;
      },
      async deleteTemplate() {
        await Api.delete('imagetemplates', this.deleteId);
        this.templates = this.templates.filter((template) => template.TemplateId !== this.deleteId);
        this.closePopup();
      },
      async handleSave(template: IImageTemplate) {
        if (template.TemplateId) {
          await Api.patch(`imagetemplates/${template.TemplateId}`, template);
        } else {
          await Api.submit('imagetemplates', template);
        }
        this.fetchTemplates();
        this.closePopup();
      },

      closePopup() {
        this.activePopup = this.ImagePopupList.None;
        this.selectedTemplate = {
          TemplateName: '',
          Entries: [{ RangeMin: 0, RangeMax: 0, ImageUrl: '' }],
        };
        this.deleteId = '';
      },
      selectedImageTemplate(item: IImageTemplate) {
        this.selectedTemplate = { ...item, TemplateId: item.TemplateId?.toString?.() ?? '' };
        this.$emit('templateData', this.selectedTemplate);
      },
    },
  });
</script>

<style scoped>
  .imgtemplate-list-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .search-bar {
    padding: 1rem;
    border-right: 5px solid var(--scroll-track-color);
    z-index: 1;
    flex-shrink: 0;
    gap: 8px;
  }
  .search-bar .filtersearchbar {
    height: 34px;
  }
  .imgtemplate-list-view {
    overflow-y: scroll;
  }
  .imgtemplate-item {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid var(--border-primary);
    gap: 10px;
    color: var(--text-tertiary);
  }

  .imgtemplate-item:first-child {
    border-top: 1px solid var(--border-primary);
  }

  .imgtemplate-item.selected {
    background-color: var(--hover-secondary);
  }

  .imgtemplate-content p {
    color: var(--text-senary);
  }

  .imgtemplate-list-view svg {
    color: var(--icon-secondary);
  }

  .no-data {
    text-align: center;
    color: var(--secondary-text);
    padding: 10px;
  }
  .imgtemplate-list-view .controls {
    transition: all 0.3s;
    opacity: 0;
  }

  .imgtemplate-list-view :hover .controls {
    opacity: 1;
  }
</style>
