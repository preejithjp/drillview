<template>
  <template v-for="node in nodes" :key="node.uri">
    <tr :class="{ 'no-border': level }" :style="{ 'border-bottom': node.expanded && node.children !== null ? 'none' : '' }" class="tree-section">
      <td class="p10 pb5" @click="toggleTree(node)">
        <div class="d-flex align-items-center" :style="{ 'margin-left': marginLeft + 'px' }">
          <span v-if="node.expanded">&#x25BE;</span>
          <span v-else-if="node.children !== null">&#x25B8;</span>
          <div class="d-flex flex-wrap width-100 justify-content-space-between align-items-center" :class="{ pl10: node.children === null }">
            <div class="text-ellipsis pl5 d-flex">
              {{ node.name }}
            </div>
            <div v-if="!level" class="d-flex align-items-end icon-block gap10 mr10">
              <SvgIcon name="edit-icon" class="svg-icon size15 secondary" />
              <SvgIcon name="delete-icon" class="svg-icon size15 secondary" @click="handleDeleteClick(node.uri)" />
            </div>
          </div>
        </div>
      </td>
    </tr>
    <DocumentTreeView v-if="node.children && node.expanded" :nodes="node.children" :level="level + 1" @selected-node="selectedNode" />
  </template>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { Api } from '@/services/api.services';
  import { ProductTree } from '../../server/interfaces/documentmanager.interface';

  export default defineComponent({
    name: 'DocumentTreeView',
    components: {},
    props: {
      nodes: {
        type: Array as PropType<ProductTree[]>,
        required: true,
      },
      level: { type: Number, required: true },
    },
    emits: ['selectedNode', 'deleteNode'],
    data() {
      return {
        loading: false,
        marginOffset: 12,
      };
    },
    computed: {
      marginLeft() {
        return this.level * this.marginOffset;
      },
    },
    methods: {
      async toggleTree(node: any) {
        if (this.loading) return;
        this.selectedNode(node);
        if (node.expanded) {
          node.expanded = false;
        } else {
          node.expanded = true;
          if (node.children === undefined) {
            this.loading = true;
            /**
             * Call API to fetch the children
             */
            const response = await Api.fetch(`product/${encodeURIComponent(node.type)}/${encodeURIComponent(node.uri)}`);
            node.children = response || null;
            if (!node.children) {
              node.expanded = false;
            }
            this.loading = false;
          }
        }
      },
      selectedNode(node: any) {
        this.$emit('selectedNode', node);
      },
      handleDeleteClick(url: string) {
        this.$emit('deleteNode', url);
      },
    },
  });
</script>
<style scoped>
  .table-container table tr {
    border: 1px solid var(--border-tertiary);
    border-left: 0px;
    border-right: 0px;
  }

  .table-container table tr td {
    cursor: pointer;
  }

  .no-border {
    border: none !important;
  }

  .icon-block {
    opacity: 0;
  }

  .tree-section:hover {
    background-color: var(--hover-secondary);
  }

  .tree-section:hover .icon-block {
    opacity: 1;
  }
</style>
