<template>
  <div class="chatmemberpanel-container d-flex">
    <div class="memberpanel-header d-flex flex-col align-center">
      <span class="memberpanel-header-icon d-flex align-center flex-shrink-0">
        <GroupAvatar
          :name="(chatGroup.ParentName as string) + '#$#' + chatGroup.GroupName"
          :image="chatGroup.GroupIcon"
          :isEditable="true"
          @on-icon-upload="onGroupIconUpload"></GroupAvatar>
      </span>
      <div v-if="chatGroup.GroupName" class="memberpanel-header-title d-flex flex-col">
        <span class="text-ellipsis capitalize fontSemibold fontSize-12">
          {{ chatGroup.ParentName }}
        </span>
        <span class="text-ellipsis capitalize fontMedium fontSize-10 text-senary">
          {{ chatGroup.GroupName }}
        </span>
        <span v-if="chatGroup.Activities?.length" class="capitalize fontMedium fontSize-10 text-center text-static-tertiary">
          ({{ chatGroup.Activities?.join(' | ') }})
        </span>
      </div>
      <div class="d-flex gap5 width-100 p10">
        <span class="d-flex align-center">
          <SvgIcon name="user-icon-02" title="View Chat Members" class="memberpanel-add-member-icon svg-icon" @click="onAddMembersBtnClick" />
        </span>
        <SearchInput v-model="filterInput" placeholder="Search Members" class="flex-full p-relative" />
      </div>
    </div>
    <div class="memberpanel-body d-flex flex-full scroll primary scroll-y-auto">
      <div v-for="member in filteredMemberList" :key="member.MemberId" class="memberpanel-item d-flex">
        <div class="pt5 d-flex gap10 align-center">
          <span>
            <ProfileImage :name="member.Name" :image="member.Image" :status="member.OnlineStatus" class="member-avatar" />
          </span>
          <div class="d-flex flex-col flex-full text-ellipsis">
            <span class="text-ellipsis capitalize fontMedium fontSize-15">
              {{ member.Name }}
            </span>
            <span class="text-senary fontMedium text-ellipsis fontMedium fontSize-12">
              {{ member.OrganisationName }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="filteredMemberList.length === 0" class="no-data-found fontSize-14 text-center">
        <span v-if="!chatGroup.Members || chatGroup.Members.length == 0">This group has no members yet.</span>
        <span v-else-if="filterInput">No members found. Please try a different search term.</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { IMemberType } from '../../../server/interfaces/member.interfaces';
  import { IChatImportGroups } from '../../../server/interfaces/chatimportgroups.interfaces';
  import { defineComponent, PropType } from 'vue';
  import ProfileImage from '@/components/ProfileImage.vue';
  import GroupAvatar from '@/components/Chat/GroupAvatar.vue';
  import { Routes } from '@/router';
  import { Api } from '@/services/api.services';

  export default defineComponent({
    name: 'ChatMembersPanel',
    components: {
      ProfileImage,
      GroupAvatar,
    },
    props: {
      memberList: {
        type: Object as PropType<IMemberType[]>,
        required: true,
      },
      chatGroup: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
    },
    emits: {
      onChatGroupUpdate(item: IMemberGroupData) {
        return !!item;
      },
    },
    data() {
      return {
        filterInput: '' as string,
      };
    },
    computed: {
      filteredMemberList() {
        if (!this.memberList?.length) return [];
        if (!this.filterInput) return this.memberList;
        const filteredList: IMemberType[] = this.memberList.filter((member) => member.Name?.toLowerCase().includes(this.filterInput.toLowerCase()));
        return filteredList;
      },
    },
    watch: {},
    mounted() {},
    methods: {
      onAddMembersBtnClick() {
        this.$router.push({ name: Routes.ChatGroupMembers, params: { gId: this.chatGroup.ChatGroupId as string } });
      },
      async onGroupIconUpload(avatarIcon: string) {
        const data: Partial<IChatImportGroups> = {
          GroupIcon: avatarIcon,
        };
        const response = await Api.patch('chatmembers/' + this.chatGroup.ParentGroupId, data);
        if (response) {
          const updatedData = this.chatGroup;
          updatedData.GroupIcon = avatarIcon;
          this.$emit('onChatGroupUpdate', updatedData);
        }
      },
    },
  });
</script>

<style scoped>
  .chatmemberpanel-container {
    background: var(--bg-septenary);
    flex-direction: column;
    position: relative;
    height: 100%;
    padding: 5px;
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
  }

  .memberpanel-header {
    margin-top: 20px;
  }

  .memberpanel-header-icon {
    color: var(--bg-primary);
    height: 85px;
    width: 85px;
    background-color: var(--bg-quaternary);
    border-radius: 50%;
  }

  .memberpanel-header-title {
    padding: 10px;
    align-items: center;
  }

  .memberpanel-add-member-icon {
    height: 28px;
    width: 26px;
    color: var(--text-senary);
  }

  .memberpanel-body {
    flex-direction: column;
  }

  .memberpanel-item {
    cursor: pointer;
    padding: 8px 10px;
    transition: background-color 0.2s ease;
  }

  .member-avatar {
    height: 32px;
    width: 32px;
  }

  .no-data-found {
    padding: 10px;
    color: var(--text-tertiary);
  }
</style>
