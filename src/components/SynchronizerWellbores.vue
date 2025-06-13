<template>
  <div class="p-relative height-100">
    <div class="synchronizer-view d-flex height-100 flex-col fontMedium">
      <SynchronizerHeader
        title="Wellbores not Configured"
        iconName="wellbore-icon"
        primaryBtnText="Create Job"
        :disabledPrimaryBttn="!selectedWells.wellbores.length"
        @emit-primary-btn="redirectToCreateJob"
        @search="emitSearchWellbore" />
      <div class="inner-card-container">
        <template v-for="set in filteredData" :key="set.sourceId">
          <div
            v-for="(well, ind) in set.wellbores"
            :key="ind"
            :class="[
              'inner-card',
              isSelected(well.WellUid) ? 'selected-card-border' : '',
              cardDisable ? (sourceId === set.sourceId ? '' : 'card-disabled') : '',
            ]"
            @click="cardSelect(well.WellUid, set.sourceId)">
            <div v-if="isSelected(well.WellUid)" class="tick-icons d-flex flex-row">
              <SvgIcon name="tick-icon" class="svg-icon size16" />
            </div>
            <div class="status fontSize-13 fontSemibold text-ellipsis">{{ well.WellName }} / {{ well.WellboreName }}</div>
            <div class="inner-details fontSize-10">operator: {{ well.Operator || 'N/A' }}</div>
            <div class="timestamp fontSize-9">
              Last updated Date:
              <span v-dateTimeFormat>{{ well.CreationTime }}</span>
            </div>
          </div>
        </template>
      </div>
      <div v-if="!filteredData.length && !loading" class="d-block text-center fontSize-14 p10">
        {{ searchWellbore !== '' ? 'No Matches Found!' : 'No Data Available.' }}
      </div>
    </div>
    <LoadingIcon v-if="loading" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Routes } from '@/router';
  import { IWellbores } from 'server/interfaces/datasimplex.interfaces';
  import { Api } from '@/services/api.services';
  import SynchronizerHeader from './SynchronizerHeader.vue';
  import { PageTypes } from '@/interfaces/synchronizer.interface';

  export default defineComponent({
    name: 'SynchronizerWellbores',
    components: {
      SynchronizerHeader,
    },
    data() {
      return {
        wellboreList: {} as Record<string, IWellbores[]>,
        searchWellbore: '' as string,
        loading: false as boolean,
        sourceId: '' as string,
        selectedWells: {
          sourceId: '' as string,
          wellbores: [] as IWellbores[],
        },
        cardDisable: false as boolean,
      };
    },
    computed: {
      filteredData() {
        if (!this.searchWellbore) {
          return Object.entries(this.wellboreList).map(([sourceId, wellbores]) => ({
            sourceId,
            wellbores,
          }));
        }
        const search = this.searchWellbore.toLowerCase();
        return Object.entries(this.wellboreList)
          .map(([sourceId, wellbores]) => ({
            sourceId,
            wellbores: wellbores.filter(
              (well) =>
                (well.WellboreName || '').toLowerCase().includes(search) ||
                (well.WellName || '').toLowerCase().includes(search) ||
                (well.Operator || '').toLowerCase().includes(search)
            ),
          }))
          .filter((item) => item.wellbores.length > 0);
      },
    },
    mounted() {
      this.fetchWellbores();
    },
    methods: {
      redirectToCreateJob() {
        this.$router.push({
          name: Routes.SynchronizerCreateJob,
          params: {
            jobid: PageTypes.CREATEJOB,
          },
        });
        localStorage.setItem('selectedWells', JSON.stringify(this.selectedWells));
      },
      cardSelect(wellId: string, uuid: string) {
        this.sourceId = uuid;
        const wellbores = this.wellboreList[uuid] || [];
        const wellbore = wellbores.find((e) => e.WellUid === wellId);
        if (!wellbore) return;
        // Check if wellbore is already selected
        const isSelected = this.selectedWells.wellbores.some((e) => e.WellUid === wellId);
        if (isSelected) {
          // Remove from selected list
          this.selectedWells.wellbores = this.selectedWells.wellbores.filter((e) => e.WellUid !== wellId);
        } else {
          // Add to selected list
          this.selectedWells.wellbores.push(wellbore);
        }
        this.selectedWells.sourceId = uuid;
        this.cardDisable = this.selectedWells.wellbores.length > 0;
      },
      isSelected(wellId: string) {
        return this.selectedWells.wellbores.some((e) => e.WellUid === wellId);
      },
      async fetchWellbores() {
        this.loading = true;
        const response = await Api.fetch('synchronizers/object/wellbores');
        this.wellboreList = response;
        this.loading = false;
      },
      emitSearchWellbore(searchTxt: string) {
        this.searchWellbore = searchTxt;
      },
    },
  });
</script>

<style scoped>
  .synchronizer-view {
    gap: 12px;
    padding: 20px;
  }

  .synchronizer-view svg {
    color: var(--icon-secondary);
    cursor: pointer;
  }

  .icon {
    margin-right: 5px;
    vertical-align: middle;
    color: var(--text-tertiary);
  }

  .status {
    padding-top: 6px;
    color: var(--text-tertiary);
  }

  .timestamp {
    padding-top: 6px;
    color: var(--text-senary);
  }

  .inner-card-container {
    flex: 0 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
    grid-gap: 10px;
    padding-right: 10px;
    grid-template-rows: max-content;
    overflow-y: auto;
  }

  .inner-card {
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    background-color: var(--bg-septenary);
    position: relative;
    border: 1px solid transparent;
    border-color: var(--border-tertiary);
    cursor: pointer;
  }

  .selected-card-border {
    border-color: var(--bg-primary);
  }

  .inner-details {
    color: var(--text-senary);
  }

  .tick-icons {
    position: absolute;
    top: 73px;
    right: -7px;
    display: flex;
    color: var(--bg-primary);
  }

  .card-disabled {
    opacity: 0.5;
    pointer-events: none;
    background-color: var(--status-inactive-color);
  }
</style>
