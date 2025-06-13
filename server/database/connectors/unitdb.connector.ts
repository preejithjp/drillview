import mongoose from 'mongoose';
import Trace from '../../controllers/trace.controller';
import BaseDB from './db.connector.base';

import { UnitTypeSchema } from '../models/uniteditor.model';
import { IUnitTypes } from '../../interfaces/uniteditor.interface';

export enum UnitDBSchemas {
  UNITTYPE = 'unittypes',
}

export class UnitDB extends BaseDB {
  private static instance: UnitDB;

  public static UnitType: mongoose.Model<IUnitTypes>;

  protected DB_ENDPOINT = process.env.UNIT_DB_ENDPOINT || '';
  protected DB_NAME = process.env.UNIT_DB_NAME || '';
  protected DB_USERNAME = process.env.UNIT_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.UNIT_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined = undefined;

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new UnitDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new UnitDB();
    }
    return this.instance.getStatus();
  }

  public static abcd() {
    return 'abcd';
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new UnitDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    UnitDB.UnitType = this.connection.model<IUnitTypes>(UnitDBSchemas.UNITTYPE, UnitTypeSchema, UnitDBSchemas.UNITTYPE);
  }
}
