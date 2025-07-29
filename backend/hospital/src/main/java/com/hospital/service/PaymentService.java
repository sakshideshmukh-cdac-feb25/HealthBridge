package com.hospital.service;

import com.hospital.dto.request.PaymentRequest;
import com.hospital.dto.request.PaymentVerifyRequest;
import com.hospital.dto.response.PaymentVerifyResponse;
import com.hospital.dto.response.RazorpayOrderResponse;

public interface PaymentService {
    RazorpayOrderResponse createOrder(PaymentRequest request);
    PaymentVerifyResponse verifyPayment(PaymentVerifyRequest request);
}
