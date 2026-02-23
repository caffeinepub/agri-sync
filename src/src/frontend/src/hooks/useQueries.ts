import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { 
  Product, 
  UserProfile, 
  Order, 
  ProductCategory, 
  ProductUnit, 
  OrderStatus, 
  OrderItem,
  PlatformAnalytics,
  ExternalBlob
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// ===== User Profile Queries =====

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      // Use getAllActiveUsers as the backend doesn't have getAllUsers
      const activeUsers = await actor.getAllActiveUsers();
      const suspendedUsers = await actor.getAllSuspendedUsers();
      return [...activeUsers, ...suspendedUsers];
    },
    enabled: !!actor && !isFetching,
  });
}

// ===== Product Queries =====

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) return null;
      return actor.getProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useGetProductsByCategory(category: ProductCategory | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['productsByCategory', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null,
  });
}

export function useGetProductsByFarmer(farmer: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['productsByFarmer', farmer?.toString()],
    queryFn: async () => {
      if (!actor || !farmer) return [];
      return actor.getProductsByFarmer(farmer);
    },
    enabled: !!actor && !isFetching && farmer !== null,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      price,
      quantity,
      unit,
      organic,
      image,
    }: {
      name: string;
      description: string;
      category: ProductCategory;
      price: number;
      quantity: bigint;
      unit: ProductUnit;
      organic: boolean;
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(name, description, category, price, quantity, unit, organic, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsByFarmer'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      name,
      description,
      category,
      price,
      quantity,
      unit,
      organic,
      image,
    }: {
      productId: bigint;
      name: string;
      description: string;
      category: ProductCategory;
      price: number;
      quantity: bigint;
      unit: ProductUnit;
      organic: boolean;
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(productId, name, description, category, price, quantity, unit, organic, image);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['productsByFarmer'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productsByFarmer'] });
    },
  });
}

// ===== Order Queries =====

export function useGetUserOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['userOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFarmerOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['farmerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFarmerOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, farmer }: { items: OrderItem[]; farmer: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(items, farmer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

// ===== Admin Queries =====

export function useGetPlatformAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<PlatformAnalytics>({
    queryKey: ['platformAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlatformAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ===== Admin Mutations =====

export function useGetAllUsersWithStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allUsersWithStats'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersWithStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserStats(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['userStats', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getUserStats(userPrincipal);
    },
    enabled: !!actor && !isFetching && userPrincipal !== null,
  });
}

export function useSetUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPrincipal, role }: { userPrincipal: Principal; role: any }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setUserRoleProfile(userPrincipal, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersWithStats'] });
    },
  });
}

export function useSetSuspendedProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPrincipal, suspended }: { userPrincipal: Principal; suspended: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setSuspendedProfile(userPrincipal, suspended);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersWithStats'] });
      queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
    },
  });
}

export function useDeleteUserAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteUserAccount(userPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersWithStats'] });
      queryClient.invalidateQueries({ queryKey: ['platformAnalytics'] });
    },
  });
}

export function useModerateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      available,
      moderationNote,
    }: {
      productId: bigint;
      available: boolean;
      moderationNote: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.moderateProduct(productId, available, moderationNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useBulkUpdateProductAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productIds, available }: { productIds: bigint[]; available: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.bulkUpdateProductAvailability(productIds, available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGetRecentActivity() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRecentActivity();
    },
    enabled: !!actor && !isFetching,
  });
}
