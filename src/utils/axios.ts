import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from 'axios';
import { logger } from './logger';

const requestInterceptor = (request: AxiosRequestConfig) => {
  logger.http('Outgoing request', request);
  return request;
};

const responseInterceptor = (response: AxiosResponse) => {
  logger.http('Incoming response', response);
  return response;
};

const configureAxios = (axios: AxiosStatic | AxiosInstance) => {
  axios.interceptors.request.use(requestInterceptor);
  axios.interceptors.response.use(responseInterceptor);
};

const client = axios.create();
configureAxios(axios);
configureAxios(client);

export { axios, client };
