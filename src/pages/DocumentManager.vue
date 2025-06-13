<template>
  <div class="d-flex flex-row p10 m5 fontNormal">
    <DocumentList :productsData="productsData" :loading="loading" @node-selection="selectedNode" @delete-node="handleDeleteClick"></DocumentList>
    <DocumentDetails :headerName="headerName" :detailedData="selectedNodeDetails" />
    <ConfirmationPopup v-if="askConfirmation" :show="askConfirmation" @on-cancel="handleDeleteClose" @on-submit="removeProduct" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import DocumentList from '../components/DocumentList.vue';
  import DocumentDetails from '../components/DocumentDetails.vue';
  import { Api } from '@/services/api.services';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import { NodeDetails, Product } from '../../server/interfaces/documentmanager.interface';

  export default defineComponent({
    name: 'DocumentManager',
    components: {
      DocumentList,
      DocumentDetails,
      ConfirmationPopup,
    },
    data() {
      return {
        loading: false,
        productsData: [] as Product[],
        searchInput: '',
        askConfirmation: false,
        deleteParentURL: '',
        headerName: '',
        selectedNodeDetails: {} as NodeDetails,
      };
    },
    computed: {},
    mounted() {
      this.loadData();
    },
    methods: {
      async loadData() {
        this.loading = true;
        this.productsData = await Api.fetch(`product`);
        this.loading = false;
      },
      handleDeleteClick(deleteParentURL: string) {
        this.deleteParentURL = deleteParentURL;
        this.askConfirmation = true;
      },
      handleDeleteClose() {
        this.askConfirmation = false;
        this.deleteParentURL = '';
      },
      async removeProduct() {
        const response = await Api.delete('product', encodeURIComponent(this.deleteParentURL));
        const itemIndex = this.productsData.findIndex((el) => el.uri === this.deleteParentURL);
        if (!response?.error && itemIndex !== -1) {
          this.productsData.splice(itemIndex, 1);
        }
        this.handleDeleteClose();
      },
      async selectedNode(node: Product) {
        this.headerName = node.name;
        const response = await Api.fetch(`product/${encodeURIComponent(node.uri)}/details`);
        if (response?.content) {
          this.selectedNodeDetails = typeof response?.content === 'string' ? JSON.parse(response?.content) : response?.content;
        } else {
          this.selectedNodeDetails = {};
        }
      },
    },
  });
</script>

<style scoped></style>
