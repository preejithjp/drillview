<template>
  <CommonPopup
    :headerIcon="activeTab?.icon"
    :popup-title="activeTab?.title"
    :secondary-btn-text="activeTab.secondaryBtnText"
    :primary-btn-text="activeTab.primaryBtnText"
    :wrapper-style="{ width: '70%', height: '100%' }"
    @on-cancel="closePopup"
    @on-submit="onSubmit">
    <div class="chatimport-header d-flex gap10 align-items-center justify-content-space-between">
      <span class="fontSemibold fontSize-12">{{ activeTab.subtitle }}</span>
      <div v-if="activeTab.name === ChatImportTabs.Wellbore.name" class="d-flex">
        <SearchInput v-model="filterInput" placeholder="Search Wellbore..." class="search-box flex-full p-relative" />
      </div>
    </div>
    <div class="chatimport-body d-flex flex-full scroll-auto">
      <template v-if="ChatImportTabs.Group.name === activeTab.name">
        <div class="chatimport-groupcard-wrapper scroll primary">
          <div
            v-for="(group, index) in groupList"
            :key="group.GroupId"
            class="chatimport-groupcard-container d-flex gap5"
            :class="{ selected: selectedGroup.GroupId === group.GroupId }"
            @click="onGroupSelect(group)">
            <span class="groupcard-icon d-flex flex-shrink-0 align-center">
              <GroupAvatar :name="group.GroupName" :image="group?.GroupIcon" :colorIndex="index" class="group-avatar"></GroupAvatar>
            </span>
            <div v-if="group.GroupName" class="groupcard-title d-flex flex-col flex-full text-ellipsis">
              <span class="text-ellipsis capitalize fontBold fontSize-12">
                {{ group.GroupName }}
              </span>
              <span v-dateTimeFormat="'dd Month yyyy hh:mi AM'" class="text-senary text-ellipsis capitalize fontMedium fontSize-10">
                {{ group.CreatedDate }}
              </span>
              <span v-if="group.Activities?.length" class="text-senary text-ellipsis capitalize fontMedium fontSize-10">
                {{ group.Activities?.join(' | ') }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <template v-if="ChatImportTabs.Wellbore.name === activeTab.name">
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
              <tr v-if="wellboresFiltered.length === 0" class="selectable">
                <td colspan="7" class="fontSize-16">Searched wellbore details not available</td>
              </tr>
              <tr
                v-for="well in wellboresFiltered"
                :key="well.uniqueIdentifier"
                class="selectable"
                :class="{ selected: selectedWellbore.uniqueIdentifier === well.uniqueIdentifier, 'disable-Item': isAlreadyMapped(well) }"
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
            </tbody>
          </table>
        </div>
      </template>
      <template v-if="ChatImportTabs.Curve.name === activeTab.name">
        <div class="chatimport-curve-wrapper d-flex flex-col flex-full gap20 fontSize-12">
          <div v-for="(channel, index) in channelList" :key="index" class="d-flex flex-col flex-full gap10 text-quaternary">
            <div class="d-flex gap10 align-items-center flex-full">
              <label class="fontSemibold">Curve {{ index + 1 }}</label>
              <SvgIcon name="import-icon" class="svg-icon size18" @click="onAddCurveBtnClick(index)" />
            </div>
            <div class="d-flex gap20 align-items-center flex-full">
              <span class="inputgroup">
                <label :for="'log' + index" class="fontSemibold flex-basis-25">Log Name</label>
                <input :id="'log' + index" v-model="channel.LogName" type="text" class="inputbox primary fontSize-12 width-100 text-quaternary" />
              </span>
              <span class="inputgroup">
                <label :for="'curve' + index" class="fontSemibold flex-basis-25">Curve Name</label>
                <input
                  :id="'curve' + index"
                  v-model="channel.ChannelName"
                  type="text"
                  class="inputbox primary fontSize-12 width-100 text-quaternary" />
              </span>
            </div>
          </div>
          <div class="chatimport-activity-wrapper d-flex gap20 align-items-center flex-full">
            <span class="inputgroup">
              <label for="activity-log" class="fontSemibold flex-basis-25">Activity Log</label>
              <input id="activity-log" v-model="activity.LogName" type="text" class="inputbox primary fontSize-12 width-100 text-quaternary" />
            </span>
            <span class="inputgroup">
              <label for="activity-curve" class="fontSemibold flex-basis-25">Activity Curve</label>
              <input id="activity-curve" v-model="activity.ChannelName" type="text" class="inputbox primary fontSize-12 width-100 text-quaternary" />
            </span>
          </div>
        </div>
      </template>
    </div>
  </CommonPopup>
  <CurveSelector v-if="showCurveSelector" :wellbore="selectedWellbore" @on-cancel="showCurveSelector = false" @on-submit="onCurveSelect" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { Api } from '@/services/api.services';
  import GroupAvatar from './GroupAvatar.vue';
  import { StoreDataHeader } from '../../../server/interfaces/store.connector.interfaces';
  import { IGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import CurveSelector from './CurveSelector.vue';
  import { IMemberGroupChannel } from '../../../server/interfaces/chatmembers.interfaces';

  export enum ChatImportTabNames {
    Group = 'Group',
    Wellbore = 'Wellbore',
    Curve = 'Curve',
  }

  export interface Tabs {
    name: ChatImportTabNames;
    title: string;
    subtitle: string;
    primaryBtnText: string;
    secondaryBtnText?: string;
    icon?: string;
  }

  export default defineComponent({
    name: 'ImportChatGroup',
    components: {
      CommonPopup,
      GroupAvatar,
      CurveSelector,
    },
    emits: {
      closePopup: () => true,
      onGroupUpdated: () => true,
    },
    data() {
      return {
        ChatImportTabs: {
          Group: { name: ChatImportTabNames.Group, title: 'Chat Import', subtitle: 'Groups', primaryBtnText: 'Next', icon: 'chat-group-icon-04' },
          Wellbore: {
            name: ChatImportTabNames.Wellbore,
            title: 'Wellbore Selection',
            subtitle: 'Well / Wellbore',
            primaryBtnText: 'Next',
            icon: 'wellbore-icon',
          },
          Curve: {
            name: ChatImportTabNames.Curve,
            title: 'Curve & Activity',
            subtitle: 'Curve & Activity',
            primaryBtnText: 'Done',
            icon: 'curve-activity-icon',
          },
        },
        channelList: [
          { ChannelId: -1, ChannelName: '', LogName: '' },
          { ChannelId: -1, ChannelName: '', LogName: '' },
          { ChannelId: -1, ChannelName: '', LogName: '' },
        ] as IMemberGroupChannel[],
        activity: { LogName: '', ChannelName: '' },
        activeTab: { title: '' } as Tabs,
        selectedGroup: {} as IGroupData,
        selectedWellbore: {} as StoreDataHeader,
        wellboreList: [] as StoreDataHeader[],
        groupList: [] as IGroupData[],
        filterInput: '' as string,
        showCurveSelector: false as boolean,
        curveSelectionIndex: -1 as number,
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
      this.activeTab = this.ChatImportTabs.Group;
      this.fetchWellbores();
      this.fetchGroups();
    },
    methods: {
      async fetchWellbores() {
        const response = await Api.fetch('wellbores');
        if (response && response.length) {
          this.wellboreList = response;
          this.wellboreList = this.wellboreList.sort((a, b) => {
            const nameCompare = a.name.localeCompare(b.name);
            if (nameCompare !== 0) return nameCompare;
            return a.creationDate - b.creationDate;
          });
        } else {
          this.wellboreList = [];
        }
      },
      async fetchGroups() {
        const response = await Api.fetch('chatgroups/groups');
        if (response && response.length) {
          this.groupList = (response as IGroupData[]).sort((a, b) => (a.CreatedDate > b.CreatedDate ? -1 : 1));
        } else {
          this.groupList = [];
        }
      },
      async fetchCurveActivity() {
        const response = await Api.fetch(`chatmembers/chatimportgroups/${this.selectedGroup.GroupId}/${this.selectedWellbore.uniqueIdentifier}`);
        if (response) {
          this.channelList = this.channelList.map((channel, index) => {
            if (response.Channels && response.Channels[index]) {
              return response.Channels[index];
            }
            return channel;
          });
          this.activity = response.Activity;
        }
      },
      onGroupSelect(group: IGroupData) {
        this.selectedGroup = group;
      },
      onWellboreSelect(well: StoreDataHeader) {
        this.selectedWellbore = well;
      },
      async onSubmit() {
        if (this.activeTab.name == this.ChatImportTabs.Group.name && this.selectedGroup.GroupId) {
          this.activeTab = this.ChatImportTabs.Wellbore;
        } else if (this.activeTab.name == this.ChatImportTabs.Wellbore.name && this.selectedWellbore.uniqueIdentifier) {
          this.fetchCurveActivity();
          this.activeTab = this.ChatImportTabs.Curve;
          this.activeTab.subtitle = `${this.selectedWellbore.parent.name} / ${this.selectedWellbore.name}`;
        } else if (this.activeTab.name == this.ChatImportTabs.Curve.name) {
          const data = {
            GroupId: this.selectedGroup.GroupId,
            ParentId: this.selectedWellbore.uniqueIdentifier,
            ParentName: this.selectedWellbore.name,
            ParentUrl: this.selectedWellbore.uri,
            Channels: this.channelList
              .filter((channel) => channel.ChannelName)
              .map((channel) => {
                return {
                  ChannelId: channel.ChannelId,
                  ChannelName: channel.ChannelName,
                  LogName: channel.LogName,
                };
              }),
            Activity: this.activity,
          };
          await Api.submit('chatgroups/join', data);
          this.$emit('onGroupUpdated');
          this.$emit('closePopup');
        }
      },
      closePopup() {
        this.$emit('closePopup');
      },
      isAlreadyMapped(well: StoreDataHeader) {
        return this.selectedGroup.ParentMapping?.some((parentid) => parentid === well.uniqueIdentifier);
      },
      onAddCurveBtnClick(curveIndex: number) {
        this.showCurveSelector = true;
        this.curveSelectionIndex = curveIndex;
      },
      onCurveSelect(curveData: IMemberGroupChannel) {
        this.channelList[this.curveSelectionIndex] = curveData;
        this.showCurveSelector = false;
      },
    },
  });
</script>

<style scoped>
  .chatimport-header {
    margin-bottom: 10px;
    padding: 0 6px;
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
    color: var(--text-static-primary);
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

  .common-table tr:has(td:only-child) td {
    text-align: center;
    color: var(--text-quinary);
    padding: 10px;
  }
</style>
