import axios, { AxiosInstance } from 'axios';
import APIProcessors from '../processors/responseprocessor';

const serviceManager: AxiosInstance = axios.create({
  baseURL: APIProcessors.EndPoints.SERVICE_MANAGER,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  transformResponse: APIProcessors.TransformResponse,
});

serviceManager.interceptors.response.use(APIProcessors.SuccessHandler, APIProcessors.ErrorHandler);

export default serviceManager;
