import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { store } from '@/main';
import { readFromWebStorage, removeFromWebStorage } from '@/common/utils';
import { LoginResponse } from '../../server/interfaces/auth.interfaces';
import ChatPage from '@/pages/ChatPage.vue';
import ChatGroup from '@/pages/ChatGroup.vue';
import LoginPage from '@/pages/LoginPage.vue';
import SummaryPage from '@/pages/SummaryPage.vue';
import ProfilePage from '@/pages/ProfilePage.vue';
import DataQualityPage from '@/pages/DataQualityPage.vue';
import DashboardPage from '@/pages/DashboardPage.vue';
import ChatGroupMembers from '@/pages/ChatGroupMembers.vue';
import { WebStorageKeys } from '@/interfaces/common.interfaces';
import DocumentManager from '@/pages/DocumentManager.vue';
import ManageDashBoardPage from '@/pages/ManageDashBoardPage.vue';
import DataCollectionPage from '@/pages/DataCollection.vue';
import SynchronizerPage from '@/pages/SynchronizerPage.vue';
import SynchronizerWellbores from '@/components/SynchronizerWellbores.vue';
import SynchronizerCreateJob from '@/components/SynchronizerCreateJob.vue';
import SynchronizerJobs from '@/components/SynchronizerJobs.vue';
import ManageImageTemplatePage from '@/pages/ManageImageTemplatePage.vue';
import RigManagerPage from '@/pages/RigManagerPage.vue';
import RigSettingsPage from '@/pages/RigSettingsPage.vue';

export enum Routes {
  Login = 'Login',
  Chat = 'Chat',
  ChatGroup = 'Chat Group',
  ChatGroupMembers = 'Chat Group Members',
  Summary = 'Summary',
  LogOut = 'LogOut',
  Profile = 'Profile',
  DataQuality = 'DataQuality',
  Dashboard = 'Dashboard',
  ManageDashBoard = 'Manage Dashboard',
  DataCollection = 'Data Collection',
  DocumentManager = 'Document Manager',
  Synchronizer = 'Synchronizer',
  SynchronizerJobs = 'SynchronizerJobs',
  SynchronizerWellbores = 'SynchronizerWellbores',
  SynchronizerCreateJob = 'SynchronizerCreateJob',
  ManageImageTemplate = 'Manage Image Template',
  RigManager = 'Rig Scheduler',
  RigSettings = 'Rig Settings',
  ManageRig = 'Manage Rig',
  ManageWell = 'Manage Well',
}

export type routeRecordName = RouteRecordRaw & {
  name: Routes;
  meta?: {
    requiresAuth?: boolean;
    fromLogin?: boolean;
    icon?: string;
    showInNavigation?: boolean;
    showInLoginNav?: boolean;
    parent?: Routes;
  };
};

