import { Body, Get, Route, Tags, Security, Patch, Inject, Query } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { IChatGroupMessageData, IChatMessage, IChatMessageBase, IReaction } from '../interfaces/chatmessage.interfaces';
import { Binary } from 'bson';
import ChatMemberController from './chatmember.controller';
import BinaryUtils from '../utils/binary.utils';
import { ChatDB } from '../database/connectors/chatdb.connector';
import { JWTUserData } from '../interfaces/auth.interfaces';
import { getAllMembersInGroup } from '../services/websocket.dbservice';
import { IGroupStatus } from '../interfaces/chatgroup.interfaces';
import { IChatMembers } from '../interfaces/chatmembers.interfaces';
import WebSocketServerEvents from '../services/websocket/websocket.serverevents';

interface IChatMessageFilter {
  ChatGroupId: Binary;
  ParentId: string;
  Message?: { $regex: string; $options: string };
}

interface IChatMessageData {
  data: IChatMessage[];
  totalRecords: number;
}

type InsertChatMessageResponse = ApiResponse<IChatMessageBase | null>;
type GetGroupMessageResponse = ApiResponse<IChatGroupMessageData | null>;
type GetMessageResponse = ApiResponse<IChatMessageData | null>;

@Route('chatmessage')
@Tags('Chat Message')
@Security('bearerAuth')
export default class ChatMessageController {
  @Get('/')
  public async getAllMessages(@Query() limit: number = 1000, @Inject() currentUser: JWTUserData): Promise<GetGroupMessageResponse> {
    try {
      const chatgroupMessages: IChatGroupMessageData = {};
      const groupMembrMapping = await ChatDB.ChatMember.find({ MemberId: currentUser.MEMBERID, Status: IGroupStatus.ACTIVE }).lean<IChatMembers[]>();

      for (const gmMapping of groupMembrMapping) {
        const groupUuidBinary = BinaryUtils.convertUuidToBinary(gmMapping.ChatGroupId as string);
        const filter: IChatMessageFilter = { ChatGroupId: groupUuidBinary, ParentId: gmMapping.ParentId };

        const chatMessages = await ChatDB.ChatMessage.find(filter).sort({ CreatedDate: -1 }).limit(limit).lean<IChatMessage[]>();
        const parentGroupId = BinaryUtils.convertBinaryToUuid(gmMapping.ParentGroupId as Binary);
        chatgroupMessages[parentGroupId] = chatMessages;
      }

      if (chatgroupMessages) {
        return {
          error: false,
          message: '',
          statusCode: HttpStatusCode.Ok,
          data: chatgroupMessages,
        };
      } else {
        return { error: true, message: 'No Chat Messages found!', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While calling getAllMessages.', statusCode: HttpStatusCode.BadRequest };
    }
  }

  @Get('/{groupId}/{parentId}')
  public async getMessagesByGroup(
    groupId: string,
    parentId: string,
    @Query() skip: number = 0,
    @Query() limit: number = 1000,
    @Query() search: string = ''
  ): Promise<GetMessageResponse> {
    try {
      if (!groupId) return { error: true, message: 'Group Id is required!', statusCode: HttpStatusCode.BadRequest };

      const uuidBinaryGroupId = BinaryUtils.convertUuidToBinary(groupId);

      const filter: IChatMessageFilter = { ChatGroupId: uuidBinaryGroupId, ParentId: parentId };

      if (search) {
        filter.Message = { $regex: search, $options: 'i' };
      }
      const chatMessages = await ChatDB.ChatMessage.find(filter)
        .sort({ CreatedDate: -1 }) // Sort by creation date
        .skip(skip)
        .limit(limit)
        .lean<IChatMessage[]>();

      // Get total count for pagination
      const totalRecords = await ChatDB.ChatMessage.countDocuments(filter);

      if (chatMessages) {
        return {
          error: false,
          message: '',
          statusCode: HttpStatusCode.Ok,
          data: {
            data: chatMessages,
            totalRecords,
          },
        };
      } else {
        return { error: true, message: 'Unable to identify Group by Provided Id', statusCode: HttpStatusCode.BadRequest };
      }
    } catch (error) {
      const msg = `${error?.codeName}: ${error?.errmsg}`;
      return { error: true, message: error?.codeName ? msg : 'Error While Obtaining Group Details', statusCode: HttpStatusCode.BadRequest };
    }
  }

  public async saveChatMessage(@Body() insertData: IChatMessageBase, memberId: string): Promise<InsertChatMessageResponse> {
    try {
      const { Message, ChatGroupId, PriorityLevel, MetaData, Files } = insertData;

      if (!Message && !Files?.length) return { error: true, message: 'Message is required!', statusCode: HttpStatusCode.BadRequest };
      if (!ChatGroupId) return { error: true, message: 'Group Id is required!', statusCode: HttpStatusCode.BadRequest };

      const insertObj: IChatMessageBase & { CreatedDate: number; SenderId: string } = {
        Message,
        ChatGroupId,
        ...(PriorityLevel && { PriorityLevel }),
        ...(MetaData && { MetaData }),
        ...(Files && { Files }),
        CreatedDate: Date.now(),
        SenderId: memberId,
      };
      const response = await ChatDB.ChatMessage.create(insertObj);

      if (response) {
        const messageId = BinaryUtils.convertBinaryToUuid(response.ChatMessageId as Binary);
        response.ChatMessageId = messageId;
        const chatMemberController = new ChatMemberController();
        await chatMemberController.saveMessageId(ChatGroupId as string, memberId, messageId);
      }

      return { error: false, message: 'Message Inserted Successfully', statusCode: HttpStatusCode.Ok, data: response };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Message',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
  @Patch('/{parentGroupId}/{messageId}')
  public async updateChatMessage(
    @Body() updateData: IReaction,
    parentGroupId: string,
    messageId: string,
    @Inject() currentUser: JWTUserData
  ): Promise<InsertChatMessageResponse> {
    try {
      const messageIdBinary = BinaryUtils.convertUuidToBinary(messageId);
      const chatMessage = await ChatDB.ChatMessage.findOne({ ChatMessageId: messageIdBinary }).lean();
      if (chatMessage) {
        const dataObj: IReaction = {
          MemberId: currentUser.MEMBERID,
          Emoji: updateData.Emoji,
          EmojiName: updateData.EmojiName,
          DateTime: Date.now(),
        };
        if (chatMessage.Reactions && chatMessage.Reactions.length > 0) {
          const index = chatMessage.Reactions.findIndex((r) => r.MemberId === currentUser.MEMBERID);
          if (index !== -1) {
            if (chatMessage.Reactions[index].EmojiName !== updateData.EmojiName) {
              // Update reaction if on emoji change
              chatMessage.Reactions[index] = dataObj;
            } else {
              // Remove reaction if emoji already exists
              chatMessage.Reactions.splice(index, 1);
            }
          } else {
            chatMessage.Reactions.push(dataObj);
          }
        } else {
          chatMessage.Reactions = [];
          chatMessage.Reactions.push(dataObj);
        }

        await ChatDB.ChatMessage.updateOne({ ChatMessageId: messageIdBinary }, { $set: { Reactions: chatMessage.Reactions } });

        chatMessage.ChatGroupId = chatMessage?.ChatGroupId as string;
        chatMessage.ParentId = chatMessage?.ParentId as string;
        const memberList = await getAllMembersInGroup(chatMessage.ChatGroupId, chatMessage.ParentId);
        if (memberList) {
          WebSocketServerEvents.pushMessageUpdate(currentUser.ORGANIZATIONID.toString(), memberList, parentGroupId, messageId, dataObj);
        }
      }
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data: null };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Adding Message',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
}
