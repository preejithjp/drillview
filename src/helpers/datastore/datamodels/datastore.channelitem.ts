import { DataStoreDataValue } from './datastore.datavalue';

export class DataStoreChannelDataItem {
  ChannelId: number;
  KeyIndex: number;
  Value: DataStoreDataValue;
  Values: unknown[];
  DateTime: number;
  X: number;
  Y: number;
  Z: number;
  Depth: number;

  constructor(
    ChannelId: number,
    KeyIndex: number,
    Value: DataStoreDataValue[],
    Values: unknown[],
    DateTime: number,
    X: number,
    Y: number,
    Z: number,
    Depth: number
  ) {
    this.ChannelId = ChannelId;
    this.KeyIndex = KeyIndex;
    this.Value = new DataStoreDataValue(...(Value as ConstructorParameters<typeof DataStoreDataValue>)).extractValue();
    this.Values = Values;
    this.DateTime = DateTime;
    this.X = X;
    this.Y = Y;
    this.Z = Z;
    this.Depth = Depth;
  }
}
