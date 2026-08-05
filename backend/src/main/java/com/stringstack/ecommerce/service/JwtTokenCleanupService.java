package com.stringstack.ecommerce.service;

import com.stringstack.ecommerce.repository.JwtTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class JwtTokenCleanupService {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtTokenCleanupService.class);

    private final JwtTokenRepository jwtTokenRepository;

    public JwtTokenCleanupService(JwtTokenRepository jwtTokenRepository) {
        this.jwtTokenRepository = jwtTokenRepository;
    }

    @Scheduled(fixedRateString = "${jwt.cleanup-rate-ms:60000}")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = jwtTokenRepository.deleteByExpiresAtBefore(now);
        if (deletedCount > 0) {
            LOGGER.info("Deleted {} expired JWT token(s) from the database", deletedCount);
        }
    }
}
