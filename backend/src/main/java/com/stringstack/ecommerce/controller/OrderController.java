package com.stringstack.ecommerce.controller;

import com.stringstack.ecommerce.dto.OrdersResponse;
import com.stringstack.ecommerce.service.OrderService;
import com.stringstack.ecommerce.service.JwtService;
import com.stringstack.ecommerce.exception.AuthenticationException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    private final OrderService orderService;
    private final JwtService jwtService;

    public OrderController(OrderService orderService, JwtService jwtService) {
        this.orderService = orderService;
        this.jwtService = jwtService;
    }

    @GetMapping({"/orders", "/api/orders"})
    public ResponseEntity<OrdersResponse> getOrders(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(orderService.getOrderHistory(userId));
    }

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName()) || "authToken".equals(cookie.getName()) || "jwt".equals(cookie.getName()) || "jwt_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && jwtService.isTokenValid(token)) {
            String email = jwtService.extractEmail(token);
            Integer userId = jwtService.getUserIdByEmail(email);
            if (userId != null) {
                return userId;
            }
        }
        throw new AuthenticationException("Unauthorized");
    }
}
