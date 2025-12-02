import API_BASE_URL from "../apiConfig";
import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import LoadingOverlay from "./LoadingOverlay";
import {
  Alert,
  TextField,
  Button,
  Container,
  Box,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  LockOutlined,
  LockResetOutlined,
  VerifiedUserOutlined,
  CheckCircleOutline,
  ErrorOutline,
  ArrowBack,
  Visibility,
  VisibilityOff,
  MarkEmailReadOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import logo from "../assets/logo.PNG";
import bg from "../assets/EaristBG.PNG";

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const steps = ["Enter Email", "Verify Code", "New Password"];

  const primaryGradient = "linear-gradient(135deg, #800020, #A52A2A)";
  const primaryHoverGradient = "linear-gradient(135deg, #A52A2A, #800020)";
  const darkText = "#4B0000";
  const mediumText = "#800020";

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errMessage) setErrorMessage("");
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!recaptchaToken) {
      setErrorMessage("Please verify that you are not a robot.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, recaptchaToken }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentStep(1);
        setShowVerificationModal(true);
        recaptchaRef.current.reset();
        setRecaptchaToken("");
      } else {
        setErrorMessage(data.error || "Failed to send verification code.");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrorMessage("Something went wrong. Please try again.");
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
      const response = await fetch(`${API_BASE_URL}/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: formData.verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentStep(2);
      } else {
        setErrorMessage(data.error || "Invalid verification code.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setErrorMessage("Something went wrong. Please try again.");
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
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.location.href = "/";
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
     case 0:
      return (
        <Box component="form" onSubmit={handleSubmitEmail}>
          <Typography
            sx={{
              mb: 3,
              color: mediumText,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Enter your email address and we'll send you a verification code to reset your password.
          </Typography>

          <TextField
            type="email"
            name="email"
            placeholder="Email Address"
            fullWidth
            value={formData.email}
            onChange={handleChanges}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "rgba(128,0,32,0.1)",
                "& fieldset": { borderColor: mediumText },
                "&.Mui-focused fieldset": { borderColor: mediumText },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: mediumText }} />
                </InputAdornment>
              ),
            }}
            required
          />

          {/* ✅ Google reCAPTCHA */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <ReCAPTCHA
              sitekey="6LczLdwrAAAAADm2hy8vJDkvKc05KJNDY8TQgagG"
              onChange={(token) => {
                console.log("Recaptcha token:", token); // ✅ Debug log
                setRecaptchaToken(token);
              }}
              ref={recaptchaRef}
              theme="light"
              size="normal"
            />
          </Box>

          {/* ✅ Disable button until recaptcha is solved */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !recaptchaToken}
            startIcon={<MarkEmailReadOutlined />}
            sx={{
              py: 1.8,
              fontSize: "1rem",
              fontWeight: "bold",
              background: primaryGradient,
              "&:hover": {
                background: primaryHoverGradient,
                transform: "scale(1.05)",
              },
              transition: "transform 0.2s ease-in-out",
              "&:disabled": { bgcolor: "#cccccc" },
            }}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </Box>
      );

      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyCode}>
            <Typography sx={{ mb: 3, color: mediumText, fontSize: "14px", textAlign: "center" }}>
              Enter the 6-digit verification code sent to <strong>{formData.email}</strong>
            </Typography>
            <TextField
              type="text"
              name="verificationCode"
              placeholder="• • • • • •"
              fullWidth
              value={formData.verificationCode}
              onChange={handleChanges}
              inputProps={{ maxLength: 6, style: { textAlign: "center", fontSize: "2rem", letterSpacing: "1rem" } }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: mediumText },
                  "&.Mui-focused fieldset": { borderColor: mediumText },
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
                  color: mediumText,
                  borderColor: mediumText,
                  fontWeight: "bold",
                  "&:hover": { borderColor: mediumText, backgroundColor: "rgba(128,0,32,0.1)" },
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
                  background: primaryGradient,
                  "&:hover": { background: primaryHoverGradient, transform: "scale(1.05)" },
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
          <Typography sx={{ mb: 3, color: mediumText, fontSize: "14px", textAlign: "center" }}>
            Create a new password for your account.
          </Typography>

          <TextField
            type={showPasswords.new ? "text" : "password"}
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChanges}
            sx={{
              mb: 2,
              width: "100%",
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "rgba(128,0,32,0.1)",
                "& fieldset": { borderColor: mediumText },
                "&.Mui-focused fieldset": { borderColor: mediumText },
              },
            }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: mediumText }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            type={showPasswords.confirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChanges}
            sx={{
              mb: 2,
              width: "100%",
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "rgba(128,0,32,0.1)",
                "& fieldset": { borderColor: mediumText },
                "&.Mui-focused fieldset": { borderColor: mediumText },
              },
            }}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: mediumText }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={passwordConfirmed}
                onChange={(e) => setPasswordConfirmed(e.target.checked)}
                sx={{ color: mediumText, "&.Mui-checked": { color: mediumText } }}
              />
            }
            label="I confirm that I want to change my password"
            sx={{ mb: 3, textAlign: "center" }}
          />

          <Box sx={{ display: "flex", gap: 2, width: "100%", maxWidth: 400 }}>
            <Button
              onClick={() => setCurrentStep(1)}
              variant="outlined"
              fullWidth
              startIcon={<ArrowBack />}
              sx={{
                py: 1.8,
                color: mediumText,
                borderColor: mediumText,
                fontWeight: "bold",
                "&:hover": { borderColor: mediumText, backgroundColor: "rgba(128,0,32,0.1)" },
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
                background: primaryGradient,
                "&:hover": { background: primaryHoverGradient, transform: "scale(1.05)" },
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

  return (
    <>
      {/* Backgrounds */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          animation: "zoomPulse 20s ease-in-out infinite",
          "@keyframes zoomPulse": { "0%, 100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.05)" } },
        }}
      />
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          animation: "subtlePulse 8s ease-in-out infinite",
          "@keyframes subtlePulse": { "0%, 100%": { opacity: 0.75 }, "50%": { opacity: 0.7 } },
        }}
      />

      {/* Main Container */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <Container maxWidth="sm" sx={{ position: "relative" }}>
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, md: 4 },
              width: "100%",
              borderRadius: 4,
              textAlign: "center",
              background: "rgba(255,248,231,0.85)",
              backdropFilter: "blur(15px)",
              boxShadow: "0 15px 40px rgba(128,0,32,0.2)",
              border: "1px solid rgba(128,0,32,0.15)",
              transition: "transform 0.6s ease, box-shadow 0.6s ease",
              "&:hover": { transform: "scale(1.03)", boxShadow: "0 25px 50px rgba(128,0,32,0.35)" },
            }}
          >
            <Box sx={{ width: 100, height: 100, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
            <Typography variant="h5" sx={{ color: darkText, fontWeight: "bold", mb: 1 }}>
              {currentStep === 0 && "Reset Your Password"}
              {currentStep === 1 && "Enter Verification Code"}
              {currentStep === 2 && "Create New Password"}
            </Typography>
            <Stepper activeStep={currentStep} sx={{ mb: 3, mt: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: { "&.Mui-active": { color: mediumText }, "&.Mui-completed": { color: mediumText } },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {errMessage && <Alert icon={<ErrorOutline fontSize="inherit" />} sx={{ mb: 2 }} severity="error">{errMessage}</Alert>}
            {renderStepContent()}
            <Box sx={{ mt: 3, fontSize: "14px", color: mediumText }}>
              Remember your password?{" "}
              <Link href="/" underline="hover" sx={{ color: mediumText, fontWeight: "bold" }}>Login</Link>
            </Box>

            {/* Verification Modal Overlay */}
            {showVerificationModal && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  zIndex: 20,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 500,
                    bgcolor: "rgba(255,248,231,0.95)",
                    borderRadius: 4,
                    p: 4,
                    textAlign: "center",
                    boxShadow: "0 20px 50px rgba(128,0,32,0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <MarkEmailReadOutlined sx={{ fontSize: 80, color: mediumText, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: darkText }}>
                    Verification Code Sent
                  </Typography>
                  <Typography sx={{ color: mediumText, mb: 3, lineHeight: 1.5 }}>
                    A verification code has been sent to <strong>{formData.email}</strong>. Please check your inbox and enter the code to proceed.
                  </Typography>
                  <Button
                    onClick={() => setShowVerificationModal(false)}
                    variant="contained"
                    fullWidth
                    sx={{
                      py: 1.8,
                      fontSize: "1rem",
                      fontWeight: "bold",
                      background: primaryGradient,
                      "&:hover": { background: primaryHoverGradient, transform: "scale(1.05)" },
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    Okay
                  </Button>
                </Box>
              </Box>
            )}

            {/* Success Modal Overlay */}
            {showSuccessModal && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  zIndex: 20,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 500,
                    bgcolor: "rgba(255,248,231,0.95)",
                    borderRadius: 4,
                    p: 4,
                    textAlign: "center",
                    boxShadow: "0 20px 50px rgba(128,0,32,0.3)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CheckCircleOutline sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: darkText }}>
                    Password Updated Successfully!
                  </Typography>
                  <Typography sx={{ color: mediumText, mb: 3, lineHeight: 1.5 }}>
                    Your password has been successfully updated. You can now login with your new password.
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
                      background: primaryGradient,
                      "&:hover": { background: primaryHoverGradient, transform: "scale(1.05)" },
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    Continue to Login
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ForgotPassword;
