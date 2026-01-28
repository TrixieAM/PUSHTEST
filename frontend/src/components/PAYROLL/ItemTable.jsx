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
  Fade,
  Divider,
  Backdrop,
  styled,
  alpha,
  Avatar,
  Tooltip,
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
  Label as FactCheckIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh,
} from '@mui/icons-material';

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import usePageAccess from '../../hooks/usePageAccess';
import { useNavigate } from 'react-router-dom';
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
const GlassCard = styled(Card)(({ theme }) => ({
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

// Enhanced Auth header helper with error handling
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('No authentication token found in localStorage');
    // Optionally redirect to login
    // window.location.href = '/login';
    return {};
  }

  // For debugging - log token existence (remove in production)
  console.log('Auth token being used:', token ? 'Token exists' : 'No token');

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies if using them
  };
};

// Add axios response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        'Authentication error:',
        error.response?.data?.message || 'Unauthorized'
      );
      // Optionally redirect to login
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Authorization error: Insufficient permissions');
    }
    return Promise.reject(error);
  }
);

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
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 700,
                        color: settings?.textPrimaryColor || '#6D2323',
                      },
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: '#a31d1d',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        lineHeight: 1.1,
                      },
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

const ItemTable = () => {
  const [data, setData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [salaryGrades, setSalaryGrades] = useState([]); // Store fetched salary grades
  const [salaryGradeOptions, setSalaryGradeOptions] = useState([]); // Store unique salary grade options
  const [newItem, setNewItem] = useState({
    item_description: '',
    employeeID: '',
    name: '',
    item_code: '',
    salary_grade: '',
    step: '',
    effectivityDate: '',
  });
  const [editItem, setEditItem] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEditEmployee, setSelectedEditEmployee] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const { settings } = useSystemSettings();
  const navigate = useNavigate();

  // Get colors from system settings
  const primaryColor = settings.accentColor || '#FEF9E1'; // Cards color
  const secondaryColor = settings.backgroundColor || '#FFF8E7'; // Background
  const accentColor = settings.primaryColor || '#6d2323'; // Primary accent
  const accentDark = settings.secondaryColor || '#8B3333'; // Darker accent
  const textPrimaryColor = settings.textPrimaryColor || '#6d2323';
  const textSecondaryColor = settings.textSecondaryColor || '#FEF9E1';
  const hoverColor = settings.hoverColor || '#6D2323';
  const blackColor = '#1a1a1a';
  const whiteColor = '#FFFFFF';
  const grayColor = '#6c757d';

  // Dynamic page access control using component identifier
  // Note: This component may need a new page entry in the database with identifier 'item-table'
  const { hasAccess, loading: accessLoading, error: accessError } = usePageAccess('item-table');

  useEffect(() => {
    fetchItems();
    fetchSalaryGrades();
  }, []);

  // Debug: Track salary_grade changes
  useEffect(() => {
    console.log('salary_grade state changed:', newItem.salary_grade, 'Type:', typeof newItem.salary_grade);
  }, [newItem.salary_grade]);

  // Fetch salary grades from the database
  const fetchSalaryGrades = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/SalaryGradeTable/salary-grade`,
        getAuthHeaders()
      );
      setSalaryGrades(response.data);
      
      // Extract unique salary grade numbers from the fetched data
      const uniqueSGNumbers = [
        ...new Set(
          response.data
            .map((record) => {
              // Convert to string and handle different formats
              const sg = String(record.sg_number || '').trim();
              // Normalize "Job Order" variations
              if (sg.toLowerCase().includes('job order')) {
                if (sg.toLowerCase().includes('graduated') || sg.toLowerCase().includes('grad')) {
                  return 'Job Order(Graduated)';
                } else if (sg.toLowerCase().includes('undergraduate') || sg.toLowerCase().includes('undergrad')) {
                  return 'Job Order(Undergraduate)';
                }
              }
              // Normalize old format to new format
              if (sg === 'JO GRAD') return 'Job Order(Graduated)';
              if (sg === 'JO UNDERGRAD') return 'Job Order(Undergraduate)';
              return sg;
            })
            .filter((sg) => sg !== null && sg !== undefined && sg !== '')
        )
      ].sort((a, b) => {
        // Sort: numbers first, then "Job Order" entries
        const aIsNumber = !isNaN(a) && a !== '';
        const bIsNumber = !isNaN(b) && b !== '';
        if (aIsNumber && bIsNumber) {
          return parseInt(a) - parseInt(b);
        }
        if (aIsNumber) return -1;
        if (bIsNumber) return 1;
        // Job Order entries at the end
        const aIsJO = a.toLowerCase().includes('job order');
        const bIsJO = b.toLowerCase().includes('job order');
        if (aIsJO && bIsJO) {
          return a.localeCompare(b);
        }
        if (aIsJO) return 1;
        if (bIsJO) return -1;
        return a.localeCompare(b);
      });
      
      setSalaryGradeOptions(uniqueSGNumbers);
      console.log('Fetched salary grade options:', uniqueSGNumbers);
    } catch (error) {
      console.error('Error fetching salary grades:', error);
      // Fallback to default options if API fails
      const defaultOptions = [
        ...Array.from({ length: 33 }, (_, index) => `${index + 1}`),
        'Job Order(Graduated)',
        'Job Order(Undergraduate)',
      ];
      setSalaryGradeOptions(defaultOptions);
      console.log('Using fallback salary grade options:', defaultOptions);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/item-table`,
        getAuthHeaders()
      );
      
      // Debug logging
      console.log('=== ITEM TABLE FRONTEND DEBUG ===');
      console.log('Response data:', res.data);
      console.log('Total records received:', res.data?.length || 0);
      if (res.data && res.data.length > 0) {
        console.log('Sample record from API:', {
          id: res.data[0].id,
          employeeID: res.data[0].employeeID,
          name: res.data[0].name,
          item_description: res.data[0].item_description,
          salary_grade: res.data[0].salary_grade,
          step: res.data[0].step,
          effectivityDate: res.data[0].effectivityDate,
        });
        // Check for NULL/undefined values
        const recordsWithNulls = res.data.filter(item => 
          !item.employeeID || 
          !item.name || 
          !item.item_description
        );
        if (recordsWithNulls.length > 0) {
          console.log('Records with NULL/empty values:', recordsWithNulls.length);
          console.log('Sample record with NULLs:', recordsWithNulls[0]);
        }
      }
      console.log('==================================');
      
      setData(res.data || []);

      // Fetch employee names for all records
      const uniqueEmployeeIds = [
        ...new Set(res.data.map((item) => item.employeeID).filter(Boolean)),
      ];
      console.log('Unique employee IDs to fetch names for:', uniqueEmployeeIds);
      
      const namesMap = {};

      await Promise.all(
        uniqueEmployeeIds.map(async (id) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/Remittance/employees/${id}`,
              getAuthHeaders()
            );
            namesMap[id] = response.data.name || 'Unknown';
            console.log(`Fetched name for employee ${id}:`, namesMap[id]);
          } catch (error) {
            console.error(`Error fetching employee ${id}:`, error);
            namesMap[id] = 'Unknown';
          }
        })
      );

      console.log('Final employee names map:', namesMap);
      setEmployeeNames(namesMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error details:', err.response?.data || err.message);
      showSnackbar('Failed to fetch item records. Please try again.', 'error');
    }
  };

  usePayrollRealtimeRefresh(() => {
    fetchSalaryGrades();
    fetchItems();
  });

  const validateForm = () => {
    const newErrors = {};
    
    // Check item_description
    if (!newItem.item_description || (typeof newItem.item_description === 'string' && newItem.item_description.trim() === '')) {
      newErrors.item_description = 'This field is required';
    }
    
    // Check employeeID - can come from newItem or selectedEmployee
    const employeeID = newItem.employeeID || (selectedEmployee?.employeeNumber);
    if (!employeeID || (typeof employeeID === 'string' && employeeID.trim() === '')) {
      newErrors.employeeID = 'This field is required';
    }
    
    // Check name - can come from newItem or selectedEmployee
    const name = newItem.name || (selectedEmployee?.name);
    if (!name || (typeof name === 'string' && name.trim() === '')) {
      newErrors.name = 'This field is required';
    }

    // Debug: Log validation results
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation failed. Missing fields:', Object.keys(newErrors));
      console.log('Current form state:', newItem);
      console.log('Selected employee:', selectedEmployee);
      console.log('Resolved employeeID:', employeeID);
      console.log('Resolved name:', name);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      const missingFields = Object.keys(errors).filter(key => errors[key]);
      const fieldNames = {
        item_description: 'Position',
        employeeID: 'Employee',
        name: 'Employee Name'
      };
      const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join(', ');
      showSnackbar(`Please fill in the following required fields: ${missingFieldNames}`, 'error');
      return;
    }

    // Log state before creating itemData
    console.log('=== BEFORE CREATING ITEM DATA ===');
    console.log('newItem state:', JSON.stringify(newItem, null, 2));
    console.log('selectedEmployee:', selectedEmployee);
    console.log('newItem.salary_grade:', newItem.salary_grade, 'Type:', typeof newItem.salary_grade);
    console.log('==================================');

    setLoading(true);
    try {
      // Ensure all fields are properly formatted before sending
      // Use selectedEmployee as fallback for employeeID and name
      const itemData = {
        item_description: newItem.item_description || '',
        employeeID: newItem.employeeID || selectedEmployee?.employeeNumber || '',
        name: newItem.name || selectedEmployee?.name || '',
        item_code: newItem.item_code || '',
        salary_grade: newItem.salary_grade || '',
        step: newItem.step || '',
        effectivityDate: newItem.effectivityDate || '',
      };
      
      // Enhanced debug logging
      console.log('=== SENDING ITEM DATA ===');
      console.log('Full itemData object:', JSON.stringify(itemData, null, 2));
      console.log('salary_grade value:', itemData.salary_grade);
      console.log('salary_grade type:', typeof itemData.salary_grade);
      console.log('salary_grade length:', itemData.salary_grade?.length);
      console.log('Current newItem state:', JSON.stringify(newItem, null, 2));
      console.log('Selected employee:', selectedEmployee);
      console.log('========================');
      
      await axios.post(
        `${API_BASE_URL}/api/item-table`,
        itemData,
        getAuthHeaders()
      );
      setNewItem({
        item_description: '',
        employeeID: '',
        name: '',
        item_code: '',
        salary_grade: '',
        step: '',
        effectivityDate: '',
      });
      setSelectedEmployee(null);
      setErrors({});
      setTimeout(() => {
        setLoading(false);
        setSuccessAction('adding');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchItems();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
      showSnackbar('Failed to add item record. Please try again.', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/item-table/${editItem.id}`,
        editItem,
        getAuthHeaders()
      );
      setEditItem(null);
      setOriginalItem(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchItems();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
      showSnackbar('Failed to update item record. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/item-table/${id}`,
        getAuthHeaders()
      );
      setEditItem(null);
      setOriginalItem(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchItems();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
      showSnackbar('Failed to delete item record. Please try again.', 'error');
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditItem((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewItem((prev) => {
        const updated = { ...prev, [field]: value };
        console.log(`handleChange - Field: ${field}, Value: ${value}, Updated state:`, updated);
        return updated;
      });
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    // Only update employeeID if it's different
    // The name will be set by handleEmployeeSelect
    setNewItem((prev) => ({
      ...prev,
      employeeID: employeeNumber || '',
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.employeeID;
      return newErrors;
    });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Auto-fill both employeeID and name when employee is selected
    setNewItem((prev) => ({
      ...prev,
      employeeID: employee.employeeNumber || '',
      name: employee.name || '',
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.employeeID;
      delete newErrors.name;
      return newErrors;
    });
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditItem({ ...editItem, employeeID: employeeNumber });
    // Auto-fill name when employee is selected
    if (selectedEditEmployee) {
      setEditItem({
        ...editItem,
        employeeID: employeeNumber,
        name: selectedEditEmployee.name,
      });
    }
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
    // Auto-fill name when employee is selected
    setEditItem({
      ...editItem,
      employeeID: employee.employeeNumber,
      name: employee.name,
    });
  };

  const handleOpenModal = async (item) => {
    const employeeName =
      employeeNames[item.employeeID] || item.name || 'Unknown';

    setEditItem({ ...item });
    setOriginalItem({ ...item });
    setSelectedEditEmployee({
      name: employeeName,
      employeeNumber: item.employeeID,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditItem({ ...originalItem });
    setSelectedEditEmployee({
      name:
        employeeNames[originalItem.employeeID] ||
        originalItem.name ||
        'Unknown',
      employeeNumber: originalItem.employeeID,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditItem(null);
    setOriginalItem(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editItem || !originalItem) return false;

    return (
      editItem.item_description !== originalItem.item_description ||
      editItem.employeeID !== originalItem.employeeID ||
      editItem.name !== originalItem.name ||
      editItem.item_code !== originalItem.item_code ||
      editItem.salary_grade !== originalItem.salary_grade ||
      editItem.step !== originalItem.step ||
      editItem.effectivityDate !== originalItem.effectivityDate
    );
  };

  // salaryGradeOptions is now fetched from the database and stored in state

  const stepOptions = [...Array(8)].map((_, index) => `step${index + 1}`);

  // Function to get year from salary grade
  const getYearFromSalaryGrade = (salaryGrade) => {
    if (!salaryGrade) return new Date().getFullYear().toString();

    // For JO grades, use current year
    if (salaryGrade.includes('JO')) {
      return new Date().getFullYear().toString();
    }

    // For regular grades, you might have a mapping logic
    // For now, we'll use current year as default
    return new Date().getFullYear().toString();
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
        message="You do not have permission to access Item Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((item) => {
    const employeeID = item.employeeID?.toString() || '';
    const name = item.name?.toLowerCase() || '';
    const itemDescription = item.item_description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return (
      employeeID.includes(search) ||
      name.includes(search) ||
      itemDescription.includes(search)
    );
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
                      <FactCheckIcon
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
                        Item Information Management
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          fontWeight: 400,
                          color: accentDark,
                        }}
                      >
                        Add and manage item records for employees
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Tooltip title="Refresh Data">
                      <IconButton
                        onClick={() => window.location.reload()}
                        sx={{
                          bgcolor: 'rgba(109,35,35,0.1)',
                          '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                          color: accentColor,
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

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: primaryColor,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
              Processing item record...
            </Typography>
          </Box>
        </Backdrop>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Item Section */}
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
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <FactCheckIcon sx={{ fontSize: '1.8rem', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Add New Item
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in item information
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
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                        >
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={newItem.employeeID}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                          error={!!errors.employeeID}
                          helperText={errors.employeeID || ''}
                          settings={settings}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: accentColor }}
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
                              paddingLeft: '12px',
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
                                  color: settings.textPrimaryColor || accentColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#a31d1d',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  lineHeight: 1.2,
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
                              minHeight: '31px',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: grayColor,
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

                  <Divider sx={{ my: 3, borderColor: 'rgba(109,35,35,0.1)' }} />

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FactCheckIcon sx={{ mr: 2, fontSize: 24 }} />
                    Item Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Position{' '}
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
                      <ModernTextField
                        value={newItem.item_description}
                        onChange={(e) =>
                          handleChange('item_description', e.target.value)
                        }
                        fullWidth
                        size="small"
                        error={!!errors.item_description}
                        helperText={errors.item_description || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Item Code
                      </Typography>
                      <ModernTextField
                        value={newItem.item_code}
                        onChange={(e) =>
                          handleChange('item_code', e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Salary Grade
                      </Typography>
                      <FormControl fullWidth>
                        <Autocomplete
                          freeSolo
                          options={salaryGradeOptions}
                          value={newItem.salary_grade || null}
                          onChange={(event, newValue) => {
                            // Handle both string values and null
                            const value = newValue !== null && newValue !== undefined ? String(newValue) : '';
                            console.log('Salary grade onChange - newValue:', newValue, 'processed value:', value);
                            handleChange('salary_grade', value);
                            // Auto-update effectivity date when salary grade changes
                            if (value) {
                              handleChange(
                                'effectivityDate',
                                getYearFromSalaryGrade(value)
                              );
                            }
                          }}
                          onInputChange={(event, newInputValue, reason) => {
                            // Only update on input change if reason is 'input' (user typing)
                            // Don't update on 'clear' or 'reset' to avoid overwriting selected values
                            if (reason === 'input') {
                              console.log('Salary grade onInputChange - newInputValue:', newInputValue, 'reason:', reason);
                              handleChange('salary_grade', newInputValue || '');
                              // Auto-update effectivity date when salary grade changes
                              if (newInputValue) {
                                handleChange(
                                  'effectivityDate',
                                  getYearFromSalaryGrade(newInputValue)
                                );
                              }
                            } else if (reason === 'clear') {
                              // When clearing, set to empty string
                              handleChange('salary_grade', '');
                            }
                          }}
                          renderInput={(params) => (
                            <ModernTextField {...params} size="small" />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Step
                      </Typography>
                      <FormControl fullWidth>
                        <Autocomplete
                          freeSolo
                          options={stepOptions}
                          value={newItem.step || null}
                          onChange={(event, newValue) =>
                            handleChange('step', newValue || '')
                          }
                          onInputChange={(event, newInputValue, reason) => {
                            // Only update on input change if reason is 'input' (user typing)
                            if (reason === 'input') {
                              handleChange('step', newInputValue);
                            }
                          }}
                          renderInput={(params) => (
                            <ModernTextField {...params} size="small" />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Effectivity Date (Year)
                      </Typography>
                      <ModernTextField
                        value={newItem.effectivityDate}
                        onChange={(e) =>
                          handleChange('effectivityDate', e.target.value)
                        }
                        fullWidth
                        size="small"
                        placeholder="YYYY"
                        inputProps={{ maxLength: 4 }}
                      />
                    </Grid>
                  </Grid>

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
                      Add Item Record
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Item Records Section */}
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
                    color: accentColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReorderIcon sx={{ fontSize: '1.8rem', mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Item Records
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        View and manage existing records
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
                        color: accentColor,
                        borderColor: 'rgba(109, 35, 35, 0.5)',
                        padding: '4px 8px',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: accentColor,
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
                  <Box sx={{ mb: 3 }}>
                    <ModernTextField
                      size="small"
                      variant="outlined"
                      placeholder="Search by Employee ID, Name, or Position"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <SearchIcon sx={{ color: accentColor, mr: 1 }} />
                        ),
                      }}
                    />
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
                        background: accentColor,
                        borderRadius: '3px',
                      },
                    }}
                  >
                    {viewMode === 'grid' ? (
                      <Grid container spacing={2}>
                        {filteredData.map((item) => (
                          <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card
                              onClick={() => handleOpenModal(item)}
                              sx={{
                                cursor: 'pointer',
                                border: '1px solid rgba(109, 35, 35, 0.1)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  borderColor: accentColor,
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 4px 8px rgba(109,35,35,0.15)',
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
                                  <FactCheckIcon
                                    sx={{
                                      fontSize: 18,
                                      color: accentColor,
                                      mr: 0.5,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: accentColor,
                                      px: 0.5,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    ID: {item.employeeID}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="#333"
                                  mb={0.5}
                                  noWrap
                                >
                                  {employeeNames[item.employeeID] ||
                                    item.name ||
                                    `Employee #${item.employeeID || 'N/A'}`}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="#333"
                                  mb={1}
                                  noWrap
                                  sx={{ flexGrow: 1 }}
                                >
                                  {item.item_description || item.item_code || 'No Position'}
                                </Typography>

                                {item.salary_grade && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 0.5,
                                      backgroundColor:
                                        'rgba(254, 249, 225, 0.5)',
                                      border:
                                        '1px solid rgba(109, 35, 35, 0.2)',
                                      alignSelf: 'flex-start',
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: accentColor,
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      Grade: {item.salary_grade}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredData.map((item) => (
                        <Card
                          key={item.id}
                          onClick={() => handleOpenModal(item)}
                          sx={{
                            cursor: 'pointer',
                            border: '1px solid rgba(109, 35, 35, 0.1)',
                            mb: 1,
                            '&:hover': {
                              borderColor: accentColor,
                              backgroundColor: 'rgba(254, 249, 225, 0.3)',
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{ display: 'flex', alignItems: 'flex-start' }}
                            >
                              <Box sx={{ mr: 1.5, mt: 0.2 }}>
                                <FactCheckIcon
                                  sx={{ fontSize: 20, color: accentColor }}
                                />
                              </Box>

                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: accentColor,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    display: 'block',
                                    mb: 0.5
                                  }}
                                >
                                  ID: {item.employeeID}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="#333"
                                  sx={{ mb: 0.5 }}
                                >
                                  {employeeNames[item.employeeID] ||
                                    item.name ||
                                    `Employee #${item.employeeID || 'N/A'}`}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color={grayColor}
                                  sx={{ mb: 0.5 }}
                                >
                                  {item.item_description || item.item_code || 'No Position'}
                                </Typography>

                                {item.salary_grade && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 0.5,
                                      backgroundColor:
                                        'rgba(254, 249, 225, 0.5)',
                                      border:
                                        '1px solid rgba(109, 35, 35, 0.2)',
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: accentColor,
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      Grade: {item.salary_grade}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))
                    )}

                    {filteredData.length === 0 && (
                      <Box textAlign="center" py={4}>
                        <Typography
                          variant="h6"
                          color={accentColor}
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          No Records Found
                        </Typography>
                        <Typography variant="body2" color={grayColor}>
                          Try adjusting your search criteria
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Edit Modal */}
        <Modal
          open={!!editItem}
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
              overflow: 'hidden',
            }}
          >
            {editItem && (
              <>
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${settings.secondaryColor || '#6d2323'} 0%, ${settings.deleteButtonHoverColor || '#a31d1d'} 100%)`,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FactCheckIcon sx={{ fontSize: 24, color: '#FFFFFF' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.1 }}>
                        {isEditing ? 'Edit Item Information' : 'Item Information'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#FFFFFF', opacity: 0.9, lineHeight: 1.1 }}
                      >
                        View and manage item details
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={handleCloseModal}
                    sx={{ color: '#FFFFFF' }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                <Box sx={{ 
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
                }}>
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                        >
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={editItem?.employeeID || ''}
                          onChange={
                            isEditing ? handleEditEmployeeChange : () => {}
                          }
                          selectedEmployee={selectedEditEmployee}
                          onEmployeeSelect={
                            isEditing ? handleEditEmployeeSelect : () => {}
                          }
                          placeholder="Search and select employee..."
                          required
                          disabled={!isEditing}
                          dropdownDisabled={!isEditing}
                          settings={settings}
                        />
                        {!isEditing && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: grayColor,
                              fontStyle: 'italic',
                              display: 'block',
                              mt: 0.5,
                            }}
                          >
                            Contact administrator for assistance.
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                        >
                          Selected Employee
                        </Typography>
                        {selectedEditEmployee ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.8),
                              border: `1px solid ${alpha(settings.primaryColor || '#6d2323', 0.3)}`,
                              borderRadius: 2,
                              padding: '12px',
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
                                  color: settings.textPrimaryColor || accentColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEditEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#a31d1d',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  lineHeight: 1.2,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                #{selectedEditEmployee.employeeNumber}
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
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: grayColor,
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

                  <Divider sx={{ my: 3, borderColor: 'rgba(109,35,35,0.1)' }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Position
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editItem.item_description}
                          onChange={(e) =>
                            handleChange(
                              'item_description',
                              e.target.value,
                              true
                            )
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)',
                          }}
                        >
                          <Typography variant="body2">
                            {editItem.item_description || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Item Code
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editItem.item_code}
                          onChange={(e) =>
                            handleChange('item_code', e.target.value, true)
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)',
                          }}
                        >
                          <Typography variant="body2">
                            {editItem.item_code || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Salary Grade
                      </Typography>
                      {isEditing ? (
                        <FormControl fullWidth>
                          <Autocomplete
                            freeSolo
                            options={salaryGradeOptions}
                            value={editItem.salary_grade || null}
                            onChange={(event, newValue) => {
                              // Handle both string values and null
                              const value = newValue !== null && newValue !== undefined ? String(newValue) : '';
                              console.log('Edit salary grade onChange - newValue:', newValue, 'processed value:', value);
                              handleChange('salary_grade', value, true);
                              // Auto-update effectivity date when salary grade changes
                              if (value) {
                                handleChange(
                                  'effectivityDate',
                                  getYearFromSalaryGrade(value),
                                  true
                                );
                              }
                            }}
                            onInputChange={(event, newInputValue, reason) => {
                              // Only update on input change if reason is 'input' (user typing)
                              // Don't update on 'clear' or 'reset' to avoid overwriting selected values
                              if (reason === 'input') {
                                console.log('Edit salary grade onInputChange - newInputValue:', newInputValue, 'reason:', reason);
                                handleChange('salary_grade', newInputValue || '', true);
                                // Auto-update effectivity date when salary grade changes
                                if (newInputValue) {
                                  handleChange(
                                    'effectivityDate',
                                    getYearFromSalaryGrade(newInputValue),
                                    true
                                  );
                                }
                              } else if (reason === 'clear') {
                                // When clearing, set to empty string
                                handleChange('salary_grade', '', true);
                              }
                            }}
                            renderInput={(params) => (
                              <ModernTextField {...params} size="small" />
                            )}
                          />
                        </FormControl>
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)',
                          }}
                        >
                          <Typography variant="body2">
                            {editItem.salary_grade || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Step
                      </Typography>
                      {isEditing ? (
                        <FormControl fullWidth>
                          <Autocomplete
                            freeSolo
                            options={stepOptions}
                            value={editItem.step || null}
                            onChange={(event, newValue) =>
                              handleChange('step', newValue || '', true)
                            }
                            onInputChange={(event, newInputValue, reason) => {
                              // Only update on input change if reason is 'input' (user typing)
                              if (reason === 'input') {
                                handleChange('step', newInputValue, true);
                              }
                            }}
                            renderInput={(params) => (
                              <ModernTextField {...params} size="small" />
                            )}
                          />
                        </FormControl>
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)',
                          }}
                        >
                          <Typography variant="body2">
                            {editItem.step || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, color: accentColor }}
                      >
                        Effectivity Date (Year)
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editItem.effectivityDate}
                          onChange={(e) =>
                            handleChange(
                              'effectivityDate',
                              e.target.value,
                              true
                            )
                          }
                          fullWidth
                          size="small"
                          placeholder="YYYY"
                          inputProps={{ maxLength: 4 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)',
                          }}
                        >
                          <Typography variant="body2">
                            {editItem.effectivityDate || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

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
                        onClick={() => handleDelete(editItem.id)}
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

        <SuccessfulOverlay open={successOpen} action={successAction} onClose={() => setSuccessOpen(false)} />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default ItemTable;
