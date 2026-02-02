import ApiInstance from '@/lib/httpclient';
import type { ApiResponse } from '@/types/general';
import type { Order } from '@/types/generated/order';
import type { CreateOrderDto } from '@/types/generated/createOrderDto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const api = ApiInstance.ApiPrivateApiInstance;

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: any) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

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
