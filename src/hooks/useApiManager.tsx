
import ApiInstance from "@/lib/httpclient";
import { errorMessage } from "@/lib/utils";
import { ApiResponse } from "@/types/general";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import { toast } from "sonner";



interface ApiManagerOptions<TData, TError> {
  endpoint: string;
  queryKey?: string | string[];
  method?: "POST" | "PUT" | "PATCH" | "DELETE" | "GET";
  isAuth?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  contentType?: string | null;
  invalidateQueries?: boolean; // Control whether to invalidate queries
  refetchType?: "active" | "all" | "none"; // Control refetch behavior
  onSuccess?: (response: ApiResponse<TData>) => void;
  onError?: (error: TError) => void;
}

interface ApiManagerReturn<TData, TError, TVariables> {
  callApi: (details: TVariables) => Promise<ApiResponse<TData> | undefined>;
  data: TData | undefined;
  response: ApiResponse<TData> | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  error: TError | null;
  isError: boolean;
  mutation: UseMutationResult<ApiResponse<TData>, TError, TVariables>;
  reset: () => void;
}

const useApiManager = <TData = unknown, TError = Error, TVariables = unknown>({
  endpoint,
  queryKey,
  method = "POST",
  isAuth = false,
  showSuccessToast = true,
  showErrorToast = true,
  contentType = "application/json",
  invalidateQueries = true,
  refetchType = "active",
  onSuccess,
  onError,
}: ApiManagerOptions<TData, TError>): ApiManagerReturn<
  TData,
  TError,
  TVariables
> => {
  const queryClient = useQueryClient();
  const axiosInstance: AxiosInstance = isAuth
    ? ApiInstance.ApiPrivateApiInstance
    : ApiInstance.ApiPublicApiInstance;

  const apiController = async (
    details: TVariables
  ): Promise<ApiResponse<TData>> => {
    const config = {
      headers: contentType ? { "Content-Type": contentType } : undefined,
    };

    let response: ApiResponse<TData>;

    switch (method.toUpperCase()) {
      case "POST":
        response = await axiosInstance.post(endpoint, details, config);
        break;
      case "PUT":
        response = await axiosInstance.put(endpoint, details, config);
        break;
      case "PATCH":
        response = await axiosInstance.patch(endpoint, details, config);
        break;
      case "DELETE":
        response = await axiosInstance.delete(endpoint, {
          ...config,
          data: details,
        });
        break;
      case "GET":
        response = await axiosInstance.get(endpoint, {
          ...config,
          params: details,
        });
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response;
  };

  const mutation = useMutation<ApiResponse<TData>, TError, TVariables>({
    mutationFn: apiController,
    onSuccess: (response) => {
      // Show success toast
      if (showSuccessToast && response.message) {
        toast.success(response.message);
      }

      // Invalidate queries if enabled
      if (invalidateQueries && queryKey) {
        const updateQueryKeys = Array.isArray(queryKey) ? queryKey : [queryKey];

        updateQueryKeys.forEach((key) => {
          if (key) {
            queryClient.invalidateQueries({
              queryKey: [key],
              refetchType,
            });
          }
        });
      }

      // Call custom onSuccess callback
      onSuccess?.(response);
    },
    onError: (error: TError) => {
      // Show error toast
      if (showErrorToast) {
        toast.error(errorMessage(error));
      }

      // Call custom onError callback
      onError?.(error);
    },
  });

  const callApi = async (details: TVariables) => {
    try {
      return await mutation.mutateAsync(details);
    } catch (error) {
      // Error already handled in onError, just rethrow if needed
      throw error;
    }
  };

  return {
    callApi,
    data: mutation.data?.data,
    response: mutation.data,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    isError: mutation.isError,
    mutation,
    reset: mutation.reset,
  };
};

export default useApiManager;