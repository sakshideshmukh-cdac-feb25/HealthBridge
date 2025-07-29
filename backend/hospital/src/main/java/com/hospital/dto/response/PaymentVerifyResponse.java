package com.hospital.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentVerifyResponse {
    public PaymentVerifyResponse(String string, boolean b) {
		// TODO Auto-generated constructor stub
	}
	private boolean success;
    private String message;
}
