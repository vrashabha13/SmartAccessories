package com.stringstack.ecommerce.dto;

import java.time.LocalDateTime;

public class AuthResponse {

    private final String token;
    private final LocalDateTime expiresAt;
    private final String message;

    public AuthResponse(String token, LocalDateTime expiresAt, String message) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public String getMessage() {
        return message;
    }
}
