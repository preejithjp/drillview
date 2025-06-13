<template>
  <section class="d-flex flex-col" @input="$emit('update:modelValue', localTrackSettings)">
    <template v-for="(t, ti) in localTrackSettings" :key="ti">
      <div v-if="t.TrackType !== 'Index'" class="pt10 d-flex justify-content-space-between">
        <div class="heading fontBold fontSize-14">
          <label class="text-tertiary">{{ t.TrackName }}</label>
        </div>
        <SvgIcon name="circle-plus-icon" class="svg-icon size20 icon-active-color ml-auto" @click="openPopupChannelSelection(true, ti, 0)" />
      </div>
      <template v-for="(c, i) in t.Curve" :key="i">
        <div :class="['curve-cointainer mt10', { 'no-border': i === t.Curve.length - 1 }]">
          <div class="d-flex">
            <label>Name:</label>
            <span class="flex-full" @click="openPopupChannelSelection(false, ti, i)">{{ c.Mnemonic?.MnemonicName || 'Select Curve' }}</span>
            <SvgIcon name="delete-icon" class="svg-icon size15" @click.stop="removeCurve(ti, i)" />
          </div>
          <div class="d-flex pt5">
            <label class="pr10 nowrap">Display Name</label>
            <input v-model="c.DisplayName" type="text" />
          </div>
          <div class="d-flex pt5">
            <label class="pr10">Chart Type</label>
            <select v-model="c.ChartType">
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="stepLine">Step Line</option>
              <option value="stepArea">Step Area</option>
              <!-- <option value="spline">Spline</option> -->
              <!-- <option value="text">Text</option> -->
              <option value="scatter">Scatter</option>
            </select>
          </div>
          <div class="d-flex pt5">
            <div class="d-flex p-relative">
              <label class="pr5">Color</label>
              <ColorPicker v-model="c.CurveColor"></ColorPicker>
            </div>
            <div class="d-flex flex-full pl10">
              <label class="pr5">Line Style</label>
              <select v-model="c.LineStyle" class="width-60px">
                <option value="solid">Solid</option>
                <option value="shortDash">Solid Dash</option>
                <option value="shortDot">Solid Dot</option>
                <option value="shortDashDot">Solid Dash Dot</option>
                <option value="shortDashDotDot">Short Dash Dot Dot</option>
                <option value="dot">Dot</option>
                <option value="dash">Dash</option>
                <option value="dashDot">Dash Dot</option>
                <option value="longDash">Long Dash</option>
                <option value="longDashDot">Long Dash Dot</option>
                <option value="longDashDotDot">Long Dash Dot Dot</option>
              </select>
            </div>
          </div>
          <div class="d-flex pt5 p-relative">
            <div class="d-flex pt5 p-relative">
              <label class="pr5 nowrap">Fill Colour</label>
              <ColorPicker v-model="c.FillColor"></ColorPicker>
            </div>
            <div class="d-flex pt5 pl10 p-relative">
              <label class="pr5 nowrap">Zero Line</label>
              <input v-model="c.ZeroLine" class="width-100" type="number" />
            </div>
          </div>
          <div class="d-flex pt5">
            <label class="pr5 nowrap">Line Thickness</label>
            <input v-model="c.LineThickness" type="number" />
          </div>
          <div class="d-flex pt5">
            <div class="d-flex pr5 align-items-center">
              <label class="pr5">Marker</label>
              <input v-model="c.Marker" type="checkbox" class="size14" />
            </div>
            <div class="d-flex pr5">
              <label class="pr5">Shape</label>
              <select v-model="c.MarkerType">
                <option value="ellipse">Circle</option>
                <option value="square">Square</option>
                <option value="triangle">Triangle</option>
                <option value="cross">Cross</option>
              </select>
            </div>
            <div class="d-flex">
              <label class="pr5">Size</label>
              <input v-model="c.MarkerSize" type="number" class="border-color-picker" />
            </div>
          </div>
          <div class="d-flex pt5 min-height-35">
            <div class="d-flex pr5 align-items-center">
              <label class="pr5">Visible</label>
              <input v-model="c.Visible" type="checkbox" class="size14" />
            </div>
            <div class="d-flex pr5 align-items-center">
              <label class="pr5">Show Value</label>
              <input v-model="c.ShowValue" :disabled="c.ChartType === 'text'" type="checkbox" class="size14" />
            </div>
          </div>
        </div>
      </template>
    </template>
  </section>
  <CurveSelectionPopup
    v-if="showcurveselection"
    v-model="selectedCurves"
    :isMultiSelect="isMultiSelect"
    :indexType="indexType"
    :curveSelectUri="curveSelectUri"
    @close-mnemonic-popup="closePopup"
    @click.stop="() => {}"
    @submit="onSelectClick"
    @update-curve-data="updateCurveData" />
</template>

