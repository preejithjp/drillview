import { Router } from 'express';
import { APIUtils } from '../utils/api.utils';
import FileUploadController from '../controllers/fileupload.controller';
import { upload } from '../handlers/fileupload.handler';

export default function FileUploadRoutes(router: Router) {
  const fileUploadController = new FileUploadController();

  router.post('/file/:id', upload.single('file'), async (req, res, next) => {
    try {
      const data = await fileUploadController.uploadFile(req.file);
      APIUtils.ResponseGenerator(res, data);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/file/:filePath', async (req, res) => {
    const filePath = decodeURIComponent(req.params.filePath);
    const data = await fileUploadController.deleteFile(filePath);
    APIUtils.ResponseGenerator(res, data);
  });
}
