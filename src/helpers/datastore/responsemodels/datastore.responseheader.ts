export enum ResponseTypes {
  Acknowledgment,
  Warning,
  Exception,
  Data,
  Metadata,
  IndexBounds,
  PlaybackComplted,
  SessionDetails,
  GroupedData,
  ChannelState,
}

export class ResponseHeader {
  public MessageId: number;
  public ResponseForRequestId: number;
  public ResponseType: ResponseTypes;

  constructor(MessageId: number = 0, ResponseForRequestId: number = 0, ResponseType: ResponseTypes) {
    this.MessageId = MessageId;
    this.ResponseForRequestId = ResponseForRequestId;
    this.ResponseType = ResponseType;
  }
}
