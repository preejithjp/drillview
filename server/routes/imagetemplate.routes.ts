import { Router } from 'express';
import ImageTemplateController from '../controllers/imagetemplate.controller';
import { APIUtils } from '../utils/api.utils';
import { upload } from '../handlers/fileupload.handler';

export default function ImageTemplateRoutes(router: Router) {
  const controller = new ImageTemplateController();

  router.get('/imagetemplates', async (req, res) => {
    const data = await controller.getAllTemplates();
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/imagetemplates/:id', async (req, res) => {
    const data = await controller.getTemplateById(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/imagetemplates', async (req, res) => {
    const data = await controller.createTemplate(req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/imagetemplates/:id', async (req, res) => {
    const data = await controller.updateTemplate(req.params.id, req.body);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/imagetemplates/:id', async (req, res) => {
    const data = await controller.deleteTemplate(req.params.id);
    APIUtils.ResponseGenerator(res, data);
  });

  router.post('/imagetemplates/upload/:id', upload.single('file'), async (req, res, next) => {
    try {
      const data = await controller.uploadImage(req.file);
      APIUtils.ResponseGenerator(res, data);
    } catch (error) {
      next(error);
    }
  });
}
