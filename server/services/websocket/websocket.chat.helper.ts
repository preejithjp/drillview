import { AdminDB } from '../../database/connectors/admindb.connector';
import { ChatDB } from '../../database/connectors/chatdb.connector';
import { IChatGroup } from '../../interfaces/chatgroup.interfaces';
import { IChatImportGroups } from '../../interfaces/chatimportgroups.interfaces';
import { IChatMessage } from '../../interfaces/chatmessage.interfaces';
import { IMember } from '../../interfaces/member.interfaces';
import { NotificationContent } from '../../interfaces/websocket.interfaces';
import BinaryUtils from '../../utils/binary.utils';

export default class WebSocketChatHelper {
  static async generateMessageNotification(message: IChatMessage) {
    let title: string = '';
    let icon: string = '';
    const content: NotificationContent[] = [];
    const memberIdBinary = BinaryUtils.convertUuidToBinary(message.SenderId as string);

    const sender = await AdminDB.Member.findOne({ MemberId: memberIdBinary }).lean<IMember>();
    if (message.Message.length > 0) {
      content.push({ text: `${sender?.Name}: `, cssClass: 'fontBold' });
      content.push({ text: message.Message as string });
    }
    if (message.Files && message.Files.length > 0) {
      content.push({ text: `${sender?.Name} shared a file.`, cssClass: 'fontSemibold', breakLine: message.Message.length > 0 });
    }

    const groupIdBinary = BinaryUtils.convertUuidToBinary(message.ChatGroupId as string);
    const group = await ChatDB.ChatGroup.findOne({ ChatGroupId: groupIdBinary }).select('GroupName').lean<IChatGroup>();
    const chatImportGroup = await ChatDB.ChatImportGroups.findOne({
      ChatGroupId: message.ChatGroupId,
      ParentId: message.ParentId,
    })
      .select('ParentName')
      .lean<IChatImportGroups>();

    title = `${chatImportGroup?.ParentName} (${group?.GroupName})`;
    icon = chatImportGroup?.GroupIcon ? (chatImportGroup?.GroupIcon as string) : `${chatImportGroup?.ParentName}#$#${group?.GroupName}`;

    return { title, content, icon };
  }
}
