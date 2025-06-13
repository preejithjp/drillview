<template>
  <div class="imagetemplate-container d-flex flex-col flex-full fontSize-16 height-100">
    <div class="imagetemplate-header-wrapper d-flex g10 align-items-center">
      <div class="d-flex flex-full gap10">
        <div class="d-flex flex-row flex-full text-ellipsis gap10 align-items-center">
          <p>
            <span class="text-tertiary text-ellipsis capitalize fontSemibold fontSize-13">
              {{ template?.TemplateName }}
            </span>
          </p>
        </div>
      </div>

      <CustomButton class="d-flex gap10 justify-content-end searchfield" :disabled="editingIndex !== -1" @click="addEntry">+ Add Entry</CustomButton>
    </div>
    <div class="imagetemplate-body-wrapper d-flex flex-full scroll-auto">
      <LoadingIcon v-if="isLoading" />
      <div class="scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th class="align-items-center justify-content-center">Image</th>
              <th>Range Min</th>
              <th>Range Max</th>

              <th></th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-for="(entry, index) in template.Entries" :key="index">
              <td>
                <GroupAvatar
                  class="group-avatar"
                  :name="(template.TemplateName as string) + '#$#' + template.TemplateName"
                  :image="entry.ImageUrl"
                  :isEditable="editingIndex === index"
                  @on-icon-upload="(avatarIcon) => onGroupIconUpload(avatarIcon, index)"
                  @click="editingIndex !== index && showFullImage(entry.ImageUrl!)"></GroupAvatar>
              </td>
              <td class="align-items-center">
                <input v-if="editingIndex === index" v-model.number="entry.RangeMin" type="number" class="input-field" />
                <span v-else>{{ entry.RangeMin }}</span>
              </td>
              <td class="align-items-center">
                <input v-if="editingIndex === index" v-model.number="entry.RangeMax" type="number" class="input-field" />
                <span v-else>{{ entry.RangeMax }}</span>
              </td>

              <td class="icon-wrapper">
                <div class="d-flex gap20">
                  <template v-if="editingIndex === index">
                    <SvgIcon name="save-icon" class="svg-icon size16 secondary" @click="saveEntry()" />
                  </template>
                  <template v-else>
                    <SvgIcon name="edit-icon" class="svg-icon size16 secondary" style="cursor: pointer" @click="editingIndex = index" />
                  </template>
                  <SvgIcon name="delete-icon" class="svg-icon size16 secondary" @click="confirmDeleteEntry(index)" />
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && template && Object.keys(template).length === 0">
              <td colspan="7" class="text-center">Templates not found!</td>
            </tr>
          </tbody>
        </table>
        <div v-if="showImageModal" class="modal-overlay d-flex flex-col p-fixed full-size align-center" @click="showImageModal = false">
          <div class="modal-content" @click.stop>
            <img :src="selectedImageUrl" class="full-size-image" />
            <SvgIcon name="close-icon" class="svg-icon size16 secondary justify-content-end" @click="showImageModal = false" />
          </div>
        </div>
      </div>
    </div>
    <ConfirmationPopup v-if="showDeleteConfirmation" :show="showDeleteConfirmation" @on-cancel="closePopup" @on-submit="deleteTemplate" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import GroupAvatar from '@/components/Chat/GroupAvatar.vue';

  import { IImageTemplate } from 'server/interfaces/imagetemplate.interfaces';
  import { Api } from '@/services/api.services';
  export default defineComponent({
    name: 'ImageTemplateDetails',
    components: {
      ConfirmationPopup,
      GroupAvatar,
    },
    props: {
      templateData: {
        type: Object as PropType<IImageTemplate>,
        required: true,
      },
    },
    data() {
      return {
        template: {} as IImageTemplate,
        showImageModal: false,
        selectedImageUrl: '',
        templateList: [] as IImageTemplate[],
        showDeleteConfirmation: false,
        deleteId: '',
        isLoading: false as boolean,
        editingIndex: -1,
        deleteEntryIndex: -1,
      };
    },
    watch: {
      templateData() {
        this.fetchImageTemplate();
      },
    },
    mounted() {
      this.fetchImageTemplate();
    },
    methods: {
      onGroupIconUpload(avatarIcon: string, index: number) {
        this.template.Entries[index].ImageUrl = avatarIcon;
      },
      async deleteTemplate() {
        const index = this.deleteEntryIndex;
        if (index === -1) return;
        this.template.Entries.splice(index, 1);
        if (this.template.TemplateId) {
          await Api.patch(`imagetemplates/${this.template.TemplateId}`, this.template);
        }
        this.showDeleteConfirmation = false;
      },
      closePopup() {
        this.showDeleteConfirmation = false;
        this.deleteEntryIndex = -1;
      },
      confirmDeleteEntry(index: number) {
        this.deleteEntryIndex = index;
        this.showDeleteConfirmation = true;
      },
      async saveEntry() {
        if (this.template.TemplateId) {
          await Api.patch(`imagetemplates/${this.template.TemplateId}`, this.template);
        }
        this.editingIndex = -1;
      },
      addEntry() {
        this.template.Entries.push({ RangeMin: 0, RangeMax: 0, ImageUrl: '' });
        this.editingIndex = this.template.Entries.length - 1;
      },
      showFullImage(url: string) {
        this.selectedImageUrl = url;
        this.showImageModal = true;
      },
      async fetchImageTemplate() {
        this.template = this.templateData;
      },
    },
  });
</script>

<style scoped>
  .imagetemplate-container {
    overflow: auto;
  }

  .imagetemplate-header-wrapper {
    padding: 10px;
    height: 60px;
  }

  .imagetemplate-header-wrapper .inputbox {
    background-color: var(--bg-septenary);
    padding-left: 20px;
  }

  .group-avatar {
    height: 30px;
    width: 30px;
  }

  .search-box {
    min-width: 165px;
    max-width: 250px;
  }
  .searchfield {
    height: 32px;
  }
  .modal-overlay {
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
  }
  .modal-content {
    background: var(--white);
    padding: 20px;
    border-radius: 10px;
  }
  .full-size-image {
    max-width: 90vw;
    max-height: 80vh;
  }
  .preview-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
  }
  .icon-wrapper {
    width: 50px;
  }
</style>
