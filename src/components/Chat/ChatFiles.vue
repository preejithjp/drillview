<template>
  <div class="file-list fontMedium fontSize-13">
    <template v-for="(file, index) in chatFiles" :key="index">
      <span class="file-item gap20">
        <span class="d-flex flex-full justify-content-space-between">
          <span>{{ file.FileName }}</span>
          <span class="pl10">{{ getFileSize(file.Size) }}</span>
        </span>
        <SvgIcon name="import-icon" class="svg-icon size20 text-secondary" @click="downloadImage(file)" />
      </span>
    </template>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IFile } from '../../../server/interfaces/chatmessage.interfaces';
  import { store } from '@/main';
  import { fileSizeUnits } from './ChatArea.vue';
  export default defineComponent({
    name: 'ChatFiles',
    props: {
      chatFiles: {
        type: Array as PropType<IFile[]>,
        required: true,
      },
    },
    data() {
      return {
        sizes: ['Bytes', 'KB', 'MB'],
      };
    },
    computed: {
      currentMemberId() {
        return store.userInfo.MEMBERID;
      },
    },
    methods: {
      getFileSize(size?: number) {
        if (!size || size <= 0) return '0 Bytes';
        const i = Math.min(Math.floor(Math.log(size) / Math.log(1024)), fileSizeUnits.length - 1);
        return `${(size / Math.pow(1024, i)).toFixed(2)} ${fileSizeUnits[i]}`;
      },
      async downloadImage(file: IFile) {
        const rawPath = file.File;
        const webCompatiblePath = this.formatPath(rawPath);
        const imagePath = '/' + webCompatiblePath;
        const response = await fetch(imagePath);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.FileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      formatPath(filePath: any) {
        return filePath.replace(/\\/g, '/');
      },
    },
  });
</script>

<style scoped>
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 10px;
  }
</style>
