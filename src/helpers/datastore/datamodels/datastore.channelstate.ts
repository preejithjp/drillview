import { DataStoreChannelInfo } from './datastore.channelinfo';

export class DataStoreChannelState {
  ChannelInfo: DataStoreChannelInfo;
  StartIndex: number;
  EndIndex: number;
  IsActive: boolean;

  constructor(ChannelInfo: ConstructorParameters<typeof DataStoreChannelInfo>, StartIndex: number, EndIndex: number, IsActive: boolean) {
    this.ChannelInfo = new DataStoreChannelInfo(...ChannelInfo);
    this.StartIndex = StartIndex;
    this.EndIndex = EndIndex;
    this.IsActive = IsActive;
  }
}
