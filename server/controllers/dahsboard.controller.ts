import { Route, Tags, Get, Body, Delete, Patch, Security, Post, Inject, Path } from 'tsoa';
import fs from 'fs';
import { ApiResponse } from '../interfaces/response.interfaces';
import { IDashboardUser, ILayout, IWidget, DashboardStatus } from '../interfaces/dashboard.interfaces';
import { HttpStatusCode } from 'axios';
import { JWTUserData } from '../interfaces/auth.interfaces';
import { IFile } from '../interfaces/chatmessage.interfaces';
import path from 'path';
import { FileUpload } from '../handlers/fileupload.handler';
import BinaryUtils from '../utils/binary.utils';
import { DashboardDB } from '../database/connectors/dashboarddb.connector';
import { Binary } from 'bson';
import { AdminDB } from '../database/connectors/admindb.connector';
import LayoutController from './layout.controller';

export type InsertDashboardResponse = ApiResponse<IDashboardUser | null>;
export type GetDashboardResponse = ApiResponse<IDashboardUser[] | null>;
type DeleteDashboardResponse = ApiResponse<null>;
type FileUploadResponse = ApiResponse<IFile>;
type GetFilesResponse = ApiResponse<string[]>;

type DashboardHeader = {
  [key in keyof Partial<IDashboardUser>]: boolean;
};

