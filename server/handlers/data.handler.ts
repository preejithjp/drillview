import AuthMethods from '../services/methods/authservice';
import ProductStoreMethods from '../services/methods/productservice';
import ServiceManagerMethods from '../services/methods/servicemanager';
import DataSimplexMethods from '../services/methods/datasimplexservice';

class API {
  public static AuthService = AuthMethods.getInstance();
  public static ServiceManager = ServiceManagerMethods.getInstance();
  public static ProductStore = ProductStoreMethods.getInstance();
  public static DataSimplex = DataSimplexMethods.getInstance();
}

export default API;
