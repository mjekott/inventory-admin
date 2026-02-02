import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { CreateManufacturerDto } from '@/types/generated/createManufacturerDto';
import type { Manufacturer } from '@/types/generated/manufacturer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

export const manufacturerKeys = {
  all: ['manufacturers'] as const,
  lists: () => [...manufacturerKeys.all, 'list'] as const,
  details: () => [...manufacturerKeys.all, 'detail'] as const,
  detail: (id: string) => [...manufacturerKeys.details(), id] as const,
};

export const useManufacturers = () => {
  return useQuery({
    queryKey: manufacturerKeys.all,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Manufacturer[]>>('/manufacturers');
      return response.data.data || [];
    },
  });
};

export const useCreateManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateManufacturerDto) => {
      const response = await api.post<ApiResponse<Manufacturer>>('/manufacturers', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
      toast.success('Manufacturer created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create manufacturer');
    },
  });
};

export const useUpdateManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateManufacturerDto }) => {
      const response = await api.patch<ApiResponse<Manufacturer>>(`/manufacturers/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
      toast.success('Manufacturer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update manufacturer');
    },
  });
};

export const useDeleteManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/manufacturers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
      toast.success('Manufacturer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete manufacturer');
    },
  });
};
