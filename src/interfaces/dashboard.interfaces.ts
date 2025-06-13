import { DashboardSettings } from '../../server/helpers/settings.helper';
import LogWidget from '@/components/Widgets/LogWidget.vue';
import NumericWidget from '@/components/Widgets/NumericWidget.vue';
import LabelWidget from '@/components/Widgets/LabelWidget.vue';
import GaugeWidget from '@/components/Widgets/GaugeWidget.vue';
import ThermometerWidget from '@/components/Widgets/ThermometerWidget.vue';
import CommentWidget from '@/components/Widgets/CommentWidget.vue';
import NumericSettings from '../../server/helpers/settings.widgets/numeric.settings';
import LabelSettings from '../../server/helpers/settings.widgets/label.settings';
import GaugeSettings from '../../server/helpers/settings.widgets/gauge.settings';
import ThermometerSettings from '../../server/helpers/settings.widgets/thermometer.settings';
import LogSettings from '../../server/helpers/settings.widgets/log.settings';
import ImageWidget from '@/components/Widgets/ImageWidget.vue';
import ImageSettings from '../../server/helpers/settings.widgets/image.settings';
import CommentSettings from '../../server/helpers/settings.widgets/comment.settings';

export type Settings = Record<
  WidgetType,
  {
    widgetheight: number;
    widgetwidth: number;
    color: string;
    title: string;
  }
>;

export enum WidgetType {
  LOG = 'Log',
  LAYOUT = 'Layout',
  PIE = 'Pie',
  DONUT = 'Donut',
  GAUGE = 'Gauge',
  NUMERIC = 'Numeric',
  CHAT = 'Chat',
  THERMOMETER = 'Thermometer',
  STACK_BAR = 'Stack Bar Chart',
  LINE_CHART = 'Line Chart',
  LABEL = 'Label',
  IMAGE = 'Image',
  COMMENT = 'Comment',
}

export interface Widgetsitems {
  type: WidgetType;
  icon: string;
  title: string;
  component?: string;
  settingsDetails?: DashboardSettings;
}

export const WidgetDetails: Widgetsitems[] = [
  { type: WidgetType.LAYOUT, icon: 'layout-icon', title: 'Layout', component: '' },
  { type: WidgetType.LOG, icon: 'line-chart-vertical', title: 'Log Chart', component: LogWidget.name, settingsDetails: new LogSettings() },

  { type: WidgetType.GAUGE, icon: 'gauge-chart', title: 'Gauge Chart', component: GaugeWidget.name, settingsDetails: new GaugeSettings() },
  {
    type: WidgetType.NUMERIC,
    icon: 'numeric-widget',
    title: 'Numeric Widget',
    component: NumericWidget.name,
    settingsDetails: new NumericSettings(),
  },
  { type: WidgetType.CHAT, icon: 'chat-icon', title: 'Chat', component: '' },
  {
    type: WidgetType.THERMOMETER,
    icon: 'thermometer-icon',
    title: 'Thermometer',
    component: ThermometerWidget.name,
    settingsDetails: new ThermometerSettings(),
  },
  {
    type: WidgetType.IMAGE,
    title: 'Image',
    icon: 'image-icon',
    component: ImageWidget.name,
    settingsDetails: new ImageSettings(),
  },
  {
    type: WidgetType.COMMENT,
    icon: 'comment-icon',
    title: 'Comment Widget',
    component: CommentWidget.name,
    settingsDetails: new CommentSettings(),
  },
  { type: WidgetType.LABEL, icon: 'label-icon', title: 'Label', component: LabelWidget.name, settingsDetails: new LabelSettings() },

  { type: WidgetType.PIE, icon: 'pie-chart', title: 'Pie Chart', component: '' },
  { type: WidgetType.DONUT, icon: 'donut-chart', title: 'Donut Chart', component: '' },

  { type: WidgetType.STACK_BAR, icon: 'stack-barchart', title: 'Stack Bar Chart', component: '' },
  { type: WidgetType.LINE_CHART, icon: 'line-chart', title: 'Line Chart', component: '' },
];

export interface ITab {
  key: string;
  icon: string;
  title: string;
}

export enum TabNames {
  TAB1 = 'appearance-tab',
  TAB2 = 'mnemonics-tab',
  TAB3 = 'alarm-tab',
  TAB4 = 'general-tab',
}

export const iconObject: Record<TabNames, string> = {
  [TabNames.TAB1]: 'appearence-icon',
  [TabNames.TAB2]: 'mnemonics-icon',
  [TabNames.TAB3]: 'alarm-icon',
  [TabNames.TAB4]: 'general-icon',
};

export const TabDetails: ITab[] = [
  { key: TabNames.TAB1, icon: iconObject[TabNames.TAB1], title: 'Appearence' },
  { key: TabNames.TAB2, icon: iconObject[TabNames.TAB2], title: 'Curves' },
  { key: TabNames.TAB3, icon: iconObject[TabNames.TAB3], title: 'Alarm' },
  { key: TabNames.TAB4, icon: iconObject[TabNames.TAB4], title: 'Settings' },
];

export interface WidgetConfig {
  multiSelectWidgets: string[];
}

export const multiSelectwidgetConfig: WidgetConfig = {
  multiSelectWidgets: ['Donutchart'],
};

export interface WellboreObject {
  wellname: string;
  wellborename: string;
  wellboreuri: string;
}
