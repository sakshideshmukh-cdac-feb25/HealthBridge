package com.hospital.controller;

import com.hospital.dto.request.PaymentVerifyRequest;
import com.hospital.dto.response.PaymentVerifyResponse;
import com.hospital.dto.request.PaymentRequest;
import com.hospital.service.PaymentService;
import com.hospital.service.RazorpayService;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayService razorpayService; // FIXED: Use interface for DI

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerifyResponse> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @PostMapping("/create-order") // Fixed path
    @PreAuthorize("hasRole('ROLE_PATIENT')")
    public ResponseEntity<?> createPaymentOrder(@RequestBody PaymentRequest paymentRequest) {
        try {
            int amountInPaise = paymentRequest.getAmount() * 100;
            Map<String, Object> orderDetails = razorpayService.createOrder(amountInPaise); // Use autowired service
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Razorpay order", "details", e.getMessage()));
        }
    }
}
