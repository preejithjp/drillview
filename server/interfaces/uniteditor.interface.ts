import { Binary } from 'bson';

export interface IFormula {
  Add: number;
  Subtract: number;
  Multiply: number;
  Divide: number;
}

export interface IConversion {
  ConversionId?: string | Binary;
  Unit: string;
  Alias: string[];
  Description: string;
  Formula: IFormula;
}

export interface IUnit {
  BaseUnit: string;
  Alias: string[];
  Description: string;
  Conversions: IConversion[];
}

export interface IVariables {
  Groups: string[];
  Variable: string;
}

export interface IUnitTypes {
  UnitTypeId?: string | Binary;
  UnitType: string;
  Alias: string[];
  Unit: IUnit;
  Variables?: IVariables[];
}
