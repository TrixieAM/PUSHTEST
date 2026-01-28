import API_BASE_URL from "../../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Fade,
  Alert,
  LinearProgress,
  alpha,
  CardHeader,
  Stack,
  Chip,
  useTheme,
  styled,
  Breadcrumbs,
  Link,
  Skeleton,
  Backdrop,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  Today,
  ArrowBackIos,
  ArrowForwardIos,
  Clear,
  SaveAs,
  Refresh,
  Edit,
  Home,
  Assessment,
  DateRange,
  FilterList,
  DateRange as DateRangeIcon,
} from "@mui/icons-material";
import { useSystemSettings } from "../../hooks/useSystemSettings";
import { useCRUDButtonStyles } from '../../hooks/useCRUDButtonStyles';
import usePageAccess from '../../hooks/usePageAccess';
import AccessDenied from '../AccessDenied';

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '109, 35, 35';
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

const ProfessionalButton = styled(Button)(({ theme, variant, color = 'primary' }) => ({
  borderRadius: 12,
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
  boxShadow: variant === 'contained' ? '0 4px 14px rgba(254, 249, 225, 0.25)' : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 6px 20px rgba(254, 249, 225, 0.35)' : 'none',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

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

const PremiumTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(109, 35, 35, 0.06)',
  border: '1px solid rgba(109, 35, 35, 0.08)',
}));

const PremiumTableCell = styled(TableCell)(({ theme, isHeader = false }) => ({
  fontWeight: isHeader ? 600 : 500,
  padding: '18px 20px',
  borderBottom: isHeader ? '2px solid rgba(254, 249, 225, 0.5)' : '1px solid rgba(109, 35, 35, 0.06)',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
}));

