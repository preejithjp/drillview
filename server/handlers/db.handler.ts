import { IDBStatus } from '../database/connectors/db.connector.base';
import { AdminDB } from '../database/connectors/admindb.connector';
import { ChatDB } from '../database/connectors/chatdb.connector';
import { TraceDB } from '../database/connectors/tracedb.connector';
import { DashboardDB } from '../database/connectors/dashboarddb.connector';
import { DataCollectDB } from '../database/connectors/datacollection.db.connector';
import { SynchronizerDB } from '../database/connectors/synchronizer.connector';
import { UnitDB } from '../database/connectors/unitdb.connector';
import { RigSchedulerDB } from '../database/connectors/rigschedulerdb.connector';

export class DBHandler {
  public static async initialize(): Promise<void> {
    AdminDB.initialize();
    TraceDB.initialize();
    ChatDB.initialize();
    DashboardDB.initialize();
    DataCollectDB.initialize();
    SynchronizerDB.initialize();
    UnitDB.initialize();
    await RigSchedulerDB.initialize();
  }

  public static async checkConnectionStatus(): Promise<IDBStatus[]> {
    const [
      adminDBStatus,
      traceDBStatus,
      chatDBStatus,
      dashboarddbStatus,
      dataCollctDbStatus,
      synchronizerDBStatus,
      UnitDBStatus,
      rigSchedulerStatus,
    ] = await Promise.all([
      AdminDB.checkConnectionStatus(),
      TraceDB.checkConnectionStatus(),
      ChatDB.checkConnectionStatus(),
      DashboardDB.checkConnectionStatus(),
      DataCollectDB.checkConnectionStatus(),
      SynchronizerDB.checkConnectionStatus(),
      UnitDB.checkConnectionStatus(),
      RigSchedulerDB.checkConnectionStatus(),
    ]);

    return [
      adminDBStatus,
      traceDBStatus,
      chatDBStatus,
      dashboarddbStatus,
      dataCollctDbStatus,
      synchronizerDBStatus,
      UnitDBStatus,
      rigSchedulerStatus,
    ];
  }
}
