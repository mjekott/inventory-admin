import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { Brand } from '@/types/generated/brand';
import type { CreateBrandDto } from '@/types/generated/createBrandDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

export const useBrands = () => {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Brand[]>>('/brands');
      return response.data.data || [];
    },
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBrandDto) => {
      const response = await api.post<ApiResponse<Brand>>('/brands', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create brand');
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateBrandDto }) => {
      const response = await api.patch<ApiResponse<Brand>>(`/brands/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update brand');
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success('Brand deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete brand');
    },
  });
};
