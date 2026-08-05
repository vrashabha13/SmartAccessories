package com.stringstack.ecommerce.security;

import com.stringstack.ecommerce.entity.User;
import com.stringstack.ecommerce.repository.JwtTokenRepository;
import com.stringstack.ecommerce.repository.UserRepository;
import com.stringstack.ecommerce.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final JwtTokenRepository jwtTokenRepository;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, JwtTokenRepository jwtTokenRepository, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.jwtTokenRepository = jwtTokenRepository;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            boolean tokenValid = jwtService.isTokenValid(token);
            boolean tokenExists = jwtTokenRepository.existsByToken(token);

            if (!tokenValid && tokenExists) {
                jwtTokenRepository.deleteByToken(token);
            }

            if (tokenValid && tokenExists) {
                String email = jwtService.extractEmail(token);
                User user = userRepository.findByEmail(email).orElse(null);
                List<SimpleGrantedAuthority> authorities = Collections.emptyList();
                if (user != null) {
                    authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
                }
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
