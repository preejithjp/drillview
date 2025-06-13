import { DataStoreInterpolationMode } from '../datamodels/datastore.interpolationmode';
import { DataStoreInterpolations } from '../datamodels/datastore.interpolations';

export class DataStoreGroupRangeRequest {
  GroupId: number;
  StartIndex: number;
  EndIndex: number;
  ChannelIds: number[];
  InterpolationMode?: DataStoreInterpolationMode;
  Interpolations?: DataStoreInterpolations;
  TransferIntervalMilliSeconds?: number;

  constructor(
    GroupId: number,
    ChannelIds: number[] = [],
    StartIndex: number,
    EndIndex: number,
    TransferIntervalMilliSeconds: number = 1000,
    InterpolationMode: DataStoreInterpolationMode = DataStoreInterpolationMode.None,
    Interpolations: DataStoreInterpolations = DataStoreInterpolations.None
  ) {
    this.GroupId = Number(GroupId);
    this.TransferIntervalMilliSeconds = TransferIntervalMilliSeconds;
    this.ChannelIds = ChannelIds.map((a) => Number(a)); // Ensure ChannelIds are numbers
    this.StartIndex = StartIndex;
    this.EndIndex = EndIndex;
    this.InterpolationMode = InterpolationMode;
    this.Interpolations = Interpolations;
  }
}
