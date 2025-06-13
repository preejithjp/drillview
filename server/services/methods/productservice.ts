import { AxiosRequestConfig, AxiosResponse } from 'axios';
import Trace from '../../controllers/trace.controller';
import { ApiResponse } from '../../interfaces/response.interfaces';
import productService from '../providers/productservice';

class ProductStore {
  private constructor() {
    Trace.Verbose('Data Service Channel Instantiated');
  }

  private static instance: ProductStore;

  public static getInstance(): ProductStore {
    if (!ProductStore.instance) {
      ProductStore.instance = new ProductStore();
    }
    return ProductStore.instance;
  }

  getData = async <R>(url: string, queryParams?: { [key: string]: string }, accessToken?: string): Promise<ApiResponse<R>> => {
    const config: AxiosRequestConfig = {};
    if (accessToken) {
      config.headers = { Authorization: 'Bearer ' + accessToken };
    }
    if (queryParams && Object.keys(queryParams).length) {
      url += Object.keys(queryParams).reduce((acc, item) => `${acc}${acc.length > 1 ? '&' : '?'}${item}=${queryParams[item]}`, '');
    }
    const result: AxiosResponse<ApiResponse<R>> = await productService.get(url, config);
    return result.data;
  };

  /*   postData = async <E, R>(url: string, payload: E, accessToken?: string): Promise<ApiResponse<R>> => {
    const config: AxiosRequestConfig = {};
    if (accessToken) {
      config.headers = { Authorization: 'Bearer ' + accessToken };
    }
    const result: AxiosResponse<ApiResponse<R>> = await productService.post(url, payload, config);
    return result.data;
  }; */
  postData = async <E, R>(url: string, payload: E, accessToken?: string): Promise<ApiResponse<R>> => {
    const config: AxiosRequestConfig = {};
    if (accessToken) {
      config.headers = { Authorization: 'Bearer ' + accessToken };
    }

    try {
      console.log('get&create');
      console.log(url);
      console.log(payload);
      const result: AxiosResponse<ApiResponse<R>> = await productService.post(url, payload, config);
      console.log(result.data);
      return result.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'ProductStore post failed');
    }
  };

  putData = async <E, R>(url: string, payload: E, accessToken?: string): Promise<ApiResponse<R>> => {
    const config: AxiosRequestConfig = {};
    if (accessToken) {
      config.headers = { Authorization: 'Bearer ' + accessToken };
    }
    console.log('update');
    console.log(url);
    console.log(payload);
    const result: AxiosResponse<ApiResponse<R>> = await productService.put(url, payload, config);
    return result.data;
  };

  deleteData = async <R>(url: string, queryParams?: { [key: string]: string }, data?: any, accessToken?: string): Promise<ApiResponse<R>> => {
    if (queryParams && Object.keys(queryParams).length) {
      url += Object.keys(queryParams).reduce((acc, item) => `${acc}${acc.length > 1 ? '&' : '?'}${item}=${queryParams[item]}`, '');
    }

    const config: AxiosRequestConfig = {
      data, // 👈 important for sending payload in DELETE request
    };

    if (accessToken) {
      config.headers = {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      };
    }
    const result: AxiosResponse<ApiResponse<R>> = await productService.delete(url, config);
    return result.data;
  };
}

export default ProductStore;
