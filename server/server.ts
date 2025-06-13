import express, { Application } from 'express';
import http from 'http';
import https from 'https';
import 'dotenv/config';
import ejs from 'ejs';
import { HttpStatusCode } from 'axios';
import { Server } from './controllers/server.controller';
import { Environments, ServerType } from './interfaces/server.interfaces';
import initializeRoutes from './handlers/routes.handler';
import { DBHandler } from './handlers/db.handler';
import { TraceLevel } from './interfaces/trace.interfaces';
import Trace, { LoggerOpts } from './controllers/trace.controller';
import { initializeWebSocketServer } from './services/websocket/websocket.server';
import { startInitialServices } from './services/initialization.service';

let nodeServer!: ServerType;
const app: Application = express();

app.set('port', Server.PORT);

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

// !!! DONOT CHANGE POSITION app.get("/") SECTION
// !!! IF CHANGE REQUIRED PLEASE VERIFY BOTH PROD AND DEV BUILDS
// !!! Issue with runtime config binding as template
app.get('/', Server.serveAppIndex);

app.get(`${Server.BASE_URL}/`, function (_req, res) {
  res.writeHead(HttpStatusCode.NotFound, { 'Content-Type': 'text/html' });
  res.end(Server.getAPILangingPage());
});

app.use(express.json({ limit: '5mb' }));
app.use(express.static(Server.PUBLIC_PATH));
Server.UpdateSwaggerDoc();

DBHandler.initialize();
initializeRoutes(app);

app.get('/*', Server.serveAppIndex);

new Trace({
  minLogLevel: Server.ENV === Environments.PROD ? (Number(process.env.MIN_TRACE_LEVEL) as TraceLevel) || TraceLevel.Info : TraceLevel.Verbose,
} as LoggerOpts);

if (Server.SSL) {
  const credentials = Server.getCertificatesDetails();
  if (credentials) {
    nodeServer = https.createServer(credentials, app);
  } else {
    Trace.Error('Application Initialization Failed due to Certificate Errors !');
    process.exit(1);
  }
} else {
  nodeServer = http.createServer(app);
}

const server = nodeServer.listen(app.get('port'), Server.CreatedCallback);

server.on('error', Server.ErrorCallback);

initializeWebSocketServer(server);
startInitialServices();
