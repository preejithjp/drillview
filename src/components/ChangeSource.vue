<template>
  <CommonPopup
    headerIcon="wellbore-icon"
    popup-title="Choose Source"
    secondary-btn-text="Cancel"
    primary-btn-text="Select"
    :wrapper-style="{ width: '80%', height: '100%' }"
    :disabledPrimaryBttn="!selectedSources.length"
    @on-cancel="$emit('cancel')"
    @on-submit="onSave">
    <LoadingIcon v-if="loading" class="loader" />
    <div class="chatimport-header d-flex gap10 align-items-center justify-content-end">
      <div class="d-flex">
        <CustomButton @click="$emit('addEditSource', {})">Add Source</CustomButton>
      </div>
    </div>
    <div class="chatimport-body d-flex flex-full scroll-auto">
      <div class="chatimport-table-wrapper scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th>
                <input v-model="selectAll" type="checkbox" title="Select All" />
              </th>
              <th>Name</th>
              <th>URL</th>
              <th>Source User</th>
              <th>Version</th>
              <th>Max Connections</th>
              <th>Connection Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-if="sourceData.length === 0">
              <td class="fontSize-14 text-center" colspan="10">No data available.</td>
            </tr>
            <tr v-for="set in sourceData" v-else :key="set.SourceId as string" class="selectable" :class="{ selected: isSelected(set) }">
              <td>
                <input v-model="selectedSources" :value="set" type="checkbox" title="Select Member" />
              </td>
              <td class="col-name">{{ set.Name }}</td>
              <td class="col-url">{{ set.Url }}</td>
              <td class="col-user">{{ set.UserName }}</td>
              <td class="col-version">{{ set.Version }}</td>
              <td class="col-max-connections">{{ set.MaxConnections }}</td>
              <td class="col-status">
                <div class="d-flex align-items-center gap10">
                  <div class="d-flex align-items-center gap5" @click.stop="testConnection(set)">
                    <SvgIcon name="reload-icon" class="svg-icon size16 search-icon flex-shrink-0" />
                    <span>Test</span>
                  </div>
                  <span v-if="set.isTested">|</span>
                  <div v-if="set.isTested" class="d-flex align-items-center">
                    <SvgIcon v-if="set.isActive" name="tick-icon" class="svg-icon size16" />
                    <SvgIcon v-else name="close-icon-circle" class="svg-icon size16 error-color" />
                  </div>
                </div>
              </td>
              <td class="col-status">
                <div class="d-flex align-items-center gap10">
                  <SvgIcon name="edit-icon" class="svg-icon size14" @click.stop="$emit('addEditSource', set)" />
                  <SvgIcon name="delete-icon" class="svg-icon size14" @click.stop="openDeleteConfirmation(set.SourceId as string)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmationPopup
      v-if="showDeleteConfirmation"
      :show="showDeleteConfirmation"
      :message="`Are you sure you want to delete?`"
      @on-cancel="closeDeleteConfirmation"
      @on-submit="emitConfirmDelete" />
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Api } from '@/services/api.services';
  import { ISourceConfig, JobConfig, ResponseType } from './../../server/interfaces/synchronizer.interfaces';
  import ConfirmationPopup from './Common/ConfirmationPopup.vue';
  import { SourceConfig } from '@/interfaces/synchronizer.interface';
  import { store } from '@/main';
  import { ToastType } from './ToastMessage.vue';

  export default defineComponent({
    name: 'ChangeSource',
    components: {
      CommonPopup,
      ConfirmationPopup,
    },
    props: {
      sourceConn: {
        type: Array as PropType<ISourceConfig[]>,
        required: true,
        default: () => [],
      },
    },
    emits: ['save', 'cancel', 'addEditSource'],
    data() {
      return {
        selectAll: false as boolean,
        loading: false as boolean,
        sourceData: [] as SourceConfig[],
        showDeleteConfirmation: false as boolean,
        deleteId: '' as string,
        selectedSources: [] as ISourceConfig[],
      };
    },
    watch: {
      selectAll(newVal) {
        if (newVal) {
          this.selectedSources = this.sourceData.map((source) => source);
        } else {
          this.selectedSources = [];
        }
      },
      selectedSources(newVal) {
        this.selectAll = newVal.length === this.sourceData.length;
      },
    },
    mounted() {
      this.selectedSources = this.sourceConn;
      this.onGetAllSource();
    },
    methods: {
      async onGetAllSource() {
        this.sourceData = [];
        this.loading = true;
        const res = await Api.fetch('synchronizers/source');
        if (res && res.length) {
          this.sourceData = res;
          const selectedIds = new Set(this.selectedSources.map((s) => s.SourceId));
          this.selectedSources = this.sourceData.filter((item) => selectedIds.has(item.SourceId));
        }
        this.loading = false;
      },
      async onDeleteSource() {
        if (this.deleteId) {
          const response: JobConfig[] = await Api.fetch('synchronizers/source/' + this.deleteId + '/jobs');
          if (response && response.length) {
            const syncedJobs: string[] = response.map((item) => item.JobName);
            store.showToast(ToastType.WARN, `This source is linked with ( ${syncedJobs.join()} ) jobs and cannot be deleted`);
          } else {
            await Api.delete('synchronizers/source', this.deleteId);
            this.onGetAllSource();
          }
        }
      },
      async testConnection(item: SourceConfig) {
        const data = {
          Url: item.Url,
          UserName: item.UserName,
          Password: item.Password,
          Proxy: {
            UseProxy: item.IsProxy,
            ...item.ProxyConfig,
          },
          Version: item.Version,
          Maxconnections: item.MaxConnections,
        };
        const response = await Api.submit('synchronizers/connectionstatus', data);
        // Create a new object to ensure Vue detects the change
        const updatedItem = { ...item, isTested: true, isActive: response === ResponseType.Connected };
        // Find and replace the object in sourceData
        this.sourceData = this.sourceData.map((src) => (src.SourceId === item.SourceId ? updatedItem : src));
        // Ensure the selected state remains intact
        this.selectedSources = this.selectedSources.map((src) => (src.SourceId === item.SourceId ? updatedItem : src));
      },
      openDeleteConfirmation(id: string) {
        this.deleteId = id;
        this.showDeleteConfirmation = true;
      },
      closeDeleteConfirmation() {
        this.showDeleteConfirmation = false;
      },
      emitConfirmDelete() {
        this.onDeleteSource();
        this.closeDeleteConfirmation();
      },
      isSelected(set: ISourceConfig) {
        return this.selectedSources.some((source) => source.SourceId === set.SourceId);
      },
      async onSave() {
        this.loading = true;
        const data = this.selectedSources.map((item) => item.SourceId);
        await Api.submit('synchronizers/source/accesssource', data);
        this.loading = false;
        this.$emit('save', this.selectedSources);
      },
    },
  });
</script>

<style scoped>
  .chatimport-header {
    margin-bottom: 10px;
    padding: 0;
  }

  .common-table svg {
    color: var(--icon-secondary);
  }
  .error-color {
    color: var(--error-color);
  }
</style>
