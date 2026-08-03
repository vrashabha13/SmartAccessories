package com.stringstack.ecommerce.dto;

import java.time.LocalDateTime;

public class AuthResponse {

    private final String token;
    private final LocalDateTime expiresAt;
    private final String message;
    private final UserProfile user;

    public AuthResponse(String token, LocalDateTime expiresAt, String message, UserProfile user) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.message = message;
        this.user = user;
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

    public UserProfile getUser() {
        return user;
    }

    public static class UserProfile {
        private final Integer userId;
        private final String username;
        private final String email;

        public UserProfile(Integer userId, String username, String email) {
            this.userId = userId;
            this.username = username;
            this.email = email;
        }

        public Integer getUserId() {
            return userId;
        }

        public String getUsername() {
            return username;
        }

        public String getEmail() {
            return email;
        }
    }
}
