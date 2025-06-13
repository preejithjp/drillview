export class PlaybackCompltedResponse {
  public ChannelIds: number[];
  constructor(ChannelIds: number[]) {
    this.ChannelIds = ChannelIds;
  }
}
