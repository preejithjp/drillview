<template>
  <div class="rig-container fontSize-16">
    <!-- Main Content -->
    <div class="flex-full">
      <ManageRig />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ManageRig from '../components/Rig/ManageRig.vue';

  export default defineComponent({
    name: 'ManageRigPage',
    components: {
      ManageRig,
    },
  });
</script>

<style scoped>
  .rig-container {
    display: flex;
    height: 100%;
    border-bottom: 1px solid var(--border-primary);
    overflow: auto;
  }
</style>
