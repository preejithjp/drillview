<template>
  <div class="chatgroup-container flex-col flex-full fontSize-16">
    <div class="chatgroup-header-wrapper">
      <div class="d-flex flex-full align-center gap10 text-ellipsis">
        <span class="pt5">
          <SvgIcon name="chat-group-add-icon" class="svg-icon size24" />
        </span>
        <div class="d-flex flex-col flex-full text-ellipsis">
          <span class="text-tertiary text-ellipsis capitalize fontSemibold fontSize-13">Chat Groups</span>
          <span class="text-senary text-ellipsis fontMedium fontSize-10">Manage Chat Groups</span>
        </div>
      </div>
      <div class="d-flex gap10 flex-basis-25 justify-content-end">
        <SearchInput v-model="filterInput" placeholder="Search Chat Groups" class="search-box flex-full p-relative" />
        <SvgIcon
          name="plus-icon"
          title="Add New Chat Group"
          class="svg-icon size32 border icon-background flex-shrink-0 text-tertiary"
          @click="onCreateGroupBtnClick" />
      </div>
    </div>
    <div class="chatgroup-body-wrapper flex-full scroll primary scroll-auto">
      <div class="chatgroup-card-wrapper">
        <template v-for="(group, index) in filteredGroupList" :key="group.GroupId">
          <ChatGroupCard :group="group" :cardIndex="index" @on-edit-group-btn-click="onEditGroupBtnClick" />
        </template>
      </div>
      <div v-if="groupList.length > 0 && filteredGroupList.length === 0" class="no-data-found fontSize-14">
        <span>No groups found. Please try a different search term.</span>
      </div>
    </div>
    <CreateGroup
      v-if="showCreateGroupPopup"
      :selectedGroup="selectedGroup"
      @close-popup="onCreateGroupPopupClose"
      @on-group-updated="onCreateGroupSubmit" />
  </div>
</template>

<script lang="ts">
  import { Api } from '@/services/api.services';
  import { IGroupData } from '../../server/interfaces/chatgroup.interfaces';
  import { defineComponent } from 'vue';
  import ChatGroupCard from '../components/Chat/ChatGroupCard.vue';
  import CreateGroup from '@/components/Chat/CreateGroup.vue';

  export default defineComponent({
    name: 'ChatGroup',
    components: {
      ChatGroupCard,
      CreateGroup,
    },
    data() {
      return {
        filterInput: '' as string,
        groupList: [] as IGroupData[],
        selectedGroup: null as IGroupData | null,
        showCreateGroupPopup: false as boolean,
      };
    },
    computed: {
      filteredGroupList() {
        if (!this.groupList?.length) return [];
        if (!this.filterInput) return this.groupList;
        const filteredList: IGroupData[] = this.groupList.filter((member) =>
          member.GroupName?.toLowerCase().includes(this.filterInput.toLowerCase())
        );
        return filteredList;
      },
    },
    mounted() {
      const routeState = window.history.state;
      if (routeState.showCreateGroupPopup) {
        this.showCreateGroupPopup = routeState.showCreateGroupPopup;
        routeState.showCreateGroupPopup = false;
      }
      this.fetchGroups();
    },
    beforeUnmount() {},
    methods: {
      async fetchGroups() {
        const response = await Api.fetch('chatgroups/groups');
        if (response && response.length) {
          this.groupList = response;
          this.groupList = this.groupList.sort((a, b) => b.CreatedDate - a.CreatedDate);
        } else {
          this.groupList = [];
        }
      },
      onCreateGroupBtnClick() {
        this.showCreateGroupPopup = true;
      },
      onCreateGroupPopupClose() {
        this.selectedGroup = null;
        this.showCreateGroupPopup = false;
      },
      onCreateGroupSubmit() {
        this.fetchGroups();
      },
      onEditGroupBtnClick(item: IGroupData) {
        this.selectedGroup = item;
        this.showCreateGroupPopup = true;
      },
    },
  });
</script>

<style scoped>
  .chatgroup-container {
    display: flex;
    height: 100%;
    overflow: auto;
  }

  .chatgroup-header-wrapper {
    display: flex;
    align-items: center;
    padding: 10px 25px;
    gap: 10px;
    height: 60px;
  }

  .chatgroup-header-wrapper .inputbox {
    background-color: var(--bg-septenary);
    padding-left: 20px;
  }

  .chatgroup-body-wrapper {
    padding: 5px 25px 25px;
  }

  .chatgroup-card-wrapper {
    flex: 0 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
    grid-gap: 10px;
    grid-template-rows: max-content;
    overflow-y: auto;
  }

  .search-box {
    min-width: 165px;
    max-width: 250px;
  }

  .no-data-found {
    text-align: center;
    padding: 100px 10px;
    color: var(--text-tertiary);
  }
</style>
