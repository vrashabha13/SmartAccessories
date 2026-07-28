package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.dto.AuthResponse;
import com.stringstack.ecommerce.dto.LoginRequest;
import com.stringstack.ecommerce.dto.MessageResponse;
import com.stringstack.ecommerce.dto.RegisterRequest;
import com.stringstack.ecommerce.entity.Session;
import com.stringstack.ecommerce.entity.User;
import com.stringstack.ecommerce.exception.AuthenticationException;
import com.stringstack.ecommerce.exception.DuplicateResourceException;
import com.stringstack.ecommerce.repository.SessionRepository;
import com.stringstack.ecommerce.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password";

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            SessionRepository sessionRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
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

        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new DuplicateResourceException("Mobile number is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return new MessageResponse("Registration successful");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .filter(foundUser -> passwordEncoder.matches(request.getPassword(), foundUser.getPassword()))
                .orElseThrow(() -> new AuthenticationException(INVALID_CREDENTIALS));

        String token = jwtService.generateToken(user.getEmail());

        Session session = new Session();
        session.setUser(user);
        session.setJwtToken(token);
        session.setExpiryTime(jwtService.getExpirationDate(token));
        sessionRepository.save(session);

        return new AuthResponse(token, session.getExpiryTime(), "Login successful");
    }

    @Transactional
    public MessageResponse logout(String token) {
        if (token == null || token.isBlank()) {
            throw new AuthenticationException("Authentication token is required");
        }

        if (!sessionRepository.existsByJwtToken(token)) {
            throw new AuthenticationException("Invalid or expired session");
        }

        sessionRepository.deleteByJwtToken(token);
        return new MessageResponse("Logout successful");
    }
}
