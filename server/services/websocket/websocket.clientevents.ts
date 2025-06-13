import { ChatMessageDeliveryStatus, ExtendedWebSocket, NotificationSource, WsClientPayload } from '../../interfaces/websocket.interfaces';
import { saveChatMessage } from '../websocket.dbservice';
import { ChatDB } from '../../database/connectors/chatdb.connector';
import { IChatMembers } from '../../interfaces/chatmembers.interfaces';
import WebSocketServerEvents from './websocket.serverevents';
import WebSocketChatHelper from './websocket.chat.helper';
import { MessagePriority } from '../../interfaces/chatmessage.interfaces';

export default class WebSocketClientEvents {
  static async handleChatMessageEvent(ws: ExtendedWebSocket, message: WsClientPayload) {
    const saveChatResp = await saveChatMessage(ws.memberId, message);
    if (!saveChatResp) {
      WebSocketServerEvents.pushMessageDelivery(ws, message.header.corelationId as string, ChatMessageDeliveryStatus.NOT_RECEIVED);
      return;
    }

    // Get all the members of the Chat group
    const memberList = await ChatDB.ChatMember.find({ ChatGroupId: message.body.ChatGroupId, ParentId: message.body.ParentId }).lean<
      IChatMembers[]
    >();

    const groupMemberList = memberList ? memberList.map((m) => m.MemberId) : [];

    if (groupMemberList.length > 0) {
      WebSocketServerEvents.pushMessageTransmit(ws, groupMemberList, message.body.ParentGroupId, saveChatResp);

      // Send Notification only for High Priority messages.
      if (saveChatResp.PriorityLevel === MessagePriority.High) {
        // Send Notification only to Chat group Pinned members. Also exclude the sender of the message and Snoozed members.
        const notificationMembers = memberList.filter((m) => m.MemberId != ws.memberId && m.Pin && !m.Snooze);
        if (notificationMembers.length === 0) {
          return;
        }
        const { title, content, icon } = await WebSocketChatHelper.generateMessageNotification(saveChatResp);
        const data = { referenceId: message.body.ParentGroupId };
        notificationMembers.forEach((member) => {
          const options = {
            NotificationSound: member.Beep,
          };
          WebSocketServerEvents.pushNotification(ws, member.MemberId, NotificationSource.Chat, title, content, data, icon, options);
        });
      }
    }
  }
}
