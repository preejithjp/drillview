<template>
  <div>
    <CommonPopup
      popup-title="Property Selector"
      secondary-btn-text="Cancel"
      primary-btn-text="Select"
      @on-cancel="closePopup"
      @on-submit="onSelectClick">
      <PropertySelector @on-property-selected="onPropertySelected" />
    </CommonPopup>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import PropertySelector, { SelectedProperty } from './Chat/CurveSelector.vue';
  import CommonPopup from './Common/CommonPopup.vue';
  export default defineComponent({
    name: 'PropertySelectorPopup',
    components: {
      CommonPopup,
      PropertySelector,
    },
    emits: ['onCancel', 'onSubmit'],
    data() {
      return {
        selectedProperty: {
          parentId: '',
          parentName: '',
          logName: '',
          propertyName: '',
        } as SelectedProperty,
      };
    },
    methods: {
      closePopup() {
        this.$emit('onCancel');
      },
      onSelectClick() {
        this.$emit('onSubmit', this.selectedProperty);
      },
      onPropertySelected(selectedProperty: SelectedProperty) {
        this.selectedProperty = selectedProperty;
      },
    },
  });
</script>

<style scoped></style>
