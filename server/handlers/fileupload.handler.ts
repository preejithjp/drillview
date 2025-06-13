import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Trace from '../controllers/trace.controller';
import { AllowIconType } from '../../server/interfaces/dashboard.interfaces';

export const FileUpload = {
  UPLOAD_DIRECTORY: path.join('public', 'uploads'),
  CHAT_DIRECTORY: 'chat',
  ICON_DIRECTORY: 'dashboardicon',
  IMAGE_TEMPLATE_DIRECTORY: 'imagetemplates',
};

export const allowedFileTypes = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'video/mp4'];

const storage = multer.diskStorage({
  destination: async function (req: any, file, cb) {
    try {
      const uploadTarget = req?.params.id;
      let uploadDir = '';

      if (uploadTarget === FileUpload.ICON_DIRECTORY) {
        uploadDir = path.join(FileUpload.UPLOAD_DIRECTORY, FileUpload.ICON_DIRECTORY);
      } else if (uploadTarget === FileUpload.IMAGE_TEMPLATE_DIRECTORY) {
        uploadDir = path.join(FileUpload.UPLOAD_DIRECTORY, FileUpload.IMAGE_TEMPLATE_DIRECTORY);
      } else {
        uploadDir = path.join(FileUpload.UPLOAD_DIRECTORY, FileUpload.CHAT_DIRECTORY, uploadTarget);
      }

      await fs.promises.mkdir(uploadDir, { recursive: true });
      Trace.Info(`Directory ${uploadDir} created successfully`);
      cb(null, uploadDir);
    } catch (error) {
      Trace.Error(`Error creating directory: ${error.message}`);
      cb(new Error('Failed to create upload directory'), '');
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb: any) => {
    let allowTypes = allowedFileTypes;
    if (req.params.id == FileUpload.ICON_DIRECTORY) {
      allowTypes = AllowIconType;
    }
    if (!allowTypes.includes(file.mimetype)) {
      Trace.Error(`Invalid file type: ${file.mimetype}`);
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
      error.message = 'Invalid file type';
      return cb(error, false);
    }
    cb(null, true);
  },
});
