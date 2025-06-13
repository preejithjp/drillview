import { DataStoreDataTypes } from './datastore.datatypes';

export class DataStoreDataValue {
  DataType: DataStoreDataTypes;
  BooleanValue: boolean;
  ByteValue: number;
  BytesValue: Uint8Array | undefined;
  IntValue: number;
  LongValue: number;
  FloatValue: number;
  DoubleValue: number;
  DecimalValue: number;
  StringValue: string | undefined;
  DateTimeValue: Date;
  UnixDateValue: number;
  Value: unknown;
  Values: unknown[] | undefined;
  IsNull: boolean;

  constructor(
    DataType: DataStoreDataTypes,
    BooleanValue: boolean,
    ByteValue: number,
    BytesValue: Uint8Array,
    IntValue: number,
    LongValue: number,
    FloatValue: number,
    DoubleValue: number,
    DecimalValue: number,
    StringValue: string,
    DateTimeValue: Date,
    UnixDateValue: number,
    Value: unknown,
    Values: unknown[],
    IsNull: boolean
  ) {
    this.DataType = DataType;
    this.BooleanValue = BooleanValue;
    this.ByteValue = ByteValue;
    this.BytesValue = BytesValue;
    this.IntValue = IntValue;
    this.LongValue = LongValue;
    this.FloatValue = FloatValue;
    this.DoubleValue = DoubleValue;
    this.DecimalValue = DecimalValue;
    this.StringValue = StringValue;
    this.DateTimeValue = DateTimeValue;
    this.UnixDateValue = UnixDateValue;
    this.Value = Value;
    this.Values = Values;
    this.IsNull = IsNull;
  }

  extractValue(): any {
    switch (this.DataType) {
      case DataStoreDataTypes.Boolean:
        return this.BooleanValue;
      case DataStoreDataTypes.Byte:
        return this.ByteValue;
      case DataStoreDataTypes.Bytes:
        return this.BytesValue;
      case DataStoreDataTypes.Double:
        return this.DoubleValue;
      case DataStoreDataTypes.Decimal:
        return this.DecimalValue;
      case DataStoreDataTypes.Float:
        return this.FloatValue;
      case DataStoreDataTypes.Int:
        return this.IntValue;
      case DataStoreDataTypes.Long:
        return this.LongValue;
      case DataStoreDataTypes.UnixDate:
        return this.UnixDateValue;
      case DataStoreDataTypes.NullType:
        return null;
      case DataStoreDataTypes.Vector:
        return this.Value;
      default:
        return this.StringValue;
    }
  }
}
export { DataStoreDataTypes };
