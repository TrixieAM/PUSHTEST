import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';
import {
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Container,
  Button,
  Modal,
  TextField,
  Chip,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  useTheme,
  alpha,
  Backdrop,
  Tabs,
  Tab,
  useMediaQuery,
  Fab,
  Snackbar,
  SnackbarContent,
  useScrollTrigger,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText as MuiListItemText,
  ListItemIcon as MuiListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import WorkIcon from '@mui/icons-material/Work';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ExitToApp } from '@mui/icons-material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PercentIcon from '@mui/icons-material/Percent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BookIcon from '@mui/icons-material/Book';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoIcon from '@mui/icons-material/Info';
import ConstructionIcon from '@mui/icons-material/Construction';

// HR Professional Color Palette - Enhanced for readability
const colors = {
  primary: '#6d2323',
  primaryLight: '#8a2e2e',
  primaryDark: '#4a1818',
  secondary: '#f5f5dc',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textLight: '#ffffff',
  background: '#f8f9fa',
  surface: '#ffffff',
  border: '#d0d0d0',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  gradientPrimary: 'linear-gradient(135deg, #6d2323 0%, #8a2e2e 100%)',
  sectionBg: '#ffffff',
  sectionBorder: '#e8e8e8',
};

const shadows = {
  light: '0 2px 8px rgba(0,0,0,0.08)',
  medium: '0 4px 16px rgba(0,0,0,0.12)',
  heavy: '0 8px 24px rgba(0,0,0,0.16)',
  colored: '0 4px 16px rgba(109, 35, 35, 0.2)',
};

const ProfileContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(6),
  minHeight: '100vh',
  backgroundColor: colors.background,
  fontFamily: '"Roboto", "Arial", sans-serif',
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  background: colors.surface,
  border: `2px solid ${colors.primary}`,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const ProfileAvatarContainer = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(4),
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    marginRight: 0,
    marginBottom: theme.spacing(3),
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(24),
  height: theme.spacing(24),
  border: `4px solid ${colors.surface}`,
  boxShadow: shadows.medium,
  cursor: 'pointer',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: shadows.colored,
  },
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ProfileName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  color: colors.textPrimary,
  marginBottom: theme.spacing(0.5),
  transition: 'color 0.3s ease',
  '&:hover': {
    color: colors.primary,
  },
}));

const ProfileSubtitle = styled(Typography)(({ theme }) => ({
  color: colors.textSecondary,
  marginBottom: theme.spacing(2),
  fontSize: '1.1rem',
}));

const ProfileActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    flexWrap: 'wrap',
  },
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  background: colors.surface,
  border: `1px solid ${colors.sectionBorder}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.4rem',
  color: colors.primary,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `3px solid ${colors.primary}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: '#fafafa',
  border: `1px solid ${colors.border}`,
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: colors.textPrimary,
  minWidth: '200px',
  marginRight: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '1rem',
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: colors.textPrimary,
  flex: 1,
  fontWeight: 400,
  fontSize: '1rem',
}));

const TabContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minWidth: 'auto',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: colors.textLight,
    backgroundColor: colors.primary,
  },
  '&:not(.Mui-selected)': {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      color: colors.primary,
    },
  },
}));

const CustomTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.7),
  borderRadius: theme.spacing(3),
  padding: theme.spacing(0.5),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  marginBottom: theme.spacing(4),
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.2, 2.5),
  transition: 'all 0.3s ease',
  boxShadow: shadows.light,
  ...(variant === 'contained' && {
    background: colors.gradientPrimary,
    color: colors.textLight,
    '&:hover': {
      background: colors.primaryDark,
      transform: 'translateY(-2px)',
      boxShadow: shadows.medium,
    },
  }),
  ...(variant === 'outlined' && {
    color: colors.primary,
    borderColor: colors.primary,
    borderWidth: '2px',
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      borderColor: colors.primaryDark,
      transform: 'translateY(-2px)',
    },
  }),
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '900px',
  backgroundColor: colors.surface,
  borderRadius: theme.spacing(3),
  boxShadow: shadows.heavy,
  padding: 0,
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  background: colors.gradientPrimary,
  padding: theme.spacing(3, 4),
  color: colors.textLight,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
}));

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  overflowY: 'auto',
  flex: 1,
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    fontSize: '1rem',
    '& input': {
      fontSize: '1rem',
      padding: '14px 16px',
    },
    '& fieldset': {
      borderColor: colors.border,
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: colors.primaryLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    fontSize: '1rem',
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
}));

const ViewToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  fontWeight: 500,
  '&.Mui-selected': {
    backgroundColor: colors.primary,
    color: colors.textLight,
    '&:hover': {
      backgroundColor: colors.primaryDark,
    },
  },
}));

const ImagePreviewModal = styled(Modal)(({ theme }) => ({
  '& .MuiModal-backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
}));

const ImagePreviewContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '100%',
  maxHeight: '80vh',
}));

const PreviewImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '80vh',
  borderRadius: theme.spacing(2),
  boxShadow: shadows.heavy,
  objectFit: 'contain',
}));

const ImagePreviewActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: alpha(colors.surface, 0.9),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
}));

const ImagePreviewButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  '&:hover': {
    backgroundColor: colors.primary,
    color: colors.textLight,
  },
}));

const EditModalPictureSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: alpha(colors.secondary, 0.3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const EditModalAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  border: `3px solid ${colors.surface}`,
  boxShadow: shadows.medium,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const EditModalPictureInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const EditModalPictureActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  minHeight: '600px',
}));

const ViewWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.3s ease, visibility 0.3s ease',
  '&.active': {
    opacity: 1,
    visibility: 'visible',
  },
}));

const Notification = styled(SnackbarContent)(({ theme, variant }) => ({
  backgroundColor:
    variant === 'success'
      ? colors.success
      : variant === 'error'
      ? colors.error
      : variant === 'warning'
      ? colors.warning
      : colors.info,
  color: colors.textLight,
  fontWeight: 500,
  borderRadius: theme.spacing(2),
  boxShadow: shadows.medium,
}));

const FloatingButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: colors.gradientPrimary,
  color: colors.textLight,
  boxShadow: shadows.medium,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: shadows.colored,
  },
}));

const ChildCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const ChildListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const CollegeCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const CollegeListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const GraduateCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const GraduateListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  maxHeight: '500px',
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.primary,
    borderRadius: '3px',
  },
}));

const EducationSubTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.5),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const EducationSubTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: colors.textLight,
    backgroundColor: colors.primary,
  },
  '&:not(.Mui-selected)': {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      color: colors.primary,
    },
  },
}));

const EligibilityCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const EligibilityListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

// Learning and Development Card and ListItem
const LearningDevelopmentCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const LearningDevelopmentListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

// Other Information Card and ListItem
const OtherInformationCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const OtherInformationListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const VocationalCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const VocationalListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const WorkExperienceCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const WorkExperienceListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const StickyActionBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: colors.surface,
  padding: theme.spacing(2),
  borderBottom: `1px solid ${colors.border}`,
  zIndex: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

