<template>
  <CommonPopup
    headerIcon="wellbore-icon"
    popup-title="Wellbore Selection"
    secondary-btn-text="Cancel"
    primary-btn-text="Select Wellbore"
    :wrapper-style="{ width: '95%', height: '100%' }"
    @on-cancel="closePopup"
    @on-submit="onSubmit">
    <LoadingIcon v-if="loading" class="loader" />
    <div v-if="!loading" class="synchronizer-header d-flex gap10 align-items-center justify-content-space-between">
      <span class="fontSemibold fontSize-12"></span>
      <div class="d-flex">
        <span class="d-flex p-relative">
          <SearchInput v-model="filterInput" placeholder="Search Wellbore..." />
        </span>
      </div>
    </div>
    <div class="chatimport-body d-flex flex-full scroll-auto">
      <div class="chatimport-table-wrapper scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th>Well Name</th>
              <th>Wellbore Name</th>
              <th>Modified Date</th>
              <th>Creation Date</th>
              <th>Well Uid</th>
              <th>Wellbore Uid</th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr
              v-for="well in wellboresFiltered"
              :key="well.WellboreName"
              class="selectable"
              :class="{ selected: selectedWellbore[well.WellUid + '_' + well.WellboreUid]?.WellboreUid === well.WellboreUid }"
              @click="onWellboreSelect(well)">
              <td>
                <span class="text-ellipsis">{{ well.WellName }}</span>
              </td>
              <td>
                <span class="text-ellipsis">{{ well.WellboreName }}</span>
              </td>
              <td v-dateTimeFormat="'mm/dd/yyyy hh:mi am'">{{ well.ModifiedTime }}</td>
              <td v-dateTimeFormat="'mm/dd/yyyy hh:mi am'">{{ well.CreationTime }}</td>
              <td>{{ well.WellUid }}</td>
              <td>{{ well.WellboreUid }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { Api } from '@/services/api.services';
  import { IWellbores } from 'server/interfaces/datasimplex.interfaces';
  import { SelectedObject } from '@/interfaces/synchronizer.interface';

  export default defineComponent({
    name: 'SelectSynchronizerWellbore',
    components: {
      CommonPopup,
    },
    props: {
      source: {
        type: String,
        required: true,
        default: '',
      },
    },
    emits: ['closePopup', 'wellboreSelection'],
    data() {
      return {
        selectedWellbore: {} as SelectedObject,
        wellboreList: [] as IWellbores[],
        filterInput: '',
        loading: false,
      };
    },
    computed: {
      wellboresFiltered(): IWellbores[] {
        const searchInput = this.filterInput.trim().toLowerCase();
        return searchInput
          ? this.wellboreList.filter(
              (well) => well.WellName.toLowerCase().includes(searchInput) && well.WellboreName.toLowerCase().includes(searchInput)
            )
          : this.wellboreList;
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.fetchWellbores();
      });
    },
    methods: {
      onWellboreSelect(well: IWellbores) {
        if (well.WellboreUid == this.selectedWellbore[well.WellUid + '_' + well.WellboreUid]?.WellboreUid) {
          delete this.selectedWellbore[well.WellUid + '_' + well.WellboreUid];
        } else {
          this.selectedWellbore[well.WellUid + '_' + well.WellboreUid] = well;
        }
      },
      transformedData() {
        return {
          wellId: '',
          wellboreId: '',
          sourceId: this.source,
        };
      },
      async fetchWellbores() {
        this.loading = true;
        let response = null as unknown as IWellbores[];
        if (this.source) {
          response = await Api.fetch('synchronizers/object/wellbores', [this.source] as string[]);
        }
        if (response && response.length) {
          const uniqueWellbores = new Map();
          response.forEach((wellbore) => {
            uniqueWellbores.set(wellbore.WellboreUid, wellbore);
          });
          this.wellboreList = Array.from(uniqueWellbores.values()) || [];
        }
        this.loading = false;
      },
      onSubmit() {
        if (Object.keys(this.selectedWellbore) && Object.keys(this.selectedWellbore).length) {
          this.$emit('wellboreSelection', Object.values(this.selectedWellbore));
          this.$emit('closePopup');
        }
      },
      closePopup() {
        this.$emit('closePopup');
      },
    },
  });
</script>

<style scoped>
  .search-container {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
  }

  .field-input {
    width: 100%;
    max-width: 300px;
    padding: 8px;
    border: 1px solid var(--border-primary);
    border-radius: 5px;
    outline: none;
  }

  .common-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
    height: 90%;
  }

  .common-table th,
  .common-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid var(--border-tertiary);
  }

  .scroll-y-auto {
    max-height: unset;
    overflow-y: visible;
  }

  .selectable {
    cursor: pointer;
    transition: background 0.2s;
  }

  .selected {
    background: var(--hover-tertiary) !important;
  }

  .synchronizer-header {
    margin-bottom: 10px;
    padding: 0;
  }
</style>
