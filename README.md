4th YEAR V.1

## Realtime (Socket.IO)

This project uses **Socket.IO** for realtime updates across the app (JWT-authenticated).

### How it works
- **Backend**: `backend/index.js` starts Socket.IO and `backend/socket/socketServer.js` authenticates sockets using the same JWT token.
- **Frontend**: `frontend/src/contexts/SocketContext.jsx` creates one shared socket connection for the whole app (wrapped in `frontend/src/App.jsx`).
- **Events**: Backend emits events via `backend/socket/socketService.js` (centralized).

### Example: Assessment Clearance realtime refresh
- **Backend emits**: `assessmentClearanceChanged` (action: created/updated/deleted)
  - Implemented in `backend/routes/FORMS/assessmentClearance.js`
  - Broadcasts to roles: `administrator`, `superadmin`, `technical`
- **Frontend listens**: `frontend/src/components/FORMS/AssessmentClearance.jsx`
  - Auto-refreshes records when the event is received
