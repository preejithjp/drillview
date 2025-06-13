import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../interfaces/response.interfaces';
import { APIUtils } from './api.utils';
import { Server } from '../controllers/server.controller';
import { JWTUserData } from '../interfaces/auth.interfaces';

export class AuthUtils {
  public static async VerifyRequestToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (['/auth'].some((a) => req.url?.toLowerCase().includes(a))) {
      next();
    } else {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      const verifyResponse = await AuthUtils.VerifyToken(token);

      if (verifyResponse && verifyResponse.error) {
        APIUtils.ResponseGenerator(res, verifyResponse);
      } else {
        res.locals.user = verifyResponse.data as JWTUserData;
        res.locals.access_token = token as string;
        next();
      }
    }
  }
  public static async VerifyToken(token: string | undefined): Promise<ApiResponse<JWTUserData | null>> {
    if (!token) return { error: true, message: 'Access denied, no token provided.', statusCode: HttpStatusCode.Unauthorized };
    try {
      const user = await new Promise<JWTUserData | null>((resolve, reject) => {
        jwt.verify(token, Server.JWT_SECRET, (err, decoded) => {
          if (err) {
            reject(new Error('Invalid token: ' + err.message));
          } else {
            resolve(decoded as JWTUserData);
          }
        });
      });

      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: user };
    } catch (err) {
      return { error: true, message: err.message, statusCode: HttpStatusCode.Unauthorized, data: null };
    }
  }
}
