import { Router } from 'express';
import SynchronizerController from '../controllers/synchronizer.controller';
import { APIUtils } from '../utils/api.utils';
import { ObjectNames } from '../interfaces/synchronizer.interfaces';

export default function SynchronizerRoutes(router: Router) {
  const synchronizerController = new SynchronizerController();

  router.get('/synchronizers/job', async (_req, res) => {
    const data = await synchronizerController.getAllJobs(res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/synchronizers/job/:jobId', async (req, res) => {
    const data = await synchronizerController.getJobById(req.params.jobId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/synchronizers/source/:sourceid/jobs', async (req, res) => {
    const data = await synchronizerController.getJobBySourceId(req.params.sourceid, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/synchronizers/job', async (req, res) => {
    const data = await synchronizerController.insertJob(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/synchronizers/job/:jobId/start', async (req, res) => {
    const data = await synchronizerController.startJob(req.params.jobId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/synchronizers/job/:jobId/stop', async (req, res) => {
    const data = await synchronizerController.stopJob(req.params.jobId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/synchronizers/job/:jobId', async (req, res) => {
    const data = await synchronizerController.updateJob(req.params.jobId, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/synchronizers/job/:jobId/:wellId', async (req, res) => {
    const data = await synchronizerController.deleteWellById(req.params.jobId, req.params.wellId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/synchronizers/source/me', async (_req, res) => {
    const data = await synchronizerController.getDefaultSource(res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/synchronizers/source', async (_req, res) => {
    const data = await synchronizerController.getAllSource(res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/synchronizers/source', async (req, res) => {
    const data = await synchronizerController.insertSource(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/synchronizers/source/accesssource', async (req, res) => {
    const data = await synchronizerController.updateAccessSource(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/synchronizers/source/:sourceId', async (req, res) => {
    const data = await synchronizerController.updateSource(req.params.sourceId, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/synchronizers/source/:sourceId', async (req, res) => {
    const data = await synchronizerController.deleteSourceById(req.params.sourceId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/synchronizers/object/wellbores', async (req, res) => {
    const data = await synchronizerController.getWellbores(res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/synchronizers/object/wellbores/:sourceId', async (req, res) => {
    const data = await synchronizerController.getWellboresById(req.params.sourceId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/synchronizers/object/all', async (req, res) => {
    const data = await synchronizerController.getAllObject(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/synchronizers/objects/:objectname', async (req, res) => {
    const data = await synchronizerController.getObjects(req.params.objectname as ObjectNames, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/synchronizers/connectionstatus', async (req, res) => {
    const data = await synchronizerController.connectionStatus(req.body);
    APIUtils.ResponseGenerator(res, data);
  });
}
