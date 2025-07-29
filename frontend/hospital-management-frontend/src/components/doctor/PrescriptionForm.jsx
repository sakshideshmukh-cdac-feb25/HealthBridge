
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Add, ArrowBack, Remove } from "@mui/icons-material";
import DoctorLayout from "./DoctorLayout";

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "",fees: 0, },
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [fee, setFee] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/hospital/api/appointments/doctor-appointments",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        setAppointments(res.data || []);
      } catch (err) {
        setError("Failed to load appointments. Please log in again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/hospital/api/doctors/mydetails",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const { firstName, lastName } = res.data;
        setDoctorName(`${firstName} ${lastName}`);
      } catch (err) {
        setError("Could not retrieve doctor details.");
      } finally {
        setDoctorLoading(false);
      }
    };
    fetchDoctorDetails();
  }, []);

  useEffect(() => {
    if (selectedAppointmentId) {
      const apt = appointments.find((a) => a.id === parseInt(selectedAppointmentId));
      if (apt) {
        setPatientData({
          name: apt.patientName,
          email: apt.patientEmail,
          date: apt.date,
          time: apt.time,
          patientId: apt.patientId,
        });
      }
    }
  }, [selectedAppointmentId, appointments]);

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      const updated = [...medicines];
      updated.splice(index, 1);
      setMedicines(updated);
    }
  };

  const validateForm = () => {
    if (!selectedAppointmentId) return setError("Please select an appointment.");
    if (!fee || isNaN(fee) || parseFloat(fee) <= 0) return setError("Please enter a valid consultation fee.");
    if (!medicines.some((m) => m.name.trim() !== "")) return setError("Please enter at least one medicine.");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;
    if (doctorLoading) return setError("Doctor details are still loading.");

    setSubmitting(true);

    try {
     const prescriptionData = {
  patientName: patientData.name,
  patientEmail: patientData.email,
  patientId: patientData.patientId,
  doctorName: doctorName,
  doctorEmail: sessionStorage.getItem("email"),
  date: patientData.date,
  instructions: additionalInstructions,
  medicines: medicines
    .filter((m) => m.name.trim() !== "")
    .map((m) =>
      `${m.name} (${m.dosage || "-"}, ${m.frequency || "-"}, ${m.duration || "-"} days)`
    ),
  fees: parseFloat(fee),
  issued: false
};




      const res = await axios.post(
        "http://localhost:8080/hospital/api/prescriptions/issue",
        prescriptionData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
setTimeout(() => {
  navigate("/doctor/appointments");
}, 2000);

    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit prescription.";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || doctorLoading) {
    return (
      <DoctorLayout>
        <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Container>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">New Prescription</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Appointment
          </Typography>
          <FormControl fullWidth required>
            <InputLabel id="appointment-select-label">Select Appointment</InputLabel>
            <Select
              labelId="appointment-select-label"
              value={selectedAppointmentId}
              label="Select Appointment"
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
              disabled={submitting}
            >
              {appointments.map((apt) => (
                <MenuItem key={apt.id} value={apt.id}>
                  {`ID: ${apt.id} | ${apt.patientName} | ${apt.date}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {patientData && (
          <>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Appointment Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Chip label={`Name: ${patientData.name}`} variant="outlined" fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip label={`Date: ${patientData.date}`} variant="outlined" fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip label={`Time: ${patientData.time}`} variant="outlined" fullWidth />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Prescription Details
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  required
                  label="Consultation Fee (₹)"
                  fullWidth
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  sx={{ mb: 3 }}
                  disabled={submitting}
                  type="number"
                />

                {medicines.map((med, index) => (
                  <Box key={index} sx={{ mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          required
                          label="Medicine Name"
                          fullWidth
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                          disabled={submitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Dosage"
                          fullWidth
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                          disabled={submitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Frequency"
                          fullWidth
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                          disabled={submitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Duration"
                          fullWidth
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                          disabled={submitting}
                        />
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton
                          onClick={() => removeMedicine(index)}
                          color="error"
                          disabled={medicines.length <= 1 || submitting}
                        >
                          <Remove />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                <Button
                  startIcon={<Add />}
                  onClick={addMedicine}
                  variant="outlined"
                  sx={{ mb: 3 }}
                  disabled={submitting}
                >
                  Add Another Medicine
                </Button>

                <TextField
                  label="Additional Instructions"
                  fullWidth
                  multiline
                  rows={3}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  sx={{ mb: 3 }}
                  disabled={submitting}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ px: 4 }}
                    disabled={
                      submitting || !medicines.some((m) => m.name.trim() !== "")
                    }
                  >
                    {submitting ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Submitting...
                      </>
                    ) : (
                      "Submit Prescription"
                    )}
                  </Button>
                </Box>
              </form>
            </Paper>
          </>
        )}

        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Prescription submitted successfully!
          </Alert>
        </Snackbar>
      </Container>
    </DoctorLayout>
  );
};

export default PrescriptionForm;
