import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { CreateProductDto } from '@/types/generated/createProductDto';
import type { ProductResponseDto } from '@/types/generated/productResponseDto';
import type { ProductsControllerFindAllParams } from '@/types/generated/productsControllerFindAllParams';
import type { UpdateProductDto } from '@/types/generated/updateProductDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductsControllerFindAllParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Get all products
export const useProducts = (params?: ProductsControllerFindAllParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ items: ProductResponseDto[], total: number, page: number, limit: number, totalPages: number }>>(
        '/products',
        { params }
      );
      const paginatedData = response.data.data;
      return {
        data: paginatedData.items || [],
        pagination: {
          total: paginatedData.total,
          page: paginatedData.page,
          limit: paginatedData.limit,
          totalPages: paginatedData.totalPages,
        },
      };
    },
  });
};

// Get product by ID
export const useProduct = (id: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProductResponseDto>>(
        `/products/${id}`
      );
      return response.data.data;
    },
    enabled: enabled && !!id,
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const response = await api.post<ApiResponse<ProductResponseDto>>(
        '/products',
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
      const response = await api.patch<ApiResponse<ProductResponseDto>>(
        `/products/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
};

// Upload products from CSV
export const useUploadProductsCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ApiResponse<any>>(
        '/products/upload/csv',
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
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Products uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload products');
    },
  });
};

// Download CSV template for products
export const downloadProductCsvTemplate = async () => {
  try {
    const response = await api.get('/products/upload/csv/template', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded');
  } catch (error: any) {
    toast.error('Failed to download template');
  }
};
