<template>
  <div class="rig-scheduler-wrapper">
    <!-- ZOOM BUTTONS -->
    <div class="toolbar">
      <button v-for="option in zoomOptions" :key="option" :class="['btn', 'sm', 'fontMedium', { active: zoom === option }]" @click="setZoom(option)">
        {{ option }}
      </button>
    </div>

    <div class="timeline-container">
      <!-- LEFT COLUMN: Rig Names -->
      <div class="rig-names-column">
        <div class="rig-name-header fontMedium fontSize-12 text-tertiary">Rig Name</div>
        <div ref="rigNamesScroll" class="rig-names-scroll">
          <div
            v-for="rig in chartData"
            :key="rig.RigId"
            class="rig-name-row fontNormal fontSize-12 text-tertiary"
            :style="{ height: rowPx(rig.RowData) }">
            <span>{{ rig.Name }}</span>
            <SvgIcon name="close-icon" class="svg-icon size9 text-tertiary rig-close" @click="removeRig(rig.RigId)" />
          </div>
        </div>
      </div>

      <!-- CENTER COLUMN -->
      <div class="timeline-content">
        <div ref="timelineScroll" class="timeline-scroll">
          <!-- Month headers -->
          <div class="calendar-group-header">
            <div class="month-grid">
              <div
                v-for="group in groupLayout"
                :key="group.i"
                class="month-header fontMedium fontSize-12 text-tertiary"
                :style="{ flex: group.span }">
                {{ group.label }}
              </div>
            </div>
          </div>

          <!-- Day headers + nav arrows -->
          <div class="calendar-header-with-arrows">
            <div class="arrow left" @click="shiftTimeline(-1)">←</div>
            <div ref="calendarDaysContainer" class="calendar-days-container">
              <GridLayout
                class="calendar-days-grid"
                :layout="headerLayout"
                :col-num="totalCols"
                :row-height="headerRowHeight"
                :margin="[0, 0]"
                :is-draggable="false"
                :is-resizable="false"
                :use-css-transforms="false">
                <GridItem
                  v-for="item in headerLayout"
                  :key="item.i"
                  v-bind="item"
                  class="calendar-day-grid-item fontNormal fontSize-11 text-tertiary">
                  {{ item.label }}
                </GridItem>
              </GridLayout>
            </div>
            <div class="arrow right" @click="shiftTimeline(1)">→</div>
          </div>

          <!-- Rig rows -->
          <div class="rig-rows">
            <div
              v-for="rig in chartData"
              :key="rig.RigId"
              class="rig-row"
              :style="{ height: rowPx(rig.RowData) }"
              @dragover.prevent
              @drop="handleDropOnRig(rig.RigId, $event)">
              <!-- 1) Tower headers, spanning all wells in this rig -->
              <GridLayout
                class="tower-layout"
                :layout="getTowerGroups(rig)"
                :col-num="totalCols"
                :row-height="towerRowHeight"
                :margin="[2, 2]"
                :is-draggable="false"
                :is-resizable="false"
                :use-css-transforms="false">
                <GridItem v-for="g in getTowerGroups(rig)" :key="g.i" v-bind="g" class="tower-group">
                  {{ g.towerId }}
                </GridItem>
              </GridLayout>

              <!-- 2) Well-cards, stacked directly below -->
              <GridLayout
                v-model:layout="rig.RowData"
                class="grid-layout"
                :col-num="totalCols"
                :row-height="rowHeight"
                :margin="[2, 2]"
                :is-draggable="true"
                :is-resizable="true"
                :is-bounded="true"
                :prevent-collision="true"
                :use-css-transforms="false"
                @layout-updated="(newL) => onLayoutChanged(rig.RigId, newL)">
                <GridItem
                  v-for="item in rig.RowData"
                  :key="item.i"
                  v-bind="item"
                  class="grid-item"
                  @mouseenter="onWellMouseEnter($event, item)"
                  @mouseleave="onWellMouseLeave">
                  <div class="well-card">
                    <!-- title + icons -->
                    <div class="well-card__header">
                      <span class="well-card__title">{{ item.WellName }}</span>
                      <div class="well-card__icons">
                        <SvgIcon name="rig-icon" class="svg-icon size16" />
                        <SvgIcon name="close-icon" class="svg-icon size16" @click.stop="removeWell(rig.RigId, item)" />
                      </div>
                    </div>
                    <!-- 4-row body -->
                    <div class="well-card__body grid-3">
                      <!-- row 1 -->
                      <div class="row">
                        <div>{{ item.properties.surfaceStatus || '–' }}</div>
                        <div>{{ item.properties.planDuration ?? '–' }}</div>
                        <div>{{ item.properties.targetReservoirZone || '–' }}</div>
                      </div>
                      <!-- row 2 -->
                      <div class="row remark">
                        <div></div>
                        <div>{{ item.properties.remarks || '–' }}</div>
                        <div></div>
                      </div>
                      <!-- row 3 -->
                      <div class="row">
                        <div>{{ item.properties.slotNumber ?? '–' }}</div>
                        <div class="dot"></div>
                        <div>{{ item.properties.totalDepth ?? '–' }}</div>
                      </div>
                      <!-- row 4 -->
                      <div class="row">
                        <div>{{ item.properties.waterDepth ?? '–' }}</div>
                        <div>{{ item.properties.wellTypeCode || '–' }}</div>
                        <div>{{ item.properties.completionType || '–' }}</div>
                      </div>
                    </div>
                  </div>
                </GridItem>
              </GridLayout>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- tooltip -->
    <div v-if="hoverItem" ref="tooltip" class="well-tooltip" :style="{ top: hoverPos.y + 'px', left: hoverPos.x + 'px' }">
      <h3>{{ hoverItem.item.WellName }}</h3>
      <ul>
        <li>
          <strong>Scenario Reference:</strong>
          {{ hoverItem.props.referenceDate }}
        </li>
        <li>
          <strong>Commence Date:</strong>
          {{ formatDate(hoverItem.props.commenceDate) }}
        </li>
        <li>
          <strong>End Date:</strong>
          {{ formatDate(hoverItem.props.endDate) }}
        </li>
        <li>
          <strong>Company:</strong>
          {{ hoverItem.props.company }}
        </li>
        <li>
          <strong>Operator:</strong>
          {{ hoverItem.props.operator }}
        </li>
        <li>
          <strong>Concession:</strong>
          {{ hoverItem.props.concession }}
        </li>
        <li>
          <strong>Field Name (Code):</strong>
          {{ hoverItem.props.fieldName }}
        </li>
        <li>
          <strong>Tower/Pad:</strong>
          {{ hoverItem.props.towerId }}
        </li>
        <li>
          <strong>Well Type (Code):</strong>
          {{ hoverItem.props.wellTypeCode }}
        </li>
        <!-- add more fields as needed -->
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType, nextTick } from 'vue';
  import { GridLayout, GridItem } from 'grid-layout-plus';
  import { Api } from '@/services/api.services';
  interface Rig {
    RowData: Array<{
      x: number;
      w: number;
      properties: Record<string, any>;
    }>;
  }

  export default defineComponent({
    name: 'RigSchedulerChart',
    components: { GridLayout, GridItem },

    props: {
      /**
       * initialRigs: [
       *   {
       *     RigId: string,
       *     RigName: string,
       *     AssignedWells?: [
       *       { WellId: string, WellName: string, StartDate: number, EndDate: number },
       *       …
       *     ]
       *   },
       *   …
       * ]
       */
      initialRigs: {
        type: Array as PropType<
          Array<{
            RigId: string;
            RigName: string;
            ContractStart?: string;
            ContractEnd?: string;
            Description?: string;
            AssignedWells?: Array<{
              WellId: string;
              WellName: string;
              StartDate: number;
              EndDate: number;
            }>;
          }>
        >,
        default: () => [],
      },
      /**
       * scenarioId is used for all API calls:
       *   DELETE /scenarios/:scenarioId/rigs/:rigId
       *   DELETE /scenarios/:scenarioId/rigs/:rigId/wells/:wellId
       */
      scenarioId: {
        type: String,
        required: true,
      },
    },

    data() {
      const zoom = 'Months';
      return {
        towerRowHeight: 30,
        zoom,
        zoomOptions: ['Months', '3 Months', '6 Months', 'Years'] as string[],

        // pixel width of each day-column (updates on zoom change)
        cellWidth: this.getCellWidth(zoom),

        monthOffset: 0, // how many months we have panned

        rowHeight: 220, // px height of each rig row
        headerRowHeight: 30, // px height of the day-header

        chartData: [] as Array<{
          RigId: string;
          Name: string;
          RowData: Array<{
            i: string;
            WellName: string;
            x: number;
            y: number;
            w: number;
            h: number;
            BgColor: string;
            /** ← new: */
            properties: Record<string, any>;
          }>;
        }>,

        availableDates: [] as Date[],
        headerLayout: [] as any[],
        groupLayout: [] as Array<{ i: string; span: number; label: string }>,
        hoverItem: null as null | { item: any; props: Record<string, any> },
        hoverPos: { x: 0, y: 0 },
      };
    },

    computed: {
      totalCols(): number {
        return this.availableDates.length;
      },
    },

    watch: {
      // Whenever initialRigs changes, rebuild chartData
      initialRigs: {
        handler() {
          this.initializeChartData();
        },
        deep: true,
        immediate: true,
      },
      // If availableDates changes (zoom, pan), rebuild chartData
      availableDates: {
        handler() {
          this.initializeChartData();
        },
      },
    },

    created() {
      // Build the timeline axes for the first time
      Object.assign(this, this.generateLayoutData(this.zoom, this.cellWidth, 0));
      // Build chartData from initialRigs
      this.initializeChartData();
    },

    mounted() {
      const timeline = this.$refs.timelineScroll as HTMLElement | undefined;
      const names = this.$refs.rigNamesScroll as HTMLElement | undefined;
      if (timeline && names) {
        timeline.addEventListener('scroll', () => {
          names.scrollTop = timeline.scrollTop;
        });
      }
    },

    methods: {
      // --------------------------------------------------
      // 1) Build chartData from initialRigs + AssignedWells
      // --------------------------------------------------
      initializeChartData() {
        this.chartData = this.initialRigs.map((r) => {
          const rigId = r.RigId.toString();
          const base: {
            RigId: string;
            Name: string;
            RowData: Array<{
              i: string;
              WellName: string;
              x: number;
              y: number;
              w: number;
              h: number;
              BgColor: string;
              properties: Record<string, any>;
            }>;
          } = {
            RigId: rigId,
            Name: r.RigName,
            RowData: [],
          };

          if (Array.isArray((r as any).AssignedWells)) {
            (r as any).AssignedWells.forEach((w: any) => {
              const sd = new Date(w.StartDate);
              const ed = new Date(w.EndDate);
              // Find indices in availableDates[]
              const startIndex = this.availableDates.findIndex(
                (d) => d.getUTCFullYear() === sd.getUTCFullYear() && d.getUTCMonth() === sd.getUTCMonth() && d.getUTCDate() === sd.getUTCDate()
              );
              const endIndex = this.availableDates.findIndex(
                (d) => d.getUTCFullYear() === ed.getUTCFullYear() && d.getUTCMonth() === ed.getUTCMonth() && d.getUTCDate() === ed.getUTCDate()
              );
              if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex) {
                base.RowData.push({
                  // “i” format: wb_<rigId>_<wellId>_<startIndex>
                  i: `wb_${rigId}_${w.WellId}_${startIndex}`,
                  WellName: w.WellName,
                  x: startIndex,
                  y: 0,
                  w: endIndex - startIndex + 1,
                  h: 1,
                  BgColor: '#FFD580',
                  properties: w.properties || {},
                });
              }
            });
          }

          return base;
        });
      },

      // --------------------------------------------------
      // 2) pixel width per day based on zoom
      // --------------------------------------------------
      getCellWidth(zoom: string): number {
        switch (zoom) {
          case 'Months':
            return 30;
          case '3 Months':
            return 13;
          case '6 Months':
            return 7;
          case 'Years':
            return 3;
          default:
            return 30;
        }
      },

      // --------------------------------------------------
      // 3) Change zoom level
      // --------------------------------------------------
      setZoom(zoom: string) {
        this.zoom = zoom;
        this.cellWidth = this.getCellWidth(zoom);
        this.monthOffset = 0;
        Object.assign(this, this.generateLayoutData(zoom, this.cellWidth, 0));
      },

      // --------------------------------------------------
      // 4) Pan timeline left/right
      // --------------------------------------------------
      shiftTimeline(step: number) {
        let monthStep = 1;
        if (this.zoom === '3 Months') monthStep = 3;
        else if (this.zoom === '6 Months') monthStep = 6;
        else if (this.zoom === 'Years') monthStep = 12;

        this.monthOffset += step * monthStep;
        Object.assign(this, this.generateLayoutData(this.zoom, this.cellWidth, this.monthOffset));
      },

      // --------------------------------------------------
      // 5) Build availableDates[], headerLayout[], groupLayout[]
      // --------------------------------------------------
      generateLayoutData(zoom: string, cellWidth: number, monthOffset = 0) {
        // Start from “today,” snap to first of month UTC
        const base = new Date();
        base.setUTCDate(1);
        base.setUTCHours(0, 0, 0, 0);
        base.setUTCMonth(base.getUTCMonth() + monthOffset);

        const availableDates: Date[] = [];
        const headerLayout: any[] = [];
        const groupLayout: Array<{ i: string; span: number; label: string }> = [];

        const monthsToGenerate = zoom === 'Months' ? 1 : zoom === '3 Months' ? 3 : zoom === '6 Months' ? 6 : 12;

        let colIndex = 0;
        for (let m = 0; m < monthsToGenerate; m++) {
          const date = new Date(base);
          date.setUTCMonth(base.getUTCMonth() + m);
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth();
          const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
          const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });

          if (zoom === 'Months') {
            for (let d = 1; d <= daysInMonth; d++) {
              availableDates.push(new Date(Date.UTC(year, month, d)));
              headerLayout.push({
                i: colIndex.toString(),
                x: colIndex,
                y: 0,
                w: 1,
                h: 1,
                label: d.toString(),
              });
              colIndex++;
            }
            groupLayout.push({ i: label, span: daysInMonth, label });
          } else {
            const startCol = colIndex;
            for (let d = 1; d <= daysInMonth; d++) {
              availableDates.push(new Date(Date.UTC(year, month, d)));
              colIndex++;
            }
            headerLayout.push({
              i: startCol.toString(),
              x: startCol,
              y: 0,
              w: daysInMonth,
              h: 1,
              label: `1 - ${daysInMonth}`,
            });
            groupLayout.push({ i: label, span: daysInMonth, label });
          }
        }

        this.availableDates = availableDates;
        this.headerLayout = headerLayout;
        this.groupLayout = groupLayout;
        return { availableDates, headerLayout, groupLayout };
      },

      // --------------------------------------------------
      // 6) Handle dropping a new well onto a rig
      // --------------------------------------------------
      async handleDropOnRig(rigId: string, event: DragEvent) {
        event.preventDefault();
        const json = event.dataTransfer?.getData('application/json');
        if (!json) return;

        let payload: { WellId: string; WellName: string; properties: Record<string, any> };
        try {
          payload = JSON.parse(json);
        } catch {
          return;
        }

        const containerEl = this.$refs.calendarDaysContainer as HTMLElement;
        if (!containerEl) return;
        const rect = containerEl.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        let startIndex = Math.floor(offsetX / this.cellWidth);
        if (startIndex < 0) startIndex = 0;
        if (startIndex > this.availableDates.length - 1) {
          startIndex = this.availableDates.length - 1;
        }

        const span = 11;
        const sDateUTC = this.availableDates[startIndex].getTime();
        const endColumn = Math.min(startIndex + span - 1, this.availableDates.length - 1);
        const eDateUTC = this.availableDates[endColumn].getTime();

        // Call server to assign
        try {
          await Api.patch(`scenarios/${this.scenarioId}/rigs/${rigId}/wells`, {
            WellId: payload.WellId,
            WellName: payload.WellName,
            StartDate: sDateUTC,
            EndDate: eDateUTC,
            properties: payload.properties,
          });
        } catch (err) {
          console.error('Failed to assign well to rig in backend', err);
          return;
        }

        // Immediately show new block
        const targetRig = this.chartData.find((r) => r.RigId === rigId);
        if (!targetRig) return;
        const newBlockId = `wb_${rigId}_${payload.WellId}_${Date.now()}`;
        targetRig.RowData.push({
          i: newBlockId,
          WellName: payload.WellName,
          x: startIndex,
          y: 0,
          w: span,
          h: 1,
          BgColor: '#FFD580',
          properties: payload.properties,
        });
      },

      // --------------------------------------------------
      // 7) When a block is dragged/resized, update its dates
      // --------------------------------------------------
      async onLayoutChanged(rigId: string, newLayout: any[]) {
        for (const item of newLayout) {
          const parts = item.i.split('_');
          if (parts.length < 3) continue;
          const wellId = parts[2];
          const x = item.x as number;
          const w = item.w as number;
          if (x == null || w == null) continue;

          const sdDate = this.availableDates[x];
          const edColumn = Math.min(x + w - 1, this.availableDates.length - 1);
          const edDate = this.availableDates[edColumn];
          if (!sdDate || !edDate) continue;

          const StartDate = sdDate.getTime();
          const EndDate = edDate.getTime();

          try {
            await Api.patch(`scenarios/${this.scenarioId}/rigs/${rigId}/wells/${wellId}`, {
              StartDate,
              EndDate,
            });
          } catch (err) {
            console.error(`Failed to update well ${wellId} on rig ${rigId}`, err);
          }
        }
      },

      // --------------------------------------------------
      // 8) Remove (DELETE) a single well from one rig
      // --------------------------------------------------
      async removeWell(rigId: string, item: { i: string }) {
        const parts = item.i.split('_');
        if (parts.length < 3) return;
        const wellId = parts[2];

        try {
          // Call Api.delete with base = 'scenarios/.../rigs/.../wells' and id = wellId
          await Api.delete(`scenarios/${this.scenarioId}/rigs/${rigId}/wells`, wellId);
          // Remove locally
          const rigIndex = this.chartData.findIndex((r) => r.RigId === rigId);
          if (rigIndex >= 0) {
            this.chartData[rigIndex].RowData = this.chartData[rigIndex].RowData.filter((w) => w.i !== item.i);
          }
        } catch (err) {
          console.error(`Failed to remove well ${wellId} from rig ${rigId}`, err);
        }
      },

      // --------------------------------------------------
      // Remove (DELETE) an entire rig
      // --------------------------------------------------
      async removeRig(rigId: string) {
        try {
          // Call Api.delete with base = 'scenarios/.../rigs' and id = rigId
          await Api.delete(`scenarios/${this.scenarioId}/rigs`, rigId);
          // Remove locally
          this.chartData = this.chartData.filter((r) => r.RigId !== rigId);
        } catch (err) {
          console.error(`Failed to delete rig ${rigId}`, err);
        }
      },
      onWellMouseEnter(ev: MouseEvent, item: any) {
        // first set the raw position & item
        this.hoverPos = { x: ev.clientX + 10, y: ev.clientY + 10 };
        this.hoverItem = { item, props: item.properties };

        // next tick: measure tooltip height, and flip if it would overflow
        nextTick(() => {
          const tip = this.$refs.tooltip as HTMLElement;
          if (tip) {
            const tipHeight = tip.offsetHeight;
            // if bottom of tooltip would go past viewport, show it above
            if (ev.clientY + 10 + tipHeight > window.innerHeight) {
              this.hoverPos.y = ev.clientY - 10 - tipHeight;
            }
          }
        });
      },
      onWellMouseLeave() {
        this.hoverItem = null;
      },
      formatDate(ms: number) {
        return ms ? new Date(ms).toLocaleDateString() : '–';
      },
      rowsNeeded(rowData: Array<{ y: number; h: number }>) {
        if (!rowData.length) return 1;
        const max = Math.max(...rowData.map((w) => (w.y || 0) + (w.h || 1)));
        return max;
      },
      rowPx(rowData: Array<{ y: number; h: number }>) {
        const r = this.rowsNeeded(rowData);
        return r * this.rowHeight + (r - 1) * 4 + 'px';
      },
      getTowerGroups(rig: Rig) {
        const map: Record<string, { x: number; end: number }> = {};
        rig.RowData.forEach((w) => {
          const t = w.properties.towerId;
          if (!t) return;
          const start = w.x,
            end = w.x + w.w;
          if (!map[t]) map[t] = { x: start, end };
          else {
            map[t].x = Math.min(map[t].x, start);
            map[t].end = Math.max(map[t].end, end);
          }
        });
        return Object.entries(map).map(([towerId, { x, end }]) => ({
          i: `tower_${towerId}`,
          x,
          y: 0,
          w: end - x,
          h: 1,
          towerId,
        }));
      },
    },
  });
