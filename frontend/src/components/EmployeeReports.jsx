import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { 
  Description as FileText, 
  Refresh as RefreshIcon, 
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import API_BASE_URL from '../apiConfig';
import axios from 'axios';
import { useSystemSettings } from '../contexts/SystemSettingsContext';

// Professional color scheme for reports - matching Reports.jsx
const reportColors = {
  primary: '#6d2323',      // deep maroon
  primaryLight: '#8a2e2e',
  primaryDark: '#4a1818',
  secondary: '#f5f5dc',   // cream
  secondaryLight: '#ffffff',
  secondaryDark: '#e6e6c7',
  accent: '#333333',       // dark gray/black
  accentLight: '#555555',
  accentDark: '#000000',
  textPrimary: '#000000',
  textSecondary: '#555555',
  textLight: '#ffffff',
  neutralBg: '#f9f9f9',
  surface: '#ffffff',
  border: '#e0e0e0',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  background: '#ffffff',   // White
  gradientPrimary: 'linear-gradient(135deg, #6d2323 0%, #8a2e2e 100%)',
  gradientSecondary: 'linear-gradient(135deg, #f5f5dc 0%, #ffffff 100%)',
  gradientAccent: 'linear-gradient(135deg, #333333 0%, #555555 100%)',
  gradientSuccess: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
  gradientWarning: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
  gradientError: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
  gradientInfo: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'
};

// Shadow styles - matching Reports.jsx
const shadowSoft = '0 4px 20px rgba(0, 0, 0, 0.08)';
const shadowMedium = '0 8px 30px rgba(0, 0, 0, 0.12)';
const shadowDeep = '0 16px 40px rgba(0, 0, 0, 0.16)';
const shadowColored = '0 8px 30px rgba(109, 35, 35, 0.2)';
const shadowCard = '0 6px 18px rgba(0, 0, 0, 0.1)';

const EmployeeReports = () => {
  const settings = useSystemSettings();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [employeeNumber, setEmployeeNumber] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [reportsGenerated, setReportsGenerated] = useState({
    attendance: false,
    performance: false,
    payroll: false,
  });

  // Personal data states
  const [attendanceData, setAttendanceData] = useState(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get employee number from token
  const getEmployeeNumber = () => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.employeeNumber || decoded.username;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Get current month and year
  const getCurrentPeriod = () => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  };

  // Check which reports exist
  const checkReports = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const empNum = getEmployeeNumber();
      if (!empNum) {
        setLoading(false);
        return;
      }
      setEmployeeNumber(empNum);

      const period = getCurrentPeriod();
      const reportTypes = ['attendance', 'performance', 'payroll'];
      const generated = {};

      for (const reportType of reportTypes) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/reports/employee/check?report_type=${reportType}&month=${period.month}&year=${period.year}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          generated[reportType] = response.data.exists || false;
        } catch (err) {
          console.error(`Error checking ${reportType} report:`, err);
          generated[reportType] = false;
        }
      }

      setReportsGenerated(generated);
    } catch (error) {
      console.error('Error checking reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee name
  const fetchEmployeeName = async () => {
    try {
      const token = getAuthToken();
      if (!token || !employeeNumber) return;

      const response = await axios.get(
        `${API_BASE_URL}/personalinfo/person_table`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const employee = Array.isArray(response.data)
        ? response.data.find((p) => String(p.agencyEmployeeNum) === String(employeeNumber))
        : null;

      if (employee) {
        const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''} ${employee.nameExtension || ''}`.trim();
        setEmployeeName(fullName);
      }
    } catch (error) {
      console.error('Error fetching employee name:', error);
    }
  };

  // Fetch personal attendance
  const fetchPersonalAttendance = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/employee/attendance?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setAttendanceData(response.data.data);
        setWeeklyAttendance(response.data.data.weekly || []);
      }
    } catch (error) {
      console.error('Error fetching personal attendance:', error);
    }
  };

  // Fetch performance data
  const fetchPerformanceData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/employee/performance?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setPerformanceData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  // Fetch payroll history
  const fetchPayrollHistory = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/employee/payroll-history?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setPayrollHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payroll history:', error);
    }
  };

  useEffect(() => {
    checkReports();
  }, []);

  useEffect(() => {
    if (employeeNumber) {
      fetchEmployeeName();
    }
  }, [employeeNumber]);

  useEffect(() => {
    if (!loading && employeeNumber) {
      if (reportsGenerated.attendance) {
        fetchPersonalAttendance();
      }
      if (reportsGenerated.performance) {
        fetchPerformanceData();
      }
      if (reportsGenerated.payroll) {
        fetchPayrollHistory();
      }
    }
  }, [loading, reportsGenerated, employeeNumber]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle report generation
  const handleGenerateReport = async (reportType) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setToast({
          message: 'Authentication required',
          type: 'error',
        });
        return;
      }

      setToast({
        message: `Generating ${reportType} report...`,
        type: 'info',
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/reports/employee/generate`,
        { report_type: reportType },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setToast({
          message: `${reportType} report generated successfully!`,
          type: 'success',
        });

        setReportsGenerated((prev) => ({
          ...prev,
          [reportType]: true,
        }));

        // Refresh relevant data
        if (reportType === 'attendance') {
          fetchPersonalAttendance();
        } else if (reportType === 'performance') {
          fetchPerformanceData();
        } else if (reportType === 'payroll') {
          fetchPayrollHistory();
        }
      } else {
        setToast({
          message: response.data.message || `Failed to generate ${reportType} report`,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setToast({
        message: `Error generating ${reportType} report: ${error.response?.data?.error || error.message}`,
        type: 'error',
      });
    }
  };

  // Reset report
  const handleResetReport = async (reportType) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setToast({
          message: 'Authentication required',
          type: 'error',
        });
        return;
      }

      const period = getCurrentPeriod();
      const response = await axios.post(
        `${API_BASE_URL}/api/reports/reset`,
        { report_type: `employee_${reportType}`, month: period.month, year: period.year },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setToast({
          message: `${reportType} report reset successfully!`,
          type: 'success',
        });

        setReportsGenerated((prev) => ({
          ...prev,
          [reportType]: false,
        }));

        // Clear relevant data
        if (reportType === 'attendance') {
          setAttendanceData(null);
          setWeeklyAttendance([]);
        } else if (reportType === 'performance') {
          setPerformanceData(null);
        } else if (reportType === 'payroll') {
          setPayrollHistory([]);
        }
      }
    } catch (error) {
      console.error('Error resetting report:', error);
      setToast({
        message: `Error resetting ${reportType} report: ${error.response?.data?.error || error.message}`,
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const period = getCurrentPeriod();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <Box
      sx={{
        padding: '20px',
        minHeight: '100vh',
        paddingTop: '5px',
      }}
    >
      <Box
        sx={{
          marginBottom: '30px',
          padding: '30px',
          borderRadius: '12px',
          border: `1px solid #6d2323`,
          boxShadow: shadowColored,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                margin: '0 0 5px 0',
                color: '#6d2323',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              My Performance Reports
            </Typography>
            <Typography
              variant="body1"
              sx={{ margin: 0, color: '#6d2323', fontSize: '16px' }}
            >
              {employeeName || `Employee #${employeeNumber}`} - {monthNames[period.month - 1]} {period.year}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Report Generation Section */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: reportColors.textPrimary,
          mb: 3,
          fontSize: { xs: '20px', sm: '24px' },
        }}
      >
        Generate Personal Reports
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { 
            type: 'attendance', 
            label: 'Attendance Report', 
            description: 'View your personal attendance records and trends',
            icon: <AccessTimeIcon />
          },
          { 
            type: 'performance', 
            label: 'Performance Report', 
            description: 'Review your performance metrics and statistics',
            icon: <TrendingUpIcon />
          },
          { 
            type: 'payroll', 
            label: 'Payroll History', 
            description: 'View your payroll records and earnings history',
            icon: <AccountBalanceIcon />
          },
        ].map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.type}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: reportColors.background,
                boxShadow: shadowCard,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${reportColors.border}`,
                '&:hover': {
                  boxShadow: shadowMedium,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: reportColors.primary }}>{report.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: reportColors.textPrimary,
                      fontSize: '18px',
                    }}
                  >
                    {report.label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: reportColors.textSecondary,
                    mb: 2,
                    flexGrow: 1,
                    fontSize: '14px',
                  }}
                >
                  {report.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleGenerateReport(report.type)}
                  disabled={reportsGenerated[report.type]}
                  sx={{
                    backgroundColor: reportsGenerated[report.type]
                      ? reportColors.textSecondary
                      : reportColors.primary,
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: reportsGenerated[report.type]
                        ? reportColors.textSecondary
                        : reportColors.primaryLight,
                    },
                    '&:disabled': {
                      backgroundColor: reportColors.textSecondary,
                      color: 'white',
                    },
                  }}
                  startIcon={<FileText sx={{ fontSize: 18 }} />}
                >
                  {reportsGenerated[report.type] ? 'Report Generated' : 'Generate Report'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Reports Display Section */}
      {(reportsGenerated.attendance || reportsGenerated.performance || reportsGenerated.payroll) && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: reportColors.textPrimary,
                fontSize: { xs: '20px', sm: '24px' },
              }}
            >
              My Reports & Analytics
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                const activeReports = Object.keys(reportsGenerated).filter(key => reportsGenerated[key]);
                if (activeReports.length > 0) {
                  activeReports.forEach(reportType => handleResetReport(reportType));
                }
              }}
              sx={{
                borderColor: reportColors.primary,
                color: reportColors.primary,
                textTransform: 'none',
                '&:hover': {
                  borderColor: reportColors.primaryLight,
                  backgroundColor: `${reportColors.primary}10`,
                },
              }}
            >
              Reset All Reports
            </Button>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: reportColors.textSecondary,
                '&.Mui-selected': {
                  color: reportColors.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: reportColors.primary,
              },
            }}
          >
            <Tab
              label="Attendance"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            />
            <Tab
              label="Performance"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            />
            <Tab
              label="Payroll"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            />
          </Tabs>

          {tabValue === 0 && reportsGenerated.attendance && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    backgroundColor: reportColors.background,
                    boxShadow: shadowCard,
                    borderRadius: '8px',
                    border: `1px solid ${reportColors.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          fontSize: '16px',
                        }}
                      >
                        Weekly Attendance
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: reportColors.textSecondary,
                          fontSize: '12px',
                        }}
                      >
                        Your attendance by week
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleResetReport('attendance')}
                      sx={{
                        color: reportColors.textSecondary,
                        textTransform: 'none',
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: `${reportColors.primary}10`,
                        },
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={250}>
                      {weeklyAttendance.length > 0 ? (
                        <BarChart data={weeklyAttendance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="week" stroke={reportColors.textSecondary} fontSize={12} />
                          <YAxis stroke={reportColors.textSecondary} fontSize={12} />
                          <RechartTooltip />
                          <Bar dataKey="present" fill={reportColors.primary} name="Present" />
                          <Bar dataKey="expected" fill={reportColors.textSecondary} name="Expected" />
                        </BarChart>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No data available
                          </Typography>
                        </Box>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    backgroundColor: reportColors.background,
                    boxShadow: shadowCard,
                    borderRadius: '8px',
                    border: `1px solid ${reportColors.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          fontSize: '16px',
                        }}
                      >
                        Attendance Summary
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: reportColors.textSecondary,
                          fontSize: '12px',
                        }}
                      >
                        Monthly attendance overview
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleResetReport('attendance')}
                      sx={{
                        color: reportColors.textSecondary,
                        textTransform: 'none',
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: `${reportColors.primary}10`,
                        },
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {attendanceData?.summary ? (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${reportColors.success}10`, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: reportColors.success, fontWeight: 700 }}>
                                {attendanceData.summary.present || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                                Present Days
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${reportColors.error}10`, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: reportColors.error, fontWeight: 700 }}>
                                {attendanceData.summary.absent || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                                Absent Days
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Box sx={{ textAlign: 'center', p: 3, bgcolor: `${reportColors.primary}10`, borderRadius: 2 }}>
                          <Typography variant="h3" sx={{ color: reportColors.primary, fontWeight: 700, mb: 1 }}>
                            {attendanceData.summary.attendanceRate || 0}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: reportColors.textSecondary }}>
                            Attendance Rate
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && reportsGenerated.performance && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {performanceData && (
                <>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        backgroundColor: reportColors.background,
                        boxShadow: shadowCard,
                        borderRadius: '8px',
                        border: `1px solid ${reportColors.border}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: reportColors.textPrimary,
                              fontSize: '16px',
                            }}
                          >
                            Performance Overview
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: reportColors.textSecondary,
                              fontSize: '12px',
                            }}
                          >
                            Your performance metrics
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleResetReport('performance')}
                          sx={{
                            color: reportColors.textSecondary,
                            textTransform: 'none',
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: `${reportColors.primary}10`,
                            },
                          }}
                        >
                          Reset
                        </Button>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${reportColors.primary}10`, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: reportColors.primary, fontWeight: 700 }}>
                                {performanceData.attendance?.present || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                                Days Present
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${reportColors.warning}10`, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: reportColors.warning, fontWeight: 700 }}>
                                {performanceData.leave?.total || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                                Leave Requests
                              </Typography>
                            </Box>
                          </Grid>
                          {performanceData.employeeInfo && (
                            <>
                              <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: `${reportColors.secondary}10`, borderRadius: 2 }}>
                                  <Typography variant="body2" sx={{ color: reportColors.textSecondary, mb: 0.5 }}>
                                    Department
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: reportColors.textPrimary, fontWeight: 600 }}>
                                    {performanceData.employeeInfo.departmentName || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: `${reportColors.success}10`, borderRadius: 2 }}>
                                  <Typography variant="body2" sx={{ color: reportColors.textSecondary, mb: 0.5 }}>
                                    Position
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: reportColors.textPrimary, fontWeight: 600 }}>
                                    {performanceData.employeeInfo.position || 'N/A'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        backgroundColor: reportColors.background,
                        boxShadow: shadowCard,
                        borderRadius: '8px',
                        border: `1px solid ${reportColors.border}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: reportColors.textPrimary,
                              fontSize: '16px',
                            }}
                          >
                            Leave Status
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: reportColors.textSecondary,
                              fontSize: '12px',
                            }}
                          >
                            Your leave request status
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleResetReport('performance')}
                          sx={{
                            color: reportColors.textSecondary,
                            textTransform: 'none',
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: `${reportColors.primary}10`,
                            },
                          }}
                        >
                          Reset
                        </Button>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <ResponsiveContainer width="100%" height={250}>
                          {performanceData.leave && (
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Approved', value: performanceData.leave.approved || 0, fill: reportColors.success },
                                  { name: 'Pending', value: performanceData.leave.pending || 0, fill: reportColors.warning },
                                  { name: 'Rejected', value: performanceData.leave.rejected || 0, fill: reportColors.error },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {[
                                  { fill: reportColors.success },
                                  { fill: reportColors.warning },
                                  { fill: reportColors.error },
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <RechartTooltip />
                              <Legend />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          )}

          {tabValue === 2 && reportsGenerated.payroll && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    backgroundColor: reportColors.background,
                    boxShadow: shadowCard,
                    borderRadius: '8px',
                    border: `1px solid ${reportColors.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          fontSize: '16px',
                        }}
                      >
                        Payroll History
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: reportColors.textSecondary,
                          fontSize: '12px',
                        }}
                      >
                        Your earnings history for the past 12 periods
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleResetReport('payroll')}
                      sx={{
                        color: reportColors.textSecondary,
                        textTransform: 'none',
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: `${reportColors.primary}10`,
                        },
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height={250}>
                      {payrollHistory.length > 0 ? (
                        <LineChart data={payrollHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="startDate" 
                            stroke={reportColors.textSecondary} 
                            fontSize={12}
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                          />
                          <YAxis stroke={reportColors.textSecondary} fontSize={12} />
                          <RechartTooltip
                            formatter={(value) => [`₱${value.toLocaleString()}`, 'Net Salary']}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="netSalary"
                            stroke={reportColors.primary}
                            strokeWidth={2}
                            dot={{ fill: reportColors.primary, r: 4 }}
                            name="Net Salary"
                          />
                        </LineChart>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No payroll data available
                          </Typography>
                        </Box>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    backgroundColor: reportColors.background,
                    boxShadow: shadowCard,
                    borderRadius: '8px',
                    border: `1px solid ${reportColors.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          fontSize: '16px',
                        }}
                      >
                        Payroll Summary
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: reportColors.textSecondary,
                          fontSize: '12px',
                        }}
                      >
                        Your payroll statistics and insights
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleResetReport('payroll')}
                      sx={{
                        color: reportColors.textSecondary,
                        textTransform: 'none',
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: `${reportColors.primary}10`,
                        },
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {payrollHistory.length > 0 ? (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${reportColors.primary}10`, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: reportColors.primary, fontWeight: 700 }}>
                                {payrollHistory.length}
                              </Typography>
                              <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                                Total Periods
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: `${reportColors.success}10`, borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ color: reportColors.success, fontWeight: 700 }}>
                                ₱{payrollHistory[payrollHistory.length - 1]?.netSalary?.toLocaleString() || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                                Latest Salary
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Box sx={{ textAlign: 'center', p: 3, bgcolor: `${reportColors.secondary}10`, borderRadius: 2 }}>
                          <Typography variant="h3" sx={{ color: reportColors.secondary, fontWeight: 700, mb: 1 }}>
                            ₱{payrollHistory.reduce((sum, item) => sum + (item.netSalary || 0), 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: reportColors.textSecondary }}>
                            Total Earnings
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          No payroll data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor:
              toast.type === 'success'
                ? reportColors.success
                : toast.type === 'error'
                ? reportColors.error
                : toast.type === 'info'
                ? reportColors.info
                : reportColors.primary,
            color: 'white',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: shadowMedium,
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

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default EmployeeReports;