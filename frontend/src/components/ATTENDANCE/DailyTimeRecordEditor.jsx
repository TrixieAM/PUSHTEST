/* Customizable Daily Time Record - Canva-like Editor with Draggable Elements */
import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Visibility as PreviewIcon,
  DragIndicator,
} from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  Card,
  Drawer,
  TextField,
  Typography,
  Slider,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  styled,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import earistLogo from '../../assets/earistLogo.png';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const EditorContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
});

const SettingsPanel = styled(Box)({
  width: 350,
  padding: 20,
  overflowY: 'auto',
  backgroundColor: '#f5f5f5',
  borderRight: '1px solid #ddd',
});

const PreviewArea = styled(Box)({
  flex: 1,
  padding: 40,
  overflowY: 'auto',
  backgroundColor: '#e0e0e0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  position: 'relative',
});

const DTRPreview = styled(Box)(({ paperwidth, paperheight }) => ({
  width: paperwidth || '8.5in',
  minHeight: paperheight || '11in',
  backgroundColor: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  padding: 0,
  position: 'relative',
  transition: 'all 0.3s ease',
}));

const DraggableElement = styled(Box)(({ selected }) => ({
  position: 'absolute',
  cursor: 'move',
  border: selected ? '2px dashed #1976d2' : '2px dashed transparent',
  padding: 4,
  transition: 'border 0.2s',
  '&:hover': {
    border: '2px dashed #1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
  },
}));

const DEFAULT_SETTINGS = {
  // Paper Settings
  paperWidth: 816, // 8.5 inches * 96 DPI = 816px
  paperHeight: 1056, // 11 inches * 96 DPI = 1056px
  paperSize: 'letter', // 'letter', 'a4', 'legal', 'custom'
  
  // Header Settings (Draggable)
  headerText1: 'Republic of the Philippines',
  headerText1FontSize: 11,
  headerText1Top: 25,
  headerText1Left: 50,
  headerText1Width: 200,
  headerText1Height: 20,
  headerText1Bold: true,
  
  schoolName1: 'EULOGIO "AMANG" RODRIGUEZ',
  schoolName2: 'INSTITUTE OF SCIENCE & TECHNOLOGY',
  schoolFontSize: 11.5,
  schoolTop: 50,
  schoolLeft: 50,
  schoolWidth: 300,
  schoolHeight: 40,
  schoolLineHeight: 1.2,
  schoolBold: true,
  
  addressText: 'Nagtahan, Sampaloc Manila',
  addressFontSize: 11,
  addressTop: 90,
  addressLeft: 50,
  addressWidth: 200,
  addressHeight: 20,
  addressBold: true,
  
  civilServiceText: 'Civil Service Form No. 48',
  civilServiceFontSize: 8,
  civilServiceTop: 110,
  civilServiceLeft: 50,
  civilServiceWidth: 150,
  civilServiceHeight: 15,
  civilServiceBold: true,
  
  titleText: 'DAILY TIME RECORD',
  titleFontSize: 16,
  titleTop: 130,
  titleLeft: 50,
  titleWidth: 250,
  titleHeight: 30,
  titleBold: true,
  
  // Logo Settings (Draggable)
  logoWidth: 50,
  logoHeight: 50,
  logoTop: 25,
  logoLeft: 700,
  showLogo: true,
  
  // Table Settings
  table1Top: 200,
  table1Left: 10,
  table1Width: 400,
  table1Height: 400,
  table2Top: 200,
  table2Left: 430,
  table2Width: 400,
  table2Height: 400,
  showTables: true,
};

