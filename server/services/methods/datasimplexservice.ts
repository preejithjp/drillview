import { AxiosResponse } from 'axios';
import Trace from '../../controllers/trace.controller';
import { ApiResponse } from '../../interfaces/response.interfaces';
import dataSimplexService from '../providers/datasimplexservice';

class DataSimplexMethods {
  private constructor() {
    Trace.Info('Data Simplex Service Channel Instantiated');
  }

  private static instance: DataSimplexMethods;

  public static getInstance(): DataSimplexMethods {
    if (!DataSimplexMethods.instance) {
      DataSimplexMethods.instance = new DataSimplexMethods();
    }
    return DataSimplexMethods.instance;
  }

  getData = async <R>(url: string, queryParams?: { [key: string]: string }): Promise<ApiResponse<R>> => {
    if (queryParams && Object.keys(queryParams).length) {
      url += Object.keys(queryParams).reduce((acc, item) => `${acc}${acc.length > 1 ? '&' : ''}${item}=${queryParams[item]}`, '?');
    }
    const result: AxiosResponse<ApiResponse<R>> = await dataSimplexService.get(url);
    return result.data;
  };

  postData = async <E, R>(url: string, payload: E): Promise<ApiResponse<R>> => {
    const result: AxiosResponse<ApiResponse<R>> = await dataSimplexService.post(url, payload);
    return result.data;
  };
}

export default DataSimplexMethods;
