import { AxiosResponse } from 'axios';
import Trace from '../../controllers/trace.controller';
import { ApiResponse } from '../../interfaces/response.interfaces';
import serviceManager from '../providers/servicemanager';

class ServiceManagerMethods {
  private constructor() {
    Trace.Verbose('Service Manager Channel Instantiated');
  }

  private static instance: ServiceManagerMethods;

  public static getInstance(): ServiceManagerMethods {
    if (!ServiceManagerMethods.instance) {
      ServiceManagerMethods.instance = new ServiceManagerMethods();
    }
    return ServiceManagerMethods.instance;
  }

  getData = async <R>(url: string, queryParams?: { [key: string]: string }): Promise<ApiResponse<R>> => {
    if (queryParams && Object.keys(queryParams).length) {
      url += Object.keys(queryParams).reduce((acc, item) => `${acc}${acc.length > 1 ? '&' : ''}${item}=${queryParams[item]}`, '?');
    }
    const result: AxiosResponse<ApiResponse<R>> = await serviceManager.get(url);
    return result.data;
  };

  postData = async <E, R>(url: string, payload: E): Promise<ApiResponse<R>> => {
    const result: AxiosResponse<ApiResponse<R>> = await serviceManager.post(url, payload);
    return result.data;
  };
}

export default ServiceManagerMethods;
