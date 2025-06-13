import Trace from '../controllers/trace.controller';
import { IConnection } from '../interfaces/connections.interfaces';
import { UserStatus, WsClientPayload } from '../interfaces/websocket.interfaces';
import { IChatMessage } from '../interfaces/chatmessage.interfaces';
import { IChatGroup } from '../interfaces/chatgroup.interfaces';
import BinaryUtils from '../utils/binary.utils';
import { ChatDB } from '../database/connectors/chatdb.connector';
import { IChatMembers } from '../interfaces/chatmembers.interfaces';

export async function addClientConnection(connectionId: string, memberId: string, status: UserStatus) {
  try {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry to 1 hours from now

    const newConnection: IConnection = {
      ConnectionId: connectionId,
      MemberId: memberId,
      Status: status,
      CreatedDate: Date.now(),
      StatusChangeDate: Date.now(),
      ExpiryDate: expiryDate,
    };
    const connection = new ChatDB.Connections(newConnection);
    await connection.save();
  } catch (error) {
    Trace.Error('Error in addClientConnection', error.message);
    return null;
  }
}

export async function updateClientConnection(connectionId: string, memberId: string, status: UserStatus) {
  try {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry to 1 hours from now
    const connection: IConnection = {
      ConnectionId: connectionId,
      MemberId: memberId,
      Status: status,
      CreatedDate: Date.now(),
      StatusChangeDate: Date.now(),
      ExpiryDate: expiryDate,
    };
    const dbresp = await ChatDB.Connections.findOneAndUpdate({ MemberId: memberId, ConnectionId: connectionId }, connection, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    return dbresp;
  } catch (error) {
    Trace.Error('Error in updateClientConnection', error.message);
  }
}

export async function deleteClientConnection(connectionId: string, memberId: string) {
  try {
    const dbresp = await ChatDB.Connections.deleteOne({ MemberId: memberId, ConnectionId: connectionId });
    return dbresp;
  } catch (error) {
    Trace.Error('Error in deleteClientConnection', error.message);
  }
}

export async function saveChatMessage(memberId: string, message: WsClientPayload): Promise<IChatMessage | null> {
  try {
    const uuidBinary = BinaryUtils.convertUuidToBinary();
    const newChatMessage: IChatMessage = {
      ChatMessageId: uuidBinary,
      SenderId: BinaryUtils.convertUuidToBinary(memberId),
      Message: message.body.Message,
      ParentGroupId: BinaryUtils.convertUuidToBinary(message.body.ParentGroupId),
      ChatGroupId: BinaryUtils.convertUuidToBinary(message.body.ChatGroupId),
      ParentId: message.body.ParentId,
      MetaData: message.body.MetaData,
      PriorityLevel: message.body.PriorityLevel,
      Files: message.body.Files,
      CreatedDate: Date.now(),
    };
    const chatMessage = new ChatDB.ChatMessage(newChatMessage);
    const dbResp = await ChatDB.ChatMessage.create(chatMessage);
    return dbResp.toObject();
  } catch (error) {
    Trace.Error('Error in saveChatMessage', error.message);
    return null;
  }
}

export async function getAllMembersInGroup(groupId: string, parentId: string): Promise<string[] | null> {
  try {
    const members = await ChatDB.ChatMember.find({ ChatGroupId: groupId, ParentId: parentId }).lean<IChatMembers[]>();
    return members.map((m) => m.MemberId);
  } catch (error) {
    Trace.Error('Error in getMemberGroups', error.message);
    return null;
  }
}

export async function getChatGroups(groupId: string): Promise<IChatGroup | IChatGroup[] | null> {
  try {
    const groupUuidBinary = BinaryUtils.convertUuidToBinary(groupId);
    const queryfilter = { ChatGroupId: groupUuidBinary };
    const chatGroups = await ChatDB.ChatGroup.find(queryfilter).lean<IChatGroup[]>();
    if (chatGroups.length == 1) {
      return chatGroups[0];
    }
    return chatGroups;
  } catch (error) {
    Trace.Error('Error in getChatGroups', error.message);
    return null;
  }
}

export async function getParentGroupsMapping(groupId: string, parentId: string, memberId: string): Promise<IChatMembers | IChatMembers[] | null> {
  try {
    const queryfilter = { ChatGroupId: groupId, ParentId: parentId, MemberId: memberId };
    const parentGroupMapping = await ChatDB.ChatMember.find(queryfilter).lean<IChatMembers[]>();
    if (parentGroupMapping.length == 1) {
      return parentGroupMapping[0];
    }
    return parentGroupMapping;
  } catch (error) {
    Trace.Error('Error in getChatGroups', error.message);
    return null;
  }
}

export async function checkMemberStatus(memberId: string, connections?: IConnection[]): Promise<UserStatus | null> {
  try {
    let connectionList = [];
    if (connections && connections.length > 0) {
      connectionList = connections.filter((c) => c.MemberId === memberId);
    } else {
      connectionList = await ChatDB.Connections.find({ MemberId: memberId }).lean<IConnection[]>();
    }
    return connectionList.findIndex((c) => c.Status === UserStatus.ONLINE) === -1 ? UserStatus.OFFLINE : UserStatus.ONLINE;
  } catch (error) {
    Trace.Error('Error in checkMemberStatus', error.message);
    return null;
  }
}
