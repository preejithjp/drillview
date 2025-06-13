<template>
  <div class="table-header mb10">
    <div class="customize-header">
      <span class="align-header-center">
        <span class="fontSemibold fontSize-12">Synchronize All Other Objects (including current and New Other Objects)</span>
        <input v-model="tranferAllOtherObject" type="checkbox" @change="$emit('update:tranferRig', tranferAllOtherObject)" />
      </span>
    </div>
    <div class="create-right-table-actions">
      <SvgIcon name="import-icon" class="svg-icon size32" @click="importedObjects = true" />
      <div class="search-input-container">
        <SearchInput v-model="filterInput" placeholder="Search" />
      </div>
    </div>
  </div>

  <div class="flex-full overflow-hidden panel-wrapper">
    <div class="right-panel-container width-100">
      <div class="panel-sidebar">
        <div class="create-job-panel-container">
          <div class="create-job-panel-header-wrapper fontSemibold fontSize-12">Source Other Object Name</div>

          <div class="create-job-body-panel-wrapper d-flex justify-content-center flex-full">
            <div v-if="filterOtherObjects.length && !loading" class="log-list fontSize-10">
              <div
                v-for="otherobject in filterOtherObjects"
                :key="otherobject.ObjectUid"
                class="log-item"
                v-bind="{ ObjectType: otherobject.Type as keyof typeof objectTypesIcons }"
                :class="{ active: selectedObject?.ObjectUid === otherobject?.ObjectUid }"
                @click="selectOtherObject(otherobject)">
                <SvgIcon :name="objectTypesIcons[otherobject.Type as keyof typeof objectTypesIcons]" class="svg-icon size24" />
                <span>{{ otherobject.ObjectName }} | {{ otherobject.Type }}</span>
              </div>
            </div>
            <div v-else-if="!loading" class="log-list fontSize-10">
              <div class="log-item justify-content-center">
                <span>No Objects Available</span>
              </div>
            </div>
          </div>

          <div class="create-job-footer-wrapper">
            <CustomButton class="btn-width" @click="openOtherObjectPopup()">Add New Other Object</CustomButton>
          </div>
        </div>
      </div>

      <div class="d-flex flex-col flex-full">
        <div class="popup-fields d-flex width-100 fontSize-12">
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Uid</label>
            <input id="operator-name" v-model="targetList.UUID" disabled type="text" class="field-input fontNormal" placeholder="Enter the Uid" />
            <div class="d-flex align-items-center gap5">
              <SvgIcon
                name="reload-icon"
                class="svg-icon size24"
                @click="
                  targetList.useSameAsSource = false;
                  targetList.UUID = generateUUID();
                  updateSelectedDetails();
                " />
              <input
                v-model="targetList.useSameAsSource"
                type="checkbox"
                @change="
                  targetList.useSameAsSource == true ? (targetList.UUID = selectedObject.ObjectUid) : (targetList.UUID = generateUUID());
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
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Object Type</label>
            {{ selectedObject.Type }}
          </div>
        </div>
      </div>
    </div>
    <ImportObjects
      v-if="importedObjects"
      :source="source"
      :type="tab.OtherObjects"
      @selected-objects="importedOtherObject"
      @close-popup="importedObjects = false"></ImportObjects>
    <CreateObjects v-if="isCreateNewObject" :selectType="tab.OtherObjects" @close-popup="closePopup" @on-submit="createdObject"></CreateObjects>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import CreateObjects from './CreateObjects.vue';
  import ImportObjects from './ImportObjects.vue';
  import { v4 as uuidv4 } from 'uuid';
  import { ILogs } from 'server/interfaces/datasimplex.interfaces';
  import { ToastType } from '../ToastMessage.vue';
  import { store } from '@/main';
  import { TargetList, CreateObject, ObjectTypesIcons, ObjectTypeOther, Tabs } from '@/interfaces/synchronizer.interface';

  export default defineComponent({
    name: 'OtherObjectTab',
    components: { CreateObjects, ImportObjects },
    props: {
      otherObject: { type: Array as () => ObjectTypeOther[], required: false, default: () => [] },
      source: { type: String, required: true, default: '' },
      tranferRig: {
        type: Boolean,
        required: true,
      },
    },
    emits: ['update:otherObject', 'update:tranferRig'],
    data() {
      return {
        isCreateNewObject: false as boolean,
        selectedObject: {} as ObjectTypeOther,
        objectTypesIcons: ObjectTypesIcons,
        otherList: [...this.otherObject] as ObjectTypeOther[],
        targetList: {
          UUID: '',
          Name: '',
          useSameAsSource: false,
        } as TargetList,
        loading: false as boolean,
        filterInput: '' as string,
        importedObjects: false as boolean,
        tranferAllOtherObject: (this.tranferRig || false) as boolean,
        tab: Tabs,
      };
    },
    computed: {
      filterOtherObjects(): ObjectTypeOther[] {
        return this.otherList.filter((item) => item.ObjectName.toLowerCase().includes(this.filterInput.toLowerCase()));
      },
    },
    watch: {
      filterInput(newVal) {
        this.filterOtherObjects = this.otherList.filter((item) => item.ObjectName.toLowerCase().includes(newVal.toLowerCase()));
      },
      otherList: {
        handler(newVal) {
          this.otherList = newVal;
          this.$emit('update:otherObject', newVal);
        },
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.otherList = this.otherObject || [];
        if (this.otherList.length > 0) {
          this.selectOtherObject(this.otherList[0]);
        }
      });
    },
    methods: {
      updateSelectedDetails() {
        this.otherList = this.otherList.map((item) => {
          if (item.ObjectUid == this.selectedObject.ObjectUid) {
            return {
              ObjectName: item.ObjectName,
              ObjectUid: item.ObjectUid,
              TargetUID: this.targetList.UUID,
              TargetName: this.targetList.Name,
              Type: item.Type,
            };
          } else {
            return item;
          }
        });
      },
      openOtherObjectPopup() {
        this.isCreateNewObject = true;
      },
      closePopup() {
        this.isCreateNewObject = false;
      },
      createdObject(item: CreateObject) {
        if (!item) return;
        const duplicateItem = this.otherList.filter((otherObject) => otherObject.ObjectName == item.Name);
        if (duplicateItem.length) {
          store.showToast(ToastType.WARN, `Duplicate otherObject name: ${item.Name}`);
          return;
        }
        const newObject: ObjectTypeOther = {
          ObjectUid: item.UUID,
          ObjectName: item.Name,
          TargetUID: item.UUID,
          TargetName: item.Name,
          Type: item.ObjectType || '',
        };
        this.otherList.push(newObject);
        this.$emit('update:otherObject', this.otherList);
        this.closePopup();
      },
      selectOtherObject(item: ObjectTypeOther) {
        this.selectedObject = item;
        this.targetList.UUID = this.selectedObject.TargetUID;
        this.targetList.Name = this.selectedObject.TargetName;
      },
      generateUUID() {
        return uuidv4();
      },
      importedOtherObject(item: ILogs[]) {
        if (!item) return;

        const existingNames = new Set(this.otherList.map((obj) => obj.ObjectName));
        const newUniqueItems: typeof this.otherList = [];
        const duplicateNames: string[] = [];

        item.forEach((obj) => {
          if (existingNames.has(obj.ObjectName)) {
            duplicateNames.push(obj.ObjectName);
          } else {
            newUniqueItems.push({
              ObjectUid: obj.ObjectUid,
              ObjectName: obj.ObjectName,
              TargetUID: obj.ObjectUid,
              TargetName: obj.ObjectName,
              Type: obj.ObjectType,
            });
            existingNames.add(obj.ObjectName);
          }
        });

        this.otherList = [...this.otherList, ...newUniqueItems];
        this.$emit('update:otherObject', this.otherList);

        if (duplicateNames.length > 0) {
          store.showToast(ToastType.WARN, `Skipped duplicates: ${duplicateNames.join(', ')}`);
        }
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
  .log-item.active {
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
  .btn-width {
    width: auto;
  }
</style>
