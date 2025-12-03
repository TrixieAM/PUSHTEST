import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Modal,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close,
  EventNote,
  Search as SearchIcon,
  EventAvailable as ReorderIcon,
} from "@mui/icons-material";

// Import your loading and success overlays if they exist
import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';

const LeaveAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    leave_code: '',
    employeeNumber: ''
  });
  const [editAssignment, setEditAssignment] = useState(null);
  const [originalAssignment, setOriginalAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchAssignments();
    fetchLeaveTypes();
  }, []);

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments from:', `${API_BASE_URL}/leaveRoute/leave_assignment`);
      const res = await axios.get(`${API_BASE_URL}/leaveRoute/leave_assignment`);
      console.log('Raw assignments response:', res);
      console.log('Assignments data:', res.data);
      console.log('Number of assignments:', res.data?.length || 0);
      
      // Ensure we have an array and handle the data properly
      const assignmentsData = Array.isArray(res.data) ? res.data : [];
      
      // Calculate remaining hours for each assignment
      const assignmentsWithRemaining = assignmentsData.map(assignment => ({
        ...assignment,
        remaining_hours: assignment.remaining_hours !== undefined 
          ? assignment.remaining_hours 
          : (assignment.leave_hours || 0) - (assignment.used_hours || 0)
      }));
      
      setAssignments(assignmentsWithRemaining);
      setError('');
    } catch (error) {
      console.error('Error fetching assignments - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setAssignments([]);
      setError('Failed to fetch assignments');
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      console.log('Fetching leave types from:', `${API_BASE_URL}/leaveRoute/leave_table`);
      const res = await axios.get(`${API_BASE_URL}/leaveRoute/leave_table`);
      console.log('Raw leave types response:', res);
      console.log('Leave types data:', res.data);
      console.log('Number of leave types:', res.data?.length || 0);
      
      const leaveTypesData = Array.isArray(res.data) ? res.data : [];
      setLeaveTypes(leaveTypesData);
      setError('');
    } catch (error) {
      console.error('Error fetching leave types - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setLeaveTypes([]);
      setError('Failed to fetch leave types');
    }
  };

  const isDuplicateAssignment = (employeeNumber, leaveCode, excludeId = null) => {
    return assignments.some(assignment => 
      assignment.employeeNumber?.toString() === employeeNumber?.toString() && 
      assignment.leave_code === leaveCode &&
      assignment.id !== excludeId
    );
  };

  const validateForm = (employeeNumber, leaveCode) => {
    if (!employeeNumber || !leaveCode) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!employeeNumber.trim()) {
      setError('Employee Number cannot be empty');
      return false;
    }

    if (isDuplicateAssignment(employeeNumber.trim(), leaveCode)) {
      setError('This employee already has an assignment for this leave type');
      return false;
    }

    setError('');
    return true;
  };

  const handleAdd = async () => {
    const employeeNumber = newAssignment.employeeNumber?.toString().trim();
    const leaveCode = newAssignment.leave_code;

    if (!validateForm(employeeNumber, leaveCode)) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        leave_code: leaveCode,
        employeeNumber: employeeNumber
      };
      
      console.log('Adding assignment with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/leaveRoute/leave_assignment`, payload);
      console.log('Add response:', response.data);
      
      setNewAssignment({
        leave_code: '',
        employeeNumber: ''
      });
      
      setTimeout(() => {
        setLoading(false);
        setSuccessAction("adding");
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      
      await fetchAssignments();
    } catch (error) {
      console.error('Error adding assignment:', error);
      setError('Error adding assignment: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const employeeNumber = editAssignment.employeeNumber?.toString().trim();
    const leaveCode = editAssignment.leave_code;

    if (!employeeNumber || !leaveCode) {
      setError('Please fill in all required fields');
      return;
    }

    // Check for duplicate (excluding current assignment)
    if (isDuplicateAssignment(employeeNumber, leaveCode, editAssignment.id)) {
      setError('This employee already has an assignment for this leave type');
      return;
    }

    try {
      const payload = {
        leave_code: leaveCode,
        employeeNumber: employeeNumber,
        remaining_hours: parseFloat(editAssignment.remaining_hours) || 0
      };

      console.log('Updating assignment with payload:', payload);
      
      const response = await axios.put(`${API_BASE_URL}/leaveRoute/leave_assignment/${editAssignment.id}`, payload);
      console.log('Update response:', response.data);
      
      setEditAssignment(null);
      setOriginalAssignment(null);
      setIsEditing(false);
      setError('');
      
      await fetchAssignments();
      
      setSuccessAction("edit");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error updating assignment:', error);
      setError('Error updating assignment: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    try {
      console.log('Deleting assignment with id:', id);
      const response = await axios.delete(`${API_BASE_URL}/leaveRoute/leave_assignment/${id}`);
      console.log('Delete response:', response.data);
      
      setEditAssignment(null);
      setOriginalAssignment(null);
      setIsEditing(false);
      setError('');
      
      await fetchAssignments();
      
      setSuccessAction("delete");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Error deleting assignment: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleChange = (field, value) => {
    console.log(`Changing ${field} to:`, value);
    setNewAssignment({ ...newAssignment, [field]: value });
    setError(''); // Clear error when user starts typing
  };

  const handleOpenModal = (assignment) => {
    console.log('Opening modal for assignment:', assignment);
    setEditAssignment({ ...assignment });
    setOriginalAssignment({ ...assignment });
    setIsEditing(false);
    setError(''); // Clear any previous errors
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError(''); // Clear any previous errors
  };

  const handleCancelEdit = () => {
    setEditAssignment({ ...originalAssignment });
    setIsEditing(false);
    setError(''); // Clear any errors
  };

  const handleCloseModal = () => {
    setEditAssignment(null);
    setOriginalAssignment(null);
    setIsEditing(false);
    setError(''); // Clear any errors
  };

  const getLeaveTypeInfo = (leaveCode) => {
    const leaveType = leaveTypes.find(type => type.leave_code === leaveCode);
    console.log(`Finding leave type for code ${leaveCode}:`, leaveType);
    return leaveType || { 
      leave_description: leaveCode || 'Unknown', 
      leave_hours: 'N/A' 
    };
  };

  const inputStyle = { marginRight: 10, marginBottom: 10, width: 300.25 };

  // Filter assignments for display
  const filteredAssignments = assignments.filter((assignment) => {
    const employeeNumber = assignment.employeeNumber?.toString().toLowerCase() || "";
    const leaveCode = assignment.leave_code?.toString().toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return employeeNumber.includes(search) || leaveCode.includes(search);
  });

  console.log('Render - assignments:', assignments);
  console.log('Render - leaveTypes:', leaveTypes);
  console.log('Render - filteredAssignments:', filteredAssignments);

  return (
    <Container sx={{ mt: 0 }}>
      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message="Adding leave assignment record..." />
      
      {/* Success Overlay */}
      <SuccessfulOverlay open={successOpen} action={successAction} onClose={() => setSuccessOpen(false)} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        {/* Outer wrapper for header + content */}
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              backgroundColor: "#6D2323",
              color: "#ffffff",
              p: 2,
              borderRadius: "8px 8px 0 0",
              display: "flex",
              alignItems: "center",
              pb: '15px'
            }}
          >
            <EventNote
              sx={{ fontSize: "3rem", mr: 2, mt: "5px", ml: "5px" }}
            />
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Employee Leave Assignment
              </Typography>
              <Typography variant="body2">
                Manage Leave Assignment Records
              </Typography>
            </Box>
          </Box>

          {/* Content/Form */}
          <Container
            sx={{
              backgroundColor: "#fff",
              p: 3,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #6d2323",
              width: "100%",
            }}
          >
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Employee Number *
                </Typography>
                <TextField
                  value={newAssignment.employeeNumber || ''}
                  onChange={(e) => handleChange('employeeNumber', e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter employee number"
                  style={inputStyle}
                  error={!!error && !newAssignment.employeeNumber}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Leave Type *
                </Typography>
                <FormControl fullWidth required style={inputStyle} error={!!error && !newAssignment.leave_code}>
                  <Select
                    value={newAssignment.leave_code || ''}
                    onChange={(e) => handleChange('leave_code', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select Leave Type</em>
                    </MenuItem>
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.id || type.leave_code} value={type.leave_code}>
                        ({type.leave_code}) - {type.leave_description} - {type.leave_hours} hours
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Add Button */}
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={loading}
              sx={{
                mt: 3,
                width: "100%",
                backgroundColor: "#6D2323",
                color: "#FEF9E1",
                "&:hover": { backgroundColor: "#5a1d1d" },
                "&:disabled": { backgroundColor: "#ccc" }
              }}
            >
              {loading ? 'Adding...' : 'Add Assignment'}
            </Button>
          </Container>
        </Box>
      </Box>

      {/* Outer wrapper for header + content */}
      <Box sx={{ width: "100%", maxWidth: "100%", margin: "20px auto" }}>
        {/* Header */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            color: "#6d2323",
            p: 2,
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            pb: "15px",
            border: '1px solid #6d2323',
            borderBottom: 'none'
          }}
        >
          <ReorderIcon sx={{ fontSize: "3rem", mr: 2, mt: "5px", ml: "5px" }} />
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Leave Assignment Records
            </Typography>
            <Typography variant="body2">
              View and manage leave assignment information ({filteredAssignments.length} records)
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Container
          sx={{
            backgroundColor: "#fff",
            p: 3,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            border: "1px solid #6d2323",
            width: "100%",
          }}
        >
          {/* Search Section */}
          <Box sx={{ mb: 3, width: "100%" }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#6D2323", mb: 1 }}
            >
              Search Records using Employee Number or Leave Code
            </Typography>

            <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search by Employee Number or Leave Code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  width: "100%",
                  maxWidth: "800px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#6D2323",
                    },
                    "&:hover fieldset": {
                      borderColor: "#6D2323",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6D2323",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "#6D2323", marginRight: 1 }} />
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Records as Boxes */}
          <Grid container spacing={2}>
            {filteredAssignments.map((assignment) => {
              const leaveTypeInfo = getLeaveTypeInfo(assignment.leave_code);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={assignment.id || `${assignment.employeeNumber}-${assignment.leave_code}`}>
                  <Box
                    onClick={() => handleOpenModal(assignment)}
                    sx={{
                      border: "1px solid #6d2323",
                      borderRadius: 2,
                      p: 2,
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" },
                      height: "160px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    {/* Top Row */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                        >
                          Employee Number:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "#6d2323" }}
                        >
                          {assignment.employeeNumber || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Leave Code Chip on the right side */}
                      <Chip
                        label={assignment.leave_code || 'N/A'}
                        sx={{
                          backgroundColor: "transparent",
                          color: "#6d2323",
                          px: 2,
                          fontWeight: "bold",
                          fontSize: '16px',
                          mb: 2,
                          mr: -3
                        }}
                      />
                    </Box>

                    {/* Bottom Section */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "#000000", display: "block", mb: 1 }}
                      >
                        Leave Type: {leaveTypeInfo.leave_description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#000000", display: "block", mb: 1 }}
                      >
                        Total Days: {leaveTypeInfo.leave_hours ? (leaveTypeInfo.leave_hours / 8).toString().replace(/\.0+$/, "") : 0}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: "#000000", display: "block", mb: 1 }}
                      >
                        Used Days: {assignment.used_hours ? (assignment.used_hours / 8).toString().replace(/\.0+$/, "") : 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: (assignment.remaining_hours || 0) < 8 ? "#d32f2f" : "#2e7d32", 
                          display: "block", 
                          fontWeight: "bold" 
                        }}
                      >
                        Remaining: {assignment.remaining_hours ? (assignment.remaining_hours / 8).toString().replace(/\.0+$/, "") : 0} hours
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
            
            {filteredAssignments.length === 0 && (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  sx={{ textAlign: "center", color: "#6D2323", fontWeight: "bold", mt: 2 }}
                >
                  {assignments.length === 0 ? 'No assignments found. Create one above!' : 'No records match your search criteria.'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Modal */}
        <Modal
          open={!!editAssignment}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#fff",
              border: "1px solid #6d2323",
              borderRadius: 2,
              width: "75%",
              maxWidth: "700px",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {editAssignment && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    backgroundColor: "#6D2323",
                    color: "#ffffff",
                    p: 2,
                    borderRadius: "8px 8px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">
                    {isEditing ? "Edit Leave Assignment Information" : "Leave Assignment Information"}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
                    <Close />
                  </IconButton>
                </Box>

                {/* Modal Content */}
                <Box sx={{ p: 3 }}>
                  {/* Error Alert in Modal */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Employee Number
                      </Typography>
                      <TextField
                        value={editAssignment.employeeNumber || ''}
                        onChange={(e) =>
                          setEditAssignment({ ...editAssignment, employeeNumber: e.target.value })
                        }
                        fullWidth
                        disabled={!isEditing}
                        error={isEditing && !!error && !editAssignment.employeeNumber}
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000000",
                            color: "#000000"
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Leave Type
                      </Typography>
                      <FormControl 
                        fullWidth 
                        disabled={!isEditing}
                        error={isEditing && !!error && !editAssignment.leave_code}
                      >
                        <Select
                          value={editAssignment.leave_code || ''}
                          onChange={(e) =>
                            setEditAssignment({ ...editAssignment, leave_code: e.target.value })
                          }
                          displayEmpty
                          sx={{
                            "& .MuiSelect-select.Mui-disabled": {
                              WebkitTextFillColor: "#000000",
                              color: "#000000"
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Select Leave Type</em>
                          </MenuItem>
                          {leaveTypes.map((type) => (
                            <MenuItem key={type.id || type.leave_code} value={type.leave_code}>
                              ({type.leave_code}) - {type.leave_description} - {type.leave_hours} hours
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Used Hours
                      </Typography>
                      <TextField
                        type="number"
                        value={editAssignment.used_hours || 0}
                        disabled
                        fullWidth
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000000",
                            color: "#000000"
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Remaining Hours
                      </Typography>
                      <TextField
                        type="number"
                        value={editAssignment.remaining_hours || ''}
                        onChange={(e) =>
                          setEditAssignment({ ...editAssignment, remaining_hours: parseFloat(e.target.value) || 0 })
                        }
                        fullWidth
                        disabled={!isEditing}
                        inputProps={{ min: 0, step: 0.5 }}
                        sx={{
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#000000",
                            color: "#000000"
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 3,
                      gap: 2,
                    }}
                  >
                    {!isEditing ? (
                      <>
                        <Button
                          onClick={() => handleDelete(editAssignment.id)}
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          sx={{
                            color: "#ffffff",
                            backgroundColor: 'black',
                            "&:hover": { backgroundColor: '#333' }
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={handleStartEdit}
                          variant="contained"
                          startIcon={<EditIcon />}
                          sx={{ backgroundColor: "#6D2323", color: "#FEF9E1" }}
                        >
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          sx={{
                            color: "#ffffff",
                            backgroundColor: 'black',
                            "&:hover": { backgroundColor: '#333' }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdate}
                          variant="contained"
                          startIcon={<SaveIcon />}
                          sx={{ backgroundColor: "#6D2323", color: "#FEF9E1" }}
                        >
                          Save
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};

export default LeaveAssignment;