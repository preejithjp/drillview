<template>
  <div v-if="!$route.params.id" class="dataCollection-view d-flex flex-col height-100 width-100">
    <DataCollectionRigs />
  </div>
  <DataCollectionDetails v-else />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import DataCollectionRigs from '../components/DataCollectionRigs.vue';
  import DataCollectionDetails from '../components/DataCollectionDetails.vue';

  export default defineComponent({
    name: 'DataCollection',
    components: { DataCollectionRigs, DataCollectionDetails },
    data() {
      return {};
    },
  });
</script>

<style scoped>
  .dataCollection-view {
    padding: 0 0px 15px;
    overflow: hidden;
  }
</style>
