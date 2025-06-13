import mongoose from 'mongoose';
import BaseDB from './db.connector.base';
import Trace from '../../controllers/trace.controller';

import { ITrace } from '../../interfaces/trace.interfaces';
import { TraceSchema } from '../models/trace.model';

enum TraceDBSchemas {
  TRACE = 'traces',
}
export class TraceDB extends BaseDB {
  private static instance: TraceDB;

  public static Trace: mongoose.Model<ITrace>;

  protected DB_ENDPOINT = process.env.TRACE_DB_ENDPOINT || '';
  protected DB_NAME = process.env.TRACE_DB_NAME || '';
  protected DB_USERNAME = process.env.TRACE_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.TRACE_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined = undefined;

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new TraceDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new TraceDB();
    }
    return this.instance.getStatus();
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new TraceDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    TraceDB.Trace = this.connection.model<ITrace>(TraceDBSchemas.TRACE, TraceSchema, TraceDBSchemas.TRACE);
  }
}
