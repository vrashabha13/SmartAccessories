package com.stringstack.ecommerce.controller;

import com.stringstack.ecommerce.dto.CreateOrderResponse;
import com.stringstack.ecommerce.dto.PaymentVerifyRequest;
import com.stringstack.ecommerce.dto.PaymentVerifyResponse;
import com.stringstack.ecommerce.service.JwtService;
import com.stringstack.ecommerce.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtService jwtService;

    public PaymentController(PaymentService paymentService, JwtService jwtService) {
        this.paymentService = paymentService;
        this.jwtService = jwtService;
    }

    @PostMapping("/orders/create")
    public ResponseEntity<CreateOrderResponse> createOrder(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(paymentService.createOrder(userId));
    }

    @PostMapping("/payments/verify")
    public ResponseEntity<PaymentVerifyResponse> verifyPayment(
            HttpServletRequest request,
            @RequestBody PaymentVerifyRequest paymentRequest) {
        Integer userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(paymentService.verifyPayment(userId, paymentRequest));
    }

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            return jwtService.getUserIdByEmail(email);
        }
        throw new RuntimeException("Unauthorized");
    }
}
