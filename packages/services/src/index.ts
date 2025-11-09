import ky, { type KyInstance } from "ky";
import { z } from "zod";

// ============================================================================
// Base Response Types (matching Go backend structure)
// ============================================================================

export const paginationSchema = z.object({
  Page: z.number(),
  Limit: z.number(),
  TotalPage: z.number(),
  TotalData: z.number()
});

export type Pagination = z.infer<typeof paginationSchema>;

export interface ApiResponse<T> {
  Error: boolean;
  Code: number;
  Message: string;
  Data: T;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  Pagination: Pagination;
}

// ============================================================================
// Guest Types (Backend: Guest, Frontend: Participant/Attendee)
// ============================================================================

export const guestSchema = z.object({
  ID: z.number(),
  ProjectID: z.number(),
  EventId: z.number(),
  Name: z.string(),
  Address: z.string().optional(),
  Phone: z.string().optional(),
  Email: z.string().optional(),
  Options: z.string(), // JSON string for hotel/room assignments
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  DeletedAt: z.string().nullable().optional()
});

export type Guest = z.infer<typeof guestSchema>;

export interface GuestOptions {
  Hotel?: string;
  Room?: string;
  CheckInDate?: string;
  CheckOutDate?: string;
  CheckedInAt?: string;
  [key: string]: unknown; // Allow custom fields
}

export interface CreateGuestRequest {
  Name: string;
  Address?: string;
  Phone?: string;
  Email?: string;
  EventId: string;
  Options?: string; // JSON string
}

export interface UpdateGuestRequest {
  Name: string;
  Address?: string;
  Phone?: string;
  Email?: string;
  Options?: string; // JSON string
}

// ============================================================================
// Event Types
// ============================================================================

export const eventSchema = z.object({
  ID: z.number(),
  ProjectID: z.number(),
  UserID: z.number(),
  EventName: z.string(),
  Description: z.string().optional(),
  Options: z.string(), // JSON string: {"Hotels":["A","B"],"Rooms":["1","2"]}
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  DeletedAt: z.string().nullable().optional()
});

export type Event = z.infer<typeof eventSchema>;

export interface EventOptions {
  Hotels?: string[];
  Rooms?: string[];
  [key: string]: unknown;
}

export interface CreateEventRequest {
  EventName: string;
  Description?: string;
  Options?: string; // JSON string
  UserID: string;
}

export interface UpdateEventRequest {
  EventName: string;
  Description?: string;
  Options?: string; // JSON string
  UserID: string;
}

// ============================================================================
// User Types
// ============================================================================

export const userSchema = z.object({
  ID: z.number(),
  ProjectID: z.number(),
  EventId: z.number().optional(),
  Name: z.string(),
  UserType: z.enum(["SYSTEM_ADMIN", "PROJECT_USER"]),
  Username: z.string(),
  Email: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  DeletedAt: z.string().nullable().optional()
});

export type User = z.infer<typeof userSchema>;

export interface CreateUserRequest {
  Name: string;
  UserType: "SYSTEM_ADMIN" | "PROJECT_USER";
  Username: string;
  Email: string;
  ProjectID: string;
  Password: string;
  EventId?: string;
}

export interface LoginResponse {
  Error: boolean;
  Code: number;
  Message: string;
  Data: {
    AccessToken: string;
    User: User;
  };
}

// ============================================================================
// List Query Parameters
// ============================================================================

export interface ListQueryParams {
  sort?: string; // Column name: created_at, name, etc.
  dir?: "asc" | "desc";
  page?: number;
  limit?: number;
  query?: string; // Base64 encoded filter
}

// ============================================================================
// API Client Configuration
// ============================================================================

const getBaseUrl = (): string => {
  // Next.js uses NEXT_PUBLIC_ prefix for client-side env vars
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
};

const getAuthToken = (): string | null => {
  // For now, hardcode or read from localStorage
  // TODO: Implement proper auth flow
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || process.env.NEXT_PUBLIC_AUTH_TOKEN || null;
  }
  return process.env.NEXT_PUBLIC_AUTH_TOKEN || null;
};

const defaultHeaders = {
  "Content-Type": "application/json"
};

export const apiClient: KyInstance = ky.create({
  prefixUrl: getBaseUrl(),
  headers: defaultHeaders,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAuthToken();
        console.log('API Request:', request.url);
        console.log('Auth token from storage:', token);
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
          console.log('Authorization header set:', `Bearer ${token?.substring(0, 20)}...`);
        } else {
          console.warn('No auth token found!');
        }
      }
    ]
  }
});

