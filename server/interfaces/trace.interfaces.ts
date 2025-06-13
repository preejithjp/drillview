export enum TraceLevel {
  Off = 0, // Output no tracing and debugging messages.

  Error = 1, // Output error-handling messages.

  Warning = 2, // Output warnings and error-handling messages.

  Info = 3, // Output informational messages, warnings, and error-handling messages.

  Verbose = 4, // Output all debugging and tracing messages.
}

export interface ITrace {
  TraceId?: string;
  ApplicationName: string;
  Level: TraceLevel;
  Title: string;
  Details?: string;
  TraceTime: number;
}

export interface ITraceFilter {
  pageCount: number;
  pageLimit?: number;
  application?: string[];
  level?: number;
  searchText?: string;
  startDate?: number | string;
  endDate?: number | string;
}
