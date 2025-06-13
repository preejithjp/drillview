<template>
  <div class="chatgroupcard-container hoverable-section d-flex flex-col gap20">
    <div class="d-flex gap5">
      <span class="chatgroupcard-header-icon d-flex align-center">
        <GroupAvatar :name="group.GroupName" :image="group?.GroupIcon" :colorIndex="cardIndex" />
      </span>
      <div v-if="group.GroupName" class="chatgroupcard-header-title d-flex flex-col flex-full text-ellipsis">
        <span :title="group.GroupName" class="text-ellipsis capitalize fontBold fontSize-12">
          {{ group.GroupName }}
        </span>
        <span v-dateTimeFormat="'dd Month yyyy hh:mi AM'" class="text-senary text-ellipsis capitalize fontMedium fontSize-10">
          {{ group.CreatedDate }}
        </span>
      </div>
    </div>
    <div class="d-flex flex-col gap5 text-senary mb5">
      <span v-if="group.Activities?.length" :title="group.Activities?.join(' | ')" class="text-ellipsis capitalize fontMedium fontSize-10">
        {{ group.Activities?.join(' | ') }}
      </span>
    </div>
    <span class="chatgroupcard-actionbox d-flex gap5 align-items-center">
      <SvgIcon name="edit-icon" title="Edit Chat Group" class="hover-visible svg-icon size16 text-quinary" @click="onEditGroupBtnClick" />
      <SvgIcon name="user-icon-02" title="View Group Members" class="chatgroupcard-add-member-icon svg-icon" @click="onAddMembersBtnClick" />
    </span>
  </div>
</template>

<script lang="ts">
  import { Routes } from '@/router';
  import { IGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { defineComponent, PropType } from 'vue';
  import GroupAvatar from '@/components/Chat/GroupAvatar.vue';

  export default defineComponent({
    name: 'ChatGroupCard',
    components: {
      GroupAvatar,
    },
    props: {
      group: {
        type: Object as PropType<IGroupData>,
        required: true,
      },
      cardIndex: {
        type: Number,
        default: 0,
      },
    },
    emits: {
      onEditGroupBtnClick(item: IGroupData) {
        return !!item;
      },
    },
    data() {
      return {
        filterInput: '' as string,
      };
    },
    computed: {},
    watch: {},
    mounted() {},
    methods: {
      onAddMembersBtnClick() {
        this.$router.push({ name: Routes.ChatGroupMembers, params: { gId: this.group.GroupId } });
      },
      onEditGroupBtnClick() {
        this.$emit('onEditGroupBtnClick', this.group);
      },
    },
  });
</script>

<style scoped>
  .chatgroupcard-container {
    background: var(--bg-septenary);
    flex-direction: column;
    position: relative;
    padding: 10px;
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
  }

  .chatgroupcard-header-icon {
    color: var(--text-static-primary);
    height: 80px;
    width: 80px;
    background-color: var(--text-static-secondary);
    border-radius: 50%;
  }

  .chatgroupcard-header-title {
    padding: 10px;
    justify-content: center;
    gap: 2px;
  }

  .chatgroupcard-add-member-icon {
    height: 28px;
    width: 26px;
    color: var(--icon-secondary);
  }

  .chatgroupcard-actionbox {
    position: absolute;
    top: 6px;
    right: 10px;
  }
</style>
