<template>
  <div class="table-header-label p10 d-flex justify-content-space-between fontSemibold fontSize-14 align-items-center">
    <span class="capitalize-text">Item for {{ displayRecordName }}</span>
    <div class="header-right d-flex gap10">
      <div class="search-input-container">
        <SearchInput v-model="searchName" placeholder="Search" />
      </div>
      <SvgIcon name="plus-icon" class="svg-icon size32 border icon-background secondary" @click.stop="createRecordItemPopup = true" />
    </div>
  </div>
  <div class="grid-wrapper d-flex flex-col fontNormal fontSize-12 second-table">
    <div class="grid-header d-grid align-items-center fontSemibold pl10">
      <span>Enabled</span>
      <span>Id</span>
      <span class="capitalize-text">Description</span>
      <span>Long Mnemonic</span>
      <span>Short Mnemonic</span>
      <span>Target Name</span>
      <span>Target Uid</span>
      <span>Type</span>
      <span>Length</span>
      <span>Unit Type</span>
      <span>Source Unit</span>
    </div>
    <div class="grid-body d-flex flex-col">
      <div v-for="item in filterdData" :key="item.ItemId" class="grid-row d-grid align-items-center">
        <div class="d-flex justify-content-center"><input v-model="item.Enabled" type="checkbox" @change="$emit('itemChanges', item)" /></div>
        <span class="text-ellipsis">{{ item.ItemId }}</span>
        <span class="capitalize-text text-ellipsis">{{ item.Description }}</span>
        <span class="text-ellipsis">{{ item.LongMnemonic }}</span>
        <span class="text-ellipsis">{{ item.ShortMnemonic }}</span>
        <span class="text-ellipsis">{{ item.TargetName }}</span>
        <span :title="item.Uuid || ''" class="text-ellipsis">{{ item.Uuid }}</span>
        <span class="text-ellipsis">{{ item.Type }}</span>
        <span class="text-ellipsis">{{ item.Length }}</span>
        <div>
          <DropDown
            :options="unitTypeDropdown"
            :modelValue="getSelectedUnitType(item)"
            placeholder=""
            class="filter-dropdown"
            @update:model-value="setUnitType(item, $event)" />
        </div>
        <DropDown
          :options="getSourceUnitOptions(item.UnitType ?? '')"
          :modelValue="getSelectedSourceUnit(item)"
          placeholder=""
          class="filter-dropdown"
          @update:model-value="setSourceUnitvalue(item, $event)" />
      </div>
      <div v-if="filterdData.length <= 0" class="no-data fontSize-14 noData">No Data Available</div>
    </div>
    <CreateRecordItem v-if="createRecordItemPopup" :itemsList="recordItems" @cancel="createRecordItemPopup = false" @save="updateRecordItem" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IRecordItem } from '../../server/interfaces/datacollection.interfaces';
  import CreateRecordItem from '..//components/CreateRecordItem.vue';
  import { IDropdownOptions } from './Globals/DropDown.vue';
  import { Api } from '@/services/api.services';
  import { IUnitTypes } from 'server/interfaces/uniteditor.interface';

  export default defineComponent({
    name: 'RecordItemTable',
    components: {
      CreateRecordItem,
    },
    props: {
      recordIdProps: {
        type: Number,
        required: true,
        default: -1,
      },
      itemsToDisplay: {
        type: Array as PropType<IRecordItem[]>,
        required: true,
        default: () => [],
      },
      recordName: {
        type: String,
        required: true,
      },
      activeTabProps: {
        type: String,
        required: true,
        default: '',
      },
    },
    emits: ['recordItemToSave', 'itemChanges'],
    data() {
      return {
        recordItems: [] as IRecordItem[],
        createRecordItemPopup: false as boolean,
        searchName: '' as string,
        unitTypeDropdown: [] as string[],
        recordId: -1 as number,
        displayRecordName: '' as string,
        selectedUnit: null as IDropdownOptions | null,
        unitTypes: [] as IUnitTypes[],
        activeTab: '' as string,
      };
    },
    computed: {
      filterdData() {
        return this.recordItems
          ?.filter((data) => data.Description?.toLowerCase().includes(this.searchName.toLowerCase()))
          .sort((a, b) => a.ItemId - b.ItemId);
      },
    },
    watch: {
      recordIdProps: {
        handler(newVal) {
          this.displayRecordName = this.recordName;
          if (newVal) {
            this.recordId = newVal;
          }
        },
        immediate: true,
        deep: true,
      },
      itemsToDisplay: {
        handler(newVal) {
          this.recordItems = newVal ? JSON.parse(JSON.stringify(newVal)) : [];
          this.displayRecordName = this.recordName;
        },
        immediate: true,
        deep: true,
      },
      activeTabProps: {
        handler(newVal) {
          this.activeTab = newVal;
        },
      },
    },
    created() {
      this.getUnitTypes();
    },
    methods: {
      getSelectedSourceUnit(item: IRecordItem) {
        const sourceUnitOptions = this.getSourceUnitOptions(item.UnitType ?? '');
        return (
          sourceUnitOptions.find((option) => option === item.SourceUnit) ||
          (this.unitTypeDropdown.length > 0 ? this.getSourceUnitOptions(this.unitTypeDropdown[0].toString())?.[0] : null) ||
          null
        );
      },
      getSelectedUnitType(item: IRecordItem) {
        this.recordItems.forEach((item) => {
          if (item.UnitType === null && item.SourceUnit === null && this.unitTypeDropdown.length > 0) {
            item.UnitType = this.unitTypeDropdown[0].toString();
            item.SourceUnit = String(this.getSourceUnitOptions(this.unitTypeDropdown[0].toString()));
          }
        });
        return this.unitTypeDropdown.find((option) => option === item.UnitType) || this.unitTypeDropdown[0] || null;
      },
      getSourceUnitOptions(unitType: string) {
        const unit = this.unitTypes.find((u) => u.UnitType === unitType);
        return unit && unit.Unit.Conversions?.length > 0 ? unit.Unit.Conversions?.map((units) => units.Unit) : [];
      },
      setUnitType(dat: IRecordItem, selectedValue: IDropdownOptions) {
        this.recordItems.forEach((item) => {
          if (item.ItemId === dat.ItemId) {
            item.UnitType = (selectedValue || '').toString();
            item.SourceUnit = String(this.getSourceUnitOptions(item.UnitType)[0]);
            this.$emit('itemChanges', item);
          }
        });
      },
      setSourceUnitvalue(dat: IRecordItem, selectedValue: IDropdownOptions) {
        this.recordItems.forEach((item) => {
          if (item.ItemId === dat.ItemId) {
            item.SourceUnit = (selectedValue || '').toString();
            this.$emit('itemChanges', item);
          }
        });
      },
      async getUnitTypes() {
        const response = await Api.fetch(`unittypes`);
        if (response && response.length > 0) {
          this.unitTypes = response;
          this.unitTypeDropdown = this.unitTypes.map((unit) => unit.UnitType);
          this.recordItems.forEach((item) => {
            item.UnitType = item.UnitType || String(this.unitTypeDropdown[0] ?? '');
            item.SourceUnit = item.SourceUnit || String(this.getSourceUnitOptions(item.UnitType)[0]);
          });
        }
      },
      async updateRecordItem(recordItem: IRecordItem) {
        recordItem.UnitType = this.unitTypeDropdown[0].toString();
        recordItem.SourceUnit = this.getSourceUnitOptions(recordItem.UnitType)[0].toString();
        recordItem.RecordId = this.recordId;
        this.recordItems.push(recordItem);
        this.$emit('itemChanges', recordItem);
        this.$emit('recordItemToSave', recordItem);
        this.createRecordItemPopup = false;
      },
    },
  });
