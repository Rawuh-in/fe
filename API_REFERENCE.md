# API Reference

This document contains the complete API specification for the Event Organizer backend.

**Base URL**: `http://localhost:8080` (development) or `https://be-service-0f01851c6cbd.herokuapp.com` (production)

## Authentication

All endpoints except `/login` require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### POST /login

Authenticate and receive an access token.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "access_token": "Bearer <uuid-token>",
  "message": "success"
}
```

**Note**: The backend returns the token WITH the "Bearer " prefix already included. The client must strip this prefix before storing and re-adding it to the Authorization header.

---

## Events API

### GET /{projectID}/events/list

Get list of events for a project.

**Path Parameters**:
- `projectID` (integer, required) - Project ID (typically `1`)

**Query Parameters**:
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 10)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success",
  "data": [
    {
      "eventID": 1,
      "eventName": "string",
      "description": "string",
      "options": "string",
      "projectID": 1,
      "createdAt": "2025-01-09T00:00:00Z",
      "updatedAt": "2025-01-09T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalRows": 1
  }
}
```

### POST /{projectID}/events/add

Create a new event.

**Path Parameters**:
- `projectID` (integer, required)

**Request Body**:
```json
{
  "eventName": "string",
  "description": "string",
  "options": "string"
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success",
  "data": {
    "eventID": 1,
    "eventName": "string",
    "description": "string",
    "options": "string",
    "projectID": 1,
    "createdAt": "2025-01-09T00:00:00Z",
    "updatedAt": "2025-01-09T00:00:00Z"
  }
}
```

### PUT /{projectID}/events/edit/{eventID}

Update an existing event.

**Path Parameters**:
- `projectID` (integer, required)
- `eventID` (integer, required)

**Request Body**:
```json
{
  "eventName": "string",
  "description": "string",
  "options": "string"
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

### DELETE /{projectID}/events/delete/{eventID}

Delete an event.

**Path Parameters**:
- `projectID` (integer, required)
- `eventID` (integer, required)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

---

## Guests API

### GET /{projectID}/guests/list

Get list of guests (event participants).

**Path Parameters**:
- `projectID` (integer, required)

**Query Parameters**:
- `eventID` (integer, optional) - Filter by event ID
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 10)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success",
  "data": [
    {
      "guestID": 1,
      "guestName": "string",
      "email": "string",
      "phoneNumber": "string",
      "customData": "string",
      "qrCode": "string",
      "eventID": 1,
      "projectID": 1,
      "createdAt": "2025-01-09T00:00:00Z",
      "updatedAt": "2025-01-09T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalRows": 1
  }
}
```

### POST /{projectID}/guests/add

Add a new guest to an event.

**Path Parameters**:
- `projectID` (integer, required)

**Request Body**:
```json
{
  "guestName": "string",
  "email": "string",
  "phoneNumber": "string",
  "customData": "string",
  "eventID": 1
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success",
  "data": {
    "guestID": 1,
    "guestName": "string",
    "email": "string",
    "phoneNumber": "string",
    "customData": "string",
    "qrCode": "string",
    "eventID": 1,
    "projectID": 1,
    "createdAt": "2025-01-09T00:00:00Z",
    "updatedAt": "2025-01-09T00:00:00Z"
  }
}
```

### PUT /{projectID}/guests/edit/{guestID}

Update guest information.

**Path Parameters**:
- `projectID` (integer, required)
- `guestID` (integer, required)

**Request Body**:
```json
{
  "guestName": "string",
  "email": "string",
  "phoneNumber": "string",
  "customData": "string"
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

### DELETE /{projectID}/guests/delete/{guestID}

Delete a guest.

**Path Parameters**:
- `projectID` (integer, required)
- `guestID` (integer, required)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

### POST /{projectID}/guests/checkin/{guestID}

Check in a guest (mark as attended).

**Path Parameters**:
- `projectID` (integer, required)
- `guestID` (integer, required)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

---

## Users API (Staff Management)

### GET /users

Get list of staff users.

**Query Parameters**:
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 10)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success",
  "data": [
    {
      "userID": 1,
      "username": "string",
      "role": "string",
      "createdAt": "2025-01-09T00:00:00Z",
      "updatedAt": "2025-01-09T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalRows": 1
  }
}
```

### POST /users

Create a new staff user.

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "role": "string"
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success",
  "data": {
    "userID": 1,
    "username": "string",
    "role": "string",
    "createdAt": "2025-01-09T00:00:00Z",
    "updatedAt": "2025-01-09T00:00:00Z"
  }
}
```

### PUT /users/{userID}

Update staff user information.

**Path Parameters**:
- `userID` (integer, required)

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "role": "string"
}
```

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

### DELETE /users/{userID}

Delete a staff user.

**Path Parameters**:
- `userID` (integer, required)

**Response** (200 OK):
```json
{
  "error": false,
  "code": 200,
  "message": "success"
}
```

---

## Response Structure

All API responses follow this structure:

```json
{
  "error": boolean,
  "code": number,
  "message": "string",
  "data": <any> | null,
  "pagination": {
    "page": number,
    "limit": number,
    "totalPages": number,
    "totalRows": number
  } | null
}
```

### Error Responses

**401 Unauthorized** (Missing or invalid token):
```json
{
  "error": true,
  "code": 401,
  "message": "Unauthorized"
}
```

**400 Bad Request** (Invalid input):
```json
{
  "error": true,
  "code": 400,
  "message": "error description"
}
```

**500 Internal Server Error**:
```json
{
  "error": true,
  "code": 500,
  "message": "Internal server error"
}
```

---

## Field Naming Conventions

- **Entities use ID suffix**: `eventID`, `guestID`, `userID`, `projectID` (camelCase with capital ID)
- **Dates**: ISO 8601 format strings (`createdAt`, `updatedAt`)
- **Response keys**: camelCase (`error`, `code`, `message`, `data`, `pagination`)
- **Pagination**: `page`, `limit`, `totalPages`, `totalRows`

---

## Notes

1. **Project ID**: Most endpoints require a `projectID` path parameter. For this implementation, we use `1` as the default project ID.

2. **Options Field**: The `options` field in events is a JSON string that should be parsed. It contains hotel/room configurations:
   ```json
   {
     "Hotels": ["Hotel A", "Hotel B"],
     "Rooms": ["101", "102", "201"]
   }
   ```

3. **Custom Data Field**: The `customData` field in guests is a JSON string for flexible guest metadata (assignments, dietary restrictions, etc.)

4. **QR Codes**: Generated automatically by the backend when a guest is created.

5. **Token Management**: The backend returns tokens with "Bearer " prefix included. Client must strip this before storage and re-add it when making requests.
