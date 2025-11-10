/**
 * API Integration Tests
 *
 * These tests verify all API endpoints work correctly with the backend server.
 * Tests authenticate first and then test all CRUD operations.
 *
 * Prerequisites:
 * - Backend server must be running at VITE_API_BASE_URL or http://localhost:8080
 * - Test credentials must be configured in environment variables
 *
 * Run with: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  authApi,
  eventApi,
  guestApi,
  userApi,
  setAuthToken,
  clearAuthToken,
  stringifyEventOptions,
  stringifyGuestCustomData,
  type Event,
  type Guest,
  type User,
} from './index';

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_CONFIG = {
  baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
  credentials: {
    username: process.env.VITE_TEST_USERNAME || 'testadmin',
    password: process.env.VITE_TEST_PASSWORD || 'testpassword123',
  },
};

// Test data IDs (will be populated during tests)
let authToken: string;
let createdEventId: number;
let createdUserId: number;
let createdGuestId: number;

// ============================================================================
// Authentication Tests
// ============================================================================

describe('Authentication API', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await authApi.login(
      TEST_CONFIG.credentials.username,
      TEST_CONFIG.credentials.password
    );

    expect(response).toBeDefined();
    expect(response.error).toBe(false);
    expect(response.access_token).toBeDefined();
    expect(typeof response.access_token).toBe('string');
    expect(response.access_token.length).toBeGreaterThan(0);

    // Store token for subsequent tests
    authToken = response.access_token;
    setAuthToken(authToken);

    console.log('✓ Login successful, token received');
  }, 10000);

  it('should fail login with invalid credentials', async () => {
    await expect(authApi.login('invaliduser', 'invalidpassword')).rejects.toThrow();

    console.log('✓ Invalid login correctly rejected');
  }, 10000);
});

// ============================================================================
// Event API Tests (CRUD)
// ============================================================================

describe('Event API', () => {
  beforeAll(() => {
    // Ensure we have auth token
    if (authToken) {
      setAuthToken(authToken);
    }
  });

  it('should list events', async () => {
    const response = await eventApi.list({ page: 1, limit: 10 });

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();
    expect(response.Data || response.data).toBeDefined();
    expect(Array.isArray(response.Data || response.data)).toBe(true);

    // Check pagination
    const pagination = response.Pagination || response.pagination;
    if (pagination) {
      expect(pagination.Page || pagination.page).toBeDefined();
      expect(pagination.TotalPage || pagination.totalPages).toBeDefined();
    }

    console.log(`✓ Listed ${(response.Data || response.data)?.length || 0} events`);
  }, 10000);

  it('should create a new event', async () => {
    const eventData = {
      eventName: `Test Event ${Date.now()}`,
      description: 'Integration test event',
      options: stringifyEventOptions({
        Hotels: ['Test Hotel A', 'Test Hotel B'],
        Rooms: ['Room 101', 'Room 102'],
      }),
    };

    const response = await eventApi.create(eventData);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    const eventResult = response.Data || response.data;
    expect(eventResult).toBeDefined();

    // Store the created event ID for subsequent tests
    if (eventResult && typeof eventResult === 'object' && 'ID' in eventResult) {
      createdEventId = (eventResult as Event).ID!;
    } else if (
      eventResult &&
      typeof eventResult === 'object' &&
      'eventID' in eventResult
    ) {
      createdEventId = (eventResult as Event).eventID!;
    }

    expect(createdEventId).toBeDefined();
    console.log(`✓ Created event with ID: ${createdEventId}`);
  }, 10000);

  it('should update an event', async () => {
    expect(createdEventId).toBeDefined();

    const updateData = {
      eventName: `Updated Test Event ${Date.now()}`,
      description: 'Updated integration test event',
      options: stringifyEventOptions({
        Hotels: ['Updated Hotel'],
        Rooms: ['Updated Room'],
      }),
    };

    const response = await eventApi.update(createdEventId, updateData);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Updated event ID: ${createdEventId}`);
  }, 10000);

  it('should NOT delete the event yet (needed for guest tests)', () => {
    // We'll delete the event after guest tests
    expect(createdEventId).toBeDefined();
    console.log(`✓ Event ID ${createdEventId} preserved for guest tests`);
  });
});

// ============================================================================
// User API Tests (CRUD)
// ============================================================================

describe('User API', () => {
  beforeAll(() => {
    if (authToken) {
      setAuthToken(authToken);
    }
  });

  it('should list users', async () => {
    const response = await userApi.list({ page: 1, limit: 10 });

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();
    expect(response.Data || response.data).toBeDefined();
    expect(Array.isArray(response.Data || response.data)).toBe(true);

    console.log(`✓ Listed ${(response.Data || response.data)?.length || 0} users`);
  }, 10000);

  it('should create a new user', async () => {
    const userData = {
      username: `testuser_${Date.now()}`,
      password: 'testpass123',
      role: 'PROJECT_USER',
    };

    const response = await userApi.create(userData);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    const userResult = response.Data || response.data;
    expect(userResult).toBeDefined();

    // Store the created user ID
    if (userResult && typeof userResult === 'object' && 'ID' in userResult) {
      createdUserId = (userResult as User).ID!;
    } else if (userResult && typeof userResult === 'object' && 'userID' in userResult) {
      createdUserId = (userResult as User).userID!;
    }

    expect(createdUserId).toBeDefined();
    console.log(`✓ Created user with ID: ${createdUserId}`);
  }, 10000);

  it('should update a user', async () => {
    expect(createdUserId).toBeDefined();

    const updateData = {
      username: `updated_testuser_${Date.now()}`,
      role: 'SYSTEM_ADMIN',
    };

    const response = await userApi.update(createdUserId, updateData);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Updated user ID: ${createdUserId}`);
  }, 10000);

  it('should delete a user', async () => {
    expect(createdUserId).toBeDefined();

    const response = await userApi.delete(createdUserId);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Deleted user ID: ${createdUserId}`);
  }, 10000);
});

// ============================================================================
// Guest API Tests (CRUD)
// ============================================================================

describe('Guest API', () => {
  beforeAll(() => {
    if (authToken) {
      setAuthToken(authToken);
    }
  });

  it('should list guests for an event', async () => {
    expect(createdEventId).toBeDefined();

    const response = await guestApi.list(createdEventId, { page: 1, limit: 10 });

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();
    expect(response.Data || response.data).toBeDefined();
    expect(Array.isArray(response.Data || response.data)).toBe(true);

    console.log(
      `✓ Listed ${(response.Data || response.data)?.length || 0} guests for event ${createdEventId}`
    );
  }, 10000);

  it('should create a new guest', async () => {
    expect(createdEventId).toBeDefined();

    const guestData = {
      guestName: `Test Guest ${Date.now()}`,
      email: `testguest_${Date.now()}@test.com`,
      phoneNumber: '+1234567890',
      customData: stringifyGuestCustomData({
        hotel: 'Test Hotel',
        room: 'Room 101',
        checkInDate: '2025-01-01',
      }),
      eventID: createdEventId,
    };

    const response = await guestApi.create(createdEventId, guestData);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    const guestResult = response.Data || response.data;
    expect(guestResult).toBeDefined();

    // Store the created guest ID
    if (guestResult && typeof guestResult === 'object' && 'ID' in guestResult) {
      createdGuestId = (guestResult as Guest).ID!;
    } else if (
      guestResult &&
      typeof guestResult === 'object' &&
      'guestID' in guestResult
    ) {
      createdGuestId = (guestResult as Guest).guestID!;
    }

    expect(createdGuestId).toBeDefined();
    console.log(`✓ Created guest with ID: ${createdGuestId}`);
  }, 10000);

  it('should update a guest', async () => {
    expect(createdEventId).toBeDefined();
    expect(createdGuestId).toBeDefined();

    const updateData = {
      guestName: `Updated Guest ${Date.now()}`,
      email: `updated_${Date.now()}@test.com`,
      phoneNumber: '+9876543210',
      customData: stringifyGuestCustomData({
        hotel: 'Updated Hotel',
        room: 'Room 202',
      }),
    };

    const response = await guestApi.update(createdEventId, createdGuestId, updateData);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Updated guest ID: ${createdGuestId}`);
  }, 10000);

  it('should check in a guest', async () => {
    expect(createdGuestId).toBeDefined();

    const response = await guestApi.checkin(createdGuestId);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Checked in guest ID: ${createdGuestId}`);
  }, 10000);

  it('should delete a guest', async () => {
    expect(createdEventId).toBeDefined();
    expect(createdGuestId).toBeDefined();

    const response = await guestApi.delete(createdEventId, createdGuestId);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Deleted guest ID: ${createdGuestId}`);
  }, 10000);
});

// ============================================================================
// Cleanup
// ============================================================================

describe('Cleanup', () => {
  it('should delete the test event', async () => {
    expect(createdEventId).toBeDefined();

    const response = await eventApi.delete(createdEventId);

    expect(response).toBeDefined();
    expect(response.Error || response.error).toBeFalsy();

    console.log(`✓ Deleted event ID: ${createdEventId}`);
  }, 10000);

  it('should clear auth token', () => {
    clearAuthToken();
    console.log('✓ Auth token cleared');
  });
});

// ============================================================================
// Test Summary
// ============================================================================

afterAll(() => {
  console.log('\n========================================');
  console.log('API Integration Tests Complete');
  console.log('========================================');
  console.log(`Event ID tested: ${createdEventId || 'N/A'}`);
  console.log(`User ID tested: ${createdUserId || 'N/A'}`);
  console.log(`Guest ID tested: ${createdGuestId || 'N/A'}`);
  console.log('========================================\n');
});
