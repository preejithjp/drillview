import { Router } from 'express';
import Trace from '../controllers/trace.controller';
import { HttpStatusCode } from 'axios';
import { TraceLevel } from '../interfaces/trace.interfaces';
import { APIUtils } from '../utils/api.utils';

export default function TraceRoutes(router: Router) {
  router.post('/traces/filter', async (req, res) => {
    const data = await Trace.getSetFilters(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/traces', async (_req, res) => {
    const data = await Trace.getAllTraces();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/traces/:fieldName', async (req, res) => {
    const data = await Trace.getDistinctValues(req.params.fieldName);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/traces/:level', async (req, res) => {
    try {
      const data = Trace.HTTP(req.params.level as unknown as TraceLevel, req.body);
      res.status(HttpStatusCode.Ok).send(data);
    } catch (error) {
      const resp = { error: true, statusCode: HttpStatusCode.InternalServerError, message: 'Internal Server Error: ' + error };
      APIUtils.ResponseGenerator(res, resp);
    }
  });
}
