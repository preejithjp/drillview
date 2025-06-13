export interface ApiResponse<T> {
  error: boolean;
  message: string;
  statusCode: number;
  data?: T;
}
