import { Get } from 'tsoa';
import { TraceLevel, ITrace, ITraceFilter } from '../interfaces/trace.interfaces';
import { Body, Post, Route, Security, Tags } from 'tsoa';
import { Server } from './server.controller';
import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { Utils } from '../utils/common.utils';
import { TraceDB } from '../database/connectors/tracedb.connector';
import { Environments } from '../interfaces/server.interfaces';
import { DBReadyState } from '../database/connectors/db.connector.base';

type GetTraceResponse = ApiResponse<ITrace[]>;
type GetDistinctResponse = ApiResponse<string[]>;

/**
 * @param {TraceLevel} minLogLevel - specifies the maximum level of messages that a transport should log. Defaults to `VERBOSE`
 */
export interface LoggerOpts {
  minLogLevel?: TraceLevel;
}

export interface IFilterQuery {
  $or?: { [key in keyof ITrace]?: { $regex: string; $options: string } }[];
  ApplicationName?: { $in: string[] };
  Level?: number;
  TraceTime?: IDateFilter;
}

export interface IDateFilter {
  $gte?: number;
  $lte?: number;
}

export enum ConsoleColors {
  WHITE = '\x1b[37m%s\x1b[0m',
  GREEN = '\x1b[92m%s\x1b[0m',
  BLUE = '\x1b[34m%s\x1b[0m',
  YELLOW = '\x1b[33m%s\x1b[0m',
  RED = '\x1b[31m%s\x1b[0m',
  RESET = '\x1b[0m\x1b[0m',
}

@Route('traces')
@Tags('Trace')
@Security('bearerAuth')
export default class Trace {
  static options: LoggerOpts;
  static traceQueue: ITrace[] = [];
  constructor(options: LoggerOpts) {
    Trace.options = options;
  }

