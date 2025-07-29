package com.hospital.service;

import java.util.Map;

import com.razorpay.RazorpayException;

public interface RazorpayService {
    boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, Long prescriptionId) throws RazorpayException;

	Map<String, Object> createOrder(int amountInPaise) throws RazorpayException;

	boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature);
}
