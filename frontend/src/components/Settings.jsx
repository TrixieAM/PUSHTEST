import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Alert,
  TextField,
  Button,
  Box,
  Container,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  ArrowBack,
  VerifiedUserOutlined,
  LockResetOutlined,
  CheckCircleOutline,
  ErrorOutline,
  MarkEmailReadOutlined,
  Email as EmailOutlined,
  Security as SecurityOutlined,
  HelpOutline as HelpOutlineIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import LoadingOverlay from "./LoadingOverlay";
import { useSystemSettings } from "../contexts/SystemSettingsContext";

const Settings = () => {
  const { settings: systemSettings } = useSystemSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('password');
  const [formData, setFormData] = useState({
    currentPassword: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [enableMFA, setEnableMFA] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [aboutUs, setAboutUs] = useState(null);

  const steps = ["Step 1: Verify Identity", "Step 2: Enter Code", "Step 3: New Password"];

  const employeeNumber = localStorage.getItem('employeeNumber');

  // Get colors from system settings
  const primaryColor = systemSettings?.primaryColor || '#894444';
  const secondaryColor = systemSettings?.secondaryColor || '#6d2323';
  const accentColor = systemSettings?.accentColor || '#FEF9E1';
  const textPrimaryColor = systemSettings?.textPrimaryColor || '#6D2323';
  const backgroundColor = systemSettings?.backgroundColor || '#FFFFFF';

  // Get user email from token
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setErrorMessage("Session expired. Please login again.");
      setTimeout(() => (window.location.href = "/"), 2000);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(decoded.email);
    } catch (e) {
      console.error("Error decoding token:", e);
      setErrorMessage("Invalid session. Please login again.");
      setTimeout(() => (window.location.href = "/"), 2000);
    }

    // Fetch user preferences (MFA)
    const fetchUserPreferences = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/user-preferences/${employeeNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEnableMFA(response.data.enable_mfa === 1 || response.data.enable_mfa === true);
      } catch (err) {
        console.error('Error loading user preferences:', err);
        setEnableMFA(true);
      }
    };

    // Fetch FAQs
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/faqs`);
        setFaqs(response.data);
      } catch (err) {
        console.error('Error loading FAQs:', err);
      }
    };

    // Fetch About Us
    const fetchAboutUs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/about-us`);
        setAboutUs(response.data);
      } catch (err) {
        console.error('Error loading About Us:', err);
      }
    };

    if (employeeNumber) {
      fetchUserPreferences();
    }
    fetchFAQs();
    fetchAboutUs();
  }, [employeeNumber]);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errMessage) setErrorMessage("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !confirmEmail) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (newEmail !== confirmEmail) {
      setErrorMessage("Emails do not match!");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/update-email`,
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUserEmail(newEmail);
        setNewEmail("");
        setConfirmEmail("");
        setSuccessMessage("Email updated successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage("Failed to update email.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMFA = async (event) => {
    const newValue = event.target.checked;
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/user-preferences/${employeeNumber}`,
        { enable_mfa: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnableMFA(newValue);
      setSuccessMessage(`MFA ${newValue ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error('Error updating MFA preference:', err);
      setErrorMessage("Failed to update MFA setting. Please try again.");
      setEnableMFA(!newValue);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send verification code (with current password check)
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      setErrorMessage("User email not found. Please login again.");
      return;
    }
    if (!formData.currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const verifyRes = await fetch(`${API_BASE_URL}/verify-current-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email: userEmail,
          currentPassword: formData.currentPassword
        }),
      });

      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        setErrorMessage(verifyData.error || "Current password is incorrect.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/send-password-change-code`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentStep(1);
        setShowVerificationModal(true);
      } else {
        console.error("Backend error response:", data);
        setErrorMessage(data.error || "Failed to send verification code.");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!formData.verificationCode) {
      setErrorMessage("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/verify-password-change-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: formData.verificationCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentStep(2);
      } else {
        setErrorMessage(data.error || "Invalid verification code.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.newPassword || !formData.confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (!passwordConfirmed) {
      setErrorMessage("Please confirm that you want to change your password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/complete-password-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setLogoutOpen(true);
    
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }, 3000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestCode}>
            <Typography sx={{ mb: 3, color: textPrimaryColor, fontSize: "15px", textAlign: "center", lineHeight: 1.6 }}>
              To change your password, we need to verify your identity. Enter your current password below, and we'll send a verification code to your email: <strong>{userEmail}</strong>
            </Typography>
            
            <TextField
              type={showPassword.current ? "text" : "password"}
              name="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChanges}
              fullWidth
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: accentColor,
                  "& fieldset": { borderColor: primaryColor },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={<MarkEmailReadOutlined />}
              sx={{
                py: 1.8,
                fontSize: "1rem",
                fontWeight: "bold",
                bgcolor: primaryColor,
                color: accentColor,
                "&:hover": { bgcolor: secondaryColor, transform: "scale(1.02)" },
                transition: "transform 0.2s ease-in-out",
              }}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyCode}>
            <Typography sx={{ mb: 3, color: textPrimaryColor, fontSize: "15px", textAlign: "center", lineHeight: 1.6 }}>
              We've sent a 6-digit verification code to <strong>{userEmail}</strong>. Please check your email and enter the code below.
            </Typography>
            <TextField
              type="text"
              name="verificationCode"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              fullWidth
              value={formData.verificationCode}
              onChange={handleChanges}
              inputProps={{
                maxLength: 6,
                style: { textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" },
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: accentColor,
                  "& fieldset": { borderColor: primaryColor },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
              }}
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                onClick={() => setCurrentStep(0)}
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.8,
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontWeight: "bold",
                  "&:hover": { borderColor: secondaryColor, backgroundColor: accentColor },
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<VerifiedUserOutlined />}
                sx={{
                  py: 1.8,
                  fontWeight: "bold",
                  bgcolor: primaryColor,
                  color: accentColor,
                  "&:hover": { bgcolor: secondaryColor, transform: "scale(1.02)" },
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box
            component="form"
            onSubmit={handleResetPassword}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <Typography sx={{ mb: 3, color: textPrimaryColor, fontSize: "15px", textAlign: "center", lineHeight: 1.6 }}>
              Create a strong password for your account. Make sure it's at least 6 characters long.
            </Typography>

            <TextField
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChanges}
              sx={{
                mb: 2,
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: accentColor,
                  "& fieldset": { borderColor: primaryColor },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChanges}
              sx={{
                mb: 2,
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: accentColor,
                  "& fieldset": { borderColor: primaryColor },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={passwordConfirmed}
                  onChange={(e) => setPasswordConfirmed(e.target.checked)}
                  sx={{ color: primaryColor, "&.Mui-checked": { color: primaryColor } }}
                />
              }
              label="I confirm that I want to change my password"
              sx={{ mb: 3, textAlign: "center", width: "100%" }}
            />

            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.8,
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontWeight: "bold",
                  "&:hover": { borderColor: secondaryColor, backgroundColor: accentColor },
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!passwordConfirmed || loading}
                startIcon={<LockResetOutlined />}
                sx={{
                  py: 1.8,
                  fontWeight: "bold",
                  bgcolor: primaryColor,
                  color: accentColor,
                  "&:hover": { bgcolor: secondaryColor, transform: "scale(1.02)" },
                  transition: "transform 0.2s ease-in-out",
                  "&:disabled": { bgcolor: "#cccccc" },
                }}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'password', label: 'Change Password', icon: <LockOutlined size={18} /> },
    { id: 'email', label: 'Email', icon: <EmailOutlined size={18} /> },
    { id: 'mfa', label: 'MFA/OTP', icon: <VerifiedUserOutlined size={18} /> },
    { id: 'about', label: 'About', icon: <InfoIcon size={18} /> },
    { id: 'faqs', label: 'FAQs', icon: <HelpOutlineIcon size={18} /> },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: backgroundColor,
        py: 4,
        px: 3,
      }}
    >
      <LoadingOverlay open={loading} message="Processing..." />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <SettingsIcon sx={{ fontSize: 28, color: primaryColor }} />
            <Typography variant="h4" sx={{ margin: 0, color: textPrimaryColor, fontSize: "28px", fontWeight: 600 }}>
              Settings
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ margin: "5px 0 0 0", color: textPrimaryColor, opacity: 0.7, fontSize: "14px" }}>
            Manage your account settings and preferences
          </Typography>
        </Box>

        {errMessage && (
          <Alert icon={<ErrorOutline fontSize="inherit" />} sx={{ mb: 2 }} severity="error">
            {errMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert icon={<CheckCircleOutline fontSize="inherit" />} sx={{ mb: 2 }} severity="success">
            {successMessage}
          </Alert>
        )}

        {/* Tabs */}
        <Box
          sx={{
            display: "flex",
            gap: 0,
            mb: 0,
            borderBottom: `2px solid ${primaryColor}30`,
            backgroundColor: backgroundColor,
            borderRadius: "8px 8px 0 0",
            px: 2.5,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                padding: "16px 24px",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === tab.id ? `3px solid ${primaryColor}` : "3px solid transparent",
                color: activeTab === tab.id ? primaryColor : textPrimaryColor,
                opacity: activeTab === tab.id ? 1 : 0.7,
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                textTransform: "none",
                borderRadius: 0,
                minWidth: "auto",
                "&:hover": {
                  backgroundColor: `${primaryColor}10`,
                  opacity: 1,
                },
              }}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Tab Content */}
        <Paper
          sx={{
            backgroundColor: backgroundColor,
            borderRadius: "0 8px 8px 8px",
            minHeight: "500px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            overflow: "hidden",
            p: 4,
          }}
        >
          {/* Password Tab */}
          {activeTab === 'password' && (
            <Box>
              <Typography variant="h5" sx={{ color: textPrimaryColor, fontWeight: "bold", mb: 2 }}>
                Change Password
              </Typography>
              <Typography variant="body2" sx={{ color: textPrimaryColor, mb: 3, opacity: 0.8 }}>
                Keep your account secure by regularly updating your password. Follow the steps below to change it.
              </Typography>
              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: { "&.Mui-active": { color: primaryColor }, "&.Mui-completed": { color: primaryColor } },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              {renderStepContent()}

              {/* Verification Modal */}
              {showVerificationModal && (
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1300,
                  }}
                >
                  <Paper
                    sx={{
                      width: "90%",
                      maxWidth: 500,
                      p: 4,
                      textAlign: "center",
                      borderRadius: 3,
                      backgroundColor: accentColor,
                    }}
                  >
                    <MarkEmailReadOutlined sx={{ fontSize: 80, color: primaryColor, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: textPrimaryColor }}>
                      Verification Code Sent
                    </Typography>
                    <Typography sx={{ color: textPrimaryColor, mb: 3, lineHeight: 1.5 }}>
                      A verification code has been sent to <strong>{userEmail}</strong>. Please check your inbox and enter the code to proceed.
                    </Typography>
                    <Button
                      onClick={() => setShowVerificationModal(false)}
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.8,
                        fontSize: "1rem",
                        fontWeight: "bold",
                        bgcolor: primaryColor,
                        color: accentColor,
                        "&:hover": { bgcolor: secondaryColor },
                      }}
                    >
                      Okay
                    </Button>
                  </Paper>
                </Box>
              )}

              {/* Success Modal */}
              {showSuccessModal && (
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1300,
                  }}
                >
                  <Paper
                    sx={{
                      width: "90%",
                      maxWidth: 500,
                      p: 4,
                      textAlign: "center",
                      borderRadius: 3,
                      backgroundColor: accentColor,
                    }}
                  >
                    <CheckCircleOutline sx={{ fontSize: 80, color: primaryColor, mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: textPrimaryColor }}>
                      Password Changed Successfully!
                    </Typography>
                    <Typography sx={{ color: textPrimaryColor, mb: 3, lineHeight: 1.5 }}>
                      Your password has been successfully updated. You will be logged out shortly for security purposes.
                    </Typography>
                    <Button
                      onClick={handleSuccessClose}
                      variant="contained"
                      fullWidth
                      startIcon={<LockOutlined />}
                      sx={{
                        py: 1.8,
                        fontSize: "1rem",
                        fontWeight: "bold",
                        bgcolor: primaryColor,
                        color: accentColor,
                        "&:hover": { bgcolor: secondaryColor },
                      }}
                    >
                      Continue
                    </Button>
                  </Paper>
                </Box>
              )}
            </Box>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <Box>
              <Typography variant="h5" sx={{ color: textPrimaryColor, fontWeight: "bold", mb: 2 }}>
                Email Settings
              </Typography>
              <Typography variant="body2" sx={{ color: textPrimaryColor, mb: 3, opacity: 0.8 }}>
                Update your email address. You'll receive important notifications and verification codes at this address.
              </Typography>

              <TextField
                fullWidth
                label="Current Email"
                value={userEmail}
                disabled
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: primaryColor }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="New Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email"
                sx={{ mb: 2 }}
                required
                helperText="Enter the email address you want to use"
              />

              <TextField
                fullWidth
                label="Confirm New Email Address"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Re-enter your new email"
                sx={{ mb: 3 }}
                required
                helperText="Re-enter the same email to confirm"
              />

              <Button
                fullWidth
                variant="contained"
                sx={{
                  py: 1.8,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  bgcolor: primaryColor,
                  color: accentColor,
                  "&:hover": { bgcolor: secondaryColor, transform: "scale(1.02)" },
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={handleUpdateEmail}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Email"}
              </Button>
            </Box>
          )}

          {/* MFA/OTP Tab */}
          {activeTab === 'mfa' && (
            <Box>
              <Typography variant="h5" sx={{ color: textPrimaryColor, fontWeight: "bold", mb: 2 }}>
                Multi-Factor Authentication (MFA/OTP)
              </Typography>
              <Typography variant="body2" sx={{ color: textPrimaryColor, mb: 3, opacity: 0.8 }}>
                Multi-Factor Authentication adds an extra layer of security to your account. When enabled, you'll receive a verification code via email every time you log in.
              </Typography>

              <Card
                sx={{
                  mb: 3,
                  backgroundColor: accentColor,
                  border: `2px solid ${primaryColor}40`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: textPrimaryColor, fontWeight: 600, mb: 1 }}>
                        Enable MFA/OTP on Login
                      </Typography>
                      <Typography variant="body2" sx={{ color: textPrimaryColor, opacity: 0.7 }}>
                        {enableMFA
                          ? "MFA is currently enabled. You'll receive a verification code when logging in."
                          : "MFA is currently disabled. You can log in without a verification code."}
                      </Typography>
                    </Box>
                    <Switch
                      checked={enableMFA}
                      onChange={handleToggleMFA}
                      disabled={loading}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: primaryColor,
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: primaryColor,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: accentColor,
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: textPrimaryColor, fontWeight: 600, mb: 1 }}>
                  How it works:
                </Typography>
                <Typography variant="body2" sx={{ color: textPrimaryColor, opacity: 0.8 }}>
                  • When MFA is enabled, after entering your password, you'll receive a 6-digit code via email
                  <br />
                  • Enter this code to complete your login
                  <br />
                  • The code expires after 15 minutes
                  <br />• You can disable MFA anytime from this page
                </Typography>
              </Box>
            </Box>
          )}

          {/* About Us Tab */}
          {activeTab === 'about' && (
            <Box>
              <Typography variant="h5" sx={{ color: textPrimaryColor, fontWeight: "bold", mb: 2 }}>
                About Us
              </Typography>
              {aboutUs ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: accentColor,
                    border: `1px solid ${primaryColor}30`,
                  }}
                >
                  <Typography variant="h4" sx={{ color: textPrimaryColor, fontWeight: 700, mb: 2 }}>
                    {aboutUs.title}
                  </Typography>
                  <Box
                    sx={{
                      color: textPrimaryColor,
                      "& h2": { color: textPrimaryColor, mt: 2, mb: 1 },
                      "& h3": { color: textPrimaryColor, mt: 2, mb: 1 },
                      "& p": { mb: 1.5, lineHeight: 1.8 },
                      "& ul": { pl: 3, mb: 2 },
                      "& li": { mb: 0.5 },
                    }}
                    dangerouslySetInnerHTML={{ __html: aboutUs.content }}
                  />
                  {aboutUs.version && (
                    <Typography variant="caption" sx={{ color: textPrimaryColor, opacity: 0.6, display: "block", mt: 2 }}>
                      Version: {aboutUs.version}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: textPrimaryColor, opacity: 0.7 }}>
                  Loading About Us content...
                </Typography>
              )}
            </Box>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <Box>
              <Typography variant="h5" sx={{ color: textPrimaryColor, fontWeight: "bold", mb: 2 }}>
                Frequently Asked Questions (FAQs)
              </Typography>
              <Typography variant="body2" sx={{ color: textPrimaryColor, mb: 3, opacity: 0.8 }}>
                Find answers to common questions about using the system.
              </Typography>

              {faqs.length > 0 ? (
                <Box>
                  {faqs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      sx={{
                        mb: 2,
                        backgroundColor: accentColor,
                        border: `1px solid ${primaryColor}30`,
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: primaryColor }} />}
                        sx={{
                          "& .MuiAccordionSummary-content": {
                            alignItems: "center",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <HelpOutlineIcon sx={{ color: primaryColor, mr: 2 }} />
                          <Typography variant="h6" sx={{ color: textPrimaryColor, fontWeight: 600, flex: 1 }}>
                            {faq.question}
                          </Typography>
                          {faq.category && (
                            <Chip
                              label={faq.category}
                              size="small"
                              sx={{
                                bgcolor: `${primaryColor}20`,
                                color: primaryColor,
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ color: textPrimaryColor, lineHeight: 1.8, pl: 5 }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: textPrimaryColor, opacity: 0.7 }}>
                  No FAQs available at the moment.
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* Logout Animation Dialog */}
      {logoutOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 120,
              height: 120,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 0 40px ${primaryColor}70, 0 0 80px ${primaryColor}50`,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "floatSphere 2s ease-in-out infinite alternate",
              }}
            >
              <LockResetOutlined
                sx={{
                  fontSize: 60,
                  color: accentColor,
                  animation: "heartbeat 1s infinite",
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{
              mt: 3,
              fontWeight: "bold",
              color: accentColor,
              textShadow: `0 0 10px ${primaryColor}`,
              animation: "pulse 1.5s infinite",
            }}
          >
            Logging out...
          </Typography>

          <style>{`
            @keyframes heartbeat {
              0%,100% { transform: scale(1); }
              25%,75% { transform: scale(1.15); }
              50% { transform: scale(1.05); }
            }
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.6; }
              100% { opacity: 1; }
            }
            @keyframes floatSphere {
              0% { transform: translate(-50%, -50%) translateY(0); }
              50% { transform: translate(-50%, -50%) translateY(-15px); }
              100% { transform: translate(-50%, -50%) translateY(0); }
            }
          `}</style>
        </Box>
      )}
    </Box>
  );
};

export default Settings;
