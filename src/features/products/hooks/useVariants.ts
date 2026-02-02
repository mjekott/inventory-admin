import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { CreateVariantDto } from '@/types/generated/createVariantDto';
import type { UpdateVariantDto } from '@/types/generated/updateVariantDto';
import type { VariantResponseDto } from '@/types/generated/variantResponseDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

// Query keys for variants
export const variantKeys = {
  all: ['variants'] as const,
  lists: () => [...variantKeys.all, 'list'] as const,
  list: (productId: string) => [...variantKeys.lists(), productId] as const,
  details: () => [...variantKeys.all, 'detail'] as const,
  detail: (productId: string, variantId: string) =>
    [...variantKeys.details(), productId, variantId] as const,
  lowStock: () => [...variantKeys.all, 'low-stock'] as const,
};

// Get all variants for a product
export const useVariants = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: variantKeys.list(productId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<VariantResponseDto[]>>(
        `/products/${productId}/variants`
      );
      return response.data.data || [];
    },
    enabled: !!productId && enabled,
  });
};

// Get variant by ID
export const useVariant = (productId: string, variantId: string, enabled = true) => {
  return useQuery({
    queryKey: variantKeys.detail(productId, variantId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<VariantResponseDto>>(
        `/products/${productId}/variants/${variantId}`
      );
      return response.data.data;
    },
    enabled: !!productId && !!variantId && enabled,
  });
};

// Get low stock variants
export const useLowStockVariants = () => {
  return useQuery({
    queryKey: variantKeys.lowStock(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<VariantResponseDto[]>>(
        '/variants/low-stock'
      );
      return response.data.data || [];
    },
  });
};

// Create variant
export const useCreateVariant = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVariantDto) => {
      const response = await api.post<ApiResponse<VariantResponseDto>>(
        `/products/${productId}/variants`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.list(productId) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Variant created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create variant');
    },
  });
};

// Update variant
export const useUpdateVariant = (productId: string, variantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateVariantDto) => {
      const response = await api.patch<ApiResponse<VariantResponseDto>>(
        `/products/${productId}/variants/${variantId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.list(productId) });
      queryClient.invalidateQueries({ queryKey: variantKeys.detail(productId, variantId) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Variant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update variant');
    },
  });
};

// Delete variant
export const useDeleteVariant = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variantId: string) => {
      await api.delete(`/products/${productId}/variants/${variantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.list(productId) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Variant deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete variant');
    },
  });
};

// Upload variants from CSV
export const useUploadVariantsCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<any>>(
        '/products/upload/variants/csv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Variants uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload variants');
    },
  });
};

// Download CSV template
export const downloadVariantCsvTemplate = async () => {
  try {
    const response = await api.get('/products/upload/variants/csv/template', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'variant-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded');
  } catch (error: any) {
    toast.error('Failed to download template');
  }
};
