import { AxiosResponse } from 'axios';
import Trace from '../../controllers/trace.controller';
import { ApiResponse } from '../../interfaces/response.interfaces';
import authService from '../providers/authservice';

class AuthMethods {
  private constructor() {
    Trace.Verbose('Auth Service Channel Instantiated');
  }

  private static instance: AuthMethods;

  public static getInstance(): AuthMethods {
    if (!AuthMethods.instance) {
      AuthMethods.instance = new AuthMethods();
    }
    return AuthMethods.instance;
  }

  authenticate = async <R>(username: string, password: string): Promise<ApiResponse<R>> => {
    const result = await authService.get('/basictoken', {
      auth: { username, password },
    });
    return result.data;
  };

  getData = async <R>(url: string, queryParams?: { [key: string]: string }): Promise<ApiResponse<R>> => {
    if (queryParams && Object.keys(queryParams).length) {
      url += Object.keys(queryParams).reduce((acc, item) => `${acc}${acc.length > 1 ? '&' : ''}${item}=${queryParams[item]}`, '?');
    }
    const result: AxiosResponse<ApiResponse<R>> = await authService.get(url);
    return result.data;
  };

  postData = async <E, R>(url: string, payload: E): Promise<ApiResponse<R>> => {
    const result: AxiosResponse<ApiResponse<R>> = await authService.post(url, payload);
    return result.data;
  };
}

export default AuthMethods;
