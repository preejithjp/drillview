<template>
  <div class="table-header mb10">
    <div class="customize-header">
      <span class="align-header-center">
        <span class="fontSemibold fontSize-12">Synchronize All Trejectory (including current and New Trejectory)</span>
        <input v-model="transferTrejectory" type="checkbox" @change="$emit('update:transferAllTrejectory', transferTrejectory)" />
      </span>
    </div>
    <div class="create-right-table-actions">
      <SvgIcon name="import-icon" class="svg-icon size32" @click="openImport = true" />
      <div class="search-input-container">
        <SearchInput v-model="filterInput" placeholder="Search" />
      </div>
    </div>
  </div>

  <div class="flex-full overflow-hidden panel-wrapper">
    <div class="right-panel-container width-100">
      <div class="panel-sidebar">
        <div class="create-job-panel-container">
          <div class="create-job-panel-header-wrapper fontSemibold fontSize-12">Source Trajectory Name</div>
          <div class="create-job-body-panel-wrapper d-flex justify-content-center flex-full">
            <div v-if="filterTrejectoryList.length" class="log-list fontSize-10">
              <div
                v-for="trejectorys in filterTrejectoryList"
                :key="trejectorys.ObjectUid"
                class="log-item"
                :class="{ active: selectedTrejectory?.ObjectUid === trejectorys?.ObjectUid }"
                @click="selectTrejectory(trejectorys)">
                <SvgIcon name="trejectory-icon" class="svg-icon size24" />
                <span>{{ trejectorys.ObjectName }}</span>
              </div>
            </div>
            <div v-else class="log-list fontSize-10">
              <div class="log-item justify-content-center">
                <span>No Trejectory Available</span>
              </div>
            </div>
          </div>

          <div class="create-job-footer-wrapper">
            <CustomButton class="btn-width" @click="openTrejectoryPopup()">Add New Trejectory</CustomButton>
          </div>
        </div>
      </div>

      <div class="d-flex flex-col flex-full">
        <div class="popup-fields d-flex width-100 fontSize-12">
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Uid</label>
            <input id="operator-name" v-model="targetList.UUID" disabled type="text" class="field-input fontNormal" placeholder="Enter the UID" />
            <div class="d-flex align-items-center gap5">
              <SvgIcon
                name="reload-icon"
                class="svg-icon size24"
                @click="
                  targetList.UUID = generateUUID();
                  updateSelectedDetails();
                " />
              <input
                type="checkbox"
                @change="
                  targetList.UUID = selectedTrejectory.ObjectUid;
                  updateSelectedDetails();
                " />
              <label class="field-label fontSize-10">Use Same as Source</label>
            </div>
          </div>
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Name</label>
            <input
              id="operator-name"
              v-model="targetList.Name"
              type="text"
              class="field-input fontNormal"
              placeholder="Enter the Name"
              @change="updateSelectedDetails()" />
          </div>
        </div>
      </div>
    </div>
    <CreateObjects v-if="isCreateNewObject" :selectType="tab.Trajectory" @close-popup="closePopup" @on-submit="newTrejectory"></CreateObjects>
    <ImportObjects
      v-if="openImport"
      :source="source"
      :type="tab.Trajectory"
      @selected-objects="importedTrejectory"
      @close-popup="openImport = false"></ImportObjects>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import CreateObjects from './CreateObjects.vue';
  import ImportObjects from './ImportObjects.vue';
  import { v4 as uuidv4 } from 'uuid';
  import { ITrajectories } from 'server/interfaces/datasimplex.interfaces';
  import { BaseObject } from 'server/interfaces/synchronizer.interfaces';
  import { TargetList, CreateObject, Tabs } from '@/interfaces/synchronizer.interface';
  import { ToastType } from '../ToastMessage.vue';
  import { store } from '@/main';

  export default defineComponent({
    name: 'TrejectoryTab',
    components: {
      CreateObjects,
      ImportObjects,
    },
    props: {
      source: {
        type: String,
        required: true,
        default: '',
      },
      modelValue: {
        type: Array as () => BaseObject[],
        required: true,
        default: () => [],
      },
      transferAllTrejectory: {
        type: Boolean,
        required: true,
      },
    },
    emits: ['update:modelValue', 'update:transferAllTrejectory'],
    data() {
      return {
        isCreateNewObject: false as boolean,
        trejectoryList: Array.isArray(this.modelValue) ? [...this.modelValue] : ([] as BaseObject[]),
        selectedTrejectory: {} as BaseObject,
        targetList: {
          UUID: '',
          Name: '',
        } as TargetList,
        openImport: false as boolean,
        filterInput: '' as string,
        transferTrejectory: (this.transferAllTrejectory || false) as boolean,
        tab: Tabs,
      };
    },
    computed: {
      filterTrejectoryList(): BaseObject[] {
        return this.trejectoryList.filter((trej) => trej.ObjectName.toLowerCase().includes(this.filterInput.toLowerCase()));
      },
    },
    watch: {
      trejectoryList: {
        handler(newVal) {
          this.$emit('update:modelValue', newVal);
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.selectTrejectory(this.trejectoryList[0]);
      });
    },
    methods: {
      selectTrejectory(trejectory: BaseObject) {
        this.selectedTrejectory = trejectory;
        this.targetList.UUID = this.selectedTrejectory?.TargetUID || '';
        this.targetList.Name = this.selectedTrejectory?.TargetName || '';
      },
      updateSelectedDetails() {
        this.trejectoryList = this.trejectoryList.map((item) => {
          if (item.ObjectUid == this.selectedTrejectory.ObjectUid) {
            return {
              ObjectName: item.ObjectName,
              ObjectUid: item.ObjectUid,
              TargetUID: this.targetList.UUID,
              TargetName: this.targetList.Name,
            };
          } else {
            return item;
          }
        });
      },
      closePopup() {
        this.isCreateNewObject = false;
      },
      openTrejectoryPopup() {
        this.isCreateNewObject = true;
      },
      importedTrejectory(data: ITrajectories[]) {
        if (!data) return;

        const existingNames = new Set(this.trejectoryList.map((obj) => obj.ObjectName));
        const newUniqueItems: typeof this.trejectoryList = [];
        const duplicateNames: string[] = [];

        data.forEach((item: ITrajectories) => {
          if (existingNames.has(item.ObjectName)) {
            duplicateNames.push(item.ObjectName);
          } else {
            newUniqueItems.push({
              ObjectUid: item.ObjectUid,
              ObjectName: item.ObjectName,
              TargetUID: item.ObjectUid,
              TargetName: item.ObjectName,
            });
            existingNames.add(item.ObjectName);
          }
        });

        this.trejectoryList = [...this.trejectoryList, ...newUniqueItems];

        if (duplicateNames.length > 0) {
          store.showToast(ToastType.WARN, `Skipped duplicates: ${duplicateNames.join(', ')}`);
        }
      },
      newTrejectory(item: CreateObject) {
        const duplicateItem = this.trejectoryList.filter((trejectory) => trejectory.ObjectName == item.Name);
        if (duplicateItem.length) {
          store.showToast(ToastType.WARN, `Duplicate trejectory name: ${item.Name}`);
          return;
        }
        this.trejectoryList.push({
          ObjectUid: item.UUID,
          ObjectName: item.Name,
          TargetUID: item.UUID,
          TargetName: item.Name,
        });
        this.closePopup();
      },
      generateUUID() {
        return uuidv4();
      },
    },
  });
</script>
<style scoped>
  .table-header {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 36px;
  }

  .table-header svg {
    color: var(--icon-secondary);
  }

  .table-actions {
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }
  .icon {
    margin-right: 5px;
    vertical-align: middle;
    color: var(--text-tertiary);
  }

  .search-input-container {
    position: relative;
    width: 80%;
    height: 36px;
  }
  .icon-wrapper {
    display: flex;
    gap: 15px;
    align-items: center;
    justify-content: end;
  }
  .create-right-table-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }
  .align-header-center {
    display: flex;
    align-items: center;
    gap: 10px;
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
  .btn-width {
    width: auto;
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
  .create-job-footer-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
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
    background: var(--hover-secondary);
  }

  .log-item svg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .panel-wrapper {
    border: 2px solid var(--border-tertiary);
    border-radius: 5px;
    height: calc(100% - 46px);
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
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border-tertiary);
    background-color: var(--bg-septenary);
  }

  .log-item.active {
    background: var(--hover-secondary);
  }
</style>
