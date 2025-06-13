import { DataStoreInterpolationMode } from '../datamodels/datastore.interpolationmode';
import { DataStoreInterpolations } from '../datamodels/datastore.interpolations';

enum PlaybackRequestType {
  LastNItems,
  IndexRange,
}

export class DataStoreStartPlaybackRequest {
  RequestType: PlaybackRequestType;
  Speed: number;
  ChannelIds: number[];
  LastNRows: number;
  StartIndex?: number;
  EndIndex?: number;
  InterpolationMode?: DataStoreInterpolationMode;
  Interpolations?: DataStoreInterpolations;

  constructor(
    RequestType: PlaybackRequestType = PlaybackRequestType.IndexRange,
    Speed: number = 1,
    ChannelIds: number[] = [],
    LastNRows: number = 0,
    StartIndex?: number,
    EndIndex?: number,
    InterpolationMode?: DataStoreInterpolationMode,
    Interpolations?: DataStoreInterpolations
  ) {
    this.ChannelIds = ChannelIds.map((a) => Number(a)); // Ensure ChannelIds are numbers
    this.RequestType = RequestType;
    this.Speed = Speed;
    this.LastNRows = LastNRows;
    this.StartIndex = StartIndex;
    this.EndIndex = EndIndex;
    this.InterpolationMode = InterpolationMode;
    this.Interpolations = Interpolations;
  }
}
