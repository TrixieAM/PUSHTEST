import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useProfileData from '../../hooks/useProfileData';
import useProfileSections from '../../hooks/useProfileSections';
import useProfileMutations from '../../hooks/useProfileMutations';
import { getUserInfo, getAuthHeaders } from '../../utils/auth';
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
  Fab,
  Snackbar,
  SnackbarContent,
  useScrollTrigger,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  AppBar,
  Toolbar,
  Stack,
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';

const colors = {
  primary: '#6D2323',
  primaryLight: '#A31D1D',
  primaryDark: '#4a1818',
  secondary: '#FEF9E1',
  textPrimary: '#000000',
  textSecondary: '#555555',
  textLight: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#6D2323',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  gradientPrimary: 'linear-gradient(135deg, #6D2323 0%, #A31D1D 100%)',
};

const shadows = {
  light: '0 2px 8px rgba(0,0,0,0.08)',
  medium: '0 4px 16px rgba(0,0,0,0.12)',
  heavy: '0 8px 24px rgba(0,0,0,0.16)',
  colored: '0 4px 16px rgba(109, 35, 35, 0.2)',
};

const ProfileContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1600px',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  minHeight: '100vh',
  backgroundColor: colors.background,
  position: 'relative',
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: shadows.medium,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: colors.surface,
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
  width: theme.spacing(20),
  height: theme.spacing(20),
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
  fontSize: '1.8rem',
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
  fontSize: '1rem',
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

const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(3),
  boxShadow: shadows.light,
  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: shadows.medium,
    transform: 'translateY(-2px)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
  color: colors.textPrimary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: colors.textSecondary,
  minWidth: '140px',
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: colors.textPrimary,
  flex: 1,
  fontWeight: 500,
  fontSize: '0.95rem',
}));

const TabContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
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
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
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

const ModalHeader = styled(AppBar)(({ theme }) => ({
  background: colors.gradientPrimary,
  padding: theme.spacing(2, 3),
  color: colors.textLight,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  boxShadow: 'none',
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.3rem',
}));

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  flex: 1,
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: colors.border,
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
    '&.Mui-focused': {
      color: colors.primary,
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
  padding: theme.spacing(2),
  backgroundColor: alpha(colors.secondary, 0.3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const EditModalAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(16),
  height: theme.spacing(16),
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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  maxHeight: '500px',
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  backgroundColor: colors.background,
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
    '&:hover': {
      background: colors.primaryLight,
    },
  },
}));

const EducationSubTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.5),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const EducationSubTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  minWidth: 'auto',
  padding: theme.spacing(1, 1.5),
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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
  },
}));

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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
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
  border: `1px solid ${colors.primary}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: colors.secondary,
  padding: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    borderColor: colors.primaryLight,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
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

const Sidebar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: shadows.light,
  height: 'fit-content',
  position: 'sticky',
  top: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    marginBottom: theme.spacing(3),
    position: 'relative',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid #e0e0e0',
  '&:hover': {
    boxShadow: shadows.medium,
    transform: 'translateY(-2px)',
    borderColor: colors.primary,
  },
  '&.active': {
    backgroundColor: alpha(colors.primary, 0.1),
    borderColor: colors.primary,
  },
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: theme.spacing(5),
  height: theme.spacing(5),
  borderRadius: '50%',
  backgroundColor: alpha(colors.primary, 0.1),
  color: colors.primary,
  marginRight: theme.spacing(2),
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  color: colors.textPrimary,
}));

const CategoryDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: colors.textSecondary,
  marginTop: theme.spacing(0.5),
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: colors.surface,
}));

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
  
  const { person, profilePicture, loading, refresh: refreshPerson } = useProfileData();
  const { sections, loading: sectionsLoading, refresh: refreshSections } = useProfileSections();
  const { saveProfile, saving } = useProfileMutations();
  
  const userInfo = getUserInfo();
  const employeeNumber = userInfo.employeeNumber || localStorage.getItem('employeeNumber');
  
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [editImageZoomOpen, setEditImageZoomOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [educationSubTabValue, setEducationSubTabValue] = useState(0);
  const profileRef = useRef(null);

  const [childrenFormData, setChildrenFormData] = useState([]);
  const [collegesFormData, setCollegesFormData] = useState([]);
  const [graduatesFormData, setGraduatesFormData] = useState([]);
  const [eligibilitiesFormData, setEligibilitiesFormData] = useState([]);
  const [learningDevelopmentFormData, setLearningDevelopmentFormData] = useState([]);
  const [otherInformationFormData, setOtherInformationFormData] = useState([]);
  const [vocationalFormData, setVocationalFormData] = useState([]);
  const [workExperiencesFormData, setWorkExperiencesFormData] = useState([]);

  useEffect(() => {
    if (!sectionsLoading) {
      if (sections.children.length > 0 && childrenFormData.length === 0) {
        setChildrenFormData(sections.children);
      }
      if (sections.colleges.length > 0 && collegesFormData.length === 0) {
        setCollegesFormData(sections.colleges);
      }
      if (sections.graduates.length > 0 && graduatesFormData.length === 0) {
        setGraduatesFormData(sections.graduates);
      }
      if (sections.eligibilities.length > 0 && eligibilitiesFormData.length === 0) {
        setEligibilitiesFormData(sections.eligibilities);
      }
      if (sections.learningDevelopment.length > 0 && learningDevelopmentFormData.length === 0) {
        setLearningDevelopmentFormData(sections.learningDevelopment);
      }
      if (sections.otherInformation.length > 0 && otherInformationFormData.length === 0) {
        setOtherInformationFormData(sections.otherInformation);
      }
      if (sections.vocational.length > 0 && vocationalFormData.length === 0) {
        setVocationalFormData(sections.vocational);
      }
      if (sections.workExperiences.length > 0 && workExperiencesFormData.length === 0) {
        setWorkExperiencesFormData(sections.workExperiences);
      }
    }
  }, [sections, sectionsLoading]);

  useEffect(() => {
    if (person && Object.keys(formData).length === 0) {
      const formattedData = { ...person };
      if (person.birthDate) {
        const date = new Date(person.birthDate);
        if (!isNaN(date.getTime())) {
          formattedData.birthDate = date.toISOString().split('T')[0];
        }
      }
      setFormData(formattedData);
    }
  }, [person]);

  const children = sections.children;
  const colleges = sections.colleges;
  const graduates = sections.graduates;
  const eligibilities = sections.eligibilities;
  const learningDevelopment = sections.learningDevelopment;
  const otherInformation = sections.otherInformation;
  const vocational = sections.vocational;
  const workExperiences = sections.workExperiences;

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
      await saveProfile({
        personalInfo: formData,
        children: childrenFormData,
        colleges: collegesFormData,
        graduates: graduatesFormData,
        eligibilities: eligibilitiesFormData,
        learningDevelopment: learningDevelopmentFormData,
        otherInformation: otherInformationFormData,
        vocational: vocationalFormData,
        workExperiences: workExperiencesFormData,
      });

      setEditOpen(false);
      setUploadStatus({
        message: 'Profile updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);

      // Refresh data
      refreshPerson();
      refreshSections();
    } catch (err) {
      console.error('Update failed:', err);
      setUploadStatus({
        message: err.message || 'Failed to update profile',
        type: 'error',
      });
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

      // Get auth headers without Content-Type (browser will set it with boundary for multipart/form-data)
      const authHeaders = getAuthHeaders({ includeContentType: false });
      const res = await axios.post(
        `${API_BASE_URL}/upload-profile-picture/${employeeNumber}`,
        fd,
        {
          headers: {
            ...authHeaders.headers,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      const newPicturePath = res.data.filePath;
      // Refresh person data to get updated profile picture
      refreshPerson();

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

  const handleRemovePicture = async () => {
    if (!person?.id) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/personalinfo/remove-profile-picture/${person.id}`,
        getAuthHeaders()
      );
      // Refresh person data to get updated profile picture
      refreshPerson();
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
    refreshPerson();
    refreshSections();
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const trigger = useScrollTrigger({
    threshold: 100,
    disableHysteresis: true,
  });

  const scrollToTop = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const handleRemoveWorkExperience = (index) => {
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences.splice(index, 1);
    setWorkExperiencesFormData(updatedWorkExperiences);
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

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'N/A';
    return `${numRating}%`;
  };

  const tabs = [
    { key: 0, label: 'Personal', icon: <PersonIcon /> },
    { key: 1, label: 'Gov. IDs', icon: <BadgeIcon /> },
    { key: 2, label: 'Addresses', icon: <HomeIcon /> },
    { key: 3, label: 'Contact', icon: <CallIcon /> },
    { key: 4, label: 'Family', icon: <GroupIcon /> },
    { key: 5, label: 'Education', icon: <SchoolIcon /> },
    { key: 6, label: 'Children', icon: <ChildCareIcon /> },
    { key: 7, label: 'Eligibility', icon: <FactCheckIcon /> },
    { key: 8, label: 'Learning & Development', icon: <BookIcon /> },
    { key: 9, label: 'Other Information', icon: <InfoIcon /> },
    { key: 10, label: 'Work Experience', icon: <WorkIcon /> },
  ];

  // Form fields for each tab
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
    8: [], // Learning and Development tab doesn't have form fields
    9: [], // Other Information tab doesn't have form fields
    10: [], // Work Experience tab doesn't have form fields
  };

  const isLoading = loading || sectionsLoading;

  if (isLoading) {
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
    return renderTabContentList(tabIndex);
    /*
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
            <TabPanel>
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
            </TabPanel>
          )}

          {educationSubTabValue === 1 && (
            <TabPanel>
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
            </TabPanel>
          )}

          {educationSubTabValue === 2 && (
            <TabPanel>
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
            </TabPanel>
          )}

          {educationSubTabValue === 3 && (
            <TabPanel>
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
            </TabPanel>
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
              <List>
                {children.map((child) => (
                  <React.Fragment key={child.id}>
                    <ChildListItem>
                      <MuiListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <ChildCareIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                        </Box>
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                            {`${child.childrenFirstName} ${child.childrenMiddleName} ${child.childrenLastName}${
                              child.childrenNameExtension ? ` ${child.childrenNameExtension}` : ''
                            }`}
                          </Typography>
                        }
                        secondary={
                          child.dateOfBirth ? (
                            <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                              Born: {new Date(child.dateOfBirth).toLocaleDateString()} (Age: {getAge(child.dateOfBirth)})
                            </Typography>
                          ) : (
                            'No birth date recorded'
                          )
                        }
                      />
                    </ChildListItem>
                  </React.Fragment>
                ))}
              </List>
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
              <List>
                {eligibilities.map((eligibility) => (
                  <React.Fragment key={eligibility.id}>
                    <EligibilityListItem>
                      <MuiListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <FactCheckIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                        </Box>
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                            {eligibility.eligibilityName}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" sx={{ display: 'block', color: colors.textPrimary, mb: 0.5 }}>
                              Rating: {formatRating(eligibility.eligibilityRating)}
                              {eligibility.licenseNumber && ` License: ${eligibility.licenseNumber}`}
                            </Typography>
                            {eligibility.DateOfValidity && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                Valid Until: {new Date(eligibility.DateOfValidity).toLocaleDateString()}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </EligibilityListItem>
                  </React.Fragment>
                ))}
              </List>
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

    // Special handling for Learning and Development tab
    if (tabIndex === 8) {
      return (
        <Box>
          <ScrollableContainer>
            {learningDevelopment.length > 0 ? (
              <List>
                {learningDevelopment.map((learning) => (
                  <React.Fragment key={learning.id}>
                    <LearningDevelopmentListItem>
                      <MuiListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <LightbulbIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                        </Box>
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                            {learning.titleOfProgram}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" sx={{ display: 'block', color: colors.textPrimary, mb: 0.5 }}>
                              Type: {learning.typeOfLearningDevelopment || 'N/A'}
                              {learning.numberOfHours && ` Hours: ${learning.numberOfHours}`}
                            </Typography>
                            {learning.dateFrom && learning.dateTo && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary, mb: 0.5 }}>
                                Period: {learning.dateFrom} - {learning.dateTo}
                              </Typography>
                            )}
                            {learning.conductedSponsored && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                Conducted/Sponsored by: {learning.conductedSponsored}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </LearningDevelopmentListItem>
                  </React.Fragment>
                ))}
              </List>
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
    if (tabIndex === 9) {
      return (
        <Box>
          <ScrollableContainer>
            {otherInformation.length > 0 ? (
              <List>
                {otherInformation.map((info) => (
                  <React.Fragment key={info.id}>
                    <OtherInformationListItem>
                      <MuiListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <InfoIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                        </Box>
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                            Other Information
                          </Typography>
                        }
                        secondary={
                          <>
                            {info.specialSkills && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary, mb: 0.5 }}>
                                Skills: {info.specialSkills}
                              </Typography>
                            )}
                            {info.nonAcademicDistinctions && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary, mb: 0.5 }}>
                                Distinctions: {info.nonAcademicDistinctions}
                              </Typography>
                            )}
                            {info.membershipInAssociation && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                Associations: {info.membershipInAssociation}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </OtherInformationListItem>
                  </React.Fragment>
                ))}
              </List>
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

    if (tabIndex === 10) {
      return (
        <Box>
          <ScrollableContainer>
            {workExperiences.length > 0 ? (
              <List>
                {workExperiences.map((workExp) => (
                  <React.Fragment key={workExp.id}>
                    <WorkExperienceListItem>
                      <MuiListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <WorkIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                        </Box>
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                            {workExp.workPositionTitle}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" sx={{ display: 'block', color: colors.textPrimary, mb: 0.5 }}>
                              {workExp.workCompany}
                              {workExp.workMonthlySalary && ` | Salary: ₱${parseFloat(workExp.workMonthlySalary).toLocaleString()}`}
                              {workExp.isGovtService && ` | ${workExp.isGovtService === 'Yes' ? 'Government' : 'Private'}`}
                            </Typography>
                            {workExp.workDateFrom && workExp.workDateTo && (
                              <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                {new Date(workExp.workDateFrom).toLocaleDateString()} - {new Date(workExp.workDateTo).toLocaleDateString()}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </WorkExperienceListItem>
                  </React.Fragment>
                ))}
              </List>
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

    // Default case for other tabs
    const fields = formFields[tabIndex] || [];

    return (
      <Box>
        <ScrollableContainer>
          {fields.length > 0 ? (
            <List>
              {fields.map((field, idx) => (
                <React.Fragment key={idx}>
                  <EligibilityListItem>
                    <MuiListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          backgroundColor: colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        {field.icon && React.cloneElement(field.icon, { sx: { color: colors.textLight, fontSize: 20 } })}
                      </Box>
                    </MuiListItemIcon>
                    <MuiListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                          {field.label}
                        </Typography>
                      }
                      secondary={
                        <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                          {person?.[field.name] || '—'}
                        </Typography>
                      }
                    />
                  </EligibilityListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No information available
              </Typography>
            </Box>
          )}
        </ScrollableContainer>
      </Box>
    );
    */
  };

  const renderRecordGroup = (items, emptyMessage, formatter) => {
    if (!items || items.length === 0) {
      return (
        <Box py={2} textAlign="center">
          <Typography variant="body2" color={colors.textSecondary}>
            {emptyMessage}
          </Typography>
        </Box>
      );
    }

    return items.map((item, index) => {
      const { label, lines } = formatter(item, index);
      const contentLines = (lines || []).filter(Boolean);

      return (
        <InfoItem key={item.id || index}>
          <InfoLabel variant="body2">{label}</InfoLabel>
          <InfoValue variant="body1">
            {contentLines.length > 0 ? (
              contentLines.map((line, lineIdx) => (
                <Typography
                  key={lineIdx}
                  variant="body2"
                  color={colors.textPrimary}
                  sx={{ display: 'block' }}
                >
                  {line}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color={colors.textSecondary}>
                —
              </Typography>
            )}
          </InfoValue>
        </InfoItem>
      );
    });
  };

  const renderTabContentList = (tabIndex) => {
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
            <TabPanel>
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
            </TabPanel>
          )}

          {educationSubTabValue === 1 && (
            <TabPanel>
              <ScrollableContainer>
                {colleges.length > 0 ? (
                  <List>
                    {colleges.map((college) => (
                      <React.Fragment key={college.id}>
                        <CollegeListItem>
                          <MuiListItemIcon>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <SchoolRoundedIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                            </Box>
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                                {college.collegeNameOfSchool}
                              </Typography>
                            }
                            secondary={
                              college.collegeDegree ? (
                                <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                  {college.collegeDegree} ({college.collegePeriodFrom || 'N/A'} - {college.collegePeriodTo || 'N/A'})
                                </Typography>
                              ) : (
                                'No degree information'
                              )
                            }
                          />
                        </CollegeListItem>
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
            </TabPanel>
          )}

          {educationSubTabValue === 2 && (
            <TabPanel>
              <ScrollableContainer>
                {graduates.length > 0 ? (
                  <List>
                    {graduates.map((graduate) => (
                      <React.Fragment key={graduate.id}>
                        <GraduateListItem>
                          <MuiListItemIcon>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <PsychologyIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                            </Box>
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                                {graduate.graduateNameOfSchool}
                              </Typography>
                            }
                            secondary={
                              graduate.graduateDegree ? (
                                <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                  {graduate.graduateDegree} ({graduate.graduatePeriodFrom || 'N/A'} - {graduate.graduatePeriodTo || 'N/A'})
                                </Typography>
                              ) : (
                                'No degree information'
                              )
                            }
                          />
                        </GraduateListItem>
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
            </TabPanel>
          )}

          {educationSubTabValue === 3 && (
            <TabPanel>
              <ScrollableContainer>
                {vocational.length > 0 ? (
                  <List>
                    {vocational.map((voc) => (
                      <React.Fragment key={voc.id}>
                        <VocationalListItem>
                          <MuiListItemIcon>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                backgroundColor: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <ConstructionIcon sx={{ color: colors.textLight, fontSize: 20 }} />
                            </Box>
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>
                                {voc.vocationalNameOfSchool}
                              </Typography>
                            }
                            secondary={
                              voc.vocationalDegree ? (
                                <Typography component="span" sx={{ display: 'block', color: colors.textPrimary }}>
                                  {voc.vocationalDegree} ({voc.vocationalPeriodFrom || 'N/A'} - {voc.vocationalPeriodTo || 'N/A'})
                                </Typography>
                              ) : (
                                'No degree information'
                              )
                            }
                          />
                        </VocationalListItem>
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
            </TabPanel>
          )}
        </Box>
      );
    }

    if (tabIndex === 6) {
      if (!children || children.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No children records found
            </Typography>
          </Box>
        );
      }

      const formatChildName = (child) =>
        [
          child.childrenFirstName,
          child.childrenMiddleName,
          child.childrenLastName,
          child.childrenNameExtension,
        ]
          .filter(Boolean)
          .join(' ')
          .trim();

      return (
        <Box>
          {children.map((child, index) => (
            <ChildListItem key={child.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}
                  >
                    {formatChildName(child) || `Child ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 140 }}>Full Name</InfoLabel>
                      <InfoValue>
                        {formatChildName(child) || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 140 }}>Date of Birth</InfoLabel>
                      <InfoValue>
                        {child.dateOfBirth
                          ? `${formatDate(child.dateOfBirth)} (Age: ${getAge(
                              child.dateOfBirth
                            )})`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </ChildListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 7) {
      if (!eligibilities || eligibilities.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No eligibility records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {eligibilities.map((eligibility, index) => (
            <EligibilityListItem key={eligibility.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}
                  >
                    {eligibility.eligibilityName ||
                      `Eligibility ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box sx={{ ml: { xs: 0, md: 0 } }}>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Rating</InfoLabel>
                      <InfoValue>
                        {eligibility.eligibilityRating
                          ? formatRating(eligibility.eligibilityRating)
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Date of Exam</InfoLabel>
                      <InfoValue>
                        {eligibility.eligibilityDateOfExam
                          ? formatDate(eligibility.eligibilityDateOfExam)
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Place of Exam</InfoLabel>
                      <InfoValue>
                        {eligibility.eligibilityPlaceOfExam || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>
                        License Number
                      </InfoLabel>
                      <InfoValue>
                        {eligibility.licenseNumber || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 120 }}>Valid Until</InfoLabel>
                      <InfoValue>
                        {eligibility.DateOfValidity
                          ? formatDate(eligibility.DateOfValidity)
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </EligibilityListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 8) {
      if (!learningDevelopment || learningDevelopment.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No learning and development records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {learningDevelopment.map((learning, index) => (
            <LearningDevelopmentListItem key={learning.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}
                  >
                    {learning.titleOfProgram || `Program ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Type</InfoLabel>
                      <InfoValue>
                        {learning.typeOfLearningDevelopment || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Number of Hours</InfoLabel>
                      <InfoValue>{learning.numberOfHours || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Period</InfoLabel>
                      <InfoValue>
                        {learning.dateFrom && learning.dateTo
                          ? `${formatDate(learning.dateFrom)} - ${formatDate(
                              learning.dateTo
                            )}`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Conducted / Sponsored by
                      </InfoLabel>
                      <InfoValue>
                        {learning.conductedSponsored || '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </LearningDevelopmentListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 9) {
      if (!otherInformation || otherInformation.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No other information records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {otherInformation.map((info, index) => (
            <OtherInformationListItem key={info.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}
                  >
                    {`Entry ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 180 }}>Special Skills</InfoLabel>
                      <InfoValue>{info.specialSkills || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 180 }}>
                        Non-Academic Distinctions
                      </InfoLabel>
                      <InfoValue>
                        {info.nonAcademicDistinctions || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 180 }}>
                        Membership in Association
                      </InfoLabel>
                      <InfoValue>
                        {info.membershipInAssociation || '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </OtherInformationListItem>
          ))}
        </Box>
      );
    }

    if (tabIndex === 10) {
      if (!workExperiences || workExperiences.length === 0) {
        return (
          <Box py={2} textAlign="center">
            <Typography variant="body2" color={colors.textSecondary}>
              No work experience records found
            </Typography>
          </Box>
        );
      }

      return (
        <Box>
          {workExperiences.map((workExp, index) => (
            <WorkExperienceListItem key={workExp.id || index}>
              <MuiListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}
                  >
                    {workExp.workPositionTitle ||
                      `Work Experience ${index + 1}`}
                  </Typography>
                }
                secondary={
                  <Box>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Company</InfoLabel>
                      <InfoValue>{workExp.workCompany || '—'}</InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>Duration</InfoLabel>
                      <InfoValue>
                        {workExp.workDateFrom && workExp.workDateTo
                          ? `${formatDate(workExp.workDateFrom)} - ${formatDate(
                              workExp.workDateTo
                            )}`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Monthly Salary
                      </InfoLabel>
                      <InfoValue>
                        {workExp.workMonthlySalary
                          ? `₱${parseFloat(
                              workExp.workMonthlySalary
                            ).toLocaleString()}`
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Salary Job / Pay Grade
                      </InfoLabel>
                      <InfoValue>
                        {workExp.SalaryJobOrPayGrade || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Status of Appointment
                      </InfoLabel>
                      <InfoValue>
                        {workExp.StatusOfAppointment || '—'}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem sx={{ mb: 0, p: 0 }}>
                      <InfoLabel sx={{ minWidth: 160 }}>
                        Service Type
                      </InfoLabel>
                      <InfoValue>
                        {workExp.isGovtService
                          ? workExp.isGovtService === 'Yes'
                            ? 'Government'
                            : 'Private'
                          : '—'}
                      </InfoValue>
                    </InfoItem>
                  </Box>
                }
              />
            </WorkExperienceListItem>
          ))}
        </Box>
      );
    }

    const fields = formFields[tabIndex] || [];

    return (
      <EligibilityCard>
        <List disablePadding>
          <EligibilityListItem sx={{ border: 'none', boxShadow: 'none', backgroundColor: colors.secondary }}>
            <MuiListItemText
              primary={
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: colors.textPrimary, mb: 1 }}
                >
                  {tabs[tabValue]?.label || 'Details'}
                </Typography>
              }
              secondary={
                <Box>
                  {fields.map((field, idx) => (
                    <InfoItem key={idx} sx={{ mb: 0.5, p: 0 }}>
                      <InfoLabel variant="body2" sx={{ minWidth: 160 }}>
                        {field.icon}
                        {field.label}:
                      </InfoLabel>
                      <InfoValue variant="body1">
                        {person?.[field.name] || '—'}
                      </InfoValue>
                    </InfoItem>
                  ))}
                </Box>
              }
            />
          </EligibilityListItem>
        </List>
      </EligibilityCard>
    );
  };

  const renderFormFields = () => {
    if (tabValue === 5) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Education Information
          </Typography>

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

    if (tabValue === 8) {
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

    if (tabValue === 9) {
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

    if (tabValue === 10) {
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
                          <MuiMenuItem value="Yes">Yes</MuiMenuItem>
                          <MuiMenuItem value="No">No</MuiMenuItem>
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

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '109, 35, 35';
  };

  return (
    <Box
      ref={profileRef}
      sx={{
        py: 4,
        px: { xs: 1.5, md: 3 },
        minHeight: '100vh',
        backgroundColor: colors.background,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={2}>
          {/* Header: wide, simple, social-profile style */}
          <GlassCard
            sx={{
              px: { xs: 2.5, md: 4 },
              py: { xs: 2.5, md: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 2, md: 3 },
            }}
          >
            <Avatar
              src={
                profilePicture
                  ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                  : undefined
              }
              onClick={handleImageZoom}
              sx={{
                width: 96,
                height: 96,
                cursor: 'pointer',
                border: `3px solid ${colors.border}`,
                bgcolor: alpha(colors.primary, 0.1),
              }}
            >
              {!profilePicture && (
                <PersonIcon sx={{ color: colors.primary, fontSize: 42 }} />
              )}
            </Avatar>

            <Box flex={1} minWidth={0}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, mb: 0.5, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                {person
                  ? `${person.firstName} ${person.middleName} ${person.lastName} ${
                      person.nameExtension || ''
                    }`.trim()
                  : 'Employee Profile'}
              </Typography>
              <Typography
                variant="body2"
                color={colors.textSecondary}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <BadgeIcon fontSize="small" />
                Employee No.: <strong>{person?.agencyEmployeeNum || '—'}</strong>
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ flexShrink: 0 }}
            >
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditOpen}
              >
                Edit Profile
              </Button>
            </Stack>
          </GlassCard>

          {/* Tabs + content: full-width like a feed */}
          <GlassCard>
            <Box
              sx={{
                borderBottom: `1px solid ${alpha(colors.primary, 0.12)}`,
                px: { xs: 1.5, md: 2.5 },
                pt: 2,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    icon={tab.icon}
                    iconPosition="start"
                    label={tab.label}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: 46,
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            <Box sx={{ px: { xs: 1.5, md: 3 }, py: 2.5 }}>
              {renderTabContentList(tabValue)}
            </Box>
          </GlassCard>
        </Stack>
      </Container>

      {/* Edit Profile Modal */}
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
              <ModalTitle>Edit Profile</ModalTitle>
              <IconButton
                onClick={handleEditClose}
                sx={{ color: colors.textLight }}
              >
                <CloseIcon />
              </IconButton>
            </ModalHeader>

            <EditModalPictureSection>
              <EditModalAvatar
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture"
                onClick={handleEditImageZoom}
              >
                {!profilePicture && <PersonIcon sx={{ fontSize: 60 }} />}
              </EditModalAvatar>
              <EditModalPictureInfo>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}
                >
                  Profile Picture
                </Typography>
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  sx={{ mb: 2 }}
                >
                  Click on image to preview. Upload a professional headshot (max
                  5MB, JPEG/PNG)
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<PhotoSizeSelectActualIcon fontSize="small" />}
                    label="High Quality"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<CropOriginalIcon fontSize="small" />}
                    label="Recommended: 400x400px"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.secondary, 0.5),
                      color: colors.textSecondary,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </EditModalPictureInfo>
              <EditModalPictureActions>
                <input
                  accept="image/*"
                  id="profile-picture-upload-modal"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handlePictureChange}
                />
                <label htmlFor="profile-picture-upload-modal">
                  <ActionButton
                    component="span"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Photo
                  </ActionButton>
                </label>
                <ActionButton
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemovePicture}
                  fullWidth
                >
                  Remove Photo
                </ActionButton>
              </EditModalPictureActions>
            </EditModalPictureSection>

            <ModalBody>
              <Box sx={{ mb: 3 }}>
                <CustomTabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
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

              {renderFormFields()}
            </ModalBody>

            {/* Fixed Bottom Action Bar - Right Aligned */}
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: colors.surface,
                padding: theme.spacing(2),
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing(2),
                boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <ActionButton variant="outlined" onClick={handleEditClose}>
                Cancel
              </ActionButton>
              <ActionButton
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </ActionButton>
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
    </Box>
  );
};

export default Profile;