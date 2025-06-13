import { Router } from 'express';
import { APIUtils } from '../utils/api.utils';
import { WellController } from '../controllers/well.controller';

export default function WellRoutes(router: Router) {
  const controller = new WellController();

  router.get('/wells', async (req, res) => {
    const token = res.locals.access_token;
    const data = await controller.getAllWells(token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/wells', async (req, res) => {
    const token = res.locals.access_token;
    const data = await controller.createWell(req.body, res.locals.user, token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/wells/:id', async (req, res) => {
    const token = res.locals.access_token;
    const data = await controller.updateWell(req.params.id, req.body, token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/wells/:uri', async (req, res) => {
    const token = res.locals.access_token;
    const uri = decodeURIComponent(req.params.uri);
    const data = await controller.deleteWell(uri, token);
    APIUtils.ResponseGenerator(res, data);
  });
}
