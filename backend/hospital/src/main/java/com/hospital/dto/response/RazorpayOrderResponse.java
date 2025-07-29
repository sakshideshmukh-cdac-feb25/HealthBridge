package com.hospital.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private int amount; // in paise
	public void setCurrency(Object object) {
		// TODO Auto-generated method stub
		
	}
}
