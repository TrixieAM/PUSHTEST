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
  ListItemIcon,
  Card,
  CardContent,
  Menu,
  MenuItem,
  InputAdornment
} from "@mui/material";
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
  School as SchoolIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from "react-router-dom";

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

// Flexible Year Input Component with Dropdown
const FlexibleYearInput = ({ value, onChange, label, disabled = false, error = false, helperText = '' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputValue, setInputValue] = useState(value || '');
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Generate years from 1950 to current year + 10
  for (let year = 1950; year <= currentYear + 10; year++) {
    years.push(year);
  }

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleYearSelect = (year) => {
    setInputValue(year.toString());
    onChange(year.toString());
    handleMenuClose();
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (newValue === '' || (/^\d+$/.test(newValue) && newValue.length <= 4)) {
      setInputValue(newValue);
      onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && !anchorEl) {
      handleMenuOpen(e);
    } else if (e.key === 'Escape' && anchorEl) {
      handleMenuClose();
    }
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
        {label}
      </Typography>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputChange}
        placeholder="Enter year or select from dropdown"
        fullWidth
        size="small"
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                disabled={disabled}
                sx={{ color: '#6D2323' }}
              >
                <ArrowDropDownIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: error ? 'red' : '#6D2323',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
          },
        }}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: '200px',
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666' }}>
            Select a year:
          </Typography>
        </MenuItem>
        {years.map((year) => (
          <MenuItem
            key={year}
            onClick={() => handleYearSelect(year)}
            selected={year.toString() === inputValue}
            sx={{
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '&.Mui-selected': {
                backgroundColor: '#e8eaf6',
                '&:hover': {
                  backgroundColor: '#c5cae9',
                },
              },
            }}
          >
            {year}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

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
        `${API_BASE_URL}/Remittance/employees/search?q=${encodeURIComponent(searchQuery)}`,
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
      <TextField
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
          startAdornment: <PersonIcon sx={{ color: '#6D2323', mr: 1 }} />,
          endAdornment: (
            <IconButton
              onClick={dropdownDisabled ? undefined : handleDropdownClick}
              size="small"
              disabled={dropdownDisabled}
              sx={{ color: '#6D2323' }}
            >
              {showDropdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '40px',
            '& fieldset': {
              borderColor: error ? 'red' : '#6D2323',
              borderWidth: '1.5px'
            },
            '&:hover fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
          },
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
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemText
                    primary={employee.name}
                    secondary={`#${employee.employeeNumber}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ color: '#666' }}
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

const GraduateTable = () => {
  const [data, setData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [newGraduate, setNewGraduate] = useState({
    graduateNameOfSchool: '',
    graduateDegree: '',
    graduatePeriodFrom: '',
    graduatePeriodTo: '',
    graduateHighestAttained: '',
    graduateYearGraduated: '',
    graduateScholarshipAcademicHonorsReceived: '',
    person_id: '',
  });
  const [editGraduate, setEditGraduate] = useState(null);
  const [originalGraduate, setOriginalGraduate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");
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

  const [hasAccess, setHasAccess] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 5;
    if (!userId) {
      setHasAccess(false);
      return;
    }
    const checkAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/page_access/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const accessData = await response.json();
          const hasPageAccess = accessData.some(access => 
            access.page_id === pageId && String(access.page_privilege) === '1'
          );
          setHasAccess(hasPageAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    fetchGraduates();
  }, []);

  // Auto-update Year Graduated when Period To changes for new graduate
  useEffect(() => {
    if (newGraduate.graduatePeriodTo) {
      setNewGraduate(prev => ({
        ...prev,
        graduateYearGraduated: prev.graduatePeriodTo
      }));
    }
  }, [newGraduate.graduatePeriodTo]);

  // Auto-update Year Graduated when Period To changes for edit graduate
  useEffect(() => {
    if (editGraduate && editGraduate.graduatePeriodTo) {
      setEditGraduate(prev => ({
        ...prev,
        graduateYearGraduated: prev.graduatePeriodTo
      }));
    }
  }, [editGraduate?.graduatePeriodTo]);

  const fetchGraduates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/GraduateRoute/graduate-table`);
      setData(res.data);
      
      // Fetch employee names for all records
      const uniqueEmployeeIds = [...new Set(res.data.map(c => c.person_id).filter(Boolean))];
      const namesMap = {};
      
      await Promise.all(
        uniqueEmployeeIds.map(async (id) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/Remittance/employees/${id}`,
              getAuthHeaders()
            );
            namesMap[id] = response.data.name || 'Unknown';
          } catch (error) {
            namesMap[id] = 'Unknown';
          }
        })
      );
      
      setEmployeeNames(namesMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      showSnackbar('Failed to fetch graduate records. Please try again.', 'error');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['graduateNameOfSchool', 'graduateDegree', 'person_id'];
    
    requiredFields.forEach(field => {
      if (!newGraduate[field] || newGraduate[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/GraduateRoute/graduate-table`, newGraduate);
      setNewGraduate({
        graduateNameOfSchool: '',
        graduateDegree: '',
        graduatePeriodFrom: '',
        graduatePeriodTo: '',
        graduateHighestAttained: '',
        graduateYearGraduated: '',
        graduateScholarshipAcademicHonorsReceived: '',
        person_id: '',
      });
      setSelectedEmployee(null);
      setErrors({});
      setTimeout(() => {     
        setLoading(false);  
        setSuccessAction("adding");
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);  
      fetchGraduates();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
      showSnackbar('Failed to add graduate record. Please try again.', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE_URL}/GraduateRoute/graduate-table/${editGraduate.id}`, editGraduate);
      setEditGraduate(null);
      setOriginalGraduate(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchGraduates();
      setSuccessAction("edit");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
      showSnackbar('Failed to update graduate record. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/GraduateRoute/graduate-table/${id}`);
      setEditGraduate(null);
      setOriginalGraduate(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchGraduates();
      setSuccessAction("delete");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
      showSnackbar('Failed to delete graduate record. Please try again.', 'error');
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditGraduate({ ...editGraduate, [field]: value });
    } else {
      setNewGraduate({ ...newGraduate, [field]: value });
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    setNewGraduate({ ...newGraduate, person_id: employeeNumber });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.person_id;
      return newErrors;
    });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditGraduate({ ...editGraduate, person_id: employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const handleOpenModal = async (graduate) => {
    const employeeName = employeeNames[graduate.person_id] || 'Unknown';
    
    setEditGraduate({ ...graduate });
    setOriginalGraduate({ ...graduate });
    setSelectedEditEmployee({
      name: employeeName,
      employeeNumber: graduate.person_id,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditGraduate({ ...originalGraduate });
    setSelectedEditEmployee({
      name: employeeNames[originalGraduate.person_id] || 'Unknown',
      employeeNumber: originalGraduate.person_id,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditGraduate(null);
    setOriginalGraduate(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editGraduate || !originalGraduate) return false;
    
    return (
      editGraduate.graduateNameOfSchool !== originalGraduate.graduateNameOfSchool ||
      editGraduate.graduateDegree !== originalGraduate.graduateDegree ||
      editGraduate.graduatePeriodFrom !== originalGraduate.graduatePeriodFrom ||
      editGraduate.graduatePeriodTo !== originalGraduate.graduatePeriodTo ||
      editGraduate.graduateHighestAttained !== originalGraduate.graduateHighestAttained ||
      editGraduate.graduateYearGraduated !== originalGraduate.graduateYearGraduated ||
      editGraduate.graduateScholarshipAcademicHonorsReceived !== originalGraduate.graduateScholarshipAcademicHonorsReceived ||
      editGraduate.person_id !== originalGraduate.person_id
    );
  };

  if (hasAccess === null) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: "#6d2323", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#6d2323" }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (!hasAccess) {
    return (
      <AccessDenied 
        title="Access Denied"
        message="You do not have permission to access Graduate Studies Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((graduate) => {
    const schoolName = graduate.graduateNameOfSchool?.toLowerCase() || "";
    const personId = graduate.person_id?.toString() || "";
    const employeeName = employeeNames[graduate.person_id]?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return personId.includes(search) || schoolName.includes(search) || employeeName.includes(search);
  });

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      pt: 2,
      mt: -5
    }}>
      <LoadingOverlay open={loading} message="Adding graduate record..." />
      <SuccessfullOverlay open={successOpen} action={successAction} />
      
      <Box sx={{ textAlign: 'center', mb: 3, px: 2 }}>
        <Typography variant="h4" sx={{ color: "#6D2323", fontWeight: 'bold', mb: 0.5 }}>
          Graduate Studies Information Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          Add and manage graduate studies records for employees
        </Typography>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper 
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' }
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <SchoolIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Add New Graduate Studies
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Fill in the graduate studies information
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                p: 3, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflowY: 'auto'
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5, color: "#6D2323" }}>
                      Employee Information <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={newGraduate.person_id}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                          error={!!errors.person_id}
                          helperText={errors.person_id || ''}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                          Selected Employee
                        </Typography>
                        {selectedEmployee ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #6D2323',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              gap: 1.5,
                              height: '21px'
                            }}
                          >
                            <PersonIcon sx={{ color: '#6D2323', fontSize: '20px' }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#6D2323',
                                  fontSize: '13px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#666',
                                  fontSize: '11px',
                                  lineHeight: 1.2,
                                }}
                              >
                                ID: {selectedEmployee.employeeNumber}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5',
                              border: '2px dashed #ccc',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              height: '21px',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#999',
                                fontStyle: 'italic',
                                fontSize: '13px',
                              }}
                            >
                              No employee selected
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ 
                      borderBottom: '2px solid #e0e0e0', 
                      my: 2,
                      '&::before': {
                        content: '"Graduate Studies Details"',
                        position: 'absolute',
                        left: 20,
                        top: -10,
                        backgroundColor: '#fff',
                        px: 1,
                        color: '#6D2323',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      },
                      position: 'relative'
                    }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Graduate School Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      value={newGraduate.graduateNameOfSchool}
                      onChange={(e) => handleChange("graduateNameOfSchool", e.target.value)}
                      fullWidth
                      size="small"
                      error={!!errors.graduateNameOfSchool}
                      helperText={errors.graduateNameOfSchool || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: errors.graduateNameOfSchool ? 'red' : '#6D2323',
                                borderWidth: '1.5px'
                              },
                              '&:hover fieldset': {
                                borderColor: errors.graduateNameOfSchool ? 'red' : '#6D2323',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: errors.graduateNameOfSchool ? 'red' : '#6D2323',
                              },
                            },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Degree <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      value={newGraduate.graduateDegree}
                      onChange={(e) => handleChange("graduateDegree", e.target.value)}
                      fullWidth
                      size="small"
                      error={!!errors.graduateDegree}
                      helperText={errors.graduateDegree || ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: errors.graduateDegree ? 'red' : '#6D2323',
                                borderWidth: '1.5px'
                              },
                              '&:hover fieldset': {
                                borderColor: errors.graduateDegree ? 'red' : '#6D2323',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: errors.graduateDegree ? 'red' : '#6D2323',
                              },
                            },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FlexibleYearInput
                      value={newGraduate.graduatePeriodFrom}
                      onChange={(value) => handleChange("graduatePeriodFrom", value)}
                      label="Period From"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FlexibleYearInput
                      value={newGraduate.graduatePeriodTo}
                      onChange={(value) => handleChange("graduatePeriodTo", value)}
                      label="Period To"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Highest Attained
                    </Typography>
                    <TextField
                      value={newGraduate.graduateHighestAttained}
                      onChange={(e) => handleChange("graduateHighestAttained", e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#6D2323',
                                borderWidth: '1.5px'
                              },
                              '&:hover fieldset': {
                                borderColor: '#6D2323',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6D2323',
                              },
                            },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Year Graduated <span style={{ color: '#666', fontSize: '0.7rem' }}>(Auto-filled from Period To)</span>
                    </Typography>
                    <TextField
                      value={newGraduate.graduateYearGraduated}
                      fullWidth
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#6D2323',
                            borderWidth: '1.5px'
                          },
                          '&:hover fieldset': {
                            borderColor: '#6D2323',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6D2323',
                          },
                        },
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: '#000',
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Honors Received
                    </Typography>
                    <TextField
                      value={newGraduate.graduateScholarshipAcademicHonorsReceived}
                      onChange={(e) =>
                        handleChange("graduateScholarshipAcademicHonorsReceived", e.target.value)
                      }
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#6D2323',
                                borderWidth: '1.5px'
                              },
                              '&:hover fieldset': {
                                borderColor: '#6D2323',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6D2323',
                              },
                            },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Button
                    onClick={handleAdd}
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      backgroundColor: "#6D2323",
                      color: "#FEF9E1",
                      py: 1.2,
                      fontWeight: 'bold',
                      "&:hover": { 
                        backgroundColor: "#5a1d1d",
                      },
                    }}
                  >
                    Add Graduate Record
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper 
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' }
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ReorderIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Graduate Studies Records
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
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      padding: '4px 8px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white'
                      },
                    }
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

              <Box sx={{ 
                p: 3, 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Search by Employee ID, Name, or School"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#6D2323",
                          borderWidth: '1.5px'
                        },
                        "&:hover fieldset": {
                          borderColor: "#6D2323",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6D2323",
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: "#6D2323", mr: 1 }} />
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
                      background: '#6D2323',
                      borderRadius: '3px',
                    },
                  }}
                >
                  {viewMode === 'grid' ? (
                    <Grid container spacing={1.5}>
                      {filteredData.map((graduate) => (
                        <Grid item xs={12} sm={6} md={4} key={graduate.id}>
                          <Card
                            onClick={() => handleOpenModal(graduate)}
                            sx={{
                              cursor: "pointer",
                              border: "1px solid #ddd",
                              height: "100%",
                              display: 'flex',
                              flexDirection: 'column',
                              "&:hover": { 
                                borderColor: "#6d2323",
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                              },
                            }}
                          >
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <SchoolIcon sx={{ fontSize: 18, color: '#6d2323', mr: 0.5 }} />
                                <Typography variant="caption" sx={{ 
                                  color: '#6d2323', 
                                  px: 0.5, 
                                  py: 0.2, 
                                  borderRadius: 0.5,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}>
                                  {graduate.person_id}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                {employeeNames[graduate.person_id] || 'Loading...'}
                              </Typography>
                              
                              <Typography variant="body2" fontWeight="bold" color="#333" mb={1} noWrap sx={{ flexGrow: 1 }}>
                                {graduate.graduateDegree || 'No Degree'}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="caption" color="#666" fontSize="0.7rem">
                                    {graduate.graduatePeriodFrom || '----'}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="#666" fontSize="0.7rem">
                                  to
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="caption" color="#666" fontSize="0.7rem">
                                    {graduate.graduatePeriodTo || '----'}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    filteredData.map((graduate) => (
                      <Card
                        key={graduate.id}
                        onClick={() => handleOpenModal(graduate)}
                        sx={{
                          cursor: "pointer",
                          border: "1px solid #ddd",
                          mb: 1,
                          "&:hover": { 
                            borderColor: "#6d2323",
                            backgroundColor: '#fafafa'
                          },
                        }}
                      >
                        <Box sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Box sx={{ mr: 1.5, mt: 0.2 }}>
                              <SchoolIcon sx={{ fontSize: 20, color: '#6d2323' }} />
                            </Box>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ 
                                  backgroundColor: '#6d2323', 
                                  color: 'white', 
                                  px: 0.5, 
                                  py: 0.2, 
                                  borderRadius: 0.5,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  mr: 1
                                }}>
                                  {graduate.person_id}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="#333">
                                  {employeeNames[graduate.person_id] || 'Loading...'}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                                {graduate.graduateDegree || 'No Degree'}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" color="#666" fontSize="0.7rem">
                                  {graduate.graduatePeriodFrom || '----'}
                                </Typography>
                                <Typography variant="caption" color="#666" fontSize="0.7rem" sx={{ mx: 0.5 }}>
                                  to
                                </Typography>
                                <Typography variant="caption" color="#666" fontSize="0.7rem">
                                  {graduate.graduatePeriodTo || '----'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  )}
                  
                  {filteredData.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body1" color="#555" fontWeight="bold">
                        No Records Found
                      </Typography>
                      <Typography variant="body2" color="#666" sx={{ mt: 0.5 }}>
                        Try adjusting your search criteria
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Modal
        open={!!editGraduate}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: 'auto',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          {editGraduate && (
            <>
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  borderRadius: "8px 8px 0 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {isEditing ? "Edit Graduate Studies Information" : "Graduate Studies Details"}
                </Typography>
                <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
                  <Close />
                </IconButton>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1.5, color: "#6D2323" }}>
                      Employee Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={editGraduate?.person_id || ''}
                          onChange={isEditing ? handleEditEmployeeChange : () => {}}
                          selectedEmployee={selectedEditEmployee}
                          onEmployeeSelect={isEditing ? handleEditEmployeeSelect : () => {}}
                          placeholder="Search and select employee..."
                          required
                          disabled={!isEditing}
                          dropdownDisabled={!isEditing}
                        />
                        {!isEditing && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
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
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                          Selected Employee
                        </Typography>
                        {selectedEditEmployee ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#f8f9fa',
                              border: '2px solid #6D2323',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              gap: 1.5,
                              height: '21px',
                            }}
                          >
                            <PersonIcon sx={{ color: '#6D2323', fontSize: '20px' }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#6D2323',
                                  fontSize: '13px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEditEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#666',
                                  fontSize: '11px',
                                  lineHeight: 1.2,
                                }}
                              >
                                ID: {selectedEditEmployee.employeeNumber}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5',
                              border: '2px dashed #ccc',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              height: '21px',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#999',
                                fontStyle: 'italic',
                                fontSize: '13px',
                              }}
                            >
                              No employee selected
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ 
                      borderBottom: '2px solid #e0e0e0', 
                      my: 2,
                      '&::before': {
                        content: '"Graduate Studies Details"',
                        position: 'absolute',
                        left: 20,
                        top: -10,
                        backgroundColor: '#fff',
                        px: 1,
                        color: '#6D2323',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      },
                      position: 'relative'
                    }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Graduate School Name
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editGraduate.graduateNameOfSchool}
                        onChange={(e) => handleChange("graduateNameOfSchool", e.target.value, true)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&:hover fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: "#6D2323",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editGraduate.graduateNameOfSchool}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Degree
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editGraduate.graduateDegree}
                        onChange={(e) => handleChange("graduateDegree", e.target.value, true)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&:hover fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: "#6D2323",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editGraduate.graduateDegree || 'N/A'}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <FlexibleYearInput
                        value={editGraduate.graduatePeriodFrom}
                        onChange={(value) => handleChange("graduatePeriodFrom", value, true)}
                        label="Period From"
                      />
                    ) : (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                          Period From
                        </Typography>
                        <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          {editGraduate.graduatePeriodFrom || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <FlexibleYearInput
                        value={editGraduate.graduatePeriodTo}
                        onChange={(value) => handleChange("graduatePeriodTo", value, true)}
                        label="Period To"
                      />
                    ) : (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                          Period To
                        </Typography>
                        <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          {editGraduate.graduatePeriodTo || 'N/A'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Highest Attained
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editGraduate.graduateHighestAttained}
                        onChange={(e) => handleChange("graduateHighestAttained", e.target.value, true)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&:hover fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: "#6D2323",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editGraduate.graduateHighestAttained || 'N/A'}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Year Graduated <span style={{ color: '#666', fontSize: '0.7rem' }}>(Auto-filled from Period To)</span>
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editGraduate.graduateYearGraduated}
                        fullWidth
                        size="small"
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#6D2323',
                            },
                            '&:hover fieldset': {
                              borderColor: '#6D2323',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6D2323',
                            },
                          },
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000',
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editGraduate.graduateYearGraduated || 'N/A'}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", mb: 0.5, color: "#333", display: 'block' }}>
                      Honors Received
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={editGraduate.graduateScholarshipAcademicHonorsReceived}
                        onChange={(e) => handleChange("graduateScholarshipAcademicHonorsReceived", e.target.value, true)}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&:hover fieldset': {
                              borderColor: "#6D2323",
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: "#6D2323",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        {editGraduate.graduateScholarshipAcademicHonorsReceived || 'N/A'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={() => handleDelete(editGraduate.id)}
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        sx={{
                          color: "#d32f2f",
                          borderColor: "#d32f2f",
                          "&:hover": {
                            backgroundColor: "#d32f2f",
                            color: "#fff"
                          }
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={handleStartEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{ 
                          backgroundColor: "#6D2323", 
                          color: "#FEF9E1",
                          "&:hover": { backgroundColor: "#5a1d1d" }
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{
                          color: "#666",
                          borderColor: "#666",
                          "&:hover": {
                            backgroundColor: "#f5f5f5"
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!hasChanges()}
                        sx={{ 
                          backgroundColor: hasChanges() ? "#6D2323" : "#ccc", 
                          color: "#FEF9E1",
                          "&:hover": { 
                            backgroundColor: hasChanges() ? "#5a1d1d" : "#ccc"
                          },
                          "&:disabled": {
                            backgroundColor: "#ccc",
                            color: "#999"
                          }
                        }}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Modal>

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
  );
};

export default GraduateTable;