import { Route, Get, Security, Body, Inject, Delete, Patch, Path, Tags } from 'tsoa';
import { HttpStatusCode } from 'axios';
import { JWTUserData } from '../interfaces/auth.interfaces';
import StoreConnector from '../services/connectors/store.connector';
import { ApiResponse } from '../interfaces/response.interfaces';
import { StoreDataHeader } from '../interfaces/store.connector.interfaces';

@Route('product')
@Tags('Products')
@Security('bearerAuth')
export default class DocumentManagerController {
  @Get('')
  public async getAllProducts(@Inject() token?: string): Promise<ApiResponse<StoreDataHeader[] | null>> {
    return this.getProduct('', '', token);
  }
  @Get('/{parentType}/{itemUri}')
  public async getProduct(parentType: string, itemUri: string, @Inject() token?: string): Promise<ApiResponse<StoreDataHeader[] | null>> {
    try {
      const data = await new StoreConnector(token).getNestedChild(parentType, itemUri);
      return data;
    } catch (error) {
      const errorMsg = `${error?.codeName || 'Error'}: ${error?.errmsg || error.message}`;
      return { error: true, message: errorMsg, statusCode: HttpStatusCode.InternalServerError };
    }
  }
  @Get('/{itemUri}')
  public async getProductDetails(itemUri: string, @Inject() token?: string): Promise<ApiResponse<any>> {
    try {
      const response = await new StoreConnector(token).getMetaData(itemUri);
      return response;
    } catch (error) {
      const errorMsg = `${error?.codeName || 'Error'}: ${error?.errmsg || error.message}`;
      return { error: true, message: errorMsg, statusCode: HttpStatusCode.InternalServerError };
    }
  }
  @Delete('/{parentUri}')
  public async deleteProduct(parentUri: string): Promise<ApiResponse<any>> {
    try {
      return { error: false, message: 'Product Deleted Successfully', statusCode: HttpStatusCode.Ok, data: { item: parentUri } };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Deleting Product',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
  @Patch('/{parentUri}')
  public async updateProduct(@Path() parentUri: string, @Body() updateData: any, @Inject() currentUser?: JWTUserData): Promise<ApiResponse<any>> {
    try {
      console.log(updateData, currentUser);
      const response = { data: 'Updated Successfully', item: parentUri };
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
}
