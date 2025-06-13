import { Router } from 'express';
import DataCollectionController from '../controllers/datacollection.controller';
import { APIUtils } from '../utils/api.utils';

export default function DatacollectionRoutes(router: Router) {
  const dataController = new DataCollectionController();

  router.get('/datacollection', async (_req, res) => {
    const data = await dataController.getAllRigs();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/datacollection/recordstemplate', async (_req, res) => {
    const data = await dataController.getRecordsTemplate();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/datacollection/:rigId', async (req, res) => {
    const data = await dataController.getRigById(req.params.rigId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/datacollection/:rigId/last-updated', async (req, res) => {
    const data = await dataController.getLastUpdatedTime(req.params.rigId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/datacollection', async (req, res) => {
    const data = await dataController.insertDataCollection(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/datacollection/:rigId', async (req, res) => {
    const data = await dataController.updateRigById(req.params.rigId, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/datacollection/:rigId/records-items', async (req, res) => {
    const data = await dataController.updateRecordsById(req.params.rigId, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/datacollection/:rigId', async (req, res) => {
    const data = await dataController.deleteRigsById(req.params.rigId);
    APIUtils.ResponseGenerator(res, data);
  });
}
