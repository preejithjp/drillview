import { HttpStatusCode } from 'axios';
import Trace from '../../controllers/trace.controller';
import API from '../../handlers/data.handler';
import { ApiResponse } from '../../interfaces/response.interfaces';
import {
  AllStoreData,
  AllTypeDatas,
  AssemblyTypes,
  DataCategories,
  EquipmentTypes,
  ProductTypes,
  StoreAssembly,
  StoreDataHeader,
  StoreDataStructure,
  StoreEndPoints,
  StoreEquipment,
  StoreFilter,
  StoreProduct,
} from '../../interfaces/store.connector.interfaces';
import { Utils } from '../../utils/common.utils';

export default class StoreConnector {
  constructor(accessToken?: string, dataStructure?: StoreDataStructure) {
    if (!accessToken) {
      throw new Error('Access Token is Required for getting data from Source.');
    }
    this.accesstoken = accessToken;
    this.dataStructure = dataStructure || StoreDataStructure.List;
  }

  private accesstoken: string;
  private dataStructure: StoreDataStructure = StoreDataStructure.List;
  private endPoint = StoreEndPoints.Header;

  public async get(dataType?: string, parentType?: string, parenturl?: string): Promise<ApiResponse<StoreDataHeader[] | null>> {
    const dataSource = this.checkChildDataSource(dataType as AllTypeDatas, parentType as AllTypeDatas, parenturl);
    const filter = this.generateDataFilter(dataType as AllTypeDatas, parenturl);
    let result: ApiResponse<StoreDataHeader[] | null>;
    switch (dataSource) {
      case DataCategories.Product:
        result = await this.processResult(this.getProducts(filter));
        break;
      case DataCategories.Assembly:
        result = await this.processResult(this.getAssemblies(filter));
        break;
      case DataCategories.Equipment:
        result = await this.processResult(this.getEquipments(filter));
        break;
      default:
        Trace.Warn('Cannot Identify Data Source from Provided Data', JSON.stringify({ dataType, parentType, parenturl }));
        result = {
          error: true,
          message: 'Cannot Identify Data Source from Provided Data',
          statusCode: HttpStatusCode.BadRequest,
        };
        break;
    }
    return result;
  }

  public async getCategoryChild(parentType?: string, parentUrl?: string): Promise<ApiResponse<StoreDataHeader[] | null>> {
    this.dataStructure = StoreDataStructure.List;
    this.endPoint = StoreEndPoints.Header;
    return this.get(undefined, parentType, parentUrl);
  }

  public async getNestedChild(parentType?: string, parentUrl?: string): Promise<ApiResponse<StoreDataHeader[] | null>> {
    this.dataStructure = StoreDataStructure.TREE;
    this.endPoint = StoreEndPoints.Header;
    return this.get(undefined, parentType, parentUrl);
  }

  public async getMetaData(uri: string): Promise<ApiResponse<AllStoreData | null>> {
    const dataSource = this.checkItemDataSource(uri);
    const filter: Partial<StoreFilter> = { Uri: uri };
    switch (dataSource) {
      case DataCategories.Product:
        return this.processResult(this.getDetailedProduct(filter));
      case DataCategories.Assembly:
        return this.processResult(this.getDetailedAssemby(filter));
      case DataCategories.Equipment:
        return this.processResult(this.getDetailedEquipment(filter));
      default:
        Trace.Warn('Cannot Identify Data Source from Provided Data', `uri: ${uri}`);
        return {
          error: true,
          message: 'Cannot Identify Data Source from Provided Data',
          statusCode: HttpStatusCode.BadRequest,
        };
    }
  }

  private getProducts = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreDataHeader[] | null>> => {
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreProduct[]>(
      `/${DataCategories.Product}${this.endPoint}`,
      filter,
      this.accesstoken
    );

    if (result.data && result.data.length && !result.error) {
      const resultOptimized = this.optimizeData(result.data);
      return {
        ...result,
        data: resultOptimized,
      };
    }
    return result;
  };

