<template>
  <div>
    <span v-if="!image && !name" class="default-svg-wrapper">
      <SvgIcon name="chat-group-icon-02" class="svg-icon default-svg-icon" />
    </span>
    <template v-else>
      <span v-if="image" :style="`background-image: url(${image})`" class="avatar-img-conatiner">
        <img :src="image" alt="Avatar Image" />
      </span>
      <span v-else :style="`font-size: ${fontSize}px; background-color: ${generateRandomHexColor()}`" class="fontSemibold">
        {{ findInitials(name) }}
      </span>
    </template>
    <span v-if="isEditable" class="avatar-overlay" @click="$refs.avatarImg.click()">
      <SvgIcon name="edit-icon" class="svg-icon size16" />
    </span>
    <input ref="avatarImg" type="file" style="display: none" accept="image/*" @change="onFileChange" />
    <span v-if="badge" class="badge fontSize-10 fontSemibold">
      {{ badge.label }}
    </span>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { valueIsInEnum } from '@/common/utils';
  import { UserStatus } from '../../../server/interfaces/websocket.interfaces';
  import { store } from '@/main';
  import { ToastType } from '../ToastMessage.vue';

  export interface BadgeOptions {
    label: string;
  }

  export default defineComponent({
    name: 'GroupAvatar',
    props: {
      image: {
        type: String,
      },
      name: {
        type: String,
      },
      isEditable: {
        type: Boolean,
        default: false,
      },
      isUploadImageClicked: {
        type: Boolean,
        default: false,
      },
      colorIndex: {
        type: Number,
        default: 0,
      },
      badge: {
        type: Object as PropType<BadgeOptions>,
        default: null,
      },
    },
    emits: {
      onIconUpload(avatarIcon: string) {
        return !!avatarIcon;
      },
    },
    data() {
      return {
        valueIsInEnum: valueIsInEnum,
        IMemberStatus: UserStatus,
        fontSize: 8,
        colorList: ['#D4F1F4', '#C2EABD', '#B3E5FC', '#A7E3D8', '#E0F7FA', '#C5E1A5', '#D0F0C0', '#B2EBF2', '#C8E6C9', '#D9F7FF'],
        seperator: '#$#' as string,
        supportedFileTypes: ['image/jpeg', 'image/png'],
        maxFileSize: 100 * 1024, // 100KB in bytes
      };
    },
    watch: {
      isUploadImageClicked() {
        const avatarImg = this.$refs.avatarImg as HTMLInputElement;
        avatarImg.click();
      },
    },
    mounted() {
      this.fontSize = this.calculateFontSize();
    },

    methods: {
      findInitials(name?: string) {
        if (name) {
          let seperator = ' ';
          if (name.includes(this.seperator)) {
            seperator = this.seperator;
          }
          const words = name.split(seperator);
          if (words.length === 1) {
            return name.slice(0, 2).toUpperCase();
          }
          const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');
          return initials ? initials.substring(0, 2) : 'N/A';
        } else {
          return 'N/A';
        }
      },
      calculateFontSize() {
        if (this.$el && this.$el.clientHeight > 0) {
          return Math.round(Math.max(this.$el.clientHeight / 2.5, 8));
        }
        return 8;
      },
      generateRandomHexColor() {
        const index = this.colorIndex % this.colorList.length;
        return this.colorList[index];
      },
      onFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target?.files ? target.files[0] : null;
        if (file) {
          // Validate file type
          if (!this.supportedFileTypes.some((type) => file.type.match(type))) {
            const supportedImages = this.supportedFileTypes.map((type) => type.replace('image/', '')).join(', ');
            store.showToast(ToastType.ERROR, `File ${file.name} is not supported. Please use ${supportedImages} images.`);
            target.value = '';
            return;
          }
          // Validate file size
          else if (file.size > this.maxFileSize) {
            store.showToast(ToastType.ERROR, `File : ${file.name} exceeds the size limit of ${this.maxFileSize / 1024} KB.`);
            target.value = '';
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const avatarIcon = reader.result as string;
            this.$emit('onIconUpload', avatarIcon);
          };
          reader.readAsDataURL(file);
        }
      },
    },
  });
</script>

<style scoped>
  div {
    min-width: 15px;
    min-height: 15px;
    width: 100%;
    height: 100%;
    position: relative;
    border: 0px;
    border-radius: 50%;
  }

  span {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: absolute;
    border-radius: 50%;
    overflow: hidden;
  }

  .avatar-img-conatiner {
    background-color: var(--bg-quaternary);
    background-size: 200vh;
    background-position: left top;
  }

  .avatar-img-conatiner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: inherit;
    background-size: inherit;
    background-position: inherit;
    filter: blur(10px);
  }

  img {
    object-fit: cover;
    position: absolute;
    width: 80%;
    height: 80%;
    border-radius: 50%;
    overflow: hidden;
    object-position: center;
    overflow: visible;
  }

  .default-svg-wrapper {
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
  }

  .default-svg-icon {
    width: 75%;
    height: 75%;
  }

  .avatar-overlay {
    background-color: var(--bg-septenary);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .avatar-overlay:hover {
    opacity: 80%;
  }

  .badge {
    background-color: var(--high-priority);
    color: var(--text-static-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    white-space: nowrap;
    position: absolute;
    width: 80%;
    border-radius: 999px;
    top: -8%;
    right: -8%;
  }
</style>