// Paper size presets (in pixels, 96 DPI)
const PAPER_SIZES = {
  letter: { width: 816, height: 1056, label: 'Letter (8.5" × 11")' },
  a4: { width: 794, height: 1123, label: 'A4 (8.27" × 11.69")' },
  legal: { width: 816, height: 1344, label: 'Legal (8.5" × 14")' },
  tabloid: { width: 1056, height: 1632, label: 'Tabloid (11" × 17")' },
  custom: { width: 816, height: 1056, label: 'Custom Size' },
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const DailyTimeRecordEditor = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tabValue, setTabValue] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);
  
  const [previewData, setPreviewData] = useState({
    employeeName: 'GARCIA, SHERYL CALIV',
    startDate: 'January 1, 2026',
    endDate: 'January 31, 2026',
    month: 'JANUARY',
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    if (window.confirm('Reset all settings to default?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('dtrEditorSettings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('dtrEditorSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
      alert('Settings loaded!');
    }
  };

  useEffect(() => {
    // Auto-load saved settings on mount
    const saved = localStorage.getItem('dtrEditorSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Drag handlers
  const handleDragStart = (e, elementType) => {
    setSelectedElement(elementType);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - settings[`${elementType}Left`],
      y: e.clientY - settings[`${elementType}Top`],
    });
    e.stopPropagation();
  };

  const handleDragMove = (e) => {
    if (!isDragging || !selectedElement) return;
    
    const newLeft = e.clientX - dragStart.x;
    const newTop = e.clientY - dragStart.y;
    
    updateSetting(`${selectedElement}Left`, Math.max(0, newLeft));
    updateSetting(`${selectedElement}Top`, Math.max(0, newTop));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, selectedElement, dragStart]);

  // Handle paper size change
  const handlePaperSizeChange = (size) => {
    if (PAPER_SIZES[size]) {
      updateSetting('paperSize', size);
      updateSetting('paperWidth', PAPER_SIZES[size].width);
      updateSetting('paperHeight', PAPER_SIZES[size].height);
    }
  };

  // Render table headers and data rows
  const renderTableHeader = () => {
    const dataFontSize = '10px';
    return (
      <thead style={{ textAlign: 'center' }}>
        <tr>
          <th
            rowSpan="2"
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
              padding: '4px 2px',
            }}
          >
            DAY
          </th>
          <th
            colSpan="2"
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
              padding: '4px 2px',
            }}
          >
            A.M.
          </th>
          <th
            colSpan="2"
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
              padding: '4px 2px',
            }}
          >
            P.M.
          </th>
          <th
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
              padding: '4px 2px',
            }}
          >
            Late
          </th>
          <th
            style={{
              border: '1px solid black',
              fontFamily: 'Arial, serif',
              fontSize: dataFontSize,
              padding: '4px 2px',
            }}
          >
            Undertime
          </th>
        </tr>
        <tr>
          <td
            style={{
              border: '1px solid black',
              fontSize: '8px',
              fontFamily: 'Arial, serif',
              padding: '2px',
            }}
          >
            Arrival
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '8px',
              fontFamily: 'Arial, serif',
              padding: '2px',
            }}
          >
            Departure
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '8px',
              fontFamily: 'Arial, serif',
              padding: '2px',
            }}
          >
            Arrival
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '8px',
              fontFamily: 'Arial, serif',
              padding: '2px',
            }}
          >
            Departure
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '8px',
              fontFamily: 'Arial, serif',
              padding: '2px',
            }}
          >
            Min
          </td>
          <td
            style={{
              border: '1px solid black',
              fontSize: '8px',
              fontFamily: 'Arial, serif',
              padding: '2px',
            }}
          >
            Min
          </td>
        </tr>
      </thead>
    );
  };

  const cellStyle = {
    border: '1px solid black',
    textAlign: 'center',
    padding: '2px',
    fontFamily: 'Arial, serif',
    fontSize: '8px',
    height: '12px',
  };

  const renderTableBody = () => (
    <tbody>
      {Array.from({ length: 15 }, (_, i) => {
        const day = (i + 1).toString().padStart(2, '0');
        return (
          <tr key={i}>
            <td style={cellStyle}>{day}</td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
        );
      })}
      <tr>
        <td colSpan="7" style={{ padding: '8px 5px', fontSize: '7px', fontFamily: 'Times New Roman, serif' }}>
          <hr style={{ borderTop: '1px solid black', width: '100%', margin: '0 0 4px 0' }} />
          <p style={{ textAlign: 'justify', margin: '3px 0', lineHeight: '1.1' }}>
            I CERTIFY on my honor that the above is a true and correct report of the hours of work performed.
          </p>
          <div style={{ width: '50%', marginLeft: 'auto', textAlign: 'center', marginTop: '8px' }}>
            <hr style={{ borderTop: '1px solid black', margin: 0 }} />
            <p style={{ fontSize: '7px', margin: '3px 0 0 0' }}>Signature</p>
          </div>
          <div style={{ width: '100%', marginTop: '8px' }}>
            <hr style={{ borderTop: '1px solid black', width: '100%', margin: 0 }} />
            <p style={{ paddingLeft: '20px', fontSize: '7px', margin: '3px 0 0 0' }}>
              Verified as to prescribed office hours.
            </p>
          </div>
          <div style={{ width: '80%', marginLeft: 'auto', marginTop: '8px', textAlign: 'center' }}>
            <hr style={{ borderTop: '1px solid black', margin: 0 }} />
            <p style={{ fontSize: '7px', margin: '2px 0 0 0' }}>In-Charge</p>
            <p style={{ fontSize: '6px', margin: '0' }}>(Signature Over Printed Name)</p>
          </div>
        </td>
      </tr>
    </tbody>
  );

  const printCanvas = async () => {
    if (!previewRef.current) return;
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
      });

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const dtrWidth = 8;
      const dtrHeight = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const xOffset = (pageWidth - dtrWidth) / 2;
      const yOffset = (pageHeight - dtrHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, dtrWidth, dtrHeight);
      pdf.autoPrint();
      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error generating print view:', error);
    }
  };

  return (
    <EditorContainer>
      {/* Settings Panel */}
      <SettingsPanel>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">DTR Canvas Editor</Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          💡 Drag elements on the canvas to reposition them
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            fullWidth
          >
            Save
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={resetSettings}
            fullWidth
          >
            Reset
          </Button>
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={printCanvas}
          fullWidth
          sx={{ mb: 2 }}
        >
          Print Preview
        </Button>

        <Divider sx={{ mb: 2 }} />

        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Paper" />
          <Tab label="Text" />
          <Tab label="Logo" />
          <Tab label="Tables" />
        </Tabs>

        {/* Paper Size Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle2" gutterBottom>Paper Size Preset</Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Select
              value={settings.paperSize}
              onChange={(e) => handlePaperSizeChange(e.target.value)}
            >
              {Object.keys(PAPER_SIZES).map((key) => (
                <MenuItem key={key} value={key}>
                  {PAPER_SIZES[key].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Custom Paper Size</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.paperWidth}
                onChange={(e) => {
                  updateSetting('paperWidth', parseInt(e.target.value) || 816);
                  updateSetting('paperSize', 'custom');
                }}
                sx={{ mb: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.paperHeight}
                onChange={(e) => {
                  updateSetting('paperHeight', parseInt(e.target.value) || 1056);
                  updateSetting('paperSize', 'custom');
                }}
                sx={{ mb: 1 }}
              />
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Current size: {settings.paperWidth}px × {settings.paperHeight}px
            <br />
            ({(settings.paperWidth / 96).toFixed(2)}" × {(settings.paperHeight / 96).toFixed(2)}")
          </Typography>
        </TabPanel>

        {/* Text Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Republic Text
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={settings.headerText1}
            onChange={(e) => updateSetting('headerText1', e.target.value)}
            sx={{ mb: 1 }}
          />
          
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                type="number"
                size="small"
                fullWidth
                value={settings.headerText1Width}
                onChange={(e) => updateSetting('headerText1Width', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                type="number"
                size="small"
                fullWidth
                value={settings.headerText1Height}
                onChange={(e) => updateSetting('headerText1Height', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Font"
                type="number"
                size="small"
                fullWidth
                value={settings.headerText1FontSize}
                onChange={(e) => updateSetting('headerText1FontSize', parseInt(e.target.value) || 11)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            School Name
          </Typography>
          <TextField
            label="Line 1"
            fullWidth
            size="small"
            value={settings.schoolName1}
            onChange={(e) => updateSetting('schoolName1', e.target.value)}
            sx={{ mb: 1 }}
          />

          <TextField
            label="Line 2"
            fullWidth
            size="small"
            value={settings.schoolName2}
            onChange={(e) => updateSetting('schoolName2', e.target.value)}
            sx={{ mb: 1 }}
          />

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                type="number"
                size="small"
                fullWidth
                value={settings.schoolWidth}
                onChange={(e) => updateSetting('schoolWidth', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                type="number"
                size="small"
                fullWidth
                value={settings.schoolHeight}
                onChange={(e) => updateSetting('schoolHeight', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Font"
                type="number"
                size="small"
                fullWidth
                value={settings.schoolFontSize}
                onChange={(e) => updateSetting('schoolFontSize', parseInt(e.target.value) || 11)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Address
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={settings.addressText}
            onChange={(e) => updateSetting('addressText', e.target.value)}
            sx={{ mb: 1 }}
          />

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                type="number"
                size="small"
                fullWidth
                value={settings.addressWidth}
                onChange={(e) => updateSetting('addressWidth', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                type="number"
                size="small"
                fullWidth
                value={settings.addressHeight}
                onChange={(e) => updateSetting('addressHeight', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Font"
                type="number"
                size="small"
                fullWidth
                value={settings.addressFontSize}
                onChange={(e) => updateSetting('addressFontSize', parseInt(e.target.value) || 11)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Civil Service Text
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={settings.civilServiceText}
            onChange={(e) => updateSetting('civilServiceText', e.target.value)}
            sx={{ mb: 1 }}
          />

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                type="number"
                size="small"
                fullWidth
                value={settings.civilServiceWidth}
                onChange={(e) => updateSetting('civilServiceWidth', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                type="number"
                size="small"
                fullWidth
                value={settings.civilServiceHeight}
                onChange={(e) => updateSetting('civilServiceHeight', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Font"
                type="number"
                size="small"
                fullWidth
                value={settings.civilServiceFontSize}
                onChange={(e) => updateSetting('civilServiceFontSize', parseInt(e.target.value) || 8)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Title
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={settings.titleText}
            onChange={(e) => updateSetting('titleText', e.target.value)}
            sx={{ mb: 1 }}
          />

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                type="number"
                size="small"
                fullWidth
                value={settings.titleWidth}
                onChange={(e) => updateSetting('titleWidth', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                type="number"
                size="small"
                fullWidth
                value={settings.titleHeight}
                onChange={(e) => updateSetting('titleHeight', parseInt(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Font"
                type="number"
                size="small"
                fullWidth
                value={settings.titleFontSize}
                onChange={(e) => updateSetting('titleFontSize', parseInt(e.target.value) || 16)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Logo Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showLogo}
                onChange={(e) => updateSetting('showLogo', e.target.checked)}
              />
            }
            label="Show Logo"
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Logo Size</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.logoWidth}
                onChange={(e) => updateSetting('logoWidth', parseInt(e.target.value) || 50)}
                disabled={!settings.showLogo}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.logoHeight}
                onChange={(e) => updateSetting('logoHeight', parseInt(e.target.value) || 50)}
                disabled={!settings.showLogo}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption">Use Sliders</Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Logo Width: {settings.logoWidth}px
          </Typography>
          <Slider
            value={settings.logoWidth}
            onChange={(e, v) => updateSetting('logoWidth', v)}
            min={30}
            max={150}
            disabled={!settings.showLogo}
            sx={{ mb: 2 }}
          />

          <Typography variant="caption">Logo Height: {settings.logoHeight}px</Typography>
          <Slider
            value={settings.logoHeight}
            onChange={(e, v) => updateSetting('logoHeight', v)}
            min={30}
            max={150}
            disabled={!settings.showLogo}
            sx={{ mb: 2 }}
          />
        </TabPanel>

        {/* Tables Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showTables}
                onChange={(e) => updateSetting('showTables', e.target.checked)}
              />
            }
            label="Show Tables"
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Table 1 Size
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.table1Width}
                onChange={(e) => updateSetting('table1Width', parseInt(e.target.value) || 400)}
                disabled={!settings.showTables}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.table1Height}
                onChange={(e) => updateSetting('table1Height', parseInt(e.target.value) || 400)}
                disabled={!settings.showTables}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Table 2 Size
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Width (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.table2Width}
                onChange={(e) => updateSetting('table2Width', parseInt(e.target.value) || 400)}
                disabled={!settings.showTables}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Height (px)"
                type="number"
                size="small"
                fullWidth
                value={settings.table2Height}
                onChange={(e) => updateSetting('table2Height', parseInt(e.target.value) || 400)}
                disabled={!settings.showTables}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontSize: '0.85rem' }}>
            💡 Tip: Drag the tables on the canvas to reposition them
          </Typography>
        </TabPanel>
      </SettingsPanel>

      {/* Canvas Preview Area */}
      <PreviewArea>
        <DTRPreview 
          ref={previewRef}
          paperwidth={`${settings.paperWidth}px`}
          paperheight={`${settings.paperHeight}px`}
        >
          {/* Draggable Header Text */}
          <DraggableElement
            selected={selectedElement === 'headerText1'}
            onMouseDown={(e) => handleDragStart(e, 'headerText1')}
            style={{
              top: `${settings.headerText1Top}px`,
              left: `${settings.headerText1Left}%`,
              transform: 'translateX(-50%)',
              width: settings.headerText1Width > 0 ? `${settings.headerText1Width}px` : 'auto',
              minHeight: settings.headerText1Height > 0 ? `${settings.headerText1Height}px` : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              style={{
                fontSize: `${settings.headerText1FontSize}px`,
                fontWeight: settings.headerText1Bold ? 'bold' : 'normal',
                fontFamily: 'Arial, "Times New Roman", serif',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {settings.headerText1}
            </Typography>
          </DraggableElement>

          {/* Draggable School Name */}
          <DraggableElement
            selected={selectedElement === 'school'}
            onMouseDown={(e) => handleDragStart(e, 'school')}
            style={{
              top: `${settings.schoolTop}px`,
              left: `${settings.schoolLeft}%`,
              transform: 'translateX(-50%)',
              width: settings.schoolWidth > 0 ? `${settings.schoolWidth}px` : 'auto',
              minHeight: settings.schoolHeight > 0 ? `${settings.schoolHeight}px` : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              style={{
                fontSize: `${settings.schoolFontSize}px`,
                fontWeight: settings.schoolBold ? 'bold' : 'normal',
                fontFamily: 'Arial, "Times New Roman", serif',
                textAlign: 'center',
                lineHeight: settings.schoolLineHeight,
                whiteSpace: 'nowrap',
              }}
            >
              {settings.schoolName1}
              <br />
              {settings.schoolName2}
            </Typography>
          </DraggableElement>

          {/* Draggable Address */}
          <DraggableElement
            selected={selectedElement === 'address'}
            onMouseDown={(e) => handleDragStart(e, 'address')}
            style={{
              top: `${settings.addressTop}px`,
              left: `${settings.addressLeft}%`,
              transform: 'translateX(-50%)',
              width: settings.addressWidth > 0 ? `${settings.addressWidth}px` : 'auto',
              minHeight: settings.addressHeight > 0 ? `${settings.addressHeight}px` : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              style={{
                fontSize: `${settings.addressFontSize}px`,
                fontWeight: settings.addressBold ? 'bold' : 'normal',
                fontFamily: 'Arial, serif',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {settings.addressText}
            </Typography>
          </DraggableElement>

          {/* Draggable Civil Service Text */}
          <DraggableElement
            selected={selectedElement === 'civilService'}
            onMouseDown={(e) => handleDragStart(e, 'civilService')}
            style={{
              top: `${settings.civilServiceTop}px`,
              left: `${settings.civilServiceLeft}%`,
              transform: 'translateX(-50%)',
              width: settings.civilServiceWidth > 0 ? `${settings.civilServiceWidth}px` : 'auto',
              minHeight: settings.civilServiceHeight > 0 ? `${settings.civilServiceHeight}px` : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              style={{
                fontSize: `${settings.civilServiceFontSize}px`,
                fontWeight: settings.civilServiceBold ? 'bold' : 'normal',
                fontFamily: 'Arial, serif',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {settings.civilServiceText}
            </Typography>
          </DraggableElement>

          {/* Draggable Title */}
          <DraggableElement
            selected={selectedElement === 'title'}
            onMouseDown={(e) => handleDragStart(e, 'title')}
            style={{
              top: `${settings.titleTop}px`,
              left: `${settings.titleLeft}%`,
              transform: 'translateX(-50%)',
              width: settings.titleWidth > 0 ? `${settings.titleWidth}px` : 'auto',
              minHeight: settings.titleHeight > 0 ? `${settings.titleHeight}px` : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h6"
              style={{
                fontSize: `${settings.titleFontSize}px`,
                fontWeight: settings.titleBold ? 'bold' : 'normal',
                fontFamily: 'Times New Roman, serif',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {settings.titleText}
            </Typography>
          </DraggableElement>

          {/* Draggable Logo */}
          {settings.showLogo && (
            <DraggableElement
              selected={selectedElement === 'logo'}
              onMouseDown={(e) => handleDragStart(e, 'logo')}
              style={{
                top: `${settings.logoTop}px`,
                left: `${settings.logoLeft}px`,
              }}
            >
              <img
                src={earistLogo}
                alt="Logo"
                width={settings.logoWidth}
                height={settings.logoHeight}
                style={{ display: 'block' }}
              />
            </DraggableElement>
          )}

          {/* Draggable Table 1 */}
          {settings.showTables && (
            <DraggableElement
              selected={selectedElement === 'table1'}
              onMouseDown={(e) => handleDragStart(e, 'table1')}
              style={{
                top: `${settings.table1Top}px`,
                left: `${settings.table1Left}px`,
                width: `${settings.table1Width}px`,
                height: `${settings.table1Height}px`,
              }}
            >
              <Paper elevation={2} sx={{ overflow: 'auto', height: '100%' }}>
                <table
                  style={{
                    border: '1px solid black',
                    borderCollapse: 'collapse',
                    width: '100%',
                    backgroundColor: 'white',
                  }}
                >
                  {renderTableHeader()}
                  {renderTableBody()}
                </table>
              </Paper>
            </DraggableElement>
          )}

          {/* Draggable Table 2 */}
          {settings.showTables && (
            <DraggableElement
              selected={selectedElement === 'table2'}
              onMouseDown={(e) => handleDragStart(e, 'table2')}
              style={{
                top: `${settings.table2Top}px`,
                left: `${settings.table2Left}px`,
                width: `${settings.table2Width}px`,
                height: `${settings.table2Height}px`,
              }}
            >
              <Paper elevation={2} sx={{ overflow: 'auto', height: '100%' }}>
                <table
                  style={{
                    border: '1px solid black',
                    borderCollapse: 'collapse',
                    width: '100%',
                    backgroundColor: 'white',
                  }}
                >
                  {renderTableHeader()}
                  {renderTableBody()}
                </table>
              </Paper>
            </DraggableElement>
          )}
        </DTRPreview>
      </PreviewArea>
    </EditorContainer>
  );
};

export default DailyTimeRecordEditor;
