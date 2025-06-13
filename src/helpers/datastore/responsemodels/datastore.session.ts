export class ChannelSessionResponse {
  public SessionId: string;
  public ExistingSession: boolean;

  constructor(SessionId: string, ExistingSession: boolean) {
    this.SessionId = SessionId;
    this.ExistingSession = ExistingSession;
  }
}
