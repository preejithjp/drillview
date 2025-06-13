import 'express';
import { JWTUserData } from './interfaces/auth.interfaces';

interface Locals {
  message?: string;
}

declare module 'express' {
  export interface Response {
    locals: {
      access_token?: string;
      user?: JWTUserData;
    };
  }
}
