<template>
  <div class="chatgroupmembers-container flex-col flex-full fontSize-16">
    <div class="chatgroupmembers-header-wrapper">
      <div class="d-flex flex-full align-center gap10 text-ellipsis">
        <span class="text-static-primary">
          <GroupAvatar :name="group?.GroupName" :image="group?.GroupIcon" class="group-avatar"></GroupAvatar>
        </span>
        <div class="d-flex flex-col flex-full text-ellipsis">
          <span class="text-tertiary text-ellipsis capitalize fontSemibold fontSize-13">
            {{ group?.GroupName }}
          </span>
          <span class="text-senary text-ellipsis fontMedium fontSize-10">
            {{ group?.Activities?.join(' | ') }}
          </span>
        </div>
      </div>

      <div class="d-flex gap10 justify-content-end">
        <SvgIcon name="import-icon" class="svg-icon size32 border icon-background flex-shrink-0 secondary" @click="onImportMembersBtnClick" />
        <SearchInput v-model="filterInput" placeholder="Search Members" class="search-box flex-full p-relative" />
      </div>
    </div>
    <div class="chatgroupmembers-body-wrapper d-flex flex-full scroll-auto">
      <div class="scroll-y-auto scroll primary scrolltable flex-full">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr class="fontSemibold">
              <th>Email</th>
              <th>User Name</th>
              <th>Description</th>
              <th>Roles</th>
              <th>Created Date</th>
              <th>Unique Id</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium text-quinary">
            <tr v-for="member in filteredMemberList" :key="member.MemberId">
              <td>
                <span class="d-flex gap5">
                  <SvgIcon name="user-icon" class="svg-icon size14" />
                  <span class="text-ellipsis">{{ member?.Email }}</span>
                </span>
              </td>
              <td>{{ member?.Name }}</td>
              <td>{{ member.Description }}</td>
              <td>{{ member.Role }}</td>
              <td v-dateTimeFormat="'yyyy-mm-dd'">{{ member.CreatedDate }}</td>
              <td>{{ member.MemberId }}</td>
              <td>
                <SvgIcon name="delete-icon" class="svg-icon size12 secondary" @click="onMemberDeleteBtnClick(member.MemberId)" />
              </td>
            </tr>
            <tr v-if="!isLoading && filteredMemberList?.length === 0">
              <td colspan="7" class="text-center">Members not found!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmationPopup v-if="showDeleteConfirmation" :show="showDeleteConfirmation" @on-cancel="onDeleteClose" @on-submit="deleteMember" />

    <ImportMember
      v-if="showImportMemberPopup"
      :selectedMembers="group.Members"
      :wrapperStyle="{ height: '80%' }"
      @on-submit="onMemberImportSubmit"
      @close-popup="showImportMemberPopup = false" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import { IChatGroup, IGroupData } from '../../server/interfaces/chatgroup.interfaces';
  import { useRoute } from 'vue-router';
  import { Api } from '@/services/api.services';
  import { IMemberType } from '../../server/interfaces/member.interfaces';
  import ImportMember from '@/components/ImportMember.vue';
  import GroupAvatar from '@/components/Chat/GroupAvatar.vue';
  import { store } from '@/main';

  export default defineComponent({
    name: 'ChatGroupMembers',
    components: {
      ConfirmationPopup,
      ImportMember,
      GroupAvatar,
    },
    emits: { onGroupMemberDelete: null },
    data() {
      return {
        groupId: '' as string,
        group: {} as IGroupData,
        filterInput: '' as string,
        memberList: [] as IMemberType[],
        showDeleteConfirmation: false,
        deleteId: '',
        isLoading: false as boolean,
        showImportMemberPopup: false,
      };
    },
    computed: {
      filteredMemberList() {
        if (!this.memberList?.length) return [];
        if (!this.filterInput) return this.memberList;
        const filteredList: IMemberType[] = this.memberList.filter(
          (member) =>
            member.Email?.toLowerCase().includes(this.filterInput.toLowerCase()) ||
            member.Name?.toLowerCase().includes(this.filterInput.toLowerCase())
        );
        return filteredList;
      },
    },
    watch: {},
    mounted() {
      const route = useRoute();
      this.groupId = route.params.gId as string;
      this.fetchGroup();
    },
    methods: {
      async fetchGroup() {
        this.isLoading = true;
        const response = await Api.fetch(`chatgroups/groups/${this.groupId}`);
        if (response) {
          this.group = response;
          this.fetchGroupMembers();
        }
      },
      async fetchGroupMembers() {
        if (this.group.Members && this.group.Members.length > 0) {
          const response = (await Api.submit('members/byId', this.group.Members)) ?? [];
          this.memberList = (response as IMemberType[]).sort((a, b) => {
            return (a?.Name ?? '').localeCompare(b?.Name ?? '');
          });
        } else {
          this.memberList = [];
        }
        this.isLoading = false;
      },
      onMemberDeleteBtnClick(deleteId: string) {
        this.showDeleteConfirmation = true;
        this.deleteId = deleteId;
      },
      async deleteMember() {
        this.$emit('onGroupMemberDelete', this.deleteId);
        const updatedMemberList = this.group.Members?.filter((member) => member !== this.deleteId);
        const updatedMembers: any = [];
        updatedMemberList?.forEach((memberId) => {
          updatedMembers.push({
            MemberId: memberId as string,
          });
        });
        const data: Partial<IChatGroup> = {
          Members: updatedMembers,
        };
        const response = await Api.patch('chatgroups/' + this.group.GroupId, data);
        if (response) {
          this.group.Members = updatedMemberList;
          // Remove the user from the mermbers list
          const mIndex = this.memberList.findIndex((m) => m.MemberId == this.deleteId);
          this.memberList.splice(mIndex, 1);
          store.eventEmitter.emit('refetchChatGroups');
        }
        this.deleteId = '';
        this.showDeleteConfirmation = false;
      },
      onDeleteClose() {
        this.showDeleteConfirmation = false;
        this.deleteId = '';
      },
      onImportMembersBtnClick() {
        this.showImportMemberPopup = true;
      },
      async onMemberImportSubmit(selectedMembers: string[]) {
        const newMembers: any = [];
        selectedMembers.forEach((memberId) => {
          newMembers.push({
            MemberId: memberId as string,
          });
        });
        const data: Partial<IChatGroup> = {
          Members: newMembers,
        };
        const response = await Api.patch('chatgroups/' + this.group.GroupId, data);
        if (response) {
          this.group.Members = selectedMembers;
          this.showImportMemberPopup = false;
          this.fetchGroupMembers();
          store.eventEmitter.emit('refetchChatGroups');
        }
      },
    },
  });
</script>

<style scoped>
  .chatgroupmembers-container {
    display: flex;
    height: 100%;
    overflow: auto;
  }

  .chatgroupmembers-header-wrapper {
    display: flex;
    align-items: center;
    padding: 10px 25px;
    gap: 10px;
    height: 60px;
  }

  .chatgroupmembers-header-wrapper .inputbox {
    background-color: var(--bg-septenary);
    padding-left: 20px;
  }

  .chatgroupmembers-body-wrapper {
    padding: 5px 25px 25px;
  }

  .group-avatar {
    height: 32px;
    width: 32px;
  }

  .search-box {
    min-width: 165px;
    max-width: 250px;
  }
</style>
