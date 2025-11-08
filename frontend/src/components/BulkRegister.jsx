import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Fade,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  alpha,
} from "@mui/material";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import {
  GroupAdd,
  CloudUpload,
  TableChart,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  Warning,
  FileUpload,
  People,
  ArrowBack,
  Refresh,
  Clear,
} from "@mui/icons-material";
import AccessDenied from "./AccessDenied";

const BulkRegister = () => {
  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState([]);
  const [errors, setErrors] = useState([]);
  const [errMessage, setErrMessage] = useState("");

  const navigate = useNavigate();

  // Color scheme matching ViewAttendanceRecord
  const primaryColor = '#6d2323';
  const creamColor = '#FEF9E1';
  const blackColor = '#000000';
  const whiteColor = '#FFFFFF';

  // Page access control states
  const [hasAccess, setHasAccess] = useState(null);

  // Page access control
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 17;
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

  // Handle file upload and parse Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (worksheet.length === 0) {
          setErrMessage("Excel file is empty.");
          return;
        }

        const firstRow = worksheet[0];
        const requiredFields = ['employeeNumber', 'firstName', 'lastName', 'email', 'employmentCategory', 'password'];
        const missingFields = requiredFields.filter(field => !(field in firstRow));
        
        if (missingFields.length > 0) {
          setErrMessage(`Missing required columns: ${missingFields.join(', ')}. Expected columns: employeeNumber, firstName, lastName, email, employmentCategory, password, middleName (optional), nameExtension (optional)`);
          return;
        }

        const processedUsers = worksheet.map((user, index) => {
          let employmentCategory = user.employmentCategory?.toString().trim().toLowerCase() || "";
          let employmentCategoryValue = "";
          
          if (employmentCategory === "regular") {
            employmentCategoryValue = "1";
          } else if (employmentCategory === "jo") {
            employmentCategoryValue = "0";
          }

          const processedUser = {
            firstName: user.firstName?.toString().trim() || "",
            middleName: user.middleName?.toString().trim() || null,
            lastName: user.lastName?.toString().trim() || "",
            nameExtension: user.nameExtension?.toString().trim() || null,
            employmentCategory: employmentCategoryValue,
            email: user.email?.toString().trim() || "",
            employeeNumber: user.employeeNumber?.toString().trim() || "",
            password: user.password?.toString().trim() || "",
            role: "staff",
            access_level: "user"
          };

          return processedUser;
        });

        const validationErrors = [];
        processedUsers.forEach((user, index) => {
          if (!user.firstName || !user.lastName || !user.email || !user.employeeNumber || !user.password) {
            validationErrors.push(`Row ${index + 2}: Missing required fields`);
          }
          
          if (!user.employmentCategory) {
            validationErrors.push(`Row ${index + 2}: Invalid employmentCategory. Must be 'Regular' or 'JO'`);
          }
          
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (user.email && !emailRegex.test(user.email)) {
            validationErrors.push(`Row ${index + 2}: Invalid email format`);
          }
        });

        if (validationErrors.length > 0) {
          setErrMessage(`Validation errors found:\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? '\n...and more' : ''}`);
          return;
        }

        setUsers(processedUsers);
        setErrMessage("");
        
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setErrMessage("Error parsing Excel file. Please check the file format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle register via backend
  const handleRegister = async () => {
    if (users.length === 0) {
      setErrMessage("Please upload an Excel file first.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/excel-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess(result.successful || []);
        setErrors(result.errors || []);
        setErrMessage("");
      } else {
        setErrMessage(result.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Error uploading Excel:", err);
      setErrMessage("Something went wrong while uploading.");
    }
  };

  const handleClearAll = () => {
    setUsers([]);
    setSuccess([]);
    setErrors([]);
    setErrMessage("");
  };

  // Loading state
  if (hasAccess === null) {
    return (
      <Box sx={{ bgcolor: creamColor, minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress sx={{ color: primaryColor, mb: 2 }} />
            <Typography variant="h6" sx={{ color: primaryColor }}>
              Loading access information...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  // Access denied state
  if (!hasAccess) {
    return (
      <AccessDenied 
        title="Access Denied"
        message="You do not have permission to access Bulk User Registration. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                color: whiteColor,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 3, width: 56, height: 56 }}>
                    <GroupAdd sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Bulk Users Registration
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Register multiple users using Excel file
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Tooltip title="Clear All">
                    <IconButton 
                      onClick={handleClearAll}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        color: whiteColor
                      }}
                    >
                      <Clear />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Instructions Card */}
        <Fade in timeout={700}>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <InfoOutlined sx={{ color: primaryColor, mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: blackColor }}>
                  Excel File Requirements
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: blackColor, mb: 1 }}>
                    Required Columns:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {['employeeNumber', 'firstName', 'lastName', 'email', 'employmentCategory', 'password'].map((field) => (
                      <Chip 
                        key={field} 
                        label={field} 
                        size="small" 
                        sx={{ 
                          bgcolor: primaryColor, 
                          color: whiteColor,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }} 
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: blackColor, mb: 1 }}>
                    Optional Columns:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {['middleName', 'nameExtension'].map((field) => (
                      <Chip 
                        key={field} 
                        label={field} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: primaryColor, 
                          color: primaryColor,
                          fontSize: '0.75rem'
                        }} 
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
              
              <Alert 
                severity="warning"
                sx={{ 
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: alpha(primaryColor, 0.05),
                  color: primaryColor,
                  '& .MuiAlert-icon': { color: primaryColor }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <strong>Note:</strong> employmentCategory must be either "Regular" or "JO"
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Fade>

        {/* Error Message */}
        {errMessage && (
          <Fade in timeout={300}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                whiteSpace: "pre-line"
              }}
              onClose={() => setErrMessage("")}
            >
              {errMessage}
            </Alert>
          </Fade>
        )}

        {/* Upload Card */}
        <Fade in timeout={900}>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box 
                sx={{ 
                  p: 4,
                  border: `2px dashed ${alpha(primaryColor, 0.3)}`,
                  borderRadius: 3,
                  backgroundColor: alpha(creamColor, 0.3),
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: primaryColor,
                    backgroundColor: alpha(creamColor, 0.5),
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <FileUpload sx={{ fontSize: 64, color: primaryColor, mb: 2 }} />
                <Typography variant="h6" sx={{ color: blackColor, mb: 2, fontWeight: 600 }}>
                  Upload Excel File
                </Typography>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    component="span"
                    variant="contained"
                    startIcon={<CloudUpload />}
                    sx={{
                      bgcolor: primaryColor,
                      color: whiteColor,
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: alpha(primaryColor, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Choose File
                  </Button>
                </label>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Users Loaded Status */}
        {users.length > 0 && (
          <Fade in timeout={500}>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ 
                p: 3, 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`, 
                color: whiteColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '12px 12px 0 0'
              }}>
                <Box display="flex" alignItems="center">
                  <People sx={{ fontSize: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Users Ready
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {users.length} user{users.length !== 1 ? 's' : ''} loaded
                    </Typography>
                  </Box>
                </Box>
                <CheckCircleOutline sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </Card>
          </Fade>
        )}

        {/* Action Buttons */}
        <Fade in timeout={1100}>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CloudUpload />}
                    onClick={handleRegister}
                    disabled={users.length === 0}
                    sx={{
                      py: 1.5,
                      bgcolor: primaryColor,
                      color: whiteColor,
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: alpha(primaryColor, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)'
                      },
                      '&:disabled': {
                        bgcolor: alpha(primaryColor, 0.3),
                        color: alpha(whiteColor, 0.5)
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Upload & Register Users
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/registration")}
                    sx={{
                      py: 1.5,
                      borderColor: primaryColor,
                      color: primaryColor,
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: primaryColor,
                        borderWidth: 2,
                        bgcolor: alpha(primaryColor, 0.04),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Back to User Registration
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Success Results */}
        {success.length > 0 && (
          <Fade in timeout={500}>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#4caf50',
                color: whiteColor,
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <CheckCircleOutline sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Successful Registrations ({success.length})
                </Typography>
              </Box>
              <CardContent sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {success.map((user, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 1.5, 
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#4caf50', 0.05),
                      display: 'flex',
                      alignItems: 'center',
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Chip 
                      label={user.employeeNumber} 
                      size="small" 
                      sx={{ mr: 2, bgcolor: primaryColor, color: whiteColor, fontWeight: 600 }} 
                    />
                    <Typography variant="body2" sx={{ color: blackColor }}>
                      {user.name}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Error Results */}
        {errors.length > 0 && (
          <Fade in timeout={500}>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f44336',
                color: whiteColor,
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <ErrorOutline sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Registration Errors ({errors.length})
                </Typography>
              </Box>
              <CardContent sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {errors.slice(0, 10).map((err, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 1.5, 
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#f44336', 0.05),
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Typography variant="body2" sx={{ color: blackColor }}>
                      • {err}
                    </Typography>
                  </Box>
                ))}
                {errors.length > 10 && (
                  <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(blackColor, 0.6) }}>
                      ...and {errors.length - 10} more errors
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default BulkRegister;