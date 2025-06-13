import { RequestHeader } from './requestmodels/datastore.requestheader';
import { DataStoreNRowRequest } from './requestmodels/datastore.nrowrequest';
import { DataStoreStreamRequest } from './requestmodels/datastore.streamrequest';
import { DataStoreIndexRequest } from '@/helpers/datastore/requestmodels/datastore.indexboundrequest';
import { DataStoreMetadataRequest } from '@/helpers/datastore/requestmodels/datastore.metadatarequest';
import { DataStoreRangeRequest } from '@/helpers/datastore/requestmodels/datastore.rangerequest';
import { DataStoreStartPlaybackRequest } from '@/helpers/datastore/requestmodels/datastore.startplaybackrequest';
import { DataStoreGroupStreamRequest } from './requestmodels/datastore.group.streamrequest';

export type AllRequestBodyTypes =
  | DataStoreStreamRequest
  | DataStoreNRowRequest
  | DataStoreIndexRequest
  | DataStoreMetadataRequest
  | DataStoreRangeRequest
  | DataStoreStartPlaybackRequest
  | DataStoreStreamRequest
  | DataStoreGroupStreamRequest;

export class DataStoreRequest {
  public Header: RequestHeader;
  public Body: AllRequestBodyTypes;
  constructor(requestheader: RequestHeader, requestbody: AllRequestBodyTypes) {
    this.Header = requestheader;
    this.Body = requestbody;
  }
}
