import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../utils/auth";
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
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Tooltip,
  alpha,
  styled,
  Backdrop,
  CircularProgress,
  Fade,
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
  AccountCircle,
  VpnKey,
  Notifications,
  Shield,
  QuestionAnswer,
  Business,
  Logout,
  Policy,
  ContactSupport,
  Close,
  People as PeopleIcon,
  Add,
  Edit,
  Delete,
  Visibility as VisibilityIcon,
  Save,
  Cancel,
} from "@mui/icons-material";
import LoadingOverlay from "./LoadingOverlay";
import { useSystemSettings } from "../contexts/SystemSettingsContext";

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "109, 35, 35";
};

// Professional styled components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: "blur(10px)",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const ProfessionalButton = styled(Button)(
  ({ theme, variant, color = "primary" }) => ({
    borderRadius: 12,
    fontWeight: 600,
    padding: "12px 24px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textTransform: "none",
    fontSize: "0.95rem",
    letterSpacing: "0.025em",
    boxShadow:
      variant === "contained" ? "0 4px 14px rgba(254, 249, 225, 0.25)" : "none",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow:
        variant === "contained"
          ? "0 6px 20px rgba(254, 249, 225, 0.35)"
          : "none",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  })
);

const ModernTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    "&:hover": {
      transform: "translateY(-1px)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
    },
    "&.Mui-focused": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 20px rgba(254, 249, 225, 0.25)",
      backgroundColor: "rgba(255, 255, 255, 1)",
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },
}));

