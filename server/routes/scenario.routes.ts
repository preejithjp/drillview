// src/server/routes/scenario.routes.ts

import { Router } from 'express';
import ScenarioController from '../controllers/scenario.controller';
import { APIUtils } from '../utils/api.utils';
import { upload } from '../handlers/fileupload.handler';

export default function ScenarioRoutes(router: Router) {
  const scenarioController = new ScenarioController();

  // Scenario CRUD
  router.get('/scenarios', async (req, res) => {
    const data = await scenarioController.getAllScenarios();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/scenarios/:id', async (req, res) => {
    const data = await scenarioController.getScenario(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/scenarios', upload.single('image'), async (req, res) => {
    const data = await scenarioController.createScenario(req, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/scenarios/:id', upload.single('image'), async (req, res) => {
    const data = await scenarioController.updateScenario(req.params.id, req, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/scenarios/:id', async (req, res) => {
    const data = await scenarioController.deleteScenario(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/scenarios/pin/:id', async (req, res) => {
    const data = await scenarioController.pinScenario(req.params.id, req);
    APIUtils.ResponseGenerator(res, data);
  });

  // Rigs under a Scenario
  router.post('/scenarios/:scenarioId/rigs', async (req, res) => {
    const data = await scenarioController.createRig(req.params.scenarioId, req);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/scenarios/:scenarioId/rigs/:rigId', async (req, res) => {
    const data = await scenarioController.updateRig(req.params.scenarioId, req.params.rigId, req);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/scenarios/:scenarioId/rigs/:rigId', async (req, res) => {
    const data = await scenarioController.deleteRig(req.params.scenarioId, req.params.rigId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/scenarios/:scenarioId/rigs', async (req, res) => {
    const data = await scenarioController.assignRigs(req.params.scenarioId, req);
    APIUtils.ResponseGenerator(res, data);
  });

  // “Assign a new well” (push into AssignedWells[])
  router.patch('/scenarios/:scenarioId/rigs/:rigId/wells', async (req, res) => {
    const data = await scenarioController.assignWell(req.params.scenarioId, req.params.rigId, req);
    APIUtils.ResponseGenerator(res, data);
  });

  // ←---- Add this “update existing assigned‐well” route:
  router.patch('/scenarios/:scenarioId/rigs/:rigId/wells/:wellId', async (req, res) => {
    const data = await scenarioController.updateAssignedWell(req.params.scenarioId, req.params.rigId, req.params.wellId, req);
    APIUtils.ResponseGenerator(res, data);
  });

  // ←– NEW ROUTE: “DELETE a well from a specific rig”
  router.delete('/scenarios/:scenarioId/rigs/:rigId/wells/:wellId', async (req, res) => {
    const data = await scenarioController.deleteAssignedWell(req.params.scenarioId, req.params.rigId, req.params.wellId);
    APIUtils.ResponseGenerator(res, data);
  });
}
