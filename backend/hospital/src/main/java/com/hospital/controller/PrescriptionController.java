package com.hospital.controller;

import com.hospital.dto.request.PaymentRequest;
import com.hospital.dto.request.PrescriptionRequest;
import com.hospital.dto.response.PrescriptionResponse;
import com.hospital.dto.response.RazorpayOrderResponse;
import com.hospital.service.PaymentService;
import com.hospital.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/issue")
    public ResponseEntity<PrescriptionResponse> issuePrescription(@Valid @RequestBody PrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.issuePrescription(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-prescriptions")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<?> getPrescriptionsForLoggedInPatient() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        List<PrescriptionResponse> prescriptions = prescriptionService.getPrescriptionsByPatient(email);
        return ResponseEntity.ok(prescriptions);
    }

    @PostMapping("/pay")
    public ResponseEntity<RazorpayOrderResponse> createPaymentOrder(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }
}
