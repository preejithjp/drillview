import { Router, Response } from 'express';
import OrganizationController from '../controllers/organization.controller';
import { APIUtils } from '../utils/api.utils';

export default function OrganizationRoutes(router: Router) {
  const orgController = new OrganizationController();

  router.get('/organizations', async (_req, res) => {
    const data = await orgController.getAllOrganizations();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/organizations/:organizationId', async (req, res) => {
    const data = await orgController.getOrganizationById(req.params.organizationId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/organizations', async (req, res: Response) => {
    const data = await orgController.insertOrganization(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/organizations/:organizationId', async (req, res) => {
    const data = await orgController.updateOrganization(req.params.organizationId, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/organizations/:organizationId/activate', async (req, res) => {
    const data = await orgController.updateStatusActive(req.params.organizationId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/organizations/:organizationId/deactivate', async (req, res) => {
    const data = await orgController.updateStatusInactive(req.params.organizationId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/organizations/:organizationId', async (req, res) => {
    const data = await orgController.removeOrganization(req.params.organizationId);
    APIUtils.ResponseGenerator(res, data);
  });
}
