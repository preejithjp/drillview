import { DataStoreChannelInfo } from '../datamodels/datastore.channelinfo';

export class MetadataResponse {
  DataStoreChannelInfo: DataStoreChannelInfo[];

  constructor(ChannelInfo: ConstructorParameters<typeof DataStoreChannelInfo>[] = []) {
    this.DataStoreChannelInfo = ChannelInfo.map((d) => new DataStoreChannelInfo(...d));
  }
}
