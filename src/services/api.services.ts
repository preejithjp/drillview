/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosError, HttpStatusCode, type AxiosResponse } from 'axios';
import router, { Routes } from '@/router';
import { store } from '@/main';
import { httpTransport } from '@/transports/http.transport';
import type { ApiResponse } from '../../server/interfaces/response.interfaces';
import { ITrace, TraceLevel } from '../../server/interfaces/trace.interfaces';
import Logger from '@/common/logger';
import { ToastType } from '@/components/ToastMessage.vue';
import { JSONObject } from '@/interfaces/common.interfaces';

interface ServerSuccessResponse extends AxiosResponse {
  data: ApiResponse<any>;
}

const handleSuccessResponse = (response: ServerSuccessResponse) => {
  // all success response of axios is initially hit here even it is not hit in transformResponse
  if (response.config?.method !== 'get' && response.data.message) {
    Logger.Info(`${response.data.message}`);
  }
  return { ...response, data: response.data.data };
};

const handleErrorResponse = function (error: AxiosError) {
  // all error response of axios is initially hit here even it is not hit in transformResponse
  if (error?.response?.status === HttpStatusCode.Unauthorized && !['login', 'logout'].some((a) => error?.config?.url?.includes(a))) {
    router.push({ name: Routes.LogOut });
    return null;
  }
  let errorMsg;
  const systemErrors = ['ECONNRESET', 'ERR_NETWORK'];
  if (error && error?.code && systemErrors.includes(error.code)) {
    // handling system errors
    errorMsg = `${error.message}, url: ${error?.config?.url}`;
  } else {
    const errData = error?.response?.data as ApiResponse<any>;
    errorMsg = errData.message || 'Unknown Error Occurred !';
  }
  if (!error.response?.config?.url?.includes('trace') && error?.response?.status !== HttpStatusCode.Unauthorized) {
    Logger.Error(errorMsg, error.toJSON());
  }
  store.showToast(ToastType.ERROR, errorMsg);
  return null;
};
httpTransport.interceptors.request.use((config) => {
  if (store && store.authInfo && Object.keys(store.authInfo).length) {
    config.headers.Authorization = `Bearer ${store.authInfo.access_token}`;
  }
  return config;
});
httpTransport.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export const Api = {
  auth(username: string, password: string): Promise<any> {
    return new Promise((resolve) => {
      httpTransport
        .post('/auth/login', {
          username,
          password,
        })
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          resolve(error);
        });
    });
  },
  fetch(url: string, urlParams?: string[], queryParams?: JSONObject): Promise<any> {
    return new Promise((resolve) => {
      if (urlParams && urlParams.length) url = url + urlParams.reduce((acc, item) => `${acc}/${encodeURIComponent(item)}`, '');

      if (queryParams && Object.keys(queryParams).length) {
        url += Object.keys(queryParams).reduce(
          (acc, item) => `${acc}${acc.length > 1 ? '&' : ''}${item}=${encodeURIComponent(queryParams[item].toString())}`,
          '?'
        );
      }

      httpTransport
        .get('/' + url)
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          resolve(error);
        });
    });
  },
  submit(url: string, params?: any): Promise<any> {
    return new Promise((resolve) => {
      httpTransport
        .post('/' + url, params)
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          resolve(error);
        });
    });
  },
  upload(url: string, params?: any): Promise<any> {
    return new Promise((resolve) => {
      httpTransport
        .post('/' + url, params, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          resolve(error);
        });
    });
  },
  patch(url: string, params?: any): Promise<any> {
    return new Promise((resolve) => {
      httpTransport
        .patch('/' + url, params)
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          resolve(error);
        });
    });
  },
  delete(url: string, id: any): Promise<any> {
    return new Promise((resolve) => {
      httpTransport
        .delete('/' + url + '/' + id)
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          resolve(error);
        });
    });
  },
  addTrace(traceLevel: TraceLevel, message: string, details?: string): Promise<any> {
    return new Promise((resolve) => {
      const payload: Omit<ITrace, 'ApplicationName' | 'TraceTime' | 'Level'> = {
        Title: message,
        Details: details,
      };
      httpTransport
        .post('/traces/' + traceLevel, payload)
        .then((result) => {
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          resolve(error);
        });
    });
  },
  submitFile(url: string, binaryImage: ArrayBuffer | Blob | Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
      const file = new Blob([binaryImage], { type: 'application/octet-stream' });
      httpTransport
        .patch(url, file, {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        })
        .then((response) => {
          if (response && response?.data) {
            resolve(response.data);
          } else {
            resolve(null);
          }
        })
        .catch((error: AxiosError) => {
          reject(error);
        });
    });
  },
};
