<template>
  <div class="container-body1 height-100 width-100">
    <div class="leftPanelHeader">
      <span class="fontSemibold">Settings</span>
    </div>
    <div class="form-container fontSize-14">
      <div class="form-group">
        <label for="job-name" class="field-label">Job Name</label>
        <input
          id="job-name"
          v-model="generalDetails.Name"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Job Name" />
      </div>
      <div class="form-group">
        <label for="well-uid" class="field-label">Well Uid</label>
        <div class="d-flex gap5 align-items-center input-container">
          <input
            id="well-uid"
            v-model="generalDetails.Well.Uid"
            type="text"
            autocomplete="off"
            class="fontNormal field-bg"
            placeholder="Enter the Well Uid" />
          <SvgIcon name="reload-icon" class="reload-icon svg-icon size20" @click="generalDetails.Well.Uid = generateUUID()" />
        </div>
      </div>
      <div class="form-group">
        <label for="well-name" class="field-label">Well Name</label>
        <input
          id="well-name"
          v-model="generalDetails.Well.Name"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Well Name" />
      </div>
      <div class="form-group">
        <label for="wellbore-id" class="field-label">Wellbore Id</label>
        <div class="d-flex gap5 align-items-center input-container">
          <input
            id="wellbore-id"
            v-model="generalDetails.Wellbore.Uid"
            type="text"
            autocomplete="off"
            class="fontNormal field-bg"
            placeholder="Enter the Wellbore Id" />
          <SvgIcon name="reload-icon" class="svg-icon size20 reload-icon" @click="generalDetails.Wellbore.Uid = generateUUID()" />
        </div>
      </div>
      <div class="form-group">
        <label for="wellbore-name" class="field-label">Wellbore Name</label>
        <input
          id="wellbore-name"
          v-model="generalDetails.Wellbore.Name"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Wellbore Name" />
      </div>
      <div class="form-group">
        <label for="Operator" class="field-label">Operator</label>
        <input
          id="Operator"
          v-model="generalDetails.Well.Operator"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Operator" />
      </div>
      <div class="form-group">
        <label for="service-company" class="field-label">Service Company</label>
        <input
          id="service-company"
          v-model="generalDetails.Well.ServiceCompany"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Service Company" />
      </div>
      <div class="form-group">
        <label for="field" class="field-label">Field</label>
        <input
          id="field"
          v-model="generalDetails.Well.Field"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Field" />
      </div>
      <div class="form-group">
        <label for="country" class="field-label">Country</label>
        <input
          id="country"
          v-model="generalDetails.Well.Country"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Country" />
      </div>
      <div class="form-group">
        <label for="region" class="field-label">Region</label>
        <input
          id="region"
          v-model="generalDetails.Well.Region"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Region" />
      </div>
      <div class="form-group">
        <label for="block" class="field-label">Block</label>
        <input
          id="block"
          v-model="generalDetails.Well.Block"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Block" />
      </div>
      <div class="form-group">
        <label for="pass-number" class="field-label">Pass Number</label>
        <input
          id="pass-number"
          v-model="generalDetails.PassNumber"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Pass Number" />
      </div>
      <div class="form-group">
        <label for="run-number" class="field-label">Run Number</label>
        <input
          id="run-number"
          v-model="generalDetails.RunNumber"
          type="text"
          autocomplete="off"
          class="fontNormal field-bg"
          placeholder="Enter the Run Number" />
      </div>
      <div class="form-group">
        <label for="frequency" class="field-label">Send data in frequency in sec</label>
        <input
          id="frequency"
          v-model="generalDetails.TransferFrequencyInsec"
          type="number"
          autocomplete="off"
          class="fontNormal field-bg"
          min="0"
          oninput="validity.valid||(value='');"
          placeholder="Enter Send data in frequency in sec" />
      </div>
      <div class="form-group">
        <label for="frequency" class="field-label">Maximum items in Queue</label>
        <input
          id="frequency"
          v-model="generalDetails.MaxMessageQued"
          type="number"
          autocomplete="off"
          class="fontNormal field-bg"
          min="0"
          oninput="validity.valid||(value='');"
          placeholder="Enter Maximum items in Queue" />
      </div>
      <div class="form-group dropdown-height">
        <label for="job-name" class="field-label">Time Zone</label>
        <DropDown :options="timeZoneOptions" placeholder="Select Time Zone" class="filter-dropdown" />
      </div>
      <div class="form-group dropdown-height">
        <label for="use_time" class="field-label">Use Time</label>
        <DropDown :options="filterOptions" placeholder="All" class="filter-dropdown" />
      </div>
      <div class="form-group dropdown-height">
        <label for="job-name" class="field-label">Receiving date format</label>
        <DropDown :options="filterOptions" placeholder="All" class="filter-dropdown" />
      </div>
      <div class="setPadding d-flex justify-content-space-between align-flexend">
        <span>Log Input Message</span>
        <div class="d-flex gap5">
          <label class="">
            <input v-model="generalDetails.LogMessage" type="radio" name="options" :value="true" checked />
            Enabled
          </label>
          <label class="">
            <input v-model="generalDetails.LogMessage" type="radio" name="options" :value="false" />
            Disabled
          </label>
        </div>
      </div>
      <div class="setPadding d-flex justify-content-space-between align-flexend">
        <span>Buffer to disc</span>
        <div class="d-flex gap5">
          <label class="">
            <input v-model="generalDetails.BufferToDisc" type="radio" name="option" :value="true" checked />
            Enabled
          </label>
          <label class="">
            <input v-model="generalDetails.BufferToDisc" type="radio" name="option" :value="false" />
            Disabled
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { IRig } from '../../server/interfaces/datacollection.interfaces';
  import { IDropdownOptions } from './Globals/DropDown.vue';
  import { PropType } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import TimeZones from '../assets/timezone';

  export default {
    name: 'GeneralRecords',
    props: {
      generalData: {
        type: Object as PropType<IRig>,
        required: true,
        default: () => {},
      },
    },
    emits: ['dataFromGeneral'],
    data() {
      return {
        filterOptions: [
          { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
          { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
          { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
          { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
        ] as IDropdownOptions[],
        generalDetails: {} as IRig,
      };
    },
    computed: {
      timeZoneOptions() {
        return TimeZones.map((item) => ({
          label: item.value,
          value: item.value,
        }));
      },
    },
    watch: {
      generalData: {
        handler(newVal) {
          this.generalDetails = newVal ? newVal : {};
        },
        immediate: true,
        deep: true,
      },
      generalDetails: {
        handler() {
          this.$emit('dataFromGeneral', this.generalDetails);
        },
        deep: true,
      },
    },
    methods: {
      generateUUID() {
        return uuidv4();
      },
    },
  };
</script>

<style scoped>
  .container-body1 {
    padding-top: 5px;
    background-color: var(--bg-quaternary);
    height: 100% !important;
  }
  .leftPanelHeader {
    background-color: var(--bg-tertiary);
    padding: 10px;
    color: var(--text-primary);
  }

  .form-group {
    display: grid;
    gap: 2px;
    width: 100%;
    align-items: center;
    padding: 5px 15px 5px 15px;
  }
  .btnStyle {
    padding: 5px;
    width: 80px;
  }
  .form-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    overflow: auto;
    height: 90%;
    padding-top: 10px;
  }
  .dropdown-height {
    grid-template-rows: 1fr 35px;
  }
  .filter-dropdown {
    border: 1px solid var(--border-tertiary);
  }
  .align-flexend {
    align-items: flex-end;
  }
  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  .reload-icon {
    position: absolute;
    right: 10px;
    cursor: pointer;
    color: var(--icon-secondary);
  }
  .field-bg {
    background: var(--bg-septenary);
  }
  .setPadding {
    padding: 5px 15px 10px 15px;
  }
</style>
