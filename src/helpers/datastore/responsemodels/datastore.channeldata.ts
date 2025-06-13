import { DataStoreChannelDataItem } from '../datamodels/datastore.channelitem';

export class ChannelDataResponse {
  public data: DataStoreChannelDataItem[] = [];
  public hasMoreData: boolean;

  constructor(data: ConstructorParameters<typeof DataStoreChannelDataItem>[] = [], hasMoreData: boolean = false) {
    this.data = data.map((d) => new DataStoreChannelDataItem(...d));
    this.hasMoreData = hasMoreData;
  }
}
