import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { IGroupStatus } from '../interfaces/chatgroup.interfaces';
import { IChatMembers, IMemberStatus, IChatGroupSettings } from '../interfaces/chatmembers.interfaces';
import { Body, Get, Inject, Patch } from 'tsoa';
import { JWTUserData } from '../interfaces/auth.interfaces';
import { Delete, Route, Security, Tags } from 'tsoa';
import { ChatDB } from '../database/connectors/chatdb.connector';
import BinaryUtils from '../utils/binary.utils';
import { IChatImportGroups } from '../interfaces/chatimportgroups.interfaces';

type GetChatMemberResponse = ApiResponse<IChatMembers[] | null>;

type GetChatImportGroupsResponse = ApiResponse<IChatImportGroups | null>;

type InsertChatMemberResponse = ApiResponse<any>;

type DeleteChatMemberResponse = ApiResponse<null>;

type MemberGroupResponse = ApiResponse<IChatMembers | IChatImportGroups | null>;

type SaveMessageIdResponse = ApiResponse<any>;

@Route('chatmembers')
@Tags('Chat Members')
@Security('bearerAuth')
export default class ChatMemberController {
  public async getChatMembers(memberId: string): Promise<GetChatMemberResponse> {
    try {
      if (!memberId) return { error: true, message: 'MemberId Id is required!', statusCode: HttpStatusCode.BadRequest };

      const members = await ChatDB.ChatMember.find({ MemberId: memberId, Status: IGroupStatus.ACTIVE }).lean<IChatMembers[]>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: members };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Obtaining Member Details', statusCode: HttpStatusCode.BadRequest };
    }
  }

  public async getChatMemberByGroupId(chatGroupId: string): Promise<GetChatMemberResponse> {
    try {
      if (!chatGroupId) return { error: true, message: 'Chat Group Id is required!', statusCode: HttpStatusCode.BadRequest };
      const members = await ChatDB.ChatMember.find({ ChatGroupId: chatGroupId, Status: IGroupStatus.ACTIVE }).lean<IChatMembers[]>();
      if (members) {
        return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: members };
      } else {
        return { error: true, message: 'Unable to identify Chat Member by Provided Id', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Obtaining Chat Member Details', statusCode: HttpStatusCode.BadRequest };
    }
  }

  public async upsertManyMembers(groupId: string, memberData: Omit<IChatMembers, 'ExitDate'>[]): Promise<InsertChatMemberResponse> {
    try {
      const bulkOperations = memberData.map((data) => ({
        updateOne: {
          filter: { MemberId: data.MemberId, ChatGroupId: groupId },
          update: {
            $set: {
              MemberId: data.MemberId,
              ChatGroupId: groupId,
              JoinedDate: Date.now(),
              Status: IGroupStatus.ACTIVE,
            },
          },
          upsert: true,
        },
      }));

      const response = await ChatDB.ChatMember.bulkWrite(bulkOperations);

      return { error: false, message: 'Chat Member(s) Inserted Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Chat Member',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{memberIds}')
  public async deleteGroupMemberByIds(memberIds: string): Promise<DeleteChatMemberResponse> {
    try {
      const memberIdList = memberIds.split(',');
      if (!memberIdList?.length) return { error: true, message: 'Chat Member Id is required!', statusCode: HttpStatusCode.BadRequest };
      await ChatDB.ChatMember.updateMany({ MemberId: { $in: memberIdList } }, { $set: { Status: IMemberStatus.DELETE, ExitDate: Date.now() } });
      return { error: false, message: 'Chat Member Successfully Deleted!', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Deleting Chat Member', statusCode: HttpStatusCode.BadRequest };
    }
  }
  @Get('/chatimportgroups/{chatGroupId}/{parentId}')
  public async getChatImportGroups(chatGroupId: string, parentId: string): Promise<GetChatImportGroupsResponse> {
    try {
      const chatImportGroups = await ChatDB.ChatImportGroups.findOne({ ChatGroupId: chatGroupId, ParentId: parentId }).lean<IChatImportGroups>();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: chatImportGroups };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Obtaining Chat Import Groups', statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Patch('/{id}')
  public async updateMemberGroup(
    id: string,
    @Inject() currentUser: JWTUserData,
    @Body() updateData: IChatMembers & IChatImportGroups
  ): Promise<MemberGroupResponse> {
    try {
      if (!id && !currentUser.MEMBERID) {
        return { error: true, message: 'ParentGroupId & Member Id is required!', statusCode: HttpStatusCode.BadRequest };
      }
      let response;
      const { Pin, Snooze, Mute, Beep, GroupIcon, LastReadMessageAt } = updateData;
      if (Pin != undefined || Snooze != undefined || Mute != undefined || Beep != undefined || LastReadMessageAt != undefined) {
        const updateObj: IChatGroupSettings = {
          ...(Pin !== undefined && { Pin }),
          ...(Snooze !== undefined && { Snooze }),
          ...(Mute !== undefined && { Mute }),
          ...(Beep !== undefined && { Beep }),
          ...(LastReadMessageAt !== undefined && { LastReadMessageAt }),
        };
        const parentGroupIdBinary = BinaryUtils.convertUuidToBinary(id);
        response = await ChatDB.ChatMember.findOneAndUpdate(
          { ParentGroupId: parentGroupIdBinary, MemberId: currentUser.MEMBERID },
          { $set: updateObj },
          { new: true }
        ).lean();
      } else if (GroupIcon) {
        const updateObj: Partial<IChatImportGroups> = {
          ...(GroupIcon !== undefined && { GroupIcon }),
        };
        const parentGroupIdBinary = BinaryUtils.convertUuidToBinary(id);
        response = await ChatDB.ChatImportGroups.findOneAndUpdate({ ParentGroupId: parentGroupIdBinary }, { $set: updateObj }, { new: true }).lean();
      }

      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Member',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  public async saveMessageId(chatGroupId: string, memberId: string, messageId: string): Promise<SaveMessageIdResponse> {
    try {
      if (!chatGroupId && !memberId && !messageId)
        return { error: true, message: 'ChatGroup, Message & Member Id is required!', statusCode: HttpStatusCode.BadRequest };

      const response = await ChatDB.ChatMember.updateMany(
        { ChatGroupId: chatGroupId, MemberId: { $ne: memberId } },
        { $push: { MessageIds: messageId } },
        { new: true }
      );

      return { error: false, message: 'Message Id Updated Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Updating Message Id',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
}
