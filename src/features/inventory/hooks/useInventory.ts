import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { AdjustInventoryDto } from '@/types/generated/adjustInventoryDto';
import type { InventoryControllerFindAllParams } from '@/types/generated/inventoryControllerFindAllParams';
import type { InventoryControllerGetLowStockParams } from '@/types/generated/inventoryControllerGetLowStockParams';
import type { InventoryControllerGetTransactionsParams } from '@/types/generated/inventoryControllerGetTransactionsParams';
import type { InventoryResponseDto } from '@/types/generated/inventoryResponseDto';
import type { PaginatedInventoryDataDto } from '@/types/generated/paginatedInventoryDataDto';
import type { PaginatedLowStockDataDto } from '@/types/generated/paginatedLowStockDataDto';
import type { PaginatedTransactionsDataDto } from '@/types/generated/paginatedTransactionsDataDto';
import type { UpdateInventoryDto } from '@/types/generated/updateInventoryDto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: InventoryControllerFindAllParams) =>
    [...inventoryKeys.lists(), params] as const,
  lowStock: (params?: InventoryControllerGetLowStockParams) =>
    [...inventoryKeys.all, 'low-stock', params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  byProduct: (productId: string) =>
    [...inventoryKeys.all, 'product', productId] as const,
  byVariant: (variantId: string) =>
    [...inventoryKeys.all, 'variant', variantId] as const,
  transactions: (id: string, params?: InventoryControllerGetTransactionsParams) =>
    [...inventoryKeys.detail(id), 'transactions', params] as const,
};

// Get all inventory records
export const useInventory = (params?: InventoryControllerFindAllParams) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedInventoryDataDto>>(
        '/inventory',
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

// Get low stock inventory
export const useLowStockInventory = (
  params?: InventoryControllerGetLowStockParams
) => {
  return useQuery({
    queryKey: inventoryKeys.lowStock(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedLowStockDataDto>>(
        '/inventory/low-stock',
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

// Get inventory by ID
export const useInventoryDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<InventoryResponseDto>>(
        `/inventory/${id}`
      );
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

// Get inventory by product
export const useInventoryByProduct = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: inventoryKeys.byProduct(productId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<InventoryResponseDto[]>>(
        `/inventory/product/${productId}`
      );
      return response.data;
    },
    enabled: enabled && !!productId,
  });
};

// Get inventory by variant
export const useInventoryByVariant = (variantId: string, enabled = true) => {
  return useQuery({
    queryKey: inventoryKeys.byVariant(variantId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<InventoryResponseDto>>(
        `/inventory/variant/${variantId}`
      );
      return response.data;
    },
    enabled: enabled && !!variantId,
  });
};

// Get inventory transactions
export const useInventoryTransactions = (
  id: string,
  params?: InventoryControllerGetTransactionsParams,
  enabled = true
) => {
  return useQuery({
    queryKey: inventoryKeys.transactions(id, params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedTransactionsDataDto>>(
        `/inventory/${id}/transactions`,
        { params }
      );
      const transactionsData = response.data.data;
      return {
        data: transactionsData.items || [],
        pagination: {
          total: transactionsData.total,
          page: transactionsData.page,
          limit: transactionsData.limit,
          totalPages: transactionsData.totalPages,
        },
      };
    },
    enabled: enabled && !!id,
  });
};

// Update inventory settings
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInventoryDto;
    }) => {
      const response = await api.patch<ApiResponse<InventoryResponseDto>>(
        `/inventory/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      toast.success('Inventory settings updated successfully');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update inventory settings');
    },
  });
};

// Adjust stock
export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AdjustInventoryDto;
    }) => {
      const response = await api.post<ApiResponse<InventoryResponseDto>>(
        `/inventory/${id}/adjust`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      toast.success('Stock adjusted successfully');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.transactions(variables.id)
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust stock');
    },
  });
};
