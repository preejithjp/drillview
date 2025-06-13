import { Route, Tags, Security, Get, Delete, Post, Body, Patch, Inject } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import {
  JobConfigHeader,
  IDataAccessConfig,
  ISourceConfig,
  JobBySource,
  JobConfig,
  JobStatusType,
  ObjectNames,
} from '../interfaces/synchronizer.interfaces';
import { SynchronizerDB } from '../database/connectors/synchronizer.connector';
import { HttpStatusCode } from 'axios';
import BinaryUtils from '../utils/binary.utils';
import { JWTUserData } from '../interfaces/auth.interfaces';
import API from '../handlers/data.handler';
import {
  ILogs,
  IMudLogs,
  ITrajectories,
  IRigs,
  IBharuns,
  IWBgeometrys,
  IFluidReports,
  LogEntry,
  SourceConfigService,
  BaseConfig,
  IWellbores,
} from '../interfaces/datasimplex.interfaces';
import { Binary } from 'bson';

type GetJobResponse = ApiResponse<JobConfigHeader[] | null>;
type GetJobBySource = ApiResponse<JobBySource[] | null>;
type GetJobByIdResponse = ApiResponse<JobConfig[] | null>;
type InsertJobResponse = ApiResponse<JobConfig[] | null>;
type startStopJobResponse = ApiResponse<JobConfig | JobConfig[] | null>;
type updateJobResponse = ApiResponse<JobConfig | JobConfig[] | null>;
type DeleteJobWellResponse = ApiResponse<null>;

type GetSourceResponse = ApiResponse<ISourceConfig[] | null>;
type InsertSourceResponse = ApiResponse<ISourceConfig[] | null>;
type updateSourceResponse = ApiResponse<ISourceConfig | ISourceConfig[] | null>;
type DeleteSourceResponse = ApiResponse<null>;

type ConnectionStatusResponse = ApiResponse<string | null>;
type ResponseType = ILogs | IMudLogs | ITrajectories | IRigs | IBharuns | IWBgeometrys | IFluidReports | LogEntry | null;
type PayloadType = BaseConfig | null;

