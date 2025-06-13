import { Route, Tags, Get, Body, Delete, Patch, Security, Post, Path } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { DashboardDB } from '../database/connectors/dashboarddb.connector';
import { DashboardSettings } from '../helpers/settings.helper';

export type InsertSettingsResponse = ApiResponse<DashboardSettings | null>;
export type GetSettingsResponse = ApiResponse<DashboardSettings | null>;
type DeleteSettingsResponse = ApiResponse<null>;

@Route('settings')
@Tags('Settings')
@Security('bearerAuth')
export default class DashboardSettingController {
  @Get('/{id}')
  public async getSettings(@Path() id: string): Promise<GetSettingsResponse> {
    try {
      if (!id) {
        return { error: true, message: 'Settings Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const settings: DashboardSettings = await DashboardDB.Settings.find({ SettingId: id }, { _id: false }).lean<DashboardSettings>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: settings };
    } catch (error) {
      const errorMsg = `${error?.codeName || 'Error'}: ${error?.errmsg || error.message}`;
      return { error: true, message: errorMsg, statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Post('/')
  public async insterSettingsLayout(@Body() insertData: DashboardSettings): Promise<InsertSettingsResponse> {
    try {
      if (!insertData) return { error: true, message: 'Settings Data is required!', statusCode: HttpStatusCode.BadRequest };
      if (insertData.SettingId && typeof insertData.SettingId === 'string') {
        const response = await DashboardDB.Settings.create(insertData);
        return { error: false, message: 'Settings Inserted Successfully', statusCode: HttpStatusCode.Ok, data: response };
      } else {
        return { error: true, message: 'Error While Adding Settings', statusCode: HttpStatusCode.Ok, data: null };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Settings',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{id}')
  public async upsertSettings(@Path() id: string, @Body() upsertData: DashboardSettings): Promise<InsertSettingsResponse> {
    try {
      if (!id) {
        return { error: true, message: 'Settings Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const response = await DashboardDB.Settings.updateMany({ SettingId: id }, { $set: upsertData }, { upsert: true }).lean<DashboardSettings>();
      return { error: false, message: 'Settings Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return { error: true, message: 'Error While updating settings', statusCode: HttpStatusCode.BadRequest, data: error?.message || error };
    }
  }

  @Delete('/{id}')
  public async deleteSettingsById(@Path() id: string): Promise<DeleteSettingsResponse> {
    try {
      if (!id) return { error: true, message: 'Settings Id is required!', statusCode: HttpStatusCode.BadRequest };
      await DashboardDB.Settings.deleteOne({ SettingId: id }).lean<DashboardSettings>();
      return { error: false, message: 'Settings Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Settings', statusCode: HttpStatusCode.BadRequest };
    }
  }
}
