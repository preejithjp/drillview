import { DataStoreInterpolationMode } from '../datamodels/datastore.interpolationmode';
import { DataStoreInterpolations } from '../datamodels/datastore.interpolations';

export class DataStoreStreamRequest {
  TransferIntervalMilliSeconds?: number;
  ChannelIds: number[];
  NRows?: number;
  StartIndex?: number;
  InterpolationMode?: DataStoreInterpolationMode;
  Interpolations?: DataStoreInterpolations;

  constructor(
    TransferIntervalMilliSeconds: number = 1000,
    ChannelIds: number[] = [],
    NRows: number = 1,
    StartIndex?: number,
    InterpolationMode: DataStoreInterpolationMode = DataStoreInterpolationMode.None,
    Interpolations: DataStoreInterpolations = DataStoreInterpolations.None
  ) {
    this.TransferIntervalMilliSeconds = TransferIntervalMilliSeconds;
    this.ChannelIds = ChannelIds.map((a) => Number(a)); // Ensure ChannelIds are numbers
    this.NRows = NRows;
    this.StartIndex = StartIndex;
    this.InterpolationMode = InterpolationMode;
    this.Interpolations = Interpolations;
  }
}
