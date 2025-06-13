import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { ServiceBase, IAliveStatus, ServiceStatusBase } from '../interfaces/servicestatus.interface';
import { Tags, Security, Body, Post } from 'tsoa';
import { Server } from './server.controller';
import { DBHandler } from '../handlers/db.handler';
import API from '../handlers/data.handler';

type AliveNotifyResponse = ApiResponse<ServiceBase[]>;

@Tags('Service Status')
@Security('bearerAuth')
export default class ServiceStatusController {
  @Post('/')
  public async aliveStatusNotify(@Body() initializationTime: number): Promise<AliveNotifyResponse> {
    try {
      const aliveStatuses = await DBHandler.checkConnectionStatus();
      const aliveObjects: ServiceStatusBase[] = aliveStatuses.map((status) => ({
        name: `${status.Source} ${status.Name}`,
        status: status.Message || status.Status,
      }));
      const insertObj: IAliveStatus = {
        applicationName: Server.APP_NAME,
        applicationupTime: Date.now() - initializationTime,
        hostName: Server.HOST_NAME,
        status: [...aliveObjects],
      };
      const response = (await API.ServiceManager.postData('/Alive/rport', insertObj)) as ApiResponse<ServiceBase[]>;
      return response;
    } catch (error) {
      return {
        error: true,
        message: 'Error While Sending Alive Status',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
}
