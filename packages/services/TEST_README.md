# API Integration Tests

Comprehensive integration tests for all API endpoints against the backend server.

## Prerequisites

1. **Backend server must be running** at the configured URL
2. **Test credentials** must exist on the backend server
3. **Environment variables** must be configured

## Setup

### 1. Create .env file

Copy the example file and update with your backend details:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8080

# Test credentials (must exist on the backend)
VITE_TEST_USERNAME=testadmin
VITE_TEST_PASSWORD=testpassword123
```

### 2. Ensure Backend is Running

Make sure your backend server is running and accessible at the configured URL.

### 3. Create Test User (if needed)

The test user must exist on the backend with the credentials specified in `.env`. You may need to create this user manually via your backend admin panel or API.

## Running Tests

### Run all tests once

```bash
npm test
```

### Watch mode (re-run on file changes)

```bash
npm run test:watch
```

### Interactive UI

```bash
npm run test:ui
```

### With coverage report

```bash
npm run test:coverage
```

## What the Tests Cover

### Authentication

- ✅ Login with valid credentials
- ✅ Login failure with invalid credentials
- ✅ Token storage and retrieval

### Event API (CRUD)

- ✅ List events
- ✅ Create event
- ✅ Update event
- ✅ Delete event

### User API (CRUD)

- ✅ List users
- ✅ Create user
- ✅ Update user
- ✅ Delete user

### Guest API (CRUD)

- ✅ List guests for an event
- ✅ Create guest
- ✅ Update guest
- ✅ Check in guest
- ✅ Delete guest

## Test Flow

1. **Authenticate**: Login to get auth token
2. **Create Resources**: Create test event, user, and guest
3. **Read Resources**: List and verify resources
4. **Update Resources**: Modify resources and verify changes
5. **Delete Resources**: Clean up test data
6. **Cleanup**: Remove auth token

## Troubleshooting

### "Cannot find module" errors

Make sure dependencies are installed:

```bash
npm install
```

### "Network request failed" errors

- Check that backend server is running at the configured URL
- Verify `VITE_API_BASE_URL` in `.env` is correct
- Check firewall/network settings

### "401 Unauthorized" errors

- Verify test credentials in `.env` are correct
- Ensure the test user exists on the backend
- Check that the user has proper permissions

### "404 Not Found" errors

- Verify backend API endpoints match the expected routes
- Check backend server logs for errors
- Ensure project ID is configured correctly (default: 1)

## Example Output

```
 ✓ Authentication API (2)
   ✓ should login successfully with valid credentials
   ✓ should fail login with invalid credentials

 ✓ Event API (4)
   ✓ should list events
   ✓ should create a new event
   ✓ should update an event
   ✓ should NOT delete the event yet (needed for guest tests)

 ✓ User API (4)
   ✓ should list users
   ✓ should create a new user
   ✓ should update a user
   ✓ should delete a user

 ✓ Guest API (5)
   ✓ should list guests for an event
   ✓ should create a new guest
   ✓ should update a guest
   ✓ should check in a guest
   ✓ should delete a guest

 ✓ Cleanup (2)
   ✓ should delete the test event
   ✓ should clear auth token

Test Files  1 passed (1)
     Tests  17 passed (17)
```

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    npm test --workspace packages/services
  env:
    VITE_API_BASE_URL: ${{ secrets.TEST_API_URL }}
    VITE_TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
    VITE_TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## Notes

- Tests create temporary data during execution
- All test data is cleaned up automatically
- Tests run sequentially to maintain dependencies
- Default timeout: 10 seconds per test
- Total test suite should complete in ~30-60 seconds
