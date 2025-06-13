import { DataStoreInterpolationMode } from '../datamodels/datastore.interpolationmode';
import { DataStoreInterpolations } from '../datamodels/datastore.interpolations';

export class DataStoreNRowRequest {
  TransferIntervalMilliSeconds?: number;
  ChannelIds: number[];
  NRows?: number;
  InterpolationMode?: DataStoreInterpolationMode;
  Interpolations?: DataStoreInterpolations;

  constructor(
    TransferIntervalMilliSeconds: number = 1000,
    ChannelIds: number[] = [],
    NRows: number = 1,
    InterpolationMode: DataStoreInterpolationMode = DataStoreInterpolationMode.None,
    Interpolations: DataStoreInterpolations = DataStoreInterpolations.None
  ) {
    this.TransferIntervalMilliSeconds = TransferIntervalMilliSeconds;
    this.ChannelIds = ChannelIds.map((a) => Number(a)); // Ensure ChannelIds are numbers
    this.NRows = NRows;
    this.InterpolationMode = InterpolationMode;
    this.Interpolations = Interpolations;
  }
}
