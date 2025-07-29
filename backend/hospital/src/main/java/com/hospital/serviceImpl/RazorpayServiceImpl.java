package com.hospital.serviceImpl;

import com.hospital.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class RazorpayServiceImpl implements RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key}")
    private String key;

    @Value("${razorpay.secret}")
    private String secret;

    public RazorpayServiceImpl(
            @Value("${razorpay.key}") String key,
            @Value("${razorpay.secret}") String secret) throws RazorpayException {
        this.razorpayClient = new RazorpayClient(key, secret);
        this.secret = secret;
    }

    @Override
    public Map<String, Object> createOrder(int amountInPaise) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("payment_capture", true);

        Order order = razorpayClient.orders.create(options);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("key", key); // Only public key sent to frontend

        return response;
    }

    @Override
    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String data = razorpayOrderId + '|' + razorpayPaymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes());
            String generatedSignature = Base64.getEncoder().encodeToString(hash);

            return generatedSignature.equals(razorpaySignature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, Long prescriptionId) {
        return verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    }
}
