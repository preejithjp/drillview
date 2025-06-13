export class DataStoreStopStreamingRequest {
  ChannelIds: number[] = [];

  constructor(ChannelIds: number[]) {
    this.ChannelIds = ChannelIds.map((a) => Number(a)); // Ensure ChannelIds are numbers
  }
}
