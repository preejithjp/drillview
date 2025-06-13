<template>
  <div class="profile-container height-100 width-100">
    <div class="profile-header">
      <ProfileImage :name="storeInstance" :image="imageName" class="profile-img" />
      <h1 class="fontSize-24">{{ storeInstance }}'s Profile</h1>
    </div>
    <ProfileDetails class="flex-full width-50" @profile-image="sentProfileImage" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ProfileDetails from '../components/ProfileDetails.vue';
  import ProfileImage from '../components/ProfileImage.vue';
  import { store } from '@/main';

  export default defineComponent({
    name: 'ProfilePage',
    components: {
      ProfileDetails,
      ProfileImage,
    },
    data() {
      return {
        imageName: '' as string,
      };
    },
    computed: {
      storeInstance() {
        return store.userInfo?.name || '';
      },
    },
    methods: {
      sentProfileImage(img: string) {
        this.imageName = img;
      },
    },
  });
</script>

<style scoped>
  .profile-container {
    background-color: var(--bg-quaternary);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .profile-img {
    width: 100px;
    height: 100px;
  }
</style>
