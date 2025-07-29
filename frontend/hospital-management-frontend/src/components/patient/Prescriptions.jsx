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

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication failed. Please log in again.");
          setLoading(false);
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userEmail = payload.sub?.toLowerCase();

        const response = await axios.get(
          "http://localhost:8080/hospital/api/prescriptions/my-prescriptions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const filtered = response.data.filter(
          (p) => p.patientEmail?.toLowerCase() === userEmail
        );

        setPrescriptions(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error loading prescriptions:", err.message);
        setError("Could not load prescriptions.");
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const handlePayment = async (prescription) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:8080/hospital/api/prescriptions/pay",
        {
          prescriptionId: prescription.id,
          fees: prescription.fees || 500,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { id: orderId, amount, currency } = response.data;

      const options = {
        key: "rzp_test_kpT41SOim1ftXZ",
        amount,
        currency,
        name: "HealthBridge",
        description: "Consultation Fees",
        order_id: orderId,
        handler: async function (response) {
          await axios.post(
            "http://localhost:8080/hospital/api/payments/verify",
            {
              razorpayOrderId: orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          alert("Payment successful!");
          window.location.reload(); // <- RELOAD PAGE to update issued status
        },
        theme: {
          color: "#1976d2",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed to start.");
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth="900px" mx="auto">
      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
        My Prescriptions
      </Typography>
      {prescriptions.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📋 No prescriptions found
          </Typography>
          <Typography color="text.secondary">
            Your issued prescriptions will appear here.
          </Typography>
        </Box>
      ) : (
        <Fade in timeout={600}>
          <Stack spacing={3}>
            {prescriptions.map((p, index) => (
              <Card key={index} elevation={3}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Box flex={1} minWidth="250px">
                      <Typography variant="h6" color="primary">
                        {p.doctorName}
                      </Typography>
                      <Typography color="text.secondary">Patient: {p.patientName}</Typography>
                      <Typography color="text.secondary">Email: {p.patientEmail}</Typography>
                      <Typography color="text.secondary">
                        Date: {new Date(p.date).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={p.issued ? "✅ Issued" : "⏳ Pending"}
                        color={p.issued ? "success" : "warning"}
                        size="small"
                      />
                    </Box>
                    {p.issued ? (
                      <Button variant="outlined" onClick={() => setSelectedPrescription(p)}>
                        View
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={() => handlePayment(p)}>
                        Pay & View
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Fade>
      )}
    </Box>
  );
};

export default Prescriptions;
