import { Route, Tags, Post, Body, Security, Get, Inject, Patch, Delete } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { IOrganization, OrganizationStatus } from '../interfaces/organization.interfaces';
import { HttpStatusCode } from 'axios';
import { JWTUserData } from '../interfaces/auth.interfaces';
import { Long } from 'bson';
import { IMember, IMemberBase } from '../interfaces/member.interfaces';
import { InsertMemberResponse, GetMemberResponse } from './member.controller';
import { AdminDB } from '../database/connectors/admindb.connector';
import { Utils } from '../utils/common.utils';

type OrganizationResponse = ApiResponse<null>;
type GetOrganizationResponse = ApiResponse<IOrganization | IOrganization[] | null>;
type PartialOrganizationData = Omit<IOrganization, 'OrganizationId' | 'ModifiedDate' | 'CreatedDate' | 'CreatedUser'>;

@Route('organizations')
@Tags('Organization')
@Security('bearerAuth')
export default class OrganizationController {
  @Get('/')
  public async getAllOrganizations(): Promise<GetOrganizationResponse> {
    try {
      const allOrgs: IOrganization[] = await AdminDB.Organization.find({}, { _id: false }).sort({ CreatedDate: -1 }).lean<IOrganization[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: allOrgs };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Organizations Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/{id}')
  public async getOrganizationById(id: string): Promise<GetOrganizationResponse> {
    try {
      const organizationId = Long.fromString(id);
      if (!organizationId) {
        return { error: true, message: 'Organization Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const findOrg: IOrganization | null = await AdminDB.Organization.findOne(
        { OrganizationId: organizationId },
        { _id: false }
      ).lean<IOrganization>();
      if (findOrg) {
        return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: findOrg };
      } else {
        return { error: true, message: 'Unable to identify Organization by Provided Id', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Organization Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/{id}/members')
  public async getAllMembersByOrgId(id: string): Promise<GetMemberResponse> {
    try {
      const members = await AdminDB.Member.find({ OrganisationId: parseInt(id) }, { _id: false })
        .sort({ CreatedDate: -1 })
        .lean<IMember[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: members };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: error?.codeName ? msg : 'Error While Obtaining Member Details From Organization',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/')
  public async insertOrganization(@Body() insertData: PartialOrganizationData, @Inject() currentUser?: JWTUserData): Promise<OrganizationResponse> {
    try {
      const orgCount = await AdminDB.Organization.countDocuments();
      const insertObj: Omit<IOrganization, 'OrganizationId'> = {
        ...insertData,
        CreatedUser: currentUser?.MEMBERID,
        ModifiedDate: Date.now(),
        CreatedDate: Date.now(),
      };
      await AdminDB.Organization.create({ ...insertObj, OrganizationId: Long.fromNumber(orgCount + 1) });
      //Convert the OrganizationId to a hexadecimal string response.OrganizationId.toString('hex');
      return { error: false, message: 'Organization Inserted Successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Organization',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/{id}/insert-member')
  public async insertOrgMember(id: string, @Body() insertData: IMemberBase, @Inject() currentUser: JWTUserData): Promise<InsertMemberResponse> {
    try {
      if (insertData?.Email) {
        const alreadyEmail: IMember | null = await AdminDB.Member.findOne({ Email: insertData?.Email }).lean<IMember>();
        if (alreadyEmail) {
          return { error: true, message: 'Email Already Exists', statusCode: HttpStatusCode.BadRequest, data: alreadyEmail };
        }
      }
      const insertObj: IMember = {
        ...insertData,
        OrganisationId: parseInt(id),
        CreatedDate: Date.now(),
        CreatedUser: currentUser.MEMBERID,
        //ModifiedDate: Date.now(),
        LastLoggedIn: 0,
        LoggedinFailedCount: 0,
        MaxLoginFailedCount: 0,
      };
      const newMember: IMember = await AdminDB.Member.create(insertObj);
      return {
        error: false,
        message: 'Member inserted successfully from organization',
        statusCode: HttpStatusCode.Ok,
        data: newMember,
      };
    } catch (error) {
      return {
        error: true,
        message: 'Error while adding member from organization',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message || error,
      };
    }
  }

  @Patch('/{id}')
  public async updateOrganization(id: string, @Body() updateData: PartialOrganizationData): Promise<OrganizationResponse> {
    try {
      const organizationId = Long.fromString(id);
      if (!organizationId) return { error: true, message: 'Organization Id is required!', statusCode: HttpStatusCode.BadRequest };

      const { OrganizationName, Logo, Status, Location } = updateData;

      const updateObj: Partial<IOrganization> = {
        ...(OrganizationName && { OrganizationName }),
        ...(Logo && { Logo }),
        ...(Status && { Status }),
        ...(Location && { Location }),
        ModifiedDate: Date.now(),
      };

      const findOrg = await AdminDB.Organization.findOneAndUpdate({ OrganizationId: organizationId }, updateObj);
      if (findOrg) {
        return { error: false, message: 'Organization Updated Successfully', statusCode: HttpStatusCode.Ok };
      } else {
        return { error: true, message: 'Unable to identify Organization by Provided Id', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Organization',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{id}/activate')
  public async updateStatusActive(id: string): Promise<OrganizationResponse> {
    return this.updateStatus(id, OrganizationStatus.Active);
  }

  @Patch('/{id}/deactivate')
  public async updateStatusInactive(id: string): Promise<OrganizationResponse> {
    return this.updateStatus(id, OrganizationStatus.Inactive);
  }

  private async updateStatus(id: string, status: OrganizationStatus): Promise<OrganizationResponse> {
    try {
      const organizationId = Long.fromString(id);
      if (!organizationId) return { error: true, message: 'Organization Id is required!', statusCode: HttpStatusCode.BadRequest };
      if (!status && Utils.ValueIsInEnum(status, OrganizationStatus)) {
        return { error: true, message: 'Status is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const updateObj: Partial<IOrganization> = {
        Status: status,
        ModifiedDate: Date.now(),
      };

      const findOrg = await AdminDB.Organization.findOneAndUpdate({ OrganizationId: organizationId }, updateObj);
      if (findOrg) {
        return { error: false, message: 'Organization Updated Successfully', statusCode: HttpStatusCode.Ok };
      } else {
        return { error: true, message: 'Unable to identify Organization by Provided Id', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Organization',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{id}')
  public async removeOrganization(id: string): Promise<OrganizationResponse> {
    try {
      const organizationId = Long.fromString(id);
      if (!organizationId) return { error: true, message: 'Organization Id is required!', statusCode: HttpStatusCode.BadRequest };

      const updateObj: Partial<IOrganization> = {
        Status: OrganizationStatus.Deleted,
        ModifiedDate: Date.now(),
      };

      const findOrg = await AdminDB.Organization.findOneAndUpdate({ OrganizationId: organizationId }, updateObj);
      if (findOrg) {
        return { error: false, message: 'Organization Deleted Successfully', statusCode: HttpStatusCode.Ok };
      } else {
        return { error: true, message: 'Unable to identify Organization by Provided Id', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Deleteing Organization',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
}
