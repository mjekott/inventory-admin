import { AuthResponse } from "@/features/auth/types";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  deleteTokenPair,
  getAccessToken,
  getRefreshToken,
  setAuthTokenPair,
} from "./session";
import { errorMessage } from "./utils";

const TIMEOUT = 30_000;

const ERROR_MESSAGE = [
  "Unauthorized",
  "Given token not valid for any token type",
  "Authentication credentials were not provided.",
  "Authentication token invalid or expired",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface IApiInstance {
  ApiPublicApiInstance: AxiosInstance;
  ApiPrivateApiInstance: AxiosInstance;
}

const ApiInstance = {} as IApiInstance;

/* -------------------- Axios Instances -------------------- */

ApiInstance.ApiPublicApiInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
});

ApiInstance.ApiPrivateApiInstance = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
});

/* -------------------- Request Interceptor -------------------- */

ApiInstance.ApiPrivateApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  Promise.reject
);

/* -------------------- Refresh Control -------------------- */

let isRefreshing = false;

/* -------------------- Response Interceptor -------------------- */

ApiInstance.ApiPrivateApiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (!ERROR_MESSAGE.includes(errorMessage(error))) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      const response =
        await ApiInstance.ApiPublicApiInstance.post<AuthResponse>(
          "/auth/refresh",
          { refreshToken }
        );

      const {
        accessToken,
        refreshToken: newRefreshToken,
        refreshTokenExpires,
      } = response.data.data;

      setAuthTokenPair(
        accessToken,
        newRefreshToken,
        refreshTokenExpires
      );

      // Update header & retry original request
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return ApiInstance.ApiPrivateApiInstance(originalRequest);
    } catch (err) {
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

/* -------------------- Helpers -------------------- */

function forceLogout() {
  deleteTokenPair();

  if (typeof window !== "undefined") {
    const currentPath =
      window.location.pathname + window.location.search;

    sessionStorage.setItem("redirectAfterLogin", currentPath);
    window.location.href = "/";
  }
}

export default ApiInstance;
