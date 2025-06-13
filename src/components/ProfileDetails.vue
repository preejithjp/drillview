<template>
  <div class="profile-form">
    <div class="form-group">
      <label for="display-name">Display name</label>
      <input id="display-name" v-model="ProfileData.Name" type="text" />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="ProfileData.Email" type="email" />
    </div>
    <div class="form-group">
      <label>User Image</label>
      <label for="user-profile" class="btn primary">Choose an image</label>
      <input id="user-profile" type="file" accept="image/*" class="d-hidden" @change="onFileChange" />
    </div>
    <div class="form-group">
      <label>Status</label>
      <span class="fontSize-14">{{ ProfileData.Enabled ? 'Active' : 'In Active' }}</span>
    </div>
    <div class="form-group">
      <label></label>
      <div class="btn primary chnage-password" @click.stop="openChangePasswordPopup()">Change password</div>
    </div>
    <div class="form-group save-profile">
      <div :class="['btn', 'primary', { 'disable-Item': checkIfFormChanged() }]" class="btn primary" @click.stop="saveProfile()">Save</div>
    </div>
    <ChangePasswordPopup v-if="showChangePasswordPopup" @cancel="closeChangePasswordPopup" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ChangePasswordPopup from './ChangePasswordPopup.vue';
  import { IMember } from '../../server/interfaces/member.interfaces';
  import { Api } from '../services/api.services';
  import { store } from '../main';

  export default defineComponent({
    name: 'ProfileDetails',
    components: {
      ChangePasswordPopup,
    },
    emits: ['profileImage'],
    data() {
      return {
        showChangePasswordPopup: false as boolean,
        cloneProfileData: {} as Partial<IMember>,
        ProfileData: {
          Name: '',
          Email: '',
          Image: '',
          Enabled: true,
        } as Partial<IMember>,
      };
    },
    created() {
      this.getProfileDetails();
    },
    methods: {
      openChangePasswordPopup() {
        this.showChangePasswordPopup = true;
      },
      closeChangePasswordPopup() {
        this.showChangePasswordPopup = false;
      },
      onFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target?.files ? target.files[0] : null;
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.ProfileData.Image = reader.result as string;
            this.cloneProfileData.Image = '';
            this.$emit('profileImage', this.ProfileData.Image);
          };
          reader.readAsDataURL(file);
        }
      },
      async getProfileDetails() {
        const memberId = store.userInfo.MEMBERID;
        if (memberId) {
          const getMemberResponse = await Api.fetch(`members/${memberId}`);
          if (getMemberResponse?.length) {
            const { Name, Email, Image, Enabled } = getMemberResponse[0];
            this.ProfileData = { Name, Email, Image, Enabled };
            if (this.ProfileData?.Image) {
              this.$emit('profileImage', this.ProfileData.Image);
            }
            store.userInfo.email = this.ProfileData.Email as string;
            store.userInfo.name = this.ProfileData.Name as string;
            this.cloneProfileData = { Name, Email, Image, Enabled };
          }
        }
      },
      async saveProfile() {
        const MemberId = store.userInfo.MEMBERID;
        await Api.patch(`members/${MemberId}`, this.ProfileData);
        store.userInfo.email = this.ProfileData.Email as string;
        store.userInfo.name = this.ProfileData.Name as string;
        this.cloneProfileData = { ...this.ProfileData };
      },
      checkIfFormChanged() {
        return JSON.stringify(this.ProfileData) === JSON.stringify(this.cloneProfileData);
      },
    },
  });
</script>

<style scoped>
  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 50%;
  }

  .form-group {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  label {
    width: 150px;
    font-size: 0.875rem;
  }
  .chnage-password {
    width: 150px;
  }

  .save-profile {
    justify-content: end;
  }
</style>
