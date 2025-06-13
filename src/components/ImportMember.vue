<template>
  <CommonPopup
    popup-title="Import Members"
    secondary-btn-text="Cancel"
    primary-btn-text="Import"
    header-icon="group-icon"
    @on-cancel="closePopup"
    @on-submit="onSubmit">
    <div class="importmembers-header d-flex justify-content-end">
      <span class="search-box flex-full p-relative">
        <SearchInput v-model="searchMemer" placeholder="Search Name or Email" />
      </span>
    </div>
    <div class="importmember-body-wrapper d-flex scroll-y-auto">
      <div class="scroll-y-auto flex-full scroll primary scrolltable">
        <table class="common-table primary fontSize-12">
          <thead>
            <tr>
              <th class="width-60px">
                <input type="checkbox" :checked="areAllSelected" @change="toggleSelection($event)" />
              </th>
              <th>Email</th>
              <th>User Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody class="scroll-y-auto fontMedium">
            <tr v-for="member in members" :key="member.MemberId">
              <td>
                <input
                  v-if="member.MemberId"
                  v-model="selectedUsers"
                  :disabled="selectedMembers?.includes(member.MemberId as string)"
                  type="checkbox"
                  :value="member.MemberId" />
              </td>
              <td>{{ member.Email }}</td>
              <td>{{ member.Name }}</td>
              <td>{{ member.Role }}</td>
            </tr>
          </tbody>
          <tbody v-if="members?.length === 0">
            <tr>
              <td colspan="4" class="text-center">No data to display</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { IMemberType } from '../../server/interfaces/member.interfaces';
  import { Api } from '@/services/api.services';
  export default defineComponent({
    name: 'ImportMember',
    components: {
      CommonPopup,
    },
    props: {
      selectedMembers: {
        type: Object as PropType<string[]>,
      },
    },
    emits: {
      onSubmit: (selectedUsers: string[]) => {
        return !!selectedUsers;
      },
      closePopup: () => true,
    },
    data() {
      return {
        selectedUsers: [] as string[],
        members: [] as IMemberType[],
        searchMemer: '' as string,
      };
    },
    computed: {
      areAllSelected(): boolean {
        return this.selectedUsers?.length === this.members?.length;
      },
    },
    watch: {
      searchMemer() {
        this.fetchAllMembers();
      },
      selectedMembers: {
        immediate: true,
        handler(newValue: string[]) {
          if (newValue) {
            this.selectedUsers = [...newValue];
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.fetchAllMembers();
    },
    methods: {
      async fetchAllMembers() {
        this.members = (await Api.fetch('members?search=' + this.searchMemer)) ?? [];
      },
      onSubmit() {
        this.$emit('onSubmit', this.selectedUsers);
      },
      closePopup() {
        this.$emit('closePopup');
      },
      toggleSelection(event: Event) {
        if ((event.target as HTMLInputElement).checked) {
          this.selectedUsers = this.members.map((data: IMemberType) => data.MemberId!);
        } else {
          this.selectedUsers = [...(this.selectedMembers ? this.selectedMembers : [])];
        }
      },
    },
  });
</script>

<style scoped>
  .importmembers-header {
    padding: 10px 0px;
    align-items: center;
  }
  .importmember-body-wrapper table tr th,
  .importmember-body-wrapper table tr td {
    padding: 5px 10px;
  }

  .importmember-body-wrapper table tr th:first-child {
    width: 40px;
  }

  .search-box {
    min-width: 165px;
    max-width: 250px;
  }
</style>
