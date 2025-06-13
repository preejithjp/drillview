import { AxiosError, AxiosResponse, HttpStatusCode, RawAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../../interfaces/response.interfaces';

type Source = 'AUTH_SERIVICE' | 'SERVICE_MANAGER' | 'PRODUCT_STORE' | 'DATA_SIMPLEX_SERVICE';

type EndPoint = {
  [key in Source]: string;
};

export default class APIProcessors {
  static urlNullIdentifier = 'URL Error:';

  static EndPoints: EndPoint = {
    AUTH_SERIVICE: process.env.SECURED_IDENTITY_URL || `${APIProcessors.urlNullIdentifier} Secured Identity URL not Configured`,
    SERVICE_MANAGER: process.env.SERVICE_MANAGER_URL || `${APIProcessors.urlNullIdentifier} Service Manager URL not Configured`,
    PRODUCT_STORE: process.env.PRODUCT_STORE_URL || `${APIProcessors.urlNullIdentifier} Product Store URL not Configured`,
    DATA_SIMPLEX_SERVICE: process.env.DATA_SIMPLEX_SERVICE_URL || `${APIProcessors.urlNullIdentifier} Data Simplex URL not Configured`,
  };

  static TransformResponse(responseData: any): ApiResponse<any> {
    let responseBody!: ApiResponse<any>;
    try {
      if (typeof responseData === 'string') {
        let resp: any = responseData;
        let isParseError = false;
        try {
          resp = JSON.parse(responseData);
        } catch {
          isParseError = true;
          resp = responseData;
        }
        let msg = '';
        let status = HttpStatusCode.Ok;
        let error = false;

        if (isParseError) {
          msg = resp;
        } else if (typeof resp !== 'string' && resp.message && resp.statusCode !== HttpStatusCode.Ok) {
          msg = resp.message;
          status = resp.statusCode;
          error = true;
        }
        responseBody = {
          error: error,
          message: msg,
          statusCode: status,
          data: resp,
        };
      } else {
        responseBody = {
          error: false,
          message: '',
          statusCode: HttpStatusCode.Ok,
          data: responseData.Exception,
        };
      }
      return responseBody;
    } catch (error) {
      responseBody = {
        error: true,
        message: 'Error',
        statusCode: HttpStatusCode.BadRequest,
        data: error,
      };
      return responseBody;
    }
  }

  static ErrorHandler(error: AxiosError<unknown>) {
    const processedData = {} as ApiResponse<unknown>;
    processedData.statusCode = error.status || HttpStatusCode.InternalServerError;
    processedData.error = true;
    processedData.message = error.message;
    processedData.data = error.toJSON();
    return {
      ...error,
      data: processedData,
    };
  }

  static SuccessHandler<D>(response: AxiosResponse<ApiResponse<D>, RawAxiosRequestConfig>): AxiosResponse<ApiResponse<D>> {
    return response;
  }
}
