import { Get, Route, Tags, Security, Inject, Path } from 'tsoa';
import { HttpStatusCode } from 'axios';
import { ApiResponse } from '../interfaces/response.interfaces';
import StoreConnector from '../services/connectors/store.connector';
import { AssemblyTypes, EquipmentTypes, StoreDataHeader } from '../interfaces/store.connector.interfaces';

type GetWellboresResponse = ApiResponse<StoreDataHeader[] | null>;
type GetLogsResponse = ApiResponse<StoreDataHeader[] | null>;
type GetMnemonicsResponse = ApiResponse<StoreDataHeader[] | null>;
type GetMetadataResponse = ApiResponse<StoreDataHeader | null>;

@Route('')
@Tags('Platform')
@Security('bearerAuth')
export default class PlatformController {
  @Get('/wellbores')
  public async getWellbores(@Inject() token?: string): Promise<GetWellboresResponse> {
    try {
      const respData = await new StoreConnector(token).get(AssemblyTypes.WITSML_Wellbore); // TODO - match types
      return respData;
    } catch (error) {
      const msg = `Error while calling getWellbores : ${error?.code}: ${error?.message}`;
      return { error: true, message: msg, statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Get('wellbores/{referenceUrl}/logs')
  public async getLogs(@Path() referenceUrl: string, @Inject() token?: string): Promise<GetLogsResponse> {
    try {
      const respData = await new StoreConnector(token).getNestedChild(undefined, referenceUrl);
      return respData;
    } catch (error) {
      const msg = error?.code ? `getLogs : ${error?.code}: ${error?.message}` : 'Error while calling getLogs';
      return { error: true, message: msg, statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Get('wellbores/{referenceUrl}/mnemonics')
  public async getMnemonics(@Path() referenceUrl: string, @Inject() token?: string): Promise<GetMnemonicsResponse> {
    try {
      const respData = await new StoreConnector(token).get(EquipmentTypes.Channel, undefined, referenceUrl);
      return respData;
    } catch (error) {
      const msg = error?.code ? `getMnemonics : ${error?.code}: ${error?.message}` : 'Error while calling getMnemonics';
      return { error: true, message: msg, statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Get('wellbores/{wellboreUri}')
  public async getWellboreMetadata(@Path() wellboreUri: string, @Inject() token?: string): Promise<GetMetadataResponse> {
    try {
      const respData = await new StoreConnector(token).getMetaData(wellboreUri);
      return respData;
    } catch (error) {
      const msg = error?.code ? `getWellboreMetadata : ${error?.code}: ${error?.message}` : 'Error while calling getWellboreMetadata';
      return { error: true, message: msg, statusCode: HttpStatusCode.BadRequest };
    }
  }
}
