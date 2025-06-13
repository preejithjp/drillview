import axios, { AxiosInstance } from 'axios';
import APIProcessors from '../processors/responseprocessor';

const dataSimplexService: AxiosInstance = axios.create({
  baseURL: APIProcessors.EndPoints.DATA_SIMPLEX_SERVICE,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  transformResponse: APIProcessors.TransformResponse,
});

dataSimplexService.interceptors.response.use(APIProcessors.SuccessHandler, APIProcessors.ErrorHandler);

export default dataSimplexService;
