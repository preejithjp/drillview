import { Body, Delete, Get, Path, Post, Put, Route, Security, Tags } from 'tsoa';
import { HttpStatusCode } from 'axios';
import { ApiResponse } from '../interfaces/response.interfaces';
import { IImageTemplate } from '../interfaces/imagetemplate.interfaces';
import { DashboardDB } from '../database/connectors/dashboarddb.connector';
import BinaryUtils from '../utils/binary.utils';
import { IFile } from '../interfaces/chatmessage.interfaces';
import path from 'path';

export type TemplateResponse = ApiResponse<IImageTemplate | null>;
export type TemplatesResponse = ApiResponse<IImageTemplate[] | null>;
export type DeleteResponse = ApiResponse<null>;
export type UploadFileResponse = ApiResponse<IFile>;

@Route('imagetemplate')
@Tags('ImageTemplate')
@Security('bearerAuth')
export default class ImageTemplateController {
  @Get('/')
  public async getAllTemplates(): Promise<TemplatesResponse> {
    try {
      const data = await DashboardDB.ImageTemplate.find({}, { _id: 0 }).sort({ modifiedDate: -1 }).lean();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data };
    } catch (error) {
      return {
        error: true,
        message: 'Error fetching templates',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Get('/{id}')
  public async getTemplateById(@Path() id: string): Promise<TemplateResponse> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(id);
      const data = await DashboardDB.ImageTemplate.findOne({ TemplateId: binaryId }, { _id: 0 }).lean();
      return { error: false, message: '', statusCode: HttpStatusCode.Ok, data };
    } catch (error) {
      return {
        error: true,
        message: 'Error retrieving template',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Post('/')
  public async createTemplate(@Body() body: IImageTemplate): Promise<TemplateResponse> {
    try {
      const created = await DashboardDB.ImageTemplate.create({
        TemplateId: BinaryUtils.convertUuidToBinary(),
        TemplateName: body.TemplateName,
        Entries: body.Entries || [],
        CreatedDate: Date.now(),
        ModifiedDate: Date.now(),
      });

      const data = created.toObject();
      return {
        error: false,
        message: 'Template created successfully',
        statusCode: HttpStatusCode.Ok,
        data,
      };
    } catch (error) {
      return {
        error: true,
        message: 'Error creating template',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Put('/{id}')
  public async updateTemplate(@Path() id: string, @Body() body: IImageTemplate): Promise<TemplateResponse> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(id);
      const updated = await DashboardDB.ImageTemplate.findOneAndUpdate(
        { TemplateId: binaryId },
        {
          $set: {
            TemplateName: body.TemplateName,
            Entries: body.Entries || [],
            ModifiedDate: Date.now(),
          },
        },
        { new: true }
      ).lean();

      return {
        error: false,
        message: 'Template updated successfully',
        statusCode: HttpStatusCode.Ok,
        data: updated,
      };
    } catch (error) {
      return {
        error: true,
        message: 'Error updating template',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  @Delete('/{id}')
  public async deleteTemplate(@Path() id: string): Promise<DeleteResponse> {
    try {
      const binaryId = BinaryUtils.convertUuidToBinary(id);
      await DashboardDB.ImageTemplate.deleteOne({ TemplateId: binaryId });
      return { error: false, message: 'Template deleted successfully', statusCode: HttpStatusCode.Ok };
    } catch (error) {
      return {
        error: true,
        message: 'Error deleting template',
        statusCode: HttpStatusCode.BadRequest,
        data: error?.message ? error.message : error,
      };
    }
  }

  public async uploadImage(file?: Express.Multer.File): Promise<UploadFileResponse> {
    try {
      if (!file) {
        return {
          error: true,
          message: 'File is required!',
          statusCode: HttpStatusCode.BadRequest,
          data: undefined,
        };
      }

      const filePath = path.join(file.destination, file.filename);
      const fileData: IFile = {
        FileName: file.filename,
        File: filePath,
        FileType: file.mimetype,
        FileExtension: path.extname(file.originalname)?.replace('.', ''),
      };

      return {
        error: false,
        message: 'File uploaded successfully',
        statusCode: HttpStatusCode.Ok,
        data: fileData,
      };
    } catch (error: any) {
      return {
        error: true,
        message: 'Error while uploading file',
        statusCode: HttpStatusCode.BadRequest,
        data: error.message || error,
      };
    }
  }
}
