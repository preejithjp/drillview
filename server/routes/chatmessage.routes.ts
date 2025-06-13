import { Router } from 'express';
import { APIUtils } from '../utils/api.utils';
import ChatMessageController from '../controllers/chatmessage.controller';

export default function ChatMessageRoutes(router: Router) {
  const chatMessageController = new ChatMessageController();

  router.get('/chatmessage/', async (req, res) => {
    const { limit } = req.query;
    const data = await chatMessageController.getAllMessages(Number(limit), res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/chatmessage/:groupId/:ParentId', async (req, res) => {
    const { skip, limit, search } = req.query;
    const data = await chatMessageController.getMessagesByGroup(
      req.params.groupId,
      req.params.ParentId,
      Number(skip),
      Number(limit),
      search as string
    );
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/chatmessage/:parentGroupId/:messageId', async (req, res) => {
    const data = await chatMessageController.updateChatMessage(req.body, req.params.parentGroupId, req.params.messageId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });
}
