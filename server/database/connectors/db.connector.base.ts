import mongoose, { ConnectOptions, Connection } from 'mongoose';
import Trace from '../../controllers/trace.controller';
import { Server } from '../../controllers/server.controller';
import { Environments } from '../../interfaces/server.interfaces';
import DBUtils from '../../utils/db.utils';

export enum DBReadyState {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  ERROR = 'Error',
  CONNECTING = 'Connecting',
  NOTINITIALIZED = 'Not Initialized',
}

export interface IDBStatus {
  Source: string;
  Name: string;
  Status: string;
  Message: string;
}

export default abstract class BaseDB {
  protected connection!: Connection; // Instance-specific connection
  protected connectionError: Error | null = null; // Instance-specific connection error
  protected connectionState: string = DBReadyState.NOTINITIALIZED; // Instance-specific connection state
  protected abstract DB_NAME: string; // Each subclass must define its own property
  protected abstract DB_ENDPOINT: string; // Each subclass must define its own property
  protected abstract DB_USERNAME: string; // Each subclass must define its own property
  protected abstract DB_PASSWORD: string; // Each subclass must define its own property
  protected abstract DB_SEEDING_FOLDER?: string; // Each subclass must define its own property
  protected DB_SOURCE: string = 'Mongo DB'; // Default DB source

  public async initialize(): Promise<void> {
    // this.DB_NAME = `Mongo DB ${dbName}`; // Set the DB name based on the provided dbName
    if (this.isConnected()) {
      Trace.Verbose(`${this.DB_NAME} is already initialized.`);
      return;
    }

    try {
      this.connectionError = null; // Reset the error before attempting to connect
      this.connectionState = DBReadyState.CONNECTING; // Update state to connecting
      this.connection = await this.connect(this.DB_ENDPOINT, this.DB_NAME, this.DB_USERNAME, this.DB_PASSWORD);
      this.connectionState = DBReadyState.CONNECTED; // Update state to connected
      this.initializeModels(); // Call the abstract method for model initialization
      if (Server.ENV === Environments.PROD && this.DB_SEEDING_FOLDER) {
        DBUtils.InitSeeding(this.connection, 'datacollectiondb');
      }
    } catch (error) {
      this.connectionError = error; // Store the connection error
      this.connectionState = DBReadyState.DISCONNECTED; // Update state to disconnected
      Trace.Error(`${this.DB_NAME} : ${error.message}`);
    }
  }

  public getStatus(): IDBStatus {
    return this.preparestatusResponse(this.connectionState, this.connectionError?.message);
  }

  public async checkConnectionStatus(): Promise<IDBStatus> {
    if (this.connectionState === DBReadyState.DISCONNECTED || this.connectionState === DBReadyState.ERROR) {
      return this.preparestatusResponse(DBReadyState.DISCONNECTED, this.connectionError?.message || DBReadyState.DISCONNECTED);
    }

    try {
      await this.connection?.db?.admin().ping();
      return this.preparestatusResponse(DBReadyState.CONNECTED);
    } catch (error) {
      return this.preparestatusResponse(DBReadyState.DISCONNECTED, error.message || DBReadyState.DISCONNECTED);
    }
  }

  private async connect(dbEndpoint: string, dbName: string, username: string, password: string): Promise<Connection> {
    if (!dbEndpoint || !dbName) {
      throw new Error(`Missing DB connection details.`);
    }

    const connOptions: ConnectOptions = {
      authSource: 'admin',
      bufferCommands: false,
      auth: username && password ? { username, password } : undefined,
    };

    const connection = mongoose.createConnection(dbEndpoint + dbName, connOptions);

    connection.on('error', (err) => {
      this.connectionError = err; // Store the error
      this.connectionState = DBReadyState.ERROR; // Update state to error
      Trace.Error(`${this.DB_NAME} Error: ${err.message}`);
    });

    connection.on('disconnected', () => {
      this.connectionState = DBReadyState.DISCONNECTED; // Update state to disconnected
      Trace.Warn(`Disconnected from ${this.DB_NAME}.`);
    });

    await connection.asPromise();
    Trace.Info(`Connected to ${this.DB_NAME}.`);
    return connection;
  }

  private preparestatusResponse(status: string, message: string = ''): IDBStatus {
    return {
      Source: this.DB_SOURCE,
      Name: this.DB_NAME,
      Status: status,
      Message: message,
    };
  }

  protected isConnected(): boolean {
    return this.connection !== null && this.connectionState === DBReadyState.CONNECTED;
  }

  // Abstract method to be implemented by subclasses for model initialization
  protected abstract initializeModels(): void;
}
