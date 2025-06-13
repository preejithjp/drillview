import { Router } from 'express';
import { APIUtils } from '../utils/api.utils';
import ChatMemberController from '../controllers/chatmember.controller';

export default function ChatMemberRoutes(router: Router) {
  const chatMemberController = new ChatMemberController();

  router.patch('/chatmembers/:id', async (req, res) => {
    const data = await chatMemberController.updateMemberGroup(req.params.id, res.locals.user, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/chatmembers/chatimportgroups/:chatGroupId/:parentId', async (req, res) => {
    const data = await chatMemberController.getChatImportGroups(req.params.chatGroupId, req.params.parentId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/chatmembers/:id', async (req, res) => {
    const data = await chatMemberController.deleteGroupMemberByIds(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });
}
