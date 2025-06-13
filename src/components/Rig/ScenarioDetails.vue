<template>
  <div class="scenario-details-container full-size p10 fontNormal">
    <!-- Heading Bar -->
    <div class="heading-row d-flex justify-space-between align-center p10 fontSize-20">
      <div class="d-flex gap10 align-center">
        <!-- <SvgIcon name="drilling-icon" class="svg-icon size30 settings" /> -->
        <SvgIcon name="rig-icon" class="svg-icon size30 settings" />
        <span class="heading fontBold">{{ scenario.Name }}</span>
      </div>
      <CustomButton class="fontBold" :size="BtnSizes.SMALL" @click="showImportPopup = true">Import Rig</CustomButton>
    </div>

    <!-- Scheduler Chart: pass both the list of “importedRigs” and the scenarioId -->
    <div v-if="scenario.ScenarioId">
      <RigSchedulerChart :initialRigs="importedRigs" :scenarioId="scenario.ScenarioId.toString()" />
    </div>

    <!-- Import Popup -->
    <ImportRigPopup
      v-if="showImportPopup"
      :initialSelectedIds="importedRigs.map((r) => r.RigId)"
      @on-cancel="showImportPopup = false"
      @on-submit="handleRigImport" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CustomButton, { BtnSizes } from '@/components/Globals/CustomButton.vue';
  import ImportRigPopup from './ImportRigPopup.vue';
  import RigSchedulerChart from './RigSchedulerChart.vue';
  import { Api } from '@/services/api.services';
  import { IScenario, IRigItem } from '../../../server/interfaces/rigscheduler.interfaces';

  //
  // Define a “ChartRig” type where ContractStart/ContractEnd can only be `string | undefined`
  // (never `null`):
  //
  type ChartRig = {
    RigId: string;
    RigName: string;
    ContractStart?: string; // no `| null`
    ContractEnd?: string; // no `| null`
    Description?: string;
    AssignedWells?: Array<{
      WellId: string;
      WellName: string;
      StartDate: number;
      EndDate: number;
      properties: Record<string, any>;
    }>;
  };

  export default defineComponent({
    name: 'ScenarioDetails',
    components: {
      CustomButton,
      ImportRigPopup,
      RigSchedulerChart,
    },
    props: {
      scenario: {
        type: Object as PropType<IScenario>,
        required: true,
      },
    },
    data() {
      return {
        showImportPopup: false,
        //
        // importedRigs is now an array of ChartRig,
        // which forbids `null` in ContractStart/ContractEnd.
        //
        importedRigs: [] as ChartRig[],
        BtnSizes,
      };
    },
    watch: {
      scenario: {
        immediate: true,
        handler(s: IScenario) {
          if (Array.isArray(s.Rigs)) {
            this.importedRigs = s.Rigs.map((r) => {
              // Convert RigId (which might be Binary) to plain string
              const rigIdStr = r.RigId.toString();

              // Convert any null ContractStart/End to undefined
              const cs = r.ContractStart == null ? undefined : r.ContractStart;
              const ce = r.ContractEnd == null ? undefined : r.ContractEnd;

              // Map AssignedWells if present
              const assigned = Array.isArray((r as any).AssignedWells)
                ? (r as any).AssignedWells.map((w: any) => ({
                    WellId: w.WellId as string,
                    WellName: w.WellName as string,
                    StartDate: w.StartDate as number,
                    EndDate: w.EndDate as number,
                    properties: w.properties || {},
                  }))
                : [];

              return {
                RigId: rigIdStr,
                RigName: r.RigName,
                ContractStart: cs,
                ContractEnd: ce,
                Description: r.Description ?? '',
                AssignedWells: assigned,
              } as ChartRig;
            });
          } else {
            this.importedRigs = [];
          }
        },
      },
    },
    methods: {
      async handleRigImport(rigs: IRigItem[]) {
        // 1) Locally update importedRigs, converting possible nulls → undefined
        this.importedRigs = rigs.map((r) => {
          const rigIdStr = r.RigId.toString();
          const cs = r.ContractStart == null ? undefined : r.ContractStart;
          const ce = r.ContractEnd == null ? undefined : r.ContractEnd;

          return {
            RigId: rigIdStr,
            RigName: r.RigName,
            ContractStart: cs,
            ContractEnd: ce,
            Description: r.Description ?? '',
            AssignedWells: [], // not sending AssignedWells here
          } as ChartRig;
        });
        this.showImportPopup = false;

        // 2) Push the updated Rigs[] to backend (overwrite entire array)
        const payload = {
          rigs: rigs.map((r) => ({
            RigId: r.RigId.toString(),
            RigName: r.RigName,
            ContractStart: r.ContractStart ?? undefined,
            ContractEnd: r.ContractEnd ?? undefined,
            Description: r.Description ?? '',
          })),
        };

        try {
          await Api.patch(`scenarios/${this.scenario.ScenarioId}/rigs`, payload);
        } catch (err) {
          console.error('Error assigning rigs to scenario', err);
        }
      },
    },
  });
</script>

<style scoped>
  .scenario-details-container {
    border-radius: 8px;
    background: var(--bg-quaternary);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .heading-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    color: var(--text-tertiary);
  }

  .heading {
    font-size: 1.25rem;
  }

  .full-size {
    width: 100%;
    height: 100%;
  }

  .p10 {
    padding: 10px;
  }

  .fontNormal {
    font-family: 'OpenSans-Regular', Arial, sans-serif;
  }

  .fontBold {
    font-weight: 700;
  }

  .d-flex {
    display: flex;
  }

  .justify-space-between {
    justify-content: space-between;
  }

  .align-center {
    align-items: center;
  }

  .gap10 {
    gap: 10px;
  }

  .fontSize-20 {
    font-size: 1.25rem;
  }
</style>
