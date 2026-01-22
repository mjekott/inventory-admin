import { api } from "@/lib/apiClient";
import { AxiosRequestConfig, Method } from "axios";

export type APIOptions = AxiosRequestConfig & {
  data?: any;
};

export async function apiRequest<T>(
  method: Method,
  url: string,
  options: APIOptions = {},
): Promise<T> {
  let response;

  switch (method.toUpperCase()) {
    case "GET":
      response = await api.get<T>(url, options);
      break;
    case "POST":
      response = await api.post<T>(url, options.data, options);
      break;
    case "PUT":
      response = await api.put<T>(url, options.data, options);
      break;
    case "PATCH":
      response = await api.patch<T>(url, options.data, options);
      break;
    case "DELETE":
      response = await api.delete<T>(url, options);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }

  return response.data;
}
