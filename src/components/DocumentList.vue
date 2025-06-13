<template>
  <div class="d-flex flex-col container-list p10 m10 w25">
    <div class="d-flex flex-col gap10 p10">
      <div class="d-flex flex-wrap align-items-center flex-row gap5">
        <SvgIcon :name="$route?.meta?.icon" class="svg-icon size26 mr10" />
        <div class="title-block">
          <div class="fontWeight-700 fontSize-12">Products</div>
          <span class="fontSize-11">{{ $route?.name }}</span>
        </div>
      </div>
      <div class="search-container p-relative width-100">
        <SearchInput v-model="searchInput" placeholder="Search" />
      </div>
    </div>
    <div v-if="!loading" class="table-container m10 fontSize-13">
      <table v-if="filteredProductsData?.length" class="width-100">
        <tbody>
          <DocumentTreeView :nodes="filteredProductsData" :level="0" @selected-node="selectedNode" @delete-node="handleDeleteClick" />
        </tbody>
      </table>
      <div v-if="!filteredProductsData.length" class="d-flex align-center">
        <span class="no-data p10">No data found</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import DocumentTreeView from '../components/DocumentTreeView.vue';
  import { Product } from '../../server/interfaces/documentmanager.interface';

  export default defineComponent({
    name: 'DocumentList',
    components: {
      DocumentTreeView,
    },
    props: {
      productsData: { type: Array as PropType<Product[]>, required: true },
      loading: { type: Boolean },
    },
    emits: ['nodeSelection', 'deleteNode'],
    data() {
      return {
        searchInput: '',
        askConfirmation: false,
        deleteParentURL: '',
      };
    },
    computed: {
      filteredProductsData() {
        if (this.searchInput?.trim()) {
          return this.productsData.filter((product) => product.name.toLowerCase().includes(this.searchInput.trim().toLowerCase()));
        } else {
          return this.productsData;
        }
      },
    },
    methods: {
      handleDeleteClick(uri: string) {
        this.$emit('deleteNode', uri);
      },
      selectedNode(node: Product) {
        this.$emit('nodeSelection', node);
      },
    },
  });
</script>

<style scoped>
  .w25 {
    min-width: 25vw;
  }

  .container-list {
    background: var(--bg-septenary);
    border-radius: 8px 0px 0px 8px;
    border: 1px solid var(--border-tertiary);
    margin-right: 5px;
  }

  .title-block {
    line-height: 15px;
  }

  .search-container {
    border-radius: 5px;
  }

  .table-container:hover {
    overflow: auto;
  }

  .table-container {
    background-color: var(--bg-septenary);
    overflow: hidden;
    flex-grow: 1;
  }

  .table-container table {
    border-collapse: collapse;
  }

  .no-border {
    border: none;
  }
</style>
