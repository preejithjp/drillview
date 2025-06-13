<template>
  <div class="d-flex flex-row flex-full">
    <div v-resizable class="chat-left-wrapper">
      <ImageTemplateList @template-data="onchatGroupSelected" />
    </div>
    <div class="d-flex flex-full">
      <ImageTemplateDetails :templateData="selectedTemplate" />
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import ImageTemplateList from '../components/ImageTemplateList.vue';
  import ImageTemplateDetails from '../components/ImageTemplateDetails.vue';
  import { IImageTemplate } from 'server/interfaces/imagetemplate.interfaces';

  export default defineComponent({
    name: 'ManageImageTemplatePage',
    components: { ImageTemplateList, ImageTemplateDetails },
    data() {
      return {
        selectedTemplate: {} as IImageTemplate,
      };
    },
    methods: {
      onchatGroupSelected(imageTemplate: IImageTemplate) {
        this.selectedTemplate = imageTemplate;
      },
    },
  });
</script>
<style scoped>
  .chat-left-wrapper {
    width: 22%;
    background: var(--bg-septenary);
  }
</style>