</script>

<style scoped>
  .grid-wrapper {
    overflow-y: hidden;
    border: 1px solid var(--bg-quaternary);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .grid-row {
    grid-template-columns: repeat(2, 50px) repeat(5, 1fr) repeat(2, 80px) repeat(2, 90px);
    gap: 10px;
    padding: 3px 2px 3px 10px;
    background-color: var(--bg-quinary);
    border-bottom: 1px solid var(--border-tertiary);
    color: var(--text-quinary);
  }
  .grid-header {
    grid-template-columns: repeat(2, 50px) repeat(5, 1fr) repeat(2, 80px) repeat(2, 90px);
    gap: 10px;
    border-bottom: 1px solid var(--border-tertiary);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 0.8rem 0.3rem 0.6rem 0.8rem;
  }
  .grid-body {
    height: 100%;
    overflow-y: overlay;
  }
  .second-table {
    flex: 7;
  }
  .table-header-label {
    border-top: 1px solid var(--border-primary);
  }
  .capitalize-text {
    text-transform: capitalize;
  }
  select {
    outline: none;
  }
  .search-input-container {
    position: relative;
  }
  .filter-dropdown .dropdown-trigger {
    padding: 2px;
  }
  .incheck {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .filter-dropdown {
    border: 1px solid var(--border-tertiary);
  }
  .no-data {
    text-align: center;
    color: var(--status-inactive-color);
    padding: 20px 0;
  }
  .noData {
    text-align: center;
    color: var(--text-quinary);
    padding: 10px;
  }
</style>
