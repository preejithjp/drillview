import { DataStoreDataValue } from './datastore.datavalue';

export class DataStoreChannelGroupItem {
  GroupId: number;
  KeyIndex: number;
  ChannelValue: Record<number, DataStoreGroupDataItem>;

  constructor(GroupId: number, KeyIndex: number, ChannelValue: Record<number, DataStoreGroupDataItem>) {
    this.GroupId = GroupId;
    this.KeyIndex = KeyIndex;
    this.ChannelValue = this.iterateDictionary(ChannelValue);
  }

  private iterateDictionary(ChannelValue: Record<number, DataStoreGroupDataItem>) {
    Object.keys(ChannelValue).map((gid: string) => {
      ChannelValue[Number(gid)] = new DataStoreGroupDataItem(
        ...(ChannelValue[Number(gid)] as unknown as ConstructorParameters<typeof DataStoreGroupDataItem>)
      );
    });
    return ChannelValue;
  }
}

export class DataStoreGroupDataItem {
  Value: DataStoreDataValue;
  Values: unknown[];
  DateTime: number;
  X: number;
  Y: number;
  Z: number;
  Depth: number;
  constructor(Value: DataStoreDataValue[], Values: unknown[], DateTime: number, X: number, Y: number, Z: number, Depth: number) {
    this.Value = new DataStoreDataValue(...(Value as ConstructorParameters<typeof DataStoreDataValue>)).extractValue();
    this.Values = Values;
    this.DateTime = DateTime;
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.Depth = Depth;
  }
}
