import { Router, Response } from 'express';
import DocumentManagerController from '../controllers/documentmanager.controller';
import { APIUtils } from '../utils/api.utils';

export default function DocumentManagerRoutes(router: Router) {
  const documentManagerController = new DocumentManagerController();

  router.get('/product', async (req, res: Response) => {
    const data = await documentManagerController.getAllProducts(res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });
  router.get('/product/:itemUri/details', async (req, res: Response) => {
    const data = await documentManagerController.getProductDetails(req.params.itemUri, res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.get('/product/:parentType/:itemUri', async (req, res: Response) => {
    const data = await documentManagerController.getProduct(req.params.parentType, req.params.itemUri, res.locals.access_token);
    APIUtils.ResponseGenerator(res, data);
  });

  router.delete('/product/:itemUri', async (req, res: Response) => {
    const data = await documentManagerController.deleteProduct(req.params.itemUri);
    APIUtils.ResponseGenerator(res, data);
  });

  router.patch('/product/:itemUri', async (req, res: Response) => {
    const data = await documentManagerController.updateProduct(req.params.itemUri, req.body, res.locals.user);
    APIUtils.ResponseGenerator(res, data);
  });
}
