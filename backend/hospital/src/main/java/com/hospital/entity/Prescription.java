package com.hospital.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import jakarta.persistence.JoinColumn;


@Entity
@Table(name = "prescription")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean paid = false;

    private String patientName;
    private String doctorName;
    private LocalDate date;
    private boolean issued;
    private String instructions;
    private String patientEmail;
   

    // ... other fields like patient, doctor, fee, etc.

    public String getOrderId() {
		return orderId;
	}
	public void setOrderId(String orderId) {
		this.orderId = orderId;
	}
	@Column(name = "order_id")
    private String orderId;
    @Column(nullable = false)
    private int fees; // ✅ Add this field to match DB column
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "prescription_medicines",
        joinColumns = @JoinColumn(name = "prescription_id") // ✅ This must be jakarta.persistence.JoinColumn
    )
    @Column(name = "medicine")
    private List<String> medicines;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public boolean isPaid() {
        return paid;
    }
    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public String getPatientName() {
        return patientName;
    }
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDoctorName() {
        return doctorName;
    }
    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isIssued() {
        return issued;
    }
    public void setIssued(boolean issued) {
        this.issued = issued;
    }

    public String getInstructions() {
        return instructions;
    }
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getPatientEmail() {
        return patientEmail;
    }
    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public List<String> getMedicines() {
        return medicines;
    }
    public void setMedicines(List<String> medicines) {
        this.medicines = medicines;
    }

    public int getFees() {
        return fees;
    }
    public void setFees(int fees) {
        this.fees = fees;
    }
}
