import ky, { type KyInstance } from "ky";
import { z } from "zod";

// ============================================================================
// Base Response Types (matching actual backend API from Swagger spec)
// ============================================================================

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  totalRows: z.number()
});

export type Pagination = z.infer<typeof paginationSchema>;

export interface ApiResponse<T> {
  error: boolean;
  code: number;
  message: string;
  data: T;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// ============================================================================
// Guest Types (Backend: Guest, Frontend: Participant/Attendee)
// ============================================================================

export const guestSchema = z.object({
  guestID: z.number(),
  projectID: z.number(),
  eventID: z.number(),
  guestName: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  customData: z.string(), // JSON string for hotel/room assignments
  qrCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Guest = z.infer<typeof guestSchema>;

export interface GuestCustomData {
  hotel?: string;
  room?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkedInAt?: string;
  [key: string]: unknown; // Allow custom fields
}

export interface CreateGuestRequest {
  guestName: string;
  email?: string;
  phoneNumber?: string;
  customData?: string; // JSON string
  eventID: number;
}

export interface UpdateGuestRequest {
  guestName: string;
  email?: string;
  phoneNumber?: string;
  customData?: string; // JSON string
}

// ============================================================================
// Event Types
// ============================================================================

export const eventSchema = z.object({
  eventID: z.number(),
  projectID: z.number(),
  eventName: z.string(),
  description: z.string().optional(),
  options: z.string(), // JSON string: {"Hotels":["A","B"],"Rooms":["1","2"]}
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Event = z.infer<typeof eventSchema>;

export interface EventOptions {
  Hotels?: string[];
  Rooms?: string[];
  [key: string]: unknown;
}

export interface CreateEventRequest {
  eventName: string;
  description?: string;
  options?: string; // JSON string
}

export interface UpdateEventRequest {
  eventName: string;
  description?: string;
  options?: string; // JSON string
}

// ============================================================================
// User Types
// ============================================================================

export const userSchema = z.object({
  userID: z.number(),
  username: z.string(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type User = z.infer<typeof userSchema>;

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: string;
}

export interface LoginResponse {
  error: boolean;
  code: number;
  message: string;
  access_token: string;
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
  list: async (eventId?: number, params?: ListQueryParams): Promise<ApiListResponse<Guest>> => {
    const searchParams = new URLSearchParams();
    if (eventId) searchParams.set("eventID", eventId.toString());
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return apiClient
      .get(`${PROJECT_ID}/guests/list?${searchParams.toString()}`)
      .json<ApiListResponse<Guest>>();
  },

  create: async (data: CreateGuestRequest): Promise<ApiResponse<Guest>> => {
    return apiClient
      .post(`${PROJECT_ID}/guests/add`, { json: data })
      .json<ApiResponse<Guest>>();
  },

  update: async (
    guestId: number,
    data: UpdateGuestRequest
  ): Promise<ApiResponse<void>> => {
    return apiClient
      .put(`${PROJECT_ID}/guests/edit/${guestId}`, { json: data })
      .json<ApiResponse<void>>();
  },

  delete: async (guestId: number): Promise<ApiResponse<void>> => {
    return apiClient
      .delete(`${PROJECT_ID}/guests/delete/${guestId}`)
      .json<ApiResponse<void>>();
  },

  checkin: async (guestId: number): Promise<ApiResponse<void>> => {
    return apiClient
      .post(`${PROJECT_ID}/guests/checkin/${guestId}`)
      .json<ApiResponse<void>>();
  }
};

// Event API
export const eventApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<Event>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return apiClient
      .get(`${PROJECT_ID}/events/list?${searchParams.toString()}`)
      .json<ApiListResponse<Event>>();
  },

  create: async (data: CreateEventRequest): Promise<ApiResponse<Event>> => {
    return apiClient
      .post(`${PROJECT_ID}/events/add`, { json: data })
      .json<ApiResponse<Event>>();
  },

  update: async (eventId: number, data: UpdateEventRequest): Promise<ApiResponse<void>> => {
    return apiClient
      .put(`${PROJECT_ID}/events/edit/${eventId}`, { json: data })
      .json<ApiResponse<void>>();
  },

  delete: async (eventId: number): Promise<ApiResponse<void>> => {
    return apiClient
      .delete(`${PROJECT_ID}/events/delete/${eventId}`)
      .json<ApiResponse<void>>();
  }
};

// User API
export const userApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return apiClient.get(`users?${searchParams.toString()}`).json<ApiListResponse<User>>();
  },

  create: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    return apiClient.post("users", { json: data }).json<ApiResponse<User>>();
  },

  update: async (userId: number, data: UpdateUserRequest): Promise<ApiResponse<void>> => {
    return apiClient.put(`users/${userId}`, { json: data }).json<ApiResponse<void>>();
  },

  delete: async (userId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`users/${userId}`).json<ApiResponse<void>>();
  }
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return apiClient
      .post("login", {
        json: { username, password }
      })
      .json<LoginResponse>();
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const parseGuestCustomData = (customDataJson: string): GuestCustomData => {
  try {
    return JSON.parse(customDataJson || "{}");
  } catch {
    return {};
  }
};

export const stringifyGuestCustomData = (customData: GuestCustomData): string => {
  return JSON.stringify(customData);
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
