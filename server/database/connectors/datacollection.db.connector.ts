import mongoose from 'mongoose';
import BaseDB from './db.connector.base';
import Trace from '../../controllers/trace.controller';

import { RigSchema } from '../models/datacollection.model';
import { IRig, IRigTemplate } from '../../interfaces/datacollection.interfaces';
import { RecordSchema } from '../models/records.model';

enum DataCollectDBSchema {
  DATACOLLECTION = 'rigs',
  RECORDS = 'records',
}

export class DataCollectDB extends BaseDB {
  private static instance: DataCollectDB;

  public static DataCollection: mongoose.Model<IRig>;
  public static Records: mongoose.Model<IRigTemplate>;

  protected DB_ENDPOINT = process.env.DATACOLLECT_DB_ENDPOINT || '';
  protected DB_NAME = process.env.DATACOLLECT_DB_NAME || '';
  protected DB_USERNAME = process.env.DATACOLLECT_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.DATACOLLECT_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined = 'datacollectiondb';

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new DataCollectDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new DataCollectDB();
    }
    return this.instance.getStatus();
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new DataCollectDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    DataCollectDB.DataCollection = this.connection.model<IRig>(DataCollectDBSchema.DATACOLLECTION, RigSchema, DataCollectDBSchema.DATACOLLECTION);
    DataCollectDB.Records = this.connection.model<IRigTemplate>(DataCollectDBSchema.RECORDS, RecordSchema, DataCollectDBSchema.RECORDS);
  }
}