export const routes: Array<routeRecordName> = [
  { path: '/', name: Routes.Login, component: LoginPage, meta: { fromLogin: true }, children: [] },
  {
    path: '/summary',
    name: Routes.Summary,
    component: SummaryPage,
    children: [],
    meta: { requiresAuth: true, icon: 'detail-icon', showInNavigation: true, showInLoginNav: true },
  },
  {
    path: '/dashboard/:dashboardid?',
    name: Routes.Dashboard,
    component: DashboardPage,
    children: [],
    meta: { requiresAuth: true, icon: 'menu-nav-icon', showInNavigation: true, showInLoginNav: true },
  },
  {
    path: '/managedashboard',
    name: Routes.ManageDashBoard,
    component: ManageDashBoardPage,
    children: [],
    meta: { requiresAuth: true, icon: 'circle-plus-icon', showInNavigation: true, showInLoginNav: true },
  },
  {
    path: '/manage-image-template',
    name: Routes.ManageImageTemplate,
    component: ManageImageTemplatePage,
    children: [],
    meta: { requiresAuth: true, icon: 'image-icon', showInNavigation: true, showInLoginNav: true },
  },
  {
    path: '/chat',
    name: Routes.Chat,
    component: ChatPage,
    meta: { requiresAuth: true, icon: 'chat-group-icon', showInNavigation: true, showInLoginNav: true },
    children: [
      {
        path: '/chat/chatgroupmembers/:gId',
        name: Routes.ChatGroupMembers,
        component: ChatGroupMembers,
        meta: { requiresAuth: true, showInNavigation: false },
      },
    ],
  },
  {
    path: '/chatgroup',
    name: Routes.ChatGroup,
    component: ChatGroup,
    children: [],
    meta: { requiresAuth: true, icon: 'chat-group-icon-02', showInNavigation: true },
  },
  { path: '/profile', name: Routes.Profile, component: ProfilePage, children: [], meta: { requiresAuth: true, icon: 'group-icon' } },
  {
    path: '/dataquality',
    name: Routes.DataQuality,
    component: DataQualityPage,
    children: [],
    meta: { requiresAuth: true, icon: 'data-quality', showInNavigation: true },
  },
  {
    path: '/documentmanager',
    name: Routes.DocumentManager,
    component: DocumentManager,
    children: [],
    meta: { requiresAuth: true, icon: 'doc-manager-icon', showInNavigation: true, showInLoginNav: true },
  },
  {
    path: '/data-collection/:id?/:subtitle?/:jobtype?',
    name: Routes.DataCollection,
    component: DataCollectionPage,
    meta: { requiresAuth: true, icon: 'resource-icon', showInNavigation: true, showInLoginNav: true },
    children: [],
  },
  {
    path: '/rigmanager',
    name: Routes.RigManager,
    component: RigManagerPage,
    meta: {
      requiresAuth: true,
      icon: 'drilling-icon',
      showInNavigation: true,
      showInLoginNav: true,
    },
  },
  {
    path: '/rigsettings',
    name: Routes.ManageRig,
    component: RigSettingsPage,
    meta: {
      requiresAuth: true,
      icon: 'resource-icon',
      showInLoginNav: true,
      parent: Routes.RigManager,
    },
  },
  {
    path: '/rigsettings',
    name: Routes.ManageWell,
    component: RigSettingsPage,
    meta: {
      requiresAuth: true,
      icon: 'drilling-icon',
      showInLoginNav: true,
      parent: Routes.RigManager,
    },
  },
  { path: '/logout', name: Routes.LogOut, component: LoginPage, children: [] },
  {
    path: '/synchronizer',
    name: Routes.Synchronizer,
    redirect: { name: Routes.SynchronizerJobs },
    component: SynchronizerPage,
    children: [
      {
        path: '',
        name: Routes.SynchronizerJobs,
        component: SynchronizerJobs,
        meta: { requiresAuth: true, showInNavigation: false },
      },
      {
        path: 'wellbores',
        name: Routes.SynchronizerWellbores,
        component: SynchronizerWellbores,
        meta: { requiresAuth: true, showInNavigation: false },
      },
      {
        path: ':jobid',
        name: Routes.SynchronizerCreateJob,
        component: SynchronizerCreateJob,
        meta: { requiresAuth: true, showInNavigation: false },
      },
    ],
    meta: { requiresAuth: true, icon: 'resource-icon', showInNavigation: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  let authinfo = store.authInfo;
  if (!authinfo || !Object.keys(authinfo).length) {
    authinfo = readFromWebStorage(WebStorageKeys.AUTH);
    store.authInfo = authinfo;
  }

  if (!to.name) {
    // Redirecting to landing page for all unknown routes
    next({ name: store.landingPage });
  }
  if (to.matched.some((record) => record.meta?.requiresAuth)) {
    if ((!authinfo || Object.keys(authinfo).length === 0) && to.name !== Routes.Login) {
      store.authInfo = {} as LoginResponse;
      removeFromWebStorage(WebStorageKeys.AUTH);
      next({
        name: Routes.Login,
      });
    } else {
      next();
    }
  } else if (to.name === Routes.Login && Object.keys(authinfo).length) {
    next({ name: store.landingPage });
  } else if (to.name === Routes.LogOut) {
    store.authInfo = {} as LoginResponse;
    next({
      name: Routes.Login,
    });
  } else {
    next();
  }
});

export default router;
