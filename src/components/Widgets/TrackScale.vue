<template>
  <section :class="'fontSize-9 d-flex ' + (alignment === OrientationTypes.Horizontal ? 'Horizontal' : 'Vertical')">
    <div v-if="withIndex" class="index-head">
      <span class="sticky-index">{{ indexType === DataIndexTypes.Time ? 'Time' : 'Depth (ft)' }}</span>
    </div>
    <div :class="'flex-full track-scale-cointainer ' + (alignment === OrientationTypes.Vertical ? 'd-flex' : '')">
      <div
        v-for="(item, i) in curveData"
        v-show="item.Visible"
        :key="i"
        :class="'d-flex ' + (alignment === OrientationTypes.Horizontal ? 'flex-col' : '')">
        <div :class="'d-flex ' + (alignment === OrientationTypes.Vertical ? 'flex-col' : '')">
          <span class="starting-point rotate-text">{{ trackScaleValues ? scaleValueFormat(trackScaleValues[i]?.min) : '0' }}</span>
          <span class="flex-full rotate-text">{{ item.DisplayName }}</span>
          <span class="ending-point rotate-text">{{ trackScaleValues ? scaleValueFormat(trackScaleValues[i]?.max) : '100' }}</span>
        </div>
        <span class="divider-line" :style="unitBackground(item, 'CurveColor')"></span>
        <div v-if="showUOM" :style="unitBackground(item, 'FillColor')" class="rotate-text">{{ item.Mnemonic.Unit || 'unitless' }}</div>
      </div>
    </div>
  </section>
</template>
<script lang="ts">
  import { Curve } from '../../../server/helpers/settings.helpers/track.settings.helper';
  import { defineComponent } from 'vue';
  import { store } from '@/main';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  import { DataIndexTypes, OrientationTypes } from '../../../server/helpers/settings.helpers/general.settings.helper';

  export default defineComponent({
    name: 'TrackScale',
    components: {},
    props: {
      curveData: {
        type: Array as () => Curve[],
        required: true,
      },
      showUOM: Boolean,
      alignment: {
        type: Number,
        required: true,
      },
      withIndex: Boolean,
      indexType: {
        type: Number as () => DataIndexTypes,
        required: true,
      },
      trackScaleValues: {
        type: Object as () => { [key: number]: { min: number; max: number } },
        required: true,
      },
    },
    data() {
      return {
        OrientationTypes: OrientationTypes,
        DataIndexTypes: DataIndexTypes,
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
    },
    watch: {},
    created() {},
    mounted() {},
    beforeUnmount() {},
    methods: {
      scaleValueFormat(value: number) {
        if (value) {
          return Number(value).toFixed(0);
        } else {
          return value;
        }
      },
      unitBackground(curve: Curve, keyValue: string) {
        switch (keyValue) {
          case 'CurveColor':
            return {
              backgroundColor: themeColors[this.currentTheme][curve.CurveColor as keyof ColorSet] ?? curve.CurveColor ?? '',
            };
          case 'FillColor':
            if (curve.ChartType === 'area' || curve.ChartType === 'stepArea') {
              return {
                backgroundColor: themeColors[this.currentTheme][curve.FillColor as keyof ColorSet] ?? curve.FillColor ?? '',
              };
            }
            return {};
          default:
            return {};
        }
      },
    },
  });
</script>
<style>
  .sticky-index {
    position: sticky;
    top: 0;
  }
  .Horizontal {
    padding-bottom: 5px;
  }
  .Horizontal .index-head {
    width: 58px;
  }
  .Horizontal .index-head {
    height: 15px;
  }
  .Vertical {
    width: 100%;
    height: 100%;
    flex-direction: column-reverse;
  }
  .Vertical .rotate-text {
    transform: scale(-1);
    writing-mode: vertical-lr;
  }
  .divider-line {
    height: 1px;
    display: block;
  }
  .Vertical .divider-line {
    height: unset;
    width: 1px;
  }
  .Vertical .sticky-index {
    position: fixed;
    left: 5px;
    top: unset;
  }
  .Vertical .index-head {
    height: 14px;
  }
  .starting-point {
    min-width: 20px;
    text-align: left;
  }
  .ending-point {
    min-width: 20px;
    text-align: right;
  }
  .track-scale-cointainer {
    padding: 5px 0;
  }
  .Horizontal .track-scale-cointainer {
    padding: 0 5px;
  }
</style>
