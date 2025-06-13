<template>
  <CommonPopup
    popup-title="Curve Selection"
    secondary-btn-text="Cancel"
    primary-btn-text="Select"
    :wrapper-style="{ width: '70%', height: '100%' }"
    :disabled-primary-bttn="singleSelectedChannels === -1"
    @on-cancel="closePopup"
    @on-submit="onSubmit">
    <div class="chatimport-header d-flex gap10 align-items-center justify-content-space-between">
      <span class="fontSemibold fontSize-12"></span>
      <div class="d-flex">
        <SearchInput v-model="filterInput" placeholder="Search Curves..." />
      </div>
    </div>
    <div class="chatimport-body d-flex flex-full scroll-auto p-relative">
      <LoadingIcon v-if="dataLoading" backdropColor="var(--popup-bg)" />
      <div v-if="!dataLoading" class="chatimport-table-wrapper scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th class="width15p">Comment</th>
              <th class="width15p">Curve</th>
              <th class="width15p">Channel Id</th>
              <th class="width20p">Channel Name</th>
              <th class="width15p">Index Type</th>
              <th class="width15p">UOM</th>
              <th class="width15p">Unit Type</th>
              <th class="width15p">Start index</th>
              <th class="width15p">End index</th>
              <th class="width15p">Log Name</th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-for="(item, index) in curvesFiltered" :key="index">
              <td>
                <input
                  v-model="singleSelectedChannels"
                  type="radio"
                  :value="item.ChannelInfo?.ChannelId"
                  :disabled="isRadioDisabled(item.ChannelInfo?.ChannelId)" />
              </td>
              <td>
                <input
                  v-model="selectedChannels"
                  type="checkbox"
                  :value="item.ChannelInfo?.ChannelId"
                  :checked="isSelected(item.ChannelInfo?.ChannelId)"
                  :disabled="isCheckboxDisabled(item.ChannelInfo?.ChannelId)" />
              </td>
              <td>
                <span class="d-inline-flex gap10">
                  <SvgIcon name="active-status" :class="['svg-icon size16 statusIcon mr10', { active: item.IsActive }]" />
                  {{ item.ChannelInfo?.ChannelId }}
                </span>
              </td>
              <td>{{ item.ChannelInfo?.ChannelName }}</td>
              <td>{{ DataIndexTypes[item.ChannelInfo?.IndexType] }}</td>
              <td>{{ item.ChannelInfo?.Uom }}</td>
              <td>{{ item.ChannelInfo?.UnitType }}</td>
              <td>{{ item.StartIndex }}</td>
              <td>{{ item.EndIndex }}</td>
              <td>{{ item.ChannelInfo.GroupName }}</td>
            </tr>
            <tr v-if="!curvesFiltered || !curvesFiltered.length" class="empty-row">
              <td colspan="9">No data available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { StoreEquipment } from '../../server/interfaces/store.connector.interfaces';
  import { Api } from '@/services/api.services';
  import { multiSelectwidgetConfig, WidgetType } from '@/interfaces/dashboard.interfaces';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { DataStoreChannelState } from '@/helpers/datastore/datamodels/datastore.channelstate';
  import { valueIsInEnum } from '@/common/utils';
  import { DataIndexTypes } from '../../server/helpers/settings.helpers/general.settings.helper';

  export interface CurveSelectionDetails {
    id: number;
    name: string;
    unit: string;
    description: string;
  }
  export default defineComponent({
    name: 'CommentCurveSelectionPopup',
    components: { CommonPopup },
    props: {
      modelValue: {
        type: Array as () => CurveSelectionDetails[],
        default: () => [],
      },
      curveSelectUri: {
        type: String,
        required: true,
      },
      isMultiSelect: {
        type: Boolean,
        required: true,
      },
      indexType: {
        type: Number as () => DataIndexTypes,
        required: false,
      },
    },
    emits: ['closeMnemonicPopup', 'updateCurveData'],
    data() {
      return {
        DataIndexTypes,
        WidgetTypes: WidgetType,
        selectedChannels: [] as number[],
        tableData: [] as DataStoreChannelState[],
        singleSelectedChannels: -1 as number,
        widgetConfig: multiSelectwidgetConfig,
        filterInput: '' as string,
        dataLoading: false as boolean,
      };
    },
    computed: {
      curvesFiltered(): DataStoreChannelState[] {
        if (this.filterInput) {
          const searchInput = this.filterInput.toLowerCase();
          return this.tableData.filter((data) => {
            return data.ChannelInfo?.ChannelName?.toLowerCase().includes(searchInput);
          });
        }
        if (typeof this.indexType !== 'undefined' && valueIsInEnum(this.indexType, DataIndexTypes)) {
          return this.tableData.filter((data) => (data.ChannelInfo?.IndexType as unknown as DataIndexTypes) === this.indexType);
        }
        return this.tableData;
      },
    },
    mounted() {
      this.singleSelectedChannels = this.modelValue[0]?.id || (-1 as number);
      this.selectedChannels = this.modelValue.slice(1).map((item) => item.id);
      this.getChannelList();
    },
    methods: {
      closePopup() {
        this.$emit('closeMnemonicPopup');
      },
      onSubmit() {
        this.selectedChannels.unshift(this.singleSelectedChannels);
        const selectedRows = this.isMultiSelect
          ? this.tableData?.filter((item) => this.selectedChannels.includes(item.ChannelInfo?.ChannelId ?? -1)) // Ensure item.ChannelId is a number
          : this.tableData?.filter((item) => (item.ChannelInfo?.ChannelId ?? -1) === this.singleSelectedChannels);
        const selectedData =
          selectedRows?.map((m) => ({ id: m.ChannelInfo?.ChannelId, name: m.ChannelInfo?.ChannelName, unit: m.ChannelInfo?.Uom })) ?? [];
        this.$emit('updateCurveData', selectedData);
        this.$emit('closeMnemonicPopup');
      },
      async getChannelList() {
        this.dataLoading = true;
        const url: string = this.curveSelectUri;
        const channelDetails: StoreEquipment[] = await Api.fetch('wellbores', [url, 'mnemonics']);
        ChannelDataService.getState(
          channelDetails.map((m) => m.id),
          (data) => {
            this.tableData = data;
            this.dataLoading = false;
          }
        );
      },
      isSelected(itemId: number | undefined) {
        return this.modelValue?.some((item) => item.id === itemId);
      },
      isCheckboxDisabled(itemId: number) {
        if (this.singleSelectedChannels === itemId) return true;
        if (this.selectedChannels.length < 2) return false;
        return !this.selectedChannels.includes(itemId);
      },
      isRadioDisabled(itemId: number) {
        return this.selectedChannels.includes(itemId);
      },
    },
  });
</script>

<style scoped>
  th,
  td {
    padding: 8px;
    border: 1px solid var(--border-tertiary);
    text-align: center;
  }

  th:first-child,
  td:first-child {
    width: 40px;
    text-align: center;
  }

  td:nth-child(2) {
    text-align: center;
  }

  input[type='radio'] {
    transform: scale(1.2);
    margin: 0;
  }

  .chatimport-table-wrapper {
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
  }

  .chatimport-table-wrapper tr th {
    border: none;
  }

  .chatimport-header {
    margin-bottom: 10px;
    padding: 0;
  }

  .width10p {
    width: 10%;
  }

  .width15p {
    width: 15%;
  }

  .width20p {
    width: 20%;
  }

  .statusIcon {
    color: var(--border-tertiary);
  }

  .statusIcon.active {
    color: var(--success-color);
  }
</style>
