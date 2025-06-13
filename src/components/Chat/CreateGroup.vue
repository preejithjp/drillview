<template>
  <div>
    <CommonPopup
      :popup-title="selectedGroup ? 'Edit Group' : 'Create Group'"
      secondary-btn-text="Close"
      :primary-btn-text="selectedGroup ? 'Save' : 'ADD New Group'"
      :wrapperStyle="{ width: '50%' }"
      :disabledPrimaryBttn="!chatGroup.GroupName"
      @on-cancel="closePopup"
      @on-submit="saveGroupData">
      <div class="creategrouppopup-container d-flex flex-col gap20">
        <div class="d-flex gap10">
          <div class="groupicon-container d-flex flex-col gap5 flex-basis-25 flex-shrink-0">
            <div class="d-flex flex-col gap5 align-items-center">
              <GroupAvatar
                :isEditable="false"
                :isUploadImageClicked="isUploadGroupImage"
                :image="chatGroup.GroupIcon"
                class="group-avatar flex-shrink-0"
                @on-icon-upload="onGroupIconUpload"></GroupAvatar>
              <div class="cursor-pointer p10" @click="isUploadGroupImage = !isUploadGroupImage">
                <span class="text-tertiary font-Semibold fontSize-12">Change Icon</span>
              </div>
            </div>
          </div>
          <div class="d-flex flex-col flex-full gap20 fontSize-12">
            <span class="inputgroup">
              <label for="groupName" class="fontSemibold text-static-tertiary flex-basis-25">Group Name</label>
              <Field
                v-slot="{ field, errors, errorMessage, meta }"
                v-model="chatGroup.GroupName"
                name="Group Name"
                as="div"
                :rules="{ required: true }"
                class="p-relative d-flex flex-full">
                <input
                  id="groupName"
                  v-bind="field"
                  type="text"
                  :aria-invalid="!meta.valid && meta.touched"
                  class="inputbox secondary text-tertiary"
                  placeholder="Group Name" />
                <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
              </Field>
            </span>
            <span class="inputgroup">
              <label for="description" class="fontSemibold text-static-tertiary flex-basis-25">Description</label>
              <textarea
                id="description"
                v-model="chatGroup.Description"
                class="inputbox secondary large text-tertiary fontNormal"
                placeholder="Description"></textarea>
            </span>
            <span class="inputgroup">
              <label for="activities" class="fontSemibold text-static-tertiary flex-basis-25">For Activities</label>
              <Field
                v-slot="{ field, errors, errorMessage, meta }"
                ref="activity"
                v-model="activityInput"
                name="Activity"
                as="div"
                :rules="{ optional: true, existIn: chatGroup.Activities }"
                class="p-relative d-flex flex-full">
                <span class="activities-container" @click="focusActivityInput()">
                  <span v-for="activity in chatGroup.Activities" :key="activity" class="activity-tag">
                    <span class="tag-text">{{ activity }}</span>
                    <SvgIcon name="close-icon-circle" class="svg-icon size14" @click="removeActivity(activity)" />
                  </span>
                  <input
                    id="activities"
                    ref="activityInputRef"
                    v-bind="field"
                    type="text"
                    :aria-invalid="!meta.valid && meta.touched"
                    class="add-activity-input text-tertiary"
                    placeholder="Type and press Enter..."
                    @keyup.enter="addActivity()" />
                </span>
                <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
              </Field>
            </span>
          </div>
        </div>
      </div>
    </CommonPopup>
  </div>
</template>

