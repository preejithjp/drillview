<template>
  <div class="organization-view">
    <VForm v-slot="{ handleSubmit }">
      <div class="table-header fontSize-12">
        <div class="d-flex flex-full gap10 width-100">
          <span class="align-header-center">
            <SvgIcon name="job-icon" class="svg-icon size24" />
            <span class="fontSemibold">Job Name</span>
          </span>
          <div class="search-input-container">
            <Field v-slot="{ field, errors, meta }" v-model="jobdetails.JobName" name="jobName" :rules="{ hasContent: true }">
              <input v-bind="field" type="text" class="search-input" placeholder="Enter Job Name" />
              <span v-if="errors.length && meta.touched" class="invalid-msg fontSize-10">{{ errors[0] }}</span>
            </Field>
          </div>
        </div>
        <div class="table-actions d-flex flex-full justify-content-between">
          <span>
            Status:
            <span class="fontSemibold">{{ jobdetails.JobStatus == jobStatusType.RUNNING ? 'Running' : 'Stoped' }}</span>
          </span>
          <CustomButton @click="handleSubmit(saveJob)">Save Job</CustomButton>
        </div>
      </div>
    </VForm>
    <div class="content-wrapper overflow-hidden d-flex">
      <div class="sidebar">
        <div class="create-job-container">
          <div class="create-job-header-wrapper">
            <span>
              <SvgIcon name="wellbore-icon" class="svg-icon size24" />
            </span>
            <div class="flex-full p-relative fontSemibold fontSize-12">Selected Wellbores</div>
            <SvgIcon name="circle-plus-icon" class="svg-icon size24" @click.stop="openTargetPopup" />
          </div>
          <div class="create-job-body-wrapper d-flex justify-content-center flex-full">
            <div v-if="wellbores.length" class="inner-card-container">
              <div v-for="wellbore in wellbores" :key="wellbore.WellboreUid" class="inner-card">
                <div v-if="wellbores.length > 1" class="icons d-flex flex-row gap5">
                  <SvgIcon name="remove-icon" class="svg-icon size16" @click.stop="openDeleteConfirmation(wellbore.WellboreUid)" />
                </div>
                <div class="status fontSemibold fontSize-12">
                  {{ wellbore.WellboreName }}
                </div>
                <div class="inner-details fontSemibold fontSize-10">Operator: {{ wellbore.Operator || 'Aramco' }}</div>
                <div class="timestamp fontSize-8">
                  Last Updated Date:
                  <br />
                  <span v-dateTimeFormat>{{ wellbore.ModifiedTime }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="create-job-footer-wrapper">
            <div class="d-flex justify-content-center">
              <CustomButton @click="addWellbore()">Import Wellbore</CustomButton>
            </div>
          </div>
        </div>
      </div>
      <LoadingIcon v-show="loading" class="loader" />
      <div v-if="!loading" class="flex-full">
        <div class="create-job-right-container">
          <div class="create-job-right-header gap5">
            <div class="create-job-right-header-box tab-box fontMedium fontSize-12">
              <span v-for="tab in Tabs" :key="tab" class="tab-item" :class="{ fontBold: SelectedTabes === tab }" @click="SelectedTabes = tab">
                {{ tab }}
              </span>
            </div>
          </div>
          <div v-show="SelectedTabes === tabs.Log" class="Tabs-component">
            <LogTab
              v-model:logdata="logDetailsList"
              v-model:tranferDepthLog="jobdetails.Transfer.AllDepthLogs"
              v-model:transferTimebaseLog="jobdetails.Transfer.AllTimeLogs"
              :selectedWellbore="selectedWellbore"
              :jobdetails="jobdetails"
              :source="wellDetails.sourceId" />
          </div>
          <div v-show="SelectedTabes === tabs.Trajectory" class="Tabs-component">
            <TrejectoryTab
              v-model:transferAllTrejectory="jobdetails.Transfer.AllTrajectries"
              v-model="jobdetails.Trajectories"
              :trejectory="jobdetails.Trajectories"
              :selectedWellbore="selectedWellbore"
              :source="wellDetails.sourceId" />
          </div>
          <div v-show="SelectedTabes === tabs.Mudlog" class="Tabs-component">
            <MudLogTab
              v-model="jobdetails.MudLogs"
              v-model:tranferMudlog="jobdetails.Transfer.AllMudLogs"
              :selectedWellbore="selectedWellbore"
              :source="wellDetails.sourceId" />
          </div>
          <div v-show="SelectedTabes === tabs.OtherObjects" class="Tabs-component">
            <OtherObjectTab
              v-model:otherObject="OtherObjects"
              v-model:tranferRig="jobdetails.Transfer.AllRigs"
              :selectedWellbore="selectedWellbore"
              :source="wellDetails.sourceId" />
          </div>
          <div v-show="SelectedTabes === tabs.Settings" class="Tabs-component">
            <SettingsTab v-model="jobdetails.Settings" :jobdetails="jobdetails" />
          </div>
        </div>
      </div>
    </div>
    <SelectSynchronizerWellbore
      v-if="addWellborePopup"
      :source="wellDetails.sourceId"
      @close-popup="closePopup"
      @wellbore-selection="wellboreSelect" />
    <ConfirmationPopup
      v-if="showDeleteConfirmation"
      :show="showDeleteConfirmation"
      :message="`Are you sure you want to ${confirmText?.toLowerCase() || ''}?`"
      :primaryBtnText="confirmText"
      secondaryBtnText="Cancel"
      @on-cancel="closeDeleteConfirmation"
      @on-submit="emitConfirmDelete" />

    <CreateTarget v-if="showTargetPopup" :initialTargetData="jobdetails.Target" @save="emitTargetPopup" @cancel="closeTargetPopup" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import LogTab from './synchronizerTabs/LogTab.vue';
  import TrejectoryTab from './synchronizerTabs/TrejectoryTab.vue';
  import MudLogTab from './synchronizerTabs/MudLogTab.vue';
  import OtherObjectTab from './synchronizerTabs/OtherObjectTab.vue';
  import SettingsTab from './synchronizerTabs/SettingsTab.vue';
  import SelectSynchronizerWellbore from './SelectSynchronizerWellbore.vue';
  import { ObjectTypeOther, Tabs, WellDetailsFromDashboard, PageTypes, ObjectTypes } from '../interfaces/synchronizer.interface';
  import ConfirmationPopup from './Common/ConfirmationPopup.vue';
  import {
    DepthLog,
    JobConfig,
    TargetStructure,
    TimebaseLog,
    WellboreDetails,
    JobStatusType,
    ObjectNames,
  } from '../../server/interfaces/synchronizer.interfaces';
  import { Api } from '@/services/api.services';
  import { SynchronizerSaveData } from '../assets/synchronizersavedata';
  import { Field, Form as VForm } from 'vee-validate';
  import {
    IBharuns,
    IFluidReports,
    IMudLogs,
    IRigs,
    ITrajectories,
    IWBgeometrys,
    IWellbores,
    LogCurveInfo,
    LogEntry,
    IndexTypes,
    ObjectTypesToGet,
  } from './../../server/interfaces/datasimplex.interfaces';
  import { ToastType } from './ToastMessage.vue';
  import { store } from '@/main';
  import CreateTarget from './CreateTarget.vue';

  export default defineComponent({
    name: 'SynchronizerCreateJob',
    components: {
      LogTab,
      TrejectoryTab,
      MudLogTab,
      OtherObjectTab,
      SettingsTab,
      SelectSynchronizerWellbore,
      ConfirmationPopup,
      CreateTarget,
      Field,
      VForm,
    },
    data() {
      return {
        Tabs: Object.values(Tabs) as Tabs[],
        SelectedTabes: Tabs.Log as Tabs,
        tabs: Tabs,
        wellDetails: {} as WellDetailsFromDashboard,
        wellbores: [] as IWellbores[],
        selectedWellbore: {} as IWellbores,
        wellboresJob: [] as WellboreDetails[],
        addWellborePopup: false as boolean,
        confirmText: '' as string,
        wellId: '' as string,
        showDeleteConfirmation: false as boolean,
        jobdetails: {
          ...SynchronizerSaveData,
          CreationDate: new Date(SynchronizerSaveData.CreationDate).getTime(),
          LastUpdatedDate: new Date(SynchronizerSaveData.LastUpdatedDate).getTime(),
        } as JobConfig,
        logDetailsList: [] as DepthLog[] | TimebaseLog[],
        OtherObjects: [] as ObjectTypeOther[],
        loading: false as boolean,
        jobId: '' as string,
        showTargetPopup: false as boolean,
        jobStatusType: JobStatusType,
      };
    },
    watch: {
      logDetailsList: {
        handler(newVal) {
          this.jobdetails.DepthLogs = newVal.filter((ele: DepthLog) => ele.StartIndexInft !== undefined) as DepthLog[];
          this.jobdetails.TimebaseLogs = newVal.filter((ele: TimebaseLog) => ele.StartIndex !== undefined) as TimebaseLog[];
        },
        deep: true,
      },
      OtherObjects: {
        handler(newVal) {
          this.jobdetails.WbGeometries = newVal.filter((ele: ObjectTypeOther) => ele.Type === ObjectTypesToGet.Trejectory) as ObjectTypeOther[];
          this.jobdetails.BHARun = newVal.filter((ele: ObjectTypeOther) => ele.Type === ObjectTypesToGet.BhaRun) as ObjectTypeOther[];
          this.jobdetails.FluidReport = newVal.filter((ele: ObjectTypeOther) => ele.Type === ObjectTypesToGet.FluidReport) as ObjectTypeOther[];
          this.jobdetails.Rigs = newVal.filter((ele: ObjectTypeOther) => ele.Type === ObjectTypesToGet.Rig) as ObjectTypeOther[];
        },
        deep: true,
      },
    },
    async mounted() {
      this.loading = true;
      const paramData = this.$route.params.jobid as string;
      if (paramData && paramData !== PageTypes.CREATEJOB) {
        this.jobId = paramData;
        const response: JobConfig[] = await Api.fetch('synchronizers/job/' + this.jobId);
        if (response && response.length) {
          this.jobdetails = response[0];
          this.wellboresJob = this.jobdetails.Wellbores;
          this.wellDetails.sourceId = String(this.jobdetails.SourceId);
          this.wellbores = this.jobdetails.Wellbores.map((well) => {
            //TODO: remove this when the API is ready
            return {
              WellUid: well.Source.UidWell,
              WellboreUid: well.Source.UidWellbore,
              WellName: well.Source.NameWell,
              WellboreName: well.Source.NameWellbore,
              Operator: '',
              StatusWellbore: '',
              CreationTime: this.jobdetails.CreationDate.toString(),
              ModifiedTime: this.jobdetails.LastUpdatedDate.toString(),
            };
          });
        }
      } else {
        this.wellDetails = localStorage.getItem('selectedWells') ? JSON.parse(localStorage.getItem('selectedWells') as string) : {};
        this.wellbores = this.wellDetails.wellbores;
        this.wellboresJob = this.formateWellboreData(this.wellDetails.wellbores);
        await Promise.all(
          this.wellbores.map(async (well) => {
            this.selectedWellbore = well;
            await this.fetchObjects(well);
          })
        );
      }
      this.selectedWellbore = this.wellbores[0];
      if (!Array.isArray(this.jobdetails.DepthLogs)) {
        this.jobdetails['DepthLogs'] = [];
      }
      this.OtherObjects = [
        ...(this.jobdetails.WbGeometries?.map((ele: ObjectTypeOther) => ({ ...ele, Type: ObjectTypes.WbGeometry })) || []),
        ...(this.jobdetails.BHARun?.map((ele: ObjectTypeOther) => ({ ...ele, Type: ObjectTypes.BhaRun })) || []),
        ...(this.jobdetails.FluidReport?.map((ele: ObjectTypeOther) => ({ ...ele, Type: ObjectTypes.FluidReport })) || []),
        ...(this.jobdetails.Rigs?.map((ele: ObjectTypeOther) => ({ ...ele, Type: ObjectTypes.Rig })) || []),
      ];
      this.logDetailsList = [...(this.jobdetails.DepthLogs || []), ...(this.jobdetails.TimebaseLogs || [])];

      this.loading = false;
    },
    methods: {
      addWellbore() {
        this.addWellborePopup = true;
      },
      closePopup() {
        this.addWellborePopup = false;
      },
      openDeleteConfirmation(id: string) {
        this.confirmText = 'Delete';
        this.wellId = id;
        this.showDeleteConfirmation = true;
      },
      closeDeleteConfirmation() {
        this.showDeleteConfirmation = false;
      },
      emitConfirmDelete() {
        this.showDeleteConfirmation = false;
        this.removeWellbores();
      },
      async saveJob() {
        this.loading = true;
        this.jobdetails.SourceId = this.wellDetails.sourceId;
        this.jobdetails.Wellbores = this.wellboresJob;
        this.jobdetails.Transfer.AllWbGeometry = this.jobdetails.Transfer.AllRigs;
        this.jobdetails.Transfer.AllBhaRun = this.jobdetails.Transfer.AllRigs;
        this.jobdetails.Transfer.AllFluidsReport = this.jobdetails.Transfer.AllRigs;
        this.jobdetails.Transfer.AllCementJob = this.jobdetails.Transfer.AllRigs;
        this.jobdetails.Transfer.AllCementJob = this.jobdetails.Transfer.AllRigs;
        this.jobdetails.Transfer.AllFormationMarker = this.jobdetails.Transfer.AllRigs;
        this.jobdetails.Transfer.AllTubular = this.jobdetails.Transfer.AllRigs;
        if (this.jobId) {
          this.jobdetails.Wellbores = this.wellboresJob;
          await Api.patch('synchronizers/job/' + this.jobId, JSON.parse(JSON.stringify(this.jobdetails)));
        } else {
          await Api.submit('synchronizers/job', JSON.parse(JSON.stringify(this.jobdetails)));
        }
        this.loading = false;
      },
      async wellboreSelect(item: IWellbores[]) {
        if (!item || item.length === 0) {
          return;
        }
        const existingUids = this.wellbores.map((w) => w.WellboreUid);
        const duplicateItems = item.filter((i) => existingUids.includes(i.WellboreUid));
        const newItems = item.filter((i) => !existingUids.includes(i.WellboreUid));
        if (duplicateItems.length > 0) {
          const names = duplicateItems.map((d) => d.WellboreName || d.WellboreUid).join(', ');
          store.showToast(ToastType.WARN, `Wellbore(s) ${names} already exist.`);
        }
        this.wellbores = [...newItems, ...this.wellbores];
        localStorage.setItem('selectedWells', JSON.stringify({ sourceId: this.wellDetails.sourceId, wellbores: this.wellbores }));
        if (newItems.length > 0) {
          this.loading = true;
          await Promise.all(
            newItems.map(async (well) => {
              await this.fetchObjects(well);
            })
          );
          this.selectedWellbore = this.wellbores[0];
          if (!Array.isArray(this.jobdetails.DepthLogs)) {
            this.jobdetails['DepthLogs'] = [];
          }
          this.OtherObjects = [
            ...(this.jobdetails.WbGeometries || []),
            ...(this.jobdetails.BHARun || []),
            ...(this.jobdetails.FluidReport || []),
            ...(this.jobdetails.Rigs || []),
          ];
          this.logDetailsList = [...(this.jobdetails.DepthLogs || []), ...(this.jobdetails.TimebaseLogs || [])];
          this.loading = false;
        }
        this.wellboresJob = this.formateWellboreData(this.wellbores);
        this.closePopup();
      },
      removeWellbores() {
        this.wellbores = this.wellbores.filter((well) => well.WellboreUid !== this.wellId);
        localStorage.setItem('selectedWells', JSON.stringify({ sourceId: this.wellDetails.sourceId, wellbores: this.wellbores }));
        this.wellboresJob = this.formateWellboreData(this.wellbores);
        this.showDeleteConfirmation = false;
      },
      async fetchObjects(wellbore: IWellbores) {
        const respose = await Api.submit('synchronizers/object/all', this.sourceData(wellbore));
        this.jobdetails.WbGeometries = this.mergeWithDedup(
          this.jobdetails.WbGeometries,
          await this.mapResponse(respose[ObjectNames.WBGEOMETRY], ObjectNames.WBGEOMETRY)
        );
        this.jobdetails.BHARun = this.mergeWithDedup(
          this.jobdetails.BHARun,
          await this.mapResponse(respose[ObjectNames.BHARUNS], ObjectNames.BHARUNS)
        );
        this.jobdetails.FluidReport = this.mergeWithDedup(
          this.jobdetails.FluidReport,
          await this.mapResponse(respose[ObjectNames.FLUIDREPORTS], ObjectNames.FLUIDREPORTS)
        );
        this.jobdetails.Rigs = this.mergeWithDedup(this.jobdetails.Rigs, await this.mapResponse(respose[ObjectNames.RIGS], ObjectNames.RIGS));
        this.jobdetails.Trajectories = this.mergeWithDedup(
          this.jobdetails.Trajectories,
          await this.mapResponse(respose[ObjectNames.TRAJECTORIES], ObjectNames.TRAJECTORIES)
        );
        this.jobdetails.MudLogs = this.mergeWithDedup(
          this.jobdetails.MudLogs,
          await this.mapResponse(respose[ObjectNames.MUDLOGS], ObjectNames.MUDLOGS)
        );
        const mappedLogList = await this.mapResponse(respose[ObjectNames.LOGCURVES], ObjectNames.LOGCURVES);
        const depthLogs: DepthLog[] = [];
        const timebaseLogs: TimebaseLog[] = [];
        mappedLogList?.forEach((ele) => {
          const logWithTemplate = {
            ...ele,
            TemplateReferenceID: 'TemplateReferenceID' in ele ? ele.TemplateReferenceID : '',
          };
          if ('StartIndexInft' in ele && ele.StartIndexInft !== undefined) {
            depthLogs.push(logWithTemplate as DepthLog);
          } else if ('StartIndex' in ele && ele.StartIndex !== undefined) {
            timebaseLogs.push(logWithTemplate as TimebaseLog);
          }
        });
        this.jobdetails.DepthLogs = this.mergeWithDedup(this.jobdetails.DepthLogs, depthLogs) as DepthLog[];
        this.jobdetails.TimebaseLogs = this.mergeWithDedup(this.jobdetails.TimebaseLogs, timebaseLogs) as TimebaseLog[];
      },
      mergeWithDedup(
        existing: ObjectTypeOther[] | DepthLog[] | TimebaseLog[],
        incoming: ObjectTypeOther[] | DepthLog[] | TimebaseLog[]
      ): ObjectTypeOther[] | DepthLog[] | TimebaseLog[] {
        return existing && existing.length > 0 ? [...existing, ...this.removeDuplicateTargetName(existing, incoming)] : incoming;
      },
      removeDuplicateTargetName(
        CurrentArray: ObjectTypeOther[] | DepthLog[] | TimebaseLog[],
        commingArray: ObjectTypeOther[] | DepthLog[] | TimebaseLog[]
      ): ObjectTypeOther[] | DepthLog[] | TimebaseLog[] {
        const targetNames = new Set(CurrentArray.map((item) => item.TargetName));
        return commingArray.filter((item) => !targetNames.has(item.TargetName));
      },
      async mapResponse(
        response: (IBharuns | IFluidReports | IWBgeometrys | IRigs | LogEntry | ITrajectories | IMudLogs)[],
        type: ObjectNames
      ): Promise<DepthLog[] | TimebaseLog[] | ObjectTypeOther[]> {
        const uniqueResponse = response?.filter((item, index, self) => {
          const name = 'Name' in item ? item.Name : 'ObjectName' in item ? item.ObjectName : index;
          return index === self.findIndex((i) => ('Name' in i ? i.Name : 'ObjectName' in i ? i.ObjectName : i) === name);
        });
        return uniqueResponse?.map((item) => {
          if (type === ObjectNames.LOGCURVES) {
            return {
              ObjectUid: 'Uuid' in item ? (item.Uuid as string) : '',
              ObjectName: 'Name' in item ? item.Name : '',
              TargetUID: 'Uuid' in item ? (item.Uuid as string) : '',
              TargetName: 'Name' in item ? item.Name : '',
              TemplateReferenceID: '',
              TemplateReferenceName: '',
              ...(item && 'IndexType' in item && item.IndexType === IndexTypes.Depth
                ? { StartIndexInft: item.StartIndex || 0 }
                : 'StartIndex' in item
                  ? { StartIndex: item.StartIndex || 0 }
                  : {}),
              CurveMaps:
                'LogCurveInfos' in item
                  ? (item.LogCurveInfos as LogCurveInfo[]).map((curve: LogCurveInfo) => ({
                      SourceCurveName: curve.Mnemonic,
                      SourceUnit: curve.Uom || '',
                      TargetCurveName: curve.Mnemonic,
                      TargetAlias: curve.MnemAlias,
                      TargetUid: curve.Uuid,
                      TargetUnit: curve.Uom,
                      UnitType: curve.SourceUom || '',
                      DataType: curve.DataType,
                      Description: curve.Description,
                    }))
                  : [],
            };
          } else {
            return {
              ObjectUid: 'ObjectUid' in item ? (item.ObjectUid as string) : '',
              ObjectName: 'ObjectName' in item ? item.ObjectName : '',
              TargetUID: 'ObjectUid' in item ? (item.ObjectUid as string) : '',
              TargetName: 'ObjectName' in item ? item.ObjectName : '',
              Type: type,
            };
          }
        });
      },
      sourceData(wellbore: IWellbores) {
        return {
          ObjectId: '',
          WellId: wellbore.WellUid,
          WellboreId: wellbore.WellboreUid,
          SourceId: this.wellDetails.sourceId,
          Server: this.jobdetails.Source,
        };
      },
      formateWellboreData(wellbore: IWellbores[]): WellboreDetails[] {
        return wellbore.map((well) => {
          const WellboreData: WellboreDetails = {
            Source: {
              NameWell: well.WellName,
              NameWellbore: well.WellboreName,
              UidWell: well.WellUid,
              UidWellbore: well.WellboreUid,
            },
            Target: {
              SameAsSource: true,
              NameWell: well.WellName,
              NameWellbore: well.WellboreName,
              UidWell: well.WellUid,
              UidWellbore: well.WellboreUid,
            },
          };
          return WellboreData;
        });
      },
      closeTargetPopup() {
        this.showTargetPopup = false;
      },
      openTargetPopup() {
        this.showTargetPopup = true;
      },
      emitTargetPopup(targetData: TargetStructure) {
        this.jobdetails.Target = targetData;
        this.closeTargetPopup();
      },
    },
  });
</script>

<style scoped>
  .organization-view svg {
    color: var(--icon-secondary);
    cursor: pointer;
  }
  .organization-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .table-header {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 40px;
  }

  .table-actions {
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
    justify-content: space-between;
  }

  .icon {
    margin-right: 5px;
    vertical-align: middle;
    color: var(--text-tertiary);
  }

  .search-input-container {
    position: relative;
    width: 80%;
  }

  .search-input {
    width: 100%;
    padding: 0.4rem 2.5rem 0.4rem 1rem;
    border: 1px solid var(--border-tertiary);
    background-color: var(--bg-septenary);
    border-radius: 4px;
    height: 36px;
    box-sizing: border-box;
    outline: none;
  }
  .icon-wrapper {
    display: flex;
    gap: 15px;
    align-items: center;
    justify-content: end;
  }

  .align-header-center {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-val {
    display: flex;
    gap: 5px;
    border: 2px solid var(--border-tertiary);
    border-radius: 4px;
    padding: 0.4rem 2.5rem 0.4rem 1rem;
    width: 100%;
  }

  .content-wrapper {
    border: 2px solid var(--border-tertiary);
    border-radius: 5px;
    height: calc(100% - 40px);
  }

  .overflow-hidden {
    overflow: hidden;
  }

  .sidebar {
    min-width: 200px;
    border-right: 1px solid var(--border-tertiary);
  }

  .create-job-container {
    background: var(--bg-app);
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
  }

  .create-job-header-wrapper {
    display: flex;
    align-items: center;
    padding: 0 25px;
    gap: 10px;
    height: 50px;
  }

  .create-job-body-wrapper {
    background: var(--bg-app);
    overflow-y: auto;
    padding: 8px;
  }

  .create-job-footer-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .inner-card {
    width: 200px;
    padding: 10px;
    border-radius: 12px;
    text-align: center;
    background-color: var(--bg-septenary);
    position: relative;
    border: 2px solid transparent;
    border-color: var(--border-tertiary);
    cursor: pointer;
  }

  .inner-details {
    color: var(--text-senary);
  }

  .status {
    color: var(--text-tertiary);
  }

  .timestamp {
    padding-top: 8px;
    color: var(--text-senary);
  }

  .inner-card-container {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-direction: column;
  }

  .inner-card.active {
    border-color: var(--bg-primary);
  }

  .btn-width {
    width: 100%;
  }

  .icons {
    position: absolute;
    top: 5px;
    right: 10px;
    display: flex;
    color: var(--bg-primary);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.2s ease-in-out,
      visibility 0.2s ease-in-out,
      transform 0.2s ease-in-out;
    cursor: pointer;
  }

  .inner-card:hover .icons {
    opacity: 1;
    visibility: visible;
  }

  .create-job-right-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    background-color: var(--bg-app);
    padding: 15px 1rem;
    gap: 10px;
  }

  .create-job-right-header {
    display: flex;
    height: 35px;
    margin-bottom: 5px;
    height: 30px;
  }

  .create-job-right-header-box {
    display: flex;
    gap: 5px;
    border: 1px solid var(--border-tertiary);
    background-color: var(--bg-septenary);
    border-radius: 5px;
  }

  .tab-item {
    padding: 8px 0;
    position: relative;
    cursor: pointer;
    text-align: center;
  }

  .tab-box {
    padding: 8px 0;
    width: 100%;
    align-items: center;
    gap: 50px;
    padding-left: 30px;
  }

  /* log area css copy */

  .create-right-table-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }

  .panel-sidebar {
    width: 20%;
    min-width: 200px;
    border-right: 1px solid var(--border-tertiary);
  }

  .right-panel-container {
    display: flex;
    flex: 1;
    height: 100%;
    background-color: var(--bg-app);
    gap: 10px;
  }

  .create-job-panel-container {
    background-color: var(--bg-septenary);
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
  }

  .create-job-panel-header-wrapper {
    display: flex;
    align-items: center;
    padding: 0 25px;
    height: 50px;
  }

  .create-job-body-panel-wrapper {
    background: var(--bg-app);
    overflow-y: auto;
  }

  .log-list {
    flex-grow: 1;
    overflow-y: auto;
    background-color: var(--bg-septenary);
  }

  .log-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
  }

  .log-item:hover {
    background: var(--text-primary);
  }

  .log-item.active {
    background: var(--bg-primary);
  }

  .log-item svg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .panel-wrapper {
    border: 2px solid var(--border-tertiary);
    border-radius: 5px;
  }

  .popup-fields {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem 1rem;
  }

  .field {
    gap: 0.5rem;
  }

  .field-label {
    flex: 0 0 95px;
    text-align: left;
  }

  .field-input {
    flex: 1;
    padding: 0.6rem;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--bg-form-input);
  }

  select {
    border: none;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
  }

  .Tabs-component {
    height: 100%;
    overflow-y: auto;
  }
</style>
