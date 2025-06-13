import Express from 'express';
import { Route, Tags, Get, Security, Body, Post, Inject, Delete, Patch, Request } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { IChatGroup, IGroupStatus, IJoinGroupRequestData, IGroupData, IMemberGroupData } from '../interfaces/chatgroup.interfaces';
import { HttpStatusCode } from 'axios';
import { JWTUserData } from '../interfaces/auth.interfaces';
import ChatMemberController from './chatmember.controller';
import BinaryUtils from '../utils/binary.utils';
import { IMemberGroupChannel, IChatMembers, IMemberStatus } from '../interfaces/chatmembers.interfaces';
import { ChatDB } from '../database/connectors/chatdb.connector';
import StoreConnector from '../services/connectors/store.connector';
import { IChatImportGroups } from '../interfaces/chatimportgroups.interfaces';
import { Binary } from 'bson';
import { StoreDataHeader } from '../interfaces/store.connector.interfaces';

type GetGroupResponse = ApiResponse<IGroupData | IGroupData[] | null>;

type GetChatGroupResponse = ApiResponse<Partial<IMemberGroupData>[] | null>;

type JoinGroupResponse = ApiResponse<Partial<IChatMembers>>;

type InsertChatGroupResponse = ApiResponse<any>;

type DeleteChatGroupResponse = ApiResponse<null>;

