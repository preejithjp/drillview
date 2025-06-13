import { Route, Tags, Get, Post, Patch, Delete, Path, Inject, Security, Body } from 'tsoa';
import { HttpStatusCode } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { ApiResponse } from '../interfaces/response.interfaces';
import { ISchedulerProductData, ISchedulerRigContent } from '../interfaces/rigscheduler.interfaces';
import { ProductTypes, StoreProduct } from '../interfaces/store.connector.interfaces';
import StoreConnector from '../services/connectors/store.connector';
import API from '../handlers/data.handler';
import { JWTUserData } from '../interfaces/auth.interfaces';

@Route('rigs')
@Tags('Rigs')
@Security('bearerAuth')
export class RigController {
  @Get('/')
  public async getAllRigs(@Inject() token?: string): Promise<ApiResponse<ISchedulerProductData[]>> {
    try {
      const response = await new StoreConnector(token).getFullData(ProductTypes.PRODUCTION_Rig);

      const rigs: StoreProduct[] = (Array.isArray(response.data) ? response.data : []).filter(
        (item): item is StoreProduct => item.type === ProductTypes.PRODUCTION_Rig
      );

      const parsed: ISchedulerProductData[] = rigs.map((rig) => {
        const rawContent = rig.content ? JSON.parse(rig.content) : {};
        return { ...rig, rawContent };
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
        message: e.message || 'Error while fetching rigs',
        data: [],
      };
    }
  }

  @Post('/')
  public async createRig(
    @Body() requestBody: Partial<ISchedulerProductData>,
    @Inject() currentUser: JWTUserData,
    @Inject() token?: string
  ): Promise<ApiResponse<string>> {
    try {
      const newUuid = uuidv4();
      const uri = `product/rig(${newUuid})`;
      const content: ISchedulerRigContent = {
        id: newUuid,
        url: uri,
        name: requestBody.rawContent?.name || '',
        description: requestBody.rawContent?.description || '',
        contractStartDate: requestBody.rawContent?.contractStartDate ?? null,
        contractEndDate: requestBody.rawContent?.contractEndDate ?? null,
        wellbores: requestBody.rawContent?.wellbores || [],
        supplierCode: requestBody.rawContent?.supplierCode || '',
        supplierName: requestBody.rawContent?.supplierName || '',
        mainType: requestBody.rawContent?.mainType || '',
        subType: requestBody.rawContent?.subType || '',
        waterDepthMin: requestBody.rawContent?.waterDepthMin ?? null,
        waterDepthMax: requestBody.rawContent?.waterDepthMax ?? null,
      };

      const payload = {
        originalId: newUuid,
        uniqueIdentifier: newUuid,
        organisationId: Number(currentUser.ORGANIZATIONID),
        uri,
        name: content.name,
        description: content.description,
        type: ProductTypes.PRODUCTION_Rig,
        content: JSON.stringify(content),
        assemblies: [],
        equipments: [],
        properties: {},
        attributes: {},
        creationDate: Date.now(),
        lastUpdatedDate: Date.now(),
      };
      const response = await API.ProductStore.postData<typeof payload, string>('/product', payload, token);

      return {
        error: false,
        message: 'Rig created successfully',
        statusCode: HttpStatusCode.Ok,
        data: response?.data ?? newUuid,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message || 'Failed to create rig',
        data: undefined,
      };
    }
  }

  @Patch('{id}')
  public async updateRig(
    @Path() id: string,
    @Body() updateData: Partial<ISchedulerProductData>,
    @Inject() token?: string
  ): Promise<ApiResponse<string>> {
    try {
      const content: ISchedulerRigContent = {
        id,
        url: `product/rig(${id})`,
        name: updateData.rawContent?.name || '',
        description: updateData.rawContent?.description || '',
        contractStartDate: updateData.rawContent?.contractStartDate ?? null,
        contractEndDate: updateData.rawContent?.contractEndDate ?? null,
        wellbores: updateData.rawContent?.wellbores || [],
        supplierCode: updateData.rawContent?.supplierCode || '',
        supplierName: updateData.rawContent?.supplierName || '',
        mainType: updateData.rawContent?.mainType || '',
        subType: updateData.rawContent?.subType || '',
        waterDepthMin: updateData.rawContent?.waterDepthMin ?? null,
        waterDepthMax: updateData.rawContent?.waterDepthMax ?? null,
      };

      const payload = {
        originalId: id,
        uniqueIdentifier: id,
        organisationId: updateData.organisationId ?? 1, // ensure this is not missing
        uri: `product/rig(${id})`,
        name: content.name,
        description: content.description,
        type: ProductTypes.PRODUCTION_Rig,
        content: JSON.stringify(content),
        assemblies: updateData.assemblies ?? [],
        equipments: updateData.equipments ?? [],
        properties: updateData.properties ?? {},
        attributes: updateData.attributes ?? {},
        creationDate: updateData.creationDate ?? Date.now(),
        lastUpdatedDate: Date.now(),
      };

      const response = await API.ProductStore.putData<typeof payload, string>('/product', payload, token);

      return {
        error: false,
        statusCode: HttpStatusCode.Ok,
        message: 'Rig updated successfully',
        data: response?.data,
      };
    } catch (e: any) {
      return {
        error: true,
        message: e.message || 'Error while updating rig',
        statusCode: HttpStatusCode.InternalServerError,
        data: undefined,
      };
    }
  }

  @Delete('{id}')
  public async deleteRig(@Path() id: string, @Inject() token?: string): Promise<ApiResponse<null>> {
    try {
      const uri = `product/rig(${id})`;
      await API.ProductStore.deleteData('/product', { url: uri }, { type: 'PRODUCTION_Rig' }, token);

      return {
        error: false,
        message: 'Rig deleted successfully',
        statusCode: HttpStatusCode.Ok,
        data: null,
      };
    } catch (e: any) {
      return {
        error: true,
        message: e.message || 'Failed to delete rig',
        statusCode: HttpStatusCode.InternalServerError,
        data: null,
      };
    }
  }
}
