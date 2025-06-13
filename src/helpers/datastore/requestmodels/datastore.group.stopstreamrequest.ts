export class DataStoreGroupStopStreamingRequest {
  GroupId: number;
  ChannelIds: number[] = [];

  constructor(GroupId: number, ChannelIds: number[]) {
    this.GroupId = Number(GroupId);
    this.ChannelIds = ChannelIds.map((a) => Number(a));
  }
}
