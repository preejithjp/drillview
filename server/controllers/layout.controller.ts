import { Route, Tags, Body, Delete, Security, Post, Get, Patch, Inject, Path } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { ILayout, ILayoutUsers, IWidget } from '../interfaces/dashboard.interfaces';
import { HttpStatusCode } from 'axios';
import { JWTUserData } from '../interfaces/auth.interfaces';
import BinaryUtils from '../utils/binary.utils';
import { DashboardDB } from '../database/connectors/dashboarddb.connector';
import { Binary } from 'bson';

export type InsertGridWidgetResponse = ApiResponse<ILayout | null>;
export type GetGridWidgetResponse = ApiResponse<ILayout[] | null>;
type DeleteGridWidgetResponse = ApiResponse<null>;

@Route('layout')
@Tags('Layout')
@Security('bearerAuth')
export default class LayoutController {
  @Get('/{id}')
  public async getLayouts(@Path() id: string): Promise<GetGridWidgetResponse> {
    try {
      if (!id) {
        return { error: true, message: "Layout Id's is required!", statusCode: HttpStatusCode.BadRequest };
      }
      const uuidBinary = BinaryUtils.convertUuidToBinary(id as string);
      const layout = await DashboardDB.Layout.find({ LayoutId: { $in: uuidBinary } }).lean<ILayout[]>();
      layout[0].LayoutId = BinaryUtils.convertBinaryToUuid(layout[0].LayoutId as Binary);
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: layout };
    } catch (error) {
      const errorMsg = `${error?.codeName || 'Error'}: ${error?.errmsg || error.message}`;
      return { error: true, message: errorMsg, statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Post('/')
  public async insterLayout(@Body() insertData: ILayoutUsers, @Inject() currentUser?: JWTUserData): Promise<InsertGridWidgetResponse> {
    try {
      if (!insertData) return { error: true, message: 'Layout is required!', statusCode: HttpStatusCode.BadRequest };
      if (insertData && insertData.LayoutId && typeof insertData.LayoutId === 'string') {
        const uuidBinary = BinaryUtils.convertUuidToBinary(insertData.LayoutId);
        const existingLayout = await DashboardDB.Layout.findOne({ LayoutId: uuidBinary });
        if (currentUser) {
          if (!existingLayout) {
            insertData.CreatedUser = currentUser?.email;
            insertData.CreatedDate = Date.now();
            insertData.ModifiedUser = currentUser?.email;
            insertData.ModifiedDate = Date.now();
          } else {
            insertData.ModifiedUser = currentUser?.email;
            insertData.ModifiedDate = Date.now();
          }
        }
        insertData.LayoutId = uuidBinary;
        const response = await DashboardDB.Layout.findOneAndUpdate(
          { LayoutId: uuidBinary },
          { $set: { LayoutId: insertData.LayoutId, Layout: insertData.Layout } },
          { new: true, upsert: true }
        );

        if (insertData?.Layout && insertData.Layout.length) {
          const bulkOps = insertData.Layout.filter((layout: IWidget) => layout.Settings && layout.SettingsDetails).map((layout: IWidget) => ({
            updateOne: {
              filter: { SettingId: layout.Settings },
              update: { $set: layout.SettingsDetails },
              upsert: true,
            },
          }));

          if (bulkOps.length > 0) {
            await DashboardDB.Settings.bulkWrite(bulkOps);
          }
        }
        return { error: false, message: 'Layout Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
      } else {
        return { error: true, message: 'Error While Adding Layout', statusCode: HttpStatusCode.Ok, data: null };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Layout',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{id}')
  public async UpdateLayout(
    @Path() id: string,
    @Body() updateData: ILayoutUsers,
    @Inject() currentUser?: JWTUserData
  ): Promise<InsertGridWidgetResponse> {
    try {
      if (!id) return { error: true, message: 'Layout is required!', statusCode: HttpStatusCode.BadRequest };
      const response = await this.insterLayout(updateData, currentUser);
      return { error: false, message: 'Layout Updated Successfully', statusCode: HttpStatusCode.Ok, data: response.data };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Layout',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{id}')
  public async deleteLayoutById(@Path() id: string): Promise<DeleteGridWidgetResponse> {
    try {
      if (!id) return { error: true, message: 'Layout Id is required!', statusCode: HttpStatusCode.BadRequest };
      const uuidBinary = BinaryUtils.convertUuidToBinary(id as string);
      await DashboardDB.Layout.deleteOne({ LayoutId: uuidBinary });
      return { error: false, message: 'Layout Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Layout', statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Post('/deleteMany')
  public async deleteLayoutMay(@Body() ids: string[]): Promise<DeleteGridWidgetResponse> {
    try {
      if (ids && !ids.length) return { error: true, message: 'Layout Id is required!', statusCode: HttpStatusCode.BadRequest };
      const binaryIds = await Promise.all(
        ids.map(async (id: string | Binary) => {
          if (typeof id === 'string') {
            return BinaryUtils.convertUuidToBinary(id);
          }
          return id;
        })
      );
      await DashboardDB.Layout.deleteMany({ LayoutId: { $in: binaryIds } });
      return { error: false, message: 'Layout Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Layout', statusCode: HttpStatusCode.BadRequest };
    }
  }
}
