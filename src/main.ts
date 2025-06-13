import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import appStore from './store';
import * as directiveRules from './common/vue-directive';
import customRules from './common/custom-validation';

import App from './App.vue';
import SvgIcon from './components/Globals/SvgIcon.vue';
import DropDown from './components/Globals/DropDown.vue';
import SearchInput from './components/Globals/SearchInput.vue';
import LoadingIcon from './components/Globals/LoadingIcon.vue';
import CustomButton from './components/Globals/CustomButton.vue';
import ToggleSwitch from './components/ToggleSwitch.vue';
import { defineRule } from 'vee-validate';
import { all as rules } from '@vee-validate/rules';
import { runtimeDataBindng } from './common/utils';
import VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { SciChartSurface } from 'scichart';

SciChartSurface.configure({
  wasmUrl: '/scichart2d.wasm',
  dataUrl: '/scichart2d.data',
});

const pinia = createPinia();
const app = createApp(App);

// Register all Vee-Validate rules
const allRules = { ...rules, ...customRules };
(Object.keys(allRules) as Array<keyof typeof allRules>).forEach((rule) => defineRule(String(rule), allRules[rule]));

Object.keys(directiveRules).forEach((directiveName) => {
  app.directive(directiveName, directiveRules[directiveName as keyof typeof directiveRules]);
});

app.use(pinia);
app.use(router);
app.component('SvgIcon', SvgIcon);
app.component('DropDown', DropDown);
app.component('SearchInput', SearchInput);
app.component('LoadingIcon', LoadingIcon);
app.component('ToggleSwitch', ToggleSwitch);
app.component('CustomButton', CustomButton);

app.use(VueVirtualScroller);

export const store = appStore();
runtimeDataBindng();
app.mount('#app');

// Type declaration for Global Components
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    SvgIcon: typeof SvgIcon;
    DropDown: typeof DropDown;
    SearchInput: typeof SearchInput;
    LoadingIcon: typeof LoadingIcon;
    ToggleSwitch: typeof ToggleSwitch;
    CustomButton: typeof CustomButton;
  }
}
