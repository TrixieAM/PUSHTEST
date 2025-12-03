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
  Reorder as ReorderIcon,
} from "@mui/icons-material";

import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';

const LeaveTable = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeaveType, setNewLeaveType] = useState({
    leave_description: '',
    leave_code: '',
    leave_hours: ''
  });
  const [editLeaveType, setEditLeaveType] = useState(null);
  const [originalLeaveType, setOriginalLeaveType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaveRoute/leave_table`);
      setLeaveTypes(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      // Filter out empty fields
      const filteredLeaveType = Object.fromEntries(
        Object.entries(newLeaveType).filter(([_, value]) => value !== '')
      );
      
      await axios.post(`${API_BASE_URL}/leaveRoute/leave_table`, filteredLeaveType);
      setNewLeaveType({
        leave_description: '',
        leave_code: '',
        leave_hours: ''
      });
      setTimeout(() => {
        setLoading(false);
        setSuccessAction("adding");
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchLeaveTypes();
    } catch (error) {
      console.error('Error adding data:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE_URL}/leaveRoute/leave_table/${editLeaveType.id}`, editLeaveType);
      setEditLeaveType(null);
      setOriginalLeaveType(null);
      setIsEditing(false);
      fetchLeaveTypes();
      setSuccessAction("edit");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/leaveRoute/leave_table/${id}`);
      setEditLeaveType(null);
      setOriginalLeaveType(null);
      setIsEditing(false);
      fetchLeaveTypes();
      setSuccessAction("delete");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditLeaveType({ ...editLeaveType, [field]: value });
    } else {
      setNewLeaveType({ ...newLeaveType, [field]: value });
    }
  };

  const handleOpenModal = (leaveType) => {
    setEditLeaveType({ ...leaveType });
    setOriginalLeaveType({ ...leaveType });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditLeaveType({ ...originalLeaveType });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditLeaveType(null);
    setOriginalLeaveType(null);
    setIsEditing(false);
  };

  const inputStyle = { marginRight: 10, marginBottom: 10, width: 300.25 };

  const fieldLabels = {
    leave_description: 'Leave Description',
    leave_code: 'Leave Code',
    leave_hours: 'Leave Days '
  };

  return (
    <Container sx={{ mt: 0 }}>
      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message="Adding leave type record..." />
      
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
        <Box sx={{ width: "75%", maxWidth: "100%" }}>
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
                Leave Types
              </Typography>
              <Typography variant="body2">
                Manage Leave Types and Hours
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
            <Grid container spacing={3}>
              {Object.keys(newLeaveType).map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    {fieldLabels[field]}
                  </Typography>
                  <TextField
                    value={newLeaveType[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    fullWidth
                    style={inputStyle}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Add Button */}
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                mt: 3,
                width: "100%",
                backgroundColor: "#6D2323",
                color: "#FEF9E1",
                "&:hover": { backgroundColor: "#5a1d1d" },
              }}
            >
              Add
            </Button>
          </Container>
        </Box>
      </Box>

      {/* Outer wrapper for header + content */}
      <Box sx={{ width: "75%", maxWidth: "100%", margin: "20px auto" }}>
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
              Leave Types Records
            </Typography>
            <Typography variant="body2">
              View and manage leave type information
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
              Search Records using Leave Description or Code
            </Typography>

            <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search by Description or Code"
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
            {leaveTypes
              .filter((leaveType) => {
                const description = leaveType.leave_description?.toLowerCase() || "";
                const code = leaveType.leave_code?.toLowerCase() || "";
                const search = searchTerm.toLowerCase();
                return description.includes(search) || code.includes(search);
              })
              .map((leaveType) => (
                <Grid item xs={12} sm={6} md={4} key={leaveType.id}>
                  <Box
                    onClick={() => handleOpenModal(leaveType)}
                    sx={{
                      border: "1px solid #6d2323",
                      borderRadius: 2,
                      p: 2,
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" },
                      height: "100px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "black", mb: 1 }}
                      >
                        Leave Code:{leaveType.leave_code}
                      </Typography>
                      <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "#6d2323", mb: 2 }}
                        >
                          Days: {leaveType.leave_hours 
                            ? (leaveType.leave_hours / 8)
                            : 'Not specified'}
                        </Typography>
                    </Box>

                    <Box>
                      <Chip
                        label={leaveType.leave_description || 'No Description'}
                        sx={{
                          border: "solid 1px #6d2323",
                          color: "#6d2323",
                          borderRadius: "50px",
                          px: 2,
                          fontWeight: "bold",
                          maxWidth: "100%",
                          mb: 2
                        }}
                      />
                      
                     
                    </Box>
                  </Box>
                </Grid>
              ))}
            {leaveTypes.filter((leaveType) => {
              const description = leaveType.leave_description?.toLowerCase() || "";
              const code = leaveType.leave_code?.toLowerCase() || "";
              const search = searchTerm.toLowerCase();
              return description.includes(search) || code.includes(search);
            }).length === 0 && (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  sx={{ textAlign: "center", color: "#6D2323", fontWeight: "bold", mt: 2 }}
                >
                  No Records Found
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Modal */}
        <Modal
          open={!!editLeaveType}
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
              maxWidth: "600px",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {editLeaveType && (
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
                    {isEditing ? "Edit Leave Type Information" : "Leave Type Information"}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
                    <Close />
                  </IconButton>
                </Box>

                {/* Modal Content */}
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {Object.keys(newLeaveType).map((field) => (
                      <Grid item xs={12} key={field}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                          {fieldLabels[field]}
                        </Typography>
                        <TextField
                          value={editLeaveType[field] || ''}
                          onChange={(e) =>
                            setEditLeaveType({ ...editLeaveType, [field]: e.target.value })
                          }
                          fullWidth
                          disabled={!isEditing}
                          sx={{
                            "& .MuiInputBase-input.Mui-disabled": {
                              WebkitTextFillColor: "#000000",
                              color: "#000000"
                            }
                          }}
                        />
                      </Grid>
                    ))}
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
                          onClick={() => handleDelete(editLeaveType.id)}
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          sx={{
                            color: "#ffffff",
                            backgroundColor: 'black'
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
                            backgroundColor: 'black'
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

export default LeaveTable;