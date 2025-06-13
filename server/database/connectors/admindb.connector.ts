import mongoose from 'mongoose';
import BaseDB from './db.connector.base';
import Trace from '../../controllers/trace.controller';

import { IMember } from '../../interfaces/member.interfaces';
import { IOrganization } from '../../interfaces/organization.interfaces';
import { MemberSchema } from '../models/member.model';
import { OrganizationSchema } from '../models/organization.model';

enum AdminDBSchemas {
  MEMBER = 'members',
  ORGANIZATION = 'organizations',
}

export class AdminDB extends BaseDB {
  private static instance: AdminDB;

  public static Member: mongoose.Model<IMember>;
  public static Organization: mongoose.Model<IOrganization>;

  protected DB_ENDPOINT = process.env.ADMIN_DB_ENDPOINT || '';
  protected DB_NAME = process.env.ADMIN_DB_NAME || '';
  protected DB_USERNAME = process.env.ADMIN_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.ADMIN_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined;

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new AdminDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new AdminDB();
    }
    return this.instance.getStatus();
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new AdminDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    AdminDB.Member = this.connection.model<IMember>(AdminDBSchemas.MEMBER, MemberSchema, AdminDBSchemas.MEMBER);
    AdminDB.Organization = this.connection.model<IOrganization>(AdminDBSchemas.ORGANIZATION, OrganizationSchema, AdminDBSchemas.ORGANIZATION);
  }
}
