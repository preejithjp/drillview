<template>
  <div>
    <ManageDashbaord></ManageDashbaord>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ManageDashbaord from '../components/ManageDashbaord.vue';

  export default defineComponent({
    name: 'ManageDashBoardPage',
    components: {
      ManageDashbaord,
    },
  });
</script>

<style scoped></style>
