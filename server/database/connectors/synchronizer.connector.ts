import mongoose from 'mongoose';
import BaseDB from './db.connector.base';
import Trace from '../../controllers/trace.controller';

import { IDataAccessConfig, ISourceConfig, JobConfig } from '../../interfaces/synchronizer.interfaces';
import { JobsSchema } from '../models/synchronizerJobs.models';
import { SourceSchema } from '../models/synchronizerSource.models';
import { DataAccessSchema } from '../models/synchronizerDataAccess.models';

export enum SynchronizerDBSchemas {
  JOBS = 'jobs',
  SOURCES = 'sources',
  ACCESSCONFIGS = 'accessconfigs',
}

export class SynchronizerDB extends BaseDB {
  private static instance: SynchronizerDB;

  public static Jobs: mongoose.Model<JobConfig>;
  public static Sources: mongoose.Model<ISourceConfig>;
  public static AccessConfigs: mongoose.Model<IDataAccessConfig>;

  protected DB_ENDPOINT = process.env.SYNCHRONIZER_DB_ENDPOINT || '';
  protected DB_NAME = process.env.SYNCHRONIZER_DB_NAME || '';
  protected DB_USERNAME = process.env.SYNCHRONIZER_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.SYNCHRONIZER_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined = undefined;

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new SynchronizerDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new SynchronizerDB();
    }
    return this.instance.getStatus();
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new SynchronizerDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    SynchronizerDB.Jobs = this.connection.model<JobConfig>(SynchronizerDBSchemas.JOBS, JobsSchema, SynchronizerDBSchemas.JOBS);
    SynchronizerDB.Sources = this.connection.model<ISourceConfig>(SynchronizerDBSchemas.SOURCES, SourceSchema, SynchronizerDBSchemas.SOURCES);
    SynchronizerDB.AccessConfigs = this.connection.model<IDataAccessConfig>(
      SynchronizerDBSchemas.ACCESSCONFIGS,
      DataAccessSchema,
      SynchronizerDBSchemas.ACCESSCONFIGS
    );
  }
}
