export interface ServiceBase {
  id: string;
  name: string;
  hostName: string;
  status: Array<ServiceStatusBase>;
  applicationupTime: number;
  applicationName: string;
  creationDate: Date;
}

export interface IAliveStatus {
  applicationName: string;
  hostName: string;
  podNameSpace?: string;
  applicationupTime: number;
  status: Array<ServiceStatusBase>;
}

export interface Service extends Omit<ServiceBase, 'status' | 'name'> {
  serviceType: ServiceType;
  statusDetail: Array<ServiceStatus>;
}

export interface ServiceStatusBase {
  name: string;
  status: string;
  creationDate?: Date;
}

export interface ServiceStatus extends Omit<ServiceStatusBase, 'status'> {
  serviceStatus: ServiceStatusEnum;
  message: string;
}

export enum ServiceType {
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export enum ServiceStatusEnum {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}
