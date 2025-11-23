import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Remove as RemoveIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getUserInfo } from '../utils/auth';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const HARDCODED_PASSWORD = '20134507';
  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

  // Check if session is still valid
  const isSessionValid = () => {
    const sessionData = sessionStorage.getItem('auditLogsSession');
    if (!sessionData) return false;
    
    try {
      const { timestamp } = JSON.parse(sessionData);
      const now = Date.now();
      const sessionAge = now - timestamp;
      return sessionAge < SESSION_DURATION;
    } catch (error) {
      return false;
    }
  };

  // Store session data
  const storeSession = () => {
    const sessionData = {
      timestamp: Date.now(),
      authenticated: true
    };
    sessionStorage.setItem('auditLogsSession', JSON.stringify(sessionData));
  };

  // Clear session data
  const clearSession = () => {
    sessionStorage.removeItem('auditLogsSession');
    setIsAuthenticated(false);
    setPasswordDialogOpen(true);
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Get current user
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setCurrentUser(userInfo);
      setUserRole(userInfo.role);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    if (isSessionValid()) {
      setIsAuthenticated(true);
      setPasswordDialogOpen(false);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Load audit logs
  const loadAuditLogs = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/audit-logs`, getAuthHeaders());
      
      if (response.data && Array.isArray(response.data)) {
        setAuditLogs(response.data);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setAuditLogs([]);
      setToast({ message: 'Failed to load audit logs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load logs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAuditLogs();
    }
  }, [isAuthenticated]);

  // Filter logs
  useEffect(() => {
    let filtered = [...auditLogs];

    // Filter by user role (non-admin see only their logs)
    if (userRole && userRole !== 'administrator' && userRole !== 'superadmin') {
      filtered = filtered.filter((log) => log.employeeNumber === currentUser?.employeeNumber);
    }

    // Filter by action
    if (actionFilter) {
      filtered = filtered.filter((log) => 
        log.action?.toLowerCase().includes(actionFilter.toLowerCase())
      );
    }

    // Filter by module (table_name)
    if (moduleFilter) {
      filtered = filtered.filter((log) => 
        log.table_name?.toLowerCase().includes(moduleFilter.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === dateFilter;
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });

    setFilteredLogs(filtered);
  }, [actionFilter, moduleFilter, dateFilter, auditLogs, userRole, currentUser]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle password submit
  const handlePasswordSubmit = () => {
    if (passwordInput === HARDCODED_PASSWORD) {
      setPasswordError('');
      setPasswordDialogOpen(false);
      setIsAuthenticated(true);
      storeSession();
      setToast({ message: 'Access granted', type: 'success' });
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleCloseDialog = () => {
    setPasswordDialogOpen(false);
    navigate(-1);
  };

  // Get action color
  const getActionColor = (action) => {
    if (!action) return '#6b7280';
    const actionUpper = action.toUpperCase();
    const colors = {
      CREATE: '#10b981',
      INSERT: '#10b981',
      UPDATE: '#3b82f6',
      DELETE: '#ef4444',
      REMOVE: '#ef4444',
      LOGIN: '#8b5cf6',
      LOGOUT: '#6b7280',
      VIEW: '#06b6d4',
      SEARCH: '#06b6d4',
      EXPORT: '#f59e0b',
      REPORT: '#f59e0b',
    };
    return colors[actionUpper] || '#6b7280';
  };

  // Get action icon
  const getActionIcon = (action) => {
    if (!action) return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    const actionUpper = action.toUpperCase();
    const icons = {
      CREATE: <AddIcon sx={{ fontSize: 16 }} />,
      INSERT: <AddIcon sx={{ fontSize: 16 }} />,
      UPDATE: <EditIcon sx={{ fontSize: 16 }} />,
      DELETE: <RemoveIcon sx={{ fontSize: 16 }} />,
      REMOVE: <RemoveIcon sx={{ fontSize: 16 }} />,
      LOGIN: <LockOpenIcon sx={{ fontSize: 16 }} />,
      LOGOUT: <LockIcon sx={{ fontSize: 16 }} />,
      VIEW: <VisibilityIcon sx={{ fontSize: 16 }} />,
      SEARCH: <SearchIcon sx={{ fontSize: 16 }} />,
      EXPORT: <FileDownloadIcon sx={{ fontSize: 16 }} />,
      REPORT: <FileDownloadIcon sx={{ fontSize: 16 }} />,
    };
    return icons[actionUpper] || <CheckCircleIcon sx={{ fontSize: 16 }} />;
  };

  // Format audit log entry
  const formatAuditLog = (log) => {
    const timestamp = new Date(log.timestamp);
    const formattedTime = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;
    const employeeNumber = log.employeeNumber || 'Unknown';
    const action = log.action?.toUpperCase() || 'UNKNOWN';
    const module = log.table_name?.toUpperCase() || 'UNKNOWN';
    const recordId = log.record_id ? ` #${log.record_id}` : '';
    const targetEmployee = log.targetEmployeeNumber ? ` (Target: ${log.targetEmployeeNumber})` : '';

    let logString = `[${formattedTime}] - `;
    logString += `<strong>Employee ${employeeNumber}</strong> `;
    logString += `performed <strong style="color: #2563eb;">${action}</strong> `;
    logString += `on <strong>${module}${recordId}</strong>${targetEmployee}.`;

    return logString;
  };

  // Export audit log
  const handleExportLog = () => {
    let csv = 'Timestamp,Employee Number,Action,Table Name,Record ID,Target Employee\n';

    filteredLogs.forEach((log) => {
      const timestamp = new Date(log.timestamp || log.created_at).toLocaleString();
      csv += `"${timestamp}","${log.employeeNumber || 'Unknown'}","${log.action || 'N/A'}","${log.table_name || 'N/A'}","${log.record_id || 'N/A'}","${log.targetEmployeeNumber || 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setToast({ message: 'Audit trail exported successfully!', type: 'success' });
  };

  // Refresh logs
  const handleRefresh = () => {
    loadAuditLogs();
    setToast({ message: 'Logs refreshed', type: 'success' });
  };

  // Get unique actions for filter
  const getUniqueActions = () => {
    const actions = [...new Set(auditLogs.map(log => log.action).filter(Boolean))];
    return actions.sort();
  };

  // Get unique modules for filter
  const getUniqueModules = () => {
    const modules = [...new Set(auditLogs.map(log => log.table_name).filter(Boolean))];
    return modules.sort();
  };

  // Show password dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog
        open={passwordDialogOpen}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: '#FEF9E1',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #A31D1D 0%, #8a4747 100%)',
            color: '#FEF9E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            fontWeight: 700,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <LockIcon sx={{ mr: 1 }} />
            Audit Logs Access
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: '#FEF9E1',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center', color: '#A31D1D' }}
          >
            This section contains sensitive audit information. Please enter the
            access password.
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Access Password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'rgba(254, 249, 225, 0.5)' }}>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#A31D1D',
              color: '#FEF9E1',
              '&:hover': { bgcolor: '#8a1a1a' },
            }}
          >
            Access Audit Logs
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (loading && auditLogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  const isAdmin = userRole === 'administrator' || userRole === 'superadmin';
  const pageTitle = isAdmin ? 'Audit Trail (All Users)' : 'My Activity Log';

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      minHeight: '100vh', 
      paddingTop: '100px' 
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '30px', 
        background: 'linear-gradient(to right, #D84040, #A31D1D)', 
        padding: '30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(216, 64, 64, 0.2)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
              📋 {pageTitle}
            </h2>
            <p style={{ margin: 0, color: '#F8F2DE', fontSize: '16px' }}>
              {isAdmin ? 'System-wide activity tracking and security monitoring' : 'Your personal activity history and access logs'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        }}
      >
        {/* Card Header with Filters */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#333',
            }}
          >
            {isAdmin ? 'System Activity Log' : 'My Activity History'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="action-filter-label">All Actions</InputLabel>
              <Select
                labelId="action-filter-label"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label="All Actions"
              >
                <MenuItem value="">All Actions</MenuItem>
                {getUniqueActions().map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="module-filter-label">All Modules</InputLabel>
              <Select
                labelId="module-filter-label"
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                label="All Modules"
              >
                <MenuItem value="">All Modules</MenuItem>
                {getUniqueModules().map((module) => (
                  <MenuItem key={module} value={module}>
                    {module}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                textTransform: 'none',
                borderColor: '#d0d0d0',
                color: '#333',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                },
              }}
            >
              Refresh
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportLog}
                sx={{
                  textTransform: 'none',
                  borderColor: '#d0d0d0',
                  color: '#333',
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                Export
              </Button>
            )}
          </Box>
        </Box>

        {/* Audit Log Entries */}
        <Box>
          {filteredLogs.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: '#666',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No audit logs found
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                {isAdmin ? 'System activities will be logged here' : 'Your activities will be logged here'}
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredLogs.map((log, index) => {
                const actionColor = getActionColor(log.action);
                const status = 'success'; // Default status

                return (
                  <Box
                    key={log.id || index}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      backgroundColor: '#f9fafb',
                      borderLeft: `4px solid ${actionColor}`,
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: 1.8,
                    }}
                  >
                    <Box
                      sx={{
                        color: '#1f2937',
                        '& strong': {
                          fontWeight: 600,
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: formatAuditLog(log) }}
                    />
                    <Box
                      sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: '11px',
                        color: '#6b7280',
                        fontFamily: 'sans-serif',
                      }}
                    >
                      <Chip
                        icon={getActionIcon(log.action)}
                        label={log.action?.toUpperCase() || 'UNKNOWN'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '10px',
                          backgroundColor: actionColor,
                          color: 'white',
                          '& .MuiChip-icon': {
                            color: 'white',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                        <Typography sx={{ fontSize: '11px' }}>
                          Status: Success
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ color: '#666', fontSize: '14px' }}>
            <strong>Total Logs:</strong> {filteredLogs.length}{' '}
            <span style={{ color: '#999' }}>
              | {actionFilter || moduleFilter || dateFilter ? `Showing ${filteredLogs.length} of ${auditLogs.length} entries` : 'Showing all entries'}
            </span>
          </Typography>
        </Box>
      </Paper>

      {/* Toast Notification */}
      {toast && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor:
              toast.type === 'success'
                ? '#4caf50'
                : toast.type === 'error'
                ? '#f44336'
                : '#1976d2',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease',
          }}
        >
          <Typography sx={{ fontSize: '14px' }}>{toast.message}</Typography>
        </Box>
      )}
    </div>
  );
};

export default AuditLogs;
