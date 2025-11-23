import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { Description as FileText, Error as AlertCircle, Refresh as RefreshIcon, TrendingUp as TrendingUpIcon, People as PeopleIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import API_BASE_URL from '../apiConfig';
import axios from 'axios';
import { useSystemSettings } from '../contexts/SystemSettingsContext';

// Professional color scheme for reports
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

// Shadow styles
const shadowSoft = '0 4px 20px rgba(0, 0, 0, 0.08)';
const shadowMedium = '0 8px 30px rgba(0, 0, 0, 0.12)';
const shadowDeep = '0 16px 40px rgba(0, 0, 0, 0.16)';
const shadowColored = '0 8px 30px rgba(109, 35, 35, 0.2)';
const shadowCard = '0 6px 18px rgba(0, 0, 0, 0.1)';

const Reports = () => {
  const settings = useSystemSettings();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [reportsGenerated, setReportsGenerated] = useState({
    dashboard: false,
    attendance: false,
    payroll: false,
    employee: false,
    leave: false,
  });

  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [departmentAttendanceData, setDepartmentAttendanceData] = useState([]);
  const [payrollStatusData, setPayrollStatusData] = useState([
    { status: 'Processing', value: 0, fill: reportColors.warning },
    { status: 'Processed', value: 0, fill: reportColors.primary },
    { status: 'Released', value: 0, fill: reportColors.success },
  ]);
  const [monthlyAttendanceTrend, setMonthlyAttendanceTrend] = useState([]);
  const [payrollTrendData, setPayrollTrendData] = useState([]);
  const [attendanceChartData, setAttendanceChartData] = useState([
    { name: 'Present', value: 0, fill: reportColors.primary },
    { name: 'Absent', value: 0, fill: reportColors.error },
    { name: 'Late', value: 0, fill: reportColors.warning },
  ]);
  const [departmentEmployeeData, setDepartmentEmployeeData] = useState([]);
  const [payrollBudgetData, setPayrollBudgetData] = useState([]);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [attendancePrediction, setAttendancePrediction] = useState(null);
  const [payrollForecast, setPayrollForecast] = useState(null);
  const [departmentEfficiency, setDepartmentEfficiency] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get user role from token
  const getUserRole = () => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.role;
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

      const period = getCurrentPeriod();
      const reportTypes = ['dashboard', 'attendance', 'payroll', 'employee', 'leave'];
      const generated = {};

      for (const reportType of reportTypes) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/reports/check?report_type=${reportType}&month=${period.month}&year=${period.year}`,
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

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/dashboard/stats?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.stats) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch weekly attendance
  const fetchWeeklyAttendance = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/attendance-overview?month=${period.month}&year=${period.year}&days=7`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setWeeklyAttendanceData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching weekly attendance:', error);
    }
  };

  // Fetch department distribution
  const fetchDepartmentDistribution = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/department-distribution?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        const transformed = response.data.data.map((item) => ({
          department: item.department,
          present: item.employeeCount,
          absent: 0,
          rate: item.employeeCount > 0 ? 100 : 0,
        }));
        setDepartmentAttendanceData(transformed);
      }
    } catch (error) {
      console.error('Error fetching department distribution:', error);
    }
  };

  // Fetch payroll summary
  const fetchPayrollSummary = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/payroll-summary?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        const summary = response.data.data;
        setPayrollStatusData([
          {
            status: 'Processing',
            value: summary.processing || 0,
            fill: reportColors.warning,
          },
          {
            status: 'Processed',
            value: summary.processed || 0,
            fill: reportColors.primary,
          },
          {
            status: 'Released',
            value: summary.released || 0,
            fill: reportColors.success,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
    }
  };

  // Fetch department employees
  const fetchDepartmentEmployees = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/department-employees?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setDepartmentEmployeeData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching department employees:', error);
    }
  };

  // Fetch payroll budget
  const fetchPayrollBudget = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/payroll-budget?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setPayrollBudgetData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payroll budget:', error);
    }
  };

  // Fetch employee stats
  const fetchEmployeeStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/employee-stats?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setEmployeeStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employee stats:', error);
    }
  };

  // Calculate Attendance Prediction Algorithm
  const calculateAttendancePrediction = () => {
    if (monthlyAttendanceTrend.length < 2) {
      setToast({
        message: 'Insufficient data for prediction. Generate attendance report first.',
        type: 'error',
      });
      return;
    }

    // Simple linear regression for prediction
    const data = monthlyAttendanceTrend.map((item, index) => ({
      x: index,
      y: parseFloat(item.attendance) || 0,
    }));

    const n = data.length;
    const sumX = data.reduce((sum, item) => sum + item.x, 0);
    const sumY = data.reduce((sum, item) => sum + item.y, 0);
    const sumXY = data.reduce((sum, item) => sum + item.x * item.y, 0);
    const sumX2 = data.reduce((sum, item) => sum + item.x * item.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextWeek = n;
    const predicted = slope * nextWeek + intercept;
    const predictedAttendance = Math.max(0, Math.min(100, Math.round(predicted * 10) / 10));

    setAttendancePrediction({
      predictedAttendance,
      dataPoints: n,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
    });

    setToast({
      message: `Attendance prediction calculated: ${predictedAttendance}% for next week`,
      type: 'success',
    });
  };

  // Calculate Payroll Forecast Algorithm
  const calculatePayrollForecast = () => {
    if (payrollBudgetData.length === 0) {
      setToast({
        message: 'Insufficient data for forecast. Generate payroll report first.',
        type: 'error',
      });
      return;
    }

    const totalCurrent = payrollBudgetData.reduce((sum, dept) => sum + (dept.totalBudget || 0), 0);
    const avgChange = payrollBudgetData.reduce((sum, dept) => {
      if (dept.changePercent !== undefined && !isNaN(dept.changePercent)) {
        return sum + dept.changePercent;
      }
      return sum;
    }, 0) / payrollBudgetData.length;

    const forecastedAmount = totalCurrent * (1 + (avgChange / 100));
    const changePercent = avgChange;

    setPayrollForecast({
      forecastedAmount: Math.round(forecastedAmount),
      changePercent: Math.round(changePercent * 100) / 100,
      currentAmount: totalCurrent,
    });

    setToast({
      message: `Payroll forecast calculated: ₱${forecastedAmount.toLocaleString()} for next month`,
      type: 'success',
    });
  };

  // Calculate Department Efficiency Algorithm
  const calculateDepartmentEfficiency = () => {
    if (departmentAttendanceData.length === 0 || payrollBudgetData.length === 0) {
      setToast({
        message: 'Insufficient data for analysis. Generate attendance and payroll reports first.',
        type: 'error',
      });
      return;
    }

    // Combine attendance rate and budget efficiency
    const efficiencyData = departmentAttendanceData.map(attDept => {
      const budgetDept = payrollBudgetData.find(b => 
        b.departmentName === attDept.department || b.department === attDept.department
      );
      
      const attendanceRate = attDept.rate || 0;
      const budgetPerEmployee = budgetDept 
        ? (budgetDept.totalBudget / (budgetDept.employeeCount || 1))
        : 0;
      
      // Efficiency score: weighted combination of attendance and budget efficiency
      // Higher attendance and lower cost per employee = higher efficiency
      const avgBudgetPerEmployee = payrollBudgetData.reduce((sum, d) => 
        sum + (d.totalBudget / (d.employeeCount || 1)), 0
      ) / payrollBudgetData.length;
      
      const budgetEfficiency = avgBudgetPerEmployee > 0 
        ? Math.max(0, 100 - ((budgetPerEmployee / avgBudgetPerEmployee) * 50))
        : 50;
      
      const efficiencyScore = (attendanceRate * 0.6) + (budgetEfficiency * 0.4);

      return {
        department: attDept.department,
        efficiencyScore: Math.round(efficiencyScore * 10) / 10,
        attendanceRate,
        budgetEfficiency: Math.round(budgetEfficiency * 10) / 10,
      };
    });

    const topDepartment = efficiencyData.reduce((top, current) => 
      current.efficiencyScore > top.efficiencyScore ? current : top
    );

    setDepartmentEfficiency({
      topDepartment: topDepartment.department,
      efficiencyScore: topDepartment.efficiencyScore,
      allDepartments: efficiencyData.sort((a, b) => b.efficiencyScore - a.efficiencyScore),
    });

    setToast({
      message: `Efficiency analysis complete. Top performer: ${topDepartment.department}`,
      type: 'success',
    });
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
        { report_type: reportType, month: period.month, year: period.year },
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

        // Update reports generated state
        setReportsGenerated((prev) => ({
          ...prev,
          [reportType]: false,
        }));

        // Clear relevant data
        if (reportType === 'dashboard') {
          setDashboardStats(null);
        } else if (reportType === 'attendance') {
          setWeeklyAttendanceData([]);
          setDepartmentAttendanceData([]);
          setMonthlyAttendanceTrend([]);
        } else if (reportType === 'payroll') {
          setPayrollStatusData([
            { status: 'Processing', value: 0, fill: reportColors.warning },
            { status: 'Processed', value: 0, fill: reportColors.primary },
            { status: 'Released', value: 0, fill: reportColors.success },
          ]);
          setPayrollBudgetData([]);
        } else if (reportType === 'employee') {
          setEmployeeStats(null);
          setDepartmentEmployeeData([]);
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

  // Fetch monthly attendance trend
  const fetchMonthlyAttendanceTrend = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const period = getCurrentPeriod();
      const response = await axios.get(
        `${API_BASE_URL}/api/reports/monthly-attendance?month=${period.month}&year=${period.year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setMonthlyAttendanceTrend(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
    }
  };

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    checkReports();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (reportsGenerated.dashboard) {
        fetchDashboardStats();
      }
      if (reportsGenerated.attendance) {
        fetchWeeklyAttendance();
        fetchDepartmentDistribution();
        fetchMonthlyAttendanceTrend();
      }
      if (reportsGenerated.payroll) {
        fetchPayrollSummary();
        fetchPayrollBudget();
      }
      if (reportsGenerated.employee) {
        fetchEmployeeStats();
        fetchDepartmentEmployees();
      }
    }
  }, [loading, reportsGenerated]);

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
        `${API_BASE_URL}/api/reports/generate`,
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

        // Update reports generated state
        setReportsGenerated((prev) => ({
          ...prev,
          [reportType]: true,
        }));

        // Refresh relevant data
        if (reportType === 'dashboard') {
          fetchDashboardStats();
        } else if (reportType === 'attendance') {
          fetchWeeklyAttendance();
          fetchDepartmentDistribution();
          fetchMonthlyAttendanceTrend();
        } else if (reportType === 'payroll') {
          fetchPayrollSummary();
          fetchPayrollBudget();
        } else if (reportType === 'employee') {
          fetchEmployeeStats();
          fetchDepartmentEmployees();
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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <Box
      sx={{
        padding: '20px',
        minHeight: '100vh',
        paddingTop: '100px',
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
              System Reports
            </Typography>
            <Typography
              variant="body1"
              sx={{ margin: 0, color: '#6d2323', fontSize: '16px' }}
            >
              Comprehensive analytics and visualizations - {monthNames[period.month - 1]} {period.year}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Charts Section - Only show if reports are generated */}
      {(reportsGenerated.dashboard ||
        reportsGenerated.attendance ||
        reportsGenerated.payroll) && (
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
              Analytics & Statistics
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
                  borderColor: reportColors.secondary,
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
              label="Overview"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            />
            <Tab
              label="Analytics"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            />
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {reportsGenerated.attendance && (
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
                          {weeklyAttendanceData.length > 0 ? (
                            <BarChart data={weeklyAttendanceData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="day" stroke={reportColors.textSecondary} fontSize={12} />
                              <YAxis stroke={reportColors.textSecondary} fontSize={12} />
                              <RechartTooltip />
                              <Bar dataKey="present" fill={reportColors.primary} />
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
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: reportColors.textPrimary,
                            fontSize: '16px',
                          }}
                        >
                          Department Attendance Rate
                        </Typography>
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
                          {departmentAttendanceData.length > 0 ? (
                            <BarChart data={departmentAttendanceData} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis type="number" stroke={reportColors.textSecondary} fontSize={12} />
                              <YAxis
                                dataKey="department"
                                type="category"
                                stroke={reportColors.textSecondary}
                                fontSize={12}
                                width={100}
                              />
                              <RechartTooltip />
                              <Bar dataKey="rate" fill={reportColors.secondary} />
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
                </>
              )}

              {reportsGenerated.payroll && (
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
                            Payroll Status
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: reportColors.textSecondary,
                              fontSize: '12px',
                            }}
                          >
                            Processing, Processed, and Released records
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
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={payrollStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {payrollStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <RechartTooltip 
                              formatter={(value, name, props) => [
                                `${value} records`,
                                props.payload.status
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {payrollStatusData.map((entry, index) => {
                            const statusDescriptions = {
                              'Processing': 'Currently being processed',
                              'Processed': 'Ready for release',
                              'Released': 'Already distributed'
                            };
                            return (
                              <Box 
                                key={index}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  p: 1.5,
                                  borderRadius: 1,
                                  bgcolor: `${entry.fill}10`,
                                  border: `1px solid ${entry.fill}30`
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box 
                                    sx={{ 
                                      width: 14, 
                                      height: 14, 
                                      borderRadius: '50%', 
                                      bgcolor: entry.fill,
                                      boxShadow: `0 2px 4px ${entry.fill}50`
                                    }} 
                                  />
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: reportColors.textPrimary, lineHeight: 1.2 }}>
                                      {entry.status}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: reportColors.textSecondary, fontSize: '11px' }}>
                                      {statusDescriptions[entry.status] || ''}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: entry.fill, fontSize: '18px' }}>
                                  {entry.value}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
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
                            Payroll Budget per Department
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: reportColors.textSecondary,
                              fontSize: '12px',
                            }}
                          >
                            Monthly budget allocation and changes
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
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height={250}>
                          {payrollBudgetData.length > 0 ? (
                            <BarChart data={payrollBudgetData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis type="number" stroke={reportColors.textSecondary} fontSize={12} />
                              <YAxis
                                dataKey="departmentName"
                                type="category"
                                stroke={reportColors.textSecondary}
                                fontSize={12}
                                width={120}
                              />
                              <RechartTooltip
                                formatter={(value, name) => {
                                  if (name === 'totalBudget') return [`₱${value.toLocaleString()}`, 'Total Budget'];
                                  if (name === 'change') return [`₱${value.toLocaleString()}`, 'Change'];
                                  return [value, name];
                                }}
                              />
                              <Legend />
                              <Bar dataKey="totalBudget" fill={reportColors.primary} name="Total Budget" />
                              <Bar dataKey="previousBudget" fill={reportColors.textSecondary} name="Previous Month" />
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
                        {payrollBudgetData.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ color: reportColors.textSecondary, display: 'block', mb: 1 }}>
                              Top Department: {payrollBudgetData[0]?.departmentName || 'N/A'}
                            </Typography>
                            {payrollBudgetData[0]?.changePercent !== undefined && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: payrollBudgetData[0].changePercent >= 0 ? reportColors.success : reportColors.error,
                                  fontWeight: 600,
                                }}
                              >
                                Change: {payrollBudgetData[0].changePercent >= 0 ? '+' : ''}
                                {payrollBudgetData[0].changePercent.toFixed(2)}%
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

{/* Employee statistics hidden from admin - only visible to employees in separate component */}

              {reportsGenerated.dashboard && dashboardStats && (
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      backgroundColor: reportColors.background,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${reportColors.border}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          mb: 2,
                          fontSize: '16px',
                        }}
                      >
                        Today's Attendance Summary
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexGrow: 1,
                          minHeight: 250,
                        }}
                      >
                        <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                          <svg width="140" height="140" viewBox="0 0 140 140">
                            <circle
                              cx="70"
                              cy="70"
                              r="60"
                              fill="none"
                              stroke="#f0f0f0"
                              strokeWidth="12"
                            />
                            <circle
                              cx="70"
                              cy="70"
                              r="60"
                              fill="none"
                              stroke={reportColors.primary}
                              strokeWidth="12"
                              strokeDasharray={`${2 * Math.PI * 60 * 0.877} ${2 * Math.PI * 60}`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90 70 70)"
                            />
                          </svg>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 700,
                                color: reportColors.textPrimary,
                                lineHeight: 1,
                              }}
                            >
                              87.7
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: reportColors.textSecondary }}
                            >
                              % Present
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {reportsGenerated.attendance && (
                <Grid item xs={12}>
                  <Card
                    sx={{
                      backgroundColor: reportColors.background,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${reportColors.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          fontSize: '16px',
                        }}
                      >
                        Monthly Attendance Trend
                      </Typography>
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
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        {monthlyAttendanceTrend.length > 0 ? (
                          <LineChart data={monthlyAttendanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="week" stroke={reportColors.textSecondary} fontSize={12} />
                            <YAxis stroke={reportColors.textSecondary} fontSize={12} />
                            <RechartTooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="attendance"
                              stroke={reportColors.primary}
                              strokeWidth={2}
                              dot={{ fill: reportColors.primary, r: 4 }}
                              name="Attendance %"
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
                              No data available
                            </Typography>
                          </Box>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {/* Algorithm Recommendations Section - Implemented */}
          {(reportsGenerated.dashboard || reportsGenerated.attendance || reportsGenerated.payroll) && (
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: reportColors.textPrimary,
                  mb: 3,
                  fontSize: { xs: '20px', sm: '24px' },
                }}
              >
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Algorithm Analysis & Predictions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      backgroundColor: reportColors.background,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${reportColors.border}`,
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: shadowMedium,
                      },
                    }}
                    onClick={() => calculateAttendancePrediction()}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          mb: 1,
                          fontSize: '16px',
                        }}
                      >
                        Attendance Prediction
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: reportColors.textSecondary, mb: 2 }}
                      >
                        Predicts next week's attendance based on historical patterns and trends.
                      </Typography>
                      {attendancePrediction && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: `${reportColors.primary}10`, borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: reportColors.textPrimary, fontWeight: 600, mb: 1 }}>
                            Next Week Prediction:
                          </Typography>
                          <Typography variant="h6" sx={{ color: reportColors.primary }}>
                            {attendancePrediction.predictedAttendance}% expected attendance
                          </Typography>
                          <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                            Based on {attendancePrediction.dataPoints} data points
                          </Typography>
                        </Box>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2, borderColor: reportColors.primary, color: reportColors.primary }}
                      >
                        Calculate Prediction
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      backgroundColor: reportColors.background,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${reportColors.border}`,
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: shadowMedium,
                      },
                    }}
                    onClick={() => calculatePayrollForecast()}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          mb: 1,
                          fontSize: '16px',
                        }}
                      >
                        Payroll Forecasting
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: reportColors.textSecondary, mb: 2 }}
                      >
                        Forecasts next month's payroll costs based on current trends.
                      </Typography>
                      {payrollForecast && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: `${reportColors.secondary}10`, borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: reportColors.textPrimary, fontWeight: 600, mb: 1 }}>
                            Next Month Forecast:
                          </Typography>
                          <Typography variant="h6" sx={{ color: reportColors.secondary }}>
                            ₱{payrollForecast.forecastedAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                            {payrollForecast.changePercent >= 0 ? '+' : ''}{payrollForecast.changePercent.toFixed(2)}% vs current
                          </Typography>
                        </Box>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2, borderColor: reportColors.secondary, color: reportColors.secondary }}
                      >
                        Calculate Forecast
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      backgroundColor: reportColors.background,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${reportColors.border}`,
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: shadowMedium,
                      },
                    }}
                    onClick={() => calculateDepartmentEfficiency()}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: reportColors.textPrimary,
                          mb: 1,
                          fontSize: '16px',
                        }}
                      >
                        Department Efficiency
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: reportColors.textSecondary, mb: 2 }}
                      >
                        Analyzes department performance and identifies optimization opportunities.
                      </Typography>
                      {departmentEfficiency && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: `${reportColors.success}10`, borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: reportColors.textPrimary, fontWeight: 600, mb: 1 }}>
                            Top Performer:
                          </Typography>
                          <Typography variant="h6" sx={{ color: reportColors.success }}>
                            {departmentEfficiency.topDepartment}
                          </Typography>
                          <Typography variant="caption" sx={{ color: reportColors.textSecondary }}>
                            Efficiency: {departmentEfficiency.efficiencyScore}%
                          </Typography>
                        </Box>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2, borderColor: reportColors.success, color: reportColors.success }}
                      >
                        Analyze Efficiency
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      )}

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
        Report Generation
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { type: 'dashboard', label: 'Dashboard Statistics', description: 'View overall system statistics and metrics' },
          { type: 'attendance', label: 'Attendance Report', description: 'Review attendance trends and department distribution' },
          { type: 'payroll', label: 'Payroll Report', description: 'Check payroll processing status and summaries' },
          { type: 'employee', label: 'Employee Report', description: 'View employee demographics and growth statistics' },
          { type: 'leave', label: 'Leave Report', description: 'Review leave requests and approval statistics' },
        ].map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.type}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: reportColors.background,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${reportColors.border}`,
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: reportColors.textPrimary,
                    mb: 1,
                    fontSize: '18px',
                  }}
                >
                  {report.label}
                </Typography>
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
                        : reportColors.secondary,
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
          <AlertCircle sx={{ fontSize: 20 }} />
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

export default Reports;