const AttendanceSearch = () => {
  const { settings } = useSystemSettings();
  const saveButtonStyles = useCRUDButtonStyles('save');
  const [personID, setPersonID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const theme = useTheme();

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

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;

  //ACCESSING
  // Dynamic page access control using component identifier
  // The identifier 'search-attendance' should match the component_identifier in the pages table
  const {
    hasAccess,
    loading: accessLoading,
    error: accessError,
  } = usePageAccess('search-attendance');
  // ACCESSING END

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

  const fetchRecords = async (showLoading = true) => {
    if (!personID || !startDate || !endDate) return;
    
    if (showLoading) setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        {
          personID,
          startDate,
          endDate,
        },
        getAuthHeaders()
      );
      setRecords(response.data);
    } catch (err) {
      console.error("Axios error:", err.response ? err.response.data : err);
      setError("Failed to fetch attendance records. Please try again.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const saveAll = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await axios.put(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        { records },
        getAuthHeaders()
      );
      setSuccess(response.data.message || "Records saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedRecords = [...records];
    updatedRecords[index][field] = value;
    setRecords(updatedRecords);
  };

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthClick = (monthIndex) => {
    const start = new Date(Date.UTC(selectedYear, monthIndex, 1));
    const end = new Date(Date.UTC(selectedYear, monthIndex + 1, 0));
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end.toISOString().substring(0, 10));
    setSelectedMonth(monthIndex);
  };

  const handleClearFilters = () => {
    setPersonID("");
    setStartDate("");
    setEndDate("");
    setRecords([]);
    setError("");
    setSuccess("");
    setSelectedMonth(null);
  };

  // Auto-fetch when dates change (for quick select buttons)
  useEffect(() => {
    if (personID && startDate && endDate) {
      fetchRecords(false); // Silent fetch without loading indicator
    }
  }, [startDate, endDate]);

  // ACCESSING 2
  // Loading state
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
          <CircularProgress sx={{ color: '#6d2323', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6d2323' }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }
  // Access denied state - Now using the reusable component
  if (hasAccess === false) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access Attendance Modification. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }
  //ACCESSING END2

  return (
    <Box sx={{ 
      py: 4,
      borderRadius: '14px',
      width: '100vw', // Full viewport width
      mx: 'auto', // Center horizontally
      maxWidth: '100%', // Ensure it doesn't exceed viewport
      overflow: 'hidden', // Prevent horizontal scroll
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)', // Center the element
    }}>
      {/* Wider Container */}
      <Box sx={{ px: 6, mx: 'auto', maxWidth: '1600px' }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard sx={{border: `1px solid ${alpha(accentColor, 0.1)}`}}>
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: accentColor,
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
                      <Edit sx={{ fontSize: 32, color: accentColor }} />
                    </Avatar>
                    <Box>
                      {/* Changed from h3 to h4 for smaller title */}
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Attendance Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Review and manage attendance records
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="Editable Records" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                    <Tooltip title="Refresh Data">
                      <IconButton 
                        onClick={() => fetchRecords(true)}
                        disabled={!personID || !startDate || !endDate}
                        sx={{ 
                          bgcolor: 'rgba(109,35,35,0.1)', 
                          '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                          color: accentColor,
                          width: 48,
                          height: 48,
                          '&:disabled': { 
                            bgcolor: 'rgba(109,35,35,0.05)',
                            color: 'rgba(109,35,35,0.3)'
                          }
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Controls */}
        <Fade in timeout={700}>
          <GlassCard sx={{ mb: 4, border: `1px solid ${alpha(accentColor, 0.1)}` }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form">
                <Grid container spacing={4} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <ModernTextField
                      fullWidth
                      label="Employee Number"
                      value={personID}
                      onChange={(e) => setPersonID(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: textPrimaryColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ModernTextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: textPrimaryColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ModernTextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: textPrimaryColor }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3, borderColor: alpha(accentColor, 0.1) }} />

                {/* Quick Date Selection Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: textPrimaryColor,
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <FilterList sx={{ mr: 2 }} />
                    Quick Date Selection
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: alpha(textPrimaryColor, 0.7), mb: 2 }}
                  >
                    Click any option below to automatically set the date range:
                  </Typography>

                  {/* Quick Filters Row */}
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}
                  >
                    <ProfessionalButton
                      variant="outlined"
                      startIcon={<Today />}
                      onClick={() => {
                        setStartDate(formattedToday);
                        setEndDate(formattedToday);
                      }}
                      sx={{ borderColor: accentColor, color: textPrimaryColor }}
                    >
                      Today
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="outlined"
                      startIcon={<ArrowBackIos />}
                      onClick={() => {
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        setStartDate(yesterday.toISOString().substring(0, 10));
                        setEndDate(yesterday.toISOString().substring(0, 10));
                      }}
                      sx={{ borderColor: accentColor, color: textPrimaryColor }}
                    >
                      Yesterday
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="outlined"
                      onClick={() => {
                        const lastWeek = new Date(today);
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        setStartDate(lastWeek.toISOString().substring(0, 10));
                        setEndDate(formattedToday);
                      }}
                      sx={{ borderColor: accentColor, color: textPrimaryColor }}
                    >
                      Last 7 Days
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="outlined"
                      onClick={() => {
                        const days15 = new Date(today);
                        days15.setDate(days15.getDate() - 15);
                        setStartDate(days15.toISOString().substring(0, 10));
                        setEndDate(formattedToday);
                      }}
                      sx={{ borderColor: accentColor, color: textPrimaryColor }}
                    >
                      Last 15 Days
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="outlined"
                      onClick={() => {
                        const lastMonth = new Date(today);
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        setStartDate(lastMonth.toISOString().substring(0, 10));
                        setEndDate(formattedToday);
                      }}
                      sx={{ borderColor: accentColor, color: textPrimaryColor }}
                    >
                      Last 30 Days
                    </ProfessionalButton>
                  </Box>

                  {/* Month Selection */}
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: `2px dashed ${alpha(accentColor, 0.2)}`,
                      backgroundColor: alpha(primaryColor, 0.3),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: textPrimaryColor,
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        >
                          Select Entire Month
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha(textPrimaryColor, 0.7) }}
                        >
                          Choose a year, then click any month to view records
                          for that entire month
                        </Typography>
                      </Box>
                      <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontWeight: 600 }}>Year</InputLabel>
                        <Select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          label="Year"
                          sx={{
                            backgroundColor: "white",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: accentColor,
                            },
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        >
                          {yearOptions.map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(3, 1fr)",
                          sm: "repeat(4, 1fr)",
                          md: "repeat(6, 1fr)",
                        },
                        gap: 1.5,
                      }}
                    >
                      {months.map((month, index) => {
                        const isSelected = selectedMonth === index;
                        return (
                          <ProfessionalButton
                            key={month}
                            variant={isSelected ? "contained" : "outlined"}
                            size="medium"
                            onClick={() => handleMonthClick(index)}
                            sx={{
                              borderColor: isSelected
                                ? accentColor
                                : accentColor,
                              backgroundColor: isSelected
                                ? accentColor
                                : "transparent",
                              color: isSelected
                                ? textSecondaryColor
                                : textPrimaryColor,
                              py: 1.5,
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor: isSelected
                                  ? accentDark
                                  : alpha(accentColor, 0.1),
                                borderWidth: 2,
                              },
                              transition: "all 0.3s ease",
                              boxShadow: isSelected
                                ? `0 4px 12px ${alpha(accentColor, 0.3)}`
                                : "none",
                            }}
                          >
                            {month}
                          </ProfessionalButton>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                {/* Clear Button */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <ProfessionalButton
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    sx={{
                      borderColor: "#d32f2f",
                      color: "#d32f2f",
                      "&:hover": {
                        borderColor: "#b71c1c",
                        backgroundColor: alpha("#d32f2f", 0.05),
                      },
                    }}
                  >
                    Clear All Filters
                  </ProfessionalButton>
                </Box>
              </Box>
            </CardContent>
          </GlassCard>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: primaryColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
              Fetching attendance records...
            </Typography>
          </Box>
        </Backdrop>

        {error && (
          <Fade in timeout={300}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {success && (
          <Fade in timeout={300}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                '& .MuiAlert-message': { fontWeight: 500 }
              }}
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>
          </Fade>
        )}

        {/* Results */}
        {records.length > 0 && (
          <Fade in={!loading} timeout={500}>
            <GlassCard sx={{ mb: 4, border: `1px solid ${alpha(accentColor, 0.1)}` }}>
              <Box sx={{ 
                p: 4, 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
                color: accentColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentDark }}>
                    Editable Attendance Records
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: accentColor }}>
                    <b>{personID}</b>
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Chip 
                      icon={<Edit />}
                      label={`${records.length} Records`}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500
                      }} 
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8, color: accentDark }}>
                      {startDate} to {endDate}
                    </Typography>
                  </Box>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(109,35,35,0.15)', 
                    width: 80, 
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 600,
                    color: accentColor
                  }}
                >
                  <Edit />
                </Avatar>
              </Box>

              <PremiumTableContainer>
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead sx={{ bgcolor: alpha(primaryColor, 0.7) }}>
                    <TableRow>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 120 }}>Employee Number</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 100 }}>Date</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 100 }}>Day</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Time IN</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Breaktime IN</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Breaktime OUT</PremiumTableCell>
                      <PremiumTableCell isHeader sx={{ color: accentColor, minWidth: 150 }}>Time OUT</PremiumTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((record, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:nth-of-type(even)': { bgcolor: alpha(primaryColor, 0.3) },
                          '&:hover': { bgcolor: alpha(accentColor, 0.05) },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <PremiumTableCell>{record.personID}</PremiumTableCell>
                        <PremiumTableCell>{record.date}</PremiumTableCell>
                        <PremiumTableCell>{record.Day}</PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.timeIN || ""}
                            onChange={(e) => handleInputChange(index, "timeIN", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.breaktimeIN || ""}
                            onChange={(e) => handleInputChange(index, "breaktimeIN", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.breaktimeOUT || ""}
                            onChange={(e) => handleInputChange(index, "breaktimeOUT", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                        <PremiumTableCell>
                          <ModernTextField
                            value={record.timeOUT || ""}
                            onChange={(e) => handleInputChange(index, "timeOUT", e.target.value)}
                            size="small"
                            sx={{
                              width: '140px',
                            }}
                          />
                        </PremiumTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </PremiumTableContainer>
            </GlassCard>
          </Fade>
        )}

        {/* Save Button */}
        {records.length > 0 && (
          <Fade in timeout={900}>
            <GlassCard>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(primaryColor, 0.8), color: accentColor }}>
                      <SaveAs />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ color: accentDark }}>
                        Apply all modifications to the attendance records
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ 
                  bgcolor: alpha(primaryColor, 0.5), 
                  pb: 2,
                  borderBottom: '1px solid rgba(109,35,35,0.1)'
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <ProfessionalButton
                  variant="contained"
                  fullWidth
                  startIcon={<SaveAs />}
                  onClick={saveAll}
                  disabled={loading}
                  sx={{
                    py: 2,
                    fontSize: '1rem',
                    ...saveButtonStyles
                  }}
                >
                  Save All Changes
                </ProfessionalButton>
              </CardContent>
            </GlassCard>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default AttendanceSearch;