  private getDetailedProduct = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreProduct | null>> => {
    this.endPoint = StoreEndPoints.Details;
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreProduct[]>(
      `/${DataCategories.Product}${this.endPoint}`,
      filter,
      this.accesstoken
    );

    return {
      ...result,
      data: result.data && !result.error ? result.data[0] : null,
    };
  };

  private getAssemblies = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreDataHeader[] | null>> => {
    if (filter && filter.UrlStartsWith) {
      filter.UrlStartsWith = filter.UrlStartsWith.replace(DataCategories.Product, DataCategories.Assembly);
    }

    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreAssembly[]>(
      `/${DataCategories.Assembly}${this.endPoint}`,
      filter,
      this.accesstoken
    );

    if (result.data && result.data.length && !result.error) {
      const resultOptimized = this.optimizeData(result.data);
      return {
        ...result,
        data: resultOptimized,
      };
    } else if (!result.error && !result.data?.length) {
      return this.getEquipments(filter);
    }
    return result;
  };

  private getDetailedAssemby = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreAssembly | null>> => {
    this.endPoint = StoreEndPoints.Details;
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreAssembly[]>(
      `/${DataCategories.Assembly}${this.endPoint}`,
      filter,
      this.accesstoken
    );

    return {
      ...result,
      data: result.data && !result.error ? result.data[0] : null,
    };
  };

  private getEquipments = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreDataHeader[] | null>> => {
    if (filter && filter.UrlStartsWith) {
      filter.UrlStartsWith = filter.UrlStartsWith.replace(DataCategories.Assembly, DataCategories.Equipment);
    }
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreEquipment[]>(
      `/${DataCategories.Equipment}${this.endPoint}`,
      filter,
      this.accesstoken
    );

    if (result.data && result.data.length && !result.error) {
      const resultOptimized = this.optimizeData(result.data);
      return {
        ...result,
        data: resultOptimized,
      };
    }
    return result;
  };

  private getDetailedEquipment = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreEquipment | null>> => {
    this.endPoint = StoreEndPoints.Details;
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreEquipment[]>(
      `/${DataCategories.Equipment}${this.endPoint}`,
      filter,
      this.accesstoken
    );

    return {
      ...result,
      data: result.data && !result.error ? result.data[0] : null,
    };
  };

  public async getFullData(dataType?: string, parentType?: string, parenturl?: string): Promise<ApiResponse<AllStoreData[]>> {
    const dataSource = this.checkChildDataSource(dataType as AllTypeDatas, parentType as AllTypeDatas, parenturl);
    const filter = this.generateDataFilter(dataType as AllTypeDatas, parenturl);
    let result: ApiResponse<AllStoreData[]>;
    switch (dataSource) {
      case DataCategories.Product:
        result = (await this.processResult(this.getAllDetailedProduct(filter))) as ApiResponse<StoreProduct[]>;
        break;
      case DataCategories.Assembly:
        result = (await this.processResult(this.getAllDetailedAssemby(filter))) as ApiResponse<StoreAssembly[]>;
        break;
      default:
        Trace.Warn('Cannot Identify Data Source from Provided Data', JSON.stringify({ dataType, parentType, parenturl }));
        result = {
          error: true,
          message: 'Cannot Identify Data Source from Provided Data',
          statusCode: HttpStatusCode.BadRequest,
        };
        break;
    }
    return result;
  }

  private getAllDetailedProduct = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreProduct[]>> => {
    this.endPoint = StoreEndPoints.Details;
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreProduct[]>(
      `/${DataCategories.Product}${this.endPoint}`,
      filter,
      this.accesstoken
    );
    return {
      ...result,
      data: result.data && !result.error ? result.data : [],
    };
  };