// Percentage Input Component
const PercentageInput = ({
  value,
  onChange,
  label,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // Remove any non-digit characters except for decimal point
    newValue = newValue.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      newValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Ensure value is between 0 and 100
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 100) {
      newValue = '100';
    }

    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 'bold', mb: 0.5, color: '#333', display: 'block' }}
      >
        {label}
      </Typography>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        placeholder="0.00"
        fullWidth
        size="small"
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <PercentIcon sx={{ color: '#6D2323' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: error ? 'red' : '#6D2323',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
          },
        }}
      />
    </Box>
  );
};

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [person, setPerson] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [editImageZoomOpen, setEditImageZoomOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const employeeNumber = localStorage.getItem('employeeNumber');
  const profileRef = useRef(null);

  // Children related state
  const [children, setChildren] = useState([]);
  const [childrenFormData, setChildrenFormData] = useState([]);

  // College related state
  const [colleges, setColleges] = useState([]);
  const [collegesFormData, setCollegesFormData] = useState([]);

  // Graduate studies related state
  const [graduates, setGraduates] = useState([]);
  const [graduatesFormData, setGraduatesFormData] = useState([]);

  // Eligibility related state
  const [eligibilities, setEligibilities] = useState([]);
  const [eligibilitiesFormData, setEligibilitiesFormData] = useState([]);

  // Learning and Development related state
  const [learningDevelopment, setLearningDevelopment] = useState([]);
  const [learningDevelopmentFormData, setLearningDevelopmentFormData] =
    useState([]);

  // Other Information related state
  const [otherInformation, setOtherInformation] = useState([]);
  const [otherInformationFormData, setOtherInformationFormData] = useState([]);

  // Education sub-tab state
  const [educationSubTabValue, setEducationSubTabValue] = useState(0);

  // Vocational related state
  const [vocational, setVocational] = useState([]);
  const [vocationalFormData, setVocationalFormData] = useState([]);

  const [workExperiences, setWorkExperiences] = useState([]);
  const [workExperiencesFormData, setWorkExperiencesFormData] = useState([]);

  // Voluntary Work related state
  const [voluntaryWork, setVoluntaryWork] = useState([]);
  const [voluntaryWorkFormData, setVoluntaryWorkFormData] = useState([]);

  // Fetch all data in parallel for better performance
  useEffect(() => {
    const fetchAllData = async () => {
      if (!employeeNumber) return;
      
      setLoading(true);
      try {
        // Fetch personal info using direct endpoint like PDS
        const personResponse = await axios.get(
          `${API_BASE_URL}/personalinfo/person_table/${employeeNumber}`,
          getAuthHeaders()
        );
        const personData = personResponse.data;
        setPerson(personData);

        if (personData) {
          setProfilePicture(personData.profile_picture);
          const formattedData = { ...personData };
          if (personData.birthDate) {
            const date = new Date(personData.birthDate);
            if (!isNaN(date.getTime())) {
              formattedData.birthDate = date.toISOString().split('T')[0];
            }
          }
          setFormData(formattedData);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setUploadStatus({
          message: 'Failed to load profile data',
          type: 'error',
        });
        setNotificationOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [employeeNumber]);

  // Fetch children data for current user
  useEffect(() => {
    const fetchChildren = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/ChildrenRoute/children-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const childrenData = Array.isArray(response.data) ? response.data : [];
        setChildren(childrenData);

        // Initialize form data with fetched children
        const formattedChildren = childrenData.map((child) => ({
          ...child,
          dateOfBirth: child.dateOfBirth ? child.dateOfBirth.split('T')[0] : '',
        }));
        setChildrenFormData(formattedChildren);
      } catch (error) {
        console.error('Error fetching children:', error);
        setChildren([]);
        setChildrenFormData([]);
      }
    };

    fetchChildren();
  }, [employeeNumber]);

  // Fetch college data for current user
  useEffect(() => {
    const fetchColleges = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/college/college-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const collegeData = Array.isArray(response.data) ? response.data : [];
        setColleges(collegeData);
        setCollegesFormData(collegeData);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        setColleges([]);
        setCollegesFormData([]);
      }
    };

    fetchColleges();
  }, [employeeNumber]);

  // Fetch graduate studies data for current user
  useEffect(() => {
    const fetchGraduates = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/GraduateRoute/graduate-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const graduateData = Array.isArray(response.data) ? response.data : [];
        setGraduates(graduateData);
        setGraduatesFormData(graduateData);
      } catch (error) {
        console.error('Error fetching graduates:', error);
        setGraduates([]);
        setGraduatesFormData([]);
      }
    };

    fetchGraduates();
  }, [employeeNumber]);

  // Fetch eligibility data for current user
  useEffect(() => {
    const fetchEligibilities = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/eligibilityRoute/eligibility-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const eligibilityData = Array.isArray(response.data) ? response.data : [];
        setEligibilities(eligibilityData);

        // Initialize form data with fetched eligibilities
        const formattedEligibilities = eligibilityData.map((eligibility) => ({
          ...eligibility,
          eligibilityDateOfExam: eligibility.eligibilityDateOfExam
            ? eligibility.eligibilityDateOfExam.split('T')[0]
            : '',
          DateOfValidity: eligibility.DateOfValidity
            ? eligibility.DateOfValidity.split('T')[0]
            : '',
        }));
        setEligibilitiesFormData(formattedEligibilities);
      } catch (error) {
        console.error('Error fetching eligibilities:', error);
        setEligibilities([]);
        setEligibilitiesFormData([]);
      }
    };

    fetchEligibilities();
  }, [employeeNumber]);

  // Fetch learning and development data for current user
  useEffect(() => {
    const fetchLearningDevelopment = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/learning_and_development_table/by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const learningData = Array.isArray(response.data) ? response.data : [];
        setLearningDevelopment(learningData);
        setLearningDevelopmentFormData(learningData);
      } catch (error) {
        console.error('Error fetching learning and development:', error);
        setLearningDevelopment([]);
        setLearningDevelopmentFormData([]);
      }
    };

    fetchLearningDevelopment();
  }, [employeeNumber]);

  // Fetch other information data for current user
  useEffect(() => {
    const fetchOtherInformation = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/OtherInfo/other-information-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const otherInfoData = Array.isArray(response.data) ? response.data : [];
        setOtherInformation(otherInfoData);
        setOtherInformationFormData(otherInfoData);
      } catch (error) {
        console.error('Error fetching other information:', error);
        setOtherInformation([]);
        setOtherInformationFormData([]);
      }
    };

    fetchOtherInformation();
  }, [employeeNumber]);

  // Fetch vocational data for current user
  useEffect(() => {
    const fetchVocational = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/vocational/vocational-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const vocationalData = Array.isArray(response.data) ? response.data : [];
        setVocational(vocationalData);
        setVocationalFormData(vocationalData);
      } catch (error) {
        console.error('Error fetching vocational:', error);
        setVocational([]);
        setVocationalFormData([]);
      }
    };

    fetchVocational();
  }, [employeeNumber]);

  // Fetch work experiences data for current user
  useEffect(() => {
    const fetchWorkExperiences = async () => {
      if (!employeeNumber) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/WorkExperienceRoute/work-experience-by-person/${employeeNumber}`,
          getAuthHeaders()
        );
        const workExpData = Array.isArray(response.data) ? response.data : [];
        setWorkExperiences(workExpData);

        // Initialize form data with fetched work experiences
        const formattedWorkExperiences = workExpData.map((workExp) => ({
          ...workExp,
          workDateFrom: workExp.workDateFrom
            ? workExp.workDateFrom.split('T')[0]
            : '',
          workDateTo: workExp.workDateTo
            ? workExp.workDateTo.split('T')[0]
            : '',
        }));
        setWorkExperiencesFormData(formattedWorkExperiences);
      } catch (error) {
        console.error('Error fetching work experiences:', error);
        setWorkExperiences([]);
        setWorkExperiencesFormData([]);
      }
    };

    fetchWorkExperiences();
  }, [employeeNumber]);

  // Fetch voluntary work data for current user
  useEffect(() => {
    const fetchVoluntaryWork = async () => {
      if (!employeeNumber) return;
      
      try {
        // Fetch all voluntary work and filter by person_id
        const response = await axios.get(
          `${API_BASE_URL}/VoluntaryRoute/voluntary-work`,
          getAuthHeaders()
        );
        const allVoluntary = Array.isArray(response.data) ? response.data : [];
        const filtered = allVoluntary.filter(v => v.person_id === employeeNumber);
        setVoluntaryWork(filtered);

        // Initialize form data with fetched voluntary work
        const formattedVoluntary = filtered.map((vol) => ({
          ...vol,
          dateFrom: vol.dateFrom ? vol.dateFrom.split('T')[0] : '',
          dateTo: vol.dateTo ? vol.dateTo.split('T')[0] : '',
        }));
        setVoluntaryWorkFormData(formattedVoluntary);
      } catch (error) {
        console.error('Error fetching voluntary work:', error);
        setVoluntaryWork([]);
        setVoluntaryWorkFormData([]);
      }
    };

    fetchVoluntaryWork();
  }, [employeeNumber]);

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Save personal info
      await axios.put(
        `${API_BASE_URL}/personalinfo/person_table/by-employee/${employeeNumber}`,
        formData,
        getAuthHeaders()
      );
      setPerson(formData);

      // Save children data
      for (const child of childrenFormData) {
        if (child.id) {
          // Update existing child
          await axios.put(
            `${API_BASE_URL}/ChildrenRoute/children-table/${child.id}`,
            child,
            getAuthHeaders()
          );
        } else if (
          child.childrenFirstName &&
          child.childrenLastName &&
          child.dateOfBirth
        ) {
          // Add new child
          await axios.post(
            `${API_BASE_URL}/ChildrenRoute/children-table`,
            child,
            getAuthHeaders()
          );
        }
      }

      // Save college data
      for (const college of collegesFormData) {
        if (college.id) {
          // Update existing college
          await axios.put(
            `${API_BASE_URL}/college/college-table/${college.id}`,
            college,
            getAuthHeaders()
          );
        } else if (college.collegeNameOfSchool && college.collegeDegree) {
          // Add new college
          await axios.post(
            `${API_BASE_URL}/college/college-table`,
            college,
            getAuthHeaders()
          );
        }
      }

      // Save graduate studies data
      for (const graduate of graduatesFormData) {
        if (graduate.id) {
          // Update existing graduate
          await axios.put(
            `${API_BASE_URL}/graduate/graduate-table/${graduate.id}`,
            graduate,
            getAuthHeaders()
          );
        } else if (graduate.graduateNameOfSchool && graduate.graduateDegree) {
          // Add new graduate
          await axios.post(
            `${API_BASE_URL}/graduate/graduate-table`,
            graduate,
            getAuthHeaders()
          );
        }
      }

      // Save eligibility data
      for (const eligibility of eligibilitiesFormData) {
        if (eligibility.id) {
          // Update existing eligibility
          await axios.put(
            `${API_BASE_URL}/eligibilityRoute/eligibility/${eligibility.id}`,
            eligibility,
            getAuthHeaders()
          );
        } else if (eligibility.eligibilityName && eligibility.DateOfValidity) {
          // Add new eligibility
          await axios.post(
            `${API_BASE_URL}/eligibilityRoute/eligibility`,
            eligibility,
            getAuthHeaders()
          );
        }
      }

      // Save learning and development data
      for (const learning of learningDevelopmentFormData) {
        if (learning.id) {
          // Update existing learning and development
          await axios.put(
            `${API_BASE_URL}/learning_and_development_table/${learning.id}`,
            learning,
            getAuthHeaders()
          );
        } else if (
          learning.titleOfProgram &&
          learning.dateFrom &&
          learning.dateTo
        ) {
          // Add new learning and development
          await axios.post(
            `${API_BASE_URL}/learning_and_development_table`,
            learning,
            getAuthHeaders()
          );
        }
      }

      // Save other information data
      for (const info of otherInformationFormData) {
        if (info.id) {
          // Update existing other information
          await axios.put(
            `${API_BASE_URL}/OtherInfo/other-information/${info.id}`,
            info,
            getAuthHeaders()
          );
        } else {
          // Add new other information
          await axios.post(
            `${API_BASE_URL}/OtherInfo/other-information`,
            info,
            getAuthHeaders()
          );
        }
      }

      // Save vocational data
      for (const voc of vocationalFormData) {
        if (voc.id) {
          // Update existing vocational record
          await axios.put(
            `${API_BASE_URL}/vocational/vocational-table/${voc.id}`,
            voc,
            getAuthHeaders()
          );
        } else if (voc.vocationalNameOfSchool && voc.vocationalDegree) {
          // Add new vocational record
          await axios.post(
            `${API_BASE_URL}/vocational/vocational-table`,
            voc,
            getAuthHeaders()
          );
        }
      }

      for (const workExp of workExperiencesFormData) {
        if (workExp.id) {
          // Update existing work experience
          await axios.put(
            `${API_BASE_URL}/WorkExperienceRoute/work-experience-table/${workExp.id}`,
            workExp,
            getAuthHeaders()
          );
        } else if (
          workExp.workPositionTitle &&
          workExp.workCompany &&
          workExp.workDateFrom &&
          workExp.workDateTo
        ) {
          // Add new work experience
          await axios.post(
            `${API_BASE_URL}/WorkExperienceRoute/work-experience-table`,
            workExp,
            getAuthHeaders()
          );
        }
      }

      // Save voluntary work data
      for (const vol of voluntaryWorkFormData) {
        if (vol.id) {
          // Update existing voluntary work
          await axios.put(
            `${API_BASE_URL}/VoluntaryRoute/voluntary-work/${vol.id}`,
            vol,
            getAuthHeaders()
          );
        } else if (vol.nameAndAddress && vol.dateFrom && vol.dateTo) {
          // Add new voluntary work
          await axios.post(
            `${API_BASE_URL}/VoluntaryRoute/voluntary-work`,
            vol,
            getAuthHeaders()
          );
        }
      }

      setEditOpen(false);
      setUploadStatus({
        message: 'Profile updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Update failed:', err);
      setUploadStatus({ message: 'Failed to update profile', type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !employeeNumber) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        message: 'Please upload a valid image file (JPEG, PNG, GIF)',
        type: 'error',
      });
      setNotificationOpen(true);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus({
        message: 'File size must be less than 5MB',
        type: 'error',
      });
      setNotificationOpen(true);
      return;
    }

    const fd = new FormData();
    fd.append('profile', file);

    try {
      setUploadStatus({ message: 'Uploading...', type: 'info' });
      setNotificationOpen(true);

      const token = localStorage.getItem('token');
      // Try the profile upload endpoint, fallback to personalinfo route
      let res;
      try {
        res = await axios.post(
          `${API_BASE_URL}/upload-profile-picture/${employeeNumber}`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );
      } catch (uploadError) {
        // If the endpoint doesn't exist, try alternative approach
        // Upload to personalinfo route if available
        console.warn('Profile picture upload endpoint not found, using alternative method');
        throw uploadError; // Re-throw to be handled by outer catch
      }

      const newPicturePath = res.data.filePath;
      setProfilePicture(newPicturePath);

      if (person) {
        setPerson((prev) => ({ ...prev, profile_picture: newPicturePath }));
      }

      setUploadStatus({
        message: 'Profile picture updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);
    } catch (err) {
      console.error('Image upload failed:', err);
      const errorMessage =
        err.response?.data?.message ||
        'Failed to upload image. Please try again.';
      setUploadStatus({ message: errorMessage, type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handleRemovePicture = () => {
    if (!person?.id) return;

    try {
      axios.delete(
        `${API_BASE_URL}/personalinfo/remove-profile-picture/${person.id}`
      );
      setProfilePicture(null);
      setPerson((prev) => ({ ...prev, profile_picture: null }));
      setUploadStatus({
        message: 'Profile picture removed successfully!',
        type: 'success',
      });
      setNotificationOpen(true);
    } catch (err) {
      console.error('Remove picture failed:', err);
      setUploadStatus({ message: 'Failed to remove picture.', type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImageZoom = () => {
    setImageZoomOpen(true);
  };

  const handleImageZoomClose = () => {
    setImageZoomOpen(false);
  };

  const handleEditImageZoom = () => {
    setEditImageZoomOpen(true);
  };

  const handleEditImageZoomClose = () => {
    setEditImageZoomOpen(false);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const trigger = useScrollTrigger({
    threshold: 100,
    disableHysteresis: true,
  });

  const scrollToTop = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Children related functions
  const handleChildrenFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChildren = [...childrenFormData];
    updatedChildren[index] = { ...updatedChildren[index], [name]: value };
    setChildrenFormData(updatedChildren);
  };

  const handleAddChild = () => {
    setChildrenFormData([
      ...childrenFormData,
      {
        childrenFirstName: '',
        childrenMiddleName: '',
        childrenLastName: '',
        childrenNameExtension: '',
        dateOfBirth: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveChild = (index) => {
    const updatedChildren = [...childrenFormData];
    updatedChildren.splice(index, 1);
    setChildrenFormData(updatedChildren);
  };

  // College related functions
  const handleCollegeFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedColleges = [...collegesFormData];
    updatedColleges[index] = { ...updatedColleges[index], [name]: value };
    setCollegesFormData(updatedColleges);
  };

  const handleAddCollege = () => {
    setCollegesFormData([
      ...collegesFormData,
      {
        collegeNameOfSchool: '',
        collegeDegree: '',
        collegePeriodFrom: '',
        collegePeriodTo: '',
        collegeHighestAttained: '',
        collegeYearGraduated: '',
        collegeScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveCollege = (index) => {
    const updatedColleges = [...collegesFormData];
    updatedColleges.splice(index, 1);
    setCollegesFormData(updatedColleges);
  };

  // Graduate studies related functions
  const handleGraduateFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGraduates = [...graduatesFormData];
    updatedGraduates[index] = { ...updatedGraduates[index], [name]: value };
    setGraduatesFormData(updatedGraduates);
  };

  const handleAddGraduate = () => {
    setGraduatesFormData([
      ...graduatesFormData,
      {
        graduateNameOfSchool: '',
        graduateDegree: '',
        graduatePeriodFrom: '',
        graduatePeriodTo: '',
        graduateHighestLevel: '',
        graduateYearGraduated: '',
        graduateScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveGraduate = (index) => {
    const updatedGraduates = [...graduatesFormData];
    updatedGraduates.splice(index, 1);
    setGraduatesFormData(updatedGraduates);
  };

  // Eligibility related functions
  const handleEligibilityFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEligibilities = [...eligibilitiesFormData];
    updatedEligibilities[index] = {
      ...updatedEligibilities[index],
      [name]: value,
    };
    setEligibilitiesFormData(updatedEligibilities);
  };

  const handleAddEligibility = () => {
    setEligibilitiesFormData([
      ...eligibilitiesFormData,
      {
        eligibilityName: '',
        eligibilityRating: '',
        eligibilityDateOfExam: '',
        eligibilityPlaceOfExam: '',
        licenseNumber: '',
        DateOfValidity: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveEligibility = (index) => {
    const updatedEligibilities = [...eligibilitiesFormData];
    updatedEligibilities.splice(index, 1);
    setEligibilitiesFormData(updatedEligibilities);
  };

  // Learning and Development related functions
  const handleLearningDevelopmentFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLearningDevelopment = [...learningDevelopmentFormData];
    updatedLearningDevelopment[index] = {
      ...updatedLearningDevelopment[index],
      [name]: value,
    };
    setLearningDevelopmentFormData(updatedLearningDevelopment);
  };

  const handleAddLearningDevelopment = () => {
    setLearningDevelopmentFormData([
      ...learningDevelopmentFormData,
      {
        titleOfProgram: '',
        dateFrom: '',
        dateTo: '',
        numberOfHours: '',
        typeOfLearningDevelopment: '',
        conductedSponsored: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveLearningDevelopment = (index) => {
    const updatedLearningDevelopment = [...learningDevelopmentFormData];
    updatedLearningDevelopment.splice(index, 1);
    setLearningDevelopmentFormData(updatedLearningDevelopment);
  };

  // Other Information related functions
  const handleOtherInformationFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOtherInformation = [...otherInformationFormData];
    updatedOtherInformation[index] = {
      ...updatedOtherInformation[index],
      [name]: value,
    };
    setOtherInformationFormData(updatedOtherInformation);
  };

  const handleAddOtherInformation = () => {
    setOtherInformationFormData([
      ...otherInformationFormData,
      {
        specialSkills: '',
        nonAcademicDistinctions: '',
        membershipInAssociation: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveOtherInformation = (index) => {
    const updatedOtherInformation = [...otherInformationFormData];
    updatedOtherInformation.splice(index, 1);
    setOtherInformationFormData(updatedOtherInformation);
  };

  // Vocational related functions
  const handleVocationalFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVocational = [...vocationalFormData];
    updatedVocational[index] = { ...updatedVocational[index], [name]: value };
    setVocationalFormData(updatedVocational);
  };

  const handleAddVocational = () => {
    setVocationalFormData([
      ...vocationalFormData,
      {
        vocationalNameOfSchool: '',
        vocationalDegree: '',
        vocationalPeriodFrom: '',
        vocationalPeriodTo: '',
        vocationalHighestAttained: '',
        vocationalYearGraduated: '',
        vocationalScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveVocational = (index) => {
    const updatedVocational = [...vocationalFormData];
    updatedVocational.splice(index, 1);
    setVocationalFormData(updatedVocational);
  };

  const handleWorkExperienceFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences[index] = {
      ...updatedWorkExperiences[index],
      [name]: value,
    };
    setWorkExperiencesFormData(updatedWorkExperiences);
  };

  // Add new work experience
  const handleAddWorkExperience = () => {
    setWorkExperiencesFormData([
      ...workExperiencesFormData,
      {
        workDateFrom: '',
        workDateTo: '',
        workPositionTitle: '',
        workCompany: '',
        workMonthlySalary: '',
        SalaryJobOrPayGrade: '',
        StatusOfAppointment: '',
        isGovtService: 'No',
        person_id: employeeNumber,
      },
    ]);
  };

  // Remove work experience
  const handleRemoveWorkExperience = (index) => {
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences.splice(index, 1);
    setWorkExperiencesFormData(updatedWorkExperiences);
  };

  // Voluntary Work related functions
  const handleVoluntaryWorkFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVoluntary = [...voluntaryWorkFormData];
    updatedVoluntary[index] = { ...updatedVoluntary[index], [name]: value };
    setVoluntaryWorkFormData(updatedVoluntary);
  };

  const handleAddVoluntaryWork = () => {
    setVoluntaryWorkFormData([
      ...voluntaryWorkFormData,
      {
        nameAndAddress: '',
        dateFrom: '',
        dateTo: '',
        numberOfHours: '',
        natureOfWork: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveVoluntaryWork = (index) => {
    const updatedVoluntary = [...voluntaryWorkFormData];
    updatedVoluntary.splice(index, 1);
    setVoluntaryWorkFormData(updatedVoluntary);
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Format rating as percentage for display
  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'N/A';
    return `${numRating}%`;
  };

  // All tabs matching PDS structure
  const tabs = [
    { key: 0, label: 'Personal', icon: <PersonIcon /> },
    { key: 1, label: 'Gov. IDs', icon: <BadgeIcon /> },
    { key: 2, label: 'Addresses', icon: <HomeIcon /> },
    { key: 3, label: 'Contact', icon: <CallIcon /> },
    { key: 4, label: 'Family', icon: <GroupIcon /> },
    { key: 5, label: 'Education', icon: <SchoolIcon /> },
    { key: 6, label: 'Children', icon: <ChildCareIcon /> },
    { key: 7, label: 'Eligibility', icon: <FactCheckIcon /> },
    { key: 8, label: 'Work Experience', icon: <WorkIcon /> },
    { key: 9, label: 'Voluntary Work', icon: <GroupIcon /> },
    { key: 10, label: 'Learning & Development', icon: <BookIcon /> },
    { key: 11, label: 'Other Information', icon: <InfoIcon /> },
  ];

  const formFields = {
    0: [
      {
        label: 'First Name',
        name: 'firstName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Middle Name',
        name: 'middleName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Last Name',
        name: 'lastName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Name Extension',
        name: 'nameExtension',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Date of Birth',
        name: 'birthDate',
        type: 'date',
        icon: <CakeIcon fontSize="small" />,
      },
      {
        label: 'Place of Birth',
        name: 'placeOfBirth',
        icon: <LocationOnIcon fontSize="small" />,
      },
    ],
    1: [
      {
        label: 'GSIS Number',
        name: 'gsisNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'Pag-IBIG Number',
        name: 'pagibigNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'PhilHealth Number',
        name: 'philhealthNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'SSS Number',
        name: 'sssNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'TIN Number',
        name: 'tinNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'Agency Employee Number',
        name: 'agencyEmployeeNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
    ],
    2: [
      {
        label: 'House & Lot Number',
        name: 'permanent_houseBlockLotNum',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Street',
        name: 'permanent_streetName',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Subdivision',
        name: 'permanent_subdivisionOrVillage',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Barangay',
        name: 'permanent_barangay',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'City/Municipality',
        name: 'permanent_cityOrMunicipality',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Province',
        name: 'permanent_provinceName',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Zip Code',
        name: 'permanent_zipcode',
        icon: <HomeIcon fontSize="small" />,
      },
    ],
    3: [
      {
        label: 'Telephone',
        name: 'telephone',
        icon: <CallIcon fontSize="small" />,
      },
      {
        label: 'Mobile',
        name: 'mobileNum',
        icon: <PhoneIcon fontSize="small" />,
      },
      {
        label: 'Email',
        name: 'emailAddress',
        icon: <EmailIcon fontSize="small" />,
      },
    ],
    4: [
      {
        label: 'Spouse First Name',
        name: 'spouseFirstName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Middle Name',
        name: 'spouseMiddleName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Last Name',
        name: 'spouseLastName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Occupation',
        name: 'spouseOccupation',
        icon: <WorkIcon fontSize="small" />,
      },
    ],
    5: [], // Education tab will have sub-tabs
    6: [], // Children tab doesn't have form fields
    7: [], // Eligibility tab doesn't have form fields
    8: [], // Work Experience tab doesn't have form fields
    9: [], // Voluntary Work tab doesn't have form fields
    10: [], // Learning and Development tab doesn't have form fields
    11: [], // Other Information tab doesn't have form fields
  };

  if (loading) {
    return (
      <ProfileContainer ref={profileRef}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="70vh"
        >
          <Box textAlign="center">
            <CircularProgress
              size={64}
              thickness={4}
              sx={{ color: colors.primary, mb: 3 }}
            />
            <Typography
              variant="h6"
              color={colors.textPrimary}
              fontWeight={600}
            >
              Loading Profile...
            </Typography>
            <Typography variant="body2" color={colors.textSecondary} mt={1}>
              Fetching data securely — this may take a moment.
            </Typography>
          </Box>
        </Box>
      </ProfileContainer>
    );
  }

  const renderTabContentGrid = (tabIndex) => {
    // Special handling for Education tab with sub-tabs
    // Special handling for Education tab with sub-tabs
    if (tabIndex === 5) {
      return (
        <Box>
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Elementary School
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.elementaryNameOfSchool || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Elementary Degree
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.elementaryDegree || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Secondary School
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.secondaryNameOfSchool || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Secondary Degree
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.secondaryDegree || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              {colleges.length > 0 ? (
                <Grid container spacing={3}>
                  {colleges.map((college) => (
                    <Grid item xs={12} sm={6} md={4} key={college.id}>
                      <CollegeCard>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={colors.textPrimary}
                            mb={1}
                          >
                            {college.collegeNameOfSchool}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            {college.collegeDegree}
                          </Typography>
                          {college.collegePeriodFrom &&
                            college.collegePeriodTo && (
                              <Box display="flex" alignItems="center">
                                <CalendarTodayIcon
                                  sx={{
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    mr: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color={colors.textSecondary}
                                >
                                  {college.collegePeriodFrom} -{' '}
                                  {college.collegePeriodTo}
                                </Typography>
                              </Box>
                            )}
                        </CardContent>
                      </CollegeCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No college records found
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    mt={1}
                  >
                    Click "Edit Profile" to add college records
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              {graduates.length > 0 ? (
                <Grid container spacing={3}>
                  {graduates.map((graduate) => (
                    <Grid item xs={12} sm={6} md={4} key={graduate.id}>
                      <GraduateCard>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={colors.textPrimary}
                            mb={1}
                          >
                            {graduate.graduateNameOfSchool}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            {graduate.graduateDegree}
                          </Typography>
                          {graduate.graduatePeriodFrom &&
                            graduate.graduatePeriodTo && (
                              <Box display="flex" alignItems="center">
                                <CalendarTodayIcon
                                  sx={{
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    mr: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color={colors.textSecondary}
                                >
                                  {graduate.graduatePeriodFrom} -{' '}
                                  {graduate.graduatePeriodTo}
                                </Typography>
                              </Box>
                            )}
                        </CardContent>
                      </GraduateCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No graduate studies records found
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    mt={1}
                  >
                    Click "Edit Profile" to add graduate studies records
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              {vocational.length > 0 ? (
                <Grid container spacing={3}>
                  {vocational.map((voc) => (
                    <Grid item xs={12} sm={6} md={4} key={voc.id}>
                      <VocationalCard>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={colors.textPrimary}
                            mb={1}
                          >
                            {voc.vocationalNameOfSchool}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            {voc.vocationalDegree}
                          </Typography>
                          {voc.vocationalPeriodFrom &&
                            voc.vocationalPeriodTo && (
                              <Box display="flex" alignItems="center">
                                <CalendarTodayIcon
                                  sx={{
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    mr: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color={colors.textSecondary}
                                >
                                  {voc.vocationalPeriodFrom} -{' '}
                                  {voc.vocationalPeriodTo}
                                </Typography>
                              </Box>
                            )}
                        </CardContent>
                      </VocationalCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No vocational records found
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    mt={1}
                  >
                    Click "Edit Profile" to add vocational records
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Children tab
    if (tabIndex === 6) {
      return (
        <Box>
          <ScrollableContainer>
            {children.length > 0 ? (
              <Grid container spacing={3}>
                {children.map((child) => (
                  <Grid item xs={12} sm={6} md={4} key={child.id}>
                    <ChildCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ChildCareIcon
                            sx={{ color: colors.primary, mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {child.childrenFirstName} {child.childrenMiddleName}{' '}
                          {child.childrenLastName}
                          {child.childrenNameExtension &&
                            ` ${child.childrenNameExtension}`}
                        </Typography>
                        {child.dateOfBirth && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CakeIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {new Date(child.dateOfBirth).toLocaleDateString()}{' '}
                              (Age: {getAge(child.dateOfBirth)})
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </ChildCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No children records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add children records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Eligibility tab
    if (tabIndex === 7) {
      return (
        <Box>
          <ScrollableContainer>
            {eligibilities.length > 0 ? (
              <Grid container spacing={3}>
                {eligibilities.map((eligibility) => (
                  <Grid item xs={12} sm={6} md={4} key={eligibility.id}>
                    <EligibilityCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <FactCheckIcon
                            sx={{ color: colors.primary, mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {eligibility.eligibilityName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={colors.textSecondary}
                          mb={1}
                        >
                          Rating: {formatRating(eligibility.eligibilityRating)}
                        </Typography>
                        {eligibility.licenseNumber && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                              sx={{ mr: 1 }}
                            >
                              License:
                            </Typography>
                            <Typography
                              variant="body2"
                              color={colors.textPrimary}
                            >
                              {eligibility.licenseNumber}
                            </Typography>
                          </Box>
                        )}
                        {eligibility.DateOfValidity && (
                          <Box display="flex" alignItems="center">
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                              sx={{ mr: 1 }}
                            >
                              Valid Until:
                            </Typography>
                            <Typography
                              variant="body2"
                              color={colors.textPrimary}
                            >
                              {new Date(
                                eligibility.DateOfValidity
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </EligibilityCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No eligibility records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add eligibility records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }


    // Special handling for Work Experience tab
    if (tabIndex === 8) {
      return (
        <Box>
          <ScrollableContainer>
            {workExperiences.length > 0 ? (
              <Grid container spacing={3}>
                {workExperiences.map((workExp) => (
                  <Grid item xs={12} sm={6} md={4} key={workExp.id}>
                    <WorkExperienceCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <WorkIcon sx={{ color: colors.primary, mr: 1 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {workExp.workPositionTitle || 'N/A'}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={colors.textSecondary}
                          mb={1}
                        >
                          {workExp.workCompany || 'N/A'}
                        </Typography>
                        {workExp.workDateFrom && workExp.workDateTo && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {new Date(
                                workExp.workDateFrom
                              ).toLocaleDateString()}{' '}
                              -{' '}
                              {new Date(
                                workExp.workDateTo
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        {workExp.workMonthlySalary && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Salary: ₱
                            {parseFloat(
                              workExp.workMonthlySalary
                            ).toLocaleString()}
                          </Typography>
                        )}
                        {workExp.isGovtService && (
                          <Chip
                            label={
                              workExp.isGovtService === 'Yes'
                                ? 'Government'
                                : 'Private'
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                workExp.isGovtService === 'Yes'
                                  ? alpha(colors.primary, 0.1)
                                  : alpha(colors.secondary, 0.5),
                              color:
                                workExp.isGovtService === 'Yes'
                                  ? colors.primary
                                  : colors.textSecondary,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </CardContent>
                    </WorkExperienceCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No work experience records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add work experience records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Voluntary Work tab
    if (tabIndex === 9) {
      return (
        <Box>
          <ScrollableContainer>
            {voluntaryWork.length > 0 ? (
              <Grid container spacing={3}>
                {voluntaryWork.map((vol) => (
                  <Grid item xs={12} sm={6} md={4} key={vol.id}>
                    <Card
                      sx={{
                        border: '1px solid #e0e0e0',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          borderColor: colors.primary,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease',
                          boxShadow: shadows.medium,
                        },
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <GroupIcon sx={{ color: colors.primary, mr: 1 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {vol.nameAndAddress || 'N/A'}
                        </Typography>
                        {vol.dateFrom && vol.dateTo && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {new Date(vol.dateFrom).toLocaleDateString()} -{' '}
                              {new Date(vol.dateTo).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        {vol.numberOfHours && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Hours: {vol.numberOfHours}
                          </Typography>
                        )}
                        {vol.natureOfWork && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                          >
                            {vol.natureOfWork}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No voluntary work records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add voluntary work records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Learning and Development tab
    if (tabIndex === 10) {
      return (
        <Box>
          <ScrollableContainer>
            {learningDevelopment.length > 0 ? (
              <Grid container spacing={3}>
                {learningDevelopment.map((learning) => (
                  <Grid item xs={12} sm={6} md={4} key={learning.id}>
                    <LearningDevelopmentCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LightbulbIcon
                            sx={{ color: colors.primary, mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {learning.titleOfProgram}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={colors.textSecondary}
                          mb={1}
                        >
                          Type: {learning.typeOfLearningDevelopment || 'N/A'}
                        </Typography>
                        {learning.dateFrom && learning.dateTo && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {learning.dateFrom} - {learning.dateTo}
                            </Typography>
                          </Box>
                        )}
                        {learning.numberOfHours && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Hours: {learning.numberOfHours}
                          </Typography>
                        )}
                        {learning.conductedSponsored && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                          >
                            Conducted/Sponsored by:{' '}
                            {learning.conductedSponsored}
                          </Typography>
                        )}
                      </CardContent>
                    </LearningDevelopmentCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No learning and development records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add learning and development records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Other Information tab
    if (tabIndex === 11) {
      return (
        <Box>
          <ScrollableContainer>
            {otherInformation.length > 0 ? (
              <Grid container spacing={3}>
                {otherInformation.map((info) => (
                  <Grid item xs={12} sm={6} md={4} key={info.id}>
                    <OtherInformationCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <InfoIcon sx={{ color: colors.primary, mr: 1 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          Other Information
                        </Typography>
                        {info.specialSkills && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Skills:{' '}
                            {info.specialSkills.length > 50
                              ? `${info.specialSkills.substring(0, 50)}...`
                              : info.specialSkills}
                          </Typography>
                        )}
                        {info.nonAcademicDistinctions && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Distinctions:{' '}
                            {info.nonAcademicDistinctions.length > 50
                              ? `${info.nonAcademicDistinctions.substring(
                                  0,
                                  50
                                )}...`
                              : info.nonAcademicDistinctions}
                          </Typography>
                        )}
                        {info.membershipInAssociation && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                          >
                            Associations:{' '}
                            {info.membershipInAssociation.length > 50
                              ? `${info.membershipInAssociation.substring(
                                  0,
                                  50
                                )}...`
                              : info.membershipInAssociation}
                          </Typography>
                        )}
                      </CardContent>
                    </OtherInformationCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No other information records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add other information records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    const fields = formFields[tabIndex] || [];

    return (
      <Grid container spacing={3}>
        {fields.map((field, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: shadows.medium,
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  {field.icon}
                  <Typography
                    variant="subtitle2"
                    color={colors.textSecondary}
                    ml={1}
                  >
                    {field.label}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {person?.[field.name] || '—'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTabContentList = (tabIndex) => {
    // Special handling for Education tab with sub-tabs
    // Special handling for Education tab with sub-tabs
    if (tabIndex === 5) {
      return (
        <Box>
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Box>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Elementary School:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.elementaryNameOfSchool || '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Elementary Degree:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.elementaryDegree || '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Secondary School:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.secondaryNameOfSchool || '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Secondary Degree:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.secondaryDegree || '—'}
                </InfoValue>
              </InfoItem>
            </Box>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              <ScrollableContainer>
                {colleges.length > 0 ? (
                  <List>
                    {colleges.map((college) => (
                      <React.Fragment key={college.id}>
                        <CollegeListItem>
                          <MuiListItemIcon>
                            <SchoolRoundedIcon sx={{ color: colors.primary }} />
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={college.collegeNameOfSchool}
                            secondary={
                              college.collegeDegree
                                ? `${college.collegeDegree} (${
                                    college.collegePeriodFrom || 'N/A'
                                  } - ${college.collegePeriodTo || 'N/A'})`
                                : 'No degree information'
                            }
                          />
                        </CollegeListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No college records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add college records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              <ScrollableContainer>
                {graduates.length > 0 ? (
                  <List>
                    {graduates.map((graduate) => (
                      <React.Fragment key={graduate.id}>
                        <GraduateListItem>
                          <MuiListItemIcon>
                            <PsychologyIcon sx={{ color: colors.primary }} />
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={graduate.graduateNameOfSchool}
                            secondary={
                              graduate.graduateDegree
                                ? `${graduate.graduateDegree} (${
                                    graduate.graduatePeriodFrom || 'N/A'
                                  } - ${graduate.graduatePeriodTo || 'N/A'})`
                                : 'No degree information'
                            }
                          />
                        </GraduateListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No graduate studies records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add graduate studies records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              <ScrollableContainer>
                {vocational.length > 0 ? (
                  <List>
                    {vocational.map((voc) => (
                      <React.Fragment key={voc.id}>
                        <VocationalListItem>
                          <MuiListItemIcon>
                            <ConstructionIcon sx={{ color: colors.primary }} />
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={voc.vocationalNameOfSchool}
                            secondary={
                              voc.vocationalDegree
                                ? `${voc.vocationalDegree} (${
                                    voc.vocationalPeriodFrom || 'N/A'
                                  } - ${voc.vocationalPeriodTo || 'N/A'})`
                                : 'No degree information'
                            }
                          />
                        </VocationalListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No vocational records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add vocational records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Children tab
    if (tabIndex === 6) {
      return (
        <Box>
          {children.length > 0 ? (
            <Box>
              {children.map((child) => (
                <Box
                  key={child.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <ChildCareIcon sx={{ color: colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, color: colors.primary }}>
                      {child.childrenFirstName} {child.childrenMiddleName} {child.childrenLastName}
                      {child.childrenNameExtension ? ` ${child.childrenNameExtension}` : ''}
                    </Typography>
                  </Box>
                  {child.dateOfBirth && (
                    <Typography variant="body1" sx={{ fontSize: '1rem', color: colors.textSecondary, ml: 5 }}>
                      <strong>Date of Birth:</strong> {new Date(child.dateOfBirth).toLocaleDateString()} 
                      {' '}(Age: {getAge(child.dateOfBirth)})
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary} sx={{ fontSize: '1.1rem' }}>
                No children records found
              </Typography>
              <Typography variant="body1" color={colors.textSecondary} mt={1} sx={{ fontSize: '1rem' }}>
                Click "Edit Profile" to add children records
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Eligibility tab
    if (tabIndex === 7) {
      return (
        <Box>
          {eligibilities.length > 0 ? (
            <Box>
              {eligibilities.map((eligibility) => (
                <Box
                  key={eligibility.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <FactCheckIcon sx={{ color: colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, color: colors.primary }}>
                      {eligibility.eligibilityName}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 5 }}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      <strong>Rating:</strong> {formatRating(eligibility.eligibilityRating)}
                    </Typography>
                    {eligibility.licenseNumber && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>License Number:</strong> {eligibility.licenseNumber}
                      </Typography>
                    )}
                    {eligibility.DateOfValidity && (
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        <strong>Valid Until:</strong> {new Date(eligibility.DateOfValidity).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary} sx={{ fontSize: '1.1rem' }}>
                No eligibility records found
              </Typography>
              <Typography variant="body1" color={colors.textSecondary} mt={1} sx={{ fontSize: '1rem' }}>
                Click "Edit Profile" to add eligibility records
              </Typography>
            </Box>
          )}
        </Box>
      );
    }


    // Special handling for Work Experience tab
    if (tabIndex === 8) {
      return (
        <Box>
          {workExperiences.length > 0 ? (
            <Box>
              {workExperiences.map((workExp) => (
                <Box
                  key={workExp.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <WorkIcon sx={{ color: colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, color: colors.primary }}>
                      {workExp.workPositionTitle || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 5 }}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      <strong>Company:</strong> {workExp.workCompany || 'N/A'}
                    </Typography>
                    {workExp.workDateFrom && workExp.workDateTo && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>Period:</strong> {new Date(workExp.workDateFrom).toLocaleDateString()} - {new Date(workExp.workDateTo).toLocaleDateString()}
                      </Typography>
                    )}
                    {workExp.workMonthlySalary && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>Monthly Salary:</strong> ₱{parseFloat(workExp.workMonthlySalary).toLocaleString()}
                      </Typography>
                    )}
                    {workExp.isGovtService && (
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        <strong>Service Type:</strong> {workExp.isGovtService === 'Yes' ? 'Government' : 'Private'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary} sx={{ fontSize: '1.1rem' }}>
                No work experience records found
              </Typography>
              <Typography variant="body1" color={colors.textSecondary} mt={1} sx={{ fontSize: '1rem' }}>
                Click "Edit Profile" to add work experience records
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Voluntary Work tab
    if (tabIndex === 9) {
      return (
        <Box>
          {voluntaryWork.length > 0 ? (
            <Box>
              {voluntaryWork.map((vol) => (
                <Box
                  key={vol.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <GroupIcon sx={{ color: colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, color: colors.primary }}>
                      {vol.nameAndAddress || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 5 }}>
                    {vol.dateFrom && vol.dateTo && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>Period:</strong> {new Date(vol.dateFrom).toLocaleDateString()} - {new Date(vol.dateTo).toLocaleDateString()}
                      </Typography>
                    )}
                    {vol.numberOfHours && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>Number of Hours:</strong> {vol.numberOfHours}
                      </Typography>
                    )}
                    {vol.natureOfWork && (
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        <strong>Nature of Work:</strong> {vol.natureOfWork}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary} sx={{ fontSize: '1.1rem' }}>
                No voluntary work records found
              </Typography>
              <Typography variant="body1" color={colors.textSecondary} mt={1} sx={{ fontSize: '1rem' }}>
                Click "Edit Profile" to add voluntary work records
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Learning and Development tab
    if (tabIndex === 10) {
      return (
        <Box>
          {learningDevelopment.length > 0 ? (
            <Box>
              {learningDevelopment.map((learning) => (
                <Box
                  key={learning.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <LightbulbIcon sx={{ color: colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, color: colors.primary }}>
                      {learning.titleOfProgram}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 5 }}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                      <strong>Type:</strong> {learning.typeOfLearningDevelopment || 'N/A'}
                    </Typography>
                    {learning.dateFrom && learning.dateTo && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>Period:</strong> {learning.dateFrom} - {learning.dateTo}
                      </Typography>
                    )}
                    {learning.numberOfHours && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 0.5 }}>
                        <strong>Number of Hours:</strong> {learning.numberOfHours}
                      </Typography>
                    )}
                    {learning.conductedSponsored && (
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        <strong>Conducted/Sponsored by:</strong> {learning.conductedSponsored}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary} sx={{ fontSize: '1.1rem' }}>
                No learning and development records found
              </Typography>
              <Typography variant="body1" color={colors.textSecondary} mt={1} sx={{ fontSize: '1rem' }}>
                Click "Edit Profile" to add learning and development records
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Other Information tab
    if (tabIndex === 11) {
      return (
        <Box>
          {otherInformation.length > 0 ? (
            <Box>
              {otherInformation.map((info) => (
                <Box
                  key={info.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
                    border: `2px solid ${colors.border}`,
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <InfoIcon sx={{ color: colors.primary, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, color: colors.primary }}>
                      Other Information
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 5 }}>
                    {info.specialSkills && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                        <strong>Special Skills:</strong> {info.specialSkills}
                      </Typography>
                    )}
                    {info.nonAcademicDistinctions && (
                      <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                        <strong>Non-Academic Distinctions:</strong> {info.nonAcademicDistinctions}
                      </Typography>
                    )}
                    {info.membershipInAssociation && (
                      <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                        <strong>Membership in Association:</strong> {info.membershipInAssociation}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary} sx={{ fontSize: '1.1rem' }}>
                No other information records found
              </Typography>
              <Typography variant="body1" color={colors.textSecondary} mt={1} sx={{ fontSize: '1rem' }}>
                Click "Edit Profile" to add other information records
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    const fields = formFields[tabIndex] || [];

    return (
      <Box>
        {fields.map((field, idx) => (
          <InfoItem key={idx}>
            <InfoLabel variant="body2">
              {field.icon}
              {field.label}:
            </InfoLabel>
            <InfoValue variant="body1">{person?.[field.name] || '—'}</InfoValue>
          </InfoItem>
        ))}
      </Box>
    );
  };

  const renderFormFields = () => {
    // Special handling for Education tab with sub-tabs
    if (tabValue === 5) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Education Information
          </Typography>

          {/* Add the sub-tabs navigation here */}
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Elementary & Secondary Education
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                This section displays your elementary and secondary education
                information.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Elementary School"
                    name="elementaryNameOfSchool"
                    value={formData.elementaryNameOfSchool || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Elementary Degree"
                    name="elementaryDegree"
                    value={formData.elementaryDegree || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Secondary School"
                    name="secondaryNameOfSchool"
                    value={formData.secondaryNameOfSchool || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Secondary Degree"
                    name="secondaryDegree"
                    value={formData.secondaryDegree || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                College Information
              </Typography>

              {collegesFormData.length > 0 ? (
                <Box>
                  {collegesFormData.map((college, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          College {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveCollege(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="College Name"
                            name="collegeNameOfSchool"
                            value={college.collegeNameOfSchool || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="collegeDegree"
                            value={college.collegeDegree || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="collegePeriodFrom"
                            value={college.collegePeriodFrom || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="collegePeriodTo"
                            value={college.collegePeriodTo || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Attained"
                            name="collegeHighestAttained"
                            value={college.collegeHighestAttained || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="collegeYearGraduated"
                            value={college.collegeYearGraduated || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="collegeScholarshipAcademicHonorsReceived"
                            value={
                              college.collegeScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No college records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCollege}
                >
                  Add College
                </ActionButton>
              </Box>
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Graduate Studies Information
              </Typography>

              {graduatesFormData.length > 0 ? (
                <Box>
                  {graduatesFormData.map((graduate, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Graduate Studies {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveGraduate(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="School Name"
                            name="graduateNameOfSchool"
                            value={graduate.graduateNameOfSchool || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="graduateDegree"
                            value={graduate.graduateDegree || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="graduatePeriodFrom"
                            value={graduate.graduatePeriodFrom || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="graduatePeriodTo"
                            value={graduate.graduatePeriodTo || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Level"
                            name="graduateHighestLevel"
                            value={graduate.graduateHighestLevel || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="graduateYearGraduated"
                            value={graduate.graduateYearGraduated || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="graduateScholarshipAcademicHonorsReceived"
                            value={
                              graduate.graduateScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No graduate studies records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddGraduate}
                >
                  Add Graduate Studies
                </ActionButton>
              </Box>
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Vocational Information
              </Typography>

              {vocationalFormData.length > 0 ? (
                <Box>
                  {vocationalFormData.map((voc, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Vocational {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveVocational(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="School Name"
                            name="vocationalNameOfSchool"
                            value={voc.vocationalNameOfSchool || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="vocationalDegree"
                            value={voc.vocationalDegree || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="vocationalPeriodFrom"
                            value={voc.vocationalPeriodFrom || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="vocationalPeriodTo"
                            value={voc.vocationalPeriodTo || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Attained"
                            name="vocationalHighestAttained"
                            value={voc.vocationalHighestAttained || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="vocationalYearGraduated"
                            value={voc.vocationalYearGraduated || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="vocationalScholarshipAcademicHonorsReceived"
                            value={
                              voc.vocationalScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No vocational records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVocational}
                >
                  Add Vocational
                </ActionButton>
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Children tab
    if (tabValue === 6) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Children Information
          </Typography>

          {childrenFormData.length > 0 ? (
            <Box>
              {childrenFormData.map((child, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Child {index + 1}</Typography>
                    <IconButton
                      onClick={() => handleRemoveChild(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="First Name"
                        name="childrenFirstName"
                        value={child.childrenFirstName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Middle Name"
                        name="childrenMiddleName"
                        value={child.childrenMiddleName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Last Name"
                        name="childrenLastName"
                        value={child.childrenLastName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Name Extension"
                        name="childrenNameExtension"
                        value={child.childrenNameExtension || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                        placeholder="e.g., Jr., Sr., III"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={child.dateOfBirth || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No children records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddChild}
            >
              Add Child
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Eligibility tab
    if (tabValue === 7) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Eligibility Information
          </Typography>

          {eligibilitiesFormData.length > 0 ? (
            <Box>
              {eligibilitiesFormData.map((eligibility, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Eligibility {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveEligibility(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Eligibility Name"
                        name="eligibilityName"
                        value={eligibility.eligibilityName || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                            color: '#333',
                            display: 'block',
                          }}
                        >
                          Rating
                        </Typography>
                        <PercentageInput
                          value={eligibility.eligibilityRating || ''}
                          onChange={(value) =>
                            handleEligibilityFormChange(index, {
                              target: { name: 'eligibilityRating', value },
                            })
                          }
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date of Exam"
                        name="eligibilityDateOfExam"
                        type="date"
                        value={eligibility.eligibilityDateOfExam || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Place of Exam"
                        name="eligibilityPlaceOfExam"
                        value={eligibility.eligibilityPlaceOfExam || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="License Number"
                        name="licenseNumber"
                        value={eligibility.licenseNumber || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date of Validity"
                        name="DateOfValidity"
                        type="date"
                        value={eligibility.DateOfValidity || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No eligibility records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEligibility}
            >
              Add Eligibility
            </ActionButton>
          </Box>
        </Box>
      );
    }


    // Special handling for Work Experience tab
    if (tabValue === 8) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Work Experience Information
          </Typography>

          {workExperiencesFormData.length > 0 ? (
            <Box>
              {workExperiencesFormData.map((workExp, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Work Experience {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveWorkExperience(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="workDateFrom"
                        type="date"
                        value={workExp.workDateFrom || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="workDateTo"
                        type="date"
                        value={workExp.workDateTo || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Position Title"
                        name="workPositionTitle"
                        value={workExp.workPositionTitle || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Company"
                        name="workCompany"
                        value={workExp.workCompany || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Monthly Salary"
                        name="workMonthlySalary"
                        value={workExp.workMonthlySalary || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Salary Job/Pay Grade"
                        name="SalaryJobOrPayGrade"
                        value={workExp.SalaryJobOrPayGrade || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Status of Appointment"
                        name="StatusOfAppointment"
                        value={workExp.StatusOfAppointment || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Government Service</InputLabel>
                        <Select
                          name="isGovtService"
                          value={workExp.isGovtService || 'No'}
                          onChange={(e) =>
                            handleWorkExperienceFormChange(index, e)
                          }
                          label="Government Service"
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No work experience records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddWorkExperience}
            >
              Add Work Experience
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Voluntary Work tab
    if (tabValue === 9) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Voluntary Work Information
          </Typography>

          {voluntaryWorkFormData.length > 0 ? (
            <Box>
              {voluntaryWorkFormData.map((vol, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Voluntary Work {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveVoluntaryWork(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Name and Address of Organization"
                        name="nameAndAddress"
                        value={vol.nameAndAddress || ''}
                        onChange={(e) => handleVoluntaryWorkFormChange(index, e)}
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="dateFrom"
                        type="date"
                        value={vol.dateFrom || ''}
                        onChange={(e) => handleVoluntaryWorkFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="dateTo"
                        type="date"
                        value={vol.dateTo || ''}
                        onChange={(e) => handleVoluntaryWorkFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Number of Hours"
                        name="numberOfHours"
                        value={vol.numberOfHours || ''}
                        onChange={(e) => handleVoluntaryWorkFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Nature of Work"
                        name="natureOfWork"
                        value={vol.natureOfWork || ''}
                        onChange={(e) => handleVoluntaryWorkFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No voluntary work records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddVoluntaryWork}
            >
              Add Voluntary Work
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Learning and Development tab
    if (tabValue === 10) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Learning and Development Information
          </Typography>

          {learningDevelopmentFormData.length > 0 ? (
            <Box>
              {learningDevelopmentFormData.map((learning, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Learning Program {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveLearningDevelopment(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Title of Program"
                        name="titleOfProgram"
                        value={learning.titleOfProgram || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="dateFrom"
                        type="date"
                        value={learning.dateFrom || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="dateTo"
                        type="date"
                        value={learning.dateTo || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Number of Hours"
                        name="numberOfHours"
                        value={learning.numberOfHours || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Type of Learning Development"
                        name="typeOfLearningDevelopment"
                        value={learning.typeOfLearningDevelopment || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Conducted/Sponsored"
                        name="conductedSponsored"
                        value={learning.conductedSponsored || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No learning and development records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLearningDevelopment}
            >
              Add Learning Program
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Other Information tab
    if (tabValue === 11) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Other Information
          </Typography>

          {otherInformationFormData.length > 0 ? (
            <Box>
              {otherInformationFormData.map((info, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Information {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveOtherInformation(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Special Skills"
                        name="specialSkills"
                        value={info.specialSkills || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Non-Academic Distinctions"
                        name="nonAcademicDistinctions"
                        value={info.nonAcademicDistinctions || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Membership in Association"
                        name="membershipInAssociation"
                        value={info.membershipInAssociation || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No other information records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOtherInformation}
            >
              Add Other Information
            </ActionButton>
          </Box>
        </Box>
      );
    }

    const fields = formFields[tabValue] || [];

    return (
      <Grid container spacing={3}>
        {fields.map((field, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <FormField
              fullWidth
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleFormChange}
              variant="outlined"
              disabled={field.disabled}
              type={field.type || 'text'}
              InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <ProfileContainer ref={profileRef}>
      {/* Simple, Clear Header */}
      <ProfileHeader>
        <Box display="flex" alignItems="center" gap={3} flex={1} flexWrap="wrap">
          <ProfileAvatar
            src={
              profilePicture
                ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                : undefined
            }
            alt="Profile Picture"
            onClick={handleImageZoom}
            sx={{
              width: 120,
              height: 120,
              border: `3px solid ${colors.primary}`,
              cursor: 'pointer',
              fontSize: '3rem',
            }}
          >
            {!profilePicture && <PersonIcon sx={{ fontSize: 60 }} />}
          </ProfileAvatar>
          
          <Box flex={1} minWidth="250px">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: colors.textPrimary,
                mb: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              {person
                ? `${person.firstName || ''} ${person.middleName || ''} ${person.lastName || ''} ${
                    person.nameExtension || ''
                  }`.trim()
                : 'Employee Profile'}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: colors.textSecondary,
                mb: 0.5,
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              Employee No.: <strong style={{ color: colors.primary }}>{person?.agencyEmployeeNum || '—'}</strong>
            </Typography>
            {person?.emailAddress && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <EmailIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                <Typography variant="body1" sx={{ color: colors.textSecondary, fontSize: '1rem' }}>
                  {person.emailAddress}
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" gap={2} flexDirection="column" alignItems="flex-end">
            <ActionButton
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
              size="large"
              sx={{
                fontSize: '1rem',
                padding: '12px 24px',
                minWidth: '160px',
              }}
            >
              Edit Profile
            </ActionButton>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="medium"
              sx={{
                fontSize: '0.9rem',
                padding: '8px 16px',
                minWidth: '160px',
                color: colors.primary,
                borderColor: colors.primary,
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </ProfileHeader>

      {/* Summary Cards - Simple and Clear */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', border: `2px solid ${colors.primary}` }}>
            <ChildCareIcon sx={{ fontSize: 36, color: colors.primary, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color={colors.primary}>
              {children.length}
            </Typography>
            <Typography variant="body1" color={colors.textSecondary} sx={{ fontSize: '0.95rem' }}>
              Children
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', border: `2px solid ${colors.primary}` }}>
            <FactCheckIcon sx={{ fontSize: 36, color: colors.primary, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color={colors.primary}>
              {eligibilities.length}
            </Typography>
            <Typography variant="body1" color={colors.textSecondary} sx={{ fontSize: '0.95rem' }}>
              Eligibilities
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', border: `2px solid ${colors.primary}` }}>
            <WorkIcon sx={{ fontSize: 36, color: colors.primary, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color={colors.primary}>
              {workExperiences.length}
            </Typography>
            <Typography variant="body1" color={colors.textSecondary} sx={{ fontSize: '0.95rem' }}>
              Work Experience
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, textAlign: 'center', border: `2px solid ${colors.primary}` }}>
            <BookIcon sx={{ fontSize: 36, color: colors.primary, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color={colors.primary}>
              {learningDevelopment.length}
            </Typography>
            <Typography variant="body1" color={colors.textSecondary} sx={{ fontSize: '0.95rem' }}>
              Learning Programs
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content - Using Accordions for Better Organization */}
      <SectionPaper>
        <SectionTitle sx={{ mb: 3, fontSize: '1.6rem' }}>
          <PersonIcon sx={{ fontSize: 28 }} />
          Personal Data Sheet (PDS) Information
        </SectionTitle>

        {/* Use Accordions for easier navigation */}
        <Box>
          {/* Personal Information */}
          <Accordion defaultExpanded sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Personal Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(0)}
            </AccordionDetails>
          </Accordion>

          {/* Government IDs */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <BadgeIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Government IDs
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(1)}
            </AccordionDetails>
          </Accordion>

          {/* Addresses */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <HomeIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Addresses
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(2)}
            </AccordionDetails>
          </Accordion>

          {/* Contact Information */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <CallIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Contact Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(3)}
            </AccordionDetails>
          </Accordion>

          {/* Family Information */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Family Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(4)}
            </AccordionDetails>
          </Accordion>

          {/* Education */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <SchoolIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Education
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <EducationSubTabs
                  value={educationSubTabValue}
                  onChange={(e, newValue) => setEducationSubTabValue(newValue)}
                  variant="fullWidth"
                  sx={{ mb: 3 }}
                >
                  <EducationSubTab
                    label="Elementary & Secondary"
                    icon={<SchoolIcon />}
                  />
                  <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
                  <EducationSubTab
                    label="Graduate Studies"
                    icon={<PsychologyIcon />}
                  />
                  <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
                </EducationSubTabs>
                {educationSubTabValue === 0 && renderTabContentList(5)}
                {educationSubTabValue === 1 && (
                  <Box>
                    {colleges.length > 0 ? (
                      <List>
                        {colleges.map((college) => (
                          <React.Fragment key={college.id}>
                            <CollegeListItem>
                              <MuiListItemIcon>
                                <SchoolRoundedIcon sx={{ color: colors.primary, fontSize: 28 }} />
                              </MuiListItemIcon>
                              <MuiListItemText
                                primary={
                                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    {college.collegeNameOfSchool}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                      <strong>Degree:</strong> {college.collegeDegree || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                      <strong>Period:</strong> {college.collegePeriodFrom || 'N/A'} - {college.collegePeriodTo || 'N/A'}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </CollegeListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color={colors.textSecondary}>
                          No college records found
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                {educationSubTabValue === 2 && (
                  <Box>
                    {graduates.length > 0 ? (
                      <List>
                        {graduates.map((graduate) => (
                          <React.Fragment key={graduate.id}>
                            <GraduateListItem>
                              <MuiListItemIcon>
                                <PsychologyIcon sx={{ color: colors.primary, fontSize: 28 }} />
                              </MuiListItemIcon>
                              <MuiListItemText
                                primary={
                                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    {graduate.graduateNameOfSchool}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                      <strong>Degree:</strong> {graduate.graduateDegree || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                      <strong>Period:</strong> {graduate.graduatePeriodFrom || 'N/A'} - {graduate.graduatePeriodTo || 'N/A'}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </GraduateListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color={colors.textSecondary}>
                          No graduate studies records found
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                {educationSubTabValue === 3 && (
                  <Box>
                    {vocational.length > 0 ? (
                      <List>
                        {vocational.map((voc) => (
                          <React.Fragment key={voc.id}>
                            <VocationalListItem>
                              <MuiListItemIcon>
                                <ConstructionIcon sx={{ color: colors.primary, fontSize: 28 }} />
                              </MuiListItemIcon>
                              <MuiListItemText
                                primary={
                                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    {voc.vocationalNameOfSchool}
                                  </Typography>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                      <strong>Degree:</strong> {voc.vocationalDegree || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                                      <strong>Period:</strong> {voc.vocationalPeriodFrom || 'N/A'} - {voc.vocationalPeriodTo || 'N/A'}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </VocationalListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color={colors.textSecondary}>
                          No vocational records found
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Children */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <ChildCareIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Children
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(6)}
            </AccordionDetails>
          </Accordion>

          {/* Eligibility */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <FactCheckIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Eligibility
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(7)}
            </AccordionDetails>
          </Accordion>

          {/* Work Experience */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <WorkIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Work Experience
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(8)}
            </AccordionDetails>
          </Accordion>

          {/* Voluntary Work */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Voluntary Work
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(9)}
            </AccordionDetails>
          </Accordion>

          {/* Learning & Development */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <BookIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Learning & Development
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(10)}
            </AccordionDetails>
          </Accordion>

          {/* Other Information */}
          <Accordion sx={{ mb: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <InfoIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                  Other Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderTabContentList(11)}
            </AccordionDetails>
          </Accordion>
        </Box>
      </SectionPaper>

      {/* Edit Profile Modal - Simplified */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={editOpen} onClick={handleEditClose}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle sx={{ fontSize: '1.5rem' }}>Edit Profile Information</ModalTitle>
              <IconButton
                onClick={handleEditClose}
                sx={{ color: colors.textLight, fontSize: '1.5rem' }}
              >
                <CloseIcon />
              </IconButton>
            </ModalHeader>

            <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}` }}>
              <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                <EditModalAvatar
                  src={
                    profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : undefined
                  }
                  alt="Profile Picture"
                  onClick={handleEditImageZoom}
                  sx={{ width: 100, height: 100, fontSize: '2.5rem' }}
                >
                  {!profilePicture && <PersonIcon sx={{ fontSize: 50 }} />}
                </EditModalAvatar>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary, mb: 1, fontSize: '1.2rem' }}>
                    Profile Picture
                  </Typography>
                  <Typography variant="body1" color={colors.textSecondary} sx={{ mb: 2, fontSize: '1rem' }}>
                    Click on image to preview. Upload a professional headshot (max 5MB, JPEG/PNG)
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <input
                      accept="image/*"
                      id="profile-picture-upload-modal"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handlePictureChange}
                    />
                    <label htmlFor="profile-picture-upload-modal">
                      <Button
                        component="span"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          fontSize: '1rem',
                          padding: '10px 20px',
                          backgroundColor: colors.primary,
                        }}
                      >
                        Upload Photo
                      </Button>
                    </label>
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemovePicture}
                      sx={{
                        fontSize: '1rem',
                        padding: '10px 20px',
                        borderColor: colors.error,
                        color: colors.error,
                      }}
                    >
                      Remove Photo
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            <ModalBody>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1.3rem', fontWeight: 600, color: colors.primary }}>
                  Select Section to Edit:
                </Typography>
                <CustomTabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: '1rem',
                      minHeight: 56,
                      padding: '12px 16px',
                    },
                  }}
                >
                  {tabs.map((tab) => (
                    <CustomTab
                      key={tab.key}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                    />
                  ))}
                </CustomTabs>
              </Box>

              <Box sx={{ minHeight: '400px' }}>
                {renderFormFields()}
              </Box>
            </ModalBody>

            {/* Fixed Bottom Action Bar */}
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: colors.surface,
                padding: theme.spacing(2.5),
                borderTop: `2px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing(2),
                boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleEditClose}
                sx={{
                  fontSize: '1rem',
                  padding: '12px 24px',
                  minWidth: '140px',
                  borderColor: colors.textSecondary,
                  color: colors.textSecondary,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
                sx={{
                  fontSize: '1rem',
                  padding: '12px 24px',
                  minWidth: '180px',
                  backgroundColor: colors.primary,
                }}
              >
                Save All Changes
              </Button>
            </Box>
          </ModalContainer>
        </Backdrop>
      </Modal>

      {/* Image Preview Modals */}
      <ImagePreviewModal
        open={imageZoomOpen}
        onClose={handleImageZoomClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={imageZoomOpen} onClick={handleImageZoomClose}>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <ImagePreviewContent>
              <PreviewImage
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture Preview"
              />
              <ImagePreviewActions>
                <ImagePreviewButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : '';
                    link.download = 'profile-picture.jpg';
                    link.click();
                  }}
                  title="Download"
                >
                  <DownloadIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Profile Picture',
                        url: profilePicture
                          ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                          : '',
                      });
                    }
                  }}
                  title="Share"
                >
                  <ShareIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={handleImageZoomClose}
                  title="Close"
                >
                  <CloseIcon />
                </ImagePreviewButton>
              </ImagePreviewActions>
            </ImagePreviewContent>
          </ImagePreviewContainer>
        </Backdrop>
      </ImagePreviewModal>

      <ImagePreviewModal
        open={editImageZoomOpen}
        onClose={handleEditImageZoomClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={editImageZoomOpen} onClick={handleEditImageZoomClose}>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <ImagePreviewContent>
              <PreviewImage
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture Preview"
              />
              <ImagePreviewActions>
                <ImagePreviewButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : '';
                    link.download = 'profile-picture.jpg';
                    link.click();
                  }}
                  title="Download"
                >
                  <DownloadIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Profile Picture',
                        url: profilePicture
                          ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                          : '',
                      });
                    }
                  }}
                  title="Share"
                >
                  <ShareIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={handleEditImageZoomClose}
                  title="Close"
                >
                  <CloseIcon />
                </ImagePreviewButton>
              </ImagePreviewActions>
            </ImagePreviewContent>
          </ImagePreviewContainer>
        </Backdrop>
      </ImagePreviewModal>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Notification
          variant={uploadStatus.type}
          message={uploadStatus.message}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleNotificationClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Snackbar>

      {trigger && (
        <FloatingButton onClick={scrollToTop} aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </FloatingButton>
      )}
    </ProfileContainer>
  );
};

export default Profile;


