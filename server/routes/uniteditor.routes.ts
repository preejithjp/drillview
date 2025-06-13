import { Router } from 'express';
import UserEditorController from '../controllers/uniteditor.controller';
import { APIUtils } from '../utils/api.utils';

export default function UnitEditorRoutes(router: Router) {
  const uniteditorController = new UserEditorController();

  router.get('/unittypes', async (_req, res) => {
    const data = await uniteditorController.getUnitTypes();
    APIUtils.ResponseGenerator(res, data);
  });
}