@Route('dashboard')
@Tags('Dashboard')
@Security('bearerAuth')
export default class DashboardController {
  @Get('/')
  public async getAllDashboard(): Promise<GetDashboardResponse> {
    try {
      const neededFeilds: DashboardHeader = {
        Layout: false,
        Offsets: false,
      };
      const dashboard: IDashboardUser[] = await DashboardDB.Dashboard.find({}, { ...neededFeilds, _id: 0 })
        .sort({ ModifiedDate: -1 })
        .lean<IDashboardUser[]>();
      const userIds = new Set<string>();
      dashboard?.forEach(async (dash: IDashboardUser) => {
        if (dash && dash.DashboardId instanceof Binary) {
          dash.DashboardId = BinaryUtils.convertBinaryToUuid(dash.DashboardId);
          if (dash.CreatedUser) userIds.add(dash.CreatedUser);
          if (dash.ModifiedUser) userIds.add(dash.ModifiedUser);
        }
      });
      const userIdsArray = Array.from(userIds).map((id) => BinaryUtils.convertUuidToBinary(id));
      const users = await AdminDB.Member.find({ MemberId: { $in: userIdsArray } }, { MemberId: 1, Name: 1 }).lean();
      const userMap = new Map(users.map((user) => [user.MemberId?.toString(), user.Name]));
      dashboard.forEach((dash) => {
        const createdUserId = dash.CreatedUser?.toString();
        const modifiedUserId = dash.ModifiedUser?.toString();

        dash.CreatedUser = userMap.get(createdUserId) || 'Unknown';
        dash.ModifiedUser = userMap.get(modifiedUserId) || 'Unknown';
      });

      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: dashboard };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Obtaining Dashboard Details', statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Get('/{id}')
  public async getDashboards(@Path() id: string): Promise<GetDashboardResponse> {
    try {
      if (!id) {
        return { error: true, message: 'Dashboard Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const uuidBinary = BinaryUtils.convertUuidToBinary(id);
      const dashboards: IDashboardUser[] = await DashboardDB.Dashboard.find({ DashboardId: uuidBinary }, { _id: 0 }).lean<IDashboardUser[]>();
      if (dashboards && dashboards[0] && dashboards[0].DashboardId instanceof Binary)
        dashboards[0].DashboardId = BinaryUtils.convertBinaryToUuid(dashboards[0].DashboardId);
      for (const dashboard of dashboards) {
        dashboard.Layout = await this.fetchLayoutsRecursively(dashboard.Layout || []);
      }
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: dashboards };
    } catch (error) {
      const errorMsg = `${error?.codeName || 'Error'}: ${error?.errmsg || error.message}`;
      return { error: true, message: errorMsg, statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Post('/')
  public async insterDashboardLayout(@Body() insertData: IDashboardUser, @Inject() currentUser?: JWTUserData): Promise<InsertDashboardResponse> {
    try {
      if (!insertData) return { error: true, message: 'Dashboard is required!', statusCode: HttpStatusCode.BadRequest };
      if (insertData.DashboardId && typeof insertData.DashboardId === 'string') {
        const response = await this.upsertDashboard(insertData.DashboardId, insertData, currentUser);
        return { error: false, message: 'Dashboard Inserted Successfully', statusCode: HttpStatusCode.Ok, data: response.data };
      } else {
        return { error: true, message: 'Error While Adding Dashboard', statusCode: HttpStatusCode.Ok, data: null };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Dashboard',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
  @Patch('/sortedOrder')
  public async updateSortorder(@Body() body: { updates: { id: string; sortOrder: number }[] }): Promise<InsertDashboardResponse> {
    try {
      const { updates } = body;
      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return {
          error: true,
          message: 'No Data Provided',
          statusCode: HttpStatusCode.BadRequest,
        };
      }
      const bulkOps = updates.map(({ id, sortOrder }) => ({
        updateOne: {
          filter: { DashboardId: BinaryUtils.convertUuidToBinary(id) },
          update: { $set: { SortOrder: sortOrder } },
        },
      }));
      await DashboardDB.Dashboard.bulkWrite(bulkOps);
      return {
        error: false,
        message: 'Dashboard sort orders updated successfully',
        statusCode: HttpStatusCode.Ok,
      };
    } catch (error) {
      return {
        error: true,
        message: 'Error updating dashboard sort orders',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message || error,
      };
    }
  }

  @Patch('/{id}')
  public async upsertDashboard(
    @Path() id: string,
    @Body() upsertData: IDashboardUser,
    @Inject() currentUser?: JWTUserData
  ): Promise<InsertDashboardResponse> {
    try {
      if (!id) {
        return { error: true, message: 'Dashboard Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const { DeleteId, LayoutData, ...upsertDataWithoutLayout } = upsertData;
      const uuidBinary = BinaryUtils.convertUuidToBinary(id);
      if (currentUser) {
        const existingLayout = await DashboardDB.Dashboard.findOne({ DashboardId: uuidBinary });
        const dashboardCount = await DashboardDB.Dashboard.countDocuments({});
        if (!existingLayout) {
          upsertDataWithoutLayout.CreatedUser = currentUser?.MEMBERID;
          upsertDataWithoutLayout.CreatedDate = Date.now();
          upsertDataWithoutLayout.ModifiedUser = currentUser?.MEMBERID;
          upsertDataWithoutLayout.ModifiedDate = Date.now();
          upsertDataWithoutLayout.StatusCode = upsertDataWithoutLayout.StatusCode ?? DashboardStatus.Enabled;
          upsertDataWithoutLayout.SortOrder = dashboardCount + 1;
        } else {
          upsertDataWithoutLayout.ModifiedUser = currentUser?.MEMBERID;
          upsertDataWithoutLayout.ModifiedDate = Date.now();
        }
      }
      upsertDataWithoutLayout.DashboardId = uuidBinary;
      const response = await DashboardDB.Dashboard.findOneAndUpdate(
        { DashboardId: uuidBinary },
        { $set: upsertDataWithoutLayout },
        { new: true, upsert: true }
      );
      if (upsertDataWithoutLayout?.Layout && upsertDataWithoutLayout.Layout.length) {
        const bulkOps = upsertDataWithoutLayout.Layout.filter((layout: IWidget) => layout.Settings && layout.SettingsDetails).map(
          (layout: IWidget) => ({
            updateOne: {
              filter: { SettingId: layout.Settings },
              update: { $set: layout.SettingsDetails },
              upsert: true,
            },
          })
        );
        if (bulkOps.length > 0) {
          await DashboardDB.Settings.bulkWrite(bulkOps);
        }
      }
      const layoutController = new LayoutController();
      if (LayoutData?.length) {
        for (const layout of LayoutData) {
          await layoutController.insterLayout(layout, currentUser);
        }
      }
      if (DeleteId?.length) {
        await layoutController.deleteLayoutMay(DeleteId);
      }
      return { error: false, message: 'Dashboard Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return { error: true, message: 'Error While update Dashboard', statusCode: HttpStatusCode.BadRequest, data: error?.message || error };
    }
  }

  @Delete('/{id}')
  public async deleteDashboardById(@Path() id: string): Promise<DeleteDashboardResponse> {
    try {
      if (!id) return { error: true, message: 'Dashboard Id is required!', statusCode: HttpStatusCode.BadRequest };
      const uuidBinary = BinaryUtils.convertUuidToBinary(id);
      await DashboardDB.Dashboard.deleteOne({ DashboardId: uuidBinary });
      return { error: false, message: 'Dashboard Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Dashboard', statusCode: HttpStatusCode.BadRequest };
    }
  }

  public async uploadFile(file?: Express.Multer.File): Promise<FileUploadResponse> {
    try {
      if (!file) {
        return { error: true, message: 'File is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const filePath = path.join(file.destination, file.filename);
      const data: IFile = {
        FileName: file.filename,
        File: filePath,
        FileExtension: path.extname(file.originalname)?.replace('.', ''),
        FileType: file.mimetype,
      };

      return { error: false, message: 'File uploaded successfully', statusCode: HttpStatusCode.Ok, data };
    } catch (error) {
      return {
        error: true,
        message: 'Error While uploading File',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
  @Get('/getfiles/all')
  public async getAllFiles(): Promise<GetFilesResponse> {
    try {
      const directoryPath = path.join(FileUpload.UPLOAD_DIRECTORY, FileUpload.ICON_DIRECTORY);
      if (!fs.existsSync(directoryPath)) {
        return { error: true, message: 'Directory not found', statusCode: HttpStatusCode.NotFound, data: [directoryPath] };
      }
      const files = await fs.promises.readdir(directoryPath);
      const fileNames = files.filter((file) => fs.statSync(path.join(directoryPath, file)).isFile());
      return { error: false, message: 'Files retrieved successfully', statusCode: HttpStatusCode.Ok, data: fileNames };
    } catch (error) {
      return {
        error: true,
        message: 'Error while retrieving files',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  private async fetchLayoutsRecursively(layouts: IWidget[]): Promise<IWidget[]> {
    for (const layout of layouts) {
      if (layout.Settings) {
        const Settings = await DashboardDB.Settings.find({ SettingId: layout.Settings }, { _id: false });
        layout['SettingsDetails'] = Settings[0];
      }
      const uuidBinary = BinaryUtils.convertUuidToBinary(layout.LayoutId as string);
      const nestedLayouts: ILayout[] = await DashboardDB.Layout.find({ LayoutId: uuidBinary }, { _id: 0 }).lean<ILayout[]>();
      if (layout && nestedLayouts && nestedLayouts.length) {
        nestedLayouts[0].LayoutId = BinaryUtils.convertBinaryToUuid(nestedLayouts[0].LayoutId as Binary);
        layout.PopulateLayout = nestedLayouts;
      }
      if (nestedLayouts && nestedLayouts.length) {
        nestedLayouts[0].Layout = await this.fetchLayoutsRecursively(nestedLayouts[0].Layout);
      }
    }
    return layouts;
  }
}
