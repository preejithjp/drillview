import { Router } from 'express';
import DashboardController from '../controllers/dahsboard.controller';
import { APIUtils } from '../utils/api.utils';
import { upload } from '../handlers/fileupload.handler';

export default function DashboardRoutes(router: Router) {
  const dashboardController = new DashboardController();

  router.get('/dashboard', async (req, res) => {
    const data = await dashboardController.getAllDashboard();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/dashboard/:id', async (req, res) => {
    const data = await dashboardController.getDashboards(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/dashboard/:id', async (req, res) => {
    const data = await dashboardController.deleteDashboardById(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/dashboard', async (req, res) => {
    const data = await dashboardController.insterDashboardLayout(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/dashboard/sortedOrder', async (req, res, next) => {
    try {
      const data = await dashboardController.updateSortorder(req.body);
      APIUtils.ResponseGenerator(res, data);
    } catch (error) {
      next(error);
    }
  });
  router.patch('/dashboard/:id', async (req, res) => {
    const data = await dashboardController.upsertDashboard(req.params.id, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/dashboard/:id', upload.single('file'), async (req, res, next) => {
    try {
      const data = await dashboardController.uploadFile(req.file);
      APIUtils.ResponseGenerator(res, data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/dashboard/getfiles/all', async (req, res) => {
    const data = await dashboardController.getAllFiles();
    APIUtils.ResponseGenerator(res, data);
  });
}
