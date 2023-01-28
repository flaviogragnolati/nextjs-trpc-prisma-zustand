import P from 'bluebird';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/server-env';
import Errors from '@/errors';

const defaultAxiosInstanceOptions = {
  timeout: 10000,
  baseUrl: env.BACKEND_BASE_URL || 'http://localhost:4000',
};

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ExtendedAxiosError extends AxiosError {
  config: ExtendedAxiosRequestConfig;
}

interface ClientOptions {
  raw?: boolean;
  interceptors?: boolean;
}

export class HttpClient {
  private options: ClientOptions;
  private client: AxiosInstance;
  private requestInterceptors: any;
  private responseInterceptors: any;

  constructor(options: ClientOptions = {}) {
    this.options = options;
    this.client = axios.create(defaultAxiosInstanceOptions);

    this.requestInterceptors = this.client.interceptors.request.use(
      async (reqConfig: ExtendedAxiosRequestConfig) => {
        const accessToken = await this.getToken();
        // if we have a token, add it to the request authorization header
        if (accessToken) {
          reqConfig.headers = { ...reqConfig.headers } as AxiosHeaders;
          reqConfig.headers.set('Authorization', `Bearer ${accessToken}`);
        } else {
          throw new Errors.InternalServerError('No auth0 access token');
        }

        return reqConfig;
      },
      (error: ExtendedAxiosError) => Promise.reject(error),
    );

    this.responseInterceptors = this.client.interceptors.response.use(
      (response: AxiosResponse) =>
        Promise.resolve<AxiosResponse>(
          this.options.raw ? response : response.data,
        ),
      async (error: ExtendedAxiosError) => {
        const originalConfig = error.config;

        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !originalConfig._retry
        ) {
          originalConfig._retry = true; // flag the original request to not retry indefinitely
          const forceRefresh = true;
          const accessToken = await this.getToken(forceRefresh);
          if (accessToken) {
            this.client.defaults.headers.common.authorization = `Bearer ${accessToken}`;
            originalConfig.headers = {
              ...originalConfig.headers,
            } as AxiosHeaders;

            originalConfig.headers.set(
              'Authorization',
              `Bearer ${accessToken}`,
            ); // add the new token to the request

            return this.client.request(originalConfig);
          }
        }
        return P.reject(
          new Errors.InternalServerError(
            `Error at Service API call: ${error.message}`,
          ),
        );
      },
    );
  }

  async request<T>(
    options: InternalAxiosRequestConfig,
    clientOptions: ClientOptions = {},
  ): Promise<AxiosResponse<T> & AxiosResponse<T>['data']> {
    if (clientOptions.interceptors === false) await this.clearInterceptors();
    return P.bind(this).then(() => this.client.request(options));
  }

  clearInterceptors() {
    this.requestInterceptors.request.eject(this.requestInterceptors);
    this.responseInterceptors.response.eject(this.responseInterceptors);
    return P.resolve();
  }

  /**
   * This is a dummy method to get the token from whatever source you want.
   * Can be a cookie, local storage, etc.
   * If the source has some quirks, you can create a custom token service to handle it.
   * @returns {Promise<string>} token
   */
  async getToken(shouldRefresh?: boolean) {
    if (shouldRefresh) {
      // refresh token
    }
    return 'token';
  }
}

export type HttpClientT = InstanceType<typeof HttpClient>;

export const httpClient = new HttpClient();
