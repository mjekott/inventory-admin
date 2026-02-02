import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { Customer } from '@/types/generated/customer';
import type { CreateCustomerDto } from '@/types/generated/createCustomerDto';
import type { UpdateCustomerDto } from '@/types/generated/updateCustomerDto';
import type { PaginatedCustomersResponseDto } from '@/types/generated/paginatedCustomersResponseDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: any) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: string;
}

export const useCustomers = (params?: UseCustomersParams) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ items: Customer[]; total: number; page: number; limit: number; totalPages: number }>>('/customers', {
        params,
      });
      // API returns items array, but we need to match the PaginatedCustomersResponseDto structure
      const apiData = response.data.data;
      return {
        data: apiData.items,
        total: apiData.total,
        page: apiData.page,
        limit: apiData.limit,
        totalPages: apiData.totalPages,
      };
    },
  });
};

export const useCustomer = (id: string, enabled = true) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
      return response.data.data;
    },
    enabled: !!id && enabled,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerDto) => {
      const response = await api.post<ApiResponse<Customer>>('/customers', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create customer');
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerDto }) => {
      const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update customer');
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete customer');
    },
  });
};
