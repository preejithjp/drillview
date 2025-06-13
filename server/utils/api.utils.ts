import { Response } from 'express';
import Trace from '../controllers/trace.controller';
import { ApiResponse } from '../interfaces/response.interfaces';

export class APIUtils {
  public static GetQueryParam(url: string, param: string): string {
    const queryString = url.split('?')[1];
    if (!queryString) return '';

    const params = new URLSearchParams(queryString);
    return params.get(param) || '';
  }

  public static ResponseGenerator<T>(response: Response, respData: ApiResponse<T>) {
    if (respData.error) {
      Trace.Error(respData.message, JSON.stringify(respData.data));
      delete respData.data; // TO remove passing on request stack to Browser during API errors;
    }
    return response.status(Number(respData.statusCode)).send(respData);
  }
}
