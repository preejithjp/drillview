import { Router } from 'express';
import ChatGroupController from '../controllers/chatgroup.controller';
import { APIUtils } from '../utils/api.utils';

export default function ChatGroupRoutes(router: Router) {
  const chatGroupController = new ChatGroupController();

  router.get('/chatgroups/groups', async (req, res) => {
    const data = await chatGroupController.getGroups(res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/chatgroups/groups/:groupId', async (req, res) => {
    const data = await chatGroupController.getGroupById(res.locals.user, req.params.groupId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/chatgroups', async (req, res) => {
    const data = await chatGroupController.getChatGroups(req, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/chatgroups/join', async (req, res) => {
    const data = await chatGroupController.joinGroup(req.body, res.locals.user, res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/chatgroups', async (req, res) => {
    const data = await chatGroupController.insertChatGroup(req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/chatgroups/:chatGroupId', async (req, res) => {
    const data = await chatGroupController.updateChatGroup(req.params.chatGroupId, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/chatgroups/:parentGroupId', async (req, res) => {
    const data = await chatGroupController.deleteChatGroup(req.params.parentGroupId, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });
}
