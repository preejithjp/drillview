import { Schema } from 'mongoose';
import { DashboardSettings } from '../../helpers/settings.helper';

const SettingsSchema: Schema<DashboardSettings> = new Schema(
  {
    SettingId: { type: String, required: true, unique: true },
    General: {
      type: {
        ShowTitle: { type: Boolean, required: false },
        Title: { type: String, required: false },
        ShowUom: { type: Boolean, required: false },
        ShowStatusbar: { type: Boolean, required: false },
        ShowToolTip: { type: Boolean, required: false },
        BorderThickness: { type: Number, required: false },
        ShowActiveWell: { type: Boolean, required: false },
        ShowScale: { type: Boolean, required: false },
        ShowValue: { type: Boolean, required: false },
        ShowIndex: { type: Boolean, required: false },
        Decimal: { type: Number, required: false },
        Orientation: { type: Number, required: false },
        IndexType: { type: Number, required: false },
      },
      required: false,
      sparse: true,
      default: {},
      _id: false,
    },
    Appearance: {
      type: {
        BackgroundColour: { type: String, required: false },
        BorderColour: { type: String, required: false },
        TitleFontColor: { type: String, required: false },
        ValueFontColor: { type: String, required: false },
        UnitFontColor: { type: String, required: false },
        MarkerColor: { type: String, required: false },
        ProgressColor: { type: String, required: false },
        LabelFontColor: { type: String, required: false },
      },
      required: false,
      sparse: true,
      default: {},
      _id: false,
    },
    Font: {
      type: {
        Title: {
          type: {
            FontSize: { type: Number, required: false },
            FontFamily: { type: String, required: false },
            FontWeight: { type: String, required: false },
            FontStyle: { type: String, required: false },
          },
          required: false,
          sparse: true,
          default: {},
          _id: false,
        },
        Value: {
          type: {
            FontSize: { type: Number, required: false },
            FontFamily: { type: String, required: false },
            FontWeight: { type: String, required: false },
            FontStyle: { type: String, required: false },
          },
          required: false,
          sparse: true,
          default: {},
          _id: false,
        },
        Unit: {
          type: {
            FontSize: { type: Number, required: false },
            FontFamily: { type: String, required: false },
            FontWeight: { type: String, required: false },
            FontStyle: { type: String, required: false },
          },
          required: false,
          sparse: true,
          default: {},
          _id: false,
        },
        Label: {
          type: {
            FontSize: { type: Number, required: false },
            FontFamily: { type: String, required: false },
            FontWeight: { type: String, required: false },
            FontStyle: { type: String, required: false },
          },
          required: false,
          sparse: true,
          default: {},
          _id: false,
        },
      },
      required: false,
      sparse: true,
      default: {},
      _id: false,
    },
    Alarm: {
      type: [
        {
          AlarmType: { type: String, required: false },
          WarningValue: { type: Number, required: false },
          Warning: { type: Boolean, required: false },
          Blinking: { type: Boolean, required: false },
          MaxValue: { type: Number, required: false },
          MinValue: { type: Number, required: false },
          Color: { type: String, required: false },
        },
      ],
      required: false,
      sparse: true,
      default: [],
      _id: false,
    },
    Range: {
      type: {
        RangeType: { type: String, required: false },
        RangeMin: { type: Number, required: false },
        RangeMax: { type: Number, required: false },
        RangeColors: {
          type: [
            {
              label: { type: String, required: false },
              color: { type: String, required: false },
              min: { type: Number, required: false },
              max: { type: Number, required: false },
              enabled: { type: Boolean, required: false },
              blinking: { type: Boolean, required: false },
            },
          ],
          required: false,
          default: [],
          _id: false,
        },
      },
      required: false,
      sparse: true,
      default: {},
      _id: false,
    },
    Mnemonics: {
      type: [
        {
          MnemonicName: { type: String, required: false },
          MnemonicId: { type: String, required: false },
          LogName: { type: String, required: false },
          Unit: { type: String, required: false },
          UnitType: { type: String, required: false },
          Color: { type: String, required: false },
          DisplayName: { type: String, required: false },
          Id: { type: String, required: false },
        },
      ],
      required: false,
      default: [],
      sparse: true,
      _id: false,
    },
    Track: {
      type: [
        {
          TrackName: { type: String, required: false },
          Background: { type: String, required: false },
          BorderColour: { type: String, required: false },
          BorderThickness: { type: String, required: false },
          GridColor: { type: String, required: false },
          GridThickness: { type: String, required: false },
          GridVisibility: { type: Boolean, required: false },
          TrackType: { type: String, required: false },
          Curve: {
            type: [
              {
                CurveColor: { type: String, required: false },
                ChartType: { type: String, required: false },
                LineStyle: { type: String, required: false },
                LineThickness: { type: Number, required: false },
                ZeroLine: { type: Number, required: false },
                Mnemonic: {
                  type: {
                    MnemonicName: { type: String, required: false },
                    MnemonicId: { type: String, required: false },
                    LogName: { type: String, required: false },
                    Unit: { type: String, required: false },
                    UnitType: { type: String, required: false },
                    Color: { type: String, required: false },
                  },
                  required: false,
                  default: {},
                  sparse: true,
                  _id: false,
                },
                Marker: { type: Boolean, required: false },
                MarkerSize: { type: Number, required: false },
                MarkerType: { type: String, required: false },
                DisplayName: { type: String, required: false },
                Visible: { type: Boolean, required: false },
                ShowValue: { type: Boolean, required: false },
                FillColor: { type: String, required: false },
              },
            ],
            required: false,
            default: [],
            sparse: true,
            _id: false,
          },
        },
      ],
      required: false,
      default: [],
      sparse: true,
      _id: false,
    },
    Image: {
      type: {
        TemplateId: { type: String, required: false },
        TemplateName: { type: String, required: false },
        Entries: [
          {
            RangeMin: { type: Number, required: false },
            RangeMax: { type: Number, required: false },
            ImageUrl: { type: String, required: false },
          },
        ],
      },
      required: false,
      default: {},
      _id: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

export { SettingsSchema };
