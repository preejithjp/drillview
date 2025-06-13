import path from 'path';
import os from 'os';
import fs from 'fs';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import appPackage from '../../package.json';
import { CertificateType, Environments } from '../interfaces/server.interfaces';
import Trace from './trace.controller';

export class Server {
  static PORT = process.env.PORT ? Number(process.env.PORT) : 9001;
  static ENV: Environments = process.env.NODE_ENV?.toLowerCase()?.includes('dev') ? Environments.DEV : Environments.PROD;
  static APP_NAME = appPackage.name.replace(/^./, (str) => str.toUpperCase());
  static APP_VERSION = appPackage.version;
  static PUBLIC_PATH = path.join(process.cwd(), 'public');
  static BASE_URL = process.env.APP_API_BASE_URL || '';
  static SSL = (process.env.SSL_ENABLED && process.env.SSL_ENABLED.toLowerCase() === 'true') || false;
  static HOST_NAME = process.env.HOST_NAME || os.hostname();
  static HOST_ADDRESS = `${Server.SSL ? 'https' : 'http'}://${this.HOST_NAME}:${Server.PORT}`;
  static JWT_SECRET = 'c123456718e14a8f-8f2584ccba37b96';
  static RUNTIMECONFIG = this.setRunTimeConfigs();

  static getAPILangingPage(): string {
    return `
      <section style="display: flex;flex-direction: column;align-items: center;height: 50%;justify-content: center;text-transform: capitalize;font-family: sans-serif;">
        <h1 style='display: flex;justify-content: center;letter-spacing: 0.4;font-size: 34px;'>
          ${Server.APP_NAME} App
        </h1>
        </br>
        </br>
        <a href="/swagger/">API Documentation</a>
      </section>
    `;
  }

  static serveAppIndex(_req: Request, res: Response): void {
    if (Server.ENV !== Environments.DEV) {
      res.render(`${Server.PUBLIC_PATH}/index.html`, { runtimeData: Server.RUNTIMECONFIG });
    } else {
      res.writeHead(HttpStatusCode.Accepted, { 'Content-Type': 'text/html' });
      res.end(Server.getAPILangingPage());
    }
  }

  static setRunTimeConfigs() {
    const runtimeData: { [key: string]: string } = {};
    Object.keys(process.env).forEach((e) => {
      if (e.includes('APP_')) {
        const key = e.split('APP_').pop() as string;
        runtimeData[key] = process.env[key] = process.env[e] || '';
      }
    });
    return runtimeData;
  }

  static getCertificatesDetails() {
    if (Server.SSL) {
      try {
        if (process.env.SSL_CERTIFICATE && process.env.SSL_KEY) {
          const ext = process.env.SSL_CERTIFICATE.split('.')?.pop()?.toLowerCase();
          if (!ext) {
            const msg = 'Please provide valid certificate and key file names.';
            Trace.Error(msg, `Received Certificate: ${process.env.SSL_CERTIFICATE}`);
            throw new Error(msg);
          } else if (!['crt', 'pfx', 'pem'].includes(ext)) {
            const msg = 'Certificate type not supported: Only .CRT, .PFX, .PEM were supported.';
            Trace.Error(msg, `Received Certificate: ${process.env.SSL_CERTIFICATE}`);
            throw new Error(msg);
          } else {
            const certificate = fs.readFileSync(path.join(process.cwd(), 'ssl_certs', process.env.SSL_CERTIFICATE)) as unknown as string;
            let credentials!: CertificateType;

            if (ext === 'pfx') {
              if (!process.env.SSL_KEY) {
                const msg = 'Passphrase is required for reading .pfx certificate.';
                Trace.Error(msg, `Received Value: ${process.env.key}`);
                throw new Error(msg);
              } else {
                credentials = { pfx: certificate, passphrase: process.env.SSL_KEY };
              }
            } else {
              const privateKey = fs.readFileSync(path.join(process.cwd(), 'ssl_certs', process.env.SSL_KEY)) as unknown as string;
              credentials = { cert: certificate, key: privateKey };
            }
            if (credentials && Object.keys(credentials).length) {
              return credentials;
            } else {
              const msg = 'Certificate binding Failed: Invalid certificate details !';
              Trace.Error(msg);
              throw new Error(msg);
            }
          }
        } else {
          const msg = 'Invalid Certificate or key value.';
          Trace.Error(msg);
          throw new Error(msg);
        }
      } catch (error) {
        Trace.Error('SSL Certificate Error.', JSON.stringify(error));
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  static CreatedCallback() {
    Trace.Info(
      `Application started at ${Server.HOST_ADDRESS} in ${Server.ENV} mode with Version: ${Server.APP_VERSION}.`,
      `BuildNumber: ${appPackage.config.buildNumber}<br>BranchName: ${appPackage.config.branchName}<br>
       Documentation: <a href="${Server.HOST_ADDRESS}/swagger">${Server.HOST_ADDRESS}/swagger</a>`
    );
  }

  static ErrorCallback(error: { syscall: string; code: string }): void {
    const port: number = Server.PORT;
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind: string = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        Trace.Error(bind + ' requires elevated privileges.');
        return process.exit(1);
      case 'EADDRINUSE':
        Trace.Error(bind + ' is already in use.');
        return process.exit(1);
      default:
        Trace.Error('Application Startup Failed due to unknown Error.', 'ErrorCode:' + error.code);
        throw error;
    }
  }

  static UpdateSwaggerDoc() {
    const filepath = path.join(process.cwd(), 'public', 'swagger.json');
    if (fs.existsSync(filepath)) {
      try {
        fs.readFile(filepath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
          if (err) {
            Trace.Warn('Swagger Doc Read Failed', err?.message || String(err));
            return;
          }
          const json = JSON.parse(data);
          json.info.version = `${Server.APP_VERSION}#${appPackage.config.buildNumber}`;
          json.info.title = Server.APP_NAME + ' API Docs';
          json.info.description = `API Documentation for ${Server.APP_NAME} App`;
          json.servers[0].url = this.BASE_URL;
          fs.writeFile(filepath, JSON.stringify(json), 'utf8', (err: NodeJS.ErrnoException | null) => {
            if (err) {
              Trace.Warn('Swagger Doc Write Failed', err?.message || String(err));
            } else {
              Trace.Info('Swagger Doc Updated Successfully');
            }
          });
        });
      } catch (error) {
        Trace.Warn('Swagger Doc Update Failed', error?.message || error);
      }
    }
  }
}
