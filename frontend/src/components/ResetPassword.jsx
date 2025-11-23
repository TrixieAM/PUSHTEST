import API_BASE_URL from "../apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  TextField,
  Button,
  Container,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockResetIcon from "@mui/icons-material/LockReset";
import earistLogo from "../assets/earistLogo.jpg";
import { getAuthHeaders } from "../utils/auth";

const ResetPassword = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState({});
  const [errMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          (user.fullName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(user.employeeNumber || "").includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const authHeaders = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/search`, {
        method: "GET",
        headers: authHeaders.headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setErrorMessage(error.error || "Failed to fetch users");
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setFilteredUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setErrorMessage("Something went wrong while fetching users.");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (employeeNumber) => {
    setResetting((prev) => ({ ...prev, [employeeNumber]: true }));
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const authHeaders = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          ...authHeaders.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          `Password reset successfully for employee ${employeeNumber}. Email notification sent.`
        );
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.error || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset Password Error", err);
      setErrorMessage("Something went wrong while resetting password.");
    } finally {
      setResetting((prev) => ({ ...prev, [employeeNumber]: false }));
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "70vh",
        backgroundColor: "#fff8e1",
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          width: "100%",
          borderRadius: 2,
        }}
      >
        {/* Logo and header */}
        <Box
          sx={{
            backgroundColor: "#A31D1D",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            py: 2,
            display: "flex",
            justifyContent: "center",
            mb: 3,
            mx: -4,
            mt: -4,
          }}
        >
          <img
            src={earistLogo}
            alt="E.A.R.I.S.T Logo"
            style={{
              height: 80,
              borderRadius: "50%",
              backgroundColor: "white",
              padding: 4,
            }}
          />
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: "center" }}>
          <b>Reset Password</b>
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "#666" }}>
          Search for employees/users and reset their password. The password will be set to their surname (last name) and they will be notified via email.
        </Typography>

        {errMessage && (
          <Alert sx={{ mb: 2 }} severity="error" onClose={() => setErrorMessage("")}>
            {errMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert sx={{ mb: 2 }} severity="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        {/* Search and Refresh */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, or employee number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={fetchUsers}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{ minWidth: 120 }}
          >
            Refresh
          </Button>
        </Box>

        {/* Users Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? "No users found matching your search." : "No users found."}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#A31D1D" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Employee Number
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Full Name
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.employeeNumber} hover>
                    <TableCell>{user.employeeNumber}</TableCell>
                    <TableCell>{user.fullName || "N/A"}</TableCell>
                    <TableCell>{user.email || "N/A"}</TableCell>
                    <TableCell>{user.role || "N/A"}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleResetPassword(user.employeeNumber)}
                        disabled={resetting[user.employeeNumber] || !user.email}
                        startIcon={
                          resetting[user.employeeNumber] ? (
                            <CircularProgress size={16} />
                          ) : (
                            <LockResetIcon />
                          )
                        }
                        sx={{ bgcolor: "#A31D1D" }}
                      >
                        {resetting[user.employeeNumber] ? "Resetting..." : "Reset"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              color: "black",
              fontSize: "13px",
              textTransform: "none",
            }}
          >
            <b>Go Back</b>
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;

