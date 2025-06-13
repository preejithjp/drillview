import mongoose, { ConnectOptions, Connection } from 'mongoose';
import Trace from '../../controllers/trace.controller';
import { IDBStatus } from './db.connector.base';
import { IScenario } from '../../interfaces/rigscheduler.interfaces';
import { IRigSchema } from '../../interfaces/rigschema.interfaces';
import { IWellSchema } from '../../interfaces/wellschema.interfaces';
import { ScenarioSchema } from '../models/scenario.model';
import { RigSchema } from '../models/rig.model';
import { WellSchema } from '../models/wellschema.model';

export enum RigSchedulerSchemas {
  SCENARIO = 'scenario',
  RIG = 'rig',
  WELL = 'well',
}

export class RigSchedulerDB {
  public static Scenario: mongoose.Model<IScenario>;
  public static Rig: mongoose.Model<IRigSchema>;
  public static Well: mongoose.Model<IWellSchema>;

  private static connection: Connection | null = null;
  private static DB_NAME: string = `Mongo DB ${process.env.RIGSCHEDULER_DB_NAME}`;

  public static async initialize(): Promise<void> {
    if (this.connection) {
      Trace.Verbose(`${this.DB_NAME} is already initialized.`);
      return;
    }

    this.connection = await this.connect(
      process.env.RIGSCHEDULER_DB_ENDPOINT || '',
      process.env.RIGSCHEDULER_DB_NAME || '',
      process.env.RIGSCHEDULER_DB_USERNAME || '',
      process.env.RIGSCHEDULER_DB_PASSWORD || ''
    );

    this.initializeModels();
  }

  public static get RigSchedulerConnection(): Connection | null {
    return this.connection;
  }

  private static async connect(dbEndpoint: string, dbName: string, username: string, password: string): Promise<Connection | null> {
    if (!dbEndpoint || !dbName) {
      Trace.Error(`${this.DB_NAME}: Missing connection details.`);
      return null;
    }

    const connOptions: ConnectOptions = {
      authSource: 'admin',
      bufferCommands: false,
      auth: username && password ? { username, password } : undefined,
    };

    try {
      const connection = mongoose.createConnection(`${dbEndpoint}${dbName}`, connOptions);

      connection.on('error', (err) => Trace.Error(`${this.DB_NAME} Error: ${err.message}`));
      connection.on('disconnected', () => Trace.Warn(`Disconnected from ${this.DB_NAME}.`));

      await connection.asPromise();
      Trace.Info(`Connected to ${this.DB_NAME}.`);
      return connection;
    } catch (error: any) {
      Trace.Error(`${this.DB_NAME} Connection Failed: ${error.message}`);
      return null;
    }
  }

  private static initializeModels(): void {
    if (this.connection) {
      this.Scenario = this.connection.model<IScenario>(RigSchedulerSchemas.SCENARIO, ScenarioSchema, RigSchedulerSchemas.SCENARIO);
      this.Rig = this.connection.model<IRigSchema>(RigSchedulerSchemas.RIG, RigSchema, RigSchedulerSchemas.RIG);
      this.Well = this.connection.model<IWellSchema>(RigSchedulerSchemas.WELL, WellSchema, RigSchedulerSchemas.WELL);
    }
  }

  public static async checkConnectionStatus(): Promise<IDBStatus> {
    if (this.connection) {
      try {
        await this.connection.db?.admin().ping();
        return {
          Source: 'Mongo DB',
          Name: this.DB_NAME,
          Status: 'Connected',
          Message: '',
        };
      } catch (error: any) {
        return {
          Source: 'Mongo DB',
          Name: this.DB_NAME,
          Status: 'Disconnected',
          Message: error.message || 'Error',
        };
      }
    }

    return {
      Source: 'Mongo DB',
      Name: this.DB_NAME,
      Status: 'Disconnected',
      Message: 'No connection',
    };
  }
}