  private getAllDetailedAssemby = async (filter: Partial<StoreFilter> = {}): Promise<ApiResponse<StoreAssembly[]>> => {
    this.endPoint = StoreEndPoints.Details;
    console.log(this.endPoint);
    const result = await API.ProductStore.postData<Partial<StoreFilter>, StoreAssembly[]>(
      `/${DataCategories.Assembly}${this.endPoint}`,
      filter,
      this.accesstoken
    );
    return {
      ...result,
      data: result.data && !result.error ? result.data : [],
    };
  };

  private checkItemDataSource(uri: string): DataCategories | undefined {
    if (uri.startsWith(DataCategories.Product)) {
      return DataCategories.Product;
    } else if (uri.startsWith(DataCategories.Assembly)) {
      return DataCategories.Assembly;
    } else if (uri.startsWith(DataCategories.Equipment)) {
      return DataCategories.Equipment;
    }
    return undefined;
  }

  private checkChildDataSource(dataType?: AllTypeDatas, parentType?: AllTypeDatas, parenturl?: string): DataCategories | undefined {
    if (dataType) {
      if (Utils.ValueIsInEnum(dataType, ProductTypes)) {
        return DataCategories.Product;
      } else if (Utils.ValueIsInEnum(dataType, AssemblyTypes)) {
        return DataCategories.Assembly;
      } else if (Utils.ValueIsInEnum(dataType, EquipmentTypes)) {
        return DataCategories.Equipment;
      }
    }

    if (!dataType && parentType) {
      if (Utils.ValueIsInEnum(parentType, ProductTypes)) {
        return DataCategories.Assembly;
      } else if (Utils.ValueIsInEnum(parentType, AssemblyTypes)) {
        return DataCategories.Assembly;
      } else if (Utils.ValueIsInEnum(parentType, EquipmentTypes)) {
        return DataCategories.Equipment;
      }
    }

    if (parenturl?.startsWith(DataCategories.Product.toLowerCase())) {
      return DataCategories.Assembly;
    } else if (parenturl?.startsWith(DataCategories.Assembly.toLowerCase())) {
      if (this.dataStructure && this.dataStructure === StoreDataStructure.TREE) {
        return DataCategories.Assembly; // required for Tree
      } else if (this.dataStructure && this.dataStructure === StoreDataStructure.List) {
        return DataCategories.Equipment; // required for List
      }
      return DataCategories.Equipment; // default to List
    } else if (parenturl?.startsWith(DataCategories.Equipment.toLowerCase())) {
      return DataCategories.Equipment;
    }
    return DataCategories.Product;
  }

  private generateDataFilter(dataType?: AllTypeDatas, parenturl?: string): Partial<StoreFilter> {
    const filter: StoreFilter = {};
    if (dataType) {
      filter.Type = dataType;
    }
    if (parenturl) {
      if (this.dataStructure === StoreDataStructure.TREE) {
        filter.ParentUrl = parenturl; // required for tree Tree
      } else if (this.dataStructure === StoreDataStructure.List) {
        filter.UrlStartsWith = parenturl; // required for List
      } else {
        filter.UrlStartsWith = parenturl; // Defaults to List
      }
    }
    return filter;
  }

  private optimizeData(data: AllStoreData[]): StoreDataHeader[] {
    return data.map((a) => {
      return {
        name: a.name,
        description: a.description,
        type: a.type,
        creationDate: a.creationDate,
        lastUpdatedDate: a.lastUpdatedDate,
        uri: a.uri,
        uniqueIdentifier: a.uniqueIdentifier,
        id: (a as StoreEquipment).id ?? undefined,
        unit: (a as StoreEquipment).unit ?? undefined,
        unitType: (a as StoreEquipment).unitType ?? undefined,
        parent: a.parent,
        groupId: a.groupId,
      };
    });
  }
  private async processResult<T>(fetchData: Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    const result = await fetchData;
    if (result && result.error && result.statusCode === HttpStatusCode.Unauthorized) {
      result.statusCode = HttpStatusCode.Forbidden;
      result.message = "User Doesn't have access to requested resources";
    }
    return result;
  }
}
