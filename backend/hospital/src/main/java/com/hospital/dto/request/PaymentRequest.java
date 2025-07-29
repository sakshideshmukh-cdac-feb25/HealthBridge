package com.hospital.dto.request;

public class PaymentRequest {
    private Long prescriptionId;
    private int fees;

    public Long getPrescriptionId() {
        return prescriptionId;
    }

    public void setPrescriptionId(Long prescriptionId) {
        this.prescriptionId = prescriptionId;
    }

    public int getFees() {
        return fees;
    }

    public void setFees(int fees) {
        this.fees = fees;
    }
    

    public int getAmount() {
        return fees; // Return actual amount from 'fees'
    }
}
