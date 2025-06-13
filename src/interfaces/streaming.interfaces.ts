import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
import { ChannelIndexRanges } from '@/helpers/datastore/datamodels/datastore.indexrange';
import { DataStoreGroupStreamRequest } from '@/helpers/datastore/requestmodels/datastore.group.streamrequest';
import { DataStoreIndexRequest } from '@/helpers/datastore/requestmodels/datastore.indexboundrequest';
import { DataStoreNRowRequest } from '@/helpers/datastore/requestmodels/datastore.nrowrequest';
import { DataStoreRangeRequest } from '@/helpers/datastore/requestmodels/datastore.rangerequest';
import { DataStoreStartPlaybackRequest } from '@/helpers/datastore/requestmodels/datastore.startplaybackrequest';
import { DataStoreStreamRequest } from '@/helpers/datastore/requestmodels/datastore.streamrequest';

export interface StreamingRequest extends DataStoreStreamRequest {
  callback: (data: DataStoreChannelDataItem[]) => void;
}

export interface GroupStreamingRequest extends DataStoreGroupStreamRequest {
  callback: (data: DataStoreChannelDataItem[]) => void;
}

export interface LastNRowsData extends DataStoreNRowRequest {
  callback: (data: DataStoreChannelDataItem[]) => void;
}

export interface RangeRequest extends DataStoreRangeRequest {
  callback: (data: DataStoreChannelDataItem[]) => void;
}

export interface IndexRangeRequest extends DataStoreIndexRequest {
  callback: (data: ChannelIndexRanges[]) => void;
}

export interface StartPlaybackRequest extends DataStoreStartPlaybackRequest {
  callback: (data: number[]) => void;
}
