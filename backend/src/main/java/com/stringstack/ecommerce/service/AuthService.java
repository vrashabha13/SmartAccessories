package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.AuthResponse;
import com.stringstack.ecommerce.dto.LoginRequest;
import com.stringstack.ecommerce.dto.MessageResponse;
import com.stringstack.ecommerce.dto.RegisterRequest;
import com.stringstack.ecommerce.entity.JwtToken;
import com.stringstack.ecommerce.entity.User;
import com.stringstack.ecommerce.exception.AuthenticationException;
import com.stringstack.ecommerce.exception.DuplicateResourceException;
import com.stringstack.ecommerce.repository.JwtTokenRepository;
import com.stringstack.ecommerce.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password";

    private final UserRepository userRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            JwtTokenRepository jwtTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password must match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email address is already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username is already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.CUSTOMER);

        userRepository.save(user);

        return new MessageResponse("Registration successful");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .filter(foundUser -> passwordEncoder.matches(request.getPassword(), foundUser.getPassword()))
                .orElseThrow(() -> new AuthenticationException(INVALID_CREDENTIALS));

        String token = jwtService.generateToken(user.getEmail());

        JwtToken jwtToken = new JwtToken();
        jwtToken.setUserId(user.getUserId().longValue());
        jwtToken.setToken(token);
        jwtToken.setExpiresAt(jwtService.getExpirationDate(token));
        jwtTokenRepository.save(jwtToken);

        AuthResponse.UserProfile userProfile =
                new AuthResponse.UserProfile(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name());

        return new AuthResponse(token, jwtToken.getExpiresAt(), "Login successful", userProfile);
    }

    @Transactional
    public MessageResponse logout(String token) {
        if (token == null || token.isBlank()) {
            throw new AuthenticationException("Authentication token is required");
        }

        if (!jwtTokenRepository.existsByToken(token)) {
            throw new AuthenticationException("Invalid or expired session");
        }

        jwtTokenRepository.deleteByToken(token);
        return new MessageResponse("Logout successful");
    }
}
