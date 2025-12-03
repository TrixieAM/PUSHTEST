import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LeaveCredits from './LeaveCredits';

import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  EventNote,
  FilterList as FilterIcon,
  EventAvailable as ReorderIcon,
} from "@mui/icons-material";

import LoadingOverlay from '../LoadingOverlay';
import SuccessfulOverlay from '../SuccessfulOverlay';
import LeaveDatePickerModal from './LeaveDatePicker';

const LeaveRequestUser = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    leave_code: '',
    leave_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");
  const [monthFilter, setMonthFilter] = useState('');
  const [personID, setPersonID] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

    
  // toggle function for multiple dates
      const toggleDate = (dateStr) => {
        setSelectedDates((prev) =>
          prev.includes(dateStr)
            ? prev.filter((d) => d !== dateStr)
            : [...prev, dateStr]
        );
      };

    


  const months = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const statusOptions = [
    {
      value: '0',
      label: 'Pending',
      backgroundColor: '#FEF9E1',
      textColor: '#6D2323',
      borderColor: '#6D2323'
    },
    {
      value: '1',
      label: 'Approved by Manager and Pending for HR',
      backgroundColor: '#E8F5E9',
      textColor: '#2E7D32',
      borderColor: '#2E7D32'
    },
    {
      value: '2',
      label: 'Approved by HR',
      backgroundColor: '#E3F2FD',
      textColor: '#1565C0',
      borderColor: '#1565C0'
    },
    {
      value: '3',
      label: 'Denied by Manager/HR',
      backgroundColor: '#FFEBEE',
      textColor: '#C62828',
      borderColor: '#C62828'
    }
  ];

  useEffect(() => {
    // Retrieve and decode the token from local storage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPersonID(decoded.employeeNumber);
        console.log('Decoded employee number:', decoded.employeeNumber);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.warn("No token found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (personID) {
      console.log('PersonID set, fetching data for:', personID);
      fetchLeaveRequests();
      fetchLeaveTypes();
    }
  }, [personID]);

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/leaveRoute/leave_request/${personID}`
      );
      setLeaveRequests(res.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };


  const fetchLeaveTypes = async () => {
    try {
      console.log('Fetching leave types...');
      const res = await axios.get(`${API_BASE_URL}/leaveRoute/leave_table`);
      console.log('Leave types:', res.data);
      setLeaveTypes(res.data);
    } catch (error) {
      console.error('Error fetching leave types:', error.response || error);
      alert('Error fetching leave types. Please check if the server is running.');
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    
    // Handle both Date objects and date strings
    const date = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateObj);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Updated handleAdd function with better error handling and logging
  const handleAdd = async () => {
    if (!newLeaveRequest.leave_code) {
      alert("Please select a leave type.");
      return;
    }
    if (selectedDates.length === 0) {
      alert("Please pick at least one leave date.");
      return;
    }

    console.log('Submitting leave request:', {
      employeeNumber: personID,
      leave_code: newLeaveRequest.leave_code,
      leave_dates: selectedDates,
      status: "0",
    });

    setLoading(true);
    try {
      const payload = {
        employeeNumber: personID,
        leave_code: newLeaveRequest.leave_code,
        leave_dates: selectedDates, // selectedDates should already be in YYYY-MM-DD format
        status: "0",
      };

      const response = await axios.post(`${API_BASE_URL}/leaveRoute/leave_request`, payload);
      console.log('Server response:', response.data);

      // Show success overlay
      setSuccessAction("Leave Request Submitted");
      setSuccessOpen(true);

      // Auto close success overlay after 3 seconds
      setTimeout(() => setSuccessOpen(false), 3000);

      // Refresh leave requests
      await fetchLeaveRequests();

      // Reset form
      setNewLeaveRequest({ leave_code: "", leave_date: "" });
      setSelectedDates([]);
    } catch (err) {
      console.error("Full error:", err.response?.data || err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error occurred";
      alert("Error submitting leave request: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };






  const handleChange = (field, value) => {
    setNewLeaveRequest({ ...newLeaveRequest, [field]: value });
  };

  const getLeaveTypeInfo = (leaveCode) => {
    return leaveTypes.find(type => type.leave_code === leaveCode) || { 
      leave_description: leaveCode, 
      leave_hours: 0 
    };
  };

  

  const filteredLeaveRequests = leaveRequests.filter((request) => {
    if (!monthFilter) return true;
    const requestDate = new Date(request.leave_date);
    const requestMonth = String(requestDate.getMonth() + 1).padStart(2, '0');
    return requestMonth === monthFilter;
  });

  // Sort by date (newest first)
  const sortedLeaveRequests = filteredLeaveRequests.sort((a, b) => 
    new Date(b.leave_date) - new Date(a.leave_date)
  );

  const inputStyle = { marginRight: 10, marginBottom: 10, width: 300.25 };

const mapStatus = (status) => {
  switch (status) {
    case 0:
    case "0":
      return {
        label: "Pending",
        backgroundColor: "#FEF9E1",
        textColor: "#6D2323",
        borderColor: "#6D2323"
      };
    case 1:
    case "1":
      return {
        label: "Approved by Manager\nPending for HR",
        backgroundColor: "#E8F5E9",
        textColor: "#2E7D32",
        borderColor: "#2E7D32"
      };
    case 2:
    case "2":
      return {
        label: "Approved by HR",
        backgroundColor: "#E3F2FD",
        textColor: "#1565C0",
        borderColor: "#1565C0"
      };
    case 3:
    case "3":
      return {
        label: "Denied by Manager/HR",
        backgroundColor: "#FFEBEE",
        textColor: "#C62828",
        borderColor: "#C62828"
      };
    default:
      return {
        label: "Unknown",
        backgroundColor: "#f5f5f5",
        textColor: "#333",
        borderColor: "#999"
      };
  }
};




  return (
    <Container sx={{ mt: 0 }}>
      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message="Submitting leave request..." />
      
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
        <Box sx={{ width: "90%", maxWidth: "100%" }}>
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
                Employee Leave Request
              </Typography>
              <Typography variant="body2">
                Submit and view your leave requests
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
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, }}>
                  Employee Number
                </Typography>
                <TextField
                  value={personID}
                  disabled
                  fullWidth
                  style={inputStyle}
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#000000",
                      color: "#000000",
                      
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Leave Type
                </Typography>
                <FormControl fullWidth required style={inputStyle}>
                  <Select
                    value={newLeaveRequest.leave_code}
                    onChange={(e) => handleChange('leave_code', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select Leave Type</em>
                    </MenuItem>
                    {leaveTypes.map((type) => (
                      <MenuItem key={type.id} value={type.leave_code}>
                        ({type.leave_code}) - {type.leave_description} 
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
               
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Leave Date(s) *
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setDateModalOpen(true)}
                  sx={{ width: "75%", height: "56px", border: '1px solid #6d2323', color: '#000' }}
                >
                  {selectedDates.length > 0
                    ? `${selectedDates.length} date(s) selected`
                    : "Pick Leave Dates"}
                </Button>

                <LeaveDatePickerModal
                  open={dateModalOpen}
                  onClose={() => {
                    setNewLeaveRequest({ ...newLeaveRequest, leave_date: selectedDates.join(",") });
                    setDateModalOpen(false);
                  }}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Leave Credits
                </Typography>
                  <LeaveCredits personID={personID} />

              </Grid>




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
              Submit Leave Request
            </Button>
          </Container>
        </Box>
      </Box>

      {/* Outer wrapper for records section */}
      <Box sx={{ width: "90%", maxWidth: "100%", margin: "20px auto" }}>
        {/* Header */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            color: "#6d2323",
            p: 2,
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: "15px",
            border: '1px solid #6d2323',
            borderBottom: 'none'
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ReorderIcon sx={{ fontSize: "3rem", mr: 2, mt: "5px", ml: "5px" }} />
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                My Leave Request Records
              </Typography>
              <Typography variant="body2">
                View your submitted leave requests
              </Typography>
            </Box>
          </Box>

          {/* Month Filter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FilterIcon sx={{ color: "#6d2323" }} />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: "#6d2323" }}>Filter by Month</InputLabel>
              <Select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                label="Filter by Month"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6d2323",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6d2323",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6d2323",
                  },
                }}
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          {/* Records as rows */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sortedLeaveRequests.length === 0 ? (
              <Typography
                variant="body1"
                sx={{ textAlign: "center", color: "#6D2323", fontWeight: "bold", mt: 2 }}
              >
                No Leave Requests Found
              </Typography>
            ) : (
              sortedLeaveRequests.map((leaveRequest) => {
                const leaveTypeInfo = getLeaveTypeInfo(leaveRequest.leave_code);
                
                return (
                  <Card
                    key={leaveRequest.id}
                    sx={{
                      border: "1px solid #6d2323",
                      borderRadius: 2,
                      width: "100%",
                      "&:hover": { boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" },
                      position: "relative"
                    }}
                  >
                    <CardContent sx={{ pr: 4 }}>
                      <Grid container spacing={3} alignItems="center">
                        {/* Employee Number */}
                        <Grid item xs={12} sm={2}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#6d2323", mb: 0.5 }}
                            >
                              Employee #
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                              {leaveRequest.employeeNumber}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Leave Type */}
                        <Grid item xs={12} sm={2.5}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#6d2323", mb: 0.5 }}
                            >
                              Leave Type
                            </Typography>
                            <Chip
                              label={`${leaveTypeInfo.leave_code} - ${leaveTypeInfo.leave_description}`}
                              sx={{
                                backgroundColor: "#6d2323",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: '12px'
                              }}
                            />
                          </Box>
                        </Grid>

                        {/* Leave Date */}
                        <Grid item xs={12} sm={2.5}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#6d2323", mb: 0.5 }}
                            >
                              Leave Date
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                              {leaveRequest.leave_date 
                                ? new Date(leaveRequest.leave_date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Date Submitted */}
                        <Grid item xs={12} sm={1.5}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#6d2323", mb: 0.5 }}
                            >
                              Submitted
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#666" }}>
                              {new Date().toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Status Badge - Positioned at the right end */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: "50px",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {(() => {
                        const { label, backgroundColor, textColor, borderColor } = mapStatus(leaveRequest.status);
                        return (
                            <Chip
                            label={label}
                            sx={{
                                backgroundColor,
                                color: textColor,
                                border: `1px solid ${borderColor}`,
                                fontWeight: "bold",
                                fontSize: "13px",
                                px: 2,
                                py: 1,
                                minWidth: "150px",
                                maxWidth: "160px",
                                height: "auto",
                                whiteSpace: "pre-line",   // <-- allows line breaks like \n
                                textAlign: "center",
                                "& .MuiChip-label": {
                                whiteSpace: "pre-line", // ensures \n becomes 2 lines
                                lineHeight: "1.2"
                                }
                            }}
                            />
                        );
                        })()}

                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </Container>
      </Box>
    </Container>
  );
};

export default LeaveRequestUser;