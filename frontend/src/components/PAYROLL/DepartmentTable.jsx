import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Chip,
  Modal,
  Snackbar,
  Alert,
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  InputAdornment,
  Fade,
  Backdrop,
  styled,
  alpha,
  Avatar,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Domain,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Close,
  Refresh,
} from '@mui/icons-material';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from 'react-router-dom';
import usePageAccess from '../../hooks/usePageAccess';
import { useSystemSettings } from '../../hooks/useSystemSettings';

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

const DepartmentTable = () => {
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
  const [newEntry, setNewEntry] = useState({
    code: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalDepartment, setOriginalDepartment] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log(
      'Token from localStorage:',
      token ? 'Token exists' : 'No token found'
    );
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Dynamic page access control using component identifier
  // Note: This component may need a new page entry in the database with identifier 'department-table'
  const { hasAccess, loading: accessLoading, error: accessError } = usePageAccess('department-table');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-table`,
        getAuthHeaders()
      );
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching data', error);
      showSnackbar(
        'Failed to fetch department data. Please try again.',
        'error'
      );
    }
  };

  const addEntry = async () => {
    if (!newEntry.code || !newEntry.description) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/department-table`,
        newEntry,
        getAuthHeaders()
      );
      setNewEntry({ code: '', description: '' });
      fetchData();
      setTimeout(() => {
        setLoading(false);
        setSuccessAction('adding');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
    } catch (error) {
      console.error('Error adding data', error);
      setLoading(false);
      showSnackbar('Failed to add department. Please try again.', 'error');
    }
  };

  const startEditing = (item) => {
    setSelectedDepartment(item);
    setOriginalDepartment({ ...item });
    setEditData({
      code: item.code,
      description: item.description,
    });
    setModalOpen(true);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedDepartment({ ...originalDepartment });
    setEditData({
      code: originalDepartment.code,
      description: originalDepartment.description,
    });
    setIsEditing(false);
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/department-table/${selectedDepartment.id}`,
        editData,
        getAuthHeaders()
      );
      setModalOpen(false);
      setSelectedDepartment(null);
      setOriginalDepartment(null);
      setIsEditing(false);
      fetchData();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error saving edit', error);
      showSnackbar('Failed to update department. Please try again.', 'error');
    }
  };

  const deleteEntry = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/department-table/${id}`,
        getAuthHeaders()
      );
      setModalOpen(false);
      setSelectedDepartment(null);
      setOriginalDepartment(null);
      setIsEditing(false);
      fetchData();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error deleting entry', error);
      showSnackbar('Failed to delete department. Please try again.', 'error');
    }
  };

  const handleChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!selectedDepartment || !originalDepartment) return false;

    return (
      editData.code !== originalDepartment.code ||
      editData.description !== originalDepartment.description
    );
  };

  const filteredData = data.filter((department) => {
    const code = department.code?.toLowerCase() || '';
    const description = department.description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return code.includes(search) || description.includes(search);
  });

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
        message="You do not have permission to access Department Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

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
                      <Domain sx={{ color: textPrimaryColor, fontSize: 32 }} />
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
                        Department Information Management
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}
                      >
                        Add and manage department records
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

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: textSecondaryColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: textSecondaryColor }}>
              Processing department record...
            </Typography>
          </Box>
        </Backdrop>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Department Section */}
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
                  <Domain sx={{ fontSize: '1.8rem', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Add New Department
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in department information
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
                        color: textPrimaryColor,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Domain sx={{ mr: 2, fontSize: 24 }} />
                      Department Information{' '}
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
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                        >
                          Department Code
                        </Typography>
                        <ModernTextField
                          value={newEntry.code}
                          onChange={(e) =>
                            setNewEntry({ ...newEntry, code: e.target.value })
                          }
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: accentColor,
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: accentColor,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: accentColor,
                              },
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                        >
                          Department Description
                        </Typography>
                        <ModernTextField
                          value={newEntry.description}
                          onChange={(e) =>
                            setNewEntry({
                              ...newEntry,
                              description: e.target.value,
                            })
                          }
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: accentColor,
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: accentColor,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: accentColor,
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 3 }}>
                    <ProfessionalButton
                      onClick={addEntry}
                      variant="contained"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{
                        backgroundColor: accentColor,
                        color: textSecondaryColor,
                        py: 1.5,
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: accentDark,
                        },
                      }}
                    >
                      Add Department
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
                    <Domain sx={{ fontSize: '1.8rem', mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Department Records
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
                        color: textPrimaryColor,
                        borderColor: alpha(accentColor, 0.5),
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
                  <Box sx={{ mb: 3 }}>
                    <ModernTextField
                      size="small"
                      variant="outlined"
                      placeholder="Search by Code or Description"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <SearchIcon sx={{ color: textPrimaryColor, mr: 1 }} />
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
                        {filteredData.map((department) => (
                          <Grid item xs={12} sm={6} md={4} key={department.id}>
                            <Card
                              onClick={() => startEditing(department)}
                              sx={{
                                cursor: 'pointer',
                                border: `1px solid ${alpha(accentColor, 0.1)}`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  borderColor: accentColor,
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease',
                                  boxShadow: `0 4px 8px ${alpha(accentColor, 0.15)}`,
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
                                  <Domain
                                    sx={{
                                      fontSize: 18,
                                      color: accentColor,
                                      mr: 0.5,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: textPrimaryColor,
                                      px: 0.5,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    ID: {department.id}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="#333"
                                  mb={0.5}
                                  noWrap
                                >
                                  {department.description || 'No Description'}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="#666"
                                  sx={{ flexGrow: 1 }}
                                >
                                  {department.code}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredData.map((department) => (
                        <Card
                          key={department.id}
                          onClick={() => startEditing(department)}
                          sx={{
                            cursor: 'pointer',
                            border: `1px solid ${alpha(accentColor, 0.1)}`,
                            mb: 1,
                            '&:hover': {
                              borderColor: accentColor,
                              backgroundColor: alpha(primaryColor, 0.3),
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{ display: 'flex', alignItems: 'flex-start' }}
                            >
                              <Box sx={{ mr: 1.5, mt: 0.2 }}>
                                <Domain
                                  sx={{ fontSize: 20, color: accentColor }}
                                />
                              </Box>

                              <Box sx={{ flexGrow: 1 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: textPrimaryColor,
                                      px: 0.5,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      mr: 1,
                                    }}
                                  >
                                    ID: {department.id}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color="#333"
                                  >
                                    {department.description || 'No Description'}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant="body2"
                                  color="#666"
                                  sx={{ mb: 0.5 }}
                                >
                                  {department.code}
                                </Typography>
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
                          color={textPrimaryColor}
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          No Records Found
                        </Typography>
                        <Typography
                          variant="body2"
                          color="#666"
                          sx={{ mt: 0.5 }}
                        >
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
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlassCard
            sx={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {selectedDepartment && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: textPrimaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {isEditing
                      ? 'Edit Department Information'
                      : 'Department Details'}
                  </Typography>
                  <IconButton
                    onClick={() => setModalOpen(false)}
                    sx={{ color: textPrimaryColor }}
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
                    maxHeight: 'calc(90vh - 140px)', // Account for header and sticky footer
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
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: textPrimaryColor,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Domain sx={{ mr: 2, fontSize: 24 }} />
                        Department Information
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                          >
                            Department Code
                          </Typography>
                          {isEditing ? (
                            <ModernTextField
                              value={editData.code}
                              onChange={(e) =>
                                handleChange('code', e.target.value)
                              }
                              fullWidth
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: accentColor,
                                  },
                                  '&:hover fieldset': {
                                    borderColor: accentColor,
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: accentColor,
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                p: 1.5,
                                bgcolor: alpha(primaryColor, 0.5),
                                borderRadius: 1,
                              }}
                            >
                              {selectedDepartment.code}
                            </Typography>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 1, color: textPrimaryColor }}
                          >
                            Department Description
                          </Typography>
                          {isEditing ? (
                            <ModernTextField
                              value={editData.description}
                              onChange={(e) =>
                                handleChange('description', e.target.value)
                              }
                              fullWidth
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: accentColor,
                                  },
                                  '&:hover fieldset': {
                                    borderColor: accentColor,
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: accentColor,
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                p: 1.5,
                                bgcolor: alpha(primaryColor, 0.5),
                                borderRadius: 1,
                              }}
                            >
                              {selectedDepartment.description}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Sticky Action Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mt: 4,
                      justifyContent: 'flex-end',
                    }}
                  >
                    {!isEditing ? (
                      <>
                        <ProfessionalButton
                          onClick={() => deleteEntry(selectedDepartment.id)}
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          sx={{
                            color: '#d32f2f',
                            borderColor: '#d32f2f',
                            '&:hover': {
                              backgroundColor: '#d32f2f',
                              color: '#fff',
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
                            backgroundColor: accentColor,
                            color: textSecondaryColor,
                            '&:hover': { backgroundColor: accentDark },
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
                            color: '#666',
                            borderColor: '#666',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          Cancel
                        </ProfessionalButton>
                        <ProfessionalButton
                          onClick={saveEdit}
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={!hasChanges()}
                          sx={{
                            backgroundColor: hasChanges() ? accentColor : '#ccc',
                            color: textSecondaryColor,
                            '&:hover': {
                              backgroundColor: hasChanges() ? accentDark : '#ccc',
                            },
                            '&:disabled': {
                              backgroundColor: '#ccc',
                              color: '#999',
                            },
                          }}
                        >
                          Save
                        </ProfessionalButton>
                      </>
                    )}
                  </Box>
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

export default DepartmentTable;