<script lang="ts">
  import { IChatGroup, IGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { defineComponent, PropType } from 'vue';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import GroupAvatar from '@/components/Chat/GroupAvatar.vue';
  import { Api } from '@/services/api.services';
  import { store } from '@/main';
  import { ToastType } from '../ToastMessage.vue';
  import { Field } from 'vee-validate';

  export default defineComponent({
    name: 'CreateGroup',
    components: {
      CommonPopup,
      GroupAvatar,
      Field,
    },
    props: {
      selectedGroup: {
        type: Object as PropType<IGroupData | null>,
      },
    },
    emits: {
      closePopup: () => true,
      onGroupUpdated: () => true,
    },
    data() {
      return {
        activityInput: '',
        chatGroup: {} as Partial<IGroupData>,
        isUploadGroupImage: false as boolean,
      };
    },
    computed: {
      currentMemberId(): string {
        return store.userInfo.MEMBERID;
      },
    },
    mounted() {
      if (this.selectedGroup) {
        this.chatGroup = JSON.parse(JSON.stringify(this.selectedGroup));
      } else {
        this.chatGroup = {
          Description: '',
          Activities: [],
        };
      }
    },
    methods: {
      closePopup() {
        this.$emit('closePopup');
      },
      saveGroupData() {
        if (this.chatGroup.GroupName?.trim()) {
          if (this.selectedGroup) {
            this.updateGroup();
          } else {
            this.createGroup();
          }
        }
      },
      async createGroup() {
        const response = await Api.submit('chatgroups', this.chatGroup);
        if (response) {
          this.closePopup();
          this.$emit('onGroupUpdated');
        }
      },
      async updateGroup() {
        if (JSON.stringify(this.selectedGroup) === JSON.stringify(this.chatGroup)) {
          store.showToast(ToastType.WARN, 'No Changes to update Group.');
          return;
        }

        if (this.chatGroup.GroupId) {
          const data: Partial<IChatGroup> = {
            GroupName: this.chatGroup.GroupName,
            Description: this.chatGroup.Description,
            Activities: this.chatGroup.Activities,
            GroupIcon: this.chatGroup.GroupIcon,
          };
          const response = await Api.patch('chatgroups/' + this.chatGroup.GroupId, data);
          if (response) {
            this.closePopup();
            this.$emit('onGroupUpdated');
          }
        }
      },
      async addActivity() {
        const activityFieldRef = this.$refs['activity'] as InstanceType<typeof Field>;
        const validationResult = await activityFieldRef.validate();
        if (!validationResult.valid) {
          return;
        }
        if (!this.chatGroup.Activities) {
          this.chatGroup.Activities = [];
        }
        this.chatGroup.Activities?.push(this.activityInput);
        this.activityInput = '';
      },
      removeActivity(activity: string) {
        this.chatGroup.Activities = this.chatGroup.Activities?.filter((data) => data !== activity) ?? this.chatGroup.Activities;
      },
      focusActivityInput() {
        (this.$refs.activityInputRef as HTMLInputElement).focus();
      },
      onGroupIconUpload(avatarIcon: string) {
        this.chatGroup.GroupIcon = avatarIcon;
      },
    },
  });
</script>

<style scoped>
  .creategrouppopup-container {
    margin-bottom: 25px;
  }

  .activities-container {
    display: flex;
    align-items: center;
    flex: 1;
    background-color: var(--bg-septenary);
    padding: 5px 10px;
    border: 1px solid var(--border-tertiary);
    border-radius: 4px;
    gap: 8px;
    flex-wrap: wrap;
    max-height: 100px;
    overflow-y: auto;
  }

  .activity-tag {
    display: inline-flex;
    align-items: center;
    background-color: var(--bg-quaternary);
    color: var(--text-tertiary);
    padding: 4px 10px;
    border-radius: 3px;
    gap: 5px;
  }

  .activity-tag .tag-text {
    margin-bottom: 3px;
  }

  .remove-btn {
    display: grid;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .inputgroup label {
    flex-basis: 80px;
  }

  input.add-activity-input {
    flex-grow: 1;
    border: none;
    border-bottom: none;
    border-radius: 0;
    outline: none;
    background: transparent;
    padding: 6px;
    height: 30px;
  }

  .groupicon-container {
    margin-right: 35px;
    flex-basis: 18%;
  }

  .group-avatar {
    width: 80px;
    height: 80px;
    color: var(--icon-primary);
  }
</style>
