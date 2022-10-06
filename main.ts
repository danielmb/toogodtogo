import axios, {
  Axios,
  AxiosError,
  AxiosInstance,
  AxiosProxyConfig,
  AxiosResponse,
} from 'axios';

import { config } from './config';
import { HttpStatusCode } from 'axios';
import fs from 'fs';
import path from 'path';
import { ApiConfig, PollingSuccessful, EndPoints } from './types/main';
const createLogFile = (filePath: string, filename: string, data: any) => {
  // get current date and time in YYYYMMDDHHMMSS format
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);
  const datestamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2);

  // create log file name
  const logFileName = `${filename}_${timestamp}.log`;
  const logFilePath = path.join(filePath, datestamp);
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(path.join(filePath, datestamp), { recursive: true });
  }
  fs.writeFileSync(path.join(logFilePath, logFileName), data);
};
class tgtgClient {
  userInfo: PollingSuccessful | null;
  baseURL?: string;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  userAgent?: string;
  language?: string;
  proxies?: AxiosProxyConfig;
  timeout?: number;
  accessTokenLifetime: number;
  deviceType?: string;
  lastTokenRefresh?: number;
  session: AxiosInstance;
  config: typeof config;
  AuthorizationHeader: string;
  constructor({
    baseURL,
    email,
    accessToken,
    refreshToken,
    userId,
    userAgent,
    language,
    proxies,
    timeout,
    accessTokenLifetime,
    deviceType,
  }: ApiConfig) {
    this.config = config;
    this.baseURL = baseURL || this.config.api.url;
    this.email = email;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userId = userId;
    this.userAgent =
      userAgent ||
      this.config.api.userAgents[
        Math.floor(Math.random() * this.config.api.userAgents.length)
      ];
    this.language = language || this.config.api.language;
    this.proxies = proxies;
    this.timeout = timeout || this.config.api.waitTime;

    this.accessTokenLifetime =
      accessTokenLifetime || this.config.api.accessTokenLifetime;
    this.lastTokenRefresh = undefined;
    this.deviceType = deviceType || 'ANDROID';
    this.session = axios.create({
      baseURL: this.baseURL,
      headers: {
        // pick a random user agent
        'User-Agent': this.userAgent,
        'accept-language': this.language,
      },
      timeout: this.timeout,
      proxy: this.proxies,
    });
    this.session.interceptors.request.use(
      (config) => {
        if (config.headers) {
          config.headers.Authorization = this.AuthorizationHeader;
        }
        console.log(config.headers);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    this.AuthorizationHeader = this.accessToken
      ? `Bearer ${this.accessToken}`
      : '';
    this.userInfo = null;
  }
  getURL(endpoint: string) {
    return new URL(endpoint, this.baseURL).toString();
  }
  async getCredentials() {
    await this.login();
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      userId: this.userId,
    };
  }
  async refreshTokens() {
    if (
      this.lastTokenRefresh &&
      Date.now() - this.lastTokenRefresh < this.accessTokenLifetime
    ) {
      return;
    }
    console.log('Refreshing tokens...');
    let res: AxiosResponse | null = null;
    try {
      res = await this.session.post(this.getURL(EndPoints.refreshToken), {
        refresh_token: this.refreshToken,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      }
      throw 'Error refreshing tokens';
    }
    if (res && res.status === 200) {
      this.accessToken = res.data.access_token;
      this.AuthorizationHeader = `Bearer ${this.accessToken}`;
      this.refreshToken = res.data.refresh_token;
      this.lastTokenRefresh = Date.now();
      console.log('Tokens refreshed');
    }
  }
  checkLogin() {
    return this.accessToken && this.refreshToken && this.userId;
  }
  async login() {
    if (
      !this.email &&
      !(this.accessToken && this.refreshToken && this.userId)
    ) {
      throw new Error('No credentials provided');
    }
    if (this.checkLogin()) {
      this.refreshTokens();
    } else {
      let res: AxiosResponse | null = null;
      try {
        res = await this.session.post(this.getURL(EndPoints.authEmail), {
          device_type: this.deviceType,
          email: this.email,
        });
      } catch (error: AxiosError | AxiosResponse | any) {
        if (axios.isAxiosError(error)) {
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors &&
            Array.isArray(error.response.data.errors) &&
            error.response.data.errors.length > 0 &&
            error.response.data.errors[0] &&
            error.response.data.errors[0].code
          ) {
            throw new Error(error.response.data.errors[0].code);
          }
        } else {
          console.log(error);
          throw new Error('Unknown error');
        }
      }

      if (res && res.status === 200 && res.data.state) {
        switch (res.data.state) {
          case 'TERMS': {
            throw new Error(`No account found for ${this.email}`);
          }
          case 'WAIT': {
            if (!res.data.polling_id)
              throw new Error('No polling id, must be a serious error...');
            let pollingId = res.data.polling_id;
            this.pollForLogin(pollingId);
            break;
          }
          default: {
            throw new Error(`Unknown state ${res.data.state}`);
          }
        }
      }
    }
  }
  async pollForLogin(pollingId: string) {
    for (let attempts = 0; attempts < this.config.api.maxRetries; attempts++) {
      // Log but keep everything in the same line
      console.log(`Polling for login, check email...`);
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.api.waitTime),
      );
      process.stdout.write('.');
      let res: AxiosResponse | null = null;

      try {
        res = await this.session.post(this.getURL(EndPoints.authPolling), {
          device_type: this.deviceType,
          email: this.email,
          request_polling_id: pollingId,
        });
      } catch (error: AxiosError | AxiosResponse | any) {
        if (axios.isAxiosError(error)) {
          console.log(error.response?.data);
        }
      }
      if (res && res.status === 200) {
        console.log('Login successful!');
        createLogFile('./logs/', 'login', JSON.stringify(res.data, null, 2));
        this.userInfo = res.data as PollingSuccessful;
        this.accessToken = this.userInfo.access_token;
        this.AuthorizationHeader = `Bearer ${this.accessToken}`;
        this.refreshToken = this.userInfo.refresh_token;
        this.userId = this.userInfo.startup_data.user.user_id;
        this.lastTokenRefresh = Date.now();
        return;
      }
    }
  }
  async getActive() {
    await this.login();
    let res: AxiosResponse | null = null;
    try {
      res = await this.session.post(this.getURL(EndPoints.activeOrder), {
        user_id: this.userId,
      });
    } catch (error: AxiosError | AxiosResponse | any) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      }
      throw 'Error getting active order';
    }
    if (res && res.status === 200) {
      return res.data;
    }
  }
}
