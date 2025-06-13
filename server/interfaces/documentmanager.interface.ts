import { StoreDataHeader } from './store.connector.interfaces';
export type Product = StoreDataHeader;
export interface ProductTree extends Product {
  children?: Product[];
  expanded?: boolean;
}
export interface NodeDetails {
  [key: string]: any;
}
