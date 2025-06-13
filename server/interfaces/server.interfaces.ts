import https from 'https';
import http, { IncomingMessage, ServerResponse } from 'http';

export enum Environments {
  PROD = 'production',
  DEV = 'development',
}

export type ServerType =
  | https.Server<typeof IncomingMessage, typeof ServerResponse>
  | http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export type CertificateType = https.ServerOptions<typeof http.IncomingMessage, typeof http.ServerResponse>;
