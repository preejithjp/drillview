import { Router } from 'express';
import { APIUtils } from '../utils/api.utils';
import { RigController } from '../controllers/rig.controller';

export default function RigRoutes(router: Router) {
  const controller = new RigController();

  router.get('/rigs', async (req, res) => {
    const token = res.locals.access_token;
    const data = await controller.getAllRigs(token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/rigs', async (req, res) => {
    const token = res.locals.access_token;
    const data = await controller.createRig(req.body, res.locals.user, token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/rigs/:id', async (req, res) => {
    const token = res.locals.access_token;
    const id = req.params.id;
    const data = await controller.updateRig(id, req.body, token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/rigs/:id', async (req, res) => {
    const token = res.locals.access_token;
    const id = req.params.id;

    const data = await controller.deleteRig(id, token);

    APIUtils.ResponseGenerator(res, data);
  });
}
