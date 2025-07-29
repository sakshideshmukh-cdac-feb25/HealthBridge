// Refactored PaymentServiceImpl using RazorpayService for signature verification

package com.hospital.serviceImpl;

import com.hospital.config.RazorpayConfig;
import com.hospital.dto.request.PaymentRequest;
import com.hospital.dto.request.PaymentVerifyRequest;
import com.hospital.dto.response.PaymentVerifyResponse;
import com.hospital.dto.response.RazorpayOrderResponse;
import com.hospital.entity.Prescription;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.service.PaymentService;
import com.hospital.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private RazorpayConfig razorpayConfig;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private RazorpayService razorpayService;

    @Override
    public RazorpayOrderResponse createOrder(PaymentRequest request) {
        if (request.getPrescriptionId() == null || request.getFees() <= 0) {
            throw new IllegalArgumentException("Invalid payment request");
        }

        try {
            RazorpayClient client = new RazorpayClient(
                    razorpayConfig.getKey(),
                    razorpayConfig.getSecret()
            );

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getFees() * 100); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("payment_capture", true);

            Order order = client.orders.create(orderRequest);

            return new RazorpayOrderResponse(
                    order.get("id"),
                    order.get("amount")
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order", e);
        }
    }

    @Override
    public PaymentVerifyResponse verifyPayment(PaymentVerifyRequest request) {
        try {
            boolean success = razorpayService.verifyPayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature(),
                    request.getPrescriptionId()
            );

            return new PaymentVerifyResponse(success,
                    success ? "Payment verified" : "Payment verification failed");

        } catch (Exception e) {
            throw new RuntimeException("Payment verification error", e);
        }
    }
}
