import { Route, Tags, Get, Body, Delete, Patch, Security, Inject, Post, Query } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { IMember, IMemberBase, IMemberType } from '../interfaces/member.interfaces';
import { HttpStatusCode } from 'axios';
import BinaryUtils from '../utils/binary.utils';
import EncryptionUtils from '../utils/encryption.utils';
import { JWTUserData } from '../interfaces/auth.interfaces';
import { AdminDB } from '../database/connectors/admindb.connector';
import { IConnection } from '../interfaces/connections.interfaces';
import { UserStatus } from '../interfaces/websocket.interfaces';
import { ChatDB } from '../database/connectors/chatdb.connector';
import { IOrganization } from '../interfaces/organization.interfaces';
import { checkMemberStatus } from '../services/websocket.dbservice';

export type InsertMemberResponse = ApiResponse<any>;
export type GetMemberResponse = ApiResponse<IMember[] | null>;
type DeleteMemberResponse = ApiResponse<null>;
interface IPassword {
  Password: string;
}

@Route('members')
@Tags('Member')
@Security('bearerAuth')
export default class MemberController {
  @Get('/')
  public async getAllMembers(@Query() search?: string): Promise<GetMemberResponse> {
    try {
      let queryfilter = {};
      if (search) {
        queryfilter = {
          $or: [{ Email: { $regex: new RegExp(`^${search}`, 'i') } }, { Name: { $regex: new RegExp(`^${search}`, 'i') } }],
        };
      }
      const members: IMember[] = await AdminDB.Member.find(queryfilter).lean<IMember[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: members };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Obtaining Member Details', statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Post('/byId')
  public async getMembers(@Body() memberIds: string[]): Promise<ApiResponse<IMemberType[]>> {
    try {
      if (!memberIds.length) {
        return { error: true, message: "Member Id's is required!", statusCode: HttpStatusCode.BadRequest };
      }

      const binaryIds = BinaryUtils.convertArrayOfUuidsToBinary(memberIds);

      const memberList = await AdminDB.Member.find({ MemberId: { $in: binaryIds } }).lean<IMember[]>();

      const organizationList = await AdminDB.Organization.find({}).sort({ CreatedDate: -1 }).lean<IOrganization[]>();

      const connections = await ChatDB.Connections.find({ MemberId: { $in: memberIds } }).lean<IConnection[]>();

      const responseData: IMemberType[] = await Promise.all(
        memberList.map(async (member) => {
          const status = await checkMemberStatus(member.MemberId?.toString() as string, connections);
          const organization = organizationList.find((o) => o.OrganizationId === member.OrganisationId);
          return {
            MemberId: member.MemberId as string,
            OrganisationId: member.OrganisationId,
            OrganisationName: organization ? organization.OrganizationName : '',
            Name: member.Name,
            Email: member.Email,
            Description: member.Description,
            CreatedDate: member.CreatedDate,
            Role: member.Role as string,
            OnlineStatus: status ? status : UserStatus.OFFLINE,
            Image: member.Image,
          };
        })
      );
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: responseData };
    } catch (error) {
      const errorMsg = `${error?.codeName || 'Error'}: ${error?.errmsg || error.message}`;
      return { error: true, message: errorMsg, statusCode: HttpStatusCode.InternalServerError };
    }
  }

  @Get('/{memberId}')
  public async getMemberById(memberId: string): Promise<GetMemberResponse> {
    try {
      if (!memberId) {
        return {
          error: true,
          message: 'MemberId is required!',
          statusCode: HttpStatusCode.BadRequest,
        };
      }

      const binaryMemberId = BinaryUtils.convertUuidToBinary(memberId);
      const member = await AdminDB.Member.findOne({ MemberId: binaryMemberId }).lean<IMember>();

      if (member) {
        return {
          error: false,
          message: '',
          statusCode: HttpStatusCode.Ok,
          data: [member],
        };
      } else {
        return {
          error: true,
          message: 'Unable to identify Member by provided MemberId',
          statusCode: HttpStatusCode.NotFound,
        };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Obtaining Member Details',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message || error,
      };
    }
  }

  @Patch('/{id}')
  public async updateMember(id: string, @Body() updateData: Partial<IMemberBase>): Promise<InsertMemberResponse> {
    try {
      if (!id) return { error: true, message: 'Member Id is required!', statusCode: HttpStatusCode.BadRequest };
      const allowedFields: Array<keyof IMemberBase> = ['Email', 'Name', 'Description', 'Enabled', 'Role', 'Image'];

      const filteredData: Partial<IMemberBase> = allowedFields.reduce((obj, key) => {
        if (key in updateData && updateData[key] !== undefined) {
          (obj[key] as (typeof updateData)[typeof key]) = updateData[key];
        }
        return obj;
      }, {} as Partial<IMemberBase>);
      const uuidBinary = BinaryUtils.convertUuidToBinary(id);
      const response = await AdminDB.Member.updateOne({ MemberId: uuidBinary }, filteredData);
      if (!response) {
        return {
          error: true,
          message: `No member found with MemberId: ${id}`,
          statusCode: HttpStatusCode.BadRequest,
        };
      }

      return { error: false, message: 'Member Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Member',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{id}/change-password')
  public async changePassword(id: string, @Body() updateData: IPassword, @Inject() currentUser?: JWTUserData): Promise<InsertMemberResponse> {
    try {
      if (!id) return { error: true, message: 'Member Id is required!', statusCode: HttpStatusCode.BadRequest };
      if (id != currentUser?.MEMBERID) return { error: true, message: 'Member Id is not valid!', statusCode: HttpStatusCode.BadRequest };
      if (updateData) {
        const createPasswordKey = EncryptionUtils.createSalt();
        const createPasswordValue = EncryptionUtils.encrypt(updateData.Password, createPasswordKey);
        const updateObj: Partial<IMemberBase> = {
          PasswordKey: createPasswordKey,
          PasswordValue: createPasswordValue,
        };
        const uuidBinary = BinaryUtils.convertUuidToBinary(id);
        const response = await AdminDB.Member.updateOne({ MemberId: uuidBinary }, updateObj);
        if (!response) {
          return {
            error: true,
            message: `No member found with MemberId: ${id}`,
            statusCode: HttpStatusCode.BadRequest,
          };
        }
        return { error: false, message: 'Password Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
      }
      return { error: true, message: 'Password is required!', statusCode: HttpStatusCode.BadRequest };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Password',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{id}')
  public async deleteMemberById(id: string): Promise<DeleteMemberResponse> {
    try {
      if (!id) return { error: true, message: 'Member Id is required!', statusCode: HttpStatusCode.BadRequest };
      const uuidBinary = BinaryUtils.convertUuidToBinary(id);
      await AdminDB.Member.deleteOne({ MemberId: uuidBinary });
      return { error: false, message: 'Member Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Member', statusCode: HttpStatusCode.BadRequest };
    }
  }
}
