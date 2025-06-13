export enum OrganizationStatus {
  Active = 200,
  Inactive = 201,
  Deleted = 202,
}

export interface IOrganization {
  OrganizationId: number;
  OrganizationName: string;
  Logo?: string;
  CreatedUser?: string;
  Status: OrganizationStatus;
  Location: string;
  ModifiedDate: number;
  CreatedDate: number;
}
