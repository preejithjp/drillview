// src/server/controllers/scenario.controller.ts

import { Route, Tags, Get, Post, Patch, Delete, Path, Inject, Request, Security } from 'tsoa';
import { IScenario, IRigItem, IAssignedWell } from '../interfaces/rigscheduler.interfaces';
import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { RigSchedulerDB } from '../database/connectors/rigschedulerdb.connector';
import BinaryUtils from '../utils/binary.utils';
import { Binary } from 'bson';
import path from 'path';

@Route('scenarios')
@Tags('Scenarios')
@Security('bearerAuth')
export default class ScenarioController {
  // ------------------------------------------------------------
  // 1) List all scenarios (unchanged)
  // ------------------------------------------------------------
  @Get('/')
  public async getAllScenarios(): Promise<ApiResponse<IScenario[]>> {
    try {
      const result = await RigSchedulerDB.Scenario.find({}, { _id: 0 }).sort({ ModifiedDate: -1 }).lean();

      // Convert Binary IDs → string, but do NOT expand AssignedWells here (only top‐level fields).
      const data = result.map((s) => ({
        ...s,
        ScenarioId: BinaryUtils.convertBinaryToUuid(s.ScenarioId as Binary),
      }));

      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Error fetching scenarios',
        statusCode: HttpStatusCode.InternalServerError,
        data: [],
      };
    }
  }

  // ------------------------------------------------------------
  // 2) Get a single scenario (including Rigs + AssignedWells)
  // ------------------------------------------------------------
  @Get('/{id}')
  public async getScenario(@Path() id: string): Promise<ApiResponse<IScenario | null>> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(id);
      const scenario = await RigSchedulerDB.Scenario.findOne({ ScenarioId: binaryId }).lean();
      if (scenario) {
        // Convert top‐level ScenarioId
        scenario.ScenarioId = BinaryUtils.convertBinaryToUuid(scenario.ScenarioId as Binary);

        // Convert each Rig’s RigId, and each AssignedWell stays as plain numbers/strings
        if (Array.isArray(scenario.Rigs)) {
          scenario.Rigs = scenario.Rigs.map((r) => ({
            RigId: BinaryUtils.convertBinaryToUuid(r.RigId as Binary),
            RigName: r.RigName,
            ContractStart: r.ContractStart,
            ContractEnd: r.ContractEnd,
            Description: r.Description,
            AssignedWells: Array.isArray(r.AssignedWells)
              ? r.AssignedWells.map((w) => ({
                  WellId: w.WellId,
                  WellName: w.WellName,
                  StartDate: w.StartDate,
                  EndDate: w.EndDate,
                  properties: w.properties || {},
                }))
              : [],
          }));
        }

        return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: scenario };
      }
      return {
        error: true,
        message: 'Scenario not found',
        statusCode: HttpStatusCode.NotFound,
        data: null,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Error fetching scenario',
        statusCode: HttpStatusCode.InternalServerError,
        data: null,
      };
    }
  }

  // ------------------------------------------------------------
  // 3) Create / Update / Delete Scenario (unchanged)
  // ------------------------------------------------------------
  @Post('/')
  public async createScenario(@Request() request: any, @Inject() currentUser?: any): Promise<ApiResponse<IScenario | null>> {
    try {
      const body = request.body;
      const now = Date.now();

      const newScenario: Partial<IScenario> = {
        Name: body.Name,
        Description: body.Description,
        Image: body.Image || '',
        CreatedDate: now,
        ModifiedDate: now,
        CreatedUser: currentUser?.MEMBERID,
        ModifiedUser: currentUser?.MEMBERID,
      };

      const created = await new RigSchedulerDB.Scenario(newScenario).save();
      created.ScenarioId = BinaryUtils.convertBinaryToUuid(created.ScenarioId as Binary);

      return {
        error: false,
        message: 'Scenario created',
        statusCode: HttpStatusCode.Ok,
        data: created,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to create scenario',
        statusCode: HttpStatusCode.BadRequest,
        data: null,
      };
    }
  }

  @Patch('/{id}')
  public async updateScenario(@Path() id: string, @Request() request: any, @Inject() currentUser?: any): Promise<ApiResponse<IScenario | null>> {
    try {
      const body = request.body;
      const file = request.file;
      const binaryId = BinaryUtils.convertUuidToBinary(id);

      const existing = await RigSchedulerDB.Scenario.findOne({ ScenarioId: binaryId });
      if (!existing)
        return {
          error: true,
          message: 'Scenario not found',
          statusCode: HttpStatusCode.NotFound,
          data: null,
        };

      const updated: Partial<IScenario> = {
        Name: body.Name || existing.Name,
        Description: body.Description || existing.Description,
        Image: file ? path.join(file.destination, file.filename) : existing.Image,
        ModifiedDate: Date.now(),
        ModifiedUser: currentUser?.MEMBERID,
      };

      const result = await RigSchedulerDB.Scenario.findOneAndUpdate({ ScenarioId: binaryId }, { $set: updated }, { new: true });
      if (result) result.ScenarioId = BinaryUtils.convertBinaryToUuid(result.ScenarioId as Binary);

      return {
        error: false,
        message: 'Scenario updated',
        statusCode: HttpStatusCode.Ok,
        data: result,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to update scenario',
        statusCode: HttpStatusCode.BadRequest,
        data: null,
      };
    }
  }

  @Delete('/{id}')
  public async deleteScenario(@Path() id: string): Promise<ApiResponse<null>> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(id);
      await RigSchedulerDB.Scenario.deleteOne({ ScenarioId: binaryId });
      return {
        error: false,
        message: 'Scenario deleted',
        statusCode: HttpStatusCode.Ok,
        data: null,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to delete scenario',
        statusCode: HttpStatusCode.BadRequest,
        data: null,
      };
    }
  }

  @Patch('/pin/:id')
  public async pinScenario(@Path() id: string, @Request() request: any): Promise<ApiResponse<null>> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(id);
      const { Pin } = request.body;

      await RigSchedulerDB.Scenario.updateOne({ ScenarioId: binaryId }, { $set: { Pin } });

      return {
        error: false,
        message: 'Pin status updated',
        statusCode: HttpStatusCode.Ok,
        data: null,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to update pin status',
        statusCode: HttpStatusCode.BadRequest,
        data: null,
      };
    }
  }

  // ------------------------------------------------------------
  // 4) Create / Update / Delete a Rig under a Scenario (unchanged)
  // ------------------------------------------------------------
  public async createRig(scenarioId: string, req: any): Promise<ApiResponse<any>> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(scenarioId);
      const rig: Partial<IRigItem> = {
        RigId: BinaryUtils.convertUuidToBinary(),
        RigName: req.body.RigName,
        ContractStart: req.body.ContractStart,
        ContractEnd: req.body.ContractEnd,
        Description: req.body.Description,
        AssignedWells: [], // initially empty
      };

      const updated = await RigSchedulerDB.Scenario.findOneAndUpdate(
        { ScenarioId: binaryId },
        { $push: { Rigs: rig }, $set: { ModifiedDate: Date.now() } },
        { new: true }
      );

      return {
        error: false,
        statusCode: HttpStatusCode.Ok,
        message: 'Rig added',
        data: updated,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message,
        data: null,
      };
    }
  }

  public async updateRig(scenarioId: string, rigId: string, req: any): Promise<ApiResponse<any>> {
    try {
      const binaryScenarioId = BinaryUtils.convertUuidToBinary(scenarioId);
      const binaryRigId = BinaryUtils.convertUuidToBinary(rigId);

      const updated = await RigSchedulerDB.Scenario.updateOne(
        { ScenarioId: binaryScenarioId, 'Rigs.RigId': binaryRigId },
        {
          $set: {
            'Rigs.$.RigName': req.body.RigName,
            'Rigs.$.ContractStart': req.body.ContractStart,
            'Rigs.$.ContractEnd': req.body.ContractEnd,
            'Rigs.$.Description': req.body.Description,
            ModifiedDate: Date.now(),
          },
        }
      );

      return {
        error: false,
        statusCode: HttpStatusCode.Ok,
        message: 'Rig updated',
        data: updated,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message,
        data: null,
      };
    }
  }

  @Delete('{scenarioId}/rigs/{rigId}')
  public async deleteRig(@Path() scenarioId: string, @Path() rigId: string): Promise<ApiResponse<null>> {
    try {
      const binaryScenarioId = BinaryUtils.convertUuidToBinary(scenarioId);
      const binaryRigId = BinaryUtils.convertUuidToBinary(rigId);

      await RigSchedulerDB.Scenario.updateOne(
        { ScenarioId: binaryScenarioId },
        {
          $pull: { Rigs: { RigId: binaryRigId } },
          $set: { ModifiedDate: Date.now() },
        }
      );

      return {
        error: false,
        statusCode: HttpStatusCode.Ok,
        message: 'Rig deleted',
        data: null,
      };
    } catch (e: any) {
      return {
        error: true,
        statusCode: HttpStatusCode.InternalServerError,
        message: e.message,
        data: null,
      };
    }
  }

  // ------------------------------------------------------------
  // 5) Replace entire Rigs array (unchanged, except now it knows about AssignedWells)
  // ------------------------------------------------------------
  @Patch('{scenarioId}/rigs')
  public async assignRigs(@Path() scenarioId: string, @Request() req: any): Promise<ApiResponse<IScenario | null>> {
    try {
      const binaryScenarioId = BinaryUtils.convertUuidToBinary(scenarioId);
      const incoming: Partial<IRigItem & { RigId: string }>[] = req.body.rigs || [];

      // map incoming to stored format, preserving AssignedWells if they exist
      const rigsToWrite = incoming.map((item) => ({
        RigId: item.RigId ? BinaryUtils.convertUuidToBinary(item.RigId) : BinaryUtils.convertUuidToBinary(),
        RigName: item.RigName,
        ContractStart: item.ContractStart ?? null,
        ContractEnd: item.ContractEnd ?? null,
        Description: item.Description ?? '',
        AssignedWells: Array.isArray(item.AssignedWells)
          ? (item.AssignedWells as IAssignedWell[]).map((w) => ({
              WellId: w.WellId,
              WellName: w.WellName,
              StartDate: w.StartDate,
              EndDate: w.EndDate,
            }))
          : [],
      }));

      const updated = await RigSchedulerDB.Scenario.findOneAndUpdate(
        { ScenarioId: binaryScenarioId },
        {
          $set: {
            Rigs: rigsToWrite,
            ModifiedDate: Date.now(),
          },
        },
        { new: true }
      ).lean();

      if (!updated) {
        return {
          error: true,
          message: 'Scenario not found',
          statusCode: HttpStatusCode.NotFound,
          data: null,
        };
      }

      // Convert back to UUID strings
      updated.ScenarioId = BinaryUtils.convertBinaryToUuid(updated.ScenarioId as Binary);
      if (Array.isArray(updated.Rigs)) {
        updated.Rigs = updated.Rigs.map((r) => ({
          ...r,
          RigId: BinaryUtils.convertBinaryToUuid(r.RigId as Binary),
        }));
      }

      return {
        error: false,
        message: 'Rigs assigned to scenario',
        statusCode: HttpStatusCode.Ok,
        data: updated,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to assign rigs',
        statusCode: HttpStatusCode.InternalServerError,
        data: null,
      };
    }
  }

  // ------------------------------------------------------------
  // 6) NEW: assign a well to a specific rig under a scenario
  //    Expects in request body: { WellId, WellName, StartDate, EndDate }
  // ------------------------------------------------------------
  @Patch('{scenarioId}/rigs/{rigId}/wells')
  public async assignWell(@Path() scenarioId: string, @Path() rigId: string, @Request() req: any): Promise<ApiResponse<IScenario | null>> {
    try {
      const binaryScenarioId = BinaryUtils.convertUuidToBinary(scenarioId);
      const binaryRigId = BinaryUtils.convertUuidToBinary(rigId);

      // Extract all fields including properties
      const { WellId, WellName, StartDate, EndDate, properties } = req.body as IAssignedWell & { properties?: Record<string, any> };

      if (!WellId || !WellName || StartDate == null || EndDate == null) {
        return {
          error: true,
          message: 'Missing well assignment fields',
          statusCode: HttpStatusCode.BadRequest,
          data: null,
        };
      }

      const wellObj: Partial<IAssignedWell> = {
        WellId,
        WellName,
        StartDate,
        EndDate,
        properties: properties || {},
      };

      const updated = await RigSchedulerDB.Scenario.findOneAndUpdate(
        { ScenarioId: binaryScenarioId, 'Rigs.RigId': binaryRigId },
        {
          $push: { 'Rigs.$.AssignedWells': wellObj },
          $set: { ModifiedDate: Date.now() },
        },
        { new: true }
      ).lean();

      if (!updated) {
        return {
          error: true,
          message: 'Scenario or Rig not found',
          statusCode: HttpStatusCode.NotFound,
          data: null,
        };
      }

      updated.ScenarioId = BinaryUtils.convertBinaryToUuid(updated.ScenarioId as Binary);
      if (Array.isArray(updated.Rigs)) {
        updated.Rigs = updated.Rigs.map((r) => ({
          ...r,
          RigId: BinaryUtils.convertBinaryToUuid(r.RigId as Binary),
        }));
      }

      return {
        error: false,
        message: 'Well assigned to rig',
        statusCode: HttpStatusCode.Ok,
        data: updated,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to assign well to rig',
        statusCode: HttpStatusCode.InternalServerError,
        data: null,
      };
    }
  }

  /**
   * PATCH /scenarios/{scenarioId}/rigs/{rigId}/wells/{wellId}
   * Update the StartDate/EndDate of an existing AssignedWell under a given Rig.
   * This endpoint only works if that well was already “assigned” via the
   * assignWell() route (PATCH /scenarios/{scenarioId}/rigs/{rigId}/wells).
   */

  /**
   * PATCH /scenarios/{scenarioId}/rigs/{rigId}/wells/{wellId}
   * Update the StartDate/EndDate of an existing AssignedWell under a given Rig.
   */

  /**
   * PATCH /scenarios/{scenarioId}/rigs/{rigId}/wells/{wellId}
   * Update the StartDate/EndDate of an existing AssignedWell under a given Rig.
   */

  /**
   * PATCH /scenarios/{scenarioId}/rigs/{rigId}/wells/{wellId}
   * Update the StartDate/EndDate of an existing AssignedWell under a given Rig.
   */
  @Patch('{scenarioId}/rigs/{rigId}/wells/{wellId}')
  public async updateAssignedWell(
    @Path() scenarioId: string,
    @Path() rigId: string,
    @Path() wellId: string,
    @Request() req: any
  ): Promise<ApiResponse<IScenario | null>> {
    try {
      const binaryScenarioId = BinaryUtils.convertUuidToBinary(scenarioId);
      const binaryRigId = BinaryUtils.convertUuidToBinary(rigId);
      const { StartDate, EndDate, properties } = req.body as {
        StartDate: number;
        EndDate: number;
        properties?: Record<string, any>;
      };

      const setOps: any = {
        'Rigs.$.AssignedWells.$[w].StartDate': StartDate,
        'Rigs.$.AssignedWells.$[w].EndDate': EndDate,
      };
      if (properties !== undefined) {
        setOps['Rigs.$.AssignedWells.$[w].properties'] = properties;
      }

      const updated = await RigSchedulerDB.Scenario.findOneAndUpdate(
        {
          ScenarioId: binaryScenarioId,
          'Rigs.RigId': binaryRigId,
          'Rigs.AssignedWells.WellId': wellId,
        },
        {
          $set: { ...setOps, ModifiedDate: Date.now() },
        },
        {
          arrayFilters: [{ 'w.WellId': wellId }],
          new: true,
          lean: true,
        }
      );

      if (!updated) {
        return {
          error: true,
          message: 'Scenario, Rig or Well not found',
          statusCode: HttpStatusCode.NotFound,
          data: null,
        };
      }

      updated.ScenarioId = BinaryUtils.convertBinaryToUuid(updated.ScenarioId as Binary);
      if (Array.isArray(updated.Rigs)) {
        updated.Rigs = updated.Rigs.map((r) => ({
          ...r,
          RigId: BinaryUtils.convertBinaryToUuid(r.RigId as Binary),
        }));
      }

      return {
        error: false,
        message: 'Assigned well updated',
        statusCode: HttpStatusCode.Ok,
        data: updated,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to update assigned well',
        statusCode: HttpStatusCode.InternalServerError,
        data: null,
      };
    }
  }

  // ------------------------------------------------------------
  // 13) NEW: Delete (remove) an AssignedWell from a specific Rig
  //     DELETE /scenarios/:scenarioId/rigs/:rigId/wells/:wellId
  // ------------------------------------------------------------
  @Delete('{scenarioId}/rigs/{rigId}/wells/{wellId}')
  public async deleteAssignedWell(@Path() scenarioId: string, @Path() rigId: string, @Path() wellId: string): Promise<ApiResponse<IScenario | null>> {
    try {
      const binaryScenarioId = BinaryUtils.convertUuidToBinary(scenarioId);
      const binaryRigId = BinaryUtils.convertUuidToBinary(rigId);

      // Pull the given well out of Rigs.$.AssignedWells
      const updated = await RigSchedulerDB.Scenario.findOneAndUpdate(
        {
          ScenarioId: binaryScenarioId,
          'Rigs.RigId': binaryRigId,
          'Rigs.AssignedWells.WellId': wellId, // ensure well is already assigned
        },
        {
          $pull: { 'Rigs.$.AssignedWells': { WellId: wellId } },
          $set: { ModifiedDate: Date.now() },
        },
        { new: true, lean: true }
      );

      if (!updated) {
        return {
          error: true,
          message: 'Scenario, Rig or Well not found',
          statusCode: HttpStatusCode.NotFound,
          data: null,
        };
      }

      // Convert top‐level ScenarioId → string
      updated.ScenarioId = BinaryUtils.convertBinaryToUuid(updated.ScenarioId as Binary);

      // Convert each Rig.RigId → string, and leave AssignedWells as plain JS objects
      if (Array.isArray(updated.Rigs)) {
        updated.Rigs = updated.Rigs.map((r) => ({
          ...r,
          RigId: BinaryUtils.convertBinaryToUuid(r.RigId as Binary),
          AssignedWells: Array.isArray(r.AssignedWells)
            ? r.AssignedWells.map((w) => ({
                WellId: w.WellId,
                WellName: w.WellName,
                StartDate: w.StartDate,
                EndDate: w.EndDate,
              }))
            : [],
        }));
      }

      return {
        error: false,
        message: 'Assigned well removed from rig',
        statusCode: HttpStatusCode.Ok,
        data: updated,
      };
    } catch (error: any) {
      return {
        error: true,
        message: error.message || 'Failed to remove assigned well',
        statusCode: HttpStatusCode.InternalServerError,
        data: null,
      };
    }
  }
}
