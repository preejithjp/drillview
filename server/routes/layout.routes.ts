import { Router } from 'express';
import LayoutController from '../controllers/layout.controller';
import { APIUtils } from '../utils/api.utils';

export default function LayoutRoutes(router: Router) {
  const layoutController = new LayoutController();

  router.get('/layout/:id', async (req, res) => {
    const data = await layoutController.getLayouts(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/layout/:id', async (req, res) => {
    const data = await layoutController.deleteLayoutById(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/layout', async (req, res) => {
    const data = await layoutController.insterLayout(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/layout/deleteMany', async (req, res) => {
    const data = await layoutController.deleteLayoutMay(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/layout/:id', async (req, res) => {
    const data = await layoutController.UpdateLayout(req.params.id, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });
}
