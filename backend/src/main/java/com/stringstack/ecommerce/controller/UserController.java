package com.stringstack.ecommerce.controller;

import com.stringstack.ecommerce.dto.AuthResponse;
import com.stringstack.ecommerce.entity.User;
import com.stringstack.ecommerce.repository.UserRepository;
import com.stringstack.ecommerce.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse.UserProfile> getProfile(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(new AuthResponse.UserProfile(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name()));
        }
        throw new RuntimeException("Unauthorized");
    }
}
