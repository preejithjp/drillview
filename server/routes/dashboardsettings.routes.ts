import { Router } from 'express';
import SettingsController from '../controllers/dashboardsetings.controller';
import { APIUtils } from '../utils/api.utils';

export default function settingsRoutes(router: Router) {
  const settingsController = new SettingsController();

  router.get('/settings/:id', async (req, res) => {
    const data = await settingsController.getSettings(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/settings', async (req, res) => {
    const data = await settingsController.insterSettingsLayout(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/settings/:id', async (req, res) => {
    const data = await settingsController.upsertSettings(req.params.id, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/settings/:id', async (req, res) => {
    const data = await settingsController.deleteSettingsById(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });
}