<script lang="ts">
  import { ref, PropType } from 'vue';
  import { TrackSettings } from '../../../server/helpers/settings.helpers/track.settings.helper';
  import { defineComponent } from 'vue';
  import CurveSelectionPopup, { CurveSelectionDetails } from '../CurveSelectionPopup.vue';
  import ColorPicker from '../Common/ColorPicker.vue';
  import { DataIndexTypes } from '../../../server/helpers/settings.helpers/general.settings.helper';

  export default defineComponent({
    components: {
      CurveSelectionPopup,
      ColorPicker,
    },
    props: {
      modelValue: {
        type: Object as () => TrackSettings[] | null,
        default: undefined,
      },
      wellboreUri: String,
      indexType: {
        type: Object as PropType<DataIndexTypes>,
        default: DataIndexTypes.Time,
      },
    },
    emits: ['openPopupChannelSelection', 'update:modelValue'],
    data() {
      return {
        localTrackSettings: {} as TrackSettings[],
        isMultiSelect: true as boolean,
        showcurveselection: false as boolean,
        selectedCurves: [] as CurveSelectionDetails[],
        selectedTrackIndex: 0 as number,
        selectedCurveIndex: 0 as number,
        curveSelectUri: ref((this.wellboreUri || '') as string),
        curveColors: ['#4D79FF', '#FF0000', '#00FF04', '#BB00FF', '#FF4500', '#70D4FF', '#878787', '#FFD500', '#FE48C5', '#00FBFF'] as string[],
      };
    },
    computed: {},
    watch: {
      wellboreUri: {
        handler(newValue) {
          this.curveSelectUri = newValue;
        },
      },
      modelValue: {
        handler(newValue: TrackSettings[] | undefined) {
          if (newValue) {
            this.localTrackSettings = newValue;
          }
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      updateCurveData(data: CurveSelectionDetails[]) {
        if (this.isMultiSelect) {
          data.forEach((curve) => {
            this.addCurve(this.selectedTrackIndex, curve);
          });
        } else {
          this.localTrackSettings[this.selectedTrackIndex].Curve[this.selectedCurveIndex].Mnemonic = {
            MnemonicName: data[0].name,
            MnemonicId: data[0].id,
            Unit: data[0].unit,
          };
          this.localTrackSettings[this.selectedTrackIndex].Curve[this.selectedCurveIndex].DisplayName = data[0].name;
        }
        //
      },
      removeCurve(trackIndex: number, curveIndex: number) {
        this.localTrackSettings[trackIndex].Curve.splice(curveIndex, 1);
      },
      closePopup() {
        this.showcurveselection = false;
      },
      getRandomHexColor() {
        return `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, '0')}`;
      },
      async openPopupChannelSelection(multiple: boolean, selectedTrackIndex: number, selectedCurveIndex: number) {
        this.isMultiSelect = multiple;
        this.selectedTrackIndex = selectedTrackIndex;
        this.selectedCurveIndex = selectedCurveIndex;
        this.showcurveselection = true;
      },
      onSelectClick() {
        this.closePopup();
      },
      openPopup() {
        this.$emit('openPopupChannelSelection');
      },
      // removeCurve(index: number) {
      //   this.$emit("removeMnemonic", index);
      // },
      addCurve(index: number, curve: CurveSelectionDetails) {
        const color = this.curveColors[(this.localTrackSettings[index].Curve.length + 1) % 10];
        this.localTrackSettings[index].Curve.push({
          CurveColor: color,
          ChartType: 'line',
          LineStyle: 'solid',
          LineThickness: 1,
          ZeroLine: 0,
          Mnemonic: { MnemonicName: curve.name, MnemonicId: curve.id, Unit: curve.unit },
          Marker: false,
          MarkerSize: 5,
          MarkerType: 'ellipse',
          DisplayName: curve.name,
          Visible: true,
          ShowValue: false,
          FillColor: color,
        });
      },
    },
  });
</script>

<style scoped>
  label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .input-label {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .color-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    gap: 20px;
  }

  /* Color Pickers */
  .color-picker {
    width: 32px;
    height: 32px;
    border: 1px solid var(--bg-secondary);
    border-radius: 4px;
    cursor: pointer;
  }

  .appearance-container {
    padding: 16px;
    width: 100%;
  }

  .input-box {
    width: 40px;
    height: 30px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    text-align: start;
  }

  .heading {
    color: var(--black);
  }

  .appearance-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 3px;
    gap: 20px;
  }

  .dropdown-container {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Background Color Picker (Solid Square) */
  .background-color-picker {
    width: 32px;
    height: 32px;
    border: none;
    cursor: pointer;
    background-color: transparent;
  }

  /* Border Color Picker - Bordered Square */
  .border-color-wrapper {
    display: flex;
    align-items: center;
  }

  .border-color-picker {
    width: 30px;
    /* Outer box */
    height: 30px;
    border: 2px solid var(--text-senary);
    /* Dark border */
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-secondary);
    cursor: pointer;
  }

  /* Inner small color picker */
  .border-color-picker input[type='color'] {
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  /* Dropdown styling (Fixes arrow button inside square issue) */
  .dropdown {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
  }

  .curve-cointainer {
    border-bottom: 1px solid #ccc;
    padding: 10px;
  }
  .curve-cointainer.no-border {
    border-bottom: none;
  }
  select {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    box-sizing: border-box;
    outline: none;
    background-color: var(--bg-form-input);
    font-family: 'OpenSans-Regular';
  }
  .size14 {
    width: 14px;
    height: 14px;
  }
  .min-height-35 {
    min-height: 35px;
  }
</style>
