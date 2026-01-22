const { getIO } = require('./socketServer');

/**
 * Socket Service - Helper functions to emit events to users
 * This service provides a centralized way to send real-time notifications
 */

/**
 * Notify a user that their page access has been granted
 * @param {string} employeeNumber - Employee number of the user
 * @param {object} pageData - Page information that was granted
 */
function notifyPageAccessGranted(employeeNumber, pageData) {
  try {
    const io = getIO();
    
    io.to(employeeNumber).emit('pageAccessGranted', {
      action: 'granted',
      page: pageData,
      timestamp: new Date().toISOString(),
      message: `Access granted to ${pageData.page_name}`,
    });

    console.log(`✓ Notified ${employeeNumber}: Access granted to page ${pageData.page_name} (ID: ${pageData.page_id})`);
  } catch (error) {
    console.error(`Failed to notify page access granted for ${employeeNumber}:`, error.message);
  }
}

/**
 * Notify a user that their page access has been revoked
 * @param {string} employeeNumber - Employee number of the user
 * @param {object} pageData - Page information that was revoked
 */
function notifyPageAccessRevoked(employeeNumber, pageData) {
  try {
    const io = getIO();
    
    io.to(employeeNumber).emit('pageAccessRevoked', {
      action: 'revoked',
      page: pageData,
      timestamp: new Date().toISOString(),
      message: `Access revoked from ${pageData.page_name}`,
    });

    console.log(`✓ Notified ${employeeNumber}: Access revoked from page ${pageData.page_name} (ID: ${pageData.page_id})`);
  } catch (error) {
    console.error(`Failed to notify page access revoked for ${employeeNumber}:`, error.message);
  }
}

/**
 * Notify a user that their page access has been updated
 * @param {string} employeeNumber - Employee number of the user
 * @param {object} pageData - Page information
 * @param {string} action - Action performed ('granted' or 'revoked')
 */
function notifyPageAccessChanged(employeeNumber, action, pageData) {
  if (action === 'granted') {
    notifyPageAccessGranted(employeeNumber, pageData);
  } else if (action === 'revoked') {
    notifyPageAccessRevoked(employeeNumber, pageData);
  } else {
    console.warn(`Unknown action "${action}" for page access notification`);
  }
}

/**
 * Notify multiple users about page access changes
 * @param {Array<string>} employeeNumbers - Array of employee numbers
 * @param {string} eventName - Event name to emit
 * @param {object} data - Data to send with the event
 */
function notifyMultipleUsers(employeeNumbers, eventName, data) {
  try {
    const io = getIO();
    
    employeeNumbers.forEach((employeeNumber) => {
      io.to(employeeNumber).emit(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    console.log(`✓ Notified ${employeeNumbers.length} users: ${eventName}`);
  } catch (error) {
    console.error(`Failed to notify multiple users:`, error.message);
  }
}

/**
 * Broadcast to all connected users (use sparingly)
 * @param {string} eventName - Event name to emit
 * @param {object} data - Data to send with the event
 */
function broadcastToAll(eventName, data) {
  try {
    const io = getIO();
    
    io.emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    console.log(`✓ Broadcasted to all users: ${eventName}`);
  } catch (error) {
    console.error(`Failed to broadcast:`, error.message);
  }
}

/**
 * Broadcast to users with a specific role
 * @param {string} role - User role (superadmin, administrator, staff)
 * @param {string} eventName - Event name to emit
 * @param {object} data - Data to send with the event
 */
function broadcastToRole(role, eventName, data) {
  try {
    const io = getIO();
    
    io.to(`role:${role}`).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    console.log(`✓ Broadcasted to role ${role}: ${eventName}`);
  } catch (error) {
    console.error(`Failed to broadcast to role ${role}:`, error.message);
  }
}

module.exports = {
  notifyPageAccessGranted,
  notifyPageAccessRevoked,
  notifyPageAccessChanged,
  notifyMultipleUsers,
  broadcastToAll,
  broadcastToRole,
};