  @Get('/')
  public static async getAllTraces(): Promise<GetTraceResponse> {
    try {
      const traces: ITrace[] = await TraceDB.Trace.find({}, { _id: false }).lean<ITrace[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: traces };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Trace Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/{fieldName}')
  public static async getDistinctValues(fieldName: string): Promise<GetDistinctResponse> {
    try {
      const values: string[] = await TraceDB.Trace.distinct(fieldName).lean<string[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: values };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Distinct Values',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/filter')
  public static async getSetFilters(@Body() data: ITraceFilter): Promise<GetTraceResponse> {
    try {
      if (!data.pageCount || !data.pageLimit) {
        return { error: true, message: 'pageCount and pageLimit are required', statusCode: HttpStatusCode.BadRequest };
      }

      const page = data.pageCount;
      const limit = data.pageLimit;
      const skip = (page - 1) * limit;
      const searchText = data.searchText?.trim() || '';
      const filter: IFilterQuery = {};
      if (searchText) {
        filter.$or = [{ Title: { $regex: searchText, $options: 'i' } }, { Details: { $regex: searchText, $options: 'i' } }];
      }
      if (data.application?.length) {
        filter.ApplicationName = { $in: data.application };
      }

      if (data.level !== undefined && data.level !== null) {
        filter.Level = data.level;
      }

      if (data.startDate || data.endDate) {
        if (!data.startDate || !data.endDate) {
          return { error: true, message: 'Both startDate and endDate are required', statusCode: HttpStatusCode.BadRequest };
        }

        const dateFilter: IDateFilter = {};
        const startDate: number = /^\d{13}$/.test(data.startDate as string)
          ? parseInt(data.startDate as string, 10)
          : new Date(data.startDate).getTime();
        if (isNaN(startDate)) {
          return { error: true, message: 'Invalid startDate format', statusCode: HttpStatusCode.BadRequest };
        }
        const endDate: number = /^\d{13}$/.test(data.endDate as string) ? parseInt(data.endDate as string, 10) : new Date(data.endDate).getTime();
        if (isNaN(endDate)) {
          return { error: true, message: 'Invalid endDate format', statusCode: HttpStatusCode.BadRequest };
        }
        if (startDate > endDate) {
          return { error: true, message: 'startDate cannot be greater than endDate', statusCode: HttpStatusCode.BadRequest };
        }

        dateFilter.$gte = startDate;
        dateFilter.$lte = endDate;

        filter.TraceTime = dateFilter;
      }

      const filterTrace: ITrace[] = await TraceDB.Trace.find(filter, { _id: false }).skip(skip).limit(limit).sort({ TraceTime: -1 }).lean<ITrace[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: filterTrace };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Filtering Values',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/{traceLevel}')
  public static HTTP(traceLevel: TraceLevel, @Body() traceData: Omit<ITrace, 'ApplicationName' | 'TraceTime' | 'Level'>): void {
    const data = this.prepareJSONData({ Level: traceLevel, ...traceData }, Server.APP_NAME + ':Client');
    this.addLogsToConsole(data);
    this.addLogToDb(data);
  }

  /**
   * Indicates a significant problem or error that requires attention but doesn't necessarily halt the system.
   */
  public static Error(message: string, details?: string): void {
    const data = this.prepareJSONData({ Level: TraceLevel.Error, Title: message, Details: details || '' });
    this.addLogsToConsole(data);
    this.addLogToDb(data);
  }

  /**
   * Indicates potential issues or unexpected conditions that may need attention.
   */
  public static Warn(message: string, details?: string): void {
    const data = this.prepareJSONData({ Level: TraceLevel.Warning, Title: message, Details: details || '' });
    this.addLogsToConsole(data);
    this.addLogToDb(data);
  }

  /**
   * General information confirming that the system is functioning as expected.
   */
  public static Info(message: string, details?: string): void {
    const data = this.prepareJSONData({ Level: TraceLevel.Info, Title: message, Details: details || '' });
    this.addLogsToConsole(data);
    this.addLogToDb(data);
  }

  /**
   * Detailed information primarily useful for diagnosing problems during development and debugging.
   */
  public static Verbose(message: string, details?: string): void {
    const data = this.prepareJSONData({ Level: TraceLevel.Verbose, Title: message, Details: details || '' });
    this.addLogsToConsole(data);
    this.addLogToDb(data);
  }

  private static prepareJSONData(logData: Omit<ITrace, 'ApplicationName' | 'TraceTime'>, source?: string): ITrace | null {
    if (!logData.Level && Utils.ValueIsInEnum(logData.Level, TraceLevel)) {
      console.error(`Log Level is required`);
      return null;
    }
    if (!logData.Title) {
      console.error(`Log Title is required`);
      return null;
    }
    return {
      ApplicationName: source || Server.APP_NAME,
      Level: logData.Level,
      Title: logData.Title,
      Details: typeof logData.Details !== 'string' ? JSON.stringify(logData.Details) : logData.Details,
      TraceTime: Date.now(),
    };
  }

  private static addLogsToConsole(printObject: ITrace | null) {
    if (!printObject) return;
    switch (printObject.Level) {
      case TraceLevel.Error:
        console.error(ConsoleColors.RED, `[${new Date(printObject.TraceTime).toISOString()}] ${JSON.stringify(printObject)}`, ConsoleColors.RESET);
        break;
      case TraceLevel.Warning:
        console.warn(ConsoleColors.YELLOW, `[${new Date(printObject.TraceTime).toISOString()}] ${JSON.stringify(printObject)}`, ConsoleColors.RESET);
        break;
      case TraceLevel.Info:
        console.log(ConsoleColors.BLUE, `[${new Date(printObject.TraceTime).toISOString()}] ${JSON.stringify(printObject)}`, ConsoleColors.RESET);
        break;
      default:
        console.log(ConsoleColors.WHITE, `[${new Date(printObject.TraceTime).toISOString()}] ${JSON.stringify(printObject)}`, ConsoleColors.RESET);
    }
  }

  private static addLogToDb(saveObject: ITrace | null) {
    if (this.options?.minLogLevel === TraceLevel.Off || !saveObject || Server.ENV === Environments.DEV) {
      return;
    }
    try {
      const traceDBConnection = TraceDB.getStatus();
      if (traceDBConnection.Status !== DBReadyState.CONNECTED) {
        this.traceQueue.push(saveObject);
      } else {
        this.traceQueue.forEach((t) => TraceDB.Trace.create(t));
        this.traceQueue = [];
        TraceDB.Trace.create(saveObject);
      }
    } catch (error) {
      console.error('Error During Writing trace to mongo db: ' + error);
    }
  }
}
