import { Server } from '../controllers/server.controller';
import ServiceStatusController from '../controllers/servicestatus.controller';
import { Environments } from '../interfaces/server.interfaces';

let initializationTime: number = Date.now();
const ALIVE_STATUS_NOTIFY_FREQUENCY = 60000;
const serviceStatusController = new ServiceStatusController();

export function startInitialServices() {
  initializationTime = Date.now();

  if (Server.ENV !== Environments.DEV) {
    setTimeout(() => {
      startAliveStatusUpdate();
    }, ALIVE_STATUS_NOTIFY_FREQUENCY);
  }
}

/**
 * Start polling for services and notifying WebSocket clients.
 */
function startAliveStatusUpdate() {
  serviceStatusController.aliveStatusNotify(initializationTime);
  setTimeout(startAliveStatusUpdate, ALIVE_STATUS_NOTIFY_FREQUENCY);
}
