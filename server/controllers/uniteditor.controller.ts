import { Controller, Get, Route, Tags, Security } from 'tsoa';
import { IUnitTypes } from '../interfaces/uniteditor.interface';
import { HttpStatusCode } from 'axios';
import { ApiResponse } from '../interfaces/response.interfaces';
import { UnitDB } from '../database/connectors/unitdb.connector';

@Security('bearerAuth')
@Route('/unittypes')
@Tags('UnitTypes')
export default class UnitEditiorController extends Controller {
  @Get('/')
  async getUnitTypes(): Promise<ApiResponse<IUnitTypes[]>> {
    try {
      const unitTypes = await UnitDB.UnitType.find().lean<IUnitTypes[]>();
      const respData = {
        error: false,
        message: '',
        statusCode: HttpStatusCode.Ok,
        data: unitTypes,
      };
      return respData;
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Fetching Unit Types',
        statusCode: HttpStatusCode.BadRequest,
      };
    }
  }
}