const Settings = () => {
  const { settings: systemSettings } = useSystemSettings();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSection, setActiveSection] = useState("password");
  const [formData, setFormData] = useState({
    currentPassword: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
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
  const [policies, setPolicies] = useState([]);
  const [userRole, setUserRole] = useState("");
  // Confidential password states
  const [confidentialPassword, setConfidentialPassword] = useState("");
  const [confirmConfidentialPassword, setConfirmConfidentialPassword] =
    useState("");
  const [showConfidentialPassword, setShowConfidentialPassword] =
    useState(false);
  const [passwordExists, setPasswordExists] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState(null);
  // Contact us modal state
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "earisthrmstesting@gmail.com",
    subject: "",
    message: "",
  });
  // Contact submissions (for admin)
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [showContactSubmissions, setShowContactSubmissions] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  // FAQ CRUD states
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "general",
    display_order: 0,
    is_active: true,
  });
  // About Us CRUD states
  const [aboutUsEditMode, setAboutUsEditMode] = useState(false);
  const [aboutUsForm, setAboutUsForm] = useState({
    title: "",
    content: "",
    version: "",
  });
  // Policy CRUD states
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [policyForm, setPolicyForm] = useState({
    title: "",
    content: "",
    category: "privacy",
    display_order: 0,
    is_active: true,
  });

  const steps = [
    "Step 1: Verify Information",
    "Step 2: Enter Code",
    "Step 3: New Password",
  ];

  const employeeNumber = localStorage.getItem("employeeNumber");

  // Get user role from token
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.role) {
      setUserRole(userInfo.role);
    }
  }, []);

  // Get colors from system settings
  const primaryColor = systemSettings?.primaryColor || "#6d2323";
  const secondaryColor = systemSettings?.secondaryColor || "#6d2323";
  const accentColor = systemSettings?.accentColor || "#FEF9E1";
  const textPrimaryColor = systemSettings?.textPrimaryColor || "#6D2323";
  const textSecondaryColor = systemSettings?.textSecondaryColor || "#FFFFFF";
  const backgroundColor = systemSettings?.backgroundColor || "#FFFFFF";

  // Get user email from token
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
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
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/user-preferences/${employeeNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEnableMFA(
          response.data.enable_mfa === 1 || response.data.enable_mfa === true
        );
      } catch (err) {
        console.error("Error loading user preferences:", err);
        setEnableMFA(true);
      }
    };

    // Fetch FAQs
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/faqs`);
        setFaqs(response.data);
      } catch (err) {
        console.error("Error loading FAQs:", err);
      }
    };

    // Fetch About Us
    const fetchAboutUs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/about-us`);
        setAboutUs(response.data);
      } catch (err) {
        console.error("Error loading About Us:", err);
      }
    };

    // Fetch Policies
    const fetchPolicies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/policies`);
        setPolicies(response.data);
      } catch (err) {
        console.error("Error loading Policies:", err);
      }
    };

    if (employeeNumber) {
      fetchUserPreferences();
    }
    fetchFAQs();
    fetchAboutUs();
    fetchPolicies();

    // Fetch confidential password info if superadmin
    const fetchPasswordInfo = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/confidential-password/exists`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPasswordExists(response.data.exists);
        setPasswordInfo(response.data.passwordInfo);
      } catch (err) {
        console.error("Error loading confidential password info:", err);
      }
    };

    const userInfo = getUserInfo();
    if (userInfo && userInfo.role === "superadmin") {
      fetchPasswordInfo();
    }
  }, [employeeNumber]);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errMessage) setErrorMessage("");
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/user-preferences/${employeeNumber}`,
        { enable_mfa: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnableMFA(newValue);
      setSuccessMessage(
        `MFA ${newValue ? "enabled" : "disabled"} successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error updating MFA preference:", err);
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const verifyRes = await fetch(`${API_BASE_URL}/verify-current-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: formData.currentPassword,
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
          Authorization: `Bearer ${token}`,
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
      setErrorMessage("Please enter verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/verify-password-change-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          code: formData.verificationCode,
        }),
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

  const handleLogout = () => {
    setLogoutOpen(true);
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }, 1500);
  };

  const handleContactUsSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/contact-us`,
        contactForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        setSuccessMessage("Your message has been sent successfully!");
        setContactForm({
          name: "",
          email: "earisthrmstesting@gmail.com",
          subject: "",
          message: "",
        });
        setContactUsOpen(false);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch contact submissions (admin only)
  const fetchContactSubmissions = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/contact-us`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContactSubmissions(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error loading contact submissions:", err);
      if (err.response?.status !== 403) {
        setErrorMessage("Failed to load contact submissions.");
      }
    }
  };

  // Handle FAQ form changes
  const handleFaqFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFaqForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open FAQ dialog for create/edit
  const handleOpenFaqDialog = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || "general",
        display_order: faq.display_order || 0,
        is_active: faq.is_active !== undefined ? faq.is_active : true,
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        question: "",
        answer: "",
        category: "general",
        display_order: 0,
        is_active: true,
      });
    }
    setFaqDialogOpen(true);
  };

  // Save FAQ (create or update)
  const handleSaveFaq = async () => {
    if (!faqForm.question || !faqForm.answer) {
      setErrorMessage("Question and answer are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (editingFaq) {
        await axios.put(`${API_BASE_URL}/api/faqs/${editingFaq.id}`, faqForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("FAQ updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/faqs`, faqForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("FAQ created successfully!");
      }
      setFaqDialogOpen(false);
      // Refresh FAQs
      const response = await axios.get(`${API_BASE_URL}/api/faqs`);
      setFaqs(response.data);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error saving FAQ:", err);
      setErrorMessage(err.response?.data?.error || "Failed to save FAQ.");
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/faqs/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("FAQ deleted successfully!");
      // Refresh FAQs
      const response = await axios.get(`${API_BASE_URL}/api/faqs`);
      setFaqs(response.data);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      setErrorMessage(err.response?.data?.error || "Failed to delete FAQ.");
    } finally {
      setLoading(false);
    }
  };

  // Handle About Us form changes
  const handleAboutUsFormChange = (e) => {
    const { name, value } = e.target;
    setAboutUsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save About Us
  const handleSaveAboutUs = async () => {
    if (!aboutUsForm.title || !aboutUsForm.content) {
      setErrorMessage("Title and content are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/about-us`, aboutUsForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("About Us updated successfully!");
      setAboutUsEditMode(false);
      // Refresh About Us
      const response = await axios.get(`${API_BASE_URL}/api/about-us`);
      setAboutUs(response.data);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error saving About Us:", err);
      setErrorMessage(err.response?.data?.error || "Failed to save About Us.");
    } finally {
      setLoading(false);
    }
  };

  // Open About Us edit mode
  const handleEditAboutUs = () => {
    if (aboutUs) {
      setAboutUsForm({
        title: aboutUs.title || "",
        content: aboutUs.content || "",
        version: aboutUs.version || "",
      });
    } else {
      setAboutUsForm({
        title: "About Us",
        content: "",
        version: "",
      });
    }
    setAboutUsEditMode(true);
  };

  // Update contact submission status and reply
  const handleUpdateSubmissionStatus = async (
    id,
    status,
    adminNotes = null
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/contact-us/${id}`,
        { status, admin_notes: adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(
        adminNotes
          ? "Response sent successfully!"
          : "Status updated successfully!"
      );
      fetchContactSubmissions();
      // Update selected submission in dialog
      if (selectedSubmission) {
        setSelectedSubmission((prev) => ({
          ...prev,
          status: status || prev.status,
          admin_notes:
            adminNotes !== null && adminNotes !== undefined
              ? adminNotes
              : prev.admin_notes,
        }));
      }
      // Clear reply field if a reply was sent
      if (adminNotes) {
        setAdminReply("");
      }
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error updating submission:", err);
      setErrorMessage(
        err.response?.data?.error || "Failed to update submission."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Policy form changes
  const handlePolicyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPolicyForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open Policy dialog for create/edit
  const handleOpenPolicyDialog = (policy = null) => {
    if (policy) {
      setEditingPolicy(policy);
      setPolicyForm({
        title: policy.title,
        content: policy.content,
        category: policy.category || "privacy",
        display_order: policy.display_order || 0,
        is_active: policy.is_active !== undefined ? policy.is_active : true,
      });
    } else {
      setEditingPolicy(null);
      setPolicyForm({
        title: "",
        content: "",
        category: "privacy",
        display_order: 0,
        is_active: true,
      });
    }
    setPolicyDialogOpen(true);
  };

  // Save Policy (create or update)
  const handleSavePolicy = async () => {
    if (!policyForm.title || !policyForm.content) {
      setErrorMessage("Title and content are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = editingPolicy
        ? await axios.put(
            `${API_BASE_URL}/api/policies/${editingPolicy.id}`,
            policyForm,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        : await axios.post(`${API_BASE_URL}/api/policies`, policyForm, {
            headers: { Authorization: `Bearer ${token}` },
          });

      const version = response.data.version;
      setSuccessMessage(
        `Policy ${
          editingPolicy ? "updated" : "created"
        } successfully! Version: ${version}`
      );
      setPolicyDialogOpen(false);
      // Refresh Policies
      const policiesResponse = await axios.get(`${API_BASE_URL}/api/policies`);
      setPolicies(policiesResponse.data);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error saving Policy:", err);
      setErrorMessage(err.response?.data?.error || "Failed to save Policy.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Policy
  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/policies/${policyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Policy deleted successfully!");
      // Refresh Policies
      const response = await axios.get(`${API_BASE_URL}/api/policies`);
      setPolicies(response.data);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Error deleting Policy:", err);
      setErrorMessage(err.response?.data?.error || "Failed to delete Policy.");
    } finally {
      setLoading(false);
    }
  };

  // Handle confidential password creation/update
  const handleConfidentialPasswordSubmit = async () => {
    if (!confidentialPassword || !confirmConfidentialPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (confidentialPassword !== confirmConfidentialPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (confidentialPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/confidential-password`,
        { password: confidentialPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setSuccessMessage(
          passwordExists
            ? "Confidential password updated successfully!"
            : "Confidential password created successfully!"
        );
        setConfidentialPassword("");
        setConfirmConfidentialPassword("");
        setTimeout(() => {
          setSuccessMessage("");
          // Refresh password info
          const fetchPasswordInfo = async () => {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/api/confidential-password/exists`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setPasswordExists(response.data.exists);
              setPasswordInfo(response.data.passwordInfo);
            } catch (err) {
              console.error("Error loading confidential password info:", err);
            }
          };
          fetchPasswordInfo();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error ||
          "Failed to save confidential password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestCode}>
            <Typography
              sx={{
                mb: 3,
                color: "black",
                fontSize: "15px",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              To change your password, we need to verify your identity. Enter
              your current password below, and we'll send a verification code to
              your email: <strong>{userEmail}</strong>
            </Typography>

            <ModernTextField
              type={showPassword.current ? "text" : "password"}
              name="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChanges}
              fullWidth
              sx={{
                mb: 3,
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
              }}
            />

            <ProfessionalButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={<MarkEmailReadOutlined />}
              sx={{
                py: 1.8,
                fontSize: "1rem",
                fontWeight: "normal",
                bgcolor: primaryColor,
                color: "white",
                "&:hover": {
                  bgcolor: secondaryColor,
                  transform: "scale(1.02)",
                },
                transition: "transform 0.2s ease-in-out",
              }}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </ProfessionalButton>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyCode}>
            <Typography
              sx={{
                mb: 3,
                color: "black",
                fontSize: "15px",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              We've sent a 6-digit verification code to{" "}
              <strong>{userEmail}</strong>. Please check your email and enter
              the code below.
            </Typography>
            <ModernTextField
              type="text"
              name="verificationCode"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              fullWidth
              value={formData.verificationCode}
              onChange={handleChanges}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.5rem",
                },
              }}
              sx={{
                mb: 3,
              }}
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <ProfessionalButton
                onClick={() => setCurrentStep(0)}
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.8,
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontWeight: "normal",
                  "&:hover": {
                    borderColor: secondaryColor,
                    backgroundColor: accentColor,
                  },
                }}
              >
                Back
              </ProfessionalButton>
              <ProfessionalButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<VerifiedUserOutlined />}
                sx={{
                  py: 1.8,
                  fontWeight: "normal",
                  bgcolor: primaryColor,
                  color: "white",
                  "&:hover": {
                    bgcolor: secondaryColor,
                    transform: "scale(1.02)",
                  },
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </ProfessionalButton>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box
            component="form"
            onSubmit={handleResetPassword}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                mb: 3,
                color: "black",
                fontSize: "15px",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Create a strong password for your account. Make sure it's at least
              6 characters long.
            </Typography>

            <ModernTextField
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              label="New Password"
              value={formData.newPassword}
              onChange={handleChanges}
              sx={{
                mb: 2,
                width: "100%",
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
              }}
            />

            <ModernTextField
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChanges}
              sx={{
                mb: 2,
                width: "100%",
              }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: primaryColor }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={passwordConfirmed}
                  onChange={(e) => setPasswordConfirmed(e.target.checked)}
                  sx={{
                    color: primaryColor,
                    "&.Mui-checked": { color: primaryColor },
                  }}
                />
              }
              label="I confirm that I want to change my password"
              sx={{ mb: 3, textAlign: "center", width: "100%" }}
            />

            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <ProfessionalButton
                onClick={() => setCurrentStep(1)}
                variant="outlined"
                fullWidth
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.8,
                  color: primaryColor,
                  borderColor: primaryColor,
                  fontWeight: "normal",
                  "&:hover": {
                    borderColor: secondaryColor,
                    backgroundColor: accentColor,
                  },
                }}
              >
                Back
              </ProfessionalButton>
              <ProfessionalButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={!passwordConfirmed || loading}
                startIcon={<LockResetOutlined />}
                sx={{
                  py: 1.8,
                  fontWeight: "normal",
                  bgcolor: primaryColor,
                  color: "white",
                  "&:hover": {
                    bgcolor: secondaryColor,
                    transform: "scale(1.02)",
                  },
                  transition: "transform 0.2s ease-in-out",
                  "&:disabled": { bgcolor: "#cccccc" },
                }}
              >
                {loading ? "Updating..." : "Update Password"}
              </ProfessionalButton>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        py: 4,
        borderRadius: "14px",
        width: "100vw", // Full viewport width
        mx: "auto", // Center horizontally
        maxWidth: "100%", // Ensure it doesn't exceed viewport
        overflow: "hidden", // Prevent horizontal scroll
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)", // Center the element
      }}
    >
      {/* Wider Container */}
      <Box sx={{ px: 6, mx: "auto", maxWidth: "1600px" }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard
              sx={{
                background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                border: `1px solid ${alpha(primaryColor, 0.1)}`,
                "&:hover": {
                  boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${backgroundColor} 100%)`,
                  color: textPrimaryColor,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: `radial-gradient(circle, ${alpha(
                      primaryColor,
                      0.1
                    )} 0%, ${alpha(primaryColor, 0)} 70%)`,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -30,
                    left: "30%",
                    width: 150,
                    height: 150,
                    background: `radial-gradient(circle, ${alpha(
                      primaryColor,
                      0.08
                    )} 0%, ${alpha(primaryColor, 0)} 70%)`,
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
                        bgcolor: alpha(primaryColor, 0.15),
                        mr: 4,
                        width: 64,
                        height: 64,
                        boxShadow: `0 8px 24px ${alpha(primaryColor, 0.15)}`,
                      }}
                    >
                      <SettingsIcon
                        sx={{ color: textPrimaryColor, fontSize: 32 }}
                      />
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
                        Settings & Configuration
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.8,
                          fontWeight: 400,
                          color: textPrimaryColor,
                        }}
                      >
                        Manage your account settings and system preferences
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {userRole !== "staff" && (
                      <ProfessionalButton
                        variant="contained"
                        startIcon={<PeopleIcon />}
                        onClick={() => navigate("/users-list")}
                        sx={{
                          bgcolor: primaryColor,
                          color: "white",
                          px: 3,
                          py: 1.5,
                          "&:hover": {
                            bgcolor: secondaryColor,
                          },
                        }}
                      >
                        User Management
                      </ProfessionalButton>
                    )}
                    <ProfessionalButton
                      variant="outlined"
                      startIcon={<Logout />}
                      onClick={handleLogout}
                      sx={{
                        color: primaryColor,
                        borderColor: primaryColor,
                        px: 3,
                        py: 1.5,
                        "&:hover": {
                          borderColor: secondaryColor,
                          backgroundColor: `${primaryColor}08`,
                        },
                      }}
                    >
                      Logout
                    </ProfessionalButton>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: accentColor,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: textPrimaryColor }}>
              Processing...
            </Typography>
          </Box>
        </Backdrop>

        {errMessage && (
          <Fade in timeout={300}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                "& .MuiAlert-message": { fontWeight: 500 },
              }}
            >
              {errMessage}
            </Alert>
          </Fade>
        )}

        {successMessage && (
          <Fade in timeout={300}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 3,
                "& .MuiAlert-message": { fontWeight: 500 },
              }}
            >
              {successMessage}
            </Alert>
          </Fade>
        )}

        {/* Main Grid Layout */}
        <Grid container spacing={3}>
          {/* Left Column - Navigation Cards */}
          <Grid item xs={12} md={3}>
            <Box
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Quick Actions */}
              <GlassCard
                sx={{
                  mb: 2,
                  background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                  boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                  border: `1px solid ${alpha(primaryColor, 0.1)}`,
                  "&:hover": {
                    boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                  },
                  flex: "0 0 auto",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 2,
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      color: "white",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Security
                    </Typography>
                  </Box>
                  <List sx={{ p: 0 }}>
                    <ListItemButton
                      onClick={() => setActiveSection("password")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "password"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <VpnKey sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Change Password"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "password"
                              ? primaryColor
                              : "#333",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      onClick={() => setActiveSection("email")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "email"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <EmailOutlined sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Settings"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "email" ? primaryColor : "#333",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      onClick={() => setActiveSection("security")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "security"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Shield sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Security"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "security"
                              ? primaryColor
                              : "#333",
                        }}
                      />
                    </ListItemButton>
                    {userRole === "superadmin" && (
                      <ListItemButton
                        onClick={() => setActiveSection("admin")}
                        sx={{
                          px: 3,
                          py: 2,
                          backgroundColor:
                            activeSection === "admin"
                              ? `${primaryColor}10`
                              : "transparent",
                          "&:hover": {
                            backgroundColor: `${primaryColor}05`,
                          },
                        }}
                      >
                        <ListItemIcon>
                          <SecurityOutlined sx={{ color: primaryColor }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="Admin Security"
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color:
                              activeSection === "admin" ? primaryColor : "#333",
                          }}
                        />
                      </ListItemButton>
                    )}
                  </List>
                </CardContent>
              </GlassCard>

              {/* Information */}
              <GlassCard
                sx={{
                  background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                  boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                  border: `1px solid ${alpha(primaryColor, 0.1)}`,
                  "&:hover": {
                    boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                  },
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 0,
                    flex: "1 1 auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      color: "white",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Information
                    </Typography>
                  </Box>
                  <List sx={{ p: 0, flex: "1 1 auto" }}>
                    <ListItemButton
                      onClick={() => setActiveSection("about")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "about"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Business sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="About Us"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "about" ? primaryColor : "#333",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      onClick={() => setActiveSection("faqs")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "faqs"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <QuestionAnswer sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="FAQs"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "faqs" ? primaryColor : "#333",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      onClick={() => setActiveSection("policy")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "policy"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Policy sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Policies"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "policy" ? primaryColor : "#333",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      onClick={() => setActiveSection("contact")}
                      sx={{
                        px: 3,
                        py: 2,
                        backgroundColor:
                          activeSection === "contact"
                            ? `${primaryColor}10`
                            : "transparent",
                        "&:hover": {
                          backgroundColor: `${primaryColor}05`,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <ContactSupport sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Contact Us"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color:
                            activeSection === "contact" ? primaryColor : "#333",
                        }}
                      />
                    </ListItemButton>
                  </List>
                </CardContent>
              </GlassCard>
            </Box>
          </Grid>

          {/* Right Column - Content Area */}
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Password Section */}
              {activeSection === "password" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <VpnKey sx={{ fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Change Password
                      </Typography>
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                      >
                        Keep your account secure by regularly updating your
                        password. Follow the steps below to change it.
                      </Typography>
                      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel
                              StepIconProps={{
                                sx: {
                                  "&.Mui-active": { color: primaryColor },
                                  "&.Mui-completed": { color: primaryColor },
                                },
                              }}
                            >
                              {label}
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: "#f8f9fa",
                          border: `1px dashed ${primaryColor}30`,
                        }}
                      >
                        {renderStepContent()}
                      </Box>
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* Email Section */}
              {activeSection === "email" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <EmailOutlined sx={{ fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Email Settings
                      </Typography>
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                      >
                        Update your email address. You'll receive important
                        notifications and verification codes at this address.
                      </Typography>

                      <ModernTextField
                        fullWidth
                        label="Current Email"
                        value={userEmail}
                        disabled
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlined sx={{ color: primaryColor }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <ModernTextField
                        fullWidth
                        label="New Email Address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter your new email"
                        sx={{ mb: 3 }}
                        required
                        helperText="Enter the email address you want to use"
                      />

                      <ModernTextField
                        fullWidth
                        label="Confirm New Email Address"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder="Re-enter your new email"
                        sx={{ mb: 3 }}
                        required
                        helperText="Re-enter the same email to confirm"
                      />

                      <ProfessionalButton
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.8,
                          fontSize: "1rem",
                          fontWeight: 600,
                          bgcolor: primaryColor,
                          color: "white",
                          "&:hover": {
                            bgcolor: secondaryColor,
                            transform: "scale(1.02)",
                          },
                          transition: "transform 0.2s ease-in-out",
                        }}
                        onClick={handleUpdateEmail}
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Email"}
                      </ProfessionalButton>
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Shield sx={{ fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Multi-Factor Authentication (MFA/OTP)
                      </Typography>
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                      >
                        Multi-Factor Authentication adds an extra layer of
                        security to your account. When enabled, you'll receive a
                        verification code via email every time you log in.
                      </Typography>

                      <GlassCard
                        sx={{
                          mb: 3,
                          backgroundColor: "white",
                          border: `2px solid ${primaryColor}40`,
                          borderRadius: 2,
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: primaryColor,
                                  fontWeight: 600,
                                  mb: 1,
                                }}
                              >
                                Enable MFA/OTP on Login
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#666" }}
                              >
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
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                  {
                                    backgroundColor: primaryColor,
                                  },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </GlassCard>

                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: "#f8f9fa",
                          border: `1px solid ${primaryColor}20`,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: primaryColor,
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          How it works:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", lineHeight: 1.8 }}
                        >
                          • When MFA is enabled, after entering your password,
                          you'll receive a 6-digit code via email
                          <br />
                          • Enter this code to complete your login
                          <br />
                          • The code expires after 15 minutes
                          <br />• You can disable MFA anytime from this page
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* Admin Security Section */}
              {activeSection === "admin" && userRole === "superadmin" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <SecurityOutlined sx={{ fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Confidential Password Management
                      </Typography>
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                      >
                        This password is required for sensitive operations such
                        as deleting payroll records and viewing audit logs. Only
                        superadmin can create or update this password.
                      </Typography>

                      {passwordInfo && (
                        <Box
                          sx={{
                            mb: 3,
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: "#f8f9fa",
                            border: `1px solid ${primaryColor}30`,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#333", mb: 1 }}
                          >
                            <strong>Status:</strong>{" "}
                            {passwordExists
                              ? "Password is set"
                              : "No password set"}
                          </Typography>
                          {passwordInfo.created_at && (
                            <Typography
                              variant="body2"
                              sx={{ color: "#333", mb: 1 }}
                            >
                              <strong>Created:</strong>{" "}
                              {new Date(
                                passwordInfo.created_at
                              ).toLocaleString()}
                            </Typography>
                          )}
                          {passwordInfo.updated_at && (
                            <Typography variant="body2" sx={{ color: "#333" }}>
                              <strong>Last Updated:</strong>{" "}
                              {new Date(
                                passwordInfo.updated_at
                              ).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      )}

                      <ModernTextField
                        type={showConfidentialPassword ? "text" : "password"}
                        label={
                          passwordExists
                            ? "New Confidential Password"
                            : "Confidential Password"
                        }
                        value={confidentialPassword}
                        onChange={(e) =>
                          setConfidentialPassword(e.target.value)
                        }
                        fullWidth
                        sx={{
                          mb: 3,
                        }}
                        required
                        helperText="Minimum 6 characters. This password will be required for sensitive operations."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityOutlined sx={{ color: primaryColor }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfidentialPassword(
                                    !showConfidentialPassword
                                  )
                                }
                                edge="end"
                              >
                                {showConfidentialPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <ModernTextField
                        type={showConfidentialPassword ? "text" : "password"}
                        label="Confirm Confidential Password"
                        value={confirmConfidentialPassword}
                        onChange={(e) =>
                          setConfirmConfidentialPassword(e.target.value)
                        }
                        fullWidth
                        sx={{
                          mb: 3,
                        }}
                        required
                        helperText="Re-enter password to confirm"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityOutlined sx={{ color: primaryColor }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfidentialPassword(
                                    !showConfidentialPassword
                                  )
                                }
                                edge="end"
                              >
                                {showConfidentialPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <ProfessionalButton
                        fullWidth
                        variant="contained"
                        onClick={handleConfidentialPasswordSubmit}
                        disabled={
                          loading ||
                          !confidentialPassword ||
                          !confirmConfidentialPassword
                        }
                        startIcon={<SecurityOutlined />}
                        sx={{
                          py: 1.8,
                          fontSize: "1rem",
                          fontWeight: 600,
                          bgcolor: primaryColor,
                          color: "white",
                          "&:hover": {
                            bgcolor: secondaryColor,
                            transform: "scale(1.02)",
                          },
                          transition: "transform 0.2s ease-in-out",
                          "&:disabled": { bgcolor: "#cccccc" },
                        }}
                      >
                        {loading
                          ? "Saving..."
                          : passwordExists
                          ? "Update Confidential Password"
                          : "Create Confidential Password"}
                      </ProfessionalButton>

                      <Box
                        sx={{
                          mt: 3,
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: "#f8f9fa",
                          border: `1px solid ${primaryColor}20`,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: primaryColor,
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          Important Notes:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#666", lineHeight: 1.8 }}
                        >
                          • This password is required when deleting payroll
                          records
                          <br />
                          • This password is required when viewing audit logs
                          <br />
                          • Only superadmin can create or update this password
                          <br />• Make sure to remember this password or store
                          it securely
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* About Us Section */}
              {activeSection === "about" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Business sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          About Us
                        </Typography>
                      </Box>
                      {(userRole === "superadmin" ||
                        userRole === "administrator") && (
                        <ProfessionalButton
                          variant={aboutUsEditMode ? "outlined" : "contained"}
                          startIcon={aboutUsEditMode ? <Cancel /> : <Edit />}
                          onClick={() => {
                            if (aboutUsEditMode) {
                              setAboutUsEditMode(false);
                            } else {
                              handleEditAboutUs();
                            }
                          }}
                          sx={{
                            bgcolor: aboutUsEditMode ? "transparent" : "white",
                            color: aboutUsEditMode ? "white" : primaryColor,
                            borderColor: "white",
                            "&:hover": {
                              bgcolor: aboutUsEditMode
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(255,255,255,0.9)",
                            },
                          }}
                        >
                          {aboutUsEditMode ? "Cancel" : "Edit"}
                        </ProfessionalButton>
                      )}
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      {aboutUsEditMode ? (
                        <Box>
                          <ModernTextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={aboutUsForm.title}
                            onChange={handleAboutUsFormChange}
                            sx={{ mb: 3 }}
                            required
                          />
                          <ModernTextField
                            fullWidth
                            label="Content (HTML supported)"
                            name="content"
                            value={aboutUsForm.content}
                            onChange={handleAboutUsFormChange}
                            multiline
                            rows={12}
                            sx={{ mb: 3 }}
                            required
                            helperText="You can use HTML tags for formatting"
                          />
                          <ModernTextField
                            fullWidth
                            label="Version"
                            name="version"
                            value={aboutUsForm.version}
                            onChange={handleAboutUsFormChange}
                            sx={{ mb: 3 }}
                            placeholder="e.g., 1.0.0"
                          />
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <ProfessionalButton
                              variant="outlined"
                              onClick={() => setAboutUsEditMode(false)}
                              sx={{
                                borderColor: primaryColor,
                                color: primaryColor,
                                "&:hover": {
                                  borderColor: secondaryColor,
                                  bgcolor: `${primaryColor}10`,
                                },
                              }}
                            >
                              Cancel
                            </ProfessionalButton>
                            <ProfessionalButton
                              variant="contained"
                              onClick={handleSaveAboutUs}
                              disabled={loading}
                              startIcon={<Save />}
                              sx={{
                                bgcolor: primaryColor,
                                color: "white",
                                "&:hover": {
                                  bgcolor: secondaryColor,
                                },
                              }}
                            >
                              {loading ? "Saving..." : "Save"}
                            </ProfessionalButton>
                          </Box>
                        </Box>
                      ) : aboutUs ? (
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{
                              color: primaryColor,
                              fontWeight: 600,
                              mb: 3,
                            }}
                          >
                            {aboutUs.title}
                          </Typography>
                          <Box
                            sx={{
                              color: "#333",
                              "& h2": { color: primaryColor, mt: 3, mb: 2 },
                              "& h3": { color: primaryColor, mt: 3, mb: 2 },
                              "& h4": { color: primaryColor, mt: 3, mb: 2 },
                              "& p": { mb: 2, lineHeight: 1.8 },
                              "& ul": { pl: 3, mb: 2 },
                              "& li": { mb: 1 },
                            }}
                            dangerouslySetInnerHTML={{
                              __html: aboutUs.content,
                            }}
                          />
                          {aboutUs.version && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                display: "block",
                                mt: 3,
                              }}
                            >
                              Version: {aboutUs.version}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{ color: "#666", textAlign: "center", py: 4 }}
                        >
                          Loading About Us content...
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* FAQs Section */}
              {activeSection === "faqs" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <QuestionAnswer sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Frequently Asked Questions (FAQs)
                        </Typography>
                      </Box>
                      {(userRole === "superadmin" ||
                        userRole === "administrator") && (
                        <ProfessionalButton
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => handleOpenFaqDialog()}
                          sx={{
                            bgcolor: "white",
                            color: primaryColor,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.9)",
                            },
                          }}
                        >
                          Add FAQ
                        </ProfessionalButton>
                      )}
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                      >
                        Find answers to common questions about using the system.
                      </Typography>

                      {faqs.length > 0 ? (
                        <Box>
                          {faqs.map((faq) => (
                            <Accordion
                              key={faq.id}
                              sx={{
                                mb: 2,
                                backgroundColor: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                "&:before": { display: "none" },
                                border: `1px solid ${primaryColor}20`,
                              }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon
                                    sx={{ color: primaryColor }}
                                  />
                                }
                                sx={{
                                  "& .MuiAccordionSummary-content": {
                                    alignItems: "center",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <HelpOutlineIcon
                                    sx={{ color: primaryColor, mr: 2 }}
                                  />
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: "#333",
                                      fontWeight: 500,
                                      flex: 1,
                                      fontSize: "1rem",
                                    }}
                                  >
                                    {faq.question}
                                  </Typography>
                                  {faq.category && (
                                    <Chip
                                      label={faq.category}
                                      size="small"
                                      sx={{
                                        bgcolor: `${primaryColor}20`,
                                        color: primaryColor,
                                        fontWeight: 500,
                                        mr: 1,
                                      }}
                                    />
                                  )}
                                  {(userRole === "superadmin" ||
                                    userRole === "administrator") && (
                                    <Box
                                      sx={{ display: "flex", gap: 1, ml: 1 }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenFaqDialog(faq);
                                        }}
                                        sx={{ color: primaryColor }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteFaq(faq.id);
                                        }}
                                        sx={{ color: "#d32f2f" }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  )}
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#666",
                                    lineHeight: 1.8,
                                    pl: 5,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {faq.answer}
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{ color: "#666", textAlign: "center", py: 4 }}
                        >
                          No FAQs available at the moment.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* Policy Section */}
              {activeSection === "policy" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Policy sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Policies & Terms
                        </Typography>
                      </Box>
                      {(userRole === "superadmin" ||
                        userRole === "administrator") && (
                        <ProfessionalButton
                          variant="contained"
                          startIcon={<Edit />}
                          onClick={() => handleOpenPolicyDialog()}
                          sx={{
                            bgcolor: "white",
                            color: primaryColor,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.9)",
                            },
                          }}
                        >
                          Add Policy
                        </ProfessionalButton>
                      )}
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                      >
                        View and manage our policies, terms of service, and
                        legal documents.
                      </Typography>

                      {policies.length > 0 ? (
                        <Box>
                          {policies.map((policy) => (
                            <Accordion
                              key={policy.id}
                              sx={{
                                mb: 2,
                                backgroundColor: "white",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                "&:before": { display: "none" },
                                border: `1px solid ${primaryColor}20`,
                              }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon
                                    sx={{ color: primaryColor }}
                                  />
                                }
                                sx={{
                                  "& .MuiAccordionSummary-content": {
                                    alignItems: "center",
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Policy sx={{ color: primaryColor, mr: 2 }} />
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: "#333",
                                      fontWeight: 500,
                                      flex: 1,
                                      fontSize: "1rem",
                                    }}
                                  >
                                    {policy.title}
                                  </Typography>
                                  {policy.category && (
                                    <Chip
                                      label={
                                        policy.category
                                          .charAt(0)
                                          .toUpperCase() +
                                        policy.category.slice(1)
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: `${primaryColor}20`,
                                        color: primaryColor,
                                        fontWeight: 500,
                                        mr: 1,
                                      }}
                                    />
                                  )}
                                  {policy.version && (
                                    <Chip
                                      label={`v${policy.version}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: primaryColor,
                                        color: primaryColor,
                                        fontWeight: 500,
                                        mr: 1,
                                      }}
                                    />
                                  )}
                                  {(userRole === "superadmin" ||
                                    userRole === "administrator") && (
                                    <Box
                                      sx={{ display: "flex", gap: 1, ml: 1 }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenPolicyDialog(policy);
                                        }}
                                        sx={{ color: primaryColor }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePolicy(policy.id);
                                        }}
                                        sx={{ color: "#d32f2f" }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  )}
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box
                                  sx={{
                                    color: "#333",
                                    "& h2": {
                                      color: primaryColor,
                                      mt: 3,
                                      mb: 2,
                                      fontSize: "1.3rem",
                                    },
                                    "& h3": {
                                      color: primaryColor,
                                      mt: 3,
                                      mb: 2,
                                      fontSize: "1.1rem",
                                    },
                                    "& h4": {
                                      color: primaryColor,
                                      mt: 3,
                                      mb: 2,
                                      fontSize: "1rem",
                                    },
                                    "& p": {
                                      mb: 2,
                                      lineHeight: 1.8,
                                      fontSize: "0.95rem",
                                    },
                                    "& ul": { pl: 3, mb: 2 },
                                    "& li": { mb: 1, fontSize: "0.95rem" },
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: policy.content,
                                  }}
                                />
                                {policy.updated_at && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      display: "block",
                                      mt: 3,
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Last updated:{" "}
                                    {new Date(
                                      policy.updated_at
                                    ).toLocaleString()}
                                  </Typography>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{ color: "#666", textAlign: "center", py: 4 }}
                        >
                          No policies available at the moment.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </GlassCard>
              )}

              {/* Contact Us Section */}
              {activeSection === "contact" && (
                <GlassCard
                  sx={{
                    background: `rgba(${hexToRgb(accentColor)}, 0.95)`,
                    boxShadow: `0 8px 40px ${alpha(primaryColor, 0.08)}`,
                    border: `1px solid ${alpha(primaryColor, 0.1)}`,
                    "&:hover": {
                      boxShadow: `0 12px 48px ${alpha(primaryColor, 0.15)}`,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <ContactSupport sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          Contact Us
                        </Typography>
                      </Box>
                      {(userRole === "superadmin" ||
                        userRole === "administrator") && (
                        <Badge
                          badgeContent={
                            contactSubmissions.filter((s) => s.status === "new")
                              .length
                          }
                          color="error"
                        >
                          <ProfessionalButton
                            variant="contained"
                            onClick={() => {
                              setShowContactSubmissions(
                                !showContactSubmissions
                              );
                              if (!showContactSubmissions) {
                                fetchContactSubmissions();
                              }
                            }}
                            sx={{
                              bgcolor: "white",
                              color: textSecondaryColor,
                              "&:hover": {
                                bgcolor: "backgroundColor,",
                              },
                            }}
                          >
                            {showContactSubmissions
                              ? "New Message"
                              : "View Tickets"}
                          </ProfessionalButton>
                        </Badge>
                      )}
                    </Box>
                    <Box sx={{ p: 4, flex: "1 1 auto", overflow: "auto" }}>
                      {(userRole === "superadmin" ||
                        userRole === "administrator") &&
                      showContactSubmissions ? (
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                          >
                            View and manage contact submissions from employees.
                          </Typography>
                          {contactSubmissions.length > 0 ? (
                            <TableContainer
                              component={Paper}
                              sx={{ mb: 3, boxShadow: "none" }}
                            >
                              <Table>
                                <TableHead>
                                  <TableRow
                                    sx={{ bgcolor: `${primaryColor}10` }}
                                  >
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: primaryColor,
                                      }}
                                    >
                                      Name
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: primaryColor,
                                      }}
                                    >
                                      Email
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: primaryColor,
                                      }}
                                    >
                                      Subject
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: primaryColor,
                                      }}
                                    >
                                      Date
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: primaryColor,
                                      }}
                                    >
                                      Status
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontWeight: 600,
                                        color: primaryColor,
                                      }}
                                    >
                                      Actions
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {contactSubmissions.map((submission) => (
                                    <TableRow key={submission.id} hover>
                                      <TableCell>{submission.name}</TableCell>
                                      <TableCell>{submission.email}</TableCell>
                                      <TableCell>
                                        {submission.subject || "No subject"}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          submission.created_at
                                        ).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={submission.status}
                                          size="small"
                                          sx={{
                                            bgcolor:
                                              submission.status === "new"
                                                ? "#ff9800"
                                                : submission.status === "read"
                                                ? "#2196f3"
                                                : submission.status ===
                                                  "replied"
                                                ? "#4caf50"
                                                : "#9e9e9e",
                                            color: "white",
                                            textTransform: "capitalize",
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setSelectedSubmission(submission);
                                            setAdminReply(
                                              submission.admin_notes || ""
                                            );
                                            setSubmissionDialogOpen(true);
                                          }}
                                          sx={{ color: primaryColor }}
                                        >
                                          <VisibilityIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                color: "#666",
                                textAlign: "center",
                                py: 4,
                              }}
                            >
                              No contact submissions found.
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ mb: 3, color: "#666", lineHeight: 1.6 }}
                          >
                            Have a question or feedback? Fill out the form below
                            and we'll get back to you as soon as possible.
                          </Typography>

                          <ModernTextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={contactForm.name}
                            onChange={handleContactFormChange}
                            sx={{ mb: 3 }}
                            required
                          />
                          <ModernTextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={
                              contactForm.email || "earisthrmstesting@gmail.com"
                            }
                            onChange={handleContactFormChange}
                            type="email"
                            sx={{ mb: 3 }}
                            required
                          />
                          <ModernTextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={contactForm.subject}
                            onChange={handleContactFormChange}
                            sx={{ mb: 3 }}
                          />
                          <ModernTextField
                            fullWidth
                            label="Message"
                            name="message"
                            value={contactForm.message}
                            onChange={handleContactFormChange}
                            multiline
                            rows={6}
                            sx={{ mb: 3 }}
                            required
                          />
                          <ProfessionalButton
                            fullWidth
                            variant="contained"
                            onClick={handleContactUsSubmit}
                            disabled={loading}
                            startIcon={<ContactSupport />}
                            sx={{
                              py: 1.8,
                              fontSize: "1rem",
                              fontWeight: 600,
                              bgcolor: primaryColor,
                              color: "white",
                              "&:hover": {
                                bgcolor: secondaryColor,
                                transform: "scale(1.02)",
                              },
                              transition: "transform 0.2s ease-in-out",
                              "&:disabled": { bgcolor: "#cccccc" },
                            }}
                          >
                            {loading ? "Sending..." : "Send Message"}
                          </ProfessionalButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </GlassCard>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Modals */}
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
          <GlassCard
            sx={{
              width: "90%",
              maxWidth: 500,
              p: 4,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <MarkEmailReadOutlined
              sx={{ fontSize: 80, color: primaryColor, mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: primaryColor,
              }}
            >
              Verification Code Sent
            </Typography>
            <Typography sx={{ color: "#333", mb: 3, lineHeight: 1.5 }}>
              A verification code has been sent to <strong>{userEmail}</strong>.
              Please check your inbox and enter the code to proceed.
            </Typography>
            <ProfessionalButton
              onClick={() => setShowVerificationModal(false)}
              variant="contained"
              fullWidth
              sx={{
                py: 1.8,
                fontSize: "1rem",
                fontWeight: 600,
                bgcolor: primaryColor,
                color: "white",
                "&:hover": { bgcolor: secondaryColor },
              }}
            >
              Okay
            </ProfessionalButton>
          </GlassCard>
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
          <GlassCard
            sx={{
              width: "90%",
              maxWidth: 500,
              p: 4,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <CheckCircleOutline
              sx={{ fontSize: 80, color: primaryColor, mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: primaryColor,
              }}
            >
              Password Changed Successfully!
            </Typography>
            <Typography sx={{ color: "#333", mb: 3, lineHeight: 1.5 }}>
              Your password has been successfully updated. You will be logged
              out shortly for security purposes.
            </Typography>
            <ProfessionalButton
              onClick={handleSuccessClose}
              variant="contained"
              fullWidth
              startIcon={<LockOutlined />}
              sx={{
                py: 1.8,
                fontSize: "1rem",
                fontWeight: 600,
                bgcolor: primaryColor,
                color: "white",
                "&:hover": { bgcolor: secondaryColor },
              }}
            >
              Continue
            </ProfessionalButton>
          </GlassCard>
        </Box>
      )}

      {/* FAQ Dialog */}
      <Dialog
        open={faqDialogOpen}
        onClose={() => setFaqDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: primaryColor,
            fontWeight: 600,
          }}
        >
          {editingFaq ? "Edit FAQ" : "Add New FAQ"}
          <IconButton onClick={() => setFaqDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ModernTextField
            fullWidth
            label="Question"
            name="question"
            value={faqForm.question}
            onChange={handleFaqFormChange}
            sx={{ mb: 2, mt: 2 }}
            required
          />
          <ModernTextField
            fullWidth
            label="Answer"
            name="answer"
            value={faqForm.answer}
            onChange={handleFaqFormChange}
            multiline
            rows={4}
            sx={{ mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={faqForm.category}
              onChange={handleFaqFormChange}
              label="Category"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="password">Password</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="account">Account</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <ModernTextField
            fullWidth
            type="number"
            label="Display Order"
            name="display_order"
            value={faqForm.display_order}
            onChange={handleFaqFormChange}
            sx={{ mb: 2 }}
            inputProps={{ min: 0 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="is_active"
                checked={faqForm.is_active}
                onChange={handleFaqFormChange}
                sx={{
                  color: primaryColor,
                  "&.Mui-checked": { color: primaryColor },
                }}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <ProfessionalButton
            onClick={() => setFaqDialogOpen(false)}
            sx={{
              color: primaryColor,
              fontWeight: 500,
            }}
          >
            Cancel
          </ProfessionalButton>
          <ProfessionalButton
            onClick={handleSaveFaq}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: primaryColor,
              color: "white",
              fontWeight: 600,
              "&:hover": {
                bgcolor: secondaryColor,
              },
            }}
          >
            {loading ? "Saving..." : "Save"}
          </ProfessionalButton>
        </DialogActions>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog
        open={policyDialogOpen}
        onClose={() => setPolicyDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: primaryColor,
            fontWeight: 600,
          }}
        >
          {editingPolicy ? "Edit Policy" : "Add New Policy"}
          <IconButton onClick={() => setPolicyDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ModernTextField
            fullWidth
            label="Title"
            name="title"
            value={policyForm.title}
            onChange={handlePolicyFormChange}
            sx={{ mb: 2, mt: 2 }}
            required
          />
          <ModernTextField
            fullWidth
            label="Content (HTML supported)"
            name="content"
            value={policyForm.content}
            onChange={handlePolicyFormChange}
            multiline
            rows={8}
            sx={{ mb: 2 }}
            required
            helperText="You can use HTML tags for formatting. Version will be auto-generated."
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={policyForm.category}
              onChange={handlePolicyFormChange}
              label="Category"
            >
              <MenuItem value="privacy">Privacy Policy</MenuItem>
              <MenuItem value="terms">Terms of Service</MenuItem>
              <MenuItem value="data">Data Protection</MenuItem>
              <MenuItem value="security">Security Policy</MenuItem>
              <MenuItem value="general">General Policy</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <ModernTextField
            fullWidth
            type="number"
            label="Display Order"
            name="display_order"
            value={policyForm.display_order}
            onChange={handlePolicyFormChange}
            sx={{ mb: 2 }}
            inputProps={{ min: 0 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="is_active"
                checked={policyForm.is_active}
                onChange={handlePolicyFormChange}
                sx={{
                  color: primaryColor,
                  "&.Mui-checked": { color: primaryColor },
                }}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <ProfessionalButton
            onClick={() => setPolicyDialogOpen(false)}
            sx={{
              color: primaryColor,
              fontWeight: 500,
            }}
          >
            Cancel
          </ProfessionalButton>
          <ProfessionalButton
            onClick={handleSavePolicy}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: primaryColor,
              color: "white",
              fontWeight: 600,
              "&:hover": {
                bgcolor: secondaryColor,
              },
            }}
          >
            {loading ? "Saving..." : "Save"}
          </ProfessionalButton>
        </DialogActions>
      </Dialog>

      {/* Contact Submission Dialog */}
      <Dialog
        open={submissionDialogOpen}
        onClose={() => setSubmissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: primaryColor,
            fontWeight: 600,
          }}
        >
          Contact Submission Details
          <IconButton onClick={() => setSubmissionDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ color: primaryColor, mb: 1, mt: 2, fontWeight: 600 }}
              >
                From:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedSubmission.name} ({selectedSubmission.email})
              </Typography>
              {selectedSubmission.employee_number && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
                  >
                    Employee Number:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedSubmission.employee_number}
                  </Typography>
                </>
              )}
              <Typography
                variant="subtitle1"
                sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
              >
                Subject:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedSubmission.subject || "No subject"}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
              >
                Message:
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, whiteSpace: "pre-wrap" }}
              >
                {selectedSubmission.message}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
              >
                Status:
              </Typography>
              <Chip
                label={selectedSubmission.status}
                size="small"
                sx={{
                  bgcolor:
                    selectedSubmission.status === "new"
                      ? "#ff9800"
                      : selectedSubmission.status === "read"
                      ? "#2196f3"
                      : selectedSubmission.status === "replied"
                      ? "#4caf50"
                      : "#9e9e9e",
                  color: "white",
                  textTransform: "capitalize",
                  mb: 2,
                }}
              />
              <Typography
                variant="subtitle1"
                sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
              >
                Submitted:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {new Date(selectedSubmission.created_at).toLocaleString()}
              </Typography>
              {selectedSubmission.admin_notes && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
                  >
                    Admin Response:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f8f9fa",
                      border: `1px solid ${primaryColor}30`,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", color: "#333" }}
                    >
                      {selectedSubmission.admin_notes}
                    </Typography>
                  </Box>
                </>
              )}
              <Divider sx={{ my: 2 }} />

              {(userRole === "superadmin" || userRole === "administrator") && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: primaryColor, mb: 1, fontWeight: 600 }}
                  >
                    Reply to Ticket:
                  </Typography>
                  <ModernTextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Reply"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="Type your response here..."
                    sx={{ mb: 2 }}
                    helperText="Your reply will be sent to the ticket submitter"
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      value={selectedSubmission.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedSubmission((prev) => ({
                          ...prev,
                          status: newStatus,
                        }));
                        handleUpdateSubmissionStatus(
                          selectedSubmission.id,
                          newStatus,
                          adminReply || selectedSubmission.admin_notes
                        );
                      }}
                      label="Update Status"
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="read">Read</MenuItem>
                      <MenuItem value="replied">Replied</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <ProfessionalButton
            onClick={() => {
              setSubmissionDialogOpen(false);
              setAdminReply("");
            }}
            sx={{
              color: primaryColor,
              fontWeight: 500,
            }}
          >
            Close
          </ProfessionalButton>
          {(userRole === "superadmin" || userRole === "administrator") && (
            <ProfessionalButton
              onClick={() => {
                if (adminReply.trim()) {
                  handleUpdateSubmissionStatus(
                    selectedSubmission.id,
                    "replied",
                    adminReply
                  );
                }
              }}
              variant="contained"
              disabled={loading || !adminReply.trim()}
              startIcon={<Save />}
              sx={{
                bgcolor: primaryColor,
                color: "white",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: secondaryColor,
                },
                "&:disabled": {
                  bgcolor: "#cccccc",
                },
              }}
            >
              {loading ? "Sending..." : "Send Reply"}
            </ProfessionalButton>
          )}
        </DialogActions>
      </Dialog>

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
                  color: "white",
                  animation: "heartbeat 1s infinite",
                }}
              />
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{
              mt: 3,
              fontWeight: 600,
              color: "white",
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
