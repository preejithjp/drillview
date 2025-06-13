import { Router, Response } from 'express';
import { APIUtils } from '../utils/api.utils';
import PlatformController from '../controllers/platform.controller';

export default function PlatformRoutes(router: Router) {
  const platformController = new PlatformController();

  router.get('/wellbores', async (_req, res: Response) => {
    const data = await platformController.getWellbores(res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/wellbores/:referenceUrl/logs', async (req, res: Response) => {
    const data = await platformController.getLogs(req.params.referenceUrl, res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/wellbores/:referenceUrl/mnemonics', async (req, res) => {
    const data = await platformController.getMnemonics(req.params.referenceUrl, res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/wellbores/:wellboreUri', async (req, res) => {
    const data = await platformController.getWellboreMetadata(req.params.wellboreUri, res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });
}
