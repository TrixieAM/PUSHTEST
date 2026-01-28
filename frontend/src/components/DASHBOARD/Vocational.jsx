import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';
import { useSocket } from '../../contexts/SocketContext';
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
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Divider,
  Backdrop,
  styled,
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
  Construction as ConstructionIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Refresh,
  CalendarToday,
} from '@mui/icons-material';

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import usePageAccess from '../../hooks/usePageAccess';
import { useNavigate } from 'react-router-dom';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useCRUDButtonStyles, useCRUDButtonStylesOutlined } from '../../hooks/useCRUDButtonStyles';
import {
  createThemedCard,
  createThemedButton,
  createThemedTextField,
} from '../../utils/theme';
import { alpha } from '@mui/material';

// Stable themed components (avoid recreating styled components on every render)
const ThemedCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'settings',
})(({ settings = {} }) => createThemedCard(settings));

const ThemedButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'settings',
})(({ settings = {}, variant = 'contained' }) =>
  createThemedButton(settings, variant),
);

const ThemedTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'settings',
})(({ settings = {} }) => createThemedTextField(settings));

// Custom Year Input Component with Dropdown
const YearInput = ({
  settings = {},
  value,
  onChange,
  label,
  error,
  helperText,
  disabled = false,
  autoUpdate = false,
  sourceYear = null,
}) => {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  // Auto-update if sourceYear changes and autoUpdate is true
  useEffect(() => {
    if (autoUpdate && sourceYear && sourceYear !== value) {
      onChange(sourceYear);
    }
  }, [sourceYear, autoUpdate, onChange, value]);

  const handleYearChange = (event) => {
    onChange(event.target.value);
    setOpen(false);
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d{0,4}$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  return (
    <FormControl fullWidth size="small" error={!!error}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 'bold',
          mb: 0.5,
          color: settings.textPrimaryColor || settings.primaryColor || '#333',
          display: 'block',
        }}
      >
        {label}
      </Typography>
      <ThemedTextField
        settings={settings}
        value={value || ''}
        onChange={handleInputChange}
        disabled={disabled}
        error={!!error}
        helperText={helperText || ''}
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setOpen(!open)}
                size="small"
                disabled={disabled}
                sx={{ color: settings.textPrimaryColor || settings.primaryColor || '#6D2323' }}
              >
                <ArrowDropDownIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {open && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            zIndex: 1000,
            maxHeight: 200,
            overflow: 'auto',
            mt: 1,
            width: '100%',
            borderRadius: 2,
          }}
        >
          {years.map((year) => (
            <MenuItem
              key={year}
              value={year}
              onClick={() => handleYearChange({ target: { value: year } })}
              sx={{
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              {year}
            </MenuItem>
          ))}
        </Paper>
      )}
    </FormControl>
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
      <ThemedTextField
        settings={settings}
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
          startAdornment: <PersonIcon sx={{ color: settings.textPrimaryColor || settings.primaryColor || '#6D2323', mr: 1 }} />,
          endAdornment: (
            <IconButton
              onClick={dropdownDisabled ? undefined : handleDropdownClick}
              size="small"
              disabled={dropdownDisabled}
              sx={{ color: settings.textPrimaryColor || settings.primaryColor || '#6D2323' }}
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
                      backgroundColor: alpha(settings.accentColor || settings.backgroundColor || '#FEF9E1', 0.3),
                    },
                  }}
                >
                  <ListItemText
                    primary={employee.name}
                    secondary={`#${employee.employeeNumber}`}
                    primaryTypographyProps={{ fontWeight: 'bold', color: settings.textPrimaryColor || '#6D2323' }}
                    secondaryTypographyProps={{ color: settings.textSecondaryColor || '#666' }}
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

