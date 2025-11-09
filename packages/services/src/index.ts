import ky, { type KyInstance } from 'ky';
import { z } from 'zod';

// ============================================================================
// Base Response Types (flexible to accept both naming conventions)
// ============================================================================

// Flexible pagination schema
export const paginationSchema = z
  .object({
    page: z.number().optional(),
    Page: z.number().optional(),
    limit: z.number().optional(),
    Limit: z.number().optional(),
    totalPages: z.number().optional(),
    TotalPage: z.number().optional(),
    totalRows: z.number().optional(),
    TotalData: z.number().optional(),
  })
  .passthrough();

export type Pagination = z.infer<typeof paginationSchema>;

// Flexible response interface
export interface ApiResponse<T> {
  error?: boolean;
  Error?: boolean;
  code?: number;
  Code?: number;
  message?: string;
  Message?: string;
  data?: T;
  Data?: T;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: Pagination;
  Pagination?: Pagination;
}

// ============================================================================
// Guest Types (Backend: Guest, Frontend: Participant/Attendee)
// ============================================================================

// Flexible schema that accepts both camelCase (Swagger spec) and PascalCase (current backend)
export const guestSchema = z
  .object({
    // Accept both field naming conventions
    guestID: z.number().optional(),
    ID: z.number().optional(),
    projectID: z.number().optional(),
    ProjectID: z.number().optional(),
    eventID: z.number().optional(),
    EventId: z.number().optional(),
    guestName: z.string().optional(),
    Name: z.string().optional(),
    email: z.string().optional(),
    Email: z.string().optional(),
    phoneNumber: z.string().optional(),
    Phone: z.string().optional(),
    customData: z.string().optional(),
    Options: z.string().optional(), // Old field name
    qrCode: z.string().optional(),
    createdAt: z.string().optional(),
    CreatedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    UpdatedAt: z.string().optional(),
  })
  .passthrough(); // Allow additional fields

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

// Flexible schema that accepts both camelCase (Swagger spec) and PascalCase (current backend)
export const eventSchema = z
  .object({
    // Accept both field naming conventions
    eventID: z.number().optional(),
    ID: z.number().optional(),
    projectID: z.number().optional(),
    ProjectID: z.number().optional(),
    eventName: z.string().optional(),
    EventName: z.string().optional(),
    description: z.string().optional(),
    Description: z.string().optional(),
    options: z.string().optional(),
    Options: z.string().optional(),
    createdAt: z.string().optional(),
    CreatedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    UpdatedAt: z.string().optional(),
  })
  .passthrough(); // Allow additional fields

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

// Flexible schema that accepts both camelCase (Swagger spec) and PascalCase (current backend)
export const userSchema = z
  .object({
    // Accept both field naming conventions
    userID: z.number().optional(),
    ID: z.number().optional(),
    username: z.string().optional(),
    Username: z.string().optional(),
    role: z.string().optional(),
    UserType: z.string().optional(),
    Name: z.string().optional(),
    Email: z.string().optional(),
    createdAt: z.string().optional(),
    CreatedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    UpdatedAt: z.string().optional(),
  })
  .passthrough(); // Allow additional fields

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
  dir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  query?: string; // Base64 encoded filter
}

// ============================================================================
// API Client Configuration
// ============================================================================

const getBaseUrl = (): string => {
  // Next.js uses NEXT_PUBLIC_ prefix for client-side env vars
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

const getAuthToken = (): string | null => {
  // For now, hardcode or read from localStorage
  // TODO: Implement proper auth flow
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('authToken') || process.env.NEXT_PUBLIC_AUTH_TOKEN || null
    );
  }
  return process.env.NEXT_PUBLIC_AUTH_TOKEN || null;
};

const defaultHeaders = {
  'Content-Type': 'application/json',
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
          request.headers.set('Authorization', `Bearer ${token}`);
          console.log(
            'Authorization header set:',
            `Bearer ${token?.substring(0, 20)}...`
          );
        } else {
          console.warn('No auth token found!');
        }
      },
    ],
  },
});

