import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import ApiInstance from './httpclient';

/**
 * Public endpoints that don't require authentication
 * Add more endpoints here as needed
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/customers/register',
  '/customers/verify-email',
  '/customers/resend-verification',
  '/users/initialize',
];

/**
 * Custom axios instance mutator for Orval
 * Routes requests to either public or private axios instance based on endpoint
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const url = config.url || '';

  // Check if this is a public endpoint
  const isPublic = PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint));

  // Use appropriate axios instance
  const instance = isPublic
    ? ApiInstance.ApiPublicApiInstance
    : ApiInstance.ApiPrivateApiInstance;

  // Merge configs and make the request
  return instance({
    ...config,
    ...options,
  });
};

export default customInstance;