// ============================================================================
// API Service Functions
// ============================================================================

// Hardcoded projectId as per requirement
const PROJECT_ID = "1";

// Guest API
export const guestApi = {
  list: async (eventId: string, params?: ListQueryParams): Promise<ApiListResponse<Guest>> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.dir) searchParams.set("dir", params.dir);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.query) searchParams.set("query", params.query);

    return apiClient
      .get(`${PROJECT_ID}/events/${eventId}/guests/list?${searchParams.toString()}`)
      .json<ApiListResponse<Guest>>();
  },

  getById: async (eventId: string, guestId: string): Promise<ApiResponse<Guest>> => {
    return apiClient
      .get(`${PROJECT_ID}/events/${eventId}/guests/${guestId}`)
      .json<ApiResponse<Guest>>();
  },

  create: async (eventId: string, data: CreateGuestRequest): Promise<ApiResponse<Guest>> => {
    return apiClient
      .post(`${PROJECT_ID}/events/${eventId}/guests`, { json: data })
      .json<ApiResponse<Guest>>();
  },

  update: async (
    eventId: string,
    guestId: string,
    data: UpdateGuestRequest
  ): Promise<ApiResponse<Guest>> => {
    return apiClient
      .put(`${PROJECT_ID}/events/${eventId}/guests/${guestId}`, { json: data })
      .json<ApiResponse<Guest>>();
  },

  delete: async (eventId: string, guestId: string): Promise<void> => {
    await apiClient.delete(`${PROJECT_ID}/events/${eventId}/guests/${guestId}`);
  }
};

// Event API
export const eventApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<Event>> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.dir) searchParams.set("dir", params.dir);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.query) searchParams.set("query", params.query);

    return apiClient
      .get(`${PROJECT_ID}/events/list?${searchParams.toString()}`)
      .json<ApiListResponse<Event>>();
  },

  getById: async (eventId: string): Promise<ApiResponse<Event>> => {
    return apiClient.get(`${PROJECT_ID}/events/${eventId}`).json<ApiResponse<Event>>();
  },

  create: async (data: CreateEventRequest): Promise<ApiResponse<Event>> => {
    return apiClient.post(`${PROJECT_ID}/events`, { json: data }).json<ApiResponse<Event>>();
  },

  update: async (eventId: string, data: UpdateEventRequest): Promise<ApiResponse<Event>> => {
    return apiClient
      .put(`${PROJECT_ID}/events/${eventId}`, { json: data })
      .json<ApiResponse<Event>>();
  },

  delete: async (eventId: string): Promise<void> => {
    await apiClient.delete(`${PROJECT_ID}/events/${eventId}`);
  }
};

// User API (Note: Users are not scoped by project in the endpoints shown)
export const userApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.dir) searchParams.set("dir", params.dir);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.query) searchParams.set("query", params.query);

    return apiClient.get(`users/list?${searchParams.toString()}`).json<ApiListResponse<User>>();
  },

  getById: async (userId: string): Promise<ApiResponse<User>> => {
    return apiClient.get(`users/${userId}`).json<ApiResponse<User>>();
  },

  create: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    return apiClient.post("users", { json: data }).json<ApiResponse<User>>();
  },

  me: async (): Promise<ApiResponse<User>> => {
    return apiClient.get("auth/me").json<ApiResponse<User>>();
  }
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const credentials = btoa(`${username}:${password}`);
    return apiClient
      .post("login", {
        headers: {
          Authorization: `Basic ${credentials}`
        }
      })
      .json<LoginResponse>();
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const parseGuestOptions = (optionsJson: string): GuestOptions => {
  try {
    return JSON.parse(optionsJson || "{}");
  } catch {
    return {};
  }
};

export const stringifyGuestOptions = (options: GuestOptions): string => {
  return JSON.stringify(options);
};

export const parseEventOptions = (optionsJson: string): EventOptions => {
  try {
    return JSON.parse(optionsJson || "{}");
  } catch {
    return {};
  }
};

export const stringifyEventOptions = (options: EventOptions): string => {
  return JSON.stringify(options);
};

// Set auth token (for use after login)
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

// Re-export hooks
export * from "./hooks";
