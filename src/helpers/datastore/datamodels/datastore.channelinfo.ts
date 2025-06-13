import { DataStoreDataTypes } from './datastore.datatypes';
import { DataStoreIndexTypes } from './datastore.indextypes';

export class DataStoreChannelInfo {
  ChannelId: number;
  ChannelUri: string;
  Uom: string;
  UnitType: string;
  DataType: DataStoreDataTypes;
  IndexType: DataStoreIndexTypes;
  IncreasingIndex: boolean;
  ChannelName: string;
  GroupName: string;
  GroupId: number;

  constructor(
    ChannelId: number,
    ChannelUri: string,
    Uom: string,
    UnitType: string,
    DataType: DataStoreDataTypes,
    IndexType: DataStoreIndexTypes,
    IncreasingIndex: boolean,
    ChannelName: string,
    GroupName: string,
    GroupId: number
  ) {
    this.ChannelId = ChannelId;
    this.ChannelUri = ChannelUri;
    this.Uom = Uom;
    this.UnitType = UnitType;
    this.DataType = DataType;
    this.IndexType = IndexType;
    this.IncreasingIndex = IncreasingIndex;
    this.ChannelName = ChannelName;
    this.GroupName = GroupName;
    this.GroupId = GroupId;
  }
}
