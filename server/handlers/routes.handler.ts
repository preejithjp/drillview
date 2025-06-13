import { Application, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { Server } from '../controllers/server.controller';

import TraceRoutes from '../routes/trace.routes';
import AuthRoutes from '../routes/auth.routes';
import { AuthUtils } from '../utils/auth.utils';
import ChatGroupRoutes from '../routes/chatgroup.routes';
import ChatMessageRoutes from '../routes/chatmessage.routes';
import FileUploadRoutes from '../routes/fileupload.routes';
import OrganizationRoutes from '../routes/organization.routes';
import MemberRoutes from '../routes/member.routes';
import ChatMemberRoutes from '../routes/chatmember.routes';
import PlatformRoutes from '../routes/platform.routes';
import LayoutRoutes from '../routes/layout.routes';
import DashboardRoutes from '../routes/dashboard.routes';
import settingsRoutes from '../routes/dashboardsettings.routes';
import DocumentManagerRoutes from '../routes/documentManager.routes';
import DatacollectionRoutes from '../routes/datacollection.routes';
import SynchronizerRoutes from '../routes/synchronizer.routes';
import UnitEditorRoutes from '../routes/uniteditor.routes';
import ImageTemplateRoutes from '../routes/imagetemplate.routes';
import ScenarioRoutes from '../routes/scenario.routes';
import RigRoutes from '../routes/rig.routes';
import WellRoutes from '../routes/well.routes';

const router = Router();

export default function initializeRoutes(app: Application) {
  app.use(
    '/swagger',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: { url: '/swagger.json' },
      customSiteTitle: Server.APP_NAME,
      customCss: `.swagger-ui .topbar { display: none; }
                  .swagger-ui .info { margin: 0; padding: 30px 50px; background: #f3f3f3; }
                  .information-container.wrapper { margin: 0; padding: 0; max-width: unset; }`,
    })
  );

  AuthRoutes(router);
  MemberRoutes(router);
  TraceRoutes(router);
  ChatGroupRoutes(router);
  ChatMemberRoutes(router);
  ChatMessageRoutes(router);
  FileUploadRoutes(router);
  OrganizationRoutes(router);
  PlatformRoutes(router);
  LayoutRoutes(router);
  DashboardRoutes(router);
  DocumentManagerRoutes(router);
  settingsRoutes(router);
  DatacollectionRoutes(router);
  SynchronizerRoutes(router);
  UnitEditorRoutes(router);
  ImageTemplateRoutes(router);
  ScenarioRoutes(router);
  RigRoutes(router);
  WellRoutes(router);

  app.use(Server.BASE_URL, AuthUtils.VerifyRequestToken, router);
}
