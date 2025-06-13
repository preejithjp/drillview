import { BinaryResponse, BinaryUtils } from '@/common/binary-utils';
import { ResponseHeader, ResponseTypes } from './responsemodels/datastore.responseheader';
import { ChannelDataResponse } from './responsemodels/datastore.channeldata';
import { ChannelSessionResponse } from './responsemodels/datastore.session';
import { WarningResponse } from './responsemodels/datastore.warning';
import { AcknowledgmentResponse } from './responsemodels/datastore.acknowledgement';
import { ErrorResponse } from './responsemodels/datastore.error';
import { MetadataResponse } from './responsemodels/datastore.metadata';
import { IndexBoundsResponse } from './responsemodels/datastore.indexbounds';
import { PlaybackCompltedResponse } from './responsemodels/datastore.playback';
import { ChannelGroupDataResponse } from './responsemodels/datastore.channelgroupdata';
import { ChannelStateResponse } from './responsemodels/datastore.channelstate';

type AllResponseBodyTypes =
  | AcknowledgmentResponse
  | WarningResponse
  | ErrorResponse
  | ChannelDataResponse
  | MetadataResponse
  | IndexBoundsResponse
  | PlaybackCompltedResponse
  | ChannelSessionResponse
  | ChannelGroupDataResponse
  | ChannelStateResponse;

export class DataStoreResponse {
  public Header: ResponseHeader;
  public Body: AllResponseBodyTypes;

  constructor(responseheader: ConstructorParameters<typeof ResponseHeader>, responsebody: BinaryResponse) {
    this.Header = new ResponseHeader(...responseheader);
    this.Body = this.getResposeBodyData(responsebody);
  }

  private getResposeBodyData(body: BinaryResponse): AllResponseBodyTypes {
    const parsed = BinaryUtils.Deserialize(body);
    switch (this.Header.ResponseType) {
      case ResponseTypes.Acknowledgment:
        return new AcknowledgmentResponse(...(parsed as ConstructorParameters<typeof AcknowledgmentResponse>));

      case ResponseTypes.Warning:
        return new WarningResponse(...(parsed as ConstructorParameters<typeof WarningResponse>));

      case ResponseTypes.Exception:
        return new ErrorResponse(...(parsed as ConstructorParameters<typeof ErrorResponse>));

      case ResponseTypes.Data:
        return new ChannelDataResponse(...(parsed as ConstructorParameters<typeof ChannelDataResponse>));

      case ResponseTypes.Metadata:
        return new MetadataResponse(...(parsed as ConstructorParameters<typeof MetadataResponse>));

      case ResponseTypes.IndexBounds:
        return new IndexBoundsResponse(...(parsed as ConstructorParameters<typeof IndexBoundsResponse>));

      case ResponseTypes.PlaybackComplted:
        return new PlaybackCompltedResponse(...(parsed as ConstructorParameters<typeof PlaybackCompltedResponse>));

      case ResponseTypes.SessionDetails:
        return new ChannelSessionResponse(...(parsed as ConstructorParameters<typeof ChannelSessionResponse>));
      case ResponseTypes.GroupedData: {
        return new ChannelGroupDataResponse(...(parsed as ConstructorParameters<typeof ChannelGroupDataResponse>));
      }
      case ResponseTypes.ChannelState: {
        return new ChannelStateResponse(...(parsed as ConstructorParameters<typeof ChannelStateResponse>));
      }
    }
  }
}
