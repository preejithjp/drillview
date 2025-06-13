<template>
  <VForm v-slot="{ handleSubmit }">
    <CommonPopup
      headerIcon="wellbore-icon"
      :popup-title="`Create ${selectType}`"
      secondary-btn-text="Cancel"
      primary-btn-text="Save"
      :wrapper-style="{ width: '40%', height: '50%' }"
      @on-cancel="closePopup"
      @on-submit="handleSubmit(onSubmit)">
      <div class="height-100 width-100">
        <div class="popup-fields">
          <div class="field d-flex align-items-center gap5 mb10">
            <label for="operator-name" class="field-label">Name</label>
            <Field
              v-slot="{ field, errors, errorMessage, handleChange, meta }"
              v-model="createdObject.Name"
              rules="required"
              as="div"
              type="text"
              class="p-relative flex-full"
              name="Name">
              <input
                v-bind="field"
                id="name-filed"
                type="text"
                :aria-invalid="!meta.valid && meta.touched"
                class="field-input fontNormal width-100"
                placeholder="Enter Object Name"
                @input="handleChange" />
              <span v-if="errors[0] && meta.touched" class="invalid-msg fontSize-10">{{ errorMessage }}</span>
            </Field>
          </div>

          <div class="field d-flex align-items-center gap5 mb10">
            <label for="operator-name" class="field-label">Use UUID</label>
            <input
              v-model="createdObject.UseUUID"
              type="checkbox"
              class="field-input fontNormal"
              @change="!createdObject.UseUUID ? (createdObject.UUID = '') : (createdObject.UUID = generateUUID())" />
          </div>

          <div class="field d-flex align-items-center gap5 mb10">
            <label for="operator-name" class="field-label">UUID</label>
            <input id="operator-name" v-model="createdObject.UUID" disabled type="text" class="field-input fontNormal" placeholder="UUID" />
          </div>

          <div v-if="selectType == tab.OtherObjects" class="field d-flex align-items-center gap5 mb10">
            <label for="operator-name" class="field-label">Object Type</label>
            <DropDown
              v-model="createdObject.ObjectType"
              :options="filterOptions()"
              placeholder="Select Objects"
              class="filter-dropdown fontNormal fontSize-14 field-input" />
          </div>

          <div v-if="selectType == tab.Log" class="field d-flex align-items-center gap5 mb10">
            <label for="operator-name" class="field-label">Index Type</label>
            <DropDown
              v-model="createdObject.IndexType"
              :options="filterIntedType()"
              placeholder="Select index type"
              class="filter-dropdown fontNormal fontSize-14 field-input" />
          </div>
        </div>
      </div>
    </CommonPopup>
  </VForm>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from '../Common/CommonPopup.vue';
  import { v4 as uuidv4 } from 'uuid';
  import { CreateObject, ObjectTypes, Tabs } from '@/interfaces/synchronizer.interface';
  import { IndexTypes, ObjectTypesToGet } from './../../../server/interfaces/datasimplex.interfaces';
  import { Field, Form as VForm } from 'vee-validate';

  export default defineComponent({
    name: 'CreateObjects',
    components: {
      CommonPopup,
      Field,
      VForm,
    },
    props: {
      selectType: {
        type: String,
        default: Tabs.Log,
      },
    },
    emits: ['closePopup', 'onSubmit'],
    data() {
      return {
        createdObject: {
          Name: '',
          UseUUID: false,
          UUID: '',
          ObjectType: ObjectTypesToGet.Rig,
          IndexType: IndexTypes.Time,
        } as CreateObject,
        objectType: ObjectTypes,
        tab: Tabs,
      };
    },
    mounted() {},
    methods: {
      closePopup() {
        this.$emit('closePopup');
      },
      onSubmit() {
        this.$emit('onSubmit', this.createdObject);
      },
      generateUUID() {
        return uuidv4();
      },
      filterOptions() {
        return Object.keys(ObjectTypes);
      },
      filterIntedType() {
        return Object.values(IndexTypes);
      },
    },
  });
</script>

<style scoped>
  .field {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 38px;
  }

  .field div {
    width: 78%;
  }

  .popup-fields {
    padding: 16px;
  }

  .popup-fields label {
    width: 20%;
  }

  .filter-dropdown {
    border: 1px solid var(--border-tertiary);
    height: 38px;
  }
</style>
