<template>
  <CommonPopup
    headerIcon="wellbore-icon"
    popup-title="Wellbore Selection"
    secondary-btn-text="Cancel"
    primary-btn-text="Select Wellbore"
    :wrapper-style="{ width: '70%', height: '100%' }"
    @on-submit="onSubmit"
    @on-cancel="closePopup">
    <div class="chatimport-header d-flex gap10 align-items-center justify-content-space-between">
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
              :key="well.uniqueIdentifier"
              class="selectable"
              :uri="selectedWellboreUri"
              :class="{ selected: isSelected(well) }"
              @click="onWellboreSelect(well)">
              <td>
                <span class="text-ellipsis">{{ well.parent.name }}</span>
              </td>
              <td>
                <span class="text-ellipsis">{{ well.name }}</span>
              </td>
              <td v-dateTimeFormat="'mm/dd/yyyy hh:mi am'">{{ well.lastUpdatedDate }}</td>
              <td v-dateTimeFormat="'mm/dd/yyyy hh:mi am'">{{ well.creationDate }}</td>
              <td>{{ well.parent.id }}</td>
              <td>{{ well.uniqueIdentifier }}</td>
            </tr>
            <tr v-if="!wellboresFiltered || !wellboresFiltered.length" class="empty-row">
              <td colspan="6">No data</td>
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
  import { WellboreObject } from '../interfaces/dashboard.interfaces';
  import { StoreDataHeader } from '../../server/interfaces/store.connector.interfaces';

  export default defineComponent({
    name: 'SelectWellbore',
    components: {
      CommonPopup,
    },
    props: {
      selectedWellboreUri: {
        type: String,
        required: false,
      },
    },
    emits: {
      closePopup: () => true,
      wellboreSelection: (payload: WellboreObject) => {
        return typeof payload.wellname === 'string' && typeof payload.wellborename === 'string' && typeof payload.wellboreuri === 'string';
      },
    },
    data() {
      return {
        selectedWellbore: {} as StoreDataHeader,
        wellboreList: [] as StoreDataHeader[],
        filterInput: '' as string,
      };
    },
    computed: {
      wellboresFiltered(): StoreDataHeader[] {
        if (this.filterInput) {
          const searchInput = this.filterInput.toLowerCase();
          return this.wellboreList.filter((data) => {
            return data.name.toLowerCase().includes(searchInput);
          });
        } else {
          return this.wellboreList;
        }
      },
    },
    mounted() {
      this.fetchWellbores();
    },
    methods: {
      async fetchWellbores() {
        const response = await Api.fetch('wellbores');
        if (response && response.length) {
          this.wellboreList = response;
          this.wellboreList = this.wellboreList.sort((a, b) => {
            // TODO: Need to check for name compare. Currently it is in sort with creationdate
            // const nameCompare = a.name.localeCompare(b.name);
            // if (nameCompare !== 0) return nameCompare;
            return b.creationDate - a.creationDate;
          });
        } else {
          this.wellboreList = [];
        }
      },
      onWellboreSelect(well: StoreDataHeader) {
        this.selectedWellbore = well;
      },
      async onSubmit() {
        if (this.selectedWellbore && this.selectedWellbore.uri && this.selectedWellbore.name && this.selectedWellbore.parent?.name) {
          const payload: WellboreObject = {
            wellname: this.selectedWellbore.parent.name,
            wellborename: this.selectedWellbore.name,
            wellboreuri: this.selectedWellbore.uri,
          };
          this.$emit('wellboreSelection', payload);
          this.$emit('closePopup');
        }
      },
      closePopup() {
        this.$emit('closePopup');
      },
      isSelected(well: StoreDataHeader) {
        if (this.selectedWellbore.uniqueIdentifier === well.uniqueIdentifier) {
          return true;
        } else if (!this.selectedWellbore?.uniqueIdentifier && well.uri == this.selectedWellboreUri) {
          return true;
        }
        return false;
      },
    },
  });
</script>

<style scoped>
  :deep(.modal-content) {
    padding: 10px 25px;
  }

  .chatimport-header {
    margin-bottom: 10px;
    padding: 0;
  }

  .chatimport-groupcard-container {
    background: var(--bg-senary);
    flex-direction: row;
    position: relative;
    padding: 10px;
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
    cursor: pointer;
  }

  .chatimport-groupcard-container:hover,
  .chatimport-groupcard-container.selected {
    border: 1px solid var(--text-tertiary);
  }

  .chatimport-groupcard-wrapper {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 10px;
    grid-template-rows: max-content;
    overflow-y: auto;
    padding: 0 6px;
  }

  .chatimport-curve-wrapper {
    padding: 20px;
    background-color: var(--bg-quinary);
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
  }

  .chatimport-activity-wrapper {
    padding: 30px 0px 20px 0px;
    border-top: 1px solid var(--border-tertiary);
  }

  .groupcard-icon {
    color: var(--bg-primary);
    height: 60px;
    width: 60px;
    background-color: var(--text-static-secondary);
    border-radius: 50%;
  }

  .groupcard-title {
    padding: 6px 10px;
    justify-content: center;
    gap: 2px;
  }

  .chatimport-table-wrapper {
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
  }

  .empty-row td {
    text-align: center;
  }
</style>