@Route('synchronizers')
@Tags('Synchronizer')
@Security('bearerAuth')
export default class SynchronizerController {
  @Get('/job')
  public async getAllJobs(@Inject() currentUser: JWTUserData): Promise<GetJobResponse> {
    try {
      const allSynchronizerJob: JobConfig[] = await SynchronizerDB.Jobs.find(
        { OrganizationId: parseInt(currentUser.ORGANIZATIONID) },
        { _id: 0, JobUID: 1, JobName: 1, SourceId: 1, JobStatus: 1, CreationDate: 1, LastUpdatedDate: 1, Wellbores: 1 }
      )
        .sort({ CreationDate: -1 })
        .lean<JobConfig[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: allSynchronizerJob };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Job Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/job/{jobId}')
  public async getJobById(jobId: string, @Inject() currentUser: JWTUserData): Promise<GetJobByIdResponse> {
    try {
      const binaryJobId = BinaryUtils.convertUuidToBinary(jobId);
      const allSynchronizerJob: JobConfig[] = await SynchronizerDB.Jobs.find(
        { OrganizationId: parseInt(currentUser.ORGANIZATIONID), JobUID: binaryJobId },
        { _id: 0 }
      ).lean<JobConfig[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: allSynchronizerJob };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Job Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/source/{sourceId}/jobs')
  public async getJobBySourceId(sourceId: string, @Inject() currentUser: JWTUserData): Promise<GetJobBySource> {
    try {
      const binaryJobId = BinaryUtils.convertUuidToBinary(sourceId);
      const allSynchronizerJob: JobConfig[] = await SynchronizerDB.Jobs.find(
        { OrganizationId: parseInt(currentUser.ORGANIZATIONID), SourceId: binaryJobId },
        {
          _id: 0,
          JobUID: 1,
          JobName: 1,
          SourceId: 1,
        }
      ).lean<JobConfig[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: allSynchronizerJob };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Job Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/job')
  public async insertJob(@Body() insertData: JobConfig, @Inject() currentUser: JWTUserData): Promise<InsertJobResponse> {
    try {
      const UUID = BinaryUtils.convertUuidToBinary();
      const sourceId$ = BinaryUtils.convertUuidToBinary(insertData.SourceId as string);
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);
      const accessibleSourceIds: { AccessibleSourceIds: (string | Binary)[] } | null = await SynchronizerDB.AccessConfigs.findOne(
        {
          MemberId: memberId,
          AccessibleSourceIds: { $in: [sourceId$] },
        },
        {
          'AccessibleSourceIds.$': 1, // Only return the matched element
          _id: 0,
        }
      ).lean<{ AccessibleSourceIds: (string | Binary)[] } | null>();
      const ids = accessibleSourceIds?.AccessibleSourceIds.map((m) => BinaryUtils.convertBinaryToUuid(m as Binary)) || [];
      const sourceIds = ids.map((m) => BinaryUtils.convertUuidToBinary(m));
      const sourceRes: ISourceConfig | null = await SynchronizerDB.Sources.findOne({
        SourceId: { $in: sourceIds },
      }).lean<ISourceConfig>();
      if (!sourceRes) {
        return { error: true, message: 'Source not found.', statusCode: HttpStatusCode.BadRequest };
      }
      const data = this.transformedData(sourceRes);
      const insertObj: JobConfig = {
        ...insertData,
        JobUID: UUID,
        SourceId: sourceId$,
        OrganizationId: parseInt(currentUser.ORGANIZATIONID),
        CreationDate: Date.now(),
        LastUpdatedDate: Date.now(),
        LastUpdatedUser: currentUser?.name || currentUser.unique_name,
        Source: {
          ...data.Server,
          MaxConnections: data.Server.Maxconnections,
          Version: data.Server.Version,
        },
      };
      const response = await SynchronizerDB.Jobs.create(insertObj);
      return { error: false, message: 'Job Inserted Successfully', statusCode: HttpStatusCode.Ok, data: [response] };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Job: ' + error.message,
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/job/{id}/start')
  public async startJob(id: string, @Inject() currentUser: JWTUserData): Promise<startStopJobResponse> {
    return this.updateJobStatus(id, JobStatusType.RUNNING, currentUser);
  }

  @Patch('/job/{id}/stop')
  public async stopJob(id: string, @Inject() currentUser: JWTUserData): Promise<startStopJobResponse> {
    return this.updateJobStatus(id, JobStatusType.STOPPED, currentUser);
  }

  private async updateJobStatus(id: string, jobStatus: number, currentUser: JWTUserData): Promise<startStopJobResponse> {
    try {
      if (!id) return { error: true, message: 'Job Id is required!', statusCode: HttpStatusCode.BadRequest };
      const binaryJobId = BinaryUtils.convertUuidToBinary(id);
      const updateObj = {
        JobStatus: jobStatus,
        JobUID: binaryJobId,
        OrganizationId: parseInt(currentUser.ORGANIZATIONID),
        LastUpdatedDate: Date.now(),
        LastUpdatedUser: currentUser?.name || currentUser.unique_name,
      };
      const response = await SynchronizerDB.Jobs.updateOne({ JobUID: binaryJobId }, updateObj);
      if (!response) {
        return {
          error: true,
          message: `No Job found with JobId: ${id}`,
          statusCode: HttpStatusCode.BadRequest,
        };
      }
      return { error: false, message: 'Job Status Updated Successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Job Status',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/job/{id}')
  public async updateJob(id: string, @Body() updateData: JobConfig, @Inject() currentUser: JWTUserData): Promise<updateJobResponse> {
    try {
      if (!id) return { error: true, message: 'Job Id is required!', statusCode: HttpStatusCode.BadRequest };
      const sourceId$ = BinaryUtils.convertUuidToBinary(updateData.SourceId as string);
      const binaryJobId = BinaryUtils.convertUuidToBinary(id);
      const updateObj: JobConfig = {
        ...updateData,
        JobUID: binaryJobId,
        SourceId: sourceId$,
        OrganizationId: parseInt(currentUser.ORGANIZATIONID),
        LastUpdatedDate: Date.now(),
        LastUpdatedUser: currentUser?.name || currentUser.unique_name,
      };
      const response = await SynchronizerDB.Jobs.updateOne({ JobUID: binaryJobId }, updateObj);
      if (!response) {
        return {
          error: true,
          message: `No Job found with JobId: ${id}`,
          statusCode: HttpStatusCode.BadRequest,
        };
      }
      return { error: false, message: 'Job Updated Successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Job',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/job/{jobId}/{wellId}')
  public async deleteWellById(jobId: string, wellId: string): Promise<DeleteJobWellResponse> {
    try {
      if (!jobId) {
        return { error: true, message: 'Job Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      if (!wellId) {
        return { error: true, message: 'Well Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const uuidBinary = BinaryUtils.convertUuidToBinary(jobId);
      const job = await SynchronizerDB.Jobs.findOne({ JobUID: uuidBinary });

      if (!job) {
        return {
          error: true,
          message: `No job found with Job Id: ${jobId}`,
          statusCode: HttpStatusCode.NotFound,
        };
      }

      if (job.Wellbores.length === 1) {
        // Delete the entire job if there's only one wellbore
        await SynchronizerDB.Jobs.deleteOne({ JobUID: uuidBinary });
        return { error: false, message: 'Job Successfully Deleted!', statusCode: HttpStatusCode.Ok };
      } else {
        // Otherwise, delete only the specified wellbore
        const result = await SynchronizerDB.Jobs.updateOne({ JobUID: uuidBinary }, { $pull: { Wellbores: { 'Source.UidWell': wellId } } });

        if (result.modifiedCount > 0) {
          return { error: false, message: 'Well Successfully Deleted!', statusCode: HttpStatusCode.Ok };
        }
        return { error: true, message: 'No matching Well found!', statusCode: HttpStatusCode.NotFound };
      }
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Well', statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Get('/source/me')
  public async getDefaultSource(@Inject() currentUser: JWTUserData): Promise<GetSourceResponse> {
    try {
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);
      const accessibleSourceIds: IDataAccessConfig | null = await SynchronizerDB.AccessConfigs.findOne({
        MemberId: memberId,
      }).lean<IDataAccessConfig>();
      const allSource: ISourceConfig[] = accessibleSourceIds?.AccessibleSourceIds?.length
        ? await SynchronizerDB.Sources.find({ SourceId: { $in: accessibleSourceIds.AccessibleSourceIds } }, { _id: 0 }).lean<ISourceConfig[]>()
        : [];
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: allSource };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Synchronizers Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/source')
  public async getAllSource(@Inject() currentUser: JWTUserData): Promise<GetSourceResponse> {
    try {
      const allSource: ISourceConfig[] = await SynchronizerDB.Sources.find({ OrganizationId: parseInt(currentUser.ORGANIZATIONID) }, { _id: 0 })
        .sort({ CreationDate: -1 })
        .lean<ISourceConfig[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: allSource };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Source Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/source')
  public async insertSource(@Body() insertData: ISourceConfig, @Inject() currentUser: JWTUserData): Promise<InsertSourceResponse> {
    try {
      const UUID = BinaryUtils.convertUuidToBinary();
      const insertObj: ISourceConfig = {
        ...insertData,
        SourceId: UUID,
        OrganizationId: parseInt(currentUser.ORGANIZATIONID),
        CreationDate: Date.now(),
        LastUpdatedDate: Date.now(),
      };
      if (insertObj.IsProxy) {
        insertObj.ProxyConfig = {
          ...insertObj.ProxyConfig,
        };
      }
      const response = await SynchronizerDB.Sources.create(insertObj);
      return { error: false, message: 'Source Inserted Successfully', statusCode: HttpStatusCode.Ok, data: [response] };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Source: ' + error.message,
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/source/accesssource')
  public async updateAccessSource(@Body() ids: string[], @Inject() currentUser: JWTUserData): Promise<updateSourceResponse> {
    try {
      if (!ids.length) {
        return { error: true, message: 'Source Ids are required!', statusCode: HttpStatusCode.BadRequest };
      }
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);
      const sourceIds = ids.map((m) => BinaryUtils.convertUuidToBinary(m));
      const existingMember = await SynchronizerDB.AccessConfigs.findOne({ MemberId: memberId });
      if (existingMember) {
        // Update AccessibleSourceIds if MemberId exists
        await SynchronizerDB.AccessConfigs.updateOne(
          { MemberId: memberId },
          { $set: { AccessibleSourceIds: sourceIds, LastUpdatedDate: Date.now() } }
        );
      } else {
        // Insert new entry if MemberId does not exist
        const data = {
          MemberId: memberId,
          OrganizationId: parseInt(currentUser.ORGANIZATIONID),
          AccessibleSourceIds: sourceIds,
          CreationDate: Date.now(),
          LastUpdatedDate: Date.now(),
        };
        await SynchronizerDB.AccessConfigs.create(data);
      }
      return { error: false, message: 'Sources Updated Successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return { error: true, message: 'Error While Updating Sources', statusCode: HttpStatusCode.BadRequest, data: error?.message || error };
    }
  }

  @Patch('/source/{id}')
  public async updateSource(id: string, @Body() updateData: ISourceConfig, @Inject() currentUser: JWTUserData): Promise<updateSourceResponse> {
    try {
      if (!id) return { error: true, message: 'Source Id is required!', statusCode: HttpStatusCode.BadRequest };
      const binarySourceId = BinaryUtils.convertUuidToBinary(id);
      const updateObj: ISourceConfig = {
        ...updateData,
        SourceId: binarySourceId,
        OrganizationId: parseInt(currentUser.ORGANIZATIONID),
        LastUpdatedDate: Date.now(),
      };
      const response = await SynchronizerDB.Sources.updateOne({ SourceId: binarySourceId }, updateObj);
      if (!response) {
        return {
          error: true,
          message: `No Source found with SourceId: ${id}`,
          statusCode: HttpStatusCode.BadRequest,
        };
      }
      return { error: false, message: 'Source Updated Successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Source',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/source/{sourceId}')
  public async deleteSourceById(sourceId: string, @Inject() currentUser: JWTUserData): Promise<DeleteSourceResponse> {
    try {
      if (!sourceId) return { error: true, message: 'Source Id is required!', statusCode: HttpStatusCode.BadRequest };
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);
      const uuidSourceIdBinary = BinaryUtils.convertUuidToBinary(sourceId);
      await SynchronizerDB.Sources.deleteOne({ SourceId: uuidSourceIdBinary });
      await SynchronizerDB.AccessConfigs.updateOne({ MemberId: memberId }, { $pull: { AccessibleSourceIds: uuidSourceIdBinary } });
      return { error: false, message: 'Source Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Source', statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Get('/object/wellbores')
  public async getWellbores(@Inject() currentUser: JWTUserData): Promise<ApiResponse<Record<string, IWellbores[]>>> {
    try {
      const response: Record<string, IWellbores[]> = {};
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);

      const accessibleSourceIds: IDataAccessConfig | null = await SynchronizerDB.AccessConfigs.findOne({
        MemberId: memberId,
      }).lean<IDataAccessConfig>();

      const allSource: ISourceConfig[] = accessibleSourceIds?.AccessibleSourceIds?.length
        ? await SynchronizerDB.Sources.find({ SourceId: { $in: accessibleSourceIds.AccessibleSourceIds } }).lean<ISourceConfig[]>()
        : [];

      for (const source of allSource) {
        const data = this.transformedData(source);
        const res = (await API.DataSimplex.postData('/wellbores', data)) as ApiResponse<IWellbores[]>;
        response[source.SourceId as string] = [...new Map((res.data || []).map((well) => [well.WellUid, well])).values()];
      }
      return {
        error: false,
        message: '',
        statusCode: HttpStatusCode.Ok,
        data: response,
      };
    } catch (error) {
      return { error: true, message: error?.message || 'Internal server error.', statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Get('/object/wellbores/{sourceId}')
  public async getWellboresById(sourceId: string, @Inject() currentUser: JWTUserData): Promise<ApiResponse<IWellbores[]>> {
    try {
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);
      const sourceId$ = BinaryUtils.convertUuidToBinary(sourceId);
      const accessibleSourceIds: { AccessibleSourceIds: (string | Binary)[] } | null = await SynchronizerDB.AccessConfigs.findOne(
        {
          MemberId: memberId,
          AccessibleSourceIds: { $in: [sourceId$] },
        },
        {
          'AccessibleSourceIds.$': 1, // Only return the matched element
          _id: 0,
        }
      ).lean<{ AccessibleSourceIds: (string | Binary)[] } | null>();
      const ids = accessibleSourceIds?.AccessibleSourceIds.map((m) => BinaryUtils.convertBinaryToUuid(m as Binary)) || [];
      const sourceIds = ids.map((m) => BinaryUtils.convertUuidToBinary(m));
      const sourceRes: ISourceConfig | null = await SynchronizerDB.Sources.findOne({
        SourceId: { $in: sourceIds },
      }).lean<ISourceConfig>();
      if (!sourceRes) {
        return { error: true, message: 'Source not found.', statusCode: HttpStatusCode.BadRequest };
      }
      const data = this.transformedData(sourceRes);
      const response = (await API.DataSimplex.postData('/wellbores', data)) as ApiResponse<IWellbores[]>;
      const removeDuplicate = [...new Map((response.data || []).map((well) => [well.WellUid, well])).values()];
      return {
        error: false,
        message: '',
        statusCode: HttpStatusCode.Ok,
        data: removeDuplicate,
      };
    } catch (error) {
      return { error: true, message: error?.message || 'Internal server error.', statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Post('/object/all')
  public async getAllObject(@Body() source: PayloadType, @Inject() currentUser: JWTUserData): Promise<ApiResponse<Record<string, ResponseType>>> {
    try {
      const fetchPromises = Object.values(ObjectNames)
        .filter((endpoint) => endpoint !== ObjectNames.LOGS)
        .map(async (endpoint) => {
          const response = ((await this.getObjects(endpoint, source, currentUser)).data || null) as ResponseType;
          return { key: endpoint, response };
        });
      const results = await Promise.all(fetchPromises);
      const datasource: Record<string, ResponseType> = {};
      results.forEach(({ key, response }) => {
        datasource[key] = response;
      });
      return {
        error: false,
        message: '',
        statusCode: HttpStatusCode.Ok,
        data: datasource,
      };
    } catch (error) {
      return {
        error: true,
        message: error?.message || 'Internal server error.',
        statusCode: HttpStatusCode.InternalServerError,
      };
    }
  }

  @Post('/connectionstatus')
  public async connectionStatus(@Body() connectionData: SourceConfigService): Promise<ConnectionStatusResponse> {
    try {
      const response = (await API.DataSimplex.postData('/connect', connectionData)) as ConnectionStatusResponse;
      return response;
    } catch (error) {
      return { error: true, message: error?.message || 'Internal server error.', statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Post('/objects/{objectname}')
  public async getObjects(
    objectname: ObjectNames,
    @Body() payload: PayloadType,
    @Inject() currentUser: JWTUserData
  ): Promise<ApiResponse<ResponseType>> {
    try {
      if (!ObjectNames[objectname.toUpperCase() as keyof typeof ObjectNames]) {
        return { error: true, message: 'Invalid request type.', statusCode: HttpStatusCode.BadRequest };
      }
      if (!payload?.WellId) {
        return { error: true, message: 'WellId is required.', statusCode: HttpStatusCode.BadRequest };
      }
      if (!payload?.WellboreId) {
        return { error: true, message: 'WellboreId is required.', statusCode: HttpStatusCode.BadRequest };
      }
      const memberId = BinaryUtils.convertUuidToBinary(currentUser.MEMBERID);
      const sourceId = BinaryUtils.convertUuidToBinary(payload.SourceId);
      const accessibleSourceIds: { AccessibleSourceIds: (string | Binary)[] } | null = await SynchronizerDB.AccessConfigs.findOne(
        {
          MemberId: memberId,
          AccessibleSourceIds: { $in: [sourceId] },
        },
        {
          'AccessibleSourceIds.$': 1, // Only return the matched element
          _id: 0,
        }
      ).lean<{ AccessibleSourceIds: (string | Binary)[] } | null>();
      const ids = accessibleSourceIds?.AccessibleSourceIds.map((m) => BinaryUtils.convertBinaryToUuid(m as Binary)) || [];
      const sourceIds = ids.map((m) => BinaryUtils.convertUuidToBinary(m));
      const sourceRes: ISourceConfig | null = await SynchronizerDB.Sources.findOne({
        SourceId: { $in: sourceIds },
      }).lean<ISourceConfig>();
      if (!sourceRes) {
        return { error: true, message: 'Source not found.', statusCode: HttpStatusCode.BadRequest };
      }
      const data: BaseConfig = this.transformedData(sourceRes, payload.WellId, payload.WellboreId, payload.ObjectId);

      const response = (await API.DataSimplex.postData(
        `/${ObjectNames[objectname.toUpperCase() as keyof typeof ObjectNames]}`,
        data
      )) as ApiResponse<ResponseType>;
      return response;
    } catch (error) {
      return { error: true, message: error?.message || 'Internal server error.', statusCode: HttpStatusCode.InternalServerError };
    }
  }

  private transformedData(sourceData: ISourceConfig, wellId: string = '', wellboreId: string = '', objectId: string = ''): BaseConfig {
    const { Url, UserName, Password, IsProxy, ProxyConfig, Version, MaxConnections } = sourceData;
    return {
      WellId: wellId,
      WellboreId: wellboreId,
      ObjectId: objectId,
      Server: {
        Url: Url,
        UserName: UserName,
        Password: Password,
        Proxy: {
          UseProxy: IsProxy,
          ...ProxyConfig,
        },
        Version: Version,
        Maxconnections: MaxConnections,
      },
    };
  }
}
