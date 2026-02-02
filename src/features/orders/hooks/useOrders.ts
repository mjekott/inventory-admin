import ApiInstance from '@/lib/httpclient';
import type { ApiResponse, OrderWithCreator } from '@/types/general';
import type { Order } from '@/types/generated/order';
import type { CreateOrderDto } from '@/types/generated/createOrderDto';
import type { UpdateOrderDto } from '@/types/generated/updateOrderDto';
import type { MarkOrderPaidDto } from '@/types/generated/markOrderPaidDto';
import type { OrdersControllerFindAllParams } from '@/types/generated/ordersControllerFindAllParams';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Extended Order type with creator field
export type OrderWithCreatorDetails = Order & OrderWithCreator;

const api = ApiInstance.ApiPrivateApiInstance;

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: OrdersControllerFindAllParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Get all orders with pagination and filters
export const useOrders = (params?: OrdersControllerFindAllParams) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/orders', {
        params,
      });
      const paginatedData = response.data.data;
      // API returns 'items' array but type definition says 'data'
      const orders = paginatedData.items || paginatedData.data || [];
      return {
        data: orders,
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

// Get single order by ID
export const useOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<OrderWithCreatorDetails>>(`/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id && enabled,
  });
};

// Create new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      const response = await api.post<ApiResponse<Order>>('/orders', data);
      return response.data.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(`Order ${order.orderNumber} created successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create order');
    },
  });
};

// Update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderDto }) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}`, data);
      return response.data.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update order');
    },
  });
};

// Mark order as paid (PATCH request - auto-confirms and deducts stock)
export const useMarkOrderPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MarkOrderPaidDto }) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/mark-paid`, data);
      return response.data.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order marked as paid');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark order as paid');
    },
  });
};

// Confirm order (PATCH request - manually confirm and deduct stock)
export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/confirm`);
      return response.data.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order confirmed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to confirm order');
    },
  });
};

// Complete order (PATCH request)
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/complete`);
      return response.data.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order completed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to complete order');
    },
  });
};

// Cancel order (PATCH request - restores stock if confirmed)
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
      return response.data.data;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Order cancelled');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel order');
    },
  });
};