@Route('chatgroups')
@Tags('Chat Group')
@Security('bearerAuth')
export default class ChatGroupController {
  @Get('/groups')
  public async getGroups(@Inject() currentUser: JWTUserData): Promise<GetGroupResponse> {
    try {
      if (!currentUser.MEMBERID) {
        return {
          error: true,
          message: 'Member ID is required!',
          statusCode: HttpStatusCode.BadRequest,
        };
      }

      const chatGroups = await ChatDB.ChatGroup.find({ Status: IGroupStatus.ACTIVE }).lean<IChatGroup[]>();
      const chatGroupIds = chatGroups.map((cg) => cg.ChatGroupId);

      const parentGroupMapping = await ChatDB.ChatMember.find({
        MemberId: currentUser.MEMBERID,
        ChatGroupId: { $in: chatGroupIds },
        Status: IMemberStatus.ACTIVE,
      }).lean<IChatMembers[]>();

      if (chatGroups?.length > 0) {
        const groups = chatGroups.map((group) => {
          const parentMapping = parentGroupMapping
            .filter((pgMapping) => pgMapping.ChatGroupId === group.ChatGroupId?.toString())
            .map((pgMapping) => pgMapping.ParentId);

          return {
            GroupId: group.ChatGroupId as string,
            GroupName: group.GroupName,
            Description: group.Description,
            ParentMapping: parentMapping,
            Activities: group.Activities,
            Members: group.Members?.map((m) => m.MemberId as string),
            CreatedDate: group.CreatedDate,
            GroupIcon: group.GroupIcon,
          };
        });
        return {
          error: false,
          message: 'Chat Groups fetched successfully!',
          statusCode: HttpStatusCode.Ok,
          data: groups,
        };
      }

      return {
        error: true,
        message: 'No Chat Groups found for the provided Member ID.',
        statusCode: HttpStatusCode.NotFound,
        data: [],
      };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: msg,
        statusCode: HttpStatusCode.InternalServerError,
        data: error?.message ? error.message : error,
      };
    }
  }
  @Get('/groups/:groupId')
  public async getGroupById(@Inject() currentUser: JWTUserData, groupId: string): Promise<GetGroupResponse> {
    try {
      if (!currentUser.MEMBERID) {
        return {
          error: true,
          message: 'Member ID is required!',
          statusCode: HttpStatusCode.BadRequest,
        };
      }
      const groupUuidBinary = BinaryUtils.convertUuidToBinary(groupId);

      const chatGroup = await ChatDB.ChatGroup.findOne({
        ChatGroupId: groupUuidBinary,
        // "Members.MemberId": currentUser.MEMBERID,
        Status: IGroupStatus.ACTIVE,
      }).lean<IChatGroup>();

      if (chatGroup) {
        const groups = {
          GroupId: chatGroup.ChatGroupId as string,
          GroupName: chatGroup.GroupName,
          Description: chatGroup.Description,
          Activities: chatGroup.Activities,
          Members: chatGroup.Members?.map((m) => m.MemberId as string),
          CreatedDate: chatGroup.CreatedDate,
          GroupIcon: chatGroup.GroupIcon,
        };

        return {
          error: false,
          message: 'Chat Groups fetched successfully!',
          statusCode: HttpStatusCode.Ok,
          data: groups,
        };
      }

      return {
        error: true,
        message: 'No Chat Group found.',
        statusCode: HttpStatusCode.NotFound,
        data: null,
      };
    } catch (error: any) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: msg,
        statusCode: HttpStatusCode.InternalServerError,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/')
  public async getChatGroups(@Request() req: Express.Request, @Inject() currentUser: JWTUserData): Promise<GetChatGroupResponse> {
    try {
      if (!currentUser.MEMBERID) {
        return {
          error: true,
          message: 'Member ID is required!',
          statusCode: HttpStatusCode.BadRequest,
        };
      }

      const groupMembrMapping = await ChatDB.ChatMember.find({ MemberId: currentUser.MEMBERID, Status: IGroupStatus.ACTIVE }).lean<IChatMembers[]>();
      const respData: Partial<IMemberGroupData>[] = [];
      if (groupMembrMapping.length > 0) {
        const groupIdList: Binary[] = [];
        const parentGroupIdList: Binary[] = [];
        groupMembrMapping.forEach(async (gm) => {
          const groupUuidBinary = BinaryUtils.convertUuidToBinary(gm.ChatGroupId as string);
          groupIdList.push(groupUuidBinary);
          parentGroupIdList.push(gm.ParentGroupId as Binary);
        });
        const chatGroups = await ChatDB.ChatGroup.find({ ChatGroupId: { $in: groupIdList } }).lean<IChatGroup[]>();
        const parentGroupMappingList = await ChatDB.ChatImportGroups.find({ ParentGroupId: { $in: parentGroupIdList } }).lean<IChatImportGroups[]>();

        groupMembrMapping.forEach((gmMapping) => {
          const group = chatGroups.find((g) => g.ChatGroupId?.toString() === gmMapping.ChatGroupId.toString()) as IChatGroup;
          const parentGroupMapping = parentGroupMappingList.find(
            (g) => g.ParentGroupId?.toString() === gmMapping.ParentGroupId.toString()
          ) as IChatImportGroups;

          if (group) {
            const groupData: Partial<IMemberGroupData> = {
              ParentGroupId: gmMapping?.ParentGroupId?.toString(),
              ParentId: gmMapping.ParentId,
              ParentName: gmMapping.ParentName,
              ChatGroupId: group.ChatGroupId.toString(),
              GroupName: group.GroupName,
              Description: group.Description,
              Activities: group.Activities,
              Members: group.Members,
              Status: gmMapping.Status,
              CreatedDate: group.CreatedDate,
              ModifiedDate: group.ModifiedDate,
              Pin: gmMapping.Pin,
              Snooze: gmMapping.Snooze,
              Beep: gmMapping.Beep,
              Mute: gmMapping.Mute,
              Channels: parentGroupMapping?.Channels,
              GroupIcon: parentGroupMapping?.GroupIcon,
              JoinedDate: gmMapping.JoinedDate,
              LastReadMessageAt: gmMapping.LastReadMessageAt ? gmMapping.LastReadMessageAt : 0,
            };

            respData.push(groupData);
          }
        });
      }

      if (respData?.length > 0) {
        return {
          error: false,
          message: 'Chat Groups fetched successfully!',
          statusCode: HttpStatusCode.Ok,
          data: respData,
        };
      }

      return {
        error: false,
        message: 'No Chat Groups found.',
        statusCode: HttpStatusCode.Ok,
        data: respData,
      };
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return {
        error: true,
        message: msg,
        statusCode: HttpStatusCode.InternalServerError,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/')
  public async insertChatGroup(@Body() insertData: IChatGroup, @Inject() currentUser: JWTUserData): Promise<InsertChatGroupResponse> {
    try {
      const insertObj: Omit<IChatGroup, 'ChatGroupId'> = {
        GroupName: insertData.GroupName,
        Activities: insertData.Activities,
        Description: insertData.Description,
        Members: insertData.Members,
        GroupIcon: insertData.GroupIcon,
        CreatedDate: Date.now(),
        ModifiedDate: Date.now(),
        CreatedMemberId: currentUser.MEMBERID,
        Status: IGroupStatus.ACTIVE,
      };
      const response: IChatGroup = await ChatDB.ChatGroup.create(insertObj);

      return { error: false, message: 'Chat Group created Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Chat Group',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Patch('/{id}')
  public async updateChatGroup(id: string, @Body() updateData: IChatGroup): Promise<InsertChatGroupResponse> {
    try {
      if (!id) return { error: true, message: 'Chat Group Id is required!', statusCode: HttpStatusCode.BadRequest };

      const { GroupName, Activities, Description, Members, GroupIcon } = updateData;

      const updateObj: Partial<IChatGroup> & { ModifiedDate: number } = {
        ...(GroupName && { GroupName }),
        ...(Activities && { Activities }),
        ...(Description && { Description }),
        ...(Members && { Members }),
        ...(GroupIcon && { GroupIcon }),
        ModifiedDate: Date.now(),
      };

      const binaryMemberId = BinaryUtils.convertUuidToBinary(id);
      const response = await ChatDB.ChatGroup.updateOne({ ChatGroupId: binaryMemberId }, updateObj);
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Chat Group',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{parentGroupId}')
  public async deleteChatGroup(parentGroupId: string, @Inject() currentUser: JWTUserData): Promise<DeleteChatGroupResponse> {
    try {
      if (!parentGroupId) return { error: true, message: 'Parent Group Id is required!', statusCode: HttpStatusCode.BadRequest };
      const binaryParentGroupId = BinaryUtils.convertUuidToBinary(parentGroupId);
      await ChatDB.ChatMember.updateOne({ ParentGroupId: binaryParentGroupId, MemberId: currentUser.MEMBERID }, { Status: IMemberStatus.DELETE });

      return { error: false, message: 'Group Deleted Successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Deleting Chat Group',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  public async getGroupsBasedonUser(memberId: string) {
    try {
      const response = await new ChatMemberController().getChatMembers(memberId);
      const groups = response.data ? response.data.map((a) => a.ChatGroupId) : [];
      return { error: false, message: 'Get Groups Successfully', statusCode: HttpStatusCode.Ok, data: groups };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Gettig Groups',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  async getChannels(token: string, channels: IMemberGroupChannel[], parentUrl: string) {
    const logdata = (await new StoreConnector(token).getNestedChild(undefined, parentUrl)).data || [];
    for (let i = 0; i < logdata.length; i++) {
      const channelSet: StoreDataHeader[] = (await new StoreConnector(token).getNestedChild(undefined, logdata[i].uri)).data || [];
      if (channelSet.length > 0) {
        const channelList: StoreDataHeader[] = (await new StoreConnector(token).getNestedChild(undefined, channelSet[0].uri)).data || [];
        if (channelList.length > 0) {
          for (const channel of channels) {
            if (logdata[i].name.toLowerCase() === channel.LogName.toLowerCase() && (!channel.ChannelId || !channel.ChannelUom)) {
              const channelData = channelList.find((c: any) => {
                return channel.ChannelId ? channel.ChannelId == c?.id : c.name.toLowerCase() === channel.ChannelName.toLowerCase();
              });
              if (channelData) {
                const channelDetails: any = (await new StoreConnector(token).getMetaData(channelData.uri)).data;

                if (channelDetails && (!channel.ChannelId || !channel.ChannelUom)) {
                  channel.ChannelId = channel.ChannelId ? channel.ChannelId : channelDetails.id;
                  channel.ChannelUom = channelDetails.attributes?.uom;
                }
              }
            }
          }
        }
      }
    }
    return channels;
  }

  @Post('/join')
  public async joinGroup(
    @Body() mappingData: IJoinGroupRequestData,
    @Inject() currentUser: JWTUserData,
    @Inject() token: string
  ): Promise<JoinGroupResponse> {
    try {
      const parentGroupMapping = await ChatDB.ChatImportGroups.findOne({
        ChatGroupId: mappingData.GroupId,
        ParentId: mappingData.ParentId,
      }).lean<IChatImportGroups>();
      const existingMapping = await ChatDB.ChatMember.findOne({
        ChatGroupId: mappingData.GroupId,
        ParentId: mappingData.ParentId,
        MemberId: currentUser.MEMBERID,
      }).lean<IChatMembers>();

      // Get the channels to stream the curve data.
      const channels = await this.getChannels(token, mappingData.Channels, mappingData.ParentUrl);

      if (existingMapping) {
        if (existingMapping.Status === IMemberStatus.DELETE || existingMapping.Status === IMemberStatus.INACTIVE) {
          await ChatDB.ChatImportGroups.updateOne(
            { ParentGroupId: existingMapping.ParentGroupId },
            { Channels: channels, Activity: mappingData.Activity }
          );
          await ChatDB.ChatMember.updateOne(
            { ParentGroupId: existingMapping.ParentGroupId, MemberId: currentUser.MEMBERID },
            { Status: IMemberStatus.ACTIVE }
          );

          existingMapping.Status = IMemberStatus.ACTIVE;
          return { error: false, message: 'Jointed Group Successfully.', statusCode: HttpStatusCode.Ok, data: existingMapping };
        }
        return { error: false, message: 'Already a member of the Group.', statusCode: HttpStatusCode.Ok, data: existingMapping };
      } else {
        let parentGroupId;
        // Check if Parent and Group Mapping is available. if available, use the same ParentGroupId. Otherwise generate a new id.
        if (parentGroupMapping) {
          parentGroupId = parentGroupMapping.ParentGroupId;
          await ChatDB.ChatImportGroups.findOneAndUpdate(
            { ParentGroupId: parentGroupId },
            { $set: { Channels: channels, Activity: mappingData.Activity } },
            { new: true }
          ).lean();
        } else {
          parentGroupId = BinaryUtils.convertUuidToBinary();
          const newParentGroupMapping = new ChatDB.ChatImportGroups({
            ParentGroupId: parentGroupId,
            ChatGroupId: mappingData.GroupId,
            ParentId: mappingData.ParentId,
            ParentName: mappingData.ParentName,
            ParentUrl: mappingData.ParentUrl,
            Channels: channels,
            Activity: mappingData.Activity,
          });
          newParentGroupMapping.save();
        }

        const newGroupMemberMapping = new ChatDB.ChatMember({
          ParentGroupId: parentGroupId,
          ChatGroupId: mappingData.GroupId,
          MemberId: currentUser.MEMBERID,
          ParentId: mappingData.ParentId,
          ParentName: mappingData.ParentName,
          ParentUrl: mappingData.ParentUrl,
          JoinedDate: Date.now(),
          Status: IGroupStatus.ACTIVE,
          Beep: true,
        });

        const response = await newGroupMemberMapping.save();
        return { error: false, message: 'Joined Group Successfully.', statusCode: HttpStatusCode.Ok, data: response };
      }
    } catch (error) {
      return {
        error: true,
        message: 'Error While Joining Group',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
}
