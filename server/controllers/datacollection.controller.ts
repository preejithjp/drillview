import { Route, Tags, Get, Post, Patch, Body, Delete, Security } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { IRig, IWell, ITargets, IJobType, IRigHeader } from '../interfaces/datacollection.interfaces';
import BinaryUtils from '../utils/binary.utils';
import { DataCollectDB } from '../database/connectors/datacollection.db.connector';
import { IRigTemplate } from '../interfaces/datacollection.interfaces';

type GetAllDataCollectionResponse = ApiResponse<IRig[] | null>;
type GetDataCollectionResponse = ApiResponse<IRigHeader[] | null>;
type InsertCollectionResponse = ApiResponse<any>;
type DeleteDataCollectionResponse = ApiResponse<any>;

type RigData = {
  [key in keyof Partial<IRig>]: key extends 'Well'
    ? { [K in keyof Partial<IWell>]: boolean }
    : key extends 'Target'
      ? { [K in keyof Partial<ITargets>]: boolean }
      : key extends 'JobTypes'
        ? { [K in keyof Partial<IJobType>]: boolean }
        : boolean;
};

@Route('datacollection')
@Tags('Data Collection')
@Security('bearerAuth')
export default class DataCollectionController {
  @Get('/')
  public async getAllRigs(): Promise<GetDataCollectionResponse> {
    try {
      const neededFields: RigData = {
        RigId: true,
        Name: true,
        Status: true,
        Well: {
          Operator: true,
          ServiceCompany: true,
        },
        Target: {
          Host: true,
        },
        SyncTime: true,
        JobTypes: {
          Name: true,
        },
      };
      const response: IRigHeader[] = await DataCollectDB.DataCollection.find({}, { ...neededFields, _id: 0 })
        .sort({ CreatedDate: 1 })
        .lean<IRigHeader[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Rig Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/recordstemplate')
  public async getRecordsTemplate(): Promise<ApiResponse<IRigTemplate[]>> {
    try {
      const response: IRigTemplate[] = await DataCollectDB.Records.find().lean<IRigTemplate[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Records Template',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/{rigId}')
  public async getRigById(rigId: string): Promise<GetAllDataCollectionResponse> {
    try {
      const uuidBinary = BinaryUtils.convertUuidToBinary(rigId);
      const response: IRig[] | null = await DataCollectDB.DataCollection.findOne({ RigId: uuidBinary }).lean<IRig[] | null>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Rig Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/{rigId}/last-updated')
  public async getLastUpdatedTime(rigId: string): Promise<ApiResponse<number>> {
    try {
      if (!rigId) {
        return { error: true, message: 'Rig Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const uuidBinary = BinaryUtils.convertUuidToBinary(rigId);
      const response = await DataCollectDB.DataCollection.findOne({ RigId: uuidBinary }).select({ ModifiedDate: 1, _id: 0 }).lean();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: response?.ModifiedDate ?? 0 };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Rig Last Updated',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/')
  public async insertDataCollection(@Body() insertData: IRig): Promise<InsertCollectionResponse> {
    try {
      insertData.CreatedDate = Date.now();
      const response = await DataCollectDB.DataCollection.create(insertData);
      return { error: false, message: 'Rig Created Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Creating Rig',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{rigId}')
  public async updateRigById(rigId: string, @Body() updateData: Partial<IRig>): Promise<InsertCollectionResponse> {
    try {
      if (!rigId) return { error: true, message: 'Rig Id is required!', statusCode: HttpStatusCode.BadRequest };
      updateData.ModifiedDate = Date.now();
      const uuidBinary = BinaryUtils.convertUuidToBinary(rigId);
      const response = await DataCollectDB.DataCollection.updateOne({ RigId: uuidBinary }, { $set: updateData });
      if (!response) {
        return {
          error: true,
          message: `No Rig found with RigId: ${rigId}`,
          statusCode: HttpStatusCode.BadRequest,
        };
      }
      return { error: false, message: 'Rig Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Rig',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{rigId}/records-items')
  public async updateRecordsById(rigId: string, @Body() updateData: IJobType[]): Promise<InsertCollectionResponse> {
    try {
      if (!rigId) {
        return { error: true, message: 'Rig Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      if (!updateData || updateData.length === 0) {
        return { error: true, message: 'Update data is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const uuidBinary = BinaryUtils.convertUuidToBinary(rigId);
      const modifiedDate = Date.now();
      await DataCollectDB.DataCollection.updateOne(
        { RigId: uuidBinary },
        {
          $set: {
            JobTypes: updateData,
            ModifiedDate: modifiedDate,
          },
        },
        { upsert: true }
      );
      return { error: false, message: 'JobTypes updated successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error while updating JobTypes',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message || error,
      };
    }
  }

  @Delete('/{rigId}')
  public async deleteRigsById(rigId: string): Promise<DeleteDataCollectionResponse> {
    try {
      if (!rigId) return { error: true, message: 'Rig Id is required!', statusCode: HttpStatusCode.BadRequest };
      const uuidBinary = BinaryUtils.convertUuidToBinary(rigId);
      const response = await DataCollectDB.DataCollection.deleteOne({ RigId: uuidBinary });
      return { error: false, message: 'Rig Successfully Deleted!', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Rig', statusCode: HttpStatusCode.BadRequest };
    }
  }
}