</script>

<style scoped>
  /* -------------------------------------------------
   OUTER CONTAINERS & ZOOM TOOLBAR
   ------------------------------------------------- */
  .rig-scheduler-wrapper {
    font-family: var(--font-base, 'OpenSans-Regular');
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-bottom: 1px solid #ccc;
  }

  .toolbar .btn.sm {
    padding: 4px 8px;
  }

  .toolbar .btn.active {
    background: #007bff;
    color: white;
  }

  .toolbar .btn {
    background: var(--bg-primary);
    border: 1px solid #aaa;
    color: var(--text-primary);
  }

  /* -------------------------------------------------
   TIMELINE LAYOUT
   ------------------------------------------------- */
  .timeline-container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* LEFT COLUMN: Rig Names */
  .rig-names-column {
    background: #f7f7f7;
    border-right: 1px solid #ccc;
    width: 120px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .rig-name-header {
    height: 60px;
    /* 30px month + 30px day */
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    background: #f7f7f7;
  }

  .rig-names-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* Hide scrollbar for WebKit-based browsers */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }

  .rig-names-scroll::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }

  .rig-name-row {
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid #ccc;
    background: #f7f7f7;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
    min-height: unset !important;
  }

  .rig-close {
    position: absolute;
    top: 4px;
    right: 6px;
    cursor: pointer;
  }

  /* RIGHT COLUMN: Calendar + Grid */
  .timeline-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .timeline-scroll {
    /* Set a fixed height or use 100% if parent is flex */
    height: 100%;
    max-height: 100%;
    overflow-y: auto; /* Enable vertical scroll */
    overflow-x: hidden;
    white-space: nowrap;
    position: relative;
    flex-grow: 1;
    /* Optional: add a background for clarity */
    background: #fff;
  }

  /* MONTH HEADER */
  .calendar-group-header {
    position: relative;
    height: 30px;
    background: #fff;
  }

  .month-grid {
    display: flex;
    margin: 0 30px;
    /* leave space for arrows */
    height: 100%;
    width: calc(100% - 60px);
  }

  .month-header {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-left: 1px solid #ccc;
    box-sizing: border-box;
  }

  /* DAY HEADER + NAVIGATION ARROWS */
  .calendar-header-with-arrows {
    display: flex;
    align-items: center;
    background: #00468b;
    height: 30px;
  }

  .arrow {
    width: 30px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: #00468b;
    color: white;
  }

  .arrow:hover {
    background: #003f7b;
  }

  .calendar-days-container {
    flex: 1;
    overflow: hidden;
  }

  .calendar-days-grid {
    background: #00468b;
    width: 100% !important;
  }

  .calendar-day-grid-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
    background-color: #2b61a4;
    color: white;
    flex: 1 1 0;
    max-width: none !important;
  }

  /* RIG ROWS */
  .rig-rows {
    display: flex;
    flex-direction: column;
    width: 100%;
    /* Remove overflow here, let .timeline-scroll handle it */
  }

  .rig-row {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #ccc;
    position: relative;
    overflow: visible !important;
    margin-bottom: 8px;
    min-height: unset !important;
    width: 100%;
  }

  .grid-layout {
    width: 100%;
  }

  /* WELL BLOCKS */
  .grid-item {
    padding: 4px;
    box-sizing: border-box;
    position: relative;
    overflow: visible !important;
    /* Ensure resize handle is visible */
    z-index: 2;
    /* Make sure it's above grid lines */
  }

  .well-close {
    position: absolute;
    top: 2px;
    right: 4px;
    cursor: pointer;
  }

  .grid-item .react-resizable-handle {
    display: block !important;
    width: 18px;
    /* Make it larger for easier grabbing */
    height: 18px;
    position: absolute;
    bottom: 2px;
    right: 2px;
    cursor: se-resize;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 3px;
    z-index: 10;
  }

  /* container */
  .tower-layout {
    display: block;
    margin-bottom: 4px;
  }

  .tower-group {
    background: #fafafa;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-bottom: none;
    font-weight: 600;
    box-sizing: border-box;
    text-align: left;
  }

  /* 2) Well card wrapper (+ small gap below towers) */
  .well-card {
    display: flex;
    flex-direction: column;
    background: #e8f5e9;
    border: 1px solid #ddd;
    border-top: none;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    overflow: visible !important;
    /* Allow handle to show */
  }

  .well-card__header {
    background: #a5d6a7;
    padding: 4px 8px;
    display: flex;
    align-items: center;
  }

  .well-card__title {
    flex: 1;
    text-align: center;
    font-weight: 600;
  }

  .well-card__icons {
    display: flex;
    gap: 4px;
  }

  /* body grid */
  .well-card__body {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto auto;
    row-gap: 4px;
    padding: 8px 8px 20px 8px;
    flex: 1;
    box-sizing: border-box;
    color: #333;
  }

  .stat-top-left {
    grid-column: 1;
    grid-row: 1;
    text-align: left;
  }

  .stat-top-right {
    grid-column: 3;
    grid-row: 1;
    text-align: right;
  }

  .middle-text {
    grid-column: 1 / 4;
    grid-row: 2;
    text-align: center;
    font-size: 12px;
  }

  .stat-bottom-left {
    grid-column: 1;
    grid-row: 3;
    text-align: left;
  }

  .pill {
    grid-column: 2;
    grid-row: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 12px;
    background: #2e7d32;
    color: #fff;
    font-size: 10px;
  }

  .pill-label {
    grid-column: 3;
    grid-row: 3;
    text-align: right;
    font-size: 10px;
    color: #555;
  }

  .tower-label {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    color: #333;
    /* position it over the top-left corner */
    position: absolute;
    top: 4px;
    left: 8px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
  }

  .tower-row {
    border: 1px solid #ddd;
    border-radius: 0;
    padding: 6px 8px;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .well-tooltip {
    position: fixed;
    z-index: 1000;
    max-width: 240px;
    background: #fff8e1;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .well-tooltip h3 {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  .well-tooltip ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.875rem;
  }

  .well-tooltip li {
    margin-bottom: 4px;
  }

  .well-tooltip li strong {
    display: inline-block;
    width: 140px;
  }

  .well-card__body.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    row-gap: 6px;
    text-align: center;
  }

  .well-card__body.grid-3 .row {
    display: contents;
  }

  .well-card__body.grid-3 .row.remark div {
    grid-column: span 3;
    color: #555;
  }

  .well-card__body.grid-3 .dot {
    width: 10px;
    height: 10px;
    background: #e74c3c;
    border-radius: 50%;
    margin: 0 auto;
  }

  .well-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    /* ensure it layers above grid lines */
    z-index: 1;
    margin-bottom: 8px;
    /* gap below this block */
  }

  .rig-row,
  .grid-item,
  .well-wrapper {
    overflow: visible !important;
  }
</style>
