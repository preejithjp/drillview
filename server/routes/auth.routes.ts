import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { APIUtils } from '../utils/api.utils';

export default function AuthRoutes(router: Router) {
  const authController = new AuthController();

  router.post('/auth/login', async (req, res) => {
    const data = await authController.authenticate(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/auth/refreshtoken', async (req, res) => {
    const data = await authController.refreshToken(req.body.token);
    APIUtils.ResponseGenerator(res, data);
  });
}
