import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
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
import { 
  Description as FileText, 
  Error as AlertCircle, 
  Refresh as RefreshIcon, 
  Download as DownloadIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  BeachAccess as BeachAccessIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import API_BASE_URL from '../apiConfig';
import axios from 'axios';
import { useSystemSettings } from '../contexts/SystemSettingsContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Report color scheme constrained to the official palette
// Palette: #6d2323, #fef9e1, #ffffff, #000000, #a31d1d
const reportColors = {
  // Core brand colors
  primary: '#6d2323',
  primaryLight: '#a31d1d',
  primaryDark: '#000000',

  // Surfaces / backgrounds
  secondary: '#fef9e1',
  secondaryLight: '#ffffff',
  secondaryDark: '#fef9e1',
  neutralBg: '#fef9e1',
  surface: '#ffffff',
  // Main page background (set to pure white as requested)
  background: '#ffffff',
  border: '#6d2323',

  // Accent
  accent: '#a31d1d',
  accentLight: '#6d2323',
  accentDark: '#000000',

  // Text
  textPrimary: '#000000',
  textSecondary: '#6d2323',
  textLight: '#ffffff',

  // Semantic states mapped into palette
  success: '#6d2323',
  warning: '#a31d1d',
  error: '#000000',
  info: '#6d2323',

  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #6d2323 0%, #a31d1d 100%)',
  gradientSecondary: 'linear-gradient(135deg, #ffffff 0%, #fef9e1 100%)',
  gradientAccent: 'linear-gradient(135deg, #000000 0%, #6d2323 100%)',
  gradientSuccess: 'linear-gradient(135deg, #6d2323 0%, #a31d1d 100%)',
  gradientWarning: 'linear-gradient(135deg, #a31d1d 0%, #6d2323 100%)',
  gradientError: 'linear-gradient(135deg, #000000 0%, #6d2323 100%)',
  gradientInfo: 'linear-gradient(135deg, #6d2323 0%, #a31d1d 100%)'
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
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Refs for PDF generation
  const reportContentRef = useRef(null);
  const statsContentRef = useRef(null);

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

  // Download Report as PDF (Stats and Counts Only)
  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      setToast({
        message: 'Generating PDF report...',
        type: 'info',
      });

      // Capture the full analytics + summary area for the PDF
      const element = reportContentRef.current || statsContentRef.current;
      if (!element) {
        throw new Error('Report content not found. Please generate reports first.');
      }

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add header
      const period = getCurrentPeriod();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      
      pdf.setFillColor(109, 35, 35); // Primary color
      pdf.rect(0, 0, pdfWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HRIS System Reports', 10, 15);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${monthNames[period.month - 1]} ${period.year}`, pdfWidth - 10, 15, { align: 'right' });
      
      pdf.setTextColor(0, 0, 0);
      let heightLeft = imgHeight;
      let position = 35; // Start after header

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 35);

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 35;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `HRIS_Report_${monthNames[period.month - 1]}_${period.year}.pdf`;
      
      pdf.save(fileName);

      setToast({
        message: 'PDF report downloaded successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToast({
        message: error.message || 'Error generating PDF report',
        type: 'error',
      });
    } finally {
      setDownloadingPDF(false);
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

  const hasAnyReportGenerated = Object.values(reportsGenerated).some(val => val);

  return (
    <Box
      sx={{
        padding: '20px',
        minHeight: '100vh',
        paddingTop: '5px',
        backgroundColor: reportColors.background,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          marginBottom: '30px',
          padding: '30px',
          borderRadius: '12px',
          border: `1px solid ${reportColors.primary}`,
          boxShadow: shadowColored,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
          {hasAnyReportGenerated && (
            <Button
              variant="contained"
              startIcon={downloadingPDF ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              sx={{
                backgroundColor: reportColors.primary,
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  backgroundColor: reportColors.primaryDark,
                },
                '&:disabled': {
                  backgroundColor: reportColors.textSecondary,
                },
              }}
            >
              {downloadingPDF ? 'Generating PDF...' : 'Download as PDF'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Report Generation Section - Now at the top */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: reportColors.textPrimary,
          mb: 3,
          fontSize: { xs: '20px', sm: '24px' },
        }}
      >
        Generate Reports
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            type: 'dashboard', 
            label: 'Dashboard Statistics', 
            description: 'View overall system statistics and metrics', 
            icon: DashboardIcon,
            color: reportColors.primary,
            bgGradient: reportColors.gradientSecondary
          },
          { 
            type: 'attendance', 
            label: 'Attendance Report', 
            description: 'Review attendance trends and department distribution', 
            icon: EventIcon,
            color: reportColors.primary,
            bgGradient: reportColors.gradientSecondary
          },
          { 
            type: 'payroll', 
            label: 'Payroll Report', 
            description: 'Check payroll processing status and summaries', 
            icon: AccountBalanceIcon,
            color: reportColors.primary,
            bgGradient: reportColors.gradientSecondary
          },
          { 
            type: 'employee', 
            label: 'Employee Report', 
            description: 'View employee demographics and growth statistics', 
            icon: PeopleIcon,
            color: reportColors.primary,
            bgGradient: reportColors.gradientSecondary
          },
          { 
            type: 'leave', 
            label: 'Leave Report', 
            description: 'Review leave requests and approval statistics', 
            icon: BeachAccessIcon,
            color: reportColors.primary,
            bgGradient: reportColors.gradientSecondary
          },
        ].map((report) => {
          const IconComponent = report.icon;
          return (
          <Grid item xs={12} sm={6} md={4} key={report.type}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: reportColors.surface,
                boxShadow: reportsGenerated[report.type] ? shadowColored : shadowCard,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                border: reportsGenerated[report.type] 
                  ? `2px solid ${reportColors.success}`
                  : `1px solid ${reportColors.border}`,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  boxShadow: shadowMedium,
                  transform: 'translateY(-6px)',
                },
                '&::before': reportsGenerated[report.type] ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: reportColors.gradientSuccess,
                } : {},
              }}
            >
              <Box
                sx={{
                  // Soft, light header using the cream + white gradient
                  background: report.bgGradient,
                  p: 3,
                  pb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      background: reportsGenerated[report.type]
                        ? reportColors.gradientSuccess
                        : `linear-gradient(135deg, ${report.color} 0%, ${report.color}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      boxShadow: `0 4px 12px ${report.color}40`,
                    }}
                  >
                    <IconComponent sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: reportColors.textPrimary,
                      fontSize: '18px',
                      flex: 1,
                    }}
                  >
                    {report.label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: reportColors.textSecondary,
                    mb: 3,
                    flexGrow: 1,
                    fontSize: '14px',
                    lineHeight: 1.6,
                  }}
                >
                  {report.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleGenerateReport(report.type)}
                    disabled={reportsGenerated[report.type]}
                    fullWidth
                    sx={{
                      background: reportsGenerated[report.type]
                        ? reportColors.gradientPrimary
                        : reportColors.gradientPrimary,
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: '8px',
                      boxShadow: reportsGenerated[report.type]
                        ? `0 4px 12px ${reportColors.success}40`
                        : `0 4px 12px ${reportColors.primary}40`,
                      '&:hover': {
                        background: reportColors.gradientPrimary,
                        boxShadow: reportsGenerated[report.type]
                          ? `0 6px 16px ${reportColors.success}60`
                          : `0 6px 16px ${reportColors.primary}60`,
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: reportColors.gradientPrimary,
                        color: 'white',
                        opacity: 0.95,
                      },
                    }}
                    startIcon={reportsGenerated[report.type] ? (
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <FileText sx={{ fontSize: 18 }} />
                    )}
                  >
                    {reportsGenerated[report.type] ? 'Generated' : 'Generate Report'}
                  </Button>
                  {reportsGenerated[report.type] && (
                    <Button
                      variant="outlined"
                      onClick={() => handleResetReport(report.type)}
                      sx={{
                        borderColor: reportColors.error,
                        color: reportColors.error,
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 2.5,
                        borderRadius: '8px',
                        '&:hover': {
                          borderColor: reportColors.error,
                          backgroundColor: `${reportColors.error}10`,
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 20 }} />
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Charts Section - Now at the bottom, shown after report generation */}
      {hasAnyReportGenerated && (
        <Box ref={reportContentRef}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: reportColors.surface,
                  border: `1px solid ${reportColors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: shadowCard,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 28, color: reportColors.primary }} />
              </Box>
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
            </Box>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: reportColors.textSecondary,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '15px',
                minHeight: 48,
                '&.Mui-selected': {
                  color: reportColors.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: reportColors.primary,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab 
              icon={<BarChartIcon sx={{ fontSize: 20, mb: 0.5 }} />}
              iconPosition="start"
              label="Overview"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<TrendingUpIcon sx={{ fontSize: 20, mb: 0.5 }} />}
              iconPosition="start"
              label="Trends & Analytics"
              sx={{ gap: 1 }}
            />
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
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

          {/* Summary Statistics Section - PDF Capture Target */}
          {hasAnyReportGenerated && (
            <Box 
              ref={statsContentRef}
              sx={{ 
                mt: 4, 
                p: 4, 
                background: `linear-gradient(135deg, ${reportColors.neutralBg} 0%, ${reportColors.background} 100%)`,
                borderRadius: '16px',
                border: `1px solid ${reportColors.border}`,
                boxShadow: shadowCard,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: reportColors.gradientPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: shadowColored,
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: reportColors.textPrimary }}>
                  Report Summary & Statistics
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {reportsGenerated.attendance && weeklyAttendanceData.length > 0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${reportColors.primary}15 0%, ${reportColors.primary}05 100%)`,
                        border: `2px solid ${reportColors.primary}30`,
                        borderRadius: '12px',
                        p: 3,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${reportColors.primary}30`,
                          borderColor: reportColors.primary,
                        },
                      }}
                    >
                      <EventIcon sx={{ fontSize: 32, color: reportColors.primary, mb: 1 }} />
                      <Typography variant="caption" sx={{ color: reportColors.textSecondary, display: 'block', mb: 1, fontWeight: 600 }}>
                        Total Present (Week)
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: reportColors.primary }}>
                        {weeklyAttendanceData.reduce((sum, day) => sum + (day.present || 0), 0)}
                      </Typography>
                    </Card>
                  </Grid>
                )}
                {reportsGenerated.payroll && payrollStatusData.length > 0 && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: `linear-gradient(135deg, ${reportColors.warning}15 0%, ${reportColors.warning}05 100%)`,
                          border: `2px solid ${reportColors.warning}30`,
                          borderRadius: '12px',
                          p: 3,
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${reportColors.warning}30`,
                            borderColor: reportColors.warning,
                          },
                        }}
                      >
                        <HourglassEmptyIcon sx={{ fontSize: 32, color: reportColors.warning, mb: 1 }} />
                        <Typography variant="caption" sx={{ color: reportColors.textSecondary, display: 'block', mb: 1, fontWeight: 600 }}>
                          Processing
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: reportColors.warning }}>
                          {payrollStatusData[0]?.value || 0}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: `linear-gradient(135deg, ${reportColors.primary}15 0%, ${reportColors.primary}05 100%)`,
                          border: `2px solid ${reportColors.primary}30`,
                          borderRadius: '12px',
                          p: 3,
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${reportColors.primary}30`,
                            borderColor: reportColors.primary,
                          },
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 32, color: reportColors.primary, mb: 1 }} />
                        <Typography variant="caption" sx={{ color: reportColors.textSecondary, display: 'block', mb: 1, fontWeight: 600 }}>
                          Processed
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: reportColors.primary }}>
                          {payrollStatusData[1]?.value || 0}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          background: `linear-gradient(135deg, ${reportColors.success}15 0%, ${reportColors.success}05 100%)`,
                          border: `2px solid ${reportColors.success}30`,
                          borderRadius: '12px',
                          p: 3,
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 24px ${reportColors.success}30`,
                            borderColor: reportColors.success,
                          },
                        }}
                      >
                        <DownloadIcon sx={{ fontSize: 32, color: reportColors.success, mb: 1 }} />
                        <Typography variant="caption" sx={{ color: reportColors.textSecondary, display: 'block', mb: 1, fontWeight: 600 }}>
                          Released
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: reportColors.success }}>
                          {payrollStatusData[2]?.value || 0}
                        </Typography>
                      </Card>
                    </Grid>
                  </>
                )}
                {reportsGenerated.employee && departmentEmployeeData.length > 0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${reportColors.info}15 0%, ${reportColors.info}05 100%)`,
                        border: `2px solid ${reportColors.info}30`,
                        borderRadius: '12px',
                        p: 3,
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 24px ${reportColors.info}30`,
                          borderColor: reportColors.info,
                        },
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 32, color: reportColors.info, mb: 1 }} />
                      <Typography variant="caption" sx={{ color: reportColors.textSecondary, display: 'block', mb: 1, fontWeight: 600 }}>
                        Total Departments
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: reportColors.info }}>
                        {departmentEmployeeData.length}
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Box>
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

