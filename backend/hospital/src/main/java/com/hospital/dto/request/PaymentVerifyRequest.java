package com.hospital.dto.request;

import lombok.Data;

@Data
public class PaymentVerifyRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private Long prescriptionId;
}
