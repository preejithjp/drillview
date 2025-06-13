import axios, { AxiosInstance } from 'axios';
import APIProcessors from '../processors/responseprocessor';

const authService: AxiosInstance = axios.create({
  baseURL: APIProcessors.EndPoints.AUTH_SERIVICE,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  transformResponse: APIProcessors.TransformResponse,
});

authService.interceptors.response.use(APIProcessors.SuccessHandler, APIProcessors.ErrorHandler);

export default authService;
