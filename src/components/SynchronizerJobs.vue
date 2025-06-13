<template>
  <div class="p-relative height-100">
    <div class="synchronizer-view d-flex height-100 flex-col fontMedium">
      <SynchronizerHeader
        title="Source"
        iconName="source-icon"
        primaryBtnText="Change Source"
        secondaryBtnText="Wellbores"
        :sourceConn="sourceConn"
        @search="emitSearchWellbore"
        @emit-primary-btn="openSourcePopup"
        @emit-secondary-btn="navigateToWellbore" />
      <div class="d-flex flex-col gap20 overflow-y pr10">
        <div v-if="filteredData.length" class="d-flex align-items-center gap20 flex-wrap">
          <template v-for="(set, index) in filteredData" :key="index">
            <template v-if="set.Wellbores.length === 1">
              <div
                v-for="(well, j) in set.Wellbores"
                :key="j"
                class="card"
                :class="set.JobStatus === JobStatusType.RUNNING ? 'card-red' : 'card-green'">
                <div class="icons d-flex align-items-center gap5">
                  <SvgIcon name="delete-icon" class="svg-icon size10" @click="openDeleteConfirmation(set.JobUID as string, well.Source.UidWell)" />
                  <SvgIcon name="arrow-right" class="svg-icon size16" @click="onEditJob(set.JobUID as string)" />
                </div>
                <div class="d-inline-block" @click="openJobStatusConfirmation(set.JobUID as string, set.JobStatus)">
                  <SvgIcon
                    :name="set.JobStatus === JobStatusType.RUNNING ? 'running-icon' : 'pause-icon'"
                    class="svg-icon size30 icon-status"
                    :class="set.JobStatus === JobStatusType.RUNNING ? 'icon-start-color' : 'icon-stop-color'" />
                </div>
                <div class="text-color fontSemibold fontSize-14">{{ set.JobStatus === JobStatusType.RUNNING ? 'Running' : 'Stopped' }}</div>
                <div class="text-color fontNormal fontSize-12 text-ellipsis">{{ well.Source.NameWell }} / {{ well.Source.NameWellbore }}</div>
                <div class="timestamp fontSize-9">
                  Last Index Received:
                  <br />
                  <span v-dateTimeFormat="'yyyy-mm-dd HH:mi:ss'">{{ set.LastUpdatedDate }}</span>
                </div>
              </div>
            </template>
          </template>
        </div>
        <div v-if="filteredData.length" class="d-flex align-items-center gap20 flex-wrap">
          <template v-for="(set, index) in filteredData" :key="index">
            <div v-if="set.Wellbores.length > 1" class="outer-card d-flex align-items-center p-relative">
              <SvgIcon name="arrow-right" class="svg-icon size16 arrow-icon" @click="onEditJob(set.JobUID as string)" />
              <div class="inner-status-section d-flex align-items-center fontSemibold">
                <div @click="openJobStatusConfirmation(set.JobUID as string, set.JobStatus)">
                  <SvgIcon
                    :name="set.JobStatus === JobStatusType.RUNNING ? 'running-icon' : 'pause-icon'"
                    class="svg-icon size36 icon-status"
                    :class="set.JobStatus === JobStatusType.RUNNING ? 'icon-start-color' : 'icon-stop-color'" />
                </div>
                <div>
                  <div class="fontSize-14">{{ set.JobStatus === JobStatusType.RUNNING ? 'Running' : 'Stopped' }}</div>
                  <div class="job-title fontSize-10 text-ellipsis">{{ set.JobName }} {{ set.JobStatus }}</div>
                </div>
              </div>
              <div class="inner-card-container d-flex align-items-center gap20 flex-wrap">
                <div v-for="(well, j) in set.Wellbores" :key="j" class="inner-card">
                  <div class="icons d-flex flex-row gap5">
                    <SvgIcon name="delete-icon" class="svg-icon size10" @click="openDeleteConfirmation(set.JobUID as string, well.Source.UidWell)" />
                  </div>
                  <div class="inner-details text-color fontSemibold fontSize-13 text-ellipsis">
                    {{ well.Source.NameWell }} / {{ well.Source.NameWellbore }}
                  </div>
                  <div class="timestamp fontSize-9">
                    Last Index Received:
                    <br />
                    <span v-dateTimeFormat="'yyyy-mm-dd HH:mi:ss'">{{ set.LastUpdatedDate }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div v-if="!filteredData.length && !loading" class="d-block text-center fontSize-14 p10">
        {{ searchWellbore !== '' ? 'No Matches Found!' : 'No Data Available.' }}
      </div>
    </div>

    <ConfirmationPopup
      v-if="showDeleteConfirmation"
      :show="showDeleteConfirmation"
      :message="`Are you sure you want to delete?`"
      primaryBtnText="Delete"
      @on-cancel="closeDeleteConfirmation"
      @on-submit="emitConfirmDelete" />

    <ConfirmationPopup
      v-if="showDeleteConfirmation"
      :show="showDeleteConfirmation"
      :message="`Are you sure you want to delete?`"
      primaryBtnText="Delete"
      @on-cancel="closeDeleteConfirmation"
      @on-submit="emitConfirmDelete" />

    <ConfirmationPopup
      v-if="showJobStatusConfirmation"
      :show="showJobStatusConfirmation"
      :message="`Are you sure you want to ${jobStatus === JobStatusType.RUNNING ? 'start' : 'stop'} the job?`"
      :primaryBtnText="jobStatus === JobStatusType.RUNNING ? 'Start' : 'Stop'"
      @on-cancel="closeJobStatusConfirmation"
      @on-submit="emitConfirmJobStatus" />

    <ChangeSource
      v-if="showSourcePopup"
      :sourceConn="sourceConn"
      @save="emitSaveSourcePopup"
      @cancel="closeSourcePopup"
      @add-edit-source="emitAddEditSourcePopup" />

    <CreateSource
      v-if="showCreateSourcePopup"
      :initialSourceData="initialSourceData"
      @save="emitCreateSourcePopup"
      @cancel="closeCreateSourcePopup" />
  </div>
  <LoadingIcon v-if="loading" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ConfirmationPopup from './Common/ConfirmationPopup.vue';
  import ChangeSource from './ChangeSource.vue';
  import CreateSource from './CreateSource.vue';
  import { ISourceConfig, JobConfig, JobStatusType } from '../../server/interfaces/synchronizer.interfaces';
  import { Api } from '@/services/api.services';
  import { Routes } from '@/router';
  import SynchronizerHeader from './SynchronizerHeader.vue';

  export default defineComponent({
    name: 'SynchronizerJobs',
    components: {
      ConfirmationPopup,
      ChangeSource,
      CreateSource,
      SynchronizerHeader,
    },
    data() {
      return {
        JobStatusType: JobStatusType,
        sourceData: [] as JobConfig[],
        searchWellbore: '' as string,
        showDeleteConfirmation: false as boolean,
        showJobStatusConfirmation: false as boolean,
        showSourcePopup: false as boolean,
        showCreateSourcePopup: false as boolean,
        jobId: '' as string,
        wellId: '' as string,
        jobStatus: 0 as number,
        initialSourceData: {} as ISourceConfig,
        loading: false as boolean,
        sourceConn: [] as ISourceConfig[],
      };
    },
    computed: {
      filteredData() {
        if (!this.searchWellbore) {
          return this.sourceData;
        }
        const searchQuery = this.searchWellbore.toLowerCase();
        return this.sourceData.filter((job) => {
          return (
            job.JobName.toLowerCase().includes(searchQuery) ||
            job.JobStatus.toString().includes(searchQuery) ||
            job.Wellbores.some(
              (wellbore) =>
                wellbore.Source.NameWell.toLowerCase().includes(searchQuery) || wellbore.Source.NameWellbore.toLowerCase().includes(searchQuery)
            )
          );
        });
      },
    },
    mounted() {
      this.onGetAllSources();
      this.onGetAllJobs();
    },
    methods: {
      openDeleteConfirmation(jobId: string, wellId: string) {
        this.jobId = jobId;
        this.wellId = wellId;
        this.showDeleteConfirmation = true;
      },
      closeDeleteConfirmation() {
        this.showDeleteConfirmation = false;
      },
      emitConfirmDelete() {
        this.onDeleteJob();
        this.closeDeleteConfirmation();
      },
      async openSourcePopup() {
        this.showSourcePopup = true;
      },
      closeSourcePopup() {
        this.showSourcePopup = false;
      },
      emitSaveSourcePopup() {
        this.closeSourcePopup();
        this.onGetAllSources();
      },
      openCreateSourcePopup() {
        this.closeSourcePopup();
        this.showCreateSourcePopup = true;
      },
      closeCreateSourcePopup() {
        this.showCreateSourcePopup = false;
        this.openSourcePopup();
      },
      emitCreateSourcePopup() {
        this.showCreateSourcePopup = false;
        this.openSourcePopup();
      },
      emitAddEditSourcePopup(item: ISourceConfig) {
        this.initialSourceData = item;
        this.openCreateSourcePopup();
      },
      openJobStatusConfirmation(jobId: string, jobStatus: number) {
        this.jobId = jobId;
        this.jobStatus = jobStatus;
        this.showJobStatusConfirmation = true;
      },
      closeJobStatusConfirmation() {
        this.showJobStatusConfirmation = false;
      },
      emitConfirmJobStatus() {
        this.onUpdateJobStatus();
        this.closeJobStatusConfirmation();
      },
      async onEditJob(jobId: string) {
        this.$router.push({ name: Routes.SynchronizerCreateJob, params: { jobid: jobId } });
      },
      async onGetAllJobs() {
        this.loading = true;
        const res = await Api.fetch('synchronizers/job');
        if (res && res.length) {
          this.sourceData = res;
        }
        this.loading = false;
      },
      async onGetAllSources() {
        const res = await Api.fetch('synchronizers/source/me');
        if (res && res.length) {
          this.sourceConn = res;
        }
      },
      async onDeleteJob() {
        await Api.delete(`synchronizers/job/${this.jobId}`, this.wellId);
        this.onGetAllJobs();
      },
      async onUpdateJobStatus() {
        if (this.jobStatus === 0) {
          await Api.patch(`synchronizers/job/${this.jobId}/start`);
        } else {
          await Api.patch(`synchronizers/job/${this.jobId}/stop`);
        }
        this.onGetAllJobs();
      },
      navigateToWellbore() {
        this.$router.push({ name: Routes.SynchronizerWellbores });
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

  .card {
    width: 185px;
    padding: 18px 10px 15px 10px;
    border-radius: 5px;
    text-align: center;
    position: relative;
    border: 1px solid transparent;
    border-color: var(--border-tertiary);
  }

  .card-red {
    background-color: var(--bg-stop-color);
  }

  .card-green {
    background-color: var(--bg-start-color);
  }

  .timestamp {
    margin-top: 4px;
    color: var(--text-senary);
  }

  .icons {
    position: absolute;
    top: 5px;
    right: 10px;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.2s ease-in-out,
      visibility 0.2s ease-in-out,
      transform 0.2s ease-in-out;
  }

  .inner-card:hover .icons,
  .card:hover .icons,
  .outer-card:hover .arrow-icon {
    opacity: 1;
    visibility: visible;
  }

  .outer-card {
    padding: 20px;
    border-radius: 5px;
    background: var(--bg-quaternary);
    gap: 12px;
    border: 1px solid var(--border-tertiary);
  }

  .inner-status-section {
    gap: 8px;
    padding: 10px;
  }

  .inner-card-container {
    justify-content: flex-start;
    overflow: auto;
    max-height: 97px;
  }

  .job-title {
    color: var(--text-senary);
    max-width: 55px;
  }

  .inner-card {
    width: 250px;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    background-color: var(--bg-septenary);
    position: relative;
    border: 1px solid transparent;
    border-color: var(--border-tertiary);
    flex: 1 1 245px;
    max-width: 250px;
  }

  .inner-details {
    color: var(--text-senary);
    padding-top: 6px;
  }

  .overflow-y {
    overflow-y: auto;
  }

  .arrow-icon {
    position: absolute;
    top: 5px;
    left: 8px;
    color: var(--bg-primary);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.2s ease-in-out,
      visibility 0.2s ease-in-out,
      transform 0.2s ease-in-out;
  }

  .text-color {
    color: var(--text-tertiary);
  }
  .icon-status.icon-start-color {
    color: var(--icon-start-color);
  }
  .icon-status.icon-stop-color {
    color: var(--icon-stop-color);
  }
</style>
