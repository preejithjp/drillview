export class ChannelIndexRanges {
  ChannelId: number;
  StartKeyIndex: number;
  EndKeyIndex: number;

  constructor(ChannelId: number, StartKeyIndex: number, EndKeyIndex: number) {
    this.ChannelId = ChannelId;
    this.StartKeyIndex = StartKeyIndex;
    this.EndKeyIndex = EndKeyIndex;
  }
}
