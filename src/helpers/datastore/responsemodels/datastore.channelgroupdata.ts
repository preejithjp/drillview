import { DataStoreChannelGroupItem } from '../datamodels/datastore.channelgroupitem';

export class ChannelGroupDataResponse {
  public data: DataStoreChannelGroupItem[] = [];
  public hasMoreData: boolean;

  constructor(data: ConstructorParameters<typeof DataStoreChannelGroupItem>[] = [], hasMoreData: boolean = false) {
    this.data = data.map((d) => new DataStoreChannelGroupItem(...d));
    this.hasMoreData = hasMoreData;
  }
}
