import axios, { AxiosInstance } from 'axios';
import APIProcessors from '../processors/responseprocessor';

const productService: AxiosInstance = axios.create({
  baseURL: APIProcessors.EndPoints.PRODUCT_STORE,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  transformResponse: APIProcessors.TransformResponse,
});

productService.interceptors.response.use(APIProcessors.SuccessHandler, APIProcessors.ErrorHandler);

export default productService;
