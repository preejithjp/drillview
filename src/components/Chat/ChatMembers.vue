<template>
  <div>
    <table class="common-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>User Name</th>
          <th>User Type</th>
          <th>Primary Owner</th>
          <th>Unique ID</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="chatMember in filteredChatMembers" :key="chatMember.MemberId">
          <td>{{ getUserDetails(chatMember.MemberId)?.Email ?? '' }}</td>
          <td>{{ getUserDetails(chatMember.MemberId)?.Name ?? '' }}</td>
          <td></td>
          <td>
            <input v-model="adminMembers" type="checkbox" :value="chatMember.MemberId" @change="updateAdminMembers" />
          </td>
          <td></td>
          <td>
            <SvgIcon name="delete-icon" class="svg-icon size12" @click="handleDeleteClick(chatMember.MemberId)" />
          </td>
        </tr>
      </tbody>
      <tbody v-if="filteredChatMembers?.length === 0">
        <tr>
          <td colspan="6" class="text-center">No data to display</td>
        </tr>
      </tbody>
    </table>
    <ConfirmationPopup v-if="showDeleteConfirmation" :show="showDeleteConfirmation" @on-cancel="handleDeleteClose" @on-submit="removeChatMember" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IMember } from '../../../server/interfaces/member.interfaces';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import { store } from '@/main';
  import { IChatMembers } from '../../../server/interfaces/chatmembers.interfaces';
  export default defineComponent({
    name: 'ChatMembers',
    components: {
      ConfirmationPopup,
    },
    props: {
      members: {
        type: Object as PropType<IMember[]>,
        required: true,
      },
      selectedGroupMembers: {
        type: Object as PropType<IChatMembers[]>,
        required: true,
      },
      selectedAdminMembers: {
        type: Object as PropType<string[]>,
        required: true,
      },
      searchInput: {
        type: String,
        default: '',
      },
    },
    emits: {
      onGroupMemberDelete: (memberId: string) => {
        return typeof memberId === 'string';
      },
      updateAdminMembers: (members: string[]) => {
        return !!members;
      },
    },
    data() {
      return {
        showDeleteConfirmation: false,
        deleteId: '',

        chatMembers: [] as IChatMembers[],
        adminMembers: [] as string[],
      };
    },
    computed: {
      filteredChatMembers(): IChatMembers[] {
        return this.chatMembers.filter((data) => {
          if (this.searchInput) {
            return (
              this.getUserDetails(data.MemberId)?.Name?.toLowerCase().includes(this.searchInput.toLowerCase()) ||
              this.getUserDetails(data.MemberId)?.Email?.toLowerCase().includes(this.searchInput.toLowerCase())
            );
          } else {
            return data;
          }
        });
      },
      currentMemberId() {
        return store.userInfo.MEMBERID;
      },
    },
    watch: {
      selectedGroupMembers: {
        immediate: true,
        handler(newValue: IChatMembers[]) {
          if (newValue) {
            this.chatMembers = newValue;
          }
        },
        deep: true,
      },
      selectedAdminMembers(newVal: string[]) {
        if (newVal) {
          this.adminMembers = [...newVal];
        }
      },
    },
    methods: {
      getUserDetails(memberId: string) {
        const index = this.members.findIndex((item: IMember) => {
          return item.MemberId === memberId;
        });
        let member: IMember | undefined;
        if (index != -1) {
          member = this.members[index];
        }
        return member;
      },
      handleDeleteClick(deleteId: string) {
        this.showDeleteConfirmation = true;
        this.deleteId = deleteId;
      },
      removeChatMember() {
        this.$emit('onGroupMemberDelete', this.deleteId);
        this.deleteId = '';
        this.showDeleteConfirmation = false;
      },
      handleDeleteClose() {
        this.showDeleteConfirmation = false;
        this.deleteId = '';
      },
      updateAdminMembers() {
        this.$emit('updateAdminMembers', this.adminMembers);
      },
    },
  });
</script>
