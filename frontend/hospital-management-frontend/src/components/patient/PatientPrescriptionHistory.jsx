import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

const PatientPrescriptionHistory = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/hospital/api/prescriptions/my-prescriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Failed to fetch prescriptions", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (prescriptionId, amount) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/hospital/api/prescriptions/payments/create`,
        {
          prescriptionId,
          amount,
          currency: "INR",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { orderId, amount: razorAmount, currency, key } = response.data;

      const options = {
        key,
        amount: razorAmount,
        currency,
        order_id: orderId,
        handler: async function (response) {
          try {
            await axios.post(
              "http://localhost:8080/hospital/api/prescriptions/payments/verify",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            fetchPrescriptions(); // refresh list
          } catch (error) {
            console.error("Payment verification failed", error);
          }
        },
        prefill: {
          name: "Patient",
          email: "patient@example.com",
        },
        theme: {
          color: "#1976d2",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed", error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  const issuedPrescriptions = prescriptions.filter((p) => p.issued);

  return (
    <StyledContainer>
      <Typography variant="h4" gutterBottom>
        📝 My Prescriptions
      </Typography>

      {issuedPrescriptions.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            📋 No issued prescriptions yet. Please wait for your doctor to issue one.
          </Typography>
        </Box>
      ) : (
        issuedPrescriptions.map((p, index) => (
          <Fade in timeout={500 + index * 100} key={p.id}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6">Doctor: {p.doctorName}</Typography>
                <Typography variant="body1">
                  Patient: {p.patientName} ({p.patientEmail})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {p.date}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">Medicines:</Typography>
                <ul>
                  {p.medicines.map((med, i) => (
                    <li key={i}>
                      <Typography variant="body2">{med}</Typography>
                    </li>
                  ))}
                </ul>

                {p.instructions && (
                  <>
                    <Typography variant="subtitle1">Instructions:</Typography>
                    <Typography variant="body2">{p.instructions}</Typography>
                  </>
                )}

                <Stack direction="row" spacing={2} mt={2}>
                  <Chip
                    label={
                      p.issued
                        ? p.paid
                          ? "💰 Paid"
                          : "✅ Issued"
                        : "⏳ Not Issued"
                    }
                    color={
                      p.issued ? (p.paid ? "success" : "info") : "warning"
                    }
                  />

                  {p.issued && !p.paid && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handlePayment(p.id, 500)}
                    >
                      Pay & View
                    </Button>
                  )}

                  {p.issued && p.paid && (
                    <Button variant="outlined" color="success">
                      View
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </StyledCard>
          </Fade>
        ))
      )}
    </StyledContainer>
  );
};

export default PatientPrescriptionHistory;
