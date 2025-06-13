<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      :popupTitle="popupTitle"
      :primaryBtnText="dashboardAction === DashBoardAction.CLONE ? 'Clone' : dashboardAction === DashBoardAction.IMPORT ? 'Import' : 'Save'"
      secondaryBtnText="Cancel"
      :wrapperStyle="{ width: '50%' }"
      @on-submit="handleSubmit(onSave)"
      @on-cancel="onCancel">
      <div class="popup-fields">
        <div class="field">
          <label for="dashboard-name" class="field-label fontBold fontSize-14">Dashboard Name</label>
          <Field
            v-slot="{ field, errors, meta, errorMessage, handleChange }"
            v-model="dashboardDetails.DashboardName"
            as="div"
            type="text"
            name="Dashboard Name"
            :rules="dashboardNameRules"
            class="p-relative width-100 d-flex">
            <input
              v-bind="field"
              id="dashboard-name"
              placeholder="Enter Dashboard Name"
              type="text"
              class="fontNormal fontSize-14 flex-full"
              autocomplete="off"
              :aria-invalid="!meta.valid && meta.touched"
              @input="handleChange" />
            <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field">
          <label for="description" class="field-label fontBold fontSize-14">Description</label>
          <Field
            v-slot="{ field, errors, errorMessage }"
            v-model="dashboardDetails.Description"
            name="Description"
            as="div"
            class="p-relative width-100 d-flex">
            <textarea placeholder="Enter Description" class="fontNormal fontSize-14 flex-full" v-bind="field"></textarea>
            <span v-if="errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
        <div class="field">
          <label for="icon" class="field-label fontBold fontSize-14">Icon</label>
          <Field
            v-slot="{ errors, errorMessage, meta }"
            v-model="dashboardDetails.Icon"
            name="Icon"
            as="div"
            class="p-relative width-100"
            rules="required">
            <div class="d-grid align-items-center width-100 gap5 icon-container" :aria-invalid="!meta.valid">
              <div
                v-for="(item, index) in iconCollections"
                :key="index"
                class="icon"
                :class="{ active: dashboardDetails.Icon == item }"
                @click="dashboardDetails.Icon = item">
                <img :src="item" class="brighter" />
              </div>
              <div class="icon">
                <label>
                  <SvgIcon name="upload-icon" class="svg-icon size30 secondary"></SvgIcon>
                  <span class="text-ellipsis">Upload</span>
                  <input type="file" class="d-hidden" @change="handleFileUpload" />
                </label>
              </div>
            </div>
            <span v-if="errors[0]" class="invalid-msg fontSize-12">{{ errorMessage }}</span>
          </Field>
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { IDashboard, AllowIconType, DashboardStatus, IWidget, IDashboardUser } from '../../server/interfaces/dashboard.interfaces';
  import { generateUUID } from '@/common/utils';
  import { Api } from '@/services/api.services';
  import { store } from '@/main';
  import { ToastType } from './ToastMessage.vue';
  import { Field, Form as VForm } from 'vee-validate';
  import { DashBoardAction } from '@/interfaces/state.interfaces';

  export default defineComponent({
    name: 'CreateDashboard',
    components: { CommonPopup, Field, VForm },
    props: {
      dashboardData: {
        type: Object as () => IDashboard,
        required: false,
        default: () => ({
          DashboardName: '',
          DashboardId: '',
          Icon: '',
          Description: '',
        }),
      },
    },
    emits: ['cancel', 'onSubmit'],
    data() {
      return {
        DashBoardAction,
        dashboardDetails: { ...(this.dashboardData || {}) },
        originalDashboardName: JSON.parse(JSON.stringify(this.dashboardData?.DashboardName || '')),
        uploadIconFile: null as FileList | null,
        iconCollections: [] as string[],
        allDashboards: [] as IDashboardUser[],
      };
    },
    computed: {
      dashboardAction() {
        return store.dashboardAction;
      },
      popupTitle(): string {
        switch (this.dashboardAction) {
          case DashBoardAction.CLONE:
            return 'Clone Dashboard';
          case DashBoardAction.SAVEAS:
            return 'Save Dashboard As';
          case DashBoardAction.EDIT:
            return 'Edit Dashboard';
          case DashBoardAction.IMPORT:
            return 'Import Dashboard';
          case DashBoardAction.CREATE:
            return 'Create Dashboard';
          default:
            return 'Create Dashboard';
        }
      },
      isEditMode() {
        return this.dashboardAction === DashBoardAction.EDIT;
      },
      dashboardNameRules() {
        const otherNames = this.allDashboards
          .map((d) => d.DashboardName?.trim().toLowerCase())
          .filter((name) => name !== this.originalDashboardName?.trim().toLowerCase());
        return this.isEditMode
          ? { required: true, existIn: otherNames }
          : { required: true, existIn: this.allDashboards.map((dashboard) => dashboard.DashboardName) };
      },
    },
    mounted() {
      this.getAllDashboardData();
      this.readIcons();
    },
    methods: {
      async getAllDashboardData() {
        this.allDashboards = (await Api.fetch('Dashboard')) || [];
      },
      async onSave() {
        this.dashboardDetails = {
          DashboardId: this.dashboardAction === DashBoardAction.EDIT ? this.dashboardDetails.DashboardId : generateUUID(),
          DashboardName: this.dashboardDetails.DashboardName,
          SortOrder: this.dashboardDetails.SortOrder,
          Icon: this.dashboardDetails.Icon,
          SourceId: this.dashboardDetails.SourceId || '',
          Offsets: this.dashboardDetails.Offsets || [],
          Layout: (this.dashboardDetails.Layout || []).map((widget: IWidget) => {
            const layoutId = this.dashboardAction === DashBoardAction.EDIT ? widget.LayoutId : generateUUID();
            const settingId = this.dashboardAction === DashBoardAction.EDIT ? widget.Settings : generateUUID();
            return {
              ...widget,
              LayoutId: layoutId,
              Settings: settingId,
              SettingsDetails: {
                ...(widget.SettingsDetails || {}),
                SettingId: settingId,
              },
            } as IWidget;
          }),
          Description: this.dashboardDetails.Description || '',
          StatusCode: this.dashboardAction === DashBoardAction.EDIT ? this.dashboardDetails.StatusCode : DashboardStatus.Enabled,
        };
        await Api.submit('dashboard', this.dashboardDetails);
        this.$emit('onSubmit', this.dashboardDetails.DashboardId as string);
      },
      onCancel() {
        this.$emit('cancel');
      },
      handleFileUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        this.uploadIconFile = target.files;
        if (this.uploadIconFile && this.uploadIconFile.length) {
          const allowedTypes = AllowIconType;
          if (!allowedTypes.includes(this.uploadIconFile[0].type)) {
            store.showToast(ToastType.ERROR, 'Please upload a valid image file (JPEG, PNG, GIF, SVG, WebP, BMP, TIFF, ICO).');
            return;
          }
          const img = new Image();
          const objectURL = URL.createObjectURL(this.uploadIconFile[0]);
          img.onload = async () => {
            const requiredWidth = 200;
            const requiredHeight = 200;
            if (this.uploadIconFile && this.uploadIconFile.length && img.naturalWidth < requiredWidth && img.naturalHeight < requiredHeight) {
              await this.uploadFile();
            } else {
              store.showToast(ToastType.ERROR, `Please upload an image with dimensions ${requiredWidth}x${requiredHeight}px`);
            }
            URL.revokeObjectURL(objectURL);
          };

          img.src = objectURL;
        }
      },
      async readIcons() {
        const files = await Api.fetch('dashboard/getfiles/all');
        if (files && files.length) {
          this.iconCollections = files.map((key: string) => '/uploads/dashboardicon/' + key);
        }
      },
      async uploadFile() {
        if (this.uploadIconFile && this.uploadIconFile[0]) {
          const formdata = new FormData();
          formdata.append('file', this.uploadIconFile[0]);
          formdata.append('folderPath', 'dashboard');
          formdata.append('type', 'chat-message');
          await Api.upload('dashboard/dashboardicon', formdata);
          this.readIcons();
        }
      },
    },
  });
</script>

<style scoped>
  .popup-fields {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .field-label {
    flex: 0 0 140px;
    color: var(--text-quinary);
  }

  .dropdown {
    padding: 0.6rem;
    cursor: pointer;
    outline: none;
    border-radius: 3px;
    width: 100%;
    border: none;
    border-radius: 4px;
    background-color: var(--bg-form-input);
  }

  .icon-container {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 10px;
    justify-content: center;
    padding: 10px;
  }

  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    color: var(--text-tertiary);
  }

  .icon:hover {
    transform: scale(1.1);
    background: var(--layout-bg);
  }

  .icon.active {
    background: var(--layout-bg);
  }

  .icon span {
    font-size: 12px;
    margin-top: 5px;
    max-width: 100%;
    display: block;
  }

  textarea {
    min-height: 100px;
    width: 100%;
    padding: 0.6rem;
    outline: none;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 5px;
  }
</style>
