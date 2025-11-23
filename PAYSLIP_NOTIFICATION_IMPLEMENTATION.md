# Payslip Notification System Implementation

## Overview
This implementation adds a notification system that alerts employees when their payslips are processed and sent via Gmail. Employees can click on these notifications to navigate directly to their payslip page.

## Changes Made

### 1. Database Schema Update
**File:** `database_migration_add_notification_fields.sql`

Added two new columns to the `notifications` table:
- `notification_type` (VARCHAR(50)): Type of notification (e.g., 'payslip', 'leave')
- `action_link` (VARCHAR(255)): Route to navigate when notification is clicked

**To apply:** Run the SQL migration file on your database:
```sql
ALTER TABLE `notifications` 
ADD COLUMN `notification_type` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Type of notification: payslip, leave, etc.' AFTER `description`,
ADD COLUMN `action_link` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Route to navigate when notification is clicked' AFTER `notification_type`;
```

### 2. Backend Routes
**File:** `backend/routes/notifications.js` (NEW)

Created new API endpoints:
- `GET /api/notifications/:employeeNumber` - Fetch all notifications for an employee
- `GET /api/notifications/:employeeNumber/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark a notification as read
- `PUT /api/notifications/:employeeNumber/read-all` - Mark all notifications as read

**File:** `backend/index.js` (UPDATED)
- Added notifications route to the Express app

### 3. Payslip Sending Integration
**File:** `backend/payrollRoutes/SendPayslip.js` (UPDATED)

Updated the `/send-bulk` endpoint to:
- Create a notification for each employee when their payslip is successfully sent
- Notification includes the period (month/year) and links to `/payslip`
- Falls back gracefully if notification columns don't exist

### 4. Frontend - Admin Dashboard
**File:** `frontend/src/components/HomeAdmin.jsx` (UPDATED)

Added:
- State management for notifications and unread count
- Automatic fetching of notifications every 30 seconds
- Display of payslip notifications in the notifications modal
- Click handler to navigate to `/payslip` when payslip notification is clicked
- Visual distinction for payslip notifications (green indicator)
- Badge showing unread notification count

### 5. Frontend - Employee Dashboard
**File:** `frontend/src/components/Home.jsx` (UPDATED)

Added:
- State management for notifications and unread count
- Automatic fetching of notifications every 30 seconds
- Display of payslip notifications in the notifications modal
- Click handler to navigate to `/payslip` when payslip notification is clicked
- Visual distinction for payslip notifications (green indicator)
- Badge showing unread notification count

## How It Works

1. **When Payslips Are Sent:**
   - Admin selects employees and sends payslips via `PayslipDistribution.jsx`
   - Backend sends emails via Gmail
   - For each successful send, a notification is created in the database
   - Notification includes: employee number, description, type='payslip', action_link='/payslip'

2. **Notification Display:**
   - Both `HomeAdmin.jsx` and `Home.jsx` fetch notifications on load
   - Notifications refresh every 30 seconds automatically
   - Unread notifications are highlighted with a badge count
   - Payslip notifications have a green indicator

3. **User Interaction:**
   - Employee clicks on a payslip notification
   - Notification is marked as read
   - User is navigated to `/payslip` page
   - Unread count is updated

## Testing

1. **Database Migration:**
   ```sql
   -- Run the migration SQL file
   source database_migration_add_notification_fields.sql
   ```

2. **Test Payslip Sending:**
   - Go to Payslip Distribution page
   - Select employees and send payslips
   - Check database: `SELECT * FROM notifications WHERE notification_type = 'payslip'`

3. **Test Notification Display:**
   - Login as an employee who received a payslip
   - Check notification badge count in header
   - Open notifications modal
   - Verify payslip notification appears
   - Click notification and verify navigation to payslip page

## Notes

- The system gracefully handles cases where `notification_type` and `action_link` columns don't exist (fallback to description-only notifications)
- Notifications are automatically refreshed every 30 seconds
- Unread notifications are visually distinct (highlighted border, different opacity)
- Payslip notifications have a special green indicator to distinguish them from other notifications


