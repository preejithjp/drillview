import { DataStoreInterpolationMode } from '../datamodels/datastore.interpolationmode';
import { DataStoreInterpolations } from '../datamodels/datastore.interpolations';

export class DataStoreGroupStreamRequest {
  TransferIntervalMilliSeconds?: number;
  GroupId: number;
  ChannelIds?: number[];
  NRows?: number;
  StartIndex?: number;
  InterpolationMode?: DataStoreInterpolationMode;
  Interpolations?: DataStoreInterpolations;

  constructor(
    TransferIntervalMilliSeconds: number = 1000,
    GroupId: number,
    ChannelIds: number[] = [],
    NRows: number = 10,
    StartIndex?: number,
    InterpolationMode: DataStoreInterpolationMode = DataStoreInterpolationMode.None,
    Interpolations: DataStoreInterpolations = DataStoreInterpolations.None
  ) {
    this.TransferIntervalMilliSeconds = TransferIntervalMilliSeconds;
    this.GroupId = Number(GroupId);
    this.ChannelIds = ChannelIds.map((a) => Number(a)); // Ensure ChannelIds are numbers
    this.NRows = NRows;
    this.StartIndex = StartIndex;
    this.InterpolationMode = InterpolationMode;
    this.Interpolations = Interpolations;
  }
}