const Vocational = () => {
  const { socket, connected } = useSocket();
  const refreshVocationalRef = useRef(null);
  const [data, setData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [newVocational, setNewVocational] = useState({
    vocationalNameOfSchool: '',
    vocationalDegree: '',
    vocationalPeriodFrom: '',
    vocationalPeriodTo: '',
    vocationalHighestAttained: '',
    vocationalYearGraduated: '',
    vocationalScholarshipAcademicHonorsReceived: '',
    person_id: '',
  });
  const [editVocational, setEditVocational] = useState(null);
  const [originalVocational, setOriginalVocational] = useState(null);
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

  const navigate = useNavigate();
  
  // Color scheme
  const { settings } = useSystemSettings();
  const addButtonStyles = useCRUDButtonStyles('create');
  const editButtonStyles = useCRUDButtonStyles('edit');
  const deleteButtonStyles = useCRUDButtonStylesOutlined('delete');
  const saveButtonStyles = useCRUDButtonStyles('save');
  
  // Use stable themed components
  const GlassCard = ThemedCard;
  const ProfessionalButton = ThemedButton;
  const ModernTextField = ThemedTextField;
  
  // Get colors from system settings
  const primaryColor = settings.accentColor || '#FEF9E1'; // Cards color
  const secondaryColor = settings.backgroundColor || '#FFF8E7'; // Background
  const accentColor = settings.primaryColor || '#6d2323'; // Primary accent
  const accentDark = settings.secondaryColor || '#8B3333'; // Darker accent
  const textPrimaryColor = settings.textPrimaryColor || '#6d2323';
  const textSecondaryColor = settings.textSecondaryColor || '#FEF9E1';
  const hoverColor = settings.hoverColor || '#6D2323';
  const grayColor = settings.textSecondaryColor || '#6c757d';

  // Dynamic page access control using component identifier
  const { hasAccess, loading: accessLoading, error: accessError } = usePageAccess('vocational');

  useEffect(() => {
    fetchVocationalData();
  }, []);

  const fetchVocationalData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/vocational/vocational-table`,
        getAuthHeaders()
      );
      setData(res.data);

      // Fetch employee names for all records
      const uniqueEmployeeIds = [
        ...new Set(res.data.map((c) => c.person_id).filter(Boolean)),
      ];
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
      showSnackbar(
        'Failed to fetch vocational records. Please try again.',
        'error'
      );
    }
  };

  // Keep latest fetch function for Socket.IO handler
  useEffect(() => {
    refreshVocationalRef.current = fetchVocationalData;
  });

  // Realtime: refresh when anyone changes vocational records
  useEffect(() => {
    if (!socket || !connected) return;

    const handleChanged = () => {
      refreshVocationalRef.current?.();
    };

    socket.on('vocationalChanged', handleChanged);
    return () => {
      socket.off('vocationalChanged', handleChanged);
    };
  }, [socket, connected]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'vocationalNameOfSchool',
      'vocationalDegree',
      'person_id',
    ];

    requiredFields.forEach((field) => {
      if (!newVocational[field] || newVocational[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (
      newVocational.vocationalPeriodFrom &&
      newVocational.vocationalPeriodTo
    ) {
      if (
        parseInt(newVocational.vocationalPeriodFrom) >
        parseInt(newVocational.vocationalPeriodTo)
      ) {
        newErrors.vocationalPeriodTo = 'End year must be after start year';
      }
    }

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
      await axios.post(
        `${API_BASE_URL}/vocational/vocational-table`,
        newVocational,
        getAuthHeaders()
      );
      setNewVocational({
        vocationalNameOfSchool: '',
        vocationalDegree: '',
        vocationalPeriodFrom: '',
        vocationalPeriodTo: '',
        vocationalHighestAttained: '',
        vocationalYearGraduated: '',
        vocationalScholarshipAcademicHonorsReceived: '',
        person_id: '',
      });
      setSelectedEmployee(null);
      setErrors({});
      setTimeout(() => {
        setLoading(false);
        setSuccessAction('adding');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchVocationalData();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
      showSnackbar(
        'Failed to add vocational record. Please try again.',
        'error'
      );
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/vocational/vocational-table/${editVocational.id}`,
        editVocational,
        getAuthHeaders()
      );
      setEditVocational(null);
      setOriginalVocational(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchVocationalData();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
      showSnackbar(
        'Failed to update vocational record. Please try again.',
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/vocational/vocational-table/${id}`, getAuthHeaders());
      setEditVocational(null);
      setOriginalVocational(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchVocationalData();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
      showSnackbar(
        'Failed to delete vocational record. Please try again.',
        'error'
      );
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditVocational({ ...editVocational, [field]: value });
    } else {
      setNewVocational({ ...newVocational, [field]: value });
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
    setNewVocational({ ...newVocational, person_id: employeeNumber });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.person_id;
      return newErrors;
    });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditVocational({ ...editVocational, person_id: employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const handleOpenModal = async (vocational) => {
    const employeeName = employeeNames[vocational.person_id] || 'Unknown';

    setEditVocational({ ...vocational });
    setOriginalVocational({ ...vocational });
    setSelectedEditEmployee({
      name: employeeName,
      employeeNumber: vocational.person_id,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditVocational({ ...originalVocational });
    setSelectedEditEmployee({
      name: employeeNames[originalVocational.person_id] || 'Unknown',
      employeeNumber: originalVocational.person_id,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditVocational(null);
    setOriginalVocational(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editVocational || !originalVocational) return false;

    return (
      editVocational.vocationalNameOfSchool !==
        originalVocational.vocationalNameOfSchool ||
      editVocational.vocationalDegree !== originalVocational.vocationalDegree ||
      editVocational.vocationalPeriodFrom !==
        originalVocational.vocationalPeriodFrom ||
      editVocational.vocationalPeriodTo !==
        originalVocational.vocationalPeriodTo ||
      editVocational.vocationalHighestAttained !==
        originalVocational.vocationalHighestAttained ||
      editVocational.vocationalYearGraduated !==
        originalVocational.vocationalYearGraduated ||
      editVocational.vocationalScholarshipAcademicHonorsReceived !==
        originalVocational.vocationalScholarshipAcademicHonorsReceived ||
      editVocational.person_id !== originalVocational.person_id
    );
  };

  if (accessLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: accentColor, mb: 2 }} />
          <Typography variant="h6" sx={{ color: accentColor }}>
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
        message="You do not have permission to access Vocational Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((vocational) => {
    const schoolName = vocational.vocationalNameOfSchool?.toLowerCase() || '';
    const personId = vocational.person_id?.toString() || "";
    const employeeName =
      employeeNames[vocational.person_id]?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      personId.includes(search) ||
      schoolName.includes(search) ||
      employeeName.includes(search)
    );
  });

  return (
    <Box sx={{ 
      py: { xs: 2, md: 4 },
      mt: { xs: 0, md: -5 },
      width: '100%',
      maxWidth: '1600px',
      mx: 'auto',
      overflowX: 'hidden',
    }}>
      <Box sx={{ px: { xs: 2, sm: 3, md: 6 } }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard settings={settings}>
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: accentColor,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(109,35,35,0.1) 0%, rgba(109,35,35,0) 70%)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: '30%',
                    width: 150,
                    height: 150,
                    background: 'radial-gradient(circle, rgba(109,35,35,0.08) 0%, rgba(109,35,35,0) 70%)',
                  }}
                />
                
                <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        mr: 4, 
                        width: 64,
                        height: 64,
                        boxShadow: '0 8px 24px rgba(109,35,35,0.15)'
                      }}
                    >
                      <ConstructionIcon sx={{color: accentColor, fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Vocational Information Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Add and manage vocational records for employees
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
          sx={{ color: primaryColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
              Processing vocational record...
            </Typography>
          </Box>
        </Backdrop>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Vocational Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={700}>
              <GlassCard settings={settings} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: accentColor,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <ConstructionIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Add New Vocational Record
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in the vocational information
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  p: 4, 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflowY: 'auto'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: accentColor, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 24 }} />
                      Employee Information <span style={{ marginLeft: '12px', fontWeight: 400, opacity: 0.7, color: 'red' }}>*</span>
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={newVocational.person_id}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                          error={!!errors.person_id}
                          helperText={errors.person_id || ''}
                          settings={settings}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
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
                            <PersonIcon sx={{ color: accentColor, fontSize: 20 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: accentColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: settings.textPrimaryColor || '#A31D1D',
                                  fontSize: '12px',
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
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              border: '2px dashed rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              minHeight: '30px',
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

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: accentColor, display: 'flex', alignItems: 'center' }}>
                    <ConstructionIcon sx={{ mr: 2, fontSize: 24 }} />
                    Vocational Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        School Name <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        value={newVocational.vocationalNameOfSchool}
                        onChange={(e) => handleChange('vocationalNameOfSchool', e.target.value)}
                        fullWidth
                        size="small"
                        error={!!errors.vocationalNameOfSchool}
                        helperText={errors.vocationalNameOfSchool || ''}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Degree <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        value={newVocational.vocationalDegree}
                        onChange={(e) => handleChange('vocationalDegree', e.target.value)}
                        fullWidth
                        size="small"
                        error={!!errors.vocationalDegree}
                        helperText={errors.vocationalDegree || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <YearInput
                        value={newVocational.vocationalPeriodFrom}
                        onChange={(value) => handleChange('vocationalPeriodFrom', value)}
                        label="Period From"
                        error={!!errors.vocationalPeriodFrom}
                        helperText={errors.vocationalPeriodFrom || ''}
                        settings={settings}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <YearInput
                        value={newVocational.vocationalPeriodTo}
                        onChange={(value) => handleChange('vocationalPeriodTo', value)}
                        label="Period To"
                        error={!!errors.vocationalPeriodTo}
                        helperText={errors.vocationalPeriodTo || ''}
                        settings={settings}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Highest Attained
                      </Typography>
                      <ModernTextField
                        value={newVocational.vocationalHighestAttained}
                        onChange={(e) => handleChange('vocationalHighestAttained', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <YearInput
                        value={newVocational.vocationalYearGraduated}
                        onChange={(value) => handleChange('vocationalYearGraduated', value)}
                        label="Year Graduated"
                        autoUpdate={true}
                        sourceYear={newVocational.vocationalPeriodTo}
                        settings={settings}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Honors Received
                      </Typography>
                      <ModernTextField
                        value={newVocational.vocationalScholarshipAcademicHonorsReceived}
                        onChange={(e) => handleChange('vocationalScholarshipAcademicHonorsReceived', e.target.value)}
                        fullWidth
                        size="small"
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
                        ...addButtonStyles
                      }}
                    >
                      Add Vocational Record
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Vocational Records Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={900}>
              <GlassCard settings={settings} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: accentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ConstructionIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Vocational Records
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
                          color: accentColor
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
                  p: 4, 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <ModernTextField
                      size="small"
                      variant="outlined"
                      placeholder="Search by Employee ID, Name, or School"
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
                        {filteredData.map((vocational) => (
                          <Grid item xs={12} sm={6} md={4} key={vocational.id}>
                            <Card
                              onClick={() => handleOpenModal(vocational)}
                              sx={{
                                cursor: "pointer",
                                border: "1px solid rgba(109, 35, 35, 0.1)",
                                height: "100%",
                                display: 'flex',
                                flexDirection: 'column',
                                "&:hover": { 
                                  borderColor: accentColor,
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 4px 8px rgba(109,35,35,0.15)'
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <ConstructionIcon sx={{ fontSize: 18, color: accentColor, mr: 0.5 }} />
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor, 
                                    px: 0.5, 
                                    py: 0.2, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    ID: {vocational.person_id}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                  {employeeNames[vocational.person_id] || 'Loading...'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={1} sx={{ flexGrow: 1, wordBreak: 'break-word' }}>
                                  {vocational.vocationalNameOfSchool || 'No School'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={1} sx={{ flexGrow: 1, wordBreak: 'break-word' }}>
                                  {vocational.vocationalDegree || 'No Degree'}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ fontSize: 14, color: '#000', mr: 0.5 }} />
                                    <Typography variant="caption" color="#000" fontSize="0.75rem">
                                      {vocational.vocationalPeriodFrom || '----'}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="#000" fontSize="0.75rem">
                                    to
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ fontSize: 14, color: '#000', mr: 0.5 }} />
                                    <Typography variant="caption" color="#000" fontSize="0.75rem">
                                      {vocational.vocationalPeriodTo || '----'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredData.map((vocational) => (
                        <Card
                          key={vocational.id}
                          onClick={() => handleOpenModal(vocational)}
                          sx={{
                            cursor: "pointer",
                            border: "1px solid rgba(109, 35, 35, 0.1)",
                            mb: 1,
                            "&:hover": { 
                              borderColor: accentColor,
                              backgroundColor: 'rgba(254, 249, 225, 0.3)'
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Box sx={{ mr: 1.5, mt: 0.2 }}>
                                <ConstructionIcon sx={{ fontSize: 20, color: accentColor }} />
                              </Box>
                              
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="caption" sx={{ 
                                  color: accentColor,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  display: 'block',
                                  mb: 0.5
                                }}>
                                  ID: {vocational.person_id}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="#333" sx={{ mb: 0.5 }}>
                                  {employeeNames[vocational.person_id] || 'Loading...'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                                  {vocational.vocationalNameOfSchool || 'No School'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                                  {vocational.vocationalDegree || 'No Degree'}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarToday sx={{ fontSize: 14, color: '#000', mr: 0.25 }} />
                                  <Typography variant="caption" color="#000" fontSize="0.75rem">
                                    {vocational.vocationalPeriodFrom || '----'}
                                  </Typography>
                                  <Typography variant="caption" color="#000" fontSize="0.75rem" sx={{ mx: 0.25 }}>
                                    to
                                  </Typography>
                                  <CalendarToday sx={{ fontSize: 14, color: '#000', mr: 0.25 }} />
                                  <Typography variant="caption" color="#000" fontSize="0.75rem">
                                    {vocational.vocationalPeriodTo || '----'}
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
                        <Typography variant="h6" color={accentColor} fontWeight="bold" sx={{ mb: 1 }}>
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

        {/* Edit Vocational Modal */}
        <Modal
          open={!!editVocational}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GlassCard
            settings={settings}
            sx={{
              width: "90%",
              maxWidth: "900px",
              maxHeight: "90vh",
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {editVocational && (
              <>
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${settings.secondaryColor || '#6d2323'} 0%, ${settings.deleteButtonHoverColor || '#a31d1d'} 100%)`,
                    color: settings.accentColor || '#FEF9E1',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: settings.accentColor || '#FEF9E1' }}>
                    {isEditing ? "Edit Vocational Information" : "Vocational Details"}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: settings.accentColor || '#FEF9E1' }}>
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
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: accentColor, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 24 }} />
                      Employee Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={editVocational?.person_id || ''}
                          onChange={isEditing ? handleEditEmployeeChange : () => {}}
                          selectedEmployee={selectedEditEmployee}
                          onEmployeeSelect={isEditing ? handleEditEmployeeSelect : () => {}}
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
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
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
                            <PersonIcon sx={{ color: accentColor, fontSize: 20 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: accentColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEditEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: settings.textPrimaryColor || '#A31D1D',
                                  fontSize: '12px',
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
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              border: '2px dashed rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              padding: '12px',
                              minHeight: '48px',
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

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: accentColor, display: 'flex', alignItems: 'center' }}>
                    <ConstructionIcon sx={{ mr: 2, fontSize: 24 }} />
                    Vocational Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        School Name
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVocational.vocationalNameOfSchool}
                          onChange={(e) => handleChange('vocationalNameOfSchool', e.target.value, true)}
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVocational.vocationalNameOfSchool}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Degree
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVocational.vocationalDegree}
                          onChange={(e) => handleChange('vocationalDegree', e.target.value, true)}
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVocational.vocationalDegree || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {isEditing ? (
                        <YearInput
                          value={editVocational.vocationalPeriodFrom}
                          onChange={(value) => handleChange('vocationalPeriodFrom', value, true)}
                          label="Period From"
                          settings={settings}
                        />
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                            Period From
                          </Typography>
                          <Box sx={{ 
                            p: 1.5, 
                            bgcolor: 'rgba(254, 249, 225, 0.5)', 
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)'
                          }}>
                            <Typography variant="body2">
                              {editVocational.vocationalPeriodFrom || 'N/A'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {isEditing ? (
                        <YearInput
                          value={editVocational.vocationalPeriodTo}
                          onChange={(value) => handleChange('vocationalPeriodTo', value, true)}
                          label="Period To"
                          settings={settings}
                        />
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                            Period To
                          </Typography>
                          <Box sx={{ 
                            p: 1.5, 
                            bgcolor: 'rgba(254, 249, 225, 0.5)', 
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)'
                          }}>
                            <Typography variant="body2">
                              {editVocational.vocationalPeriodTo || 'N/A'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Highest Attained
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVocational.vocationalHighestAttained}
                          onChange={(e) => handleChange('vocationalHighestAttained', e.target.value, true)}
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVocational.vocationalHighestAttained || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {isEditing ? (
                        <YearInput
                          value={editVocational.vocationalYearGraduated}
                          onChange={(value) => handleChange('vocationalYearGraduated', value, true)}
                          label="Year Graduated"
                          autoUpdate={true}
                          sourceYear={editVocational.vocationalPeriodTo}
                          settings={settings}
                        />
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                            Year Graduated
                          </Typography>
                          <Box sx={{ 
                            p: 1.5, 
                            bgcolor: 'rgba(254, 249, 225, 0.5)', 
                            borderRadius: 1,
                            border: '1px solid rgba(109, 35, 35, 0.2)'
                          }}>
                            <Typography variant="body2">
                              {editVocational.vocationalYearGraduated || 'N/A'}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Honors Received
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVocational.vocationalScholarshipAcademicHonorsReceived}
                          onChange={(e) => handleChange('vocationalScholarshipAcademicHonorsReceived', e.target.value, true)}
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVocational.vocationalScholarshipAcademicHonorsReceived || 'N/A'}
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
                        onClick={() => handleDelete(editVocational.id)}
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

export default Vocational;