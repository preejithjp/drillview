export enum Commands {
  GetMetadata,
  PrepareReceive,
  ReceiveCompleted,
  Append,
  Update,
  Delete,
  DeleteRange,
  GetRange,
  GetLastNRows,
  GetIndexBounds,
  GetDataFrequency,
  Stream,
  StopStream,
  StartPlayback,
  StopPlayback,
  Synchronize,
  GetGroupedRange,
  GetGroupedLastNRows,
  StreamGroup,
  StopStreamGroup,
  InsertDataObject,
  UpdateDataObject,
  ReplaceDataObject,
  DeleteDataObject,
  GetDataObject,
  GetChannelState,
}

export class RequestHeader {
  RequestId: number;
  Command: Commands;

  constructor(RequestId: number, Command: Commands) {
    this.RequestId = RequestId;
    this.Command = Command;
  }
}
