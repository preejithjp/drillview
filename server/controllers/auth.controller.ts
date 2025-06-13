import { Controller, Body, Post, Route, Tags } from 'tsoa';
import { LoginPayload, LoginResponse } from '../interfaces/auth.interfaces';
import { ApiResponse } from '../interfaces/response.interfaces';
import Trace from './trace.controller';
import { HttpStatusCode } from 'axios';
import API from '../handlers/data.handler';

type AuthResponse = ApiResponse<LoginResponse>;
@Route('auth')
@Tags('Auth')
export default class AuthController extends Controller {
  @Post('/login')
  public async authenticate(@Body() credentials: LoginPayload): Promise<AuthResponse> {
    if (!credentials.username || !credentials.password) {
      return { error: true, message: 'Username and password required.', statusCode: HttpStatusCode.Unauthorized };
    }
    try {
      const response = (await API.AuthService.authenticate(credentials.username, credentials.password)) as AuthResponse;
      return response;
    } catch (error) {
      Trace.Error('Authentication Error', error);
      return { error: true, message: error?.message || 'Internal server error.', statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Post('/refreshtoken')
  public async refreshToken(@Body() refreshToken: string): Promise<AuthResponse> {
    if (!refreshToken) {
      return { error: true, message: 'Refresh Token is required for Access Token Renewal.', statusCode: HttpStatusCode.Unauthorized };
    }
    try {
      const response = (await API.AuthService.postData('/RefresToken', refreshToken)) as AuthResponse;
      return response;
    } catch (error) {
      Trace.Error('Toknen Refresh Error', error);
      return { error: true, message: error?.message || 'Internal server error.', statusCode: HttpStatusCode.InternalServerError };
    }
  }
}
