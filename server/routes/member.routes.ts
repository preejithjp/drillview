import { Router } from 'express';
import MemberController from '../controllers/member.controller';
import { APIUtils } from '../utils/api.utils';

export default function MemberRoutes(router: Router) {
  const memberController = new MemberController();

  router.get('/members', async (req, res) => {
    const data = await memberController.getAllMembers(req.query.search as string);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/members/:memberId', async (req, res) => {
    const data = await memberController.getMemberById(req.params.memberId);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/members/byId', async (req, res) => {
    const data = await memberController.getMembers(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/members/:memberId', async (req, res) => {
    const data = await memberController.updateMember(req.params.memberId, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/members/:memberId/change-password', async (req, res) => {
    const data = await memberController.changePassword(req.params.memberId, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/members/:memberId', async (req, res) => {
    const data = await memberController.deleteMemberById(req.params.memberId);
    APIUtils.ResponseGenerator(res, data);
  });
}
