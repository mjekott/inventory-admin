import { api } from "@/lib/apiClient";

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  options: { data?: any } = {},
): Promise<T> {
  switch (method) {
    case "GET":
      return (await api.get(url)).data;

    case "POST":
      return (await api.post(url, options.data)).data;

    case "PUT":
      return (await api.put(url, options.data)).data;

    case "PATCH":
      return (await api.patch(url, options.data)).data;

    case "DELETE":
      return (await api.delete(url)).data;

    default:
      throw new Error("Unsupported HTTP method");
  }
}
