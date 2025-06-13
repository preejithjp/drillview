import { Schema } from 'mongoose';
import {
  CurveMap,
  DepthLog,
  JobConfig,
  JobSettings,
  BaseObject,
  ProxyConfig,
  SourceConfig,
  TargetConfig,
  TimebaseLog,
  TransferConfig,
  WellboreDetails,
} from '../../interfaces/synchronizer.interfaces';
import { Long } from 'bson';
import BinaryUtils from '../../utils/binary.utils';

const ProxySchema: Schema<ProxyConfig> = new Schema(
  {
    UseProxy: { type: Boolean, required: false },
    HostName: { type: String, required: false },
    Authentication: { type: Boolean, required: false },
    UserName: { type: String, required: false },
    Password: { type: String, required: false },
  },
  { _id: false }
);

const SourceConfigSchema: Schema<SourceConfig> = new Schema(
  {
    Url: { type: String, required: false },
    UserName: { type: String, required: false },
    Password: { type: String, required: false },
    Version: { type: String, required: false },
    MaxConnections: { type: Number, required: false },
    Proxy: { type: ProxySchema, required: false },
  },
  { _id: false }
);

const TargetSchema: Schema<TargetConfig> = new Schema(
  {
    Url: { type: String, required: false },
    UserName: { type: String, required: false },
    Password: { type: String, required: false },
    UserType: { type: String, required: false },
    Proxy: { type: ProxySchema, required: false },
  },
  { _id: false }
);

const WellboreSchema: Schema<WellboreDetails> = new Schema(
  {
    Source: {
      UidWell: { type: String, required: false },
      UidWellbore: { type: String, required: false },
      NameWell: { type: String, required: false },
      NameWellbore: { type: String, required: false },
    },
    Target: {
      SameAsSource: { type: Boolean, required: false },
      UidWell: { type: String, required: false },
      UidWellbore: { type: String, required: false },
      NameWell: { type: String, required: false },
      NameWellbore: { type: String, required: false },
    },
  },
  { _id: false }
);

const CurveMapSchema: Schema<CurveMap> = new Schema(
  {
    SourceCurveName: { type: String, required: false },
    TargetCurveName: { type: String, required: false },
    TargetAlias: { type: String, required: false },
    TargetUnit: { type: String, required: false },
    TargetUid: { type: String, required: false },
    UnitType: { type: String, required: false },
    DataType: { type: String, required: false },
    SourceUnit: { type: String, required: false },
    Description: { type: String, required: false },
  },
  { _id: false }
);

const LogSchema: Schema<BaseObject> = new Schema(
  {
    ObjectUid: { type: String, required: false },
    ObjectName: { type: String, required: false },
    TargetUID: { type: String, required: false },
    TargetName: { type: String, required: false },
  },
  { _id: false }
);

const TimebaseLogsSchema: Schema<TimebaseLog> = new Schema(
  {
    ObjectUid: { type: String, required: false },
    ObjectName: { type: String, required: false },
    TargetUID: { type: String, required: false },
    TargetName: { type: String, required: false },
    TemplateReferenceID: { type: String, required: false },
    TemplateReferenceName: { type: String, required: false },
    StartIndex: { type: Number, required: false },
    CurveMaps: { type: [CurveMapSchema], required: false },
  },
  { _id: false }
);

const DepthLogsSchema: Schema<DepthLog> = new Schema(
  {
    ObjectUid: { type: String, required: false },
    ObjectName: { type: String, required: false },
    TargetUID: { type: String, required: false },
    TargetName: { type: String, required: false },
    TemplateReferenceID: { type: String, required: false },
    TemplateReferenceName: { type: String, required: false },
    StartIndexInft: { type: Number, required: false },
    CurveMaps: { type: [CurveMapSchema], required: false },
  },
  { _id: false }
);

const SettingsSchema: Schema<JobSettings> = new Schema(
  {
    StartDateIndexInUtc: { type: Number, required: false },
    StartIndexInft: { type: Number, required: false },
    BackFilling: { type: Boolean, required: false },
    HeaderFrequencyInMinute: { type: Number, required: false },
    DataFrequencyInSecond: { type: Number, required: false },
  },
  { _id: false }
);

const TransferSchema: Schema<TransferConfig> = new Schema(
  {
    AllTimeLogs: { type: Boolean, required: false },
    AllDepthLogs: { type: Boolean, required: false },
    AllTrajectries: { type: Boolean, required: false },
    AllMudLogs: { type: Boolean, required: false },
    AllRigs: { type: Boolean, required: false },
    AllBhaRun: { type: Boolean, required: false },
    AllCementJob: { type: Boolean, required: false },
    AllFluidsReport: { type: Boolean, required: false },
    AllFormationMarker: { type: Boolean, required: false },
    AllMessage: { type: Boolean, required: false },
    AllTubular: { type: Boolean, required: false },
    AllWbGeometry: { type: Boolean, required: false },
  },
  { _id: false }
);

const JobsSchema: Schema<JobConfig> = new Schema(
  {
    OrganizationId: { type: Schema.Types.Mixed, required: true, set: (val: number) => Long.fromString(val.toString()) },
    SourceId: { ...BinaryUtils.uuidModelType, required: false },
    JobUID: { ...BinaryUtils.uuidModelType, required: true, unique: true },
    JobName: { type: String, required: true },
    CreationDate: { type: Schema.Types.Mixed, required: false, default: Date.now(), set: (val: number) => Long.fromString(val.toString()) },
    LastUpdatedDate: { type: Schema.Types.Mixed, required: false, default: Date.now(), set: (val: number) => Long.fromString(val.toString()) },
    LastUpdatedUser: { type: String, required: true },
    JobStatus: { type: Number, required: true },
    Settings: { type: SettingsSchema, required: false },
    Source: { type: SourceConfigSchema, required: false },
    Target: {
      ProductStore: { type: TargetSchema, required: false },
      DataStore: { type: TargetSchema, required: false },
    },
    Wellbores: { type: [WellboreSchema], required: false },
    Transfer: { type: TransferSchema, required: false },
    TimebaseLogs: { type: [TimebaseLogsSchema], required: false },
    DepthLogs: { type: [DepthLogsSchema], required: false },
    Trajectories: { type: [LogSchema], required: false },
    MudLogs: { type: [LogSchema], required: false },
    Rigs: { type: [LogSchema], required: false },
    WbGeometries: { type: [LogSchema], required: false },
    FluidReport: { type: [LogSchema], required: false },
    BHARun: { type: [LogSchema], required: false },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

JobsSchema.pre('save', async function (next) {
  if (!this.JobUID) {
    this.JobUID = BinaryUtils.convertUuidToBinary();
  }
  next();
});

export { JobsSchema };
