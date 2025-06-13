import { Route, Tags, Get, Post, Patch, Delete, Path, Body, Inject, Security } from 'tsoa';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatusCode } from 'axios';
import { ApiResponse } from '../interfaces/response.interfaces';
import { AssemblyTypes, StoreAssembly } from '../interfaces/store.connector.interfaces';
import { ISchedulerAssemblyData, ISchedulerWellContent } from '../interfaces/rigscheduler.interfaces';
import StoreConnector from '../services/connectors/store.connector';
import API from '../handlers/data.handler';
import { JWTUserData } from '../interfaces/auth.interfaces';

@Route('wells')
@Tags('Wells')
@Security('bearerAuth')
export class WellController {
  @Get('/')
  public async getAllWells(@Inject() token?: string): Promise<ApiResponse<ISchedulerAssemblyData[]>> {
    try {
      const response = await new StoreConnector(token).getFullData(AssemblyTypes.PRODUCTION_Wellbore);

      const wells: StoreAssembly[] = (Array.isArray(response.data) ? response.data : []) as StoreAssembly[];
      const parsed: ISchedulerAssemblyData[] = wells.map((well) => {
        const rawContent = well.content ? JSON.parse(well.content) : {};
        return { ...well, rawContent };
      });

      return {
        error: false,
        statusCode: HttpStatusCode.Ok,
        message: '',
        data: parsed,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message || 'Error while fetching wells',
        data: [],
      };
    }
  }

  @Post('/')
  public async createWell(
    @Body() requestBody: Partial<ISchedulerAssemblyData>,
    @Inject() currentUser: JWTUserData,
    @Inject() token?: string
  ): Promise<ApiResponse<string>> {
    try {
      const insertData = requestBody;

      const wellId = insertData.rawContent?.wellId || uuidv4();
      const wellboreId = insertData.rawContent?.wellboreId || uuidv4();
      const sectionId = uuidv4(); // Unique section/record id

      const uri = `assembly/well(${wellId})/wellbore(${wellboreId})/section(${sectionId})`;

      const now = Date.now();

      const raw: ISchedulerWellContent = {
        id: sectionId,
        url: uri,
        wellboreId: wellboreId,
        wellboreName: insertData.rawContent?.wellboreName ?? '',
        wellId: wellId,
        wellName: insertData.rawContent?.wellName ?? '',
        colorGroupId: insertData.rawContent?.colorGroupId ?? '',
        startDate: insertData.rawContent?.startDate ?? now,
        endDate: insertData.rawContent?.endDate ?? now,
        creationDate: insertData.rawContent?.creationDate ?? now,
        properties: {
          ...{
            wellTypeCode: '',
            company: '',
            operator: '',
            actualDuration: null,
            casingType: '',
            completionType: '',
            concession: '',
            equipmentRequirements: [],
            fieldName: '',
            holeType: '',
            loggingRequirements: [],
            mainCategory: '',
            mainProject: '',
            planDuration: null,
            remarks: '',
            slotNumber: null,
            subProject: '',
            targetReservoirZone: '',
            towerId: '',
            waterDepth: null,
            totalDepth: null,
            surfaceStatus: '',
          },
          ...(insertData.rawContent?.properties ?? {}),
        },
      };

      const payload: Partial<StoreAssembly> = {
        organisationId: Number(currentUser.ORGANIZATIONID),
        uri,
        originalId: sectionId,
        uniqueIdentifier: sectionId,
        name: raw.wellName || 'Unnamed Well',
        description: `Wellbore-${raw.wellboreName || 'Unnamed'}`,
        type: AssemblyTypes.PRODUCTION_Wellbore,
        creationDate: raw.creationDate,
        lastUpdatedDate: now,
        properties: {},
        attributes: {},
        equipments: [],
        subAssemblies: [],
        content: JSON.stringify(raw),
        parent: insertData.parent && 'id' in insertData.parent ? insertData.parent : undefined,
      };
      console.log('create well');

      const response = await API.ProductStore.postData<typeof payload, string>('/assembly', payload, token);

      return {
        error: false,
        message: 'Well created successfully',
        statusCode: HttpStatusCode.Ok,
        data: response?.data ?? sectionId,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message || 'Failed to create well',
        data: undefined,
      };
    }
  }

  @Patch('{id}')
  public async updateWell(
    @Path() id: string,
    @Body() requestBody: Partial<ISchedulerAssemblyData>,
    @Inject() token?: string
  ): Promise<ApiResponse<string>> {
    try {
      const uri = requestBody.uri;
      if (!uri) {
        return {
          error: true,
          statusCode: HttpStatusCode.BadRequest,
          message: 'URI is required for update',
          data: undefined,
        };
      }

      // Step 2: Prepare updated content
      const raw = (requestBody.rawContent ?? {}) as Partial<ISchedulerWellContent>;

      const content: ISchedulerWellContent = {
        id,
        url: uri,
        wellboreId: raw.wellboreId ?? '',
        wellboreName: raw.wellboreName ?? '',
        wellId: raw.wellId ?? '',
        wellName: raw.wellName ?? '',
        colorGroupId: raw.colorGroupId ?? '',
        startDate: raw.startDate ?? Date.now(),
        endDate: raw.endDate ?? Date.now(),
        properties: raw.properties ?? {
          wellTypeCode: '',
          company: '',
          operator: '',
          actualDuration: null,
          casingType: '',
          completionType: '',
          concession: '',
          equipmentRequirements: [],
          fieldName: '',
          holeType: '',
          loggingRequirements: [],
          mainCategory: '',
          mainProject: '',
          planDuration: null,
          remarks: '',
          slotNumber: null,
          subProject: '',
          targetReservoirZone: '',
          towerId: '',
          waterDepth: null,
          totalDepth: null,
          surfaceStatus: '',
        },
        creationDate: raw.creationDate ?? Date.now(),
      };

      const payload: Partial<StoreAssembly> = {
        originalId: id,
        uniqueIdentifier: id,
        uri,
        name: raw.wellName || 'Unnamed Well',
        description: `Wellbore-${raw.wellboreName || 'Unnamed'}`,
        type: AssemblyTypes.PRODUCTION_Wellbore,
        creationDate: raw.creationDate ?? Date.now(),
        organisationId: requestBody.organisationId ?? 1,
        parent: requestBody.parent,
        equipments: [],
        subAssemblies: [],
        properties: {},
        attributes: {},
        content: JSON.stringify(content),
        lastUpdatedDate: Date.now(),
      };
      console.log('testtt');
      const response = await API.ProductStore.putData<typeof payload, string>('/assembly', payload, token);

      return {
        error: false,
        statusCode: HttpStatusCode.Ok,
        message: 'Well updated successfully',
        data: response?.data,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message || 'Failed to update well',
        data: undefined,
      };
    }
  }

  @Delete('{uri}')
  public async deleteWell(@Path() uri: string, @Inject() token?: string): Promise<ApiResponse<null>> {
    try {
      if (!uri) {
        return {
          error: true,
          message: 'URI is required for deletion',
          statusCode: HttpStatusCode.BadRequest,
          data: null,
        };
      }

      const queryParams = { url: uri };
      const payload = JSON.stringify({ type: AssemblyTypes.PRODUCTION_Wellbore });

      await API.ProductStore.deleteData('/assembly', queryParams, payload, token);

      return {
        error: false,
        message: 'Well deleted successfully',
        statusCode: HttpStatusCode.Ok,
        data: null,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message || 'Failed to delete well',
        data: null,
      };
    }
  }
}
