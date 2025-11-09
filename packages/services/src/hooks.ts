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
  User
} from "./index";

// ============================================================================
// Query Keys (for cache management)
// ============================================================================

export const queryKeys = {
  events: {
    all: ["events"] as const,
    lists: () => [...queryKeys.events.all, "list"] as const,
    list: (params?: ListQueryParams) => [...queryKeys.events.lists(), params] as const,
    details: () => [...queryKeys.events.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const
  },
  guests: {
    all: ["guests"] as const,
    lists: () => [...queryKeys.guests.all, "list"] as const,
    list: (eventId: string, params?: ListQueryParams) =>
      [...queryKeys.guests.lists(), eventId, params] as const,
    details: () => [...queryKeys.guests.all, "detail"] as const,
    detail: (eventId: string, guestId: string) =>
      [...queryKeys.guests.details(), eventId, guestId] as const
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: ListQueryParams) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    me: () => [...queryKeys.users.all, "me"] as const
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

export function useEvent(eventId: string) {
  return useQuery<ApiResponse<Event>>({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventApi.getById(eventId),
    enabled: !!eventId
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventApi.create(data),
    onSuccess: () => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventRequest }) =>
      eventApi.update(eventId, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific event and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    }
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    }
  });
}

// ============================================================================
// Guest Hooks
// ============================================================================

export function useGuests(eventId: string, params?: ListQueryParams) {
  return useQuery<ApiListResponse<Guest>>({
    queryKey: queryKeys.guests.list(eventId, params),
    queryFn: () => guestApi.list(eventId, params),
    enabled: !!eventId
  });
}

export function useGuest(eventId: string, guestId: string) {
  return useQuery<ApiResponse<Guest>>({
    queryKey: queryKeys.guests.detail(eventId, guestId),
    queryFn: () => guestApi.getById(eventId, guestId),
    enabled: !!eventId && !!guestId
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CreateGuestRequest }) =>
      guestApi.create(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.lists() });
      // Also invalidate the specific event's guest list
      queryClient.invalidateQueries({
        queryKey: queryKeys.guests.list(variables.eventId)
      });
    }
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      guestId,
      data
    }: {
      eventId: string;
      guestId: string;
      data: UpdateGuestRequest;
    }) => guestApi.update(eventId, guestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guests.detail(variables.eventId, variables.guestId)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.guests.list(variables.eventId)
      });
    }
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, guestId }: { eventId: string; guestId: string }) =>
      guestApi.delete(eventId, guestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.guests.list(variables.eventId)
      });
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

export function useUser(userId: string) {
  return useQuery<ApiResponse<User>>({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userApi.getById(userId),
    enabled: !!userId
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

export function useCurrentUser() {
  return useQuery<ApiResponse<User>>({
    queryKey: queryKeys.users.me(),
    queryFn: () => userApi.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false // Don't retry if not authenticated
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
        localStorage.setItem("authToken", token);
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
