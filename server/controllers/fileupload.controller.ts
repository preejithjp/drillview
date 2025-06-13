import path from 'path';
import fs from 'fs';
import { Route, Tags, Security, Delete, Post, UploadedFile } from 'tsoa';
import { ApiResponse } from '../interfaces/response.interfaces';
import { HttpStatusCode } from 'axios';
import { IFile } from '../interfaces/chatmessage.interfaces';
import { FileUpload } from '../handlers/fileupload.handler';

type FileUploadResponse = ApiResponse<IFile>;

type DeleteFileResponse = ApiResponse<null>;

@Route('file')
@Tags('File Management')
@Security('bearerAuth')
export default class FileUploadController {
  @Post('/{chatGroupId}')
  public async uploadFile(@UploadedFile() file?: Express.Multer.File): Promise<FileUploadResponse> {
    try {
      if (!file) {
        return { error: true, message: 'File is required!', statusCode: HttpStatusCode.BadRequest };
      }
      const destinationPath = 'uploads' + file.destination.split('uploads')[1];
      const filePath = path.join(destinationPath, file.filename);
      const data: IFile = {
        FileName: file.filename,
        File: filePath,
        FileExtension: path.extname(file.originalname)?.replace('.', ''),
        FileType: file.mimetype,
      };

      return { error: false, message: 'File uploaded successfully', statusCode: HttpStatusCode.Ok, data };
    } catch (error) {
      return {
        error: true,
        message: 'Error While uploading File',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{filePath}')
  public async deleteFile(filePath: string): Promise<DeleteFileResponse> {
    try {
      if (!filePath) {
        return { error: true, message: 'File path is required!', statusCode: HttpStatusCode.BadRequest };
      }

      const uploadsDir = path.resolve(FileUpload.UPLOAD_DIRECTORY);
      const resolvedPath = path.resolve(filePath);

      if (!resolvedPath.startsWith(uploadsDir)) {
        return { error: true, message: 'Unauthorized file path', statusCode: HttpStatusCode.BadRequest };
      }

      if (!fs.existsSync(resolvedPath)) {
        return { error: true, message: 'File not found', statusCode: HttpStatusCode.BadRequest };
      }

      await fs.promises.unlink(resolvedPath);

      return { error: false, message: 'File deleted successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error While Deleting File',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }
}
