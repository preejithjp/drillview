/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api } from '@/services/api.services';
import { store } from '@/main';
import { ITrace, TraceLevel } from '../../server/interfaces/trace.interfaces';
import { Environments } from '../../server/interfaces/server.interfaces';

export default class Logger {
  static Error(message: string, details?: any): void {
    if (typeof details === 'object') details = JSON.stringify(details);
    const log = this.prepareMessage(TraceLevel.Error, message, details);
    console.error(`[${new Date().toISOString()}] `, log);
    if (store.runtimeConfig.MODE === Environments.PROD) {
      Api.addTrace(TraceLevel.Error, message, details);
    }
  }

  static Warn(message: string, details?: any): void {
    if (typeof details === 'object') details = JSON.stringify(details);
    const log = this.prepareMessage(TraceLevel.Warning, message, details);
    console.warn(`[${new Date().toISOString()}] `, log);
    if (store.runtimeConfig.MODE === Environments.PROD) {
      Api.addTrace(TraceLevel.Warning, message, details);
    }
  }

  static Info(message: string, details?: any): void {
    if (typeof details === 'object') details = JSON.stringify(details);
    const log = this.prepareMessage(TraceLevel.Info, message, details);
    console.log(`[${new Date().toISOString()}] `, log);
    if (store.runtimeConfig.MODE === Environments.PROD) {
      Api.addTrace(TraceLevel.Info, message, details);
    }
  }

  static Verbose(message: string, details?: any): void {
    if (typeof details === 'object') details = JSON.stringify(details);
    const log = this.prepareMessage(TraceLevel.Verbose, message, details);
    console.log(`[${new Date().toISOString()}] `, log);
    if (store.runtimeConfig.MODE === Environments.PROD) {
      Api.addTrace(TraceLevel.Verbose, message, details);
    }
  }

  private static prepareMessage(Level: TraceLevel, Title: string, Detail: string): Omit<ITrace, 'ApplicationName' | 'TraceTime'> {
    const Details = typeof Detail !== 'string' ? JSON.stringify(Detail) : Detail;
    const payload: Omit<ITrace, 'ApplicationName' | 'TraceTime'> = {
      Level,
      Title,
      Details,
    };
    return payload;
  }
}
