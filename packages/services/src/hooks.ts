import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { eventApi, guestApi, userApi, authApi } from "./index";
import type {
  ApiListResponse,
  ApiResponse,
  CreateEventRequest,
  CreateGuestRequest,
  CreateUserRequest,
  Event,
  Guest,
  ListQueryParams,
  LoginResponse,
  UpdateEventRequest,
  UpdateGuestRequest,
  UpdateUserRequest,
  User
} from "./index";

// ============================================================================
// Query Keys (for cache management)
// ============================================================================

export const queryKeys = {
  events: {
    all: ["events"] as const,
    lists: () => [...queryKeys.events.all, "list"] as const,
    list: (params?: ListQueryParams) => [...queryKeys.events.lists(), params] as const
  },
  guests: {
    all: ["guests"] as const,
    lists: () => [...queryKeys.guests.all, "list"] as const,
    list: (eventId?: number, params?: ListQueryParams) =>
      [...queryKeys.guests.lists(), eventId, params] as const
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: ListQueryParams) => [...queryKeys.users.lists(), params] as const
  }
};

// ============================================================================
// Event Hooks
// ============================================================================

export function useEvents(params?: ListQueryParams) {
  return useQuery<ApiListResponse<Event>>({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventApi.list(params)
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: UpdateEventRequest }) =>
      eventApi.update(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    }
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    }
  });
}

// ============================================================================
// Guest Hooks
// ============================================================================

export function useGuests(eventId?: number, params?: ListQueryParams) {
  return useQuery<ApiListResponse<Guest>>({
    queryKey: queryKeys.guests.list(eventId, params),
    queryFn: () => guestApi.list(eventId, params)
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGuestRequest) => guestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.lists() });
    }
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, data }: { guestId: number; data: UpdateGuestRequest }) =>
      guestApi.update(guestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.lists() });
    }
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestId: number) => guestApi.delete(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.lists() });
    }
  });
}

export function useCheckinGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestId: number) => guestApi.checkin(guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.lists() });
    }
  });
}

// ============================================================================
// User Hooks
// ============================================================================

export function useUsers(params?: ListQueryParams) {
  return useQuery<ApiListResponse<User>>({
    queryKey: queryKeys.users.list(params),
    queryFn: () => userApi.list(params)
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateUserRequest }) =>
      userApi.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    }
  });
}

// ============================================================================
// Auth Hooks
// ============================================================================

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authApi.login(username, password),
    onSuccess: (data: any) => {
      console.log('Login response:', data);

      // Handle different possible response structures
      let token: string | null = null;

      if (data?.Data?.AccessToken) {
        // Expected structure: { Data: { AccessToken: "..." } }
        token = data.Data.AccessToken;
      } else if (data?.AccessToken) {
        // Alternative: { AccessToken: "..." }
        token = data.AccessToken;
      } else if (data?.access_token) {
        // Alternative: { access_token: "..." }
        token = data.access_token;
      } else if (data?.token) {
        // Alternative: { token: "..." }
        token = data.token;
      } else if (typeof data === 'string') {
        // Response is just a token string
        token = data;
      }

      if (token && typeof window !== "undefined") {
        // Strip "Bearer " prefix if it exists
        const cleanToken = token.replace(/^Bearer\s+/i, '');
        console.log('Storing token (cleaned):', cleanToken);
        localStorage.setItem("authToken", cleanToken);
        // Invalidate all queries to refetch with new auth
        queryClient.invalidateQueries();
      } else {
        console.error('Could not extract token from response:', data);
        throw new Error('Login succeeded but token not found in response');
      }
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear token
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    }
  });
}
