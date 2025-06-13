import { DataStoreChannelState } from '../datamodels/datastore.channelstate';

export class ChannelStateResponse {
  DataStoreChannelState: DataStoreChannelState[];

  constructor(ChannelStates: ConstructorParameters<typeof DataStoreChannelState>[] = []) {
    this.DataStoreChannelState = ChannelStates.map((d) => new DataStoreChannelState(...d));
  }
}
