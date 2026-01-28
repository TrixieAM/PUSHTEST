import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Modal,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  FormControl,
  Autocomplete,
  Select,
  MenuItem,
  Fade,
  Backdrop,
  Avatar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Domain as DomainIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh,
  Group as GroupIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from 'react-router-dom';
import usePageAccess from '../../hooks/usePageAccess';
import { styled, alpha } from '@mui/material/styles';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import usePayrollRealtimeRefresh from '../../hooks/usePayrollRealtimeRefresh';

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : '109, 35, 35';
};

// Professional styled components - colors will be applied via sx prop
const GlassCard = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ProfessionalButton = styled(Button)(
  ({ theme, variant, color = 'primary' }) => ({
    borderRadius: 12,
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'none',
    fontSize: '0.95rem',
    letterSpacing: '0.025em',
    boxShadow:
      variant === 'contained' ? '0 4px 14px rgba(254, 249, 225, 0.25)' : 'none',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow:
        variant === 'contained'
          ? '0 6px 20px rgba(254, 249, 225, 0.35)'
          : 'none',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  })
);

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      transform: 'translateY(-1px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

// Employee Autocomplete Component
const EmployeeAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search employee...',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  selectedEmployee,
  onEmployeeSelect,
  dropdownDisabled = false,
  settings = {},
}) => {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && !selectedEmployee) {
      fetchEmployeeById(value);
    }
  }, [value]);

  useEffect(() => {
    if (selectedEmployee) {
      setQuery(selectedEmployee.name || '');
    } else if (!value) {
      setQuery('');
    }
  }, [selectedEmployee, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmployees = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        getAuthHeaders()
      );
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/search`,
        getAuthHeaders()
      );
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeById = async (employeeNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/${employeeNumber}`,
        getAuthHeaders()
      );
      const employee = response.data;
      onEmployeeSelect(employee);
      setQuery(employee.name || '');
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    setShowDropdown(true);

    if (selectedEmployee && inputValue !== selectedEmployee.name) {
      onEmployeeSelect(null);
      onChange('');
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (inputValue.trim().length >= 2) {
        fetchEmployees(inputValue);
      } else if (inputValue.trim().length === 0) {
        fetchAllEmployees();
      } else {
        setEmployees([]);
      }
    }, 300);
  };

  const handleEmployeeSelect = (employee) => {
    onEmployeeSelect(employee);
    setQuery(employee.name);
    setShowDropdown(false);
    onChange(employee.employeeNumber);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (employees.length === 0 && !isLoading) {
      if (query.length >= 2) {
        fetchEmployees(query);
      } else {
        fetchAllEmployees();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleDropdownClick = () => {
    if (!showDropdown) {
      setShowDropdown(true);
      if (employees.length === 0 && !isLoading) {
        fetchAllEmployees();
      }
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <ModernTextField
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        autoComplete="off"
        size="small"
        InputProps={{
          startAdornment: <PersonIcon sx={{ color: settings?.textPrimaryColor || settings?.primaryColor || '#6D2323', mr: 1 }} />,
          endAdornment: (
            <IconButton
              onClick={dropdownDisabled ? undefined : handleDropdownClick}
              size="small"
              disabled={dropdownDisabled}
              sx={{ color: settings?.textPrimaryColor || settings?.primaryColor || '#6D2323' }}
            >
              {showDropdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ),
        }}
      />

      {showDropdown && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading...
              </Typography>
            </Box>
          ) : employees.length > 0 ? (
            <List dense>
              {employees.map((employee) => (
                <ListItem
                  key={employee.employeeNumber}
                  button
                  onClick={() => handleEmployeeSelect(employee)}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(settings?.accentColor || settings?.backgroundColor || '#FEF9E1', 0.3),
                    },
                  }}
                >
                  <ListItemText
                    primary={employee.name}
                    secondary={`#${employee.employeeNumber}`}
                    primaryTypographyProps={{ fontWeight: 'bold', color: settings?.textPrimaryColor || '#6D2323' }}
                    secondaryTypographyProps={{
                      color: '#a31d1d',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      lineHeight: 1.1,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : query.length >= 2 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No employees found matching "{query}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {employees.length === 0
                  ? 'No employees available'
                  : 'Type to search or scroll to browse'}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

// Auth header helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const DepartmentAssignment = () => {
  const { settings } = useSystemSettings();

  // Get colors from system settings
  const primaryColor = settings.accentColor || '#FEF9E1'; // Cards color
  const secondaryColor = settings.backgroundColor || '#FFF8E7'; // Background
  const accentColor = settings.primaryColor || '#6d2323'; // Primary accent
  const accentDark = settings.secondaryColor || '#8B3333'; // Darker accent
  const textPrimaryColor = settings.textPrimaryColor || '#6d2323';
  const textSecondaryColor = settings.textSecondaryColor || '#FEF9E1';
  const hoverColor = settings.hoverColor || '#6D2323';
  const [data, setData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    code: '',
    name: '',
    employeeNumber: '',
  });
  const [editAssignment, setEditAssignment] = useState(null);
  const [originalAssignment, setOriginalAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departmentCodes, setDepartmentCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentEmployeeDetails, setDepartmentEmployeeDetails] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const navigate = useNavigate();

  // Employee selection states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEditEmployee, setSelectedEditEmployee] = useState(null);

  // Dynamic page access control using component identifier
  // Note: This component may need a new page entry in the database with identifier 'department-assignment'
  const { hasAccess, loading: accessLoading, error: accessError } = usePageAccess('department-assignment');

  useEffect(() => {
    fetchAssignments();
    fetchDepartmentCodes();
  }, []);

  useEffect(() => {
    // Group assignments by department
    const grouped = data.reduce((acc, assignment) => {
      const deptCode = assignment.code || 'Unassigned';
      if (!acc[deptCode]) {
        acc[deptCode] = {
          code: deptCode,
          employees: [],
        };
      }
      acc[deptCode].employees.push(assignment);
      return acc;
    }, {});

    const departmentArray = Object.values(grouped);
    setDepartmentData(departmentArray);
  }, [data]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-assignment`,
        getAuthHeaders()
      );
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching data', error);
      showSnackbar(
        'Failed to fetch department assignments. Please try again.',
        'error'
      );
    }
  };

  const fetchDepartmentCodes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-table`,
        getAuthHeaders()
      );
      setDepartmentCodes(response.data.map((item) => item.code));
    } catch (error) {
      console.error('Error fetching department codes', error);
    }
  };

  usePayrollRealtimeRefresh(() => {
    fetchAssignments();
    fetchDepartmentCodes();
  });

  const handleAdd = async () => {
    if (
      !newAssignment.employeeNumber ||
      newAssignment.employeeNumber.trim() === ''
    ) {
      showSnackbar('Please select an employee', 'error');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty fields
      const filteredAssignment = Object.fromEntries(
        Object.entries(newAssignment).filter(([_, value]) => value !== '')
      );

      await axios.post(
        `${API_BASE_URL}/api/department-assignment`,
        filteredAssignment,
        getAuthHeaders()
      );
      setNewAssignment({
        code: '',
        name: '',
        employeeNumber: '',
      });
      setSelectedEmployee(null);
      setLoading(false);
      showSnackbar('Employee assigned to department successfully!', 'success');
      fetchAssignments();
    } catch (error) {
      console.error('Error adding entry', error);
      setLoading(false);
      showSnackbar(
        'Failed to add department assignment. Please try again.',
        'error'
      );
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/department-assignment/${editAssignment.id}`,
        editAssignment,
        getAuthHeaders()
      );
      // Reset all states properly
      setEditAssignment(null);
      setOriginalAssignment(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      setModalOpen(false);
      fetchAssignments();
      showSnackbar('Department assignment updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating entry', error);
      showSnackbar(
        'Failed to update department assignment. Please try again.',
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/department-assignment/${id}`,
        getAuthHeaders()
      );
      // Reset all states properly
      setEditAssignment(null);
      setOriginalAssignment(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      setModalOpen(false);
      setDepartmentModalOpen(false);
      setSelectedDepartment(null);
      await fetchAssignments();
      showSnackbar('Department assignment deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting entry', error);
      showSnackbar(
        'Failed to delete department assignment. Please try again.',
        'error'
      );
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditAssignment({ ...editAssignment, [field]: value });
    } else {
      setNewAssignment({ ...newAssignment, [field]: value });
    }
  };

  const handleOpenModal = (assignment, directEdit = false) => {
    setEditAssignment({ ...assignment });
    setOriginalAssignment({ ...assignment });
    setIsEditing(directEdit);
    setModalOpen(true);

    // Fetch employee details for edit modal
    if (assignment.employeeNumber) {
      fetchEmployeeById(assignment.employeeNumber, (employee) => {
        setSelectedEditEmployee(employee);
      });
    }
  };

  const fetchEmployeeById = async (employeeNumber, callback) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/${employeeNumber}`,
        getAuthHeaders()
      );
      if (callback) callback(response.data);
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
    }
  };

  const handleOpenDepartmentModal = async (department) => {
    setSelectedDepartment(department);
    setDepartmentModalOpen(true);
    
    // Fetch employee details for all employees in this department
    const employeeDetailsMap = {};
    const fetchPromises = department.employees.map(async (assignment) => {
      if (assignment.employeeNumber) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/Remittance/employees/${assignment.employeeNumber}`,
            getAuthHeaders()
          );
          employeeDetailsMap[assignment.employeeNumber] = response.data;
        } catch (error) {
          console.error(`Error fetching employee ${assignment.employeeNumber}:`, error);
          // Set a fallback if fetch fails
          employeeDetailsMap[assignment.employeeNumber] = {
            employeeNumber: assignment.employeeNumber,
            name: assignment.name || 'Unknown Employee'
          };
        }
      }
    });
    
    await Promise.all(fetchPromises);
    setDepartmentEmployeeDetails(employeeDetailsMap);
  };

  const handleCloseModal = () => {
    setEditAssignment(null);
    setOriginalAssignment(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
    setModalOpen(false);
  };

  const handleCloseDepartmentModal = () => {
    setSelectedDepartment(null);
    setDepartmentModalOpen(false);
    setDepartmentEmployeeDetails({});
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditAssignment({ ...originalAssignment });
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleExpandDepartment = (departmentCode) => {
    if (expandedDepartment === departmentCode) {
      setExpandedDepartment(null);
    } else {
      setExpandedDepartment(departmentCode);
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    setNewAssignment({ ...newAssignment, employeeNumber });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditAssignment({ ...editAssignment, employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const hasChanges = () => {
    if (!editAssignment || !originalAssignment) return false;

    return (
      editAssignment.code !== originalAssignment.code ||
      editAssignment.name !== originalAssignment.name ||
      editAssignment.employeeNumber !== originalAssignment.employeeNumber
    );
  };

  if (accessLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: textPrimaryColor, mb: 2 }} />
          <Typography variant="h6" sx={{ color: textPrimaryColor }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (hasAccess === false) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access Department Assignment. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredDepartmentData = departmentData.filter((department) => {
    const code = department.code?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    // Apply department filter if selected
    if (departmentFilter && code !== departmentFilter) {
      return false;
    }

    return code.includes(search);
  });

  return (
    <Box
      sx={{
        py: 4,
        mt: -5,
        width: '1600px', // Fixed width
        mx: 'auto', // Center horizontally
        overflow: 'hidden', // Prevent horizontal scroll
      }}
    >
      {/* Container with fixed width */}
      <Box sx={{ px: 6 }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard
              sx={{
                background: `rgba(${hexToRgb(primaryColor)}, 0.95)`,
                boxShadow: `0 8px 40px ${alpha(accentColor, 0.08)}`,
                border: `1px solid ${alpha(accentColor, 0.1)}`,
                '&:hover': {
                  boxShadow: `0 12px 48px ${alpha(accentColor, 0.15)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: textPrimaryColor,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: `radial-gradient(circle, ${alpha(
                      accentColor,
                      0.1
                    )} 0%, ${alpha(accentColor, 0)} 70%)`,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: '30%',
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${alpha(
                      accentColor,
                      0.08
                    )} 0%, ${alpha(accentColor, 0)} 70%)`,
                  }}
                />

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  position="relative"
                  zIndex={1}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha(accentColor, 0.15),
                        mr: 4,
                        width: 64,
                        height: 64,
                        boxShadow: `0 8px 24px ${alpha(accentColor, 0.15)}`,
                      }}
                    >
                      <DomainIcon
                        sx={{ color: textPrimaryColor, fontSize: 32 }}
                      />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          lineHeight: 1.2,
                          color: textPrimaryColor,
                        }}
                      >
                        Department Assignment Management
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ opacity: 0.8, fontWeight: 400, color: settings.secondaryColor || accentDark }}
                      >
                        View departments and their assigned employees
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Tooltip title="Refresh Data">
                      <IconButton
                        onClick={() => window.location.reload()}
                        sx={{
                          bgcolor: alpha(accentColor, 0.1),
                          '&:hover': { bgcolor: alpha(accentColor, 0.2) },
                          color: textPrimaryColor,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Refresh sx={{ fontSize: 24 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Assignment Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={700}>
              <GlassCard
                sx={{
                  height: 'calc(100vh - 200px)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${alpha(accentColor, 0.1)}`
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: textPrimaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <DomainIcon sx={{ fontSize: '1.8rem', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Assign Employee to Department
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in assignment information
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: settings.textPrimaryColor || textPrimaryColor,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <PersonIcon sx={{ mr: 2, fontSize: 24, color: settings.primaryColor || accentColor }} />
                      Assignment Information{' '}
                      <span
                        style={{
                          marginLeft: '12px',
                          fontWeight: 400,
                          opacity: 0.7,
                          color: 'red',
                        }}
                      >
                        *
                      </span>
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: settings.textPrimaryColor || textPrimaryColor }}
                        >
                          Department Code
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={newAssignment.code}
                            onChange={(e) =>
                              handleChange('code', e.target.value)
                            }
                            displayEmpty
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 12,
                                transition:
                                  'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                },
                                '&.Mui-focused': {
                                  transform: 'translateY(-1px)',
                                  boxShadow:
                                    `0 4px 20px ${alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.25)}`,
                                  backgroundColor: 'rgba(255, 255, 255, 1)',
                                  '& fieldset': {
                                    borderColor: settings.primaryColor || accentColor,
                                    borderWidth: '1.5px',
                                  },
                                },
                                '& fieldset': {
                                  borderColor: settings.primaryColor || accentColor,
                                  borderWidth: '1.5px',
                                },
                              },
                            }}
                          >
                            <MenuItem value="">Select Department</MenuItem>
                            {departmentCodes.map((code, index) => (
                              <MenuItem key={index} value={code}>
                                {code}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: settings.textPrimaryColor || textPrimaryColor }}
                        >
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={newAssignment.employeeNumber}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                          settings={settings}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: settings.textPrimaryColor || textPrimaryColor }}
                        >
                          Selected Employee
                        </Typography>
                        {selectedEmployee ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.8),
                              border: `1px solid ${alpha(settings.primaryColor || '#6d2323', 0.3)}`,
                              borderRadius: 2,
                              paddingLeft: '10px',
                              gap: 1.5,
                            }}
                          >
                            <PersonIcon
                              sx={{ color: settings.primaryColor || accentColor, fontSize: 20 }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: settings.textPrimaryColor || textPrimaryColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#0a3d1d',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  lineHeight: 1.1,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                #{selectedEmployee.employeeNumber}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              border: '2px dashed rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              minHeight: '30px',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#666',
                                fontStyle: 'italic',
                                fontSize: '14px',
                              }}
                            >
                              No employee selected
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 3 }}>
                    <ProfessionalButton
                      onClick={handleAdd}
                      variant="contained"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        backgroundColor: settings.updateButtonColor || settings.primaryColor || '#6d2323',
                        color: settings.accentColor || '#FEF9E1',
                        '&:hover': {
                          backgroundColor: settings.updateButtonHoverColor || settings.hoverColor || '#a31d1d',
                        },
                      }}
                    >
                      Assign Employee
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Department Records Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={900}>
              <GlassCard
                sx={{
                  height: 'calc(100vh - 200px)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${alpha(accentColor, 0.1)}`
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: textPrimaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ fontSize: '1.8rem', mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Departments
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        View departments and their employees
                      </Typography>
                    </Box>
                  </Box>

                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiToggleButton-root': {
                        color: textPrimaryColor,
                        borderColor: 'rgba(109, 35, 35, 0.5)',
                        padding: '4px 8px',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: textPrimaryColor,
                        },
                      },
                    }}
                  >
                    <ToggleButton value="grid" aria-label="grid view">
                      <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ViewListIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                      <ModernTextField
                      size="small"
                      variant="outlined"
                      placeholder="Search by Department Code"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <SearchIcon sx={{ color: settings.primaryColor || accentColor, mr: 1 }} />
                        ),
                      }}
                    />

                    <FormControl sx={{ minWidth: 150 }}>
                      <Select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-1px)',
                              boxShadow: `0 4px 20px ${alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.25)}`,
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                              '& fieldset': {
                                borderColor: settings.primaryColor || accentColor,
                                borderWidth: '1.5px',
                              },
                            },
                            '& fieldset': {
                              borderColor: settings.primaryColor || accentColor,
                              borderWidth: '1.5px',
                            },
                          },
                        }}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departmentCodes.map((code, index) => (
                          <MenuItem key={index} value={code}>
                            {code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: settings.primaryColor || accentColor,
                        borderRadius: '3px',
                      },
                    }}
                  >
                    {viewMode === 'grid' ? (
                      <Grid container spacing={2}>
                        {filteredDepartmentData.map((department) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={department.code}
                          >
                            <Card
                              onClick={() =>
                                handleOpenDepartmentModal(department)
                              }
                              sx={{
                                cursor: 'pointer',
                                border: `1px solid ${alpha(settings.primaryColor || accentColor, 0.1)}`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  borderColor: settings.primaryColor || accentColor,
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease',
                                  boxShadow:
                                    `0 4px 8px ${alpha(settings.primaryColor || accentColor, 0.15)}`,
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  p: 2,
                                  flexGrow: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                  }}
                                >
                                  <DomainIcon
                                    sx={{
                                      fontSize: 18,
                                      color: settings.primaryColor || accentColor,
                                      mr: 0.5,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: settings.textPrimaryColor || textPrimaryColor,
                                      px: 0.5,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    {department.code}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  sx={{ color: settings.textPrimaryColor || '#333', mb: 0.5 }}
                                >
                                  Department
                                </Typography>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                  }}
                                >
                                  <PeopleIcon
                                    sx={{
                                      fontSize: 16,
                                      color: settings.textSecondaryColor || '#666',
                                      mr: 0.5,
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ color: settings.textSecondaryColor || '#666' }}>
                                    {department.employees.length} Employees
                                  </Typography>
                                </Box>

                                <Box sx={{ mt: 'auto' }}>
                                  <Badge
                                    badgeContent={department.employees.length}
                                    color="primary"
                                    sx={{
                                      '& .MuiBadge-badge': {
                                        backgroundColor: settings.primaryColor || accentColor,
                                        color: settings.accentColor || textSecondaryColor,
                                      },
                                    }}
                                  >
                                    <Chip
                                      label="View Employees"
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(settings.primaryColor || accentColor, 0.1),
                                        color: settings.textPrimaryColor || textPrimaryColor,
                                        fontWeight: 500,
                                        '&:hover': {
                                          bgcolor: alpha(settings.primaryColor || accentColor, 0.2),
                                        },
                                      }}
                                    />
                                  </Badge>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredDepartmentData.map((department) => (
                        <Card
                          key={department.code}
                          onClick={() => handleOpenDepartmentModal(department)}
                          sx={{
                            cursor: 'pointer',
                            border: `1px solid ${alpha(settings.primaryColor || accentColor, 0.1)}`,
                            mb: 1,
                            '&:hover': {
                              borderColor: settings.primaryColor || accentColor,
                              backgroundColor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.3),
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <DomainIcon
                                  sx={{
                                    fontSize: 20,
                                    color: settings.primaryColor || accentColor,
                                    mr: 1.5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  sx={{ color: settings.textPrimaryColor || '#333' }}
                                >
                                  {department.code}
                                </Typography>
                              </Box>

                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <PeopleIcon
                                  sx={{ fontSize: 16, color: settings.textSecondaryColor || '#666', mr: 0.5 }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: settings.textSecondaryColor || '#666', mr: 1 }}
                                >
                                  {department.employees.length}
                                </Typography>
                                <Chip
                                  label="View"
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(settings.primaryColor || accentColor, 0.1),
                                    color: settings.textPrimaryColor || textPrimaryColor,
                                    fontWeight: 500,
                                    '&:hover': {
                                      bgcolor: alpha(settings.primaryColor || accentColor, 0.2),
                                    },
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))
                    )}

                    {filteredDepartmentData.length === 0 && (
                      <Box textAlign="center" py={4}>
                        <Typography
                          variant="h6"
                          sx={{ color: settings.textPrimaryColor || textPrimaryColor, fontWeight: "bold", mb: 1 }}
                        >
                          No Departments Found
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: settings.textSecondaryColor || '#666', mt: 0.5 }}
                        >
                          Try adjusting your search criteria or department
                          filter
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Department Employees Modal */}
        <Modal
          open={departmentModalOpen}
          onClose={handleCloseDepartmentModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlassCard
            sx={{
              width: '95%',
              maxWidth: '1100px',
              maxHeight: '95vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {selectedDepartment && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${settings.secondaryColor || '#6d2323'} 0%, ${settings.deleteButtonHoverColor || '#a31d1d'} 100%)`,
                    color: settings.accentColor || '#FEF9E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DomainIcon sx={{ fontSize: '1.8rem', mr: 2, color: settings.accentColor || '#FEF9E1' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.accentColor || '#FEF9E1' }}>
                        {selectedDepartment.code} Department
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9, color: settings.accentColor || '#FEF9E1' }}>
                        {selectedDepartment.employees.length} Employees
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={handleCloseDepartmentModal}
                    sx={{ color: settings.accentColor || '#FEF9E1' }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                {/* Modal Content */}
                <Box
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    overflowY: 'auto',
                    minHeight: 0,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: settings.primaryColor || accentColor,
                      borderRadius: '3px',
                    },
                  }}
                >
                  {viewMode === 'grid' ? (
                    <Grid container spacing={2}>
                      {selectedDepartment.employees.map((employee) => (
                        <Grid item xs={12} sm={6} md={4} key={employee.id}>
                          <Card
                            sx={{
                              border: `1px solid ${alpha(settings.primaryColor || accentColor, 0.1)}`,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                borderColor: settings.primaryColor || accentColor,
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 4px 8px ${alpha(settings.primaryColor || accentColor, 0.15)}`,
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                p: 2,
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 1,
                                }}
                              >
                                <PersonIcon
                                  sx={{
                                    fontSize: 18,
                                    color: settings.primaryColor || accentColor,
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: settings.textPrimaryColor || textPrimaryColor,
                                    px: 0.5,
                                    py: 0.2,
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  ID: {employee.employeeNumber}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{ color: settings.textPrimaryColor || '#333', mb: 0.5 }}
                                noWrap
                              >
                                {departmentEmployeeDetails[employee.employeeNumber]?.name || employee.name || 'No Name'}
                              </Typography>

                              <Box
                                sx={{
                                  mt: 'auto',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Chip
                                  label={employee.code}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(settings.primaryColor || accentColor, 0.1),
                                    color: settings.textPrimaryColor || textPrimaryColor,
                                    fontWeight: 500,
                                  }}
                                />
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenModal(employee, true); // Direct edit mode
                                    }}
                                    sx={{ color: settings.updateButtonColor || settings.primaryColor || accentColor }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(employee.id);
                                    }}
                                    sx={{ color: settings.deleteButtonColor || settings.primaryColor || '#d32f2f' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {selectedDepartment.employees.map((employee) => (
                        <Card
                          key={employee.id}
                          sx={{
                            border: `1px solid ${alpha(settings.primaryColor || accentColor, 0.1)}`,
                            mb: 1,
                            '&:hover': {
                              borderColor: settings.primaryColor || accentColor,
                              backgroundColor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.3),
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <PersonIcon
                                  sx={{
                                    fontSize: 20,
                                    color: settings.primaryColor || accentColor,
                                    mr: 1.5,
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{ color: settings.textPrimaryColor || '#333' }}
                                  >
                                    {departmentEmployeeDetails[employee.employeeNumber]?.name || employee.name || 'No Name'}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: settings.textSecondaryColor || '#666', mt: 0.2 }}
                                  >
                                    ID: {employee.employeeNumber} •{' '}
                                    {employee.code}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(employee, true); // Direct edit mode
                                  }}
                                  sx={{ color: settings.updateButtonColor || settings.primaryColor || accentColor, mr: 0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(employee.id);
                                  }}
                                  sx={{ color: settings.deleteButtonColor || settings.primaryColor || '#d32f2f' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))}
                    </List>
                  )}

                  {selectedDepartment.employees.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography
                        variant="h6"
                        sx={{ color: settings.textPrimaryColor || textPrimaryColor, fontWeight: "bold", mb: 1 }}
                      >
                        No Employees Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: settings.textSecondaryColor || '#666', mt: 0.5 }}>
                        This department has no assigned employees yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </GlassCard>
        </Modal>

        {/* Edit Assignment Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlassCard
            sx={{
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {editAssignment && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${settings.secondaryColor || '#6d2323'} 0%, ${settings.deleteButtonHoverColor || '#a31d1d'} 100%)`,
                    color: settings.accentColor || '#FEF9E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: settings.accentColor || '#FEF9E1' }}
                    >
                      {isEditing
                        ? 'Edit Department Assignment'
                        : 'Assignment Details'}
                    </Typography>
                    {editAssignment && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          color: settings.accentColor || '#FEF9E1',
                          opacity: 0.9,
                        }}
                      >
                        {selectedEditEmployee?.name && editAssignment?.employeeNumber
                          ? `${selectedEditEmployee.name} (#${editAssignment.employeeNumber})`
                          : selectedEditEmployee?.name ||
                            (editAssignment?.employeeNumber ? `#${editAssignment.employeeNumber}` : '')}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    onClick={handleCloseModal}
                    sx={{ color: settings.accentColor || '#FEF9E1' }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                {/* Modal Content with Scroll */}
                <Box
                  sx={{
                    p: 4,
                    flexGrow: 1,
                    overflowY: 'auto',
                    minHeight: 0,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: settings.primaryColor || accentColor,
                      borderRadius: '3px',
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: settings.textPrimaryColor || textPrimaryColor }}
                        >
                          Department Code
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              value={editAssignment.code || ''}
                              onChange={(e) =>
                                handleChange('code', e.target.value, true)
                              }
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 12,
                                  transition:
                                    'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    backgroundColor:
                                      'rgba(255, 255, 255, 0.95)',
                                  },
                                  '&.Mui-focused': {
                                    transform: 'translateY(-1px)',
                                    boxShadow:
                                      `0 4px 20px ${alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.25)}`,
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                    '& fieldset': {
                                      borderColor: settings.primaryColor || accentColor,
                                      borderWidth: '1.5px',
                                    },
                                  },
                                  '& fieldset': {
                                    borderColor: settings.primaryColor || accentColor,
                                    borderWidth: '1.5px',
                                  },
                                },
                              }}
                            >
                              <MenuItem value="">Select Department</MenuItem>
                              {departmentCodes.map((code, index) => (
                                <MenuItem key={index} value={code}>
                                  {code}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              p: 1.5,
                              bgcolor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.5),
                              borderRadius: 1,
                              color: settings.textPrimaryColor || textPrimaryColor,
                            }}
                          >
                            {editAssignment.code || 'N/A'}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: settings.textPrimaryColor || textPrimaryColor }}
                        >
                          Search Employee
                        </Typography>
                        {isEditing ? (
                          <EmployeeAutocomplete
                            value={editAssignment?.employeeNumber || ''}
                            onChange={handleEditEmployeeChange}
                            selectedEmployee={selectedEditEmployee}
                            onEmployeeSelect={handleEditEmployeeSelect}
                            placeholder="Search and select employee..."
                            dropdownDisabled={!isEditing}
                            settings={settings}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.8),
                              border: `1px solid ${alpha(settings.primaryColor || '#6d2323', 0.3)}`,
                              borderRadius: 2,
                              paddingLeft: '10px',
                              gap: 1.5,
                            }}
                          >
                            <PersonIcon
                              sx={{ color: settings.primaryColor || accentColor, fontSize: 20 }}
                            />
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: settings.textPrimaryColor || textPrimaryColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEditEmployee?.name || 'Unknown'}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#0a3d1d',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  lineHeight: 1.1,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {editAssignment?.employeeNumber
                                  ? `#${editAssignment.employeeNumber}`
                                  : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                {/* Bottom action bar */}
                <Box
                  sx={{
                    borderTop: `1px solid ${alpha(settings.primaryColor || '#6d2323', 0.2)}`,
                    backgroundColor: '#FFFFFF',
                    px: 3,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  {!isEditing ? (
                    <>
                      <ProfessionalButton
                        onClick={() => handleDelete(editAssignment.id)}
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        sx={{
                          borderColor: settings.deleteButtonColor || settings.primaryColor || '#6d2323',
                          color: settings.deleteButtonColor || settings.primaryColor || '#6d2323',
                          minWidth: '120px',
                          '&:hover': {
                            backgroundColor: alpha(settings.deleteButtonColor || settings.primaryColor || '#6d2323', 0.1),
                            borderColor: settings.deleteButtonHoverColor || settings.hoverColor || '#a31d1d',
                            color: settings.deleteButtonHoverColor || settings.hoverColor || '#a31d1d',
                          },
                        }}
                      >
                        Delete
                      </ProfessionalButton>
                      <ProfessionalButton
                        onClick={handleStartEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                          backgroundColor: settings.updateButtonColor || settings.primaryColor || '#6d2323',
                          color: settings.accentColor || '#FEF9E1',
                          minWidth: '120px',
                          '&:hover': {
                            backgroundColor: settings.updateButtonHoverColor || settings.hoverColor || '#a31d1d',
                          },
                        }}
                      >
                        Edit
                      </ProfessionalButton>
                    </>
                  ) : (
                    <>
                      <ProfessionalButton
                        onClick={handleCancelEdit}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{
                          borderColor: settings.cancelButtonColor || '#6c757d',
                          color: settings.cancelButtonColor || '#6c757d',
                          minWidth: '120px',
                          '&:hover': {
                            backgroundColor: alpha(settings.cancelButtonColor || '#6c757d', 0.1),
                            borderColor: settings.cancelButtonHoverColor || '#5a6268',
                            color: settings.cancelButtonHoverColor || '#5a6268',
                          },
                        }}
                      >
                        Cancel
                      </ProfessionalButton>
                      <ProfessionalButton
                        onClick={handleUpdate}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!hasChanges()}
                        sx={{
                          backgroundColor: hasChanges() 
                            ? (settings.updateButtonColor || settings.primaryColor || '#6d2323')
                            : alpha(settings.primaryColor || '#6d2323', 0.5),
                          color: settings.accentColor || '#FEF9E1',
                          minWidth: '120px',
                          '&:hover': {
                            backgroundColor: hasChanges() 
                              ? (settings.updateButtonHoverColor || settings.hoverColor || '#a31d1d')
                              : alpha(settings.primaryColor || '#6d2323', 0.5),
                          },
                          '&:disabled': {
                            color: alpha(settings.accentColor || '#FEF9E1', 0.5),
                          },
                        }}
                      >
                        Save
                      </ProfessionalButton>
                    </>
                  )}
                </Box>
              </>
            )}
          </GlassCard>
        </Modal>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              zIndex: 9999,
            },
          }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default DepartmentAssignment;
