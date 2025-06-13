import mongoose from 'mongoose';
import BaseDB from './db.connector.base';
import Trace from '../../controllers/trace.controller';

import { IDashboardUser, ILayoutUsers } from '../../interfaces/dashboard.interfaces';
import { DashboardSchema } from '../models/dashboard.model';
import { LayoutSchema } from '../models/layout.model';
import { SettingsSchema } from '../models/settings.model';
import { DashboardSettings } from '../../helpers/settings.helper';
import { IImageTemplate } from '../../interfaces/imagetemplate.interfaces';
import { ImageTemplateSchema } from '../models/imagetemplate.model';

export enum DashboardDBSchemas {
  DASHBOARD = 'dashboard',
  LAYOUT = 'layout',
  SETTINGS = 'settings',
  IMAGETEMPLATE = 'imagetemplate',
}

export class DashboardDB extends BaseDB {
  private static instance: DashboardDB;

  public static Dashboard: mongoose.Model<IDashboardUser>;
  public static Layout: mongoose.Model<ILayoutUsers>;
  public static Settings: mongoose.Model<DashboardSettings>;
  public static ImageTemplate: mongoose.Model<IImageTemplate>;

  protected DB_ENDPOINT = process.env.DASHBOARD_DB_ENDPOINT || '';
  protected DB_NAME = process.env.DASHBOARD_DB_NAME || '';
  protected DB_USERNAME = process.env.DASHBOARD_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.DASHBOARD_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined = undefined;

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new DashboardDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new DashboardDB();
    }
    return this.instance.getStatus();
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new DashboardDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    DashboardDB.Dashboard = this.connection.model<IDashboardUser>(DashboardDBSchemas.DASHBOARD, DashboardSchema, DashboardDBSchemas.DASHBOARD);
    DashboardDB.Layout = this.connection.model<ILayoutUsers>(DashboardDBSchemas.LAYOUT, LayoutSchema, DashboardDBSchemas.LAYOUT);
    DashboardDB.Settings = this.connection.model<DashboardSettings>(DashboardDBSchemas.SETTINGS, SettingsSchema, DashboardDBSchemas.SETTINGS);
    DashboardDB.ImageTemplate = this.connection.model<IImageTemplate>(
      DashboardDBSchemas.IMAGETEMPLATE,
      ImageTemplateSchema,
      DashboardDBSchemas.IMAGETEMPLATE
    );
  }
}