// ============================================================================
// API Service Functions
// ============================================================================

// Hardcoded projectId as per requirement
const PROJECT_ID = '1';

// Guest API
export const guestApi = {
  list: async (
    eventId?: number,
    params?: ListQueryParams
  ): Promise<ApiListResponse<Guest>> => {
    const searchParams = new URLSearchParams();
    // if (eventId)
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return apiClient
      .get(`${PROJECT_ID}/events/${eventId}/guests/list?${searchParams.toString()}`)
      .json<ApiListResponse<Guest>>();
  },

  create: async (
    eventId: number,
    data: CreateGuestRequest
  ): Promise<ApiResponse<Guest>> => {
    return apiClient
      .post(`${PROJECT_ID}/events/${eventId}/guests`, { json: data })
      .json<ApiResponse<Guest>>();
  },

  update: async (
    eventId: number,
    guestId: number,
    data: UpdateGuestRequest
  ): Promise<ApiResponse<void>> => {
    return apiClient
      .put(`${PROJECT_ID}/events/${eventId}/guests/${guestId}`, { json: data })
      .json<ApiResponse<void>>();
  },

  delete: async (eventId: number, guestId: number): Promise<ApiResponse<void>> => {
    return apiClient
      .delete(`${PROJECT_ID}/events/${eventId}/guests/${guestId}`)
      .json<ApiResponse<void>>();
  },

  checkin: async (guestId: number): Promise<ApiResponse<void>> => {
    return apiClient
      .post(`${PROJECT_ID}/guests/checkin/${guestId}`)
      .json<ApiResponse<void>>();
  },
};

// Event API
export const eventApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<Event>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return apiClient
      .get(`${PROJECT_ID}/events/list?${searchParams.toString()}`)
      .json<ApiListResponse<Event>>();
  },

  create: async (data: CreateEventRequest): Promise<ApiResponse<Event>> => {
    return apiClient
      .post(`${PROJECT_ID}/events`, { json: data })
      .json<ApiResponse<Event>>();
  },

  update: async (
    eventId: number,
    data: UpdateEventRequest
  ): Promise<ApiResponse<void>> => {
    return apiClient
      .put(`${PROJECT_ID}/events/${eventId}`, { json: data })
      .json<ApiResponse<void>>();
  },

  delete: async (eventId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`${PROJECT_ID}/events/${eventId}`).json<ApiResponse<void>>();
  },
};

// User API
export const userApi = {
  list: async (params?: ListQueryParams): Promise<ApiListResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return apiClient
      .get(`users/list?${searchParams.toString()}`)
      .json<ApiListResponse<User>>();
  },

  create: async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    return apiClient.post('users', { json: data }).json<ApiResponse<User>>();
  },

  update: async (userId: number, data: UpdateUserRequest): Promise<ApiResponse<void>> => {
    return apiClient.put(`users/${userId}`, { json: data }).json<ApiResponse<void>>();
  },

  delete: async (userId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`users/${userId}`).json<ApiResponse<void>>();
  },
};

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return apiClient
      .post('login', {
        json: { username, password },
      })
      .json<LoginResponse>();
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

export const parseGuestCustomData = (customDataJson: string): GuestCustomData => {
  try {
    return JSON.parse(customDataJson || '{}');
  } catch {
    return {};
  }
};

export const stringifyGuestCustomData = (customData: GuestCustomData): string => {
  return JSON.stringify(customData);
};

export const parseEventOptions = (optionsJson: string): EventOptions => {
  try {
    return JSON.parse(optionsJson || '{}');
  } catch {
    return {};
  }
};

export const stringifyEventOptions = (options: EventOptions): string => {
  return JSON.stringify(options);
};

// Alias functions for backward compatibility (Options field is the same as CustomData)
export const parseGuestOptions = parseGuestCustomData;
export const stringifyGuestOptions = stringifyGuestCustomData;

// Set auth token (for use after login)
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

// Re-export hooks
export * from './hooks